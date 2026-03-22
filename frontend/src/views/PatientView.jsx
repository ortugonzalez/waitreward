import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { getPoints, getPatientHistory } from "../api/client";
import { useTranslation } from "../i18n";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function PatientView({ session, onLogout }) {
  const { t } = useTranslation();
  const [points, setPoints] = useState(null);
  const [loadingPts, setLoadingPts] = useState(true);

  const [queue, setQueue] = useState(null);
  const [queueLoading, setQueueLoading] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── Push notifications ───────────────────────────────────────────────────────
  const [notifState, setNotifState] = useState("idle"); // idle | pending | granted | denied

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

  const subscribeToNotifications = async () => {
    try {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        alert("Tu navegador no soporta notificaciones push.");
        return;
      }

      // 1. Pedir permiso
      const permission = await Notification.requestPermission();
      console.log("Push permission:", permission);
      if (permission !== "granted") {
        setNotifState("denied");
        return;
      }
      setNotifState("pending");

      // 2. Obtener VAPID key — backend devuelve { key: "..." }
      const vapidRes = await fetch(`${API_URL}/api/push/vapid-public-key`);
      const { key: vapidKey } = await vapidRes.json();
      console.log("VAPID key:", vapidKey?.substring(0, 20) + "...");

      // 3. Convertir base64url → Uint8Array
      const urlBase64ToUint8Array = (base64String) => {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; i++) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      // 4. Registrar con el SW
      const registration = await navigator.serviceWorker.ready;
      console.log("SW scope:", registration.scope);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      console.log("Endpoint:", subscription.endpoint?.substring(0, 50) + "...");

      // 5. Guardar en backend — espera { wallet, subscription }
      const res = await fetch(`${API_URL}/api/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: session.wallet, subscription }),
      });
      const data = await res.json();
      console.log("Subscribe response:", data);

      if (data.success) {
        setNotifState("granted");
        toast.success("🔔 ¡Notificaciones activadas!");
      } else {
        throw new Error(data.error || "Error al guardar suscripción");
      }
    } catch (err) {
      console.error("Push subscribe error:", err);
      setNotifState("idle");
      alert(`Error push: ${err.message}`);
    }
  };

  // Al montar: sincronizar estado con el permiso actual del browser
  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") setNotifState("granted");
    else if (Notification.permission === "denied") setNotifState("denied");
  }, []);

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

  return (
    <div className="flex flex-col gap-6 px-4 bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)] font-sans pb-8 max-w-full transition-colors">

      <div className="flex items-center justify-between pt-4">
        {/* FIX 5: No back arrow, solely Hello Message */}
        <h1 className="text-2xl font-black text-[var(--text-primary)]">{t('hello')}, {session?.name?.split(' ')[0]} 👋</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPoints}
            disabled={loadingPts}
            className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#7F77DD] active:scale-95 transition-transform disabled:opacity-40"
            title={t('update')}
          >
            <span className={`text-base font-bold ${loadingPts ? "animate-spin" : ""}`}>↻</span>
          </button>
        </div>
      </div>

      {/* Botón activar notificaciones */}
      {notifState !== "granted" && notifState !== "denied" && (
        <button
          onClick={subscribeToNotifications}
          disabled={notifState === "pending"}
          className="w-full flex items-center justify-center gap-2 bg-[#7F77DD] text-white font-bold text-sm py-3 rounded-[14px] shadow-[0_4px_16px_rgba(127,119,221,0.35)] active:scale-95 transition-all disabled:opacity-60"
        >
          {notifState === "pending" ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Activando...</>
          ) : (
            <>🔔 Activar notificaciones</>
          )}
        </button>
      )}
      {notifState === "denied" && (
        <div className="w-full flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-[14px] px-4 py-3">
          <span className="text-lg">🔕</span>
          <p className="text-xs text-orange-700 font-bold">Notificaciones bloqueadas. Habilitálas desde la configuración del navegador.</p>
        </div>
      )}

      {/* Cola en tiempo real */}
      <div className="bg-[var(--bg-secondary)] border-l-4 border-[#7F77DD] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-4 relative overflow-hidden transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏥</span>
            <h3 className="font-bold text-[var(--text-primary)] text-base">{t('realTimeQueue')}</h3>
          </div>
          <button
            onClick={fetchQueue}
            disabled={queueLoading}
            className="text-xs bg-[#7F77DD]/10 text-[#7F77DD] font-bold px-3 py-1.5 rounded-[8px] active:scale-95 transition-transform"
          >
            {queueLoading ? "..." : t('update')}
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
                <p className="text-[17px] font-black text-[var(--text-primary)]">
                  {queue.patients_ahead} {t('patientsAhead')}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl opacity-80">⏱️</span>
                <div>
                  <p className="text-[17px] font-black text-[var(--text-primary)]">
                    {t('estimatedDelay')} {queue.estimated_wait_minutes} min
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Mi historial */}
      <div>
        <h3 className="font-bold text-[var(--text-primary)] text-lg mb-4 px-1">{t('appointmentHistory')}</h3>
        {/* FIX 2: Blockchain phrase removed completely */}

        {historyLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-[#7F77DD] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[16px] p-5 text-center transition-colors">
            <p className="text-sm text-[var(--text-secondary)]">Sin turnos registrados aún</p>
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

              return (
                <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[16px] p-4 flex items-center gap-3 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {/* FIX 2: Standard Appointment name, severity, date without Hash */}
                      <span className="text-[13px] font-black text-[var(--text-primary)]">TURNO-{h.appointmentId}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${severityColors[h.severity] || "bg-gray-100 text-[var(--text-secondary)]"}`}>
                        {severityLabels[h.severity] || h.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">{dateStr} · {h.delayMinutes} {t('delayMinutes')}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[17px] font-black text-[#7F77DD]">+{h.pointsAwarded}</span>
                    <p className="text-[10px] text-[var(--text-secondary)] font-bold">WP</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Nuestro Impacto */}
      <div className="mt-6 pt-6 border-t border-[var(--border)] animate-fade-in">
        <h3 className="font-black text-[var(--text-secondary)] text-[11px] uppercase tracking-widest mb-4 px-2 text-center">{t('ourImpact')}</h3>
        
        <div className="grid grid-cols-2 gap-3 text-center opacity-80 pointer-events-none">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[16px] p-4 flex flex-col items-center shadow-sm transition-colors">
            <span className="text-2xl mb-1">💸</span>
            <p className="font-black text-[#7F77DD] text-lg">42.350</p>
            <p className="text-[10px] text-[var(--text-primary)] font-bold uppercase tracking-widest mt-1">{t('pointsDelivered')}</p>
          </div>
          
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[16px] p-4 flex flex-col items-center shadow-sm transition-colors">
            <span className="text-2xl mb-1">🏥</span>
            <p className="font-black text-[#7F77DD] text-lg">847</p>
            <p className="text-[10px] text-[var(--text-primary)] font-bold uppercase tracking-widest mt-1">{t('appointmentsRegistered')}</p>
          </div>
          
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[16px] p-4 flex flex-col items-center shadow-sm col-span-2 transition-colors">
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-1">💊</span>
              <div className="flex items-baseline gap-1">
                <p className="font-black text-[#7F77DD] text-2xl">156</p>
              </div>
              <p className="text-[11px] text-[var(--text-primary)] font-bold uppercase tracking-widest mt-1">{t('redemptionsMade')}</p>
            </div>
          </div>
        </div>
        
        <p className="text-center text-[13px] font-medium text-[var(--text-secondary)] mt-6 mb-2">
          ❤️ {t('tagline')}
        </p>
      </div>

    </div>
  );
}
