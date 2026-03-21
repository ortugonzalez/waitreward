const { ethers } = require("hardhat");
const deployed   = require("../deployed.json");

async function main() {
  const [deployer] = await ethers.getSigners();
  const contract   = await ethers.getContractAt("WaitReward", deployed.contractAddress);

  console.log("Wallet  :", deployer.address);
  console.log("Contrato:", deployed.contractAddress);
  console.log("Red     : Avalanche Fuji\n");

  const MONTHLY_FEE  = ethers.parseEther("0.01");
  const DEPOSIT      = ethers.parseEther("0.05");

  // ── 1. Registrar comercio ────────────────────────────────────────────────
  console.log("Registrando 'Farmacia Del Pueblo'...");
  const tx1 = await contract.registerCommerce("Farmacia Del Pueblo", {
    value: MONTHLY_FEE,
  });
  const r1 = await tx1.wait();
  console.log("✅ Comercio registrado");
  console.log("   TxHash  :", r1.hash);
  console.log("   Snowtrace:", `https://testnet.snowtrace.io/tx/${r1.hash}\n`);

  // ── 2. Depositar fondos para canjes ──────────────────────────────────────
  console.log("Depositando 0.05 AVAX para canjes...");
  const tx2 = await contract.depositForRedemptions({ value: DEPOSIT });
  const r2 = await tx2.wait();
  console.log("✅ Depósito realizado");
  console.log("   TxHash  :", r2.hash);
  console.log("   Snowtrace:", `https://testnet.snowtrace.io/tx/${r2.hash}\n`);

  // ── 3. Verificar estado final ─────────────────────────────────────────────
  const [name, active, depositETH, expiry] = await contract.getCommerce(deployer.address);
  console.log("─── Estado del comercio ────────────────────────────");
  console.log("  Nombre   :", name);
  console.log("  Activo   :", active);
  console.log("  Depósito :", ethers.formatEther(depositETH), "AVAX");
  console.log("  Vence    :", new Date(Number(expiry) * 1000).toLocaleDateString("es-AR"));
  console.log("  Explorer :", `https://testnet.snowtrace.io/address/${deployer.address}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
