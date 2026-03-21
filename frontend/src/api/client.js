const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const HUMAN_ERRORS = {
  400: "Los datos enviados no son válidos. Verificá e intentá de nuevo.",
  401: "Tu sesión expiró. Por favor iniciá sesión nuevamente.",
  403: "No tenés permiso para realizar esta acción.",
  404: "La información que buscás no está disponible en este momento.",
  409: "Este turno ya fue procesado anteriormente.",
  500: "Algo falló en el servidor. Intentá de nuevo en un momento.",
  network: "No pudimos conectarnos al servidor. Verificá tu conexión a internet.",
  default: "Ocurrió un problema inesperado. Intentá de nuevo.",
};

function humanError(status) {
  return HUMAN_ERRORS[status] || HUMAN_ERRORS.default;
}

async function request(path, options = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || humanError(res.status));
    }
    return data;
  } catch (err) {
    if (err.name === "TypeError") {
      throw new Error(humanError("network"));
    }
    throw err;
  }
}

export const getPoints = (wallet) =>
  request(`/api/points/${wallet}`);

export const settle = (body) =>
  request("/api/settle", { method: "POST", body: JSON.stringify(body) });

export const redeem = (body) =>
  request("/api/redeem", { method: "POST", body: JSON.stringify(body) });

export const getCommerce = (address) =>
  request(`/api/commerce/${address}`);

export const getAIPrediction = (clinicId, specialist) =>
  request(`/api/ai/predict/${encodeURIComponent(clinicId)}/${encodeURIComponent(specialist)}`);

export const getAIMetrics = (clinicId) =>
  request(`/api/ai/metrics/${encodeURIComponent(clinicId)}`);

// Historial del paciente
export const getPatientHistory = (wallet) =>
  request(`/api/history/patient/${wallet}`);

export const getPatientSummary = (wallet) =>
  request(`/api/history/patient/${wallet}/summary`);

// Verificación del contrato
export const verifyContract = () =>
  request("/api/contract/verify");

// Descargar reporte PDF
export const downloadReport = () =>
  window.open(`${BASE}/api/reports/clinic/pdf`, "_blank");
