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
async function sendPushToWallet(walletAddress, payload) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;

  let rows = [];
  try {
    const { data } = await supabase
      .from("wr_push_subscriptions")
      .select("id, subscription")
      .eq("wallet", walletAddress.toLowerCase());
    rows = data || [];
  } catch (e) {
    console.error("[push] Failed to fetch subscriptions:", e.message);
    return;
  }

  const payloadStr = JSON.stringify(payload);
  for (const row of rows) {
    try {
      await webpush.sendNotification(row.subscription, payloadStr);
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
