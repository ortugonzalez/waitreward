import { useState, useEffect, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const STATIC_CATALOG = [
  { id: 1, emoji: "☕",  name: "Café en local adherido",    points: 30,  description: "En cualquier cafetería de la red" },
  { id: 2, emoji: "💊", name: "Descuento en farmacia",     points: 100, description: "Productos seleccionados", border: true },
  { id: 3, emoji: "🧠", name: "Sesión de psicología",      points: 300, description: "Primera sesión gratuita", badge: "MÁS POPULAR" },
  { id: 4, emoji: "🩺", name: "Consulta interna",          points: 500, description: "Sin cargo adicional" },
];

export function HomeView({ setActiveTab }) {
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [commerces, setCommerces]             = useState([]);
  const [installPrompt, setInstallPrompt]     = useState(null);
  const [installed, setInstalled]             = useState(false);
  const deferredPrompt = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/rewards/commerces`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setCommerces(d.commerces); })
      .catch(() => {});
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

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-24">
      {/* Header Splash */}
      <div className="bg-primary text-white pt-8 pb-12 px-6 rounded-b-[40px] shadow-sm">
        <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
          <span>⏱</span> WaitReward
        </h1>
        <p className="text-lg font-medium opacity-90">
          Tu tiempo vale. Ahora lo demostramos.
        </p>
      </div>

      <div className="flex-1 px-4 -mt-6 flex flex-col gap-6">

        {/* Instalar PWA */}
        {installPrompt && !installed && (
          <div className="bg-white rounded-card shadow-sm p-4 flex items-center gap-3">
            <span className="text-2xl">📲</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink">Instalá WaitReward</p>
              <p className="text-xs text-gray-400">Accedé desde tu pantalla de inicio</p>
            </div>
            <button
              onClick={handleInstall}
              className="px-4 py-2 rounded-full bg-primary text-white font-bold text-xs active:scale-95 transition-transform flex-shrink-0"
            >
              Instalar
            </button>
          </div>
        )}

        {/* Catálogo — cards clickeables */}
        <div className="bg-white rounded-card shadow-sm p-5">
          <h2 className="font-bold text-ink text-base mb-4">¿Qué podés canjear?</h2>
          <div className="grid grid-cols-2 gap-3">
            {STATIC_CATALOG.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedBenefit(item)}
                className={`bg-surface rounded-xl p-4 flex flex-col justify-between aspect-square text-left active:scale-95 transition-transform relative ${
                  item.border ? "border-2 border-primary/20" : ""
                }`}
              >
                {item.badge && (
                  <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {item.badge}
                  </div>
                )}
                <span className="text-3xl mb-1">{item.emoji}</span>
                <div>
                  <h3 className="text-sm font-bold text-ink leading-tight">{item.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                  <div className="mt-2 text-primary font-black">{item.points} WP</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Comercios adheridos */}
        <div className="bg-white rounded-card shadow-sm p-5">
          <h2 className="font-bold text-ink text-sm mb-3 text-center">Comercios adheridos</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {commerces.length > 0
              ? commerces.map((c, i) => (
                  <Badge key={i} icon={c.emoji || "🏪"} text={c.commerce_name} />
                ))
              : (
                <>
                  <Badge icon="💊" text="Farmacia Del Pueblo" />
                  <Badge icon="☕" text="Café Central" />
                  <Badge icon="🧠" text="Centro de Salud Mental" />
                  <Badge icon="🩺" text="Lab. Diagnóstico" />
                </>
              )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setActiveTab("patient")}
            className="w-full py-4 rounded-full bg-primary text-white font-bold text-base active:scale-95 transition-transform shadow-sm"
          >
            Soy paciente → Ver mis puntos
          </button>
          <button
            onClick={() => setActiveTab("clinic")}
            className="w-full py-4 rounded-full bg-white text-primary border-2 border-primary font-bold text-base active:scale-95 transition-transform"
          >
            Soy médico → Registrar atención
          </button>
          <button
            onClick={() => setActiveTab("commerce")}
            className="w-full py-4 rounded-full bg-surface text-gray-700 font-bold text-base active:scale-95 transition-transform"
          >
            Soy comercio → Ver mi dashboard
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 mb-2">
          <p className="text-[10px] text-gray-400 font-medium">
            Powered by Avalanche ◆ Smart contracts auditados ◆ Hackathon 2026
          </p>
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
    </div>
  );
}

// ── Modal de detalle ──────────────────────────────────────────────────────────
function BenefitModal({ benefit, commerces, onClose, onLogin }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-app bg-white rounded-t-3xl p-6 pb-10 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />

        {/* Header beneficio */}
        <div className="flex flex-col items-center gap-2 pb-2">
          <span className="text-6xl">{benefit.emoji}</span>
          <h2 className="text-xl font-bold text-ink text-center">{benefit.name}</h2>
          <p className="text-sm text-gray-500 text-center">{benefit.description}</p>
          <div className="bg-primary/10 rounded-full px-5 py-2 mt-1">
            <span className="text-2xl font-black text-primary">{benefit.points}</span>
            <span className="text-sm font-semibold text-primary ml-1">WaitPoints</span>
          </div>
        </div>

        {/* Comercios donde canjear */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Comercios donde podés canjearlo
          </p>
          {commerces.length === 0 ? (
            <p className="text-sm text-gray-400">Cargando comercios…</p>
          ) : (
            <div className="flex flex-col gap-2">
              {commerces.map((c, i) => (
                <div key={i} className="flex items-start gap-3 bg-surface rounded-xl p-3">
                  <span className="text-2xl">{c.emoji || "🏪"}</span>
                  <div>
                    <p className="text-sm font-bold text-ink">{c.commerce_name}</p>
                    {c.address && <p className="text-xs text-gray-400 mt-0.5">{c.address}</p>}
                    {c.hours   && <p className="text-xs text-gray-400">{c.hours}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onLogin}
          className="w-full py-4 rounded-full bg-primary text-white font-bold text-base active:scale-95 transition-transform mt-2"
        >
          Quiero este beneficio → Ingresar
        </button>
      </div>
    </div>
  );
}

function Badge({ icon, text }) {
  return (
    <div className="px-3 py-1.5 bg-surface text-ink text-xs font-semibold rounded-full flex items-center gap-1.5">
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}
