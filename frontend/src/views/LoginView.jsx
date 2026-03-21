import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const ROLES = [
  { id: "patient", icon: "🧑‍⚕️", label: "Soy paciente", hint: "Ingresá tu DNI personal", colorClass: "bg-[#7F77DD]/10 text-[#7F77DD] border-[#7F77DD]/20" },
  { id: "clinic", icon: "👨‍⚕️", label: "Soy médico", hint: "Ingresá tu matrícula (DNI)", colorClass: "bg-blue-50 border-blue-100 text-blue-600" },
  { id: "commerce", icon: "🏪", label: "Soy comercio", hint: "Ingresá código de sucursal", colorClass: "bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]" },
];

export function LoginView({ onLogin, onBack }) {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    if (step === 2 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep(2);
    setError("");
    setDni("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!dni.trim()) return setError("Por favor, ingresá tu número completo.");
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
        name: data.user.name,
        role: data.user.role,
        dni: data.user.dni,
        wallet: data.user.wallet,
        token: data.token,
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
    <div className="flex flex-col min-h-screen bg-[#F8F7FF] font-sans">
      {/* Header */}
      <div className="bg-[#7F77DD] text-white pt-10 pb-16 px-6 rounded-b-[40px] shadow-[0_4px_24px_rgba(127,119,221,0.3)] relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 -left-10 w-32 h-32 bg-[#9B8FE8]/50 rounded-full blur-2xl" />

        <div className="relative z-10">
          <button
            onClick={step === 2 ? () => setStep(1) : onBack}
            className="text-white/80 font-bold text-[13px] mb-6 flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            ← {step === 2 ? "Cambiar rol" : "Volver"}
          </button>
          <h1 className="text-[32px] leading-tight font-black tracking-tight">
            {step === 1 ? "¿Quién sos?" : role?.label}
          </h1>
          <p className="text-[15px] font-medium opacity-90 mt-2">
            {step === 1
              ? "Para comenzar, elegí cómo vas a usar WaitReward."
              : "Ingresá tus datos para acceder a tu panel."}
          </p>
        </div>
      </div>

      <div className="px-5 -mt-8 flex flex-col gap-4 relative z-20 pb-10">
        {/* PASO 1: Seleccionar rol */}
        {step === 1 && (
          <div className="flex flex-col gap-3">
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRoleSelect(r.id)}
                className={`flex items-center gap-4 p-5 rounded-[20px] bg-white border-2 border-transparent hover:border-[#7F77DD]/30 active:scale-[0.98] transition-all text-left shadow-[0_4px_16px_rgba(0,0,0,0.04)]`}
              >
                <div className={`w-14 h-14 rounded-[16px] flex items-center justify-center text-3xl shrink-0 border ${r.colorClass}`}>
                  {r.icon}
                </div>
                <div className="flex-1">
                  <p className="font-black text-[#1A1A2E] text-[17px]">{r.label}</p>
                  <p className="text-[13px] text-gray-500 font-medium mt-0.5">{r.hint}</p>
                </div>
                <span className="text-[#7F77DD] text-xl font-bold opacity-50">›</span>
              </button>
            ))}
          </div>
        )}

        {/* PASO 2: Ingresar DNI */}
        {step === 2 && role && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4 animate-fade-in">
            {/* Selected Role Card Header */}
            <div className="bg-white rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.06)] p-6 border-2 border-[#7F77DD]">
              <div className="flex flex-col items-center gap-2 mb-6 text-center">
                <span className="text-5xl">{role.icon}</span>
                <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mt-2">{role.hint}</p>
              </div>

              <div>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  placeholder="12345678"
                  value={dni}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                    setDni(val);
                    setError("");
                  }}
                  className="w-full bg-[#F8F7FF] border border-gray-200 rounded-[16px] px-4 py-5 text-[#1A1A2E] text-[36px] font-black text-center focus:outline-none focus:border-[#7F77DD] focus:ring-4 focus:ring-[#7F77DD]/10 transition-all tracking-[0.1em]"
                />

                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-[12px] p-3 mt-4 flex items-center gap-2">
                    <span className="text-red-500 text-lg">⚠️</span>
                    <p className="text-[13px] font-bold text-red-600 leading-tight">{error}</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !dni.trim()}
                className="w-full mt-6 py-4.5 min-h-[56px] rounded-[16px] bg-[#7F77DD] text-white font-black text-[16px] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(127,119,221,0.3)]"
              >
                {loading ? (
                  <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Ingresar a mi cuenta"
                )}
              </button>
            </div>

            {/* DNIs de prueba (Demo Chips) */}
            <div className="bg-white rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] p-5 border border-gray-100">
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <span>🤖</span> Demo Express
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { dni: "12345678", label: "María García (Paciente)" },
                  { dni: "87654321", label: "Juan Pérez (Paciente)" },
                  { dni: "99887766", label: "Dr. López (Médico)" },
                  { dni: "55443322", label: "Farmacia (Comercio)" },
                ].filter(d => {
                  if (role.id === "patient") return d.dni === "12345678" || d.dni === "87654321";
                  if (role.id === "clinic") return d.dni === "99887766";
                  if (role.id === "commerce") return d.dni === "55443322";
                  return true;
                }).map((d) => (
                  <button
                    key={d.dni}
                    type="button"
                    onClick={() => {
                      setDni(d.dni);
                      setError("");
                      if (inputRef.current) inputRef.current.focus();
                    }}
                    className="flex justify-between items-center bg-[#F8F7FF] hover:bg-[#7F77DD]/10 active:scale-[0.98] border border-transparent hover:border-[#7F77DD]/20 rounded-[12px] px-4 py-3 transition-colors text-left"
                  >
                    <span className="text-[13px] font-bold text-[#1A1A2E]">{d.label}</span>
                    <span className="text-[12px] font-mono font-bold text-[#7F77DD] tracking-wider">{d.dni}</span>
                  </button>
                ))}
              </div>
            </div>

            {role.id === "patient" && (
              <div className="bg-gradient-to-r from-[#7F77DD]/10 to-[#9B8FE8]/20 rounded-[16px] p-4 border border-[#7F77DD]/20 flex items-center gap-3 shadow-sm">
                <span className="text-2xl">💎</span>
                <p className="text-[12px] font-medium text-[#1A1A2E] leading-tight">
                  ¿Sabías que podés llegar a <span className="font-black text-[#7F77DD]">Premium</span> acumulando WaitPoints en cada visita médica?
                </p>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
