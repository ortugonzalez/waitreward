const { Router } = require("express");

const router = Router();
const AI_URL = process.env.AI_URL || "https://jubilant-expression-production.up.railway.app";

async function proxyGet(path, res, next) {
  try {
    const response = await fetch(`${AI_URL}${path}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }
    const data = await response.json();
    return res.json({ success: true, ...data });
  } catch (err) {
    // Return mock data for any failure
    return res.json({
      success: true,
      predicted_delay: 27,
      confidence: 0.78,
      patients_ahead: 4,
      _source: "mock"
    });
  }
}

/**
 * GET /api/ai/predict/:clinicId/:specialist
 * Predice la demora esperada para un turno.
 * Query param opcional: day_of_week (0=lunes … 6=domingo)
 */
router.get("/predict/:clinicId/:specialist", async (req, res, next) => {
  const { clinicId, specialist } = req.params;
  const { day_of_week } = req.query;

  const qs = day_of_week !== undefined ? `?day_of_week=${day_of_week}` : "";
  await proxyGet(`/predict-delay/${encodeURIComponent(clinicId)}/${encodeURIComponent(specialist)}${qs}`, res, next);
});

/**
 * GET /api/ai/metrics/:clinicId
 * Retorna métricas históricas de demora de una clínica.
 */
router.get("/metrics/:clinicId", async (req, res, next) => {
  const { clinicId } = req.params;
  await proxyGet(`/clinic-metrics/${encodeURIComponent(clinicId)}`, res, next);
});

/**
 * GET /api/ai/queue/:clinicId
 * Estado de la cola en tiempo real.
 */
router.get("/queue/:clinicId", async (req, res) => {
  try {
    const response = await fetch(
      `${AI_URL}/queue-status/${encodeURIComponent(req.params.clinicId)}`
    );
    if (!response.ok) throw new Error("queue fail");
    const data = await response.json();
    res.json(data);
  } catch {
    res.json({
      patients_ahead: 4,
      estimated_wait_minutes: 35,
      confidence: 0.75,
      last_updated: "hace 2 minutos",
      _source: "mock",
    });
  }
});

module.exports = router;
