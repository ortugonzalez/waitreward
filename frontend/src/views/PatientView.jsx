import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { getPoints, getPatientHistory } from "../api/client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function PatientView({ session, onLogout }) {
  const [points, setPoints] = useState(null);
  const [loadingPts, setLoadingPts] = useState(true);

  const [queue, setQueue] = useState(null);
  const [queueLoading, setQueueLoading] = useState(false);

  // ── History state ──────────────────────────────────────────────────────────
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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

  const fetchHistory = useCallback(async () => {
    if (!session?.wallet) return;
    setHistoryLoading(true);
    try {
      const data = await getPatientHistory(session.wallet.toLowerCase());
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [session?.wallet]);

  useEffect(() => {
    fetchPoints();
    fetchQueue();
    fetchHistory();
    const interval = setInterval(fetchPoints, 15_000);
    const queueInterval = setInterval(fetchQueue, 60_000);
    return () => {
      clearInterval(interval);
      clearInterval(queueInterval);
    };
  }, [fetchPoints, fetchQueue, fetchHistory]);

  const currentPts = points ?? 0;

  return (
    <div className="flex flex-col gap-6 px-4 bg-[#F8F7FF] min-h-screen text-[#1A1A2E] font-sans pb-8 max-w-full">

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
            <span className="text-base font-extrabold text-gray-400 mt-1 uppercase tracking-widest">Puntos HORMI</span>
            <span className="inline-block bg-[#22C55E]/10 text-[#22C55E] font-black text-sm px-4 py-1.5 rounded-[8px] mt-3">
              = ${(currentPts / 100).toFixed(2)} en descuentos
            </span>
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

      {/* Mi historial */}
      <div>
        <h3 className="font-bold text-[#1A1A2E] text-lg mb-1 px-1">Mi historial</h3>
        <p className="text-[13px] text-gray-500 mb-4 px-1">Turnos registrados en blockchain</p>

        {historyLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-[#7F77DD] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-5 text-center">
            <p className="text-sm text-gray-400">Sin turnos registrados aún</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((h, i) => {
              const severityColors = {
                on_time: "bg-[#22C55E]/10 text-[#22C55E]",
                minor: "bg-yellow-100 text-yellow-700",
                moderate: "bg-orange-100 text-orange-700",
                significant: "bg-red-100 text-red-600",
              };
              const severityLabels = {
                on_time: "Puntual", minor: "Leve", moderate: "Moderada", significant: "Severa",
              };
              const dateStr = h.createdAt
                ? new Date(h.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
                : "—";
              const snowtrace = h.txHash
                ? `https://testnet.snowtrace.io/tx/${h.txHash}`
                : null;

              return (
                <div key={i} className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-black text-[#1A1A2E]">{h.appointmentId}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${severityColors[h.severity] || "bg-gray-100 text-gray-500"}`}>
                        {severityLabels[h.severity] || h.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">{dateStr} · {h.delayMinutes} min demora</p>
                    {snowtrace && (
                      <a
                        href={snowtrace}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#7F77DD] font-bold mt-1 inline-block hover:underline"
                      >
                        Ver en Snowtrace →
                      </a>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[17px] font-black text-[#7F77DD]">+{h.pointsAwarded}</span>
                    <p className="text-[10px] text-gray-400 font-bold">WP</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Nuestro Impacto */}
      <div className="mt-6 pt-6 border-t border-gray-200 animate-fade-in">
        <h3 className="font-black text-gray-400 text-[11px] uppercase tracking-widest mb-4 px-2 text-center">Nuestro Impacto Global</h3>
        
        <div className="grid grid-cols-2 gap-3 text-center opacity-80 pointer-events-none">
          <div className="bg-white rounded-[16px] p-4 flex flex-col items-center shadow-sm border border-gray-100">
            <span className="text-2xl mb-1">💸</span>
            <p className="font-black text-[#7F77DD] text-lg">42.350</p>
            <p className="text-[10px] text-[#1A1A2E] font-bold uppercase tracking-widest mt-1">WP entregados</p>
          </div>
          
          <div className="bg-white rounded-[16px] p-4 flex flex-col items-center shadow-sm border border-gray-100">
            <span className="text-2xl mb-1">🏥</span>
            <p className="font-black text-[#7F77DD] text-lg">847</p>
            <p className="text-[10px] text-[#1A1A2E] font-bold uppercase tracking-widest mt-1">Turnos</p>
          </div>
          
          <div className="bg-white rounded-[16px] p-4 flex flex-col items-center shadow-sm border border-gray-100 col-span-2">
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-1">💊</span>
              <div className="flex items-baseline gap-1">
                <p className="font-black text-[#7F77DD] text-2xl">156</p>
              </div>
              <p className="text-[11px] text-[#1A1A2E] font-bold uppercase tracking-widest mt-1">Canjes realizados</p>
            </div>
          </div>
        </div>
        
        <p className="text-center text-[13px] font-medium text-gray-400 mt-6 mb-2">
          ❤️ Tu tiempo vale. Ahora lo demostramos.
        </p>
      </div>

    </div>
  );
}
