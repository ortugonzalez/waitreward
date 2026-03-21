const { Router } = require("express");
const { ethers }  = require("ethers");
const { contractRead } = require("../lib/contract");

const router = Router();

/**
 * GET /api/commerce/:address
 * Devuelve el estado de un comercio registrado.
 */
router.get("/:address", async (req, res, next) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: `Dirección de comercio inválida: ${address}`,
      });
    }

    const [name, active, depositETH, subscriptionExpiry] =
      await contractRead.getCommerce(address);

    if (!active && name === "") {
      return res.status(404).json({
        success: false,
        error: "Comercio no encontrado",
        address,
      });
    }

    const now     = Math.floor(Date.now() / 1000);
    const expiry  = Number(subscriptionExpiry);
    const isExpired = expiry > 0 && expiry < now;

    // depositedFunds en ETH (float) y su equivalente en USD (aprox 1 AVAX ≈ $35 demo)
    const depositAvax = parseFloat(ethers.formatEther(depositETH));

    return res.json({
      success: true,
      address,
      name,
      active: active && !isExpired,
      depositedFunds: depositAvax,
      depositedFundsRaw: depositETH.toString(),
      subscriptionExpiry: expiry,
      subscriptionExpiryISO: expiry > 0 ? new Date(expiry * 1000).toISOString() : null,
      subscriptionActive: active && !isExpired,
      monthlyExpiry: expiry,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
