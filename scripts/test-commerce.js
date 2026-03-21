const { ethers } = require("hardhat");
const deployed   = require("../deployed.json");

async function main() {
  const signers  = await ethers.getSigners();
  const commerce = signers[2]; // cuenta 2: 0x3C44...93BC

  const contract = await ethers.getContractAt("WaitReward", deployed.contractAddress);

  const MONTHLY_FEE = ethers.parseEther("0.01");

  console.log("Registrando comercio...");
  console.log("  Wallet  :", commerce.address);
  console.log("  Contrato:", deployed.contractAddress);

  const tx = await contract.connect(commerce).registerCommerce(
    "Farmacia Del Pueblo",
    { value: MONTHLY_FEE }
  );
  const receipt = await tx.wait();

  const [name, active, depositETH, expiry] = await contract.getCommerce(commerce.address);

  console.log("\n✅ Comercio registrado");
  console.log("  Nombre   :", name);
  console.log("  Activo   :", active);
  console.log("  Depósito :", ethers.formatEther(depositETH), "ETH");
  console.log("  Vence    :", new Date(Number(expiry) * 1000).toLocaleString());
  console.log("  TxHash   :", receipt.hash);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
