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
      // 410 Gone or 404 → subscription expired, remove it
      if (err.statusCode === 410 || err.statusCode === 404) {
        supabase.from("wr_push_subscriptions").delete().eq("id", row.id).then(() => {}).catch(() => {});
      } else {
        console.error("[push] Send error:", err.message);
      }
    }
  }
}

module.exports = { webpush, sendPushToWallet };
