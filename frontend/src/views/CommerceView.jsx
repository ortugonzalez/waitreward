import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const MOCK_REDEMPTIONS = [
  { points: 150, date: "Hoy 10:32", patient: "María G." },
  { points: 50,  date: "Hoy 09:15", patient: "Carlos R." },
  { points: 300, date: "Ayer 18:47", patient: "Ana L." },
  { points: 150, date: "Ayer 11:20", patient: "Luis M." },
];

export function CommerceView({ session, onLogout }) {
  const [searchInput, setSearchInput] = useState("");
  const [commerce, setCommerce]       = useState(null);
  const [loading, setLoading]         = useState(false);

  // QR Scanner
  const [qrInput, setQrInput]   = useState("");
  const [qrResult, setQrResult] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  // ── Fetch commerce by name ─────────────────────────────────────────────────
  const fetchCommerceByName = useCallback(async (nameStr) => {
    if (!nameStr) return;
    setLoading(true);
    setCommerce(null);
    try {
      const res  = await fetch(`${API_URL}/api/commerce/search?name=${encodeURIComponent(nameStr)}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Comercio no encontrado");
      setCommerce(data);
    } catch (err) {
      console.error("[CommerceView]", err);
      toast.error(err.message || "Comercio no encontrado");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Auto-load si hay sesión de comercio ───────────────────────────────────
  useEffect(() => {
    if (session?.role === "commerce" && session?.name) {
      fetchCommerceByName(session.name);
    } else {
      // Si no hay sesión comercio, carga Farmacia Del Pueblo por defecto
      fetchCommerceByName("Farmacia Del Pueblo");
    }
  }, [session, fetchCommerceByName]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return toast.error("Ingresá el nombre del comercio");
    fetchCommerceByName(searchInput.trim());
  };

  // ── Validar QR del paciente ────────────────────────────────────────────────
  const handleValidateQR = async (e) => {
    e.preventDefault();
    if (!qrInput.trim()) return toast.error("Ingresá el código QR");
    setQrLoading(true);
    setQrResult(null);
    try {
      const res  = await fetch(`${API_URL}/api/rewards/redeem-qr`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ qrCode: qrInput.trim() }),
      });
      const data = await res.json();
      setQrResult(data);
      if (data.success) { toast.success("Canje exitoso"); setQrInput(""); }
    } catch {
      setQrResult({ success: false, message: "Error de conexión" });
    } finally {
      setQrLoading(false);
    }
  };

  const expiryDate = commerce?.subscriptionExpiryISO
    ? new Date(commerce.subscriptionExpiryISO).toLocaleDateString("es-AR", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : null;

  const totalRedemptions = MOCK_REDEMPTIONS.reduce((sum, r) => sum + r.points, 0);

  return (
    <div className="flex flex-col gap-4 px-4">

      {/* ── Escanear QR del paciente ─────────────────────────────────────── */}
      <div className="bg-white rounded-card shadow-sm p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📲</span>
            <h2 className="font-bold text-ink text-base">Escanear QR</h2>
          </div>
          {session && (
            <button onClick={onLogout} className="text-xs text-gray-400 hover:text-red-400 transition-colors">
              Salir
            </button>
          )}
        </div>
        {session?.name && (
          <p className="text-xs text-gray-500">Hola, <strong>{session.name}</strong> 👋</p>
        )}
        <p className="text-xs text-gray-400">
          Ingresá el código QR del paciente para validar el canje
        </p>
        <form onSubmit={handleValidateQR} className="flex gap-2">
          <input
            type="text"
            placeholder="WR-1234567890-abc123-100"
            value={qrInput}
            onChange={(e) => { setQrInput(e.target.value); setQrResult(null); }}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="submit"
            disabled={qrLoading || !qrInput.trim()}
            className="px-5 py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-60 active:scale-95 transition-transform flex-shrink-0"
          >
            {qrLoading ? "…" : "Validar"}
          </button>
        </form>

        {qrResult && (
          <div className={`rounded-xl p-4 flex items-start gap-3 ${
            qrResult.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}>
            <span className="text-xl">{qrResult.success ? "✅" : "❌"}</span>
            <div>
              {qrResult.success ? (
                <>
                  <p className="text-sm font-bold text-green-800">Canje exitoso</p>
                  <p className="text-xs text-green-700 mt-0.5">
                    {qrResult.pointsRedeemed} puntos · Descuento: {qrResult.discountValue}
                  </p>
                </>
              ) : (
                <p className="text-sm font-bold text-red-700">{qrResult.message}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Búsqueda (solo si no hay sesión de comercio) ─────────────────── */}
      {!session?.role || session.role !== "commerce" ? (
        <form onSubmit={handleSearch} className="bg-white rounded-card shadow-sm p-5 flex flex-col gap-3">
          <h2 className="font-bold text-ink text-base">Buscar comercio</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ej: Farmacia Del Pueblo"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-60 active:scale-95 transition-transform flex-shrink-0"
            >
              {loading ? "…" : "Buscar"}
            </button>
          </div>
        </form>
      ) : null}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-card shadow-sm p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Commerce Dashboard */}
      {commerce && !loading && (
        <>
          <div className="bg-white rounded-card shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">{commerce.emoji || "🏪"}</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-ink">{commerce.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{commerce.category || "Comercio Adherido"}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  (commerce.subscriptionActive ?? commerce.active)
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {(commerce.subscriptionActive ?? commerce.active) ? "✅ Activo" : "❌ Inactivo"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <StatCard label="Saldo"       value={`$${((commerce.depositedFunds || 0) * 35).toFixed(0)}`} icon="💰" />
              <StatCard label="Canjes"      value={MOCK_REDEMPTIONS.length} unit="hoy" icon="🔄" />
              <StatCard label="Suscripción" value={expiryDate ?? "—"} icon="📅" />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Fondos para respaldar canjes</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all"
                  style={{ width: `${Math.min(((commerce.depositedFunds || 0) / 0.1) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* WaitPoints recibidos */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-card shadow-sm p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm opacity-90">WaitPoints recibidos</h3>
              <span className="text-xs opacity-70">Últimos 7 días</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black">{totalRedemptions}</span>
              <span className="text-sm opacity-80 mb-1">WP</span>
            </div>
            <p className="text-xs opacity-70 mt-1">
              = ${(totalRedemptions / 100).toFixed(2)} generados en ventas
            </p>
          </div>

          {/* Canjes recientes */}
          <div className="bg-white rounded-card shadow-sm p-5">
            <h3 className="font-bold text-ink text-sm mb-3">Canjes recientes</h3>
            <ul className="flex flex-col divide-y divide-gray-50">
              {MOCK_REDEMPTIONS.map((r, i) => (
                <li key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">{r.patient.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">{r.patient}</p>
                    <p className="text-xs text-gray-400">{r.date}</p>
                  </div>
                  <span className="text-sm font-bold text-primary flex-shrink-0">+{r.points} WP</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, unit, icon }) {
  return (
    <div className="bg-surface rounded-xl p-3 flex flex-col gap-1">
      <span className="text-lg">{icon}</span>
      <span className="text-xs text-gray-500">{label}</span>
      <div>
        <span className="text-sm font-bold text-ink">{value}</span>
        {unit && <span className="text-xs text-gray-400 ml-1">{unit}</span>}
      </div>
    </div>
  );
}
