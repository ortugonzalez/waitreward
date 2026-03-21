import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";
import { getPoints } from "../api/client";

async function subscribeToNotifications(wallet) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  try {
    const permResult = await Notification.requestPermission();
    if (permResult !== "granted") return;

    const keyRes = await fetch(`${API_URL}/api/push/vapid-public-key`);
    const { key } = await keyRes.json();
    if (!key) return;

    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      await fetch(`${API_URL}/api/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, subscription: existing.toJSON() }),
      });
      return;
    }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: key,
    });
    await fetch(`${API_URL}/api/push/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet, subscription: sub.toJSON() }),
    });
  } catch (err) {
    console.warn("[push] Subscribe error:", err.message);
  }
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function PatientView({ session, onLogout }) {
  const [points, setPoints] = useState(null);
  const [loadingPts, setLoadingPts] = useState(true);
  const [catalog, setCatalog] = useState([]);
  const [qrModal, setQrModal] = useState(null);
  const [generatingFor, setGeneratingFor] = useState(null);

  const [queue, setQueue] = useState(null);
  const [queueLoading, setQueueLoading] = useState(false);

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
      if (data.success) {
        // Add static fallback data if needed to ensure emojis etc are consistent
        setCatalog(data.catalog);
      }
    } catch { }
  }, []);

  const fetchQueue = useCallback(async () => {
    setQueueLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/queue/clinica-demo`);
      const data = await res.json();
      setQueue(data);
    } catch {
      setQueue({ patients_ahead: 4, estimated_wait_minutes: 35, confidence: 0.75, last_updated: "hace 2 min", _source: "mock" });
    } finally {
      setQueueLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPoints();
    fetchCatalog();
    fetchQueue();
    const interval = setInterval(fetchPoints, 15_000);
    const queueInterval = setInterval(fetchQueue, 60_000);
    if (session?.wallet) subscribeToNotifications(session.wallet);
    return () => {
      clearInterval(interval);
      clearInterval(queueInterval);
    };
  }, [fetchPoints, fetchCatalog, fetchQueue]);

  const handleRedeem = async (item) => {
    if (!session?.wallet) return toast.error("Sesión no válida");
    setGeneratingFor(item.id);
    try {
      const res = await fetch(`${API_URL}/api/rewards/generate-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientWallet: session.wallet,
          commerceName: "Farmacia Del Pueblo",
          points: item.points,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Error generando QR");
      setQrModal({
        qrCode: data.qrCode,
        validateUrl: data.validateUrl,
        expiresAt: data.expiresAt,
        discountValue: data.discountValue,
        points: item.points,
        name: item.name,
        emoji: item.emoji,
      });
    } catch (err) {
      toast.error(err.message || "Error generando QR");
    } finally {
      setGeneratingFor(null);
    }
  };

  // Logic for level progress
  const currentPts = points ?? 0;
  const nextLevels = [30, 100, 300, 500, 1000];
  const nextLevel = nextLevels.find(l => l > currentPts) || 1000;
  const progressPercent = Math.min(100, Math.max(0, (currentPts / nextLevel) * 100));

  return (
    <div className="flex flex-col gap-6 px-4 bg-[#F8F7FF] min-h-screen text-[#1A1A2E] font-sans pb-8">

      <div className="flex items-center justify-between pt-4">
        <h1 className="text-2xl font-black text-[#1A1A2E]">Hola, {session?.name?.split(' ')[0]} 👋</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPoints}
            disabled={loadingPts}
            className="w-8 h-8 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#7F77DD] active:scale-95 transition-transform disabled:opacity-40"
            title="Actualizar"
          >
            <span className={`text-base font-bold ${loadingPts ? "animate-spin" : ""}`}>↻</span>
          </button>
          <button onClick={onLogout} className="text-xs font-bold text-gray-400 hover:text-red-400 transition-colors">
            Salir
          </button>
        </div>
      </div>

      {/* Saldo Big Card */}
      <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 flex flex-col items-center relative overflow-hidden">
        {loadingPts && points === null ? (
          <div className="py-6">
            <div className="w-8 h-8 border-4 border-[#7F77DD] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-[80px] font-black text-[#7F77DD] leading-none tracking-tighter">
                {currentPts}
              </span>
            </div>
            <span className="text-base font-extrabold text-gray-400 mt-1 uppercase tracking-widest">WaitPoints</span>
            <span className="inline-block bg-[#22C55E]/10 text-[#22C55E] font-black text-sm px-4 py-1.5 rounded-[8px] mt-3">
              = ${(currentPts / 100).toFixed(2)} en descuentos
            </span>

            {/* Progress bar */}
            <div className="w-full mt-6 flex flex-col gap-2 relative z-10">
              <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Nivel actual</span>
                <span>Faltan {nextLevel - currentPts} WP</span>
              </div>
              <div className="w-full h-3 bg-[#F8F7FF] rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#7F77DD] to-[#9B8FE8] transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Cola en tiempo real */}
      <div className="bg-[#F8F7FF] border-l-4 border-[#7F77DD] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-4 relative overflow-hidden bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏥</span>
            <h3 className="font-bold text-[#1A1A2E] text-base">Tu turno en tiempo real</h3>
          </div>
          <button
            onClick={fetchQueue}
            disabled={queueLoading}
            className="text-xs bg-[#7F77DD]/10 text-[#7F77DD] font-bold px-3 py-1.5 rounded-[8px] active:scale-95 transition-transform"
          >
            {queueLoading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        {queueLoading && !queue ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-[#7F77DD] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : queue ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl opacity-80">👥</span>
              <div>
                <p className="text-[17px] font-black text-[#1A1A2E]">
                  {queue.patients_ahead} pacientes delante tuyo
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl opacity-80">⏱️</span>
                <div>
                  <p className="text-[17px] font-black text-[#1A1A2E]">
                    Demora est. {queue.estimated_wait_minutes} min
                  </p>
                </div>
              </div>
            </div>
            {queue.last_updated && (
              <div className="mt-1">
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-[6px] uppercase tracking-wide">
                  Actualizado {queue.last_updated}
                </span>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Catálogo de beneficios */}
      <div>
        <h3 className="font-bold text-[#1A1A2E] text-lg mb-1 px-1">Mis beneficios</h3>
        <p className="text-[13px] text-gray-500 mb-4 px-1">Canjeá tus WaitPoints en comercios adheridos.</p>

        {catalog.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-[#7F77DD] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {catalog.map((item) => {
              const staticRef = [{ emoji: "☕" }, { emoji: "💊" }, { emoji: "🧠", badge: "MÁS POPULAR" }, { emoji: "🩺" }];
              const itemIndex = item.id - 1;
              const emoji = item.emoji || staticRef[itemIndex]?.emoji || "🎁";
              const badge = item.badge || staticRef[itemIndex]?.badge;

              const canRedeem = currentPts >= item.points;
              const missing = item.points - currentPts;
              const isGenerating = generatingFor === item.id;
              const percent = Math.min(100, (currentPts / item.points) * 100);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-4 flex flex-col relative transition-all"
                >
                  {badge && (
                    <span className="absolute -top-2 -right-2 bg-[#22C55E] text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm z-10 uppercase tracking-widest ring-2 ring-white">
                      {badge}
                    </span>
                  )}
                  <span className="text-[48px] self-center mb-2">{emoji}</span>
                  <div className="text-center shrink-0 mb-3">
                    <p className="text-[13px] font-bold text-[#1A1A2E] leading-tight line-clamp-2 min-h-[30px]">{item.name}</p>
                    <p className={`text-[12px] font-black mt-1 ${canRedeem ? "text-[#7F77DD]" : "text-gray-400"}`}>
                      {item.points} WP
                    </p>
                  </div>

                  <div className="mt-auto">
                    {canRedeem ? (
                      <button
                        onClick={() => handleRedeem(item)}
                        disabled={isGenerating}
                        className="w-full py-2.5 rounded-[12px] bg-[#7F77DD] text-white font-bold text-xs active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-1 shadow-[0_2px_8px_rgba(127,119,221,0.4)]"
                      >
                        {isGenerating ? (
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : "Canjear"}
                      </button>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <div className="w-full h-[6px] bg-[#F8F7FF] rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-gray-300 transition-all duration-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 text-center font-bold">Faltan {missing} WP</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

// ── QR Modal ──────────────────────────────────────────────────────────────────
function QRRewardModal({ data, onClose }) {
  const expiryStr = data.expiresAt
    ? new Date(data.expiresAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
    : "60 días";

  const qrContent = data.validateUrl || data.qrCode;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mi WaitReward Beneficio",
          text: `Tengo un descuento de ${data.discountValue} con WaitReward! Entregale este código al comercio: ${data.qrCode}`,
        });
      } catch (err) { }
    } else {
      toast.success("Código copiado al portapapeles");
      navigator.clipboard.writeText(data.qrCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center font-sans" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" />
      <div
        className="relative w-full max-w-sm bg-white rounded-t-[24px] p-6 pb-10 flex flex-col items-center gap-5 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-1" />

        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl bg-[#F8F7FF] p-2 rounded-[16px]">{data.emoji}</span>
            <div>
              <h2 className="text-[17px] font-black text-[#1A1A2E] leading-tight">{data.name}</h2>
              <p className="text-[12px] font-bold text-[#22C55E] flex items-center gap-1">
                <span>⏱️</span> Válido por 60 días
              </p>
            </div>
          </div>
        </div>

        {/* QR container */}
        <div className="p-4 bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#F8F7FF] flex justify-center w-full">
          <QRCodeSVG value={qrContent} size={220} bgColor="#ffffff" fgColor="#1A1A2E" level="M" />
        </div>

        {/* Textual code */}
        <div className="bg-[#F8F7FF] rounded-[16px] px-6 py-3 w-full text-center border border-gray-100">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Tu código</p>
          <p className="font-mono text-xl text-[#1A1A2E] font-black tracking-[0.2em]">{data.qrCode}</p>
        </div>

        <div className="flex w-full gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-[16px] bg-[#F8F7FF] text-[#1A1A2E] font-bold text-[15px] active:scale-[0.98] transition-all"
          >
            Cerrar
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-4 rounded-[16px] bg-[#7F77DD] text-white font-bold text-[15px] active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(127,119,221,0.3)]"
          >
            Compartir
          </button>
        </div>
      </div>
    </div>
  );
}
