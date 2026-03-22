const webpush = require("web-push");
const { supabase } = require("./supabase");

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:waitreward@hackathon.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Send a push notification to all subscriptions for a given wallet.
 * Silently removes expired/invalid subscriptions.
 */
async function sendPushToWallet(walletAddress, payload, dni) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;

  let rows = [];
  try {
    // Query by DNI if provided, otherwise fall back to wallet lookup via wr_users
    if (dni) {
      const { data } = await supabase
        .from("wr_push_subscriptions")
        .select("id, subscription")
        .eq("dni", String(dni));
      rows = data || [];
    } else {
      // Resolve wallet → DNI first
      const { data: user } = await supabase
        .from("wr_users")
        .select("dni")
        .eq("wallet_address", walletAddress.toLowerCase())
        .single();
      if (user?.dni) {
        const { data } = await supabase
          .from("wr_push_subscriptions")
          .select("id, subscription")
          .eq("dni", String(user.dni));
        rows = data || [];
      }
    }
  } catch (e) {
    console.error("[push] Failed to fetch subscriptions:", e.message);
    return;
  }

  const payloadStr = JSON.stringify(payload);
  for (const row of rows) {
    try {
      // subscription puede estar guardado como string JSON o como objeto
      const subObject =
        typeof row.subscription === "string"
          ? JSON.parse(row.subscription)
          : row.subscription;
      await webpush.sendNotification(subObject, payloadStr);
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        supabase.from("wr_push_subscriptions").delete().eq("id", row.id).then(() => {}).catch(() => {});
      } else {
        console.error("[push] Send error:", err.message);
      }
    }
  }
}

/**
 * Notify any active subscriber that their turn is approaching.
 * Used as a demo signal before the on-chain settle.
 * In production this would target the specific patient's wallet.
 */
async function notifyPatientTurnApproaching(patientWallet, minutesAhead, patientsAhead) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;

  // Try to find subscription by wallet first
  let rows = [];
  try {
    const { data } = await supabase
      .from("wr_push_subscriptions")
      .select("id, subscription")
      .eq("wallet", patientWallet.toLowerCase());
    rows = data || [];
  } catch (_) {}

  // Demo fallback: use any active subscription if patient not found
  if (rows.length === 0) {
    try {
      const { data } = await supabase
        .from("wr_push_subscriptions")
        .select("id, subscription")
        .limit(1);
      rows = data || [];
    } catch (_) {}
  }

  if (rows.length === 0) return;

  const payload = JSON.stringify({
    title: "Tu turno se acerca 🏥",
    body: `Tenés ${patientsAhead} pacientes delante. Demora estimada: ${minutesAhead} min.`,
    tag: "turn-approaching",
    url: "/",
  });

  for (const row of rows) {
    await webpush.sendNotification(row.subscription, payload).catch((e) =>
      console.error("[push] approaching error:", e.message)
    );
  }
}

module.exports = { webpush, sendPushToWallet, notifyPatientTurnApproaching };
