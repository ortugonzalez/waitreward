import { useState } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const ROLES = [
  { id: "patient",  icon: "🧑‍⚕️", label: "Soy paciente",  hint: "Ingresá tu DNI",               placeholder: "Ej: 12345678" },
  { id: "clinic",   icon: "👨‍⚕️", label: "Soy médico",    hint: "Ingresá tu matrícula (DNI)",    placeholder: "Ej: 99887766" },
  { id: "commerce", icon: "🏪",   label: "Soy comercio",  hint: "Ingresá tu código de comercio", placeholder: "Ej: 55443322" },
];

export function LoginView({ onLogin, onBack }) {
  const [step, setStep] = useState(1);          // 1 = elegir rol, 2 = ingresar DNI
  const [selectedRole, setSelectedRole] = useState(null);
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep(2);
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!dni.trim()) return setError("Ingresá tu DNI");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: dni.trim() }),
      });
      const data = await res.json();

      if (!data.success) {
        setError("DNI no encontrado. Verificá el número e intentá de nuevo.");
        return;
      }

      // Guardar sesión en localStorage
      const session = {
        name:   data.user.name,
        role:   data.user.role,
        dni:    data.user.dni,
        wallet: data.user.wallet,
        token:  data.token,
      };
      localStorage.setItem("wr_session", JSON.stringify(session));
      toast.success(`¡Bienvenido/a, ${data.user.name}!`);
      onLogin(session);
    } catch (err) {
      setError("Error de conexión. Verificá que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  const role = ROLES.find((r) => r.id === selectedRole);

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-primary text-white pt-10 pb-14 px-6 rounded-b-[40px]">
        <button
          onClick={step === 2 ? () => setStep(1) : onBack}
          className="text-white/70 text-sm mb-4 flex items-center gap-1 active:opacity-70"
        >
          ← {step === 2 ? "Cambiar rol" : "Volver"}
        </button>
        <h1 className="text-2xl font-black">
          {step === 1 ? "¿Quién sos?" : `Ingresar como ${role?.label.split(" ")[1]}`}
        </h1>
        <p className="text-sm opacity-80 mt-1">
          {step === 1
            ? "Elegí tu tipo de cuenta para continuar"
            : role?.hint}
        </p>
      </div>

      <div className="px-4 -mt-6 flex flex-col gap-4">
        {/* PASO 1: Seleccionar rol */}
        {step === 1 && (
          <div className="bg-white rounded-card shadow-sm p-5 flex flex-col gap-3">
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRoleSelect(r.id)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-surface hover:bg-primary/5 active:scale-[0.98] transition-all text-left"
              >
                <span className="text-4xl w-12 text-center">{r.icon}</span>
                <div>
                  <p className="font-bold text-ink text-base">{r.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.hint}</p>
                </div>
                <span className="ml-auto text-gray-300 text-lg">›</span>
              </button>
            ))}
          </div>
        )}

        {/* PASO 2: Ingresar DNI */}
        {step === 2 && role && (
          <form onSubmit={handleLogin} className="bg-white rounded-card shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
              <span className="text-3xl">{role.icon}</span>
              <span className="font-bold text-ink">{role.label}</span>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">{role.hint}</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder={role.placeholder}
                value={dni}
                onChange={(e) => { setDni(e.target.value); setError(""); }}
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ink text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 tracking-widest"
              />
              {error && (
                <p className="text-xs text-red-500 font-medium mt-2 flex items-center gap-1">
                  <span>✗</span> {error}
                </p>
              )}
            </div>

            {/* DNIs de prueba */}
            <div className="bg-surface rounded-xl p-3">
              <p className="text-[10px] text-gray-400 font-medium mb-2">DNIs de prueba:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { dni: "12345678", label: "María G. (paciente)" },
                  { dni: "87654321", label: "Juan P. (paciente)" },
                  { dni: "99887766", label: "Dr. López (médico)" },
                  { dni: "55443322", label: "Farmacia (comercio)" },
                ].map((d) => (
                  <button
                    key={d.dni}
                    type="button"
                    onClick={() => setDni(d.dni)}
                    className="text-[10px] bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-500 active:bg-primary/10 active:text-primary transition-colors"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !dni.trim()}
              className="w-full py-4 rounded-full bg-primary text-white font-bold text-base disabled:opacity-60 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verificando…
                </>
              ) : (
                "Ingresar →"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
