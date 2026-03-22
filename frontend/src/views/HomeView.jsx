import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const TIERS = [
  {
    name: "Membresía Bronce",
    emoji: "🥉",
    color: "text-[#B08D57]",
    bg: "bg-[#B08D57]/10",
    border: "border-[#B08D57]/20",
    items: [
      { id: 1, emoji: "☕", name: "Café en adherido", points: 30 },
      { id: 2, emoji: "💊", name: "Dcto en farmacia", points: 100 },
      { id: 3, emoji: "🥗", name: "Dcto en dietética", points: 80 },
      { id: 4, emoji: "💈", name: "Dcto peluquería", points: 60 },
    ]
  },
  {
    name: "Membresía Plata",
    emoji: "🥈",
    color: "text-[#C0C0C0]",
    bg: "bg-[#808080]/10",
    border: "border-[#808080]/20",
    items: [
      { id: 5, emoji: "🧠", name: "Sesión psicología", points: 300 },
      { id: 6, emoji: "🦷", name: "Dcto odontología", points: 250 },
      { id: 7, emoji: "💆", name: "Sesión kinesiología", points: 250 },
      { id: 8, emoji: "📋", name: "Análisis laboratorio", points: 200 },
    ]
  },
  {
    name: "Membresía Oro",
    emoji: "🥇",
    color: "text-[#FFD700]",
    bg: "bg-[#FFD700]/10",
    border: "border-[#FFD700]/20",
    items: [
      { id: 9, emoji: "🏋️", name: "Mes en gimnasio", points: 500 },
      { id: 10, emoji: "🩺", name: "Consulta interna", points: 500 },
      { id: 11, emoji: "💅", name: "Sesión estética", points: 400 },
      { id: 12, emoji: "🧘", name: "Clase de yoga", points: 350 },
    ]
  },
  {
    name: "Membresía Premium",
    emoji: "💎",
    color: "text-[#7F77DD]",
    bg: "bg-[#7F77DD]/10",
    border: "border-[#7F77DD]/20",
    items: [
      { id: 13, emoji: "🌿", name: "Consulta nutrición", points: 600 },
      { id: 14, emoji: "👁️", name: "Control oculista", points: 600 },
      { id: 15, emoji: "🦴", name: "Consulta trauma.", points: 700 },
      { id: 16, emoji: "⭐", name: "Beneficio VIP", points: 800 },
    ]
  }
];

