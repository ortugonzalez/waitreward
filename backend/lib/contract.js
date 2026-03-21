const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

// ── Validación de variables de entorno ────────────────────────────────────────
const required = ["RPC_URL", "CONTRACT_ADDRESS", "CLINIC_PRIVATE_KEY"];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Variable de entorno faltante: ${key}`);
  }
}

// ── Provider y wallets ────────────────────────────────────────────────────────
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const clinicWallet  = new ethers.Wallet(process.env.CLINIC_PRIVATE_KEY, provider);
const ownerWallet   = process.env.OWNER_PRIVATE_KEY
  ? new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, provider)
  : null;
const patientWallet = process.env.PATIENT_PRIVATE_KEY
  ? new ethers.Wallet(process.env.PATIENT_PRIVATE_KEY, provider)
  : null;

// ── ABI ───────────────────────────────────────────────────────────────────────
const abiPath = path.join(__dirname, "..", "abi", "WaitReward.json");
const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));

// ── Instancias del contrato ───────────────────────────────────────────────────
const contractAddress = process.env.CONTRACT_ADDRESS;

/** Instancia de sólo lectura */
const contractRead = new ethers.Contract(contractAddress, abi, provider);

/** Instancia firmada con la clave de la clínica */
const contractClinic = new ethers.Contract(contractAddress, abi, clinicWallet);

/** Instancia firmada con la clave del owner (puede ser null) */
const contractOwner = ownerWallet
  ? new ethers.Contract(contractAddress, abi, ownerWallet)
  : null;

/** Instancia firmada con la clave del paciente demo (puede ser null) */
const contractPatient = patientWallet
  ? new ethers.Contract(contractAddress, abi, patientWallet)
  : null;

module.exports = {
  provider,
  clinicWallet,
  ownerWallet,
  patientWallet,
  contractRead,
  contractClinic,
  contractOwner,
  contractPatient,
  contractAddress,
};
