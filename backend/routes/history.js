const { Router } = require("express");
const { supabase } = require("../lib/supabase");

const router = Router();

const MOCK_HISTORY = [
  {
    appointmentId: "TURNO-001",
    delayMinutes: 45,
    pointsAwarded: 150,
    createdAt: "2026-03-20T10:30:00",
    severity: "moderate",
    txHash: "0x3cd7084b9f2a1c3e5d7b8f4a2c6e1d3b5f7a9c2e4d6b8f0a1c3e5d7b9f2a4c6",
  },
  {
    appointmentId: "TURNO-002",
    delayMinutes: 72,
    pointsAwarded: 300,
    createdAt: "2026-03-18T14:15:00",
    severity: "significant",
    txHash: "0xa3d043e1b5c7f9a2d4e6b8c0f2a4d6e8b0c2f4a6d8e0b2c4f6a8d0e2b4c6f8a0",
  },
  {
    appointmentId: "TURNO-003",
    delayMinutes: 22,
    pointsAwarded: 50,
    createdAt: "2026-03-15T09:00:00",
    severity: "minor",
    txHash: "0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
  },
];

function getSeverity(delay) {
  if (delay < 15) return "on_time";
  if (delay < 30) return "minor";
  if (delay < 60) return "moderate";
  return "significant";
}

/**
 * GET /api/history/patient/:wallet
 * Returns appointment history for a patient wallet.
 */
router.get("/patient/:wallet", async (req, res) => {
  const { wallet } = req.params;

  try {
    const { data, error } = await supabase
      .from("wr_appointments")
      .select("appointment_id, delay_minutes, points_awarded, tx_hash, created_at")
      .eq("patient_wallet", wallet.toLowerCase())
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return res.json(MOCK_HISTORY);

    const history = data.map((r) => ({
      appointmentId: r.appointment_id,
      delayMinutes: r.delay_minutes || 0,
      pointsAwarded: r.points_awarded || 0,
      createdAt: r.created_at,
      severity: getSeverity(r.delay_minutes || 0),
      txHash: r.tx_hash || "",
    }));

    return res.json(history);
  } catch (err) {
    console.error("[history]", err.message);
    return res.json(MOCK_HISTORY);
  }
});

/**
 * GET /api/history/patient/:wallet/summary
 * Returns aggregated summary for a patient.
 */
router.get("/patient/:wallet/summary", async (req, res) => {
  const { wallet } = req.params;

  try {
    const { data, error } = await supabase
      .from("wr_appointments")
      .select("delay_minutes, points_awarded")
      .eq("patient_wallet", wallet.toLowerCase());

    if (error) throw error;
    if (!data || data.length === 0) {
      // Mock summary derived from mock history
      return res.json({
        totalPoints: 500,
        totalAppointments: 3,
        avgDelay: 46,
        worstDelay: 72,
        totalSaved: 5.0,
        _source: "mock",
      });
    }

    const totalPoints = data.reduce((s, r) => s + (r.points_awarded || 0), 0);
    const totalAppointments = data.length;
    const avgDelay = Math.round(data.reduce((s, r) => s + (r.delay_minutes || 0), 0) / totalAppointments);
    const worstDelay = Math.max(...data.map((r) => r.delay_minutes || 0));
    const totalSaved = parseFloat((totalPoints / 100).toFixed(2));

    return res.json({
      totalPoints,
      totalAppointments,
      avgDelay,
      worstDelay,
      totalSaved,
      _source: "supabase",
    });
  } catch (err) {
    console.error("[history/summary]", err.message);
    return res.json({
      totalPoints: 500,
      totalAppointments: 3,
      avgDelay: 46,
      worstDelay: 72,
      totalSaved: 5.0,
      _source: "mock",
    });
  }
});

module.exports = router;
