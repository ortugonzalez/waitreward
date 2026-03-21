const { Router } = require("express");
const { ethers }  = require("ethers");
const { contractRead } = require("../lib/contract");
const { getLevel, getNextLevel, getProgressToNextLevel } = require("../lib/levels");

const router = Router();

/**
 * GET /api/points/:wallet
 * Returns WRT balance + level info.
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

    const raw    = await contractRead.balanceOf(wallet);
    const points = Number(ethers.formatEther(raw));
    const pointsInUSD = (points / 100).toFixed(2);

    const level     = getLevel(points);
    const nextLevel = getNextLevel(points);
    const progress  = getProgressToNextLevel(points);

    return res.json({
      success: true,
      wallet,
      points,
      pointsRaw: raw.toString(),
      pointsInUSD: parseFloat(pointsInUSD),
      // legacy field kept for frontend compatibility
      balance: points,
      formatted: points.toString(),
      dollarValue: pointsInUSD,
      level: {
        name:  level.name,
        emoji: level.emoji,
        color: level.color,
        perks: level.perks,
      },
      nextLevel: nextLevel
        ? {
            name:           nextLevel.name,
            emoji:          nextLevel.emoji,
            pointsNeeded:   nextLevel.minPoints - points,
            progressPercent: progress,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
