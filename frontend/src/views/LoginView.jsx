import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function LoginView({ onLogin }) {
  const [dni, setDni] = useState("");
  const [medicCode, setMedicCode] = useState("");
  const [commerceAddress, setCommerceAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);

  // PWA States
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const deferredPrompt = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }
    
    const handler = (e) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setInstallPrompt(true);
    };
    
    const installHandler = () => {
      setInstalled(true);
      setInstallPrompt(false);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installHandler);
    
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === "accepted") setInstalled(true);
    deferredPrompt.current = null;
    setInstallPrompt(false);
  };

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

  const storedSessionStr = typeof window !== 'undefined' ? localStorage.getItem("wr_session") : null;
  const storedSession = storedSessionStr ? JSON.parse(storedSessionStr) : null;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#F8F7FF] font-sans pt-[max(0px,env(safe-area-inset-top))]">
      
      {/* ── MOBILE HEADER CON HAMBURGUESA ── */}
      <div className="lg:hidden flex items-center px-4 py-3 bg-[#7F77DD] z-40 sticky top-0 justify-between">
          <button 
              onClick={() => setDrawerOpen(true)} 
              className="text-2xl p-1 text-[#7F77DD] bg-white/20 rounded-lg flex items-center justify-center w-10 h-10 active:scale-95 border border-white/30"
          >
              <span className="text-white">☰</span>
          </button>
          <div className="font-black text-lg text-white tracking-tight">Login</div>
          <div className="w-10"></div>
      </div>

      {/* Header Splash */}
      <div className="bg-[#7F77DD] text-white pt-6 pb-16 px-6 rounded-b-[40px] shadow-[0_4px_24px_rgba(127,119,221,0.3)] relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 -left-10 w-32 h-32 bg-[#9B8FE8]/50 rounded-full blur-2xl" />
        <div className="relative z-10">
          <h1 className="text-[32px] leading-tight font-black tracking-tight" style={{ paddingTop: "env(safe-area-inset-top)" }}>
            Bienvenido a HORMI
          </h1>
          <p className="text-[15px] font-medium opacity-90 mt-2">
            Ingresá tus datos para acceder a tu panel.
          </p>
        </div>
      </div>

      <div className="px-5 -mt-8 flex flex-col gap-5 relative z-20 pb-10">

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-[12px] p-3 flex items-center gap-2 animate-fade-in shadow-sm">
            <span className="text-red-500 text-lg">⚠️</span>
            <p className="text-[13px] font-bold text-red-600 leading-tight">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.06)] p-6 border-2 border-transparent">
          <h2 className="text-xl font-black text-[#1A1A2E] mb-4">¿Cómo querés ingresar?</h2>

          <div className="flex flex-col gap-6">
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

        {/* Instalar PWA Botón */}
        {!installed && (
          <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-4 flex items-center gap-3 mt-2">
            <span className="text-3xl">📲</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#1A1A2E]">Instalá HORMI</p>
              <p className="text-[11px] text-gray-500">Accedé como aplicación nativa</p>
            </div>
            <button
              onClick={installPrompt ? handleInstall : () => setShowInstallInstructions(true)}
              className="px-4 py-2 rounded-[12px] bg-[#7F77DD] text-white font-bold text-xs active:scale-95 transition-transform flex-shrink-0"
            >
              Instalar
            </button>
          </div>
        )}

      </div>

      {/* ── MOBILE DRAWER (HAMBURGER MENU) IN LOGINVIEW ── */}
      {drawerOpen && (
          <div className="fixed inset-0 z-[9999] lg:hidden flex">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
              
              <div className="relative w-[280px] h-full bg-white shadow-2xl flex flex-col animate-slide-right">
                  <div className="p-6 bg-[#7F77DD] text-white flex flex-col gap-4">
                      <button onClick={() => setDrawerOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white text-xl">✕</button>
                      
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center font-black text-2xl text-[#7F77DD] shadow-sm">
                          {storedSession?.name ? storedSession.name.charAt(0).toUpperCase() : "I"}
                      </div>
                      <div className="flex flex-col">
                          <span className="font-black text-lg leading-tight truncate">{storedSession?.name || "Invitado"}</span>
                          <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest mt-1">
                              {storedSession ? 'RESTAURAR SESIÓN' : 'SIN SESIÓN ACTIVA'}
                          </span>
                      </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
                      <div className="text-sm font-medium text-gray-500 px-2 mt-4 text-center">
                          {storedSession 
                            ? "Tu sesión exite. Podés iniciar nuevamente con Demo Express o recargando."
                            : "Por favor, ingresá para navegar en HORMI."}
                      </div>
                  </div>
                  
                  {storedSession && (
                      <div className="p-4 border-t border-gray-100 mb-4">
                          <button onClick={() => { localStorage.removeItem("wr_session"); setDrawerOpen(false); window.location.reload(); }} className="w-full text-left px-4 py-3 text-red-600 font-bold flex items-center gap-3 bg-red-50 hover:bg-red-100 rounded-[12px] transition-colors">
                              <span className="text-lg">🚪</span> Cerrar sesión real
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* PWA Modal de Instrucciones FIX 5 */}
      {showInstallInstructions && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={() => setShowInstallInstructions(false)}></div>
          
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] bg-white p-6 rounded-[16px] max-w-[340px] w-[90%] md:max-w-[420px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setShowInstallInstructions(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>

            <p className="font-black text-[#1A1A2E] text-lg mt-1">Cómo instalar</p>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span className="text-xl pt-0.5">🍎</span>
                <div>
                  <p className="text-sm font-bold text-[#1A1A2E]">iPhone / iPad</p>
                  <p className="text-xs text-gray-500 mt-0.5">Tocá el botón Compartir (<strong>⬆</strong>) en Safari y luego elegí <strong>"Agregar a inicio"</strong></p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-xl pt-0.5">🤖</span>
                <div>
                  <p className="text-sm font-bold text-[#1A1A2E]">Android</p>
                  <p className="text-xs text-gray-500 mt-0.5">Tocá el menú <strong>⋮</strong> del navegador Chrome y elegí <strong>"Agregar a pantalla de inicio"</strong></p>
                </div>
              </div>

              <div className="h-px bg-gray-100 my-1" />
              
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <span className="text-xl pt-0.5">💻</span>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A2E]">PC / Mac (Chrome)</p>
                    <p className="text-[12px] text-gray-500 mt-0.5">Mirá tu barra de direcciones arriba y hacé clic en el ícono <strong>⊕</strong> o 💻 situado a la derecha:</p>
                  </div>
                </div>

                <div className="relative mt-2 w-full mx-auto max-w-[300px]">
                  <svg viewBox="0 0 300 40" className="w-full drop-shadow-sm rounded-[20px]">
                    <rect x="0" y="0" width="300" height="40" rx="20" fill="#f1f3f4"/>
                    <text x="20" y="25" fontSize="13" fill="#666" fontFamily="sans-serif">waitreward.vercel.app</text>
                    <circle cx="270" cy="20" r="14" fill="#7F77DD" className="animate-pulse"/>
                    <text x="263" y="25" fontSize="16" fill="white" fontWeight="bold">⊕</text>
                  </svg>
                  <div className="absolute right-6 top-11 bg-black text-white text-[10px] px-2 py-1 rounded-md font-bold whitespace-nowrap shadow-md">
                    Hacé click aquí ↑
                  </div>
                </div>
                
                <p className="text-[11px] text-gray-400 italic text-center mt-2">
                  Si no aparece el ícono, cerrá Chrome y volvé a abrirlo.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstallInstructions(false)}
              className="mt-3 w-full py-3 rounded-[14px] bg-[#7F77DD] text-white font-bold text-sm active:scale-95 transition-transform"
            >
              Entendido
            </button>
          </div>
        </>
      )}

    </div>
  );
}
