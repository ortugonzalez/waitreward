import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { settle, getAIPrediction } from "../api/client";
import { PointsBadge } from "../components/PointsBadge";

const HISTORY_KEY = "wr_clinic_history";
const MAX_HISTORY = 5;

const SPECIALISTS = [
  { id: "cardiologia", label: "Cardiología", icon: "❤️" },
  { id: "dermatologia", label: "Dermatología", icon: "🩺" },
  { id: "traumatologia", label: "Traumatología", icon: "🦴" },
  { id: "pediatria", label: "Pediatría", icon: "👶" },
  { id: "clinica_general", label: "Clínica general", icon: "🏥" },
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

export function ClinicView() {
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

  // Helper to resolve DNI when user leaves the input
  const handleDNIBlur = async () => {
    const dni = form.patientDNI.trim();
    if (!dni) {
      setPatientName(null);
      return;
    }

    setResolvingDNI(true);
    setPatientName(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/patients/${dni}`);
      const data = await res.json();
      if (data.success) {
        setPatientName(data.name);
      } else {
        setPatientName(null);
      }
    } catch (err) {
      console.error(err);
      setPatientName(null);
    } finally {
      setResolvingDNI(false);
    }
  };

  // ── Fetch AI prediction when specialist changes ─────────────────────────────
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
          console.error("[WaitReward] AI prediction error:", err);
          if (err.message?.includes("503") || err.message?.includes("no disponible") || err.message?.includes("Failed to fetch")) {
            setPredictionError("Módulo de IA no disponible en este momento.");
          } else {
            setPredictionError(err.message || "Error al obtener predicción");
          }
          setPredictionLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [selectedSpecialist]);

  // ── Submit appointment ──────────────────────────────────────────────────────
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
      // The backend /api/settle accepts "dni" and optionally patientWallet.
      // We pass dni. If the backend fails to connect to the smart contract it will throw an error.
      const data = await settle({
        appointmentId,
        dni: patientDNI,
        scheduledTimestamp: scheduled,
        actualTimestamp: actual,
      });

      // Include the resolved patient name in the result for UI feedback
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
        msg = "⚠️ No se puede conectar al servidor. Verificá que el backend esté corriendo.";
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4">
      {/* IA Prediction */}
      <div className="bg-white rounded-card shadow-sm p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <h2 className="font-bold text-ink text-base">Predicción de demora (IA)</h2>
        </div>
        <p className="text-xs text-gray-500">
          Seleccioná una especialidad para ver la demora estimada por nuestro modelo predictivo
        </p>

        <div className="grid grid-cols-3 gap-2">
          {SPECIALISTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSpecialist(prev => prev === s.id ? "" : s.id)}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-medium transition-all active:scale-95 ${selectedSpecialist === s.id
                ? "bg-primary text-white shadow-md"
                : "bg-surface text-gray-600 hover:bg-gray-100"
                }`}
            >
              <span className="text-lg">{s.icon}</span>
              <span className="truncate w-full text-center">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Prediction result */}
        {predictionLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500 ml-2">Analizando datos…</span>
          </div>
        )}

        {predictionError && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-start gap-2">
            <span className="text-orange-500 text-sm">⚠️</span>
            <p className="text-xs text-orange-700">{predictionError}</p>
          </div>
        )}

        {prediction && !predictionLoading && (
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Demora estimada</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-primary">
                    {prediction.predicted_delay_minutes ?? prediction.predicted_delay ?? "—"}
                  </span>
                  <span className="text-sm font-semibold text-gray-500">minutos</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Confianza</p>
                <span className="text-xl font-bold text-ink mt-1 block">
                  {Math.round((prediction.confidence ?? 0) * 100)}%
                </span>
              </div>
            </div>

            {/* Confidence bar */}
            <div>
              <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(prediction.confidence ?? 0) * 100}%` }}
                />
              </div>
            </div>

            {prediction.sample_size && (
              <p className="text-xs text-gray-500">
                Basado en <strong>{prediction.sample_size}</strong> turnos históricos ·{" "}
                {SPECIALISTS.find(s => s.id === selectedSpecialist)?.label ?? selectedSpecialist}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-sm p-5 flex flex-col gap-4">
        <h2 className="font-bold text-ink text-base">Registrar atención</h2>

        <Field label="Número de turno" htmlFor="appointmentId">
          <input
            id="appointmentId"
            name="appointmentId"
            type="text"
            placeholder="Ej: 001, 002, A-15..."
            value={form.appointmentId}
            onChange={handleChange}
            className={inputCls}
          />
          <p className="text-[10px] text-gray-400 mt-1">
            Este número identifica el turno del día. Lo generás vos en tu sistema actual.
          </p>
        </Field>

        <Field label="DNI o código de paciente" htmlFor="patientDNI">
          <div className="relative">
            <input
              id="patientDNI"
              name="patientDNI"
              type="text"
              placeholder="Ej: 12345678"
              value={form.patientDNI}
              onChange={handleChange}
              onBlur={handleDNIBlur}
              className={inputCls}
            />
            {resolvingDNI && (
              <div className="absolute right-3 top-3 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          {patientName && (
            <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
              <span>✅</span> {patientName}
            </p>
          )}
        </Field>

        <Field label="Hora programada del turno" htmlFor="scheduledDatetime">
          <input
            id="scheduledDatetime"
            name="scheduledDatetime"
            type="datetime-local"
            value={form.scheduledDatetime}
            onChange={handleChange}
            className={inputCls}
          />
        </Field>

        <Field label="Hora real de atención" htmlFor="actualDatetime">
          <input
            id="actualDatetime"
            name="actualDatetime"
            type="datetime-local"
            value={form.actualDatetime}
            onChange={handleChange}
            className={inputCls}
          />
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full bg-primary text-white font-bold text-base disabled:opacity-60 flex items-center justify-center gap-2 active:scale-95 transition-transform mt-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Registrando…
            </>
          ) : (
            "Registrar atención"
          )}
        </button>
      </form>

      {/* Resultado */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-card p-5 flex flex-col items-center gap-2 text-center">
          <span className="text-4xl mb-1">✅</span>
          <h3 className="font-bold text-green-800 text-lg">Turno registrado</h3>
          <p className="text-sm text-green-700">
            El paciente <strong>{result.patientName}</strong> recibió <strong>{parseFloat(result.pointsAwarded)} WaitPoints</strong>.
          </p>
        </div>
      )}

      {/* Historial */}
      {history.length > 0 && (
        <div className="bg-white rounded-card shadow-sm p-5">
          <h3 className="font-bold text-ink text-sm mb-3">Últimos registros</h3>
          <ul className="flex flex-col gap-2">
            {history.map((h, i) => (
              <li key={i} className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-ink">Turno: {h.id}</span>
                  <span className="text-xs text-gray-400">{h.time}</span>
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-xs text-gray-500 font-medium mb-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}
