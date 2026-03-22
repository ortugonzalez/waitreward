import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "../i18n";
import { HormiLogo } from "../components/HormiLogo";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function LoginView({ onLogin }) {
  const { t, lang, setLang } = useTranslation();

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
    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true);
    const handler = (e) => { e.preventDefault(); deferredPrompt.current = e; setInstallPrompt(true); };
    const installHandler = () => { setInstalled(true); setInstallPrompt(false); };
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
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: value.trim() }),
      });
      const data = await res.json();
      if (!data.success) { setError("Usuario no encontrado."); return; }

      const session = {
        name: data.user.name, role: data.user.role, dni: data.user.dni,
        wallet: data.user.wallet, token: data.token,
      };
      localStorage.setItem("wr_session", JSON.stringify(session));
      toast.success(`¡${t('welcome')}, ${data.user.name}!`);
      onLogin(session);
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const storedSessionStr = typeof window !== 'undefined' ? localStorage.getItem("wr_session") : null;
  const storedSession = storedSessionStr ? JSON.parse(storedSessionStr) : null;

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('hormi-theme', next);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--bg-primary)] font-sans transition-colors">
      
      {/* ── MOBILE HEADER CON HAMBURGUESA ── */}
      <div className="lg:hidden flex items-center px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border)] z-40 sticky top-0 justify-between">
          <button 
              onClick={() => setDrawerOpen(true)} 
              className="text-2xl p-1 text-[var(--text-primary)] rounded-lg flex items-center justify-center w-10 h-10 active:scale-95"
          >
              ☰
          </button>
          <div className="w-10"></div>
      </div>

      {/* Header Splash */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border)] pt-8 pb-12 px-6 rounded-b-[40px] shadow-sm relative overflow-hidden transition-colors flex justify-center lg:justify-start">
        <div className="relative z-10 flex flex-col pt-0">
          <HormiLogo size="lg" />
          <p className="text-[15px] font-medium text-[var(--text-secondary)] mt-4">
            {t('subtitle')}
          </p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="text-xs font-bold border border-[var(--border)] px-3 py-1.5 rounded-full text-[var(--text-primary)]">
              {lang === 'es' ? '🇦🇷 ES' : '🇺🇸 EN'}
            </button>
            <button onClick={toggleTheme} className="text-xs font-bold border border-[var(--border)] px-3 py-1.5 rounded-full text-[var(--text-primary)]">
              {document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6 flex flex-col gap-5 relative z-20 pb-10">

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-[12px] p-3 flex items-center gap-2 animate-fade-in shadow-sm">
            <span className="text-red-500 text-lg">⚠️</span>
            <p className="text-[13px] font-bold text-red-600 leading-tight">{error}</p>
          </div>
        )}

        <div className="bg-[var(--bg-secondary)] rounded-[20px] shadow-sm p-6 border border-[var(--border)] transition-colors">
          <h2 className="text-xl font-black text-[var(--text-primary)] mb-4">{t('howToLogin')}</h2>

          <div className="flex flex-col gap-6">
            <form onSubmit={(e) => handleLogin(e, "patient", dni)} className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span className="text-xl">🧑‍⚕️</span> {t('patient')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: 12345678"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded-[12px] px-4 py-3 text-[var(--text-primary)] text-[15px] font-bold focus:outline-none focus:border-[#7F77DD] transition-colors placeholder:text-gray-400 placeholder:font-normal"
                />
                <button
                  type="submit"
                  disabled={loading || !dni.trim()}
                  className="px-4 bg-[#7F77DD] text-white font-bold rounded-[12px] disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center min-w-[50px]"
                >
                  {loading && dni.trim() ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "→"}
                </button>
              </div>
            </form>

            <div className="h-px bg-[var(--border)]" />

            <form onSubmit={(e) => handleLogin(e, "clinic", medicCode)} className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span className="text-xl">👨‍⚕️</span> {t('doctor')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: 99887"
                  value={medicCode}
                  onChange={(e) => setMedicCode(e.target.value)}
                  className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded-[12px] px-4 py-3 text-[var(--text-primary)] text-[15px] font-bold focus:outline-none focus:border-[#7F77DD] transition-colors placeholder:text-gray-400 placeholder:font-normal"
                />
                <button
                  type="submit"
                  disabled={loading || !medicCode.trim()}
                  className="px-4 bg-[#7F77DD] text-white font-bold rounded-[12px] disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center min-w-[50px]"
                >
                  {loading && medicCode.trim() ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "→"}
                </button>
              </div>
            </form>

            <div className="h-px bg-[var(--border)]" />

            <form onSubmit={(e) => handleLogin(e, "commerce", commerceAddress)} className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span className="text-xl">🏪</span> {t('commerce')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: corrientes1234"
                  value={commerceAddress}
                  onChange={(e) => setCommerceAddress(e.target.value)}
                  className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded-[12px] px-4 py-3 text-[var(--text-primary)] text-[15px] font-bold focus:outline-none focus:border-[#7F77DD] transition-colors placeholder:text-gray-400 placeholder:font-normal"
                />
                <button
                  type="submit"
                  disabled={loading || !commerceAddress.trim()}
                  className="px-4 bg-[#7F77DD] text-white font-bold rounded-[12px] disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center min-w-[50px]"
                >
                  {loading && commerceAddress.trim() ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "→"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-[20px] shadow-sm p-5 border border-[var(--border)] transition-colors">
          <p className="text-[11px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
            <span>🤖</span> Demo Express
          </p>
          <div className="flex flex-col gap-2">
            {[
              { id: "patient", dni: "12345678", label: "María García", type: t('patient'), color: "text-[#7F77DD]" },
              { id: "clinic", dni: "99887", label: "Dr. López", type: t('doctor'), color: "text-blue-500" },
              { id: "commerce", dni: "corrientes1234", label: "Farmacia", type: t('commerce'), color: "text-[#22C55E]" },
            ].map((d) => (
              <button
                key={d.dni} type="button"
                onClick={() => {
                  if (d.id === "patient") { setDni(d.dni); setMedicCode(""); setCommerceAddress(""); }
                  if (d.id === "clinic") { setMedicCode(d.dni); setDni(""); setCommerceAddress(""); }
                  if (d.id === "commerce") { setCommerceAddress(d.dni); setDni(""); setMedicCode(""); }
                  setError("");
                }}
                className={`flex justify-between items-center bg-[var(--bg-primary)] border border-[var(--border)] hover:border-[#7F77DD]/30 active:scale-[0.98] rounded-[12px] px-4 py-3 transition-all text-left group`}
              >
                <span className="text-[13px] font-bold text-[var(--text-primary)]">{d.label} <span className="opacity-50 font-normal ml-1">({d.type})</span></span>
                <span className={`text-[12px] font-mono font-bold ${d.color} tracking-wider group-hover:underline`}>{d.dni}</span>
              </button>
            ))}
          </div>
        </div>

        {!installed && (
          <div className="bg-[var(--bg-secondary)] rounded-[16px] shadow-sm p-4 flex items-center gap-3 border border-[var(--border)] mt-2">
            <span className="text-3xl">📲</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--text-primary)]">{t('installApp')}</p>
              <p className="text-[11px] text-[var(--text-secondary)]">Accedé como aplicación nativa</p>
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

      {drawerOpen && (
          <div className="fixed inset-0 z-[9999] lg:hidden flex">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
              <div className="relative w-[280px] h-full bg-[var(--bg-secondary)] border-r border-[var(--border)] shadow-2xl flex flex-col animate-slide-right">
                  <div className="p-6 bg-[var(--bg-primary)] flex flex-col gap-4 border-b border-[var(--border)] relative">
                      <button onClick={() => setDrawerOpen(false)} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xl">✕</button>
                      
                      <div className="w-14 h-14 rounded-full bg-[#7F77DD] shadow-sm flex items-center justify-center font-black text-2xl text-white">
                          I
                      </div>
                      <div className="flex flex-col">
                          <span className="font-black text-lg leading-tight truncate text-[var(--text-primary)]">Invitado</span>
                          <span className="text-[12px] font-bold text-[#7F77DD] uppercase tracking-widest mt-1">
                              SIN SESIÓN ACTIVA
                          </span>
                      </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3 px-4">
                      <div className="text-[13px] font-medium text-[var(--text-secondary)] text-center py-4">
                          Por favor, ingresá para navegar en HORMI.
                      </div>
                  </div>

                  <div className="p-4 border-t border-[var(--border)] flex flex-col gap-3">
                    <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="w-full px-4 py-3 font-bold flex items-center justify-between text-[var(--text-primary)] bg-[var(--bg-primary)] rounded-[12px] border border-[var(--border)] hover:bg-[#7F77DD]/10 transition-colors">
                        <span>{t('language')}</span>
                        <span>{lang === 'es' ? '🇦🇷 Español' : '🇺🇸 English'}</span>
                    </button>
                    <button onClick={toggleTheme} className="w-full px-4 py-3 font-bold flex items-center justify-between text-[var(--text-primary)] bg-[var(--bg-primary)] rounded-[12px] border border-[var(--border)] hover:bg-[#7F77DD]/10 transition-colors">
                        <span>Tema de interfaz</span>
                        <span>{document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️ Claro' : '🌙 Oscuro'}</span>
                    </button>
                  </div>
              </div>
          </div>
      )}

      {showInstallInstructions && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={() => setShowInstallInstructions(false)}></div>
          
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] bg-[var(--bg-secondary)] border border-[var(--border)] p-6 rounded-[16px] max-w-[340px] w-[90%] md:max-w-[420px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col gap-4 max-h-[90vh] overflow-y-auto transition-colors">
            
            <button 
              onClick={() => setShowInstallInstructions(false)} 
              className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-lg"
            >
              ✕
            </button>

            <p className="font-black text-[var(--text-primary)] text-lg mt-1">Cómo instalar</p>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span className="text-xl pt-0.5">🍎</span>
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">iPhone / iPad</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Tocá el botón Compartir (<strong>⬆</strong>) en Safari y luego elegí <strong>"Agregar a inicio"</strong></p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-xl pt-0.5">🤖</span>
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">Android</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Tocá el menú <strong>⋮</strong> del navegador Chrome y elegí <strong>"Agregar a pantalla de inicio"</strong></p>
                </div>
              </div>

              <div className="h-px bg-[var(--border)] my-1" />
              
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <span className="text-xl pt-0.5">💻</span>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">PC / Mac (Chrome)</p>
                    <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">Mirá tu barra de direcciones arriba y hacé clic en el ícono <strong>⊕</strong> o 💻 situado a la derecha:</p>
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
                
                <p className="text-[11px] text-[var(--text-secondary)] italic text-center mt-2">
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
