const { Router } = require("express");
const { supabase } = require("../lib/supabase");

const router = Router();

const MOCK_DATA = {
  totalAppointments: 847,
  avgDelay: 28,
  onTimeRate: 23,
  byHour: [
    { hour: 8,  avgDelay: 12, count: 8  },
    { hour: 9,  avgDelay: 18, count: 22 },
    { hour: 10, avgDelay: 35, count: 31 },
    { hour: 11, avgDelay: 42, count: 28 },
    { hour: 12, avgDelay: 38, count: 19 },
    { hour: 14, avgDelay: 15, count: 24 },
    { hour: 15, avgDelay: 28, count: 33 },
    { hour: 16, avgDelay: 45, count: 29 },
    { hour: 17, avgDelay: 52, count: 18 },
  ],
  byDay: [
    { day: "Lunes",     avgDelay: 31, count: 142 },
    { day: "Martes",    avgDelay: 24, count: 128 },
    { day: "Miércoles", avgDelay: 38, count: 156 },
    { day: "Jueves",    avgDelay: 27, count: 134 },
    { day: "Viernes",   avgDelay: 44, count: 148 },
    { day: "Sábado",    avgDelay: 19, count: 89  },
  ],
  topDelays: [
    { appointment_id: "A-047", delay_minutes: 78, points_awarded: 780 },
    { appointment_id: "B-112", delay_minutes: 65, points_awarded: 650 },
    { appointment_id: "A-203", delay_minutes: 59, points_awarded: 590 },
    { appointment_id: "C-088", delay_minutes: 54, points_awarded: 540 },
    { appointment_id: "B-031", delay_minutes: 51, points_awarded: 510 },
  ],
  totalPointsAwarded: 42350,
  todayAppointments: 34,
  _source: "mock",
};

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

/**
 * GET /api/analytics/clinic
 * Returns aggregated appointment analytics.
 * Falls back to mock data if Supabase has no rows.
 */
router.get("/clinic", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("wr_appointments")
      .select("appointment_id, delay_minutes, points_awarded, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return res.json(MOCK_DATA);

    // ── Aggregate real data ────────────────────────────────────────────────────
    const total = data.length;
    const avgDelay = Math.round(data.reduce((s, r) => s + (r.delay_minutes || 0), 0) / total);
    const onTimeCount = data.filter((r) => (r.delay_minutes || 0) < 15).length;
    const onTimeRate = Math.round((onTimeCount / total) * 100);
    const totalPointsAwarded = data.reduce((s, r) => s + (r.points_awarded || 0), 0);

    // Today
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayAppointments = data.filter(
      (r) => r.created_at && r.created_at.startsWith(todayStr)
    ).length;

    // Top 5 delays
    const topDelays = [...data]
      .sort((a, b) => (b.delay_minutes || 0) - (a.delay_minutes || 0))
      .slice(0, 5)
      .map((r) => ({
        appointment_id: r.appointment_id,
        delay_minutes: r.delay_minutes || 0,
        points_awarded: r.points_awarded || 0,
      }));

    // By hour
    const hourMap = {};
    for (const r of data) {
      if (!r.created_at) continue;
      const h = new Date(r.created_at).getHours();
      if (!hourMap[h]) hourMap[h] = { total: 0, count: 0 };
      hourMap[h].total += r.delay_minutes || 0;
      hourMap[h].count += 1;
    }
    const byHour = Object.keys(hourMap)
      .map(Number)
      .sort((a, b) => a - b)
      .map((h) => ({
        hour: h,
        avgDelay: Math.round(hourMap[h].total / hourMap[h].count),
        count: hourMap[h].count,
      }));

    // By day of week
    const dayMap = {};
    for (const r of data) {
      if (!r.created_at) continue;
      const d = new Date(r.created_at).getDay();
      const name = DAY_NAMES[d];
      if (!dayMap[name]) dayMap[name] = { total: 0, count: 0 };
      dayMap[name].total += r.delay_minutes || 0;
      dayMap[name].count += 1;
    }
    const byDay = Object.entries(dayMap).map(([day, v]) => ({
      day,
      avgDelay: Math.round(v.total / v.count),
      count: v.count,
    }));

    return res.json({
      totalAppointments: total,
      avgDelay,
      onTimeRate,
      byHour,
      byDay,
      topDelays,
      totalPointsAwarded: Math.round(totalPointsAwarded),
      todayAppointments,
      _source: "supabase",
    });
  } catch (err) {
    console.error("[analytics] Error:", err.message);
    return res.json(MOCK_DATA);
  }
});

module.exports = router;
