const { Router } = require("express");
const { supabase } = require("../lib/supabase");
const { contractClinic } = require("../lib/contract");
const { ethers } = require("ethers");

const router = Router();

// ── Catálogo estático de premios ───────────────────────────────────────────────
const REWARDS_CATALOG = [
  { id: 1, name: "Café en local adherido",      points: 30,  emoji: "☕", description: "En cualquier cafetería de la red",  category: "gastronomia" },
  { id: 2, name: "Descuento en farmacia",        points: 100, emoji: "💊", description: "Productos seleccionados",           category: "farmacia" },
  { id: 3, name: "Sesión de psicología",         points: 300, emoji: "🧠", description: "Primera sesión gratuita",           category: "salud",       badge: "MÁS POPULAR" },
  { id: 4, name: "Consulta interna sin cargo",   points: 500, emoji: "🩺", description: "Con médico de planta",              category: "salud" },
  { id: 5, name: "Descuento en laboratorio",     points: 200, emoji: "🔬", description: "Análisis de rutina",                category: "diagnostico" },
  { id: 6, name: "Kinesiología",                 points: 250, emoji: "💆", description: "Sesión de rehabilitación",          category: "salud" },
];

// ── Mock comercios ─────────────────────────────────────────────────────────────
const MOCK_COMMERCES = [
  {
    name: "Farmacia Del Pueblo", category: "Farmacia",
    address: "Av. Corrientes 1234, Buenos Aires", hours: "Lun-Vie 8-20, Sáb 9-18",
    emoji: "💊", active: true,
    availableRewards: [REWARDS_CATALOG[1]],
  },
  {
    name: "Café Central", category: "Gastronomía",
    address: "San Martín 456, Buenos Aires", hours: "Todos los días 7-22",
    emoji: "☕", active: true,
    availableRewards: [REWARDS_CATALOG[0]],
  },
];

// ── GET /api/rewards/catalog ───────────────────────────────────────────────────
router.get("/catalog", (_req, res) => {
  res.json({ success: true, catalog: REWARDS_CATALOG });
});

// ── GET /api/rewards/commerces ─────────────────────────────────────────────────
router.get("/commerces", async (_req, res) => {
  if (!supabase) {
    return res.json({ success: true, commerces: MOCK_COMMERCES, _source: "mock" });
  }

  const { data, error } = await supabase
    .from("commerces")
    .select("commerce_name, category, address, hours, emoji, active")
    .eq("active", true);

  if (error) {
    console.error("[rewards/commerces] Supabase error:", error.message);
    return res.json({ success: true, commerces: MOCK_COMMERCES, _source: "mock_fallback" });
  }

  const commerces = (data || []).map((c) => ({
    name: c.commerce_name,
    category: c.category,
    address: c.address,
    hours: c.hours,
    emoji: c.emoji,
    active: c.active,
    availableRewards: REWARDS_CATALOG.filter((r) =>
      c.category?.toLowerCase().includes(r.category) ||
      r.category === "salud"
    ),
  }));

  return res.json({ success: true, commerces });
});

// ── POST /api/rewards/generate-qr ─────────────────────────────────────────────
router.post("/generate-qr", async (req, res) => {
  const { patientDni, commerceId, points } = req.body;
  if (!patientDni || !points || points <= 0) {
    return res.status(400).json({ success: false, error: "patientDni y points son obligatorios" });
  }

  const qrCode = `WR-${Date.now()}-${patientDni}-${points}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const discountValue = (points / 100).toFixed(2);

  // Modo mock
  if (!supabase) {
    return res.json({
      success: true,
      qrCode,
      expiresAt,
      discountValue: parseFloat(discountValue),
      points,
      _source: "mock",
    });
  }

  // Buscar paciente y comercio en Supabase
  const { data: patient } = await supabase
    .from("users").select("id").eq("dni", patientDni).single();
  const { data: commerce } = await supabase
    .from("commerces").select("id").eq("id", commerceId).single();

  const { error } = await supabase.from("redemptions").insert({
    patient_id: patient?.id ?? null,
    commerce_id: commerce?.id ?? null,
    points_redeemed: points,
    discount_value: parseFloat(discountValue),
    qr_code: qrCode,
    status: "pending",
    expires_at: expiresAt,
  });

  if (error) {
    console.error("[generate-qr] Supabase insert error:", error.message);
    // No fallar — devolver el QR igual
  }

  return res.json({
    success: true,
    qrCode,
    expiresAt,
    discountValue: parseFloat(discountValue),
    points,
  });
});

// ── POST /api/rewards/redeem-qr ───────────────────────────────────────────────
router.post("/redeem-qr", async (req, res, next) => {
  const { qrCode, commerceId } = req.body;
  if (!qrCode) {
    return res.status(400).json({ success: false, error: "qrCode es obligatorio" });
  }

  // Modo mock: parsear el QR y simular el canje
  if (!supabase) {
    const parts = qrCode.split("-");
    // formato: WR-{timestamp}-{dni}-{points}
    const points = parseInt(parts[parts.length - 1], 10);
    if (!points || isNaN(points)) {
      return res.status(400).json({ success: false, error: "QR inválido", _source: "mock" });
    }
    return res.json({
      success: true,
      pointsRedeemed: points,
      discountValue: parseFloat((points / 100).toFixed(2)),
      txHash: null,
      message: "Canje registrado (modo mock — sin tx on-chain)",
      _source: "mock",
    });
  }

  // Modo Supabase: verificar QR y ejecutar canje on-chain
  try {
    const { data: redemption, error } = await supabase
      .from("redemptions")
      .select("*, patient:patient_id(wallet_address)")
      .eq("qr_code", qrCode)
      .eq("status", "pending")
      .single();

    if (error || !redemption) {
      return res.status(404).json({ success: false, error: "QR no encontrado o ya utilizado" });
    }

    const now = new Date();
    if (new Date(redemption.expires_at) < now) {
      await supabase.from("redemptions").update({ status: "expired" }).eq("id", redemption.id);
      return res.status(410).json({ success: false, error: "El QR ha expirado" });
    }

    // Ejecutar redeemPoints en el contrato
    const patientWallet = redemption.patient?.wallet_address;
    if (!patientWallet) {
      return res.status(400).json({ success: false, error: "Wallet del paciente no encontrada" });
    }

    const pointsWei = ethers.parseEther(String(redemption.points_redeemed));
    const tx = await contractClinic.redeemPoints(patientWallet, pointsWei);
    const receipt = await tx.wait();

    // Actualizar Supabase
    await supabase.from("redemptions").update({
      status: "completed",
      tx_hash: receipt.hash,
    }).eq("id", redemption.id);

    return res.json({
      success: true,
      pointsRedeemed: redemption.points_redeemed,
      discountValue: redemption.discount_value,
      txHash: receipt.hash,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
