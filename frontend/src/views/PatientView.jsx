import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";
import { getPoints } from "../api/client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function PatientView({ session, onLogout }) {
  const [points, setPoints]         = useState(null);
  const [loadingPts, setLoadingPts] = useState(true);
  const [catalog, setCatalog]       = useState([]);
  const [qrModal, setQrModal]       = useState(null);
  const [generatingFor, setGeneratingFor] = useState(null);

  // ── Fetch on-chain points ──────────────────────────────────────────────────
  const fetchPoints = useCallback(async () => {
    if (!session?.wallet) { setLoadingPts(false); return; }
    setLoadingPts(true);
    try {
      const checksummed = ethers.getAddress(session.wallet);
      const data = await getPoints(checksummed);
      setPoints(data.points ?? 0);
    } catch { setPoints(0); }
    finally { setLoadingPts(false); }
  }, [session?.wallet]);

  const fetchCatalog = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/rewards/catalog`);
      const data = await res.json();
      if (data.success) setCatalog(data.catalog);
    } catch {}
  }, []);

  useEffect(() => {
    fetchPoints();
    fetchCatalog();
    const interval = setInterval(fetchPoints, 15_000);
    return () => clearInterval(interval);
  }, [fetchPoints, fetchCatalog]);

  // ── Generar QR para un beneficio ───────────────────────────────────────────
  const handleRedeem = async (item) => {
    if (!session?.wallet) return toast.error("Sesión no válida");
    setGeneratingFor(item.id);
    try {
      const res = await fetch(`${API_URL}/api/rewards/generate-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientWallet: session.wallet,
          commerceName:  "Farmacia Del Pueblo",
          points:        item.points,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Error generando QR");
      setQrModal({
        qrCode:       data.qrCode,
        validateUrl:  data.validateUrl,
        expiresAt:    data.expiresAt,
        discountValue:data.discountValue,
        points:       item.points,
        name:         item.name,
        emoji:        item.emoji,
      });
    } catch (err) {
      toast.error(err.message || "Error generando QR");
    } finally {
      setGeneratingFor(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4">
      {/* Saldo */}
      <div className="bg-white rounded-card shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-ink">Hola, {session?.name} 👋</p>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchPoints}
              disabled={loadingPts}
              className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-gray-500 active:scale-95 transition-transform disabled:opacity-40"
              title="Actualizar"
            >
              <span className={`text-base ${loadingPts ? "animate-spin" : ""}`}>↻</span>
            </button>
            <button onClick={onLogout} className="text-xs text-gray-400 hover:text-red-400 transition-colors">
              Salir
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center py-4">
          {loadingPts && points === null ? (
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-6xl font-black text-primary leading-none">{points ?? 0}</span>
              <span className="text-lg font-semibold text-gray-400 mt-1">WaitPoints</span>
              <span className="text-sm text-gray-400 mt-1">
                = ${((points ?? 0) / 100).toFixed(2)} en descuentos
              </span>
            </>
          )}
        </div>
      </div>

      {/* Catálogo de beneficios */}
      <div className="bg-white rounded-card shadow-sm p-5">
        <h3 className="font-bold text-ink text-base mb-1">Mis beneficios disponibles</h3>
        <p className="text-xs text-gray-400 mb-4">Acumulá WaitPoints por cada espera y canjeá beneficios</p>

        {catalog.length === 0 ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {catalog.map((item) => {
              const canRedeem    = (points ?? 0) >= item.points;
              const missing      = item.points - (points ?? 0);
              const isGenerating = generatingFor === item.id;

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl relative ${
                    canRedeem ? "bg-primary/5 border border-primary/20" : "bg-surface"
                  }`}
                >
                  {item.badge && (
                    <span className="absolute -top-2 -right-1 bg-pink-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  <span className="text-3xl w-10 text-center flex-shrink-0">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink leading-tight">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                    <p className={`text-xs font-bold mt-1 ${canRedeem ? "text-primary" : "text-gray-400"}`}>
                      {item.points} WP
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {canRedeem ? (
                      <button
                        onClick={() => handleRedeem(item)}
                        disabled={isGenerating}
                        className="px-4 py-2 rounded-full bg-primary text-white font-bold text-xs active:scale-95 transition-transform disabled:opacity-60 flex items-center gap-1"
                      >
                        {isGenerating ? (
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : "Canjear"}
                      </button>
                    ) : (
                      <div className="text-center">
                        <span className="text-[10px] text-gray-400 block">Te faltan</span>
                        <span className="text-xs font-bold text-gray-400">{missing} WP</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-center mt-2 flex justify-center items-center gap-1 opacity-50">
        <span className="text-[10px] text-gray-500 font-medium">Powered by</span>
        <span className="text-[10px] text-red-500 font-bold tracking-tight">AVALANCHE</span>
      </div>

      {qrModal && <QRRewardModal data={qrModal} onClose={() => setQrModal(null)} />}
    </div>
  );
}

// ── QR Modal ──────────────────────────────────────────────────────────────────
function QRRewardModal({ data, onClose }) {
  const expiryStr = data.expiresAt
    ? new Date(data.expiresAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
    : "60 días";

  // El QR apunta a la URL de validación — el comercio la escanea y el canje se procesa automáticamente
  const qrContent = data.validateUrl || data.qrCode;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-app bg-white rounded-t-3xl p-6 pb-10 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
        <div className="flex items-center gap-2">
          <span className="text-2xl">{data.emoji}</span>
          <h2 className="text-lg font-bold text-ink">{data.name}</h2>
        </div>
        <p className="text-sm text-gray-500 text-center">
          Mostrá este QR en el comercio — se procesa automáticamente al escanearlo
        </p>

        {/* QR apunta a validateUrl */}
        <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-100">
          <QRCodeSVG value={qrContent} size={200} bgColor="#ffffff" fgColor="#1a1a1a" level="M" />
        </div>

        {/* Código legible */}
        <div className="bg-surface rounded-xl px-4 py-2 w-full text-center">
          <p className="text-[10px] text-gray-400 mb-0.5">Código</p>
          <p className="font-mono text-xs text-ink font-bold tracking-wider">{data.qrCode}</p>
        </div>

        <div className="flex items-center justify-between w-full">
          <div className="text-center">
            <p className="text-2xl font-black text-primary">{data.points}</p>
            <p className="text-xs text-gray-400">WaitPoints</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-ink">{data.discountValue}</p>
            <p className="text-xs text-gray-400">descuento</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-green-600">Válido 60 días</p>
            <p className="text-xs text-gray-400">hasta {expiryStr}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-full bg-primary text-white font-bold text-base active:scale-95 transition-transform"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
