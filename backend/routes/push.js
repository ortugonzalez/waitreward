const { Router } = require("express");
const { supabase } = require("../lib/supabase");

const router = Router();

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
  const { wallet, subscription } = req.body;
  if (!wallet || !subscription?.endpoint) {
    return res.status(400).json({ success: false, error: "wallet y subscription son requeridos" });
  }

  try {
    // Upsert by endpoint to avoid duplicates
    const { error } = await supabase
      .from("wr_push_subscriptions")
      .upsert(
        {
          wallet: wallet.toLowerCase(),
          endpoint: subscription.endpoint,
          subscription,
          created_at: new Date().toISOString(),
        },
        { onConflict: "endpoint" }
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
