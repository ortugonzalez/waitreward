import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const MOCK_REDEMPTIONS = [
  { points: 150, discount: "$1.50", time: "10:32", date: "Hoy" },
  { points: 50, discount: "$0.50", time: "09:15", date: "Hoy" },
  { points: 300, discount: "$3.00", time: "18:47", date: "Ayer" },
  { points: 150, discount: "$1.50", time: "11:20", date: "Ayer" },
];

export function CommerceView({ session }) {
  const [commerce, setCommerce] = useState(null);
  const [loading, setLoading] = useState(false);

  // QR Scanner
  const [qrInput, setQrInput] = useState("");
  const [qrResult, setQrResult] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  const fetchCommerceByName = useCallback(async (nameStr) => {
    if (!nameStr) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/commerce/search?name=${encodeURIComponent(nameStr)}`);
      const data = await res.json();
      if (data.success) {
        setCommerce(data);
      }
    } catch (err) {
      console.error("[CommerceView]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.role === "commerce" && session?.name) {
      fetchCommerceByName(session.name);
    } else {
      fetchCommerceByName("Farmacia Del Pueblo");
    }
  }, [session, fetchCommerceByName]);

  const handleValidateQR = async (e) => {
    e.preventDefault();
    if (!qrInput.trim()) return toast.error("Ingresá el código QR");
    setQrLoading(true);
    setQrResult(null);
    try {
      const res = await fetch(`${API_URL}/api/rewards/redeem-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: qrInput.trim() }),
      });
      const data = await res.json();
      setQrResult(data);
      if (data.success) {
        toast.success("Canje exitoso");
        setQrInput("");
      }
    } catch {
      setQrResult({ success: false, message: "Error de conexión" });
    } finally {
      setQrLoading(false);
    }
  };

  // Safe checks for rendering fallback values if api loading/fails
  const displayCommerce = commerce || {
    name: session?.name || "Comercio",
    emoji: "🏪",
    category: "Comercio Adherido",
    active: true,
    address: "Corrientes 1234, CABA",
    hours: "Lun a Vie 09:00 - 20:00",
  };

  const todayRedemptions = MOCK_REDEMPTIONS.filter(r => r.date === "Hoy");

  return (
    <div className="flex flex-col gap-6 px-4 bg-[#F8F7FF] min-h-screen text-[#1A1A2E] font-sans pb-8 max-w-full">

      {/* ── Sección 1: Header del comercio ── */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 mt-4 flex flex-col gap-4 border border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-[16px] bg-[#F8F7FF] flex items-center justify-center text-4xl shrink-0 border border-[#7F77DD]/10">
            {displayCommerce.emoji || "🏪"}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-xl font-black text-[#1A1A2E] leading-tight truncate">
                {displayCommerce.name}
              </h1>
              <span className="shrink-0 inline-flex items-center gap-1.5 bg-[#22C55E]/10 text-[#22C55E] text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span> Activo
              </span>
            </div>
            <p className="text-[13px] font-bold text-[#7F77DD] mt-1">{displayCommerce.category || "General"}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-[13px] text-gray-600">
            <span className="text-lg">📍</span>
            <span className="font-medium">{displayCommerce.address || "Av. Corrientes 1234, CABA"}</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-gray-600">
            <span className="text-lg">🕗</span>
            <span className="font-medium">{displayCommerce.hours || "Lunes a Viernes 09:00 a 20:00"}</span>
          </div>
        </div>
      </div>

      {/* ── Sección 2: Métricas del día ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-[16px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#7F77DD]/10 flex items-center justify-center text-[#7F77DD] text-xl">🔄</div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Canjes hoy</p>
            <p className="text-xl font-black text-[#1A1A2E] leading-none mt-1">3</p>
          </div>
        </div>
        <div className="bg-white rounded-[16px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 text-xl">💸</div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Descuentos</p>
            <p className="text-xl font-black text-[#1A1A2E] leading-none mt-1">$2.00</p>
          </div>
        </div>
        <div className="bg-white rounded-[16px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-xl">👥</div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nuevos</p>
            <p className="text-xl font-black text-[#1A1A2E] leading-none mt-1">2</p>
          </div>
        </div>
      </div>

      {/* ── Sección 3: Escanear QR ── */}
      <div className="bg-white rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] p-6 border-2 border-[#7F77DD]">
        <div className="flex flex-col items-center gap-2 mb-4 text-center">
          <div className="w-14 h-14 rounded-full bg-[#7F77DD]/10 flex items-center justify-center text-2xl mb-1">
            📷
          </div>
          <h2 className="text-lg font-black text-[#1A1A2E]">Validar Beneficio</h2>
          <p className="text-[13px] text-gray-500">Ingresá el código del QR del paciente para aplicar el descuento.</p>
        </div>

        <form onSubmit={handleValidateQR} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Ej: WR-1234..."
            value={qrInput}
            onChange={(e) => { setQrInput(e.target.value); setQrResult(null); }}
            className="w-full bg-[#F8F7FF] border border-gray-200 rounded-[16px] px-4 py-4 text-[#1A1A2E] text-center text-lg font-mono font-bold focus:outline-none focus:border-[#7F77DD] focus:ring-4 focus:ring-[#7F77DD]/10 transition-all placeholder:text-gray-400 placeholder:font-normal"
          />
          <button
            type="submit"
            disabled={qrLoading || !qrInput.trim()}
            className="w-full py-4 rounded-[16px] bg-[#7F77DD] text-white font-black text-[15px] disabled:opacity-50 active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(127,119,221,0.3)] flex items-center justify-center gap-2"
          >
            {qrLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Validar canje"}
          </button>
        </form>

        {qrResult && (
          <div className={`mt-4 rounded-[16px] p-4 flex items-start gap-3 animate-fade-in ${qrResult.success
              ? "bg-[#22C55E]/10 border border-[#22C55E]/20"
              : "bg-red-50 border border-red-100"
            }`}>
            <span className="text-2xl mt-1">{qrResult.success ? "✅" : "❌"}</span>
            <div className="flex-1">
              <p className={`text-[15px] font-black ${qrResult.success ? "text-[#22C55E]" : "text-red-600"}`}>
                {qrResult.success ? "¡Canje aprobado!" : "Canje rechazado"}
              </p>
              <p className={`text-[13px] font-medium mt-1 ${qrResult.success ? "text-green-800" : "text-red-700"}`}>
                {qrResult.success
                  ? `Se descontaron ${qrResult.pointsRedeemed} WP. Aplicá un descuento de ${qrResult.discountValue}.`
                  : qrResult.message || "El código ingresado no es válido o ya fue utilizado."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Sección 4: Historial de canjes del día ── */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 border border-gray-100">
        <h3 className="font-bold text-[#1A1A2E] text-base mb-4 flex items-center gap-2">
          <span>📋</span> Historial de hoy
        </h3>

        {todayRedemptions.length > 0 ? (
          <div className="flex flex-col divide-y divide-gray-100">
            {todayRedemptions.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="text-[12px] font-bold text-gray-400 bg-[#F8F7FF] px-2.5 py-1 rounded-[8px]">
                    {r.time}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-black text-[#22C55E]">{r.discount}</p>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{r.points} WP</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-medium text-gray-500 text-center py-4 bg-[#F8F7FF] rounded-[12px]">No hay canjes registrados aún.</p>
        )}
      </div>

    </div>
  );
}
