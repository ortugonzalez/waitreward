import { useState } from "react";
import toast from "react-hot-toast";
import { settle } from "../api/client";
import { PointsBadge } from "../components/PointsBadge";

const HISTORY_KEY = "wr_clinic_history";
const MAX_HISTORY  = 5;

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

function toLocalDateTimeValue(date = new Date()) {
  // Formato: "YYYY-MM-DDTHH:mm" para input datetime-local
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ClinicView() {
  const [form, setForm] = useState({
    appointmentId:      "",
    patientWallet:      "",
    scheduledDatetime:  toLocalDateTimeValue(),
    actualDatetime:     toLocalDateTimeValue(),
  });
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [history,  setHistory]  = useState(loadHistory);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { appointmentId, patientWallet, scheduledDatetime, actualDatetime } = form;

    if (!appointmentId.trim()) return toast.error("Ingresá el ID del turno");
    if (!patientWallet.trim()) return toast.error("Ingresá la wallet del paciente");
    if (!scheduledDatetime)    return toast.error("Ingresá la hora programada");
    if (!actualDatetime)       return toast.error("Ingresá la hora real de atención");

    const scheduled = Math.floor(new Date(scheduledDatetime).getTime() / 1000);
    const actual    = Math.floor(new Date(actualDatetime).getTime()    / 1000);

    if (actual < scheduled) {
      return toast.error("La hora real no puede ser anterior a la programada");
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await settle({
        appointmentId,
        patientWallet,
        scheduledTimestamp: scheduled,
        actualTimestamp:    actual,
      });

      setResult(data);
      toast.success("Turno registrado exitosamente");

      // Guardar en historial
      const entry = {
        id:           appointmentId,
        delayMinutes: data.delayMinutes,
        points:       Number(data.pointsAwarded),
        txHash:       data.txHash,
        time:         new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      };
      const updated = [entry, ...history].slice(0, MAX_HISTORY);
      setHistory(updated);
      saveHistory(updated);

      // Resetear formulario
      setForm((f) => ({ ...f, appointmentId: "", patientWallet: "" }));
    } catch (err) {
      toast.error(err.message || "Error al registrar el turno");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4">
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-sm p-5 flex flex-col gap-4">
        <h2 className="font-bold text-ink text-base">Registrar atención</h2>

        <Field label="ID del turno" htmlFor="appointmentId">
          <input
            id="appointmentId"
            name="appointmentId"
            type="text"
            placeholder="Ej: TURNO-2024-001"
            value={form.appointmentId}
            onChange={handleChange}
            className={inputCls}
          />
        </Field>

        <Field label="Wallet del paciente" htmlFor="patientWallet">
          <input
            id="patientWallet"
            name="patientWallet"
            type="text"
            placeholder="0x..."
            value={form.patientWallet}
            onChange={handleChange}
            className={inputCls}
          />
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
          className="w-full py-4 rounded-full bg-primary text-white font-bold text-base disabled:opacity-60 flex items-center justify-center gap-2 active:scale-95 transition-transform"
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
        <div className="bg-white rounded-card shadow-sm p-5 flex flex-col items-center gap-3">
          <span className="text-4xl">✅</span>
          <h3 className="font-bold text-ink text-lg">Turno registrado</h3>

          <div className="flex flex-col items-center gap-1">
            <span className="text-sm text-gray-500">
              Demora: <strong>{result.delayMinutes} minutos</strong>
            </span>
            <span className="text-5xl font-black text-primary">
              {result.pointsAwarded}
            </span>
            <span className="text-sm font-semibold text-gray-500">WaitPoints emitidos</span>
          </div>

          <a
            href={`https://testnet.snowtrace.io/tx/${result.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary underline font-mono"
          >
            {result.txHash.slice(0, 10)}…{result.txHash.slice(-8)} ↗
          </a>
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
                  <span className="text-sm font-medium text-ink">{h.id}</span>
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
