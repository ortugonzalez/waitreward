const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "AVAX");

  // ── Deploy ──────────────────────────────────────────────────────────────────
  const Factory = await ethers.getContractFactory("WaitReward");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n✅ WaitReward deployed to:", address);

  // ── Authorize clinic ────────────────────────────────────────────────────────
  const clinicAddress = process.env.CLINIC_ADDRESS || deployer.address;
  const tx = await contract.authorizeClinic(clinicAddress);
  await tx.wait();
  console.log("✅ Clinic authorized:", clinicAddress);

  // ── Save deployed.json ──────────────────────────────────────────────────────
  const deployed = {
    network: "avalancheFuji",
    chainId: 43113,
    contractAddress: address,
    clinicAddress,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };
  const deployedPath = path.join(__dirname, "..", "deployed.json");
  fs.writeFileSync(deployedPath, JSON.stringify(deployed, null, 2));
  console.log("✅ Saved deployed.json");

  // ── Export ABI ──────────────────────────────────────────────────────────────
  const artifactPath = path.join(
    __dirname, "..", "artifacts", "contracts", "WaitReward.sol", "WaitReward.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abiContent = JSON.stringify(artifact.abi, null, 2);

  const abiTargets = [
    path.join(__dirname, "..", "frontend", "src", "abi"),
    path.join(__dirname, "..", "backend", "abi"),
  ];

  for (const dir of abiTargets) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "WaitReward.json"), abiContent);
    console.log("✅ ABI exported to:", path.join(dir, "WaitReward.json"));
  }

  console.log("\n─── Summary ───────────────────────────────────────────────────");
  console.log("Contract :", address);
  console.log("Clinic   :", clinicAddress);
  console.log("Explorer : https://testnet.snowtrace.io/address/" + address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
