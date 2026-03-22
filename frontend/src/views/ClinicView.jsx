import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { settle, getAIPrediction, verifyContract, downloadReport } from "../api/client";
import { PointsBadge } from "../components/PointsBadge";
import { useTranslation } from "../i18n";

const HISTORY_KEY = "wr_clinic_history";
const MAX_HISTORY = 5;

const SPECIALISTS = [
  { id: "cardiologia", label: "Cardiología", icon: "❤️" },
  { id: "dermatologia", label: "Dermatología", icon: "🩺" },
  { id: "traumatologia", label: "Traumatología", icon: "🦴" },
  { id: "pediatria", label: "Pediatría", icon: "👶" },
  { id: "clinica_general", label: "General", icon: "🏥" },
  { id: "oftalmologia", label: "Oftalmología", icon: "👁️" },
];

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

function toLocalDateTimeValue(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ClinicView({ session, onLogout }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    appointmentId: "",
    patientDNI: "",
    scheduledDatetime: toLocalDateTimeValue(),
    actualDatetime: toLocalDateTimeValue(),
  });

  const [patientName, setPatientName] = useState(null);
  const [resolvingDNI, setResolvingDNI] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(loadHistory);

  // IA Prediction state
  const [selectedSpecialist, setSelectedSpecialist] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(null);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleDNIBlur = async () => {
    const dni = form.patientDNI.trim();
    if (!dni) {
      setPatientName(null);
      return;
    }

    setResolvingDNI(true);
    setPatientName(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/patients/${dni}`);
      const data = await res.json();
      if (data.success) {
        setPatientName(data.name);
      } else {
        setPatientName(null);
      }
    } catch (err) {
      setPatientName(null);
    } finally {
      setResolvingDNI(false);
    }
  };

  useEffect(() => {
    if (!selectedSpecialist) {
      setPrediction(null);
      setPredictionError(null);
      return;
    }

    let cancelled = false;
    setPredictionLoading(true);
    setPrediction(null);
    setPredictionError(null);

    getAIPrediction("clinica-demo", selectedSpecialist)
      .then((data) => {
        if (!cancelled) {
          setPrediction(data);
          setPredictionLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err.message?.includes("503") || err.message?.includes("no disponible") || err.message?.includes("Failed to fetch")) {
            setPredictionError("Módulo de IA no disponible en este momento.");
          } else {
            setPredictionError(err.message || t('connectionError'));
          }
          setPredictionLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [selectedSpecialist, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { appointmentId, patientDNI, scheduledDatetime, actualDatetime } = form;

    if (!appointmentId.trim()) return toast.error("Ingresá el número del turno");
    if (!patientDNI.trim()) return toast.error("Ingresá el DNI del paciente");
    if (!scheduledDatetime) return toast.error("Ingresá la hora programada");
    if (!actualDatetime) return toast.error("Ingresá la hora real de atención");

    const scheduled = Math.floor(new Date(scheduledDatetime).getTime() / 1000);
    const actual = Math.floor(new Date(actualDatetime).getTime() / 1000);

    if (actual < scheduled) {
      return toast.error("La hora real no puede ser anterior a la programada");
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await settle({
        appointmentId,
        dni: patientDNI,
        scheduledTimestamp: scheduled,
        actualTimestamp: actual,
      });

      data.patientName = patientName || `Paciente (${patientDNI})`;

      setResult(data);
      toast.success("Turno registrado exitosamente");

      const entry = {
        id: appointmentId,
        delayMinutes: data.delayMinutes,
        points: Number(data.pointsAwarded),
        txHash: data.txHash,
        time: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      };
      const updated = [entry, ...history].slice(0, MAX_HISTORY);
      setHistory(updated);
      saveHistory(updated);

      setForm((f) => ({ ...f, appointmentId: "", patientDNI: "" }));
      setPatientName(null);
    } catch (err) {
      let msg = err.message || "Error al registrar el turno";
      if (msg.includes("Failed to fetch")) {
        msg = "⚠️ " + t('connectionError');
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getDocName = () => {
    if (!session?.name) return "Doc";
    return session.name.includes("Dr") ? session.name : `Dr. ${session.name.split(' ')[0]}`;
  };

  return (
    <div className="flex flex-col gap-6 px-4 bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)] font-sans pb-8 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <h1 className="text-2xl font-black text-[var(--text-primary)]">Hola, {getDocName()} 👋</h1>
      </div>

      {/* IA Prediction */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <h2 className="font-bold text-[var(--text-primary)] text-base">{t('delayPrediction')}</h2>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-1">
          {SPECIALISTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSpecialist(prev => prev === s.id ? "" : s.id)}
              className={`flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-[12px] text-[11px] font-bold transition-all active:scale-95 border ${selectedSpecialist === s.id
                  ? "bg-[#7F77DD] text-white border-[#7F77DD] shadow-[0_4px_12px_rgba(127,119,221,0.3)]"
                  : "bg-[var(--bg-primary)] text-[var(--text-primary)] border-[var(--border)] hover:border-[#7F77DD]/30"
                }`}
            >
              <span className="text-2xl">{s.icon}</span>
              <span className="truncate w-full text-center px-1">{s.label}</span>
            </button>
          ))}
        </div>

        {predictionLoading && (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <div className="w-8 h-8 border-4 border-[#7F77DD] border-t-transparent rounded-full animate-spin" />
            <span className="text-[13px] font-bold text-[#7F77DD]">Cargando...</span>
          </div>
        )}

        {predictionError && (
          <div className="bg-red-50 border border-red-100 rounded-[12px] p-3 flex items-start gap-2 mt-2">
            <span className="text-red-500 text-sm">⚠️</span>
            <p className="text-[12px] font-semibold text-red-700">{predictionError}</p>
          </div>
        )}

        {prediction && !predictionLoading && (
          <div className="bg-gradient-to-br from-[#7F77DD]/5 to-[#9B8FE8]/15 rounded-[16px] p-5 flex flex-col gap-4 border border-[#7F77DD]/10 mt-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-2 rounded-[12px] shadow-sm">
                  <span className="text-2xl block">⏱️</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#7F77DD] uppercase tracking-widest">{t('estimatedWait')}</p>
                  <p className="text-[32px] font-black text-[var(--text-primary)] leading-none mt-1">
                    {prediction.predicted_delay_minutes ?? prediction.predicted_delay ?? "—"} <span className="text-sm text-[var(--text-secondary)] font-bold">min</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{t('patientsAhead')}</p>
                <div className="flex items-center justify-end gap-1 mt-1 text-[var(--text-primary)] font-black text-xl">
                  <span>👥</span> {prediction.patients_ahead ?? "—"}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 relative z-10">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-[#22C55E]">{t('confidence')}</span>
                <span className="text-[var(--text-secondary)]">{Math.round((prediction.confidence ?? 0) * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-black/10 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#22C55E] to-[#4ADE80] rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(prediction.confidence ?? 0) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Panel */}
      <AnalyticsPanel t={t} />

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-4 transition-colors">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">📝</span>
          <h2 className="font-bold text-[var(--text-primary)] text-base">{t('registerAttention')}</h2>
        </div>

        <Field label={t('appointmentNumber')} htmlFor="appointmentId">
          <input
            id="appointmentId"
            name="appointmentId"
            type="text"
            placeholder="Ej: A-15"
            value={form.appointmentId}
            onChange={handleChange}
            className="w-full bg-[var(--bg-primary)] border border-[var(--input-border)] text-[var(--text-primary)] rounded-[12px] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD] transition-all"
          />
        </Field>

        <Field label={t('patientId')} htmlFor="patientDNI">
          <div className="relative">
            <input
              id="patientDNI"
              name="patientDNI"
              type="text"
              placeholder="Ej: 12345678"
              value={form.patientDNI}
              onChange={handleChange}
              onBlur={handleDNIBlur}
              className="w-full bg-[var(--bg-primary)] border border-[var(--input-border)] text-[var(--text-primary)] rounded-[12px] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD] transition-all"
            />
            {resolvingDNI && (
              <div className="absolute right-3 top-3 w-4 h-4 border-2 border-[#7F77DD] border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          {patientName && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-[#22C55E]/10 px-3 py-1.5 rounded-[8px]">
              <span className="text-[12px]">✅</span>
              <span className="text-[12px] font-bold text-[#22C55E]">{patientName}</span>
            </div>
          )}
        </Field>

        <div className="flex gap-3">
          <Field label={t('scheduledTime')} htmlFor="scheduledDatetime" className="flex-1">
            <input
              id="scheduledDatetime"
              name="scheduledDatetime"
              type="time"
              value={form.scheduledDatetime.split('T')[1]?.substring(0, 5) || "09:00"}
              onChange={(e) => {
                const datePart = form.scheduledDatetime.split('T')[0];
                setForm(f => ({ ...f, scheduledDatetime: `${datePart}T${e.target.value}` }));
              }}
              className="w-full bg-[var(--bg-primary)] border border-[var(--input-border)] text-[var(--text-primary)] rounded-[12px] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD] transition-all"
            />
          </Field>
          <Field label={t('actualTime')} htmlFor="actualDatetime" className="flex-1">
            <input
              id="actualDatetime"
              name="actualDatetime"
              type="time" 
              value={form.actualDatetime.split('T')[1]?.substring(0, 5) || "09:15"}
              onChange={(e) => {
                const datePart = form.actualDatetime.split('T')[0];
                setForm(f => ({ ...f, actualDatetime: `${datePart}T${e.target.value}` }));
              }}
              className="w-full bg-[var(--bg-primary)] border border-[var(--input-border)] text-[var(--text-primary)] rounded-[12px] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD] transition-all"
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 rounded-[12px] bg-[#7F77DD] text-white font-bold text-[15px] disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(127,119,221,0.3)]"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            t('register')
          )}
        </button>
      </form>

      {/* Resultado */}
      {result && (
        <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-[16px] p-5 flex flex-col items-center gap-2 text-center animate-fade-in">
          <span className="text-4xl mb-1">🎉</span>
          <h3 className="font-black text-[#22C55E] text-lg">Turno registrado</h3>
          <p className="text-[13px] font-medium text-[var(--text-primary)]">
            {result.patientName} sumó <span className="font-black text-[#7F77DD]">{parseFloat(result.pointsAwarded)} {t('points')}</span>.
          </p>
        </div>
      )}

      {/* Historial */}
      {history.length > 0 && (
        <div className="bg-transparent mb-4">
          <ul className="flex flex-col gap-2">
            {history.map((h, i) => (
              <li key={i} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[12px] p-3 flex items-center justify-between shadow-sm transition-colors">
                <div className="flex flex-col">
                  <span className="text-[14px] font-black text-[var(--text-primary)]">Turno {h.id}</span>
                  <span className="text-[11px] font-bold text-[var(--text-secondary)]">{h.time}</span>
                </div>
                <PointsBadge points={h.points} delayMinutes={h.delayMinutes} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AnalyticsPanel({ t }) {
  const [data, setData] = useState({
    metrics: { turnos: 847, promedio: 28, puntual: 23, wp: 42350 },
    hourly: [10, 20, 45, 30, 15, 5, 25, 40],
    recent: [
      { id: "A-15", delay: 45 },
      { id: "A-14", delay: 10 },
      { id: "A-13", delay: 0 },
    ]
  });
  const [contractInfo, setContractInfo] = useState(null);
  const [contractLoading, setContractLoading] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/analytics/clinic`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .catch(() => { });
  }, []);

  const handleVerifyContract = async () => {
    setContractLoading(true);
    try {
      const info = await verifyContract();
      setContractInfo(info);
    } catch {
      setContractInfo({ success: false, error: "Conexión a testnet rechazada." });
    } finally {
      setContractLoading(false);
    }
  };

  const maxVal = Math.max(...data.hourly);

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-5 transition-colors">
      <div className="flex items-center gap-2">
        <span className="text-xl">📊</span>
        <h2 className="font-bold text-[var(--text-primary)] text-base">{t('analyticsTitle')}</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--bg-primary)] rounded-[12px] p-3 border border-[#7F77DD]/10">
          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Turnos mes</p>
          <p className="text-xl font-black text-[var(--text-primary)] mt-1">{data.metrics.turnos}</p>
        </div>
        <div className="bg-[var(--bg-primary)] rounded-[12px] p-3 border border-[#7F77DD]/10">
          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Promedio</p>
          <p className="text-xl font-black text-[var(--text-primary)] mt-1">{data.metrics.promedio} <span className="text-xs">min</span></p>
        </div>
        <div className="bg-[#22C55E]/5 rounded-[12px] p-3 border border-[#22C55E]/20">
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">% Puntual</p>
          <p className="text-xl font-black text-[#22C55E] mt-1">{data.metrics.puntual}%</p>
        </div>
        <div className="bg-[#7F77DD]/5 rounded-[12px] p-3 border border-[#7F77DD]/20">
          <p className="text-[10px] font-bold text-[#7F77DD] uppercase tracking-widest">WP Emitidos</p>
          <p className="text-xl font-black text-[#7F77DD] mt-1">{data.metrics.wp.toLocaleString('es-AR')}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-1">
        <button
          onClick={downloadReport}
          className="flex-1 py-2.5 rounded-[12px] bg-[#7F77DD] text-white font-bold text-xs active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(127,119,221,0.3)]"
        >
          📄 {t('downloadPDF')}
        </button>
        <button
          onClick={handleVerifyContract}
          disabled={contractLoading}
          className="flex-1 py-2.5 rounded-[12px] bg-[var(--bg-primary)] border border-[#7F77DD]/20 text-[#7F77DD] font-bold text-xs active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-1.5"
        >
          {contractLoading ? (
            <span className="w-3 h-3 border-2 border-[#7F77DD] border-t-transparent rounded-full animate-spin" />
          ) : "⬡ " + t('contractStatus')}
        </button>
      </div>

      {contractInfo && (
        <div className={`rounded-[12px] p-4 flex flex-col gap-2 border text-[12px] ${
          contractInfo.success
            ? "bg-[#22C55E]/5 border-[#22C55E]/20"
            : "bg-red-50 border-red-100"
        }`}>
          {contractInfo.success ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#22C55E] font-black text-sm">✅ Contrato activo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Token</span>
                <span className="font-bold text-[var(--text-primary)]">{contractInfo.contract?.name} ({contractInfo.contract?.symbol})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Total supply</span>
                <span className="font-bold text-[#7F77DD]">{contractInfo.contract?.totalSupplyFormatted} HRM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Red</span>
                <span className="font-bold text-[var(--text-primary)]">{contractInfo.contract?.network} · #{contractInfo.contract?.blockNumber?.toLocaleString("es-AR")}</span>
              </div>
              <a
                href={contractInfo.contract?.snowtrace}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7F77DD] font-bold text-[11px] mt-1 hover:underline"
              >
                Ver en Snowtrace →
              </a>
            </>
          ) : (
            <p className="text-red-600 font-semibold">{contractInfo.error}</p>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, htmlFor, children, className = "" }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="text-[11px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-1.5 block px-1">
        {label}
      </label>
      {children}
    </div>
  );
}
