const { Router } = require("express");
const { supabase } = require("../lib/supabase");
const { sendPushToWallet } = require("../lib/push");

const router = Router();

const SIMULATE_PAYLOADS = {
  queue: {
    title: "Fuiste registrado 🏥",
    body: "Tenés 5 pacientes delante tuyo. Demora estimada: 35 min.",
    tag: "queue-registered",
    url: "/?role=patient",
  },
  points_received: {
    title: "¡Recibiste 150 WaitPoints! ⏱️",
    body: "Tu tiempo vale. Compensación por 45 min de espera.",
    tag: "points-received",
    url: "/?role=patient",
  },
  level_up: {
    title: "¡Subiste a Plata! 🥈",
    body: "Desbloqueaste nuevos beneficios. Conocé todo lo que podés canjear.",
    tag: "level-up",
    url: "/?role=patient",
  },
};

/**
 * POST /api/push/simulate
 * body: { type: "queue" | "points_received" | "level_up", dni: "12345678" }
 * Sends a demo push notification to the subscriber linked to the given DNI.
 */
router.post("/simulate", async (req, res) => {
  const { type, dni } = req.body;

  const payload = SIMULATE_PAYLOADS[type];
  if (!payload) {
    return res.status(400).json({
      success: false,
      error: `Tipo inválido. Usá: ${Object.keys(SIMULATE_PAYLOADS).join(", ")}`,
    });
  }

  if (!dni) {
    return res.status(400).json({ success: false, error: "dni es requerido" });
  }

  // Resolve DNI → wallet
  const { data: user, error: userErr } = await supabase
    .from("wr_users")
    .select("wallet_address")
    .eq("dni", String(dni))
    .single();

  if (userErr || !user?.wallet_address) {
    return res.status(404).json({
      success: false,
      message: `DNI ${dni} no encontrado en wr_users`,
    });
  }

  const wallet = user.wallet_address;

  // Check subscription exists by DNI
  const { data: subs } = await supabase
    .from("wr_push_subscriptions")
    .select("id")
    .eq("dni", String(dni))
    .limit(1);

  if (!subs || subs.length === 0) {
    return res.json({
      success: false,
      message: "No hay suscripción activa para este DNI",
    });
  }

  await sendPushToWallet(wallet, payload, String(dni));

  res.json({
    success: true,
    type,
    dni,
    wallet,
    payload,
  });
});

/**
 * GET /api/push/vapid-public-key
 * Returns the VAPID public key so the frontend can subscribe.
 */
router.get("/vapid-public-key", (_req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) return res.status(503).json({ success: false, error: "Push not configured" });
  res.json({ success: true, key });
});

/**
 * POST /api/push/subscribe
 * body: { wallet, subscription }
 * Saves or updates a push subscription for the given wallet.
 */
router.post("/subscribe", async (req, res) => {
  const { dni, subscription } = req.body;
  if (!dni || !subscription?.endpoint) {
    return res.status(400).json({ success: false, error: "dni y subscription son requeridos" });
  }

  try {
    const { error } = await supabase
      .from("wr_push_subscriptions")
      .upsert(
        {
          dni: String(dni),
          subscription: JSON.stringify(subscription),
          created_at: new Date().toISOString(),
        },
        { onConflict: "dni" }
      );

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error("[push/subscribe]", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/push/unsubscribe
 * body: { endpoint }
 */
router.delete("/unsubscribe", async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ success: false, error: "endpoint requerido" });

  await supabase.from("wr_push_subscriptions").delete().eq("endpoint", endpoint);
  res.json({ success: true });
});

module.exports = router;
