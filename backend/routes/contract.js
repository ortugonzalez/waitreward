const { Router } = require("express");
const { contractRead, provider, contractAddress } = require("../lib/contract");

const router = Router();

const SNOWTRACE = `https://testnet.snowtrace.io/address/${process.env.CONTRACT_ADDRESS || contractAddress}`;

/**
 * GET /api/contract/verify
 * Verifies the WaitReward contract is live on Avalanche Fuji.
 */
router.get("/verify", async (_req, res) => {
  try {
    const [name, symbol, totalSupply, blockNumber, network] = await Promise.all([
      contractRead.name(),
      contractRead.symbol(),
      contractRead.totalSupply(),
      provider.getBlockNumber(),
      provider.getNetwork(),
    ]);

    return res.json({
      success: true,
      contract: {
        address: contractAddress,
        name,
        symbol,
        totalSupply: totalSupply.toString(),
        totalSupplyFormatted: (Number(totalSupply) / 1e18).toLocaleString("es-AR"),
        network: "Avalanche Fuji",
        chainId: Number(network.chainId),
        blockNumber,
        snowtrace: SNOWTRACE,
      },
    });
  } catch (err) {
    console.error("[contract/verify]", err.message);
    return res.status(502).json({
      success: false,
      error: "No se puede conectar a Avalanche Fuji",
      detail: err.message,
    });
  }
});

module.exports = router;
