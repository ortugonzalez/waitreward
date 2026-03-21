import { useState, useRef } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function LoginView({ onLogin }) {
  const [dni, setDni] = useState("");
  const [medicCode, setMedicCode] = useState("");
  const [commerceAddress, setCommerceAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e, type, value) => {
    e.preventDefault();
    if (!value.trim()) return setError("Por favor, ingresá un valor.");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: value.trim() }),
      });
      const data = await res.json();

      if (!data.success) {
        setError("Usuario no encontrado. Verificá los datos e intentá de nuevo.");
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

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F7FF] font-sans">
      {/* Header */}
      <div className="bg-[#7F77DD] text-white pt-10 pb-16 px-6 rounded-b-[40px] shadow-[0_4px_24px_rgba(127,119,221,0.3)] relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 -left-10 w-32 h-32 bg-[#9B8FE8]/50 rounded-full blur-2xl" />
        <div className="relative z-10 pt-4">
          <h1 className="text-[32px] leading-tight font-black tracking-tight">
            Bienvenido a WaitReward
          </h1>
          <p className="text-[15px] font-medium opacity-90 mt-2">
            Ingresá tus datos para acceder a tu panel.
          </p>
        </div>
      </div>

      <div className="px-5 -mt-8 flex flex-col gap-5 relative z-20 pb-10">

        {/* Error general */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-[12px] p-3 flex items-center gap-2 animate-fade-in shadow-sm">
            <span className="text-red-500 text-lg">⚠️</span>
            <p className="text-[13px] font-bold text-red-600 leading-tight">{error}</p>
          </div>
        )}

        {/* Inputs Cards */}
        <div className="bg-white rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.06)] p-6 border-2 border-transparent">
          <h2 className="text-xl font-black text-[#1A1A2E] mb-4">¿Cómo querés ingresar?</h2>

          <div className="flex flex-col gap-6">

            {/* Paciente */}
            <form onSubmit={(e) => handleLogin(e, "patient", dni)} className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#1A1A2E] flex items-center gap-2">
                <span className="text-xl">🧑‍⚕️</span> Soy paciente
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: 12345678"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  className="flex-1 bg-[#F8F7FF] border border-gray-200 rounded-[12px] px-4 py-3 text-[#1A1A2E] text-[15px] font-bold focus:outline-none focus:border-[#7F77DD] focus:ring-2 focus:ring-[#7F77DD]/20 transition-all placeholder:text-gray-400 placeholder:font-normal"
                />
                <button
                  type="submit"
                  disabled={loading || !dni.trim()}
                  className="px-4 bg-[#7F77DD] text-white font-bold rounded-[12px] disabled:opacity-50 active:scale-95 transition-all shadow-sm flex items-center justify-center min-w-[50px]"
                >
                  {loading && dni.trim() ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "→"}
                </button>
              </div>
            </form>

            <div className="h-px bg-gray-100" />

            {/* Médico */}
            <form onSubmit={(e) => handleLogin(e, "clinic", medicCode)} className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#1A1A2E] flex items-center gap-2">
                <span className="text-xl">👨‍⚕️</span> Soy médico
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: 99887"
                  value={medicCode}
                  onChange={(e) => setMedicCode(e.target.value)}
                  className="flex-1 bg-[#F8F7FF] border border-gray-200 rounded-[12px] px-4 py-3 text-[#1A1A2E] text-[15px] font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 placeholder:font-normal"
                />
                <button
                  type="submit"
                  disabled={loading || !medicCode.trim()}
                  className="px-4 bg-blue-500 text-white font-bold rounded-[12px] disabled:opacity-50 active:scale-95 transition-all shadow-sm flex items-center justify-center min-w-[50px]"
                >
                  {loading && medicCode.trim() ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "→"}
                </button>
              </div>
            </form>

            <div className="h-px bg-gray-100" />

            {/* Comercio */}
            <form onSubmit={(e) => handleLogin(e, "commerce", commerceAddress)} className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#1A1A2E] flex items-center gap-2">
                <span className="text-xl">🏪</span> Soy comercio
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: corrientes1234"
                  value={commerceAddress}
                  onChange={(e) => setCommerceAddress(e.target.value)}
                  className="flex-1 bg-[#F8F7FF] border border-gray-200 rounded-[12px] px-4 py-3 text-[#1A1A2E] text-[15px] font-bold focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 transition-all placeholder:text-gray-400 placeholder:font-normal"
                />
                <button
                  type="submit"
                  disabled={loading || !commerceAddress.trim()}
                  className="px-4 bg-[#22C55E] text-white font-bold rounded-[12px] disabled:opacity-50 active:scale-95 transition-all shadow-sm flex items-center justify-center min-w-[50px]"
                >
                  {loading && commerceAddress.trim() ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "→"}
                </button>
              </div>
            </form>

          </div>
        </div>

        {/* Demo Chips */}
        <div className="bg-white rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] p-5 border border-gray-100">
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
            <span>🤖</span> Demo Express
          </p>
          <div className="flex flex-col gap-2">
            {[
              { id: "patient", dni: "12345678", label: "María García (Paciente)", color: "text-[#7F77DD]", bgHover: "hover:bg-[#7F77DD]/10", borderHover: "hover:border-[#7F77DD]/20" },
              { id: "clinic", dni: "99887", label: "Dr. López (Médico)", color: "text-blue-500", bgHover: "hover:bg-blue-50", borderHover: "hover:border-blue-200" },
              { id: "commerce", dni: "corrientes1234", label: "Farmacia (Comercio)", color: "text-[#22C55E]", bgHover: "hover:bg-[#22C55E]/10", borderHover: "hover:border-[#22C55E]/20" },
            ].map((d) => (
              <button
                key={d.dni}
                type="button"
                onClick={() => {
                  if (d.id === "patient") { setDni(d.dni); setMedicCode(""); setCommerceAddress(""); }
                  if (d.id === "clinic") { setMedicCode(d.dni); setDni(""); setCommerceAddress(""); }
                  if (d.id === "commerce") { setCommerceAddress(d.dni); setDni(""); setMedicCode(""); }
                  setError("");
                }}
                className={`flex justify-between items-center bg-[#F8F7FF] ${d.bgHover} active:scale-[0.98] border border-transparent ${d.borderHover} rounded-[12px] px-4 py-3 transition-colors text-left`}
              >
                <span className="text-[13px] font-bold text-[#1A1A2E]">{d.label}</span>
                <span className={`text-[12px] font-mono font-bold ${d.color} tracking-wider`}>{d.dni}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
