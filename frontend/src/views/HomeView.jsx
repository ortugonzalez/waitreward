import { useState, useEffect, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const STATIC_CATALOG = [
  { id: 1, emoji: "☕", name: "Café en local adherido", points: 30, description: "En cualquier cafetería de la red" },
  { id: 2, emoji: "💊", name: "Descuento en farmacia", points: 100, description: "Productos seleccionados", border: true },
  { id: 3, emoji: "🧠", name: "Sesión de psicología", points: 300, description: "Primera sesión gratuita", badge: "MÁS POPULAR" },
  { id: 4, emoji: "🩺", name: "Consulta interna", points: 500, description: "Sin cargo adicional" },
];

function AnimatedCounter({ end, duration = 2000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count.toLocaleString("es-AR")}</span>;
}

export function HomeView({ setActiveTab }) {
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [commerces, setCommerces] = useState([]);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const deferredPrompt = useRef(null);

  const [levels, setLevels] = useState([
    { name: "Bronce", emoji: "🥉", color: "#B08D57", minPoints: 0, perks: ["Catálogo básico"] },
    { name: "Plata", emoji: "🥈", color: "#C0C0C0", minPoints: 101, perks: ["Prioridad de canje"] },
    { name: "Oro", emoji: "🥇", color: "#FFD700", minPoints: 301, perks: ["Comercios exclusivos"] },
    { name: "Premium", emoji: "💎", color: "#7F77DD", minPoints: 601, perks: ["Beneficios VIP"] }
  ]);
  const [userLevel, setUserLevel] = useState(null);

  useEffect(() => {
    setMounted(true);
    fetch(`${API_URL}/api/rewards/commerces`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setCommerces(d.commerces); })
      .catch(() => { });

    fetch(`${API_URL}/api/rewards/levels`)
      .then((r) => r.json())
      .then((d) => { if (d.success && d.levels) setLevels(d.levels); })
      .catch(() => { });

    try {
      const session = JSON.parse(localStorage.getItem("wr_session") || "{}");
      if (session?.wallet) {
        fetch(`${API_URL}/api/points/${session.wallet}`)
          .then((r) => r.json())
          .then((d) => { if (d.level) setUserLevel(d.level.name); })
          .catch(() => { });
      }
    } catch { }
  }, []);

  // ── Capture install prompt ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setInstallPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setInstallPrompt(false);
    });
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === "accepted") setInstalled(true);
    deferredPrompt.current = null;
    setInstallPrompt(false);
  };

  const defaultCommerces = [
    { emoji: "💊", commerce_name: "Farmacia Del Pueblo", category: "Farmacia" },
    { emoji: "☕", commerce_name: "Café Central", category: "Gastronomía" },
    { emoji: "🧠", commerce_name: "Centro de Salud Mental", category: "Salud" },
    { emoji: "🩺", commerce_name: "Lab. Diagnóstico", category: "Salud" }
  ];

  const displayCommerces = commerces.length > 0 ? commerces : defaultCommerces;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F7FF] pb-24 font-sans text-[#1A1A2E]">
      {/* Hero Splash */}
      <div
        className="text-white pt-10 pb-16 px-6 rounded-b-[40px] shadow-[0_4px_20px_rgba(127,119,221,0.3)] relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #7F77DD 0%, #9B8FE8 100%)" }}
      >
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="text-white text-[10px] font-bold tracking-wide uppercase">⬡ Powered by Avalanche</span>
        </div>

        <div className="mt-6 flex flex-col gap-1">
          <h1 className="text-4xl font-black leading-tight">
            Tu tiempo vale.
          </h1>
          <p className="text-xl font-medium opacity-90">
            Ahora lo demostramos.
          </p>
        </div>

        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <p className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">Impacto a la fecha</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black">
              <AnimatedCounter end={42350} />
            </span>
            <span className="text-sm font-bold opacity-90">WaitPoints entregados</span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 -mt-8 flex flex-col gap-6 relative z-10">

        {/* Instalar PWA */}
        {installPrompt && !installed && (
          <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-4 flex items-center gap-3">
            <span className="text-3xl">📲</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#1A1A2E]">Instalá WaitReward</p>
              <p className="text-[11px] text-gray-500">Accedé desde tu pantalla de inicio</p>
            </div>
            <button
              onClick={handleInstall}
              className="px-4 py-2 rounded-[12px] bg-[#7F77DD] text-white font-bold text-xs active:scale-95 transition-transform flex-shrink-0"
            >
              Instalar
            </button>
          </div>
        )}

        {/* Niveles de membresía */}
        <div>
          <h2 className="font-bold text-[#1A1A2E] text-lg mb-4 px-1">Niveles de membresía</h2>
          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-3 snap-x hide-scrollbar">
            {levels.map((lvl, i) => {
              const isCurrent = userLevel === lvl.name;
              return (
                <div
                  key={i}
                  className={`snap-start shrink-0 w-[200px] rounded-[16px] p-4 flex flex-col gap-2 transition-all ${isCurrent ? 'border-2 shadow-[0_4px_16px_rgba(0,0,0,0.1)]' : 'border border-transparent bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]'}`}
                  style={{
                    borderColor: isCurrent ? lvl.color : 'transparent',
                    backgroundColor: isCurrent ? `${lvl.color}15` : 'white'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{lvl.emoji}</span>
                    <div className="flex flex-col">
                      <span className="font-black text-[#1A1A2E] leading-tight">{lvl.name}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lvl.minPoints > 0 ? `${lvl.minPoints}+ WP` : '0-100 WP'}</span>
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-white bg-[#22C55E] px-2 py-0.5 rounded-full inline-flex w-max mb-1 items-center gap-1 shadow-sm">
                      ✨ Tu nivel actual
                    </span>
                  )}
                  <div className="mt-1">
                    <p className="text-[13px] font-medium text-gray-600 flex items-start gap-1.5 leading-tight">
                      <span className="font-bold shrink-0" style={{ color: lvl.color }}>✓</span>
                      {lvl.perks?.[0] || "Beneficios exclusivos"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Catálogo — cards clickeables */}
        <div>
          <h2 className="font-bold text-[#1A1A2E] text-lg mb-4 px-1">¿Qué podés canjear?</h2>
          <div className="grid grid-cols-2 gap-3">
            {STATIC_CATALOG.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedBenefit(item)}
                className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-4 flex flex-col justify-between aspect-square text-left transition-all hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] active:scale-95 relative"
              >
                {item.badge && (
                  <div className="absolute top-3 right-3 bg-[#22C55E] text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm z-10 uppercase tracking-widest ring-2 ring-white">
                    {item.badge}
                  </div>
                )}
                <span className="text-[64px] leading-none mb-2 mt-2 self-center transition-transform hover:scale-110">{item.emoji}</span>
                <div className="mt-auto">
                  <h3 className="text-[13px] font-bold text-[#1A1A2E] leading-tight mb-1">{item.name}</h3>
                  <div className="inline-block bg-[#7F77DD]/10 text-[#7F77DD] px-2.5 py-1 rounded-[8px] font-black text-xs">
                    {item.points} WP
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Comercios adheridos */}
        <div>
          <h2 className="font-bold text-[#1A1A2E] text-lg mb-4 px-1">Comercios adheridos</h2>
          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-3 snap-x hide-scrollbar">
            {displayCommerces.map((c, i) => (
              <div
                key={i}
                className="snap-start shrink-0 w-[240px] bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-4 flex items-center gap-3 transition-opacity duration-700 ease-out"
                style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(10px)", transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 bg-[#F8F7FF] rounded-[12px] flex items-center justify-center text-2xl shrink-0">
                  {c.emoji || "🏪"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1A1A2E] truncate">{c.commerce_name}</p>
                  <p className="text-[11px] text-gray-500 mb-1">{c.category || "General"}</p>
                  <span className="inline-flex items-center gap-1 bg-[#22C55E]/10 text-[#22C55E] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span> Activo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-2">
          <button
            onClick={() => setActiveTab("patient")}
            className="w-full py-4 rounded-[12px] bg-[#7F77DD] text-white font-bold text-base active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(127,119,221,0.3)] flex items-center justify-center gap-2"
          >
            🧑‍⚕️ Soy paciente
          </button>
          <button
            onClick={() => setActiveTab("clinic")}
            className="w-full py-4 rounded-[12px] bg-white text-[#7F77DD] border-2 border-[#7F77DD] font-bold text-base active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            👨‍⚕️ Soy médico
          </button>
          <button
            onClick={() => setActiveTab("commerce")}
            className="w-full py-4 bg-transparent text-[#1A1A2E] font-bold text-sm active:opacity-70 transition-all flex items-center justify-center gap-2"
          >
            🏪 Soy comercio <span className="text-gray-400">→</span>
          </button>
        </div>

      </div>

      {/* Modal de detalle de beneficio */}
      {selectedBenefit && (
        <BenefitModal
          benefit={selectedBenefit}
          commerces={commerces}
          onClose={() => setSelectedBenefit(null)}
          onLogin={() => { setSelectedBenefit(null); setActiveTab("patient"); }}
        />
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

// ── Modal de detalle ──────────────────────────────────────────────────────────
function BenefitModal({ benefit, commerces, onClose, onLogin }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center font-sans" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-[#F8F7FF] rounded-t-[24px] p-6 pb-10 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-2" />

        {/* Header beneficio */}
        <div className="flex flex-col items-center gap-3 pb-4">
          <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center text-[64px]">
            {benefit.emoji}
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A2E] text-center">{benefit.name}</h2>
          <p className="text-sm text-gray-500 text-center px-4">{benefit.description}</p>
          <div className="bg-[#7F77DD]/10 rounded-[12px] px-6 py-3 mt-2 border border-[#7F77DD]/20">
            <span className="text-3xl font-black text-[#7F77DD]">{benefit.points}</span>
            <span className="text-sm font-bold text-[#7F77DD] ml-1">WaitPoints</span>
          </div>
        </div>

        {/* Comercios donde canjear */}
        <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">
            Comercios adheridos
          </p>
          {commerces.length === 0 ? (
            <p className="text-sm text-gray-400">Cargando comercios…</p>
          ) : (
            <div className="flex flex-col gap-3">
              {commerces.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-2xl bg-[#F8F7FF] p-2 rounded-[12px]">{c.emoji || "🏪"}</span>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A2E]">{c.commerce_name}</p>
                    {c.address && <p className="text-[11px] text-gray-400 mt-0.5">{c.address}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onLogin}
          className="w-full py-4 rounded-[12px] bg-[#7F77DD] text-white font-bold text-base active:scale-[0.98] transition-transform mt-4 shadow-[0_4px_12px_rgba(127,119,221,0.3)]"
        >
          Quiero este premio →
        </button>
      </div>
    </div>
  );
}
