require("dotenv").config();

const express = require("express");
const cors = require("cors");

// ── Instancia del contrato (falla temprano si faltan env vars) ────────────────
require("./lib/contract");

const settleRouter = require("./routes/settle");
const pointsRouter = require("./routes/points");
const redeemRouter = require("./routes/redeem");
const commerceRouter = require("./routes/commerce");
const aiRouter = require("./routes/ai");
const patientsRouter = require("./routes/patients");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5175", "http://127.0.0.1:5175"] }));
app.use(express.json());

// Logging básico: método, path, status, ms
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.path} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    contract: process.env.CONTRACT_ADDRESS || "no configurado",
    network: "Avalanche Fuji",
    timestamp: new Date().toISOString(),
  });
});

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use("/api/settle", settleRouter);
app.use("/api/points", pointsRouter);
app.use("/api/redeem", redeemRouter);
app.use("/api/commerce", commerceRouter);
app.use("/api/ai", aiRouter);
app.use("/api/patients", patientsRouter);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// ── Manejador de errores global ───────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err.message);

  // Errores del contrato: traducir los más comunes
  const msg = err.message || "";
  if (msg.includes("Already settled"))
    return res.status(409).json({ success: false, error: "Este turno ya fue procesado" });
  if (msg.includes("Not authorized clinic"))
    return res.status(403).json({ success: false, error: "La wallet firmante no es una clínica autorizada" });
  if (msg.includes("Commerce not active"))
    return res.status(400).json({ success: false, error: "El comercio no está activo" });
  if (msg.includes("Commerce subscription expired"))
    return res.status(400).json({ success: false, error: "La suscripción del comercio está vencida" });
  if (msg.includes("Insufficient balance"))
    return res.status(400).json({ success: false, error: "Saldo de WRT insuficiente" });
  if (msg.includes("Commerce has insufficient deposit"))
    return res.status(400).json({ success: false, error: "El comercio no tiene suficiente depósito para este canje" });
  if (msg.includes("insufficient funds"))
    return res.status(400).json({ success: false, error: "Fondos insuficientes en la wallet para pagar el gas" });
  if (msg.includes("could not decode result data") || msg.includes("missing revert data"))
    return res.status(502).json({ success: false, error: "No se pudo conectar al contrato. Verificar CONTRACT_ADDRESS y RPC_URL" });

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: status === 500 ? "Error interno del servidor" : err.message,
  });
});

// ── Iniciar servidor ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nWaitReward API corriendo en http://localhost:${PORT}`);
  console.log(`  Health:   GET  /health`);
  console.log(`  Settle:   POST /api/settle`);
  console.log(`  Points:   GET  /api/points/:wallet`);
  console.log(`  Redeem:   POST /api/redeem`);
  console.log(`  Commerce: GET  /api/commerce/:address`);
  console.log(`  AI:       GET  /api/ai/predict/:clinicId/:specialist`);
  console.log(`  AI:       GET  /api/ai/metrics/:clinicId`);
  console.log(`\n  Contrato: ${process.env.CONTRACT_ADDRESS || "(no configurado)"}`);
  console.log(`  Red:      Avalanche Fuji\n`);
});
