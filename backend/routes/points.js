const { Router } = require("express");
const { ethers }  = require("ethers");
const { contractRead } = require("../lib/contract");

const router = Router();

/**
 * GET /api/points/:wallet
 * Devuelve el balance de WRT y su equivalente en USD.
 * 100 WRT = $1
 */
router.get("/:wallet", async (req, res, next) => {
  try {
    const { wallet } = req.params;

    if (!ethers.isAddress(wallet)) {
      return res.status(400).json({
        success: false,
        error: `Dirección de wallet inválida: ${wallet}`,
      });
    }

    const raw    = await contractRead.balanceOf(wallet);          // en wei (1e18)
    const points = Number(ethers.formatEther(raw));               // WRT enteros
    const pointsInUSD = (points / 100).toFixed(2);               // 100 WRT = $1

    return res.json({
      success: true,
      wallet,
      points,
      pointsRaw: raw.toString(),
      pointsInUSD: parseFloat(pointsInUSD),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
