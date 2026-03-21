const { Router } = require("express");
const { ethers }  = require("ethers");
const { contractPatient, contractRead } = require("../lib/contract");

const router = Router();

/**
 * POST /api/redeem
 * body: { patientWallet, commerceAddress, points }
 *
 * Demo: firma con PATIENT_PRIVATE_KEY del .env
 * Producción: el frontend envía la tx firmado desde MetaMask
 *
 * points → número de WRT a canjear (enteros, ej. 100 = 100 WRT)
 */
router.post("/", async (req, res, next) => {
  try {
    const { patientWallet, commerceAddress, points } = req.body;

    // ── Validaciones ───────────────────────────────────────────────────────
    if (!patientWallet || !commerceAddress || points == null) {
      return res.status(400).json({
        success: false,
        error: "Faltan campos obligatorios: patientWallet, commerceAddress, points",
      });
    }

    if (!ethers.isAddress(patientWallet)) {
      return res.status(400).json({ success: false, error: `Wallet del paciente inválida: ${patientWallet}` });
    }

    if (!ethers.isAddress(commerceAddress)) {
      return res.status(400).json({ success: false, error: `Dirección de comercio inválida: ${commerceAddress}` });
    }

    const pointsNum = Number(points);
    if (!Number.isFinite(pointsNum) || pointsNum <= 0) {
      return res.status(400).json({ success: false, error: "points debe ser un número positivo" });
    }

    const pointsWei = ethers.parseEther(String(pointsNum));

    // ── Verificar balance del paciente ─────────────────────────────────────
    const balance = await contractRead.balanceOf(patientWallet);
    if (balance < pointsWei) {
      return res.status(400).json({
        success: false,
        error: "Saldo insuficiente de WRT",
        balance: ethers.formatEther(balance),
        requested: String(pointsNum),
      });
    }

    // ── Verificar comercio activo ──────────────────────────────────────────
    const [, active, depositETH, subscriptionExpiry] = await contractRead.getCommerce(commerceAddress);
    if (!active) {
      return res.status(400).json({ success: false, error: "El comercio no está registrado o no está activo" });
    }
    if (Number(subscriptionExpiry) < Math.floor(Date.now() / 1000)) {
      return res.status(400).json({ success: false, error: "La suscripción del comercio está vencida" });
    }

    // ethValue = points * 0.01 ETH / 100 WRT
    const ethValue = (pointsWei * ethers.parseEther("0.01")) / (100n * 10n ** 18n);
    if (depositETH < ethValue) {
      return res.status(400).json({
        success: false,
        error: "El comercio no tiene suficiente depósito para este canje",
        depositAvailable: ethers.formatEther(depositETH),
        required: ethers.formatEther(ethValue),
      });
    }

    // ── Verificar que tenemos wallet del paciente configurada ──────────────
    if (!contractPatient) {
      return res.status(503).json({
        success: false,
        error: "PATIENT_PRIVATE_KEY no configurada. En producción el paciente firma desde su wallet.",
      });
    }

    // ── Enviar transacción ─────────────────────────────────────────────────
    const tx = await contractPatient.redeemPoints(commerceAddress, pointsWei);
    const receipt = await tx.wait();

    // ── Calcular valores de respuesta ──────────────────────────────────────
    const FEE_BPS    = 300n;
    const gross      = ethValue;
    const fee        = (gross * FEE_BPS) / 10_000n;
    const netETH     = gross - fee;
    const valueUSD   = (pointsNum / 100).toFixed(2);

    return res.json({
      success: true,
      txHash: receipt.hash,
      patientWallet,
      commerceAddress,
      pointsSpent: pointsNum,
      valueUSD: parseFloat(valueUSD),
      ethReleased: ethers.formatEther(netETH),
      feeTaken: ethers.formatEther(fee),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
