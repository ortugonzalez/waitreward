const { Router } = require("express");
const { supabase } = require("../lib/supabase");
const { PATIENTS } = require("../lib/patients");

const router = Router();

// ── Mock data (cuando Supabase no está configurado) ────────────────────────────
const MOCK_USERS = {
  "12345678": { id: "mock-1", dni: "12345678", name: "María García",      role: "patient",  wallet_address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
  "87654321": { id: "mock-2", dni: "87654321", name: "Juan Pérez",        role: "patient",  wallet_address: "0xb586790F5684d6E40a7e4dE353d08053D3eF9b41" },
  "11223344": { id: "mock-3", dni: "11223344", name: "Ana Martínez",      role: "patient",  wallet_address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" },
  "99887766": { id: "mock-4", dni: "99887766", name: "Dr. Carlos López",  role: "clinic",   wallet_address: "0xb586790F5684d6E40a7e4dE353d08053D3eF9b41" },
  "55443322": { id: "mock-5", dni: "55443322", name: "Farmacia Del Pueblo", role: "commerce", wallet_address: "0xb586790F5684d6E40a7e4dE353d08053D3eF9b41" },
};

// Simple token: base64({ dni, role, iat })
function makeToken(user) {
  const payload = { dni: user.dni, role: user.role, name: user.name, iat: Date.now() };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

function parseToken(token) {
  try {
    return JSON.parse(Buffer.from(token, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

// ── POST /api/auth/login ───────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { dni } = req.body;
  if (!dni) {
    return res.status(400).json({ success: false, message: "DNI requerido" });
  }

  // Modo mock
  if (!supabase) {
    const user = MOCK_USERS[String(dni).trim()];
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado", _source: "mock" });
    }
    return res.json({
      success: true,
      user: { name: user.name, role: user.role, dni: user.dni, wallet: user.wallet_address },
      token: makeToken(user),
      _source: "mock",
    });
  }

  // Modo Supabase
  const { data, error } = await supabase
    .from("users")
    .select("id, dni, name, role, wallet_address")
    .eq("dni", String(dni).trim())
    .single();

  if (error || !data) {
    return res.status(404).json({ success: false, message: "Usuario no encontrado" });
  }

  return res.json({
    success: true,
    user: { name: data.name, role: data.role, dni: data.dni, wallet: data.wallet_address },
    token: makeToken(data),
  });
});

// ── GET /api/auth/me ───────────────────────────────────────────────────────────
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, message: "Token requerido" });
  }

  const payload = parseToken(token);
  if (!payload || !payload.dni) {
    return res.status(401).json({ success: false, message: "Token inválido" });
  }

  // Modo mock
  if (!supabase) {
    const user = MOCK_USERS[payload.dni];
    if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado", _source: "mock" });
    return res.json({
      success: true,
      user: { name: user.name, role: user.role, dni: user.dni, wallet: user.wallet_address },
      _source: "mock",
    });
  }

  // Modo Supabase
  const { data, error } = await supabase
    .from("users")
    .select("id, dni, name, role, wallet_address, email, created_at")
    .eq("dni", payload.dni)
    .single();

  if (error || !data) {
    return res.status(404).json({ success: false, message: "Usuario no encontrado" });
  }

  return res.json({
    success: true,
    user: { name: data.name, role: data.role, dni: data.dni, wallet: data.wallet_address, email: data.email },
  });
});

module.exports = router;
