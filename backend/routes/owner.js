const { Router } = require("express");
const { ethers } = require("ethers");
const { provider, contractOwner, contractRead, contractAddress } = require("../lib/contract");

const router = Router();

// ── Auth middleware ────────────────────────────────────────────────────────────
function requireOwnerSecret(req, res, next) {
  const secret = process.env.OWNER_SECRET;
  if (!secret) {
    return res.status(503).json({ success: false, error: "OWNER_SECRET no configurado en el servidor." });
  }
  const auth = req.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== secret) {
    return res.status(401).json({ success: false, error: "No autorizado." });
  }
  next();
}

// ── GET /api/owner/fees ───────────────────────────────────────────────────────
// Devuelve el balance ETH del contrato (fees acumuladas) en AVAX y USD aprox.
router.get("/fees", async (req, res, next) => {
  try {
    // Balance total del contrato en wei
    const balanceWei = await provider.getBalance(contractAddress);
    const balanceAvax = parseFloat(ethers.formatEther(balanceWei));

    // Precio AVAX en USD (CoinGecko, falla silenciosamente)
    let avaxUsd = null;
    try {
      const resp = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd",
        { signal: AbortSignal.timeout(4000) }
      );
      const data = await resp.json();
      avaxUsd = data?.["avalanche-2"]?.usd ?? null;
    } catch {
      // precio no disponible — no es crítico
    }

    const balanceUsd = avaxUsd !== null ? (balanceAvax * avaxUsd).toFixed(2) : null;

    return res.json({
      success: true,
      contractAddress,
      balanceWei: balanceWei.toString(),
      balanceAvax: balanceAvax.toFixed(6),
      avaxUsd: avaxUsd ?? "N/A",
      balanceUsd: balanceUsd ?? "N/A",
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/owner/withdraw ──────────────────────────────────────────────────
// Llama a withdrawFees() en el contrato. Requiere Authorization: Bearer <OWNER_SECRET>
// y que OWNER_PRIVATE_KEY esté configurada en el servidor.
router.post("/withdraw", requireOwnerSecret, async (req, res, next) => {
  try {
    if (!contractOwner) {
      return res.status(503).json({
        success: false,
        error: "OWNER_PRIVATE_KEY no configurada. El servidor no puede firmar la transacción.",
      });
    }

    // Balance antes
    const balanceBefore = await provider.getBalance(contractAddress);
    if (balanceBefore === 0n) {
      return res.status(400).json({ success: false, error: "No hay fondos para retirar." });
    }

    const tx = await contractOwner.withdrawFees();
    const receipt = await tx.wait();

    return res.json({
      success: true,
      txHash: receipt.hash,
      withdrawnWei: balanceBefore.toString(),
      withdrawnAvax: parseFloat(ethers.formatEther(balanceBefore)).toFixed(6),
      gasUsed: receipt.gasUsed.toString(),
      snowtrace: `https://testnet.snowtrace.io/tx/${receipt.hash}`,
    });
  } catch (err) {
    // Manejo de errores on-chain
    const msg = err?.reason || err?.message || "Error desconocido";
    if (msg.includes("Nothing to withdraw")) {
      return res.status(400).json({ success: false, error: "No hay fondos para retirar." });
    }
    next(err);
  }
});

module.exports = router;