export function HomeView({ setActiveTab }) {
  const [commerces, setCommerces] = useState([]);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const deferredPrompt = useRef(null);

  // Redemptions
  const [userPoints, setUserPoints] = useState(0);
  const [session, setSession] = useState(null);
  const [qrModal, setQrModal] = useState(null);
  const [generatingFor, setGeneratingFor] = useState(null);

  useEffect(() => {
    // Load local session directly
    try {
      const s = JSON.parse(localStorage.getItem("wr_session") || "null");
      setSession(s);
      if (s?.wallet) {
        fetch(`${API_URL}/api/points/${s.wallet}`)
          .then(r => r.json())
          .then(d => { if (d.points !== undefined) setUserPoints(d.points); })
          .catch(() => {});
      }
    } catch {}

    fetch(`${API_URL}/api/rewards/commerces`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setCommerces(d.commerces); })
      .catch(() => {});
  }, []);

  // ── Capture install prompt ─────────────────────────────────────────────────
  useEffect(() => {
    // Si ya está instalado (standalone) no mostrar nunca
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

  const currentPts = userPoints;

  const handleRedeem = async (item) => {
    if (!session?.wallet) return toast.error("Sesión no válida o no iniciada.");
    setGeneratingFor(item.id);
    try {
      const res = await fetch(`${API_URL}/api/rewards/generate-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientWallet: session.wallet,
          commerceName: "Comercio Adherido", // Generic fallback
          points: item.points,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Error generando QR");
      setQrModal({
        qrCode: data.qrCode,
        validateUrl: data.validateUrl,
        expiresAt: data.expiresAt,
        discountValue: data.discountValue,
        points: item.points,
        name: item.name,
        emoji: item.emoji,
      });
    } catch (err) {
      toast.error(err.message || "Error generando QR");
    } finally {
      setGeneratingFor(null);
    }
  };

  const defaultCommerces = [
    { emoji: "💊", commerce_name: "Farmacia Del Pueblo", category: "Farmacia" },
    { emoji: "☕", commerce_name: "Café Central", category: "Gastronomía" },
    { emoji: "🧠", commerce_name: "Centro de Salud Mental", category: "Salud" },
    { emoji: "🩺", commerce_name: "Lab. Diagnóstico", category: "Salud" }
  ];
  const displayCommerces = commerces.length > 0 ? commerces : defaultCommerces;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F7FF] pb-24 font-sans text-[#1A1A2E] lg:pb-8 pt-4">
      
      <div className="px-4 flex flex-col gap-6 relative z-10 w-full max-w-full">

        {/* Instalar PWA */}
        {!installed && (
          <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-4 flex items-center gap-3">
            <span className="text-3xl">📲</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#1A1A2E]">Instalá WaitReward</p>
              <p className="text-[11px] text-gray-500">Accedé desde tu pantalla de inicio</p>
            </div>
            <button
              onClick={installPrompt ? handleInstall : () => setShowInstallInstructions(true)}
              className="px-4 py-2 rounded-[12px] bg-[#7F77DD] text-white font-bold text-xs active:scale-95 transition-transform flex-shrink-0"
            >
              Instalar
            </button>
          </div>
        )}

        {/* Modal de Instrucciones iOS/PC */}
        {showInstallInstructions && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center"
            onClick={() => setShowInstallInstructions(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
              className="relative w-full max-w-sm bg-white rounded-t-[24px] p-6 pb-10 flex flex-col gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-1" />
              <p className="font-black text-[#1A1A2E] text-lg">Cómo instalar</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🍎</span>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A2E]">iPhone / iPad</p>
                    <p className="text-xs text-gray-500 mt-0.5">Tocá el botón Compartir (<strong>⬆</strong>) y luego <strong>"Agregar a inicio"</strong></p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🤖</span>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A2E]">Android</p>
                    <p className="text-xs text-gray-500 mt-0.5">Tocá el menú <strong>⋮</strong> del navegador y elegí <strong>"Agregar a pantalla de inicio"</strong></p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">💻</span>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A2E]">PC / Mac</p>
                    <p className="text-xs text-gray-500 mt-0.5">Hacé clic en el ícono <strong>⊕</strong> en la barra de direcciones del navegador</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowInstallInstructions(false)}
                className="mt-2 w-full py-3 rounded-[14px] bg-[#7F77DD] text-white font-bold text-sm active:scale-95 transition-transform"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        {/* Beneficios organizados por Tiers */}
        <div className="flex flex-col gap-8 w-full">
          {TIERS.map((tier, tIdx) => (
            <div key={tIdx} className="w-full">
              <div className="flex flex-col items-center mb-4">
                <span className="text-xl px-4 py-1.5 bg-[#F8F7FF] rounded-full border border-gray-200 uppercase tracking-widest font-black text-[#1A1A2E] text-[11px] shadow-sm">
                  {tier.emoji} {tier.name} {tier.emoji}
                </span>
                <div className="w-full h-px bg-gray-200 mt-3 relative">
                  <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${tier.bg} ${tier.border} border`} />
                </div>
              </div>

              {/* Grid de Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                {tier.items.map((item) => {
                  const canRedeem = currentPts >= item.points;
                  const isGenerating = generatingFor === item.id;
                  
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4 flex flex-col items-center text-center relative border border-transparent hover:border-[#7F77DD]/20 transition-colors w-full min-w-0"
                    >
                      <span className="text-[40px] leading-none mb-3">{item.emoji}</span>
                      
                      <h3 className="text-[13px] font-bold text-[#1A1A2E] leading-tight flex-1 flex items-center justify-center min-h-[40px] px-1 w-full">
                        {item.name}
                      </h3>
                      
                      <div className="mt-3 w-full">
                        <div className="inline-block bg-[#7F77DD]/10 text-[#7F77DD] px-3 py-1 rounded-[8px] font-black text-xs mb-3 shadow-[inset_0_1px_3px_rgba(127,119,221,0.1)]">
                          {item.points} WP
                        </div>

                        {canRedeem ? (
                          <button
                            onClick={() => handleRedeem(item)}
                            disabled={isGenerating}
                            className="w-full py-2.5 rounded-[12px] bg-[#7F77DD] text-white font-bold text-xs active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center shadow-[0_4px_12px_rgba(127,119,221,0.3)]"
                          >
                            {isGenerating ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Canjear"}
                          </button>
                        ) : (
                          <div className="w-full py-2.5 rounded-[12px] bg-[#F8F7FF] border border-gray-100 flex items-center justify-center">
                            <span className="text-[10px] text-gray-500 font-bold tracking-wide uppercase">Faltan {item.points - currentPts} WP</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Comercios adheridos - Horizontal Scroll o Grid */}
        <div className="mt-4 pt-8 border-t border-gray-200">
          <h2 className="font-bold text-[#1A1A2E] text-lg mb-4 px-1 flex items-center gap-2"><span>🏪</span> Comercios adheridos</h2>
          
          <div
            className="flex lg:grid lg:grid-cols-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 gap-3 hide-scrollbar lg:overflow-visible"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {displayCommerces.map((c, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[240px] lg:w-auto bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4 flex items-center gap-3 border border-transparent hover:border-gray-200 transition-colors"
              >
                <div className="w-12 h-12 bg-[#F8F7FF] rounded-[12px] flex items-center justify-center text-2xl shrink-0">
                  {c.emoji || "🏪"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1A1A2E] truncate">{c.commerce_name}</p>
                  <p className="text-[11px] text-gray-500 mb-1 truncate">{c.category || "General"}</p>
                  <span className="inline-flex items-center gap-1 bg-[#22C55E]/10 text-[#22C55E] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span> Activo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {qrModal && (
        <QRRewardModal data={qrModal} onClose={() => setQrModal(null)} />
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

// ── QR Modal (Para mostrar el QR generado) ──────────────────────────────────
function QRRewardModal({ data, onClose }) {
  const expiryStr = data.expiresAt
    ? new Date(data.expiresAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
    : "60 días";

  const qrContent = data.validateUrl || data.qrCode;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mi WaitReward Beneficio",
          text: `Tengo un descuento de ${data.discountValue} con WaitReward! Entregale este código al comercio: ${data.qrCode}`,
        });
      } catch (err) { }
    } else {
      toast.success("Código copiado al portapapeles");
      navigator.clipboard.writeText(data.qrCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center font-sans" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" />
      <div
        className="relative w-full max-w-sm bg-white rounded-t-[24px] p-6 pb-10 flex flex-col items-center gap-5 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-1" />

        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl bg-[#F8F7FF] p-2 rounded-[16px]">{data.emoji}</span>
            <div>
              <h2 className="text-[17px] font-black text-[#1A1A2E] leading-tight">{data.name}</h2>
              <p className="text-[12px] font-bold text-[#22C55E] flex items-center gap-1">
                <span>⏱️</span> Válido por {expiryStr}
              </p>
            </div>
          </div>
        </div>

        {/* QR container */}
        <div className="p-4 bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#F8F7FF] flex justify-center w-full">
          <QRCodeSVG value={qrContent} size={220} bgColor="#ffffff" fgColor="#1A1A2E" level="M" />
        </div>

        {/* Textual code */}
        <div className="bg-[#F8F7FF] rounded-[16px] px-6 py-3 w-full text-center border border-gray-100">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Tu código</p>
          <p className="font-mono text-xl text-[#1A1A2E] font-black tracking-[0.2em]">{data.qrCode}</p>
        </div>

        <div className="flex w-full gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-[16px] bg-[#F8F7FF] text-[#1A1A2E] font-bold text-[15px] active:scale-[0.98] transition-all"
          >
            Cerrar
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-4 rounded-[16px] bg-[#7F77DD] text-white font-bold text-[15px] active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(127,119,221,0.3)]"
          >
            Compartir
          </button>
        </div>
      </div>
    </div>
  );
}
