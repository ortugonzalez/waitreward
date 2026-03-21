const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status}`);
  }
  return data;
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

