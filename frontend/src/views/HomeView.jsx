import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "../i18n";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const TIERS = [
  {
    nameKey: "bronzeMembership",
    emoji: "🥉",
    items: [
      { id: 1, emoji: "☕", nameKey: "coffeeShop", points: 30 },
      { id: 2, emoji: "💊", nameKey: "pharmacyDiscount", points: 100 },
      { id: 3, emoji: "🥗", nameKey: "dietetics", points: 80 },
      { id: 4, emoji: "💈", nameKey: "hairdresser", points: 60 },
    ]
  },
  {
    nameKey: "silverMembership",
    emoji: "🥈",
    items: [
      { id: 5, emoji: "🧠", nameKey: "psychology", points: 300 },
      { id: 6, emoji: "🦷", nameKey: "dentistry", points: 250 },
      { id: 7, emoji: "💆", nameKey: "kinesiology", points: 250 },
      { id: 8, emoji: "📋", nameKey: "labAnalysis", points: 200 },
    ]
  },
  {
    nameKey: "goldMembership",
    emoji: "🥇",
    items: [
      { id: 9, emoji: "🏋️", nameKey: "gym", points: 500 },
      { id: 10, emoji: "🩺", nameKey: "internalConsult", points: 500 },
      { id: 11, emoji: "💅", nameKey: "aesthetics", points: 400 },
      { id: 12, emoji: "🧘", nameKey: "yoga", points: 350 },
    ]
  },
  {
    nameKey: "premiumMembership",
    emoji: "💎",
    items: [
      { id: 13, emoji: "🌿", nameKey: "nutritionist", points: 600 },
      { id: 14, emoji: "👁️", nameKey: "ophthalmology", points: 600 },
      { id: 15, emoji: "🦴", nameKey: "traumatology", points: 700 },
      { id: 16, emoji: "⭐", nameKey: "vipBenefit", points: 800 },
    ]
  }
];

export function HomeView({ setActiveTab }) {
  const { t } = useTranslation();
  const [commerces, setCommerces] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [session, setSession] = useState(null);
  const [qrModal, setQrModal] = useState(null);
  const [generatingFor, setGeneratingFor] = useState(null);

  useEffect(() => {
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
          commerceName: "Comercio Adherido",
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
        name: t(item.nameKey) || item.nameKey, // Pass translated name
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
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)] pb-24 font-sans text-[var(--text-primary)] lg:pb-8 pt-4 transition-colors">
      
      <div className="px-4 flex flex-col gap-6 relative z-10 w-full max-w-full">

        {/* Tus Puntos HORMI disponibles */}
        <div className="bg-[#7F77DD] text-white rounded-[20px] shadow-[0_4px_16px_rgba(127,119,221,0.3)] p-6 flex flex-col items-center">
          <h2 className="text-sm font-bold uppercase tracking-widest opacity-90 mb-1">{t('yourAvailablePoints')}</h2>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-7xl font-black">{currentPts}</span>
            <span className="text-xl font-bold opacity-80">WP</span>
          </div>
        </div>

        {/* Catálogo tipo McDonald's */}
        <div className="flex flex-col gap-8 w-full mt-2">
          {TIERS.map((tier, tIdx) => (
            <div key={tIdx} className="w-full">
              
              <h2 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2 mb-3 px-1">
                <span className="text-2xl">{tier.emoji}</span> {t(tier.nameKey) || tier.nameKey}
              </h2>

              {/* Grid 2x2 en mobile, 4x4 en desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                {tier.items.map((item) => {
                  const canRedeem = currentPts >= item.points;
                  const isGenerating = generatingFor === item.id;
                  
                  return canRedeem ? (
                    // ── ESTADO APROBADO ──
                    <div
                      key={item.id}
                      className="bg-[var(--bg-secondary)] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4 flex flex-col items-center text-center border-2 border-[#7F77DD] w-full min-w-0 transition-colors"
                    >
                      <span className="text-[40px] leading-none mb-2">{item.emoji}</span>
                      
                      <h3 className="text-[13px] font-bold text-[var(--text-primary)] leading-tight flex-1 flex items-center justify-center min-h-[40px] px-1 w-full">
                        {t(item.nameKey) || item.nameKey}
                      </h3>
                      
                      <div className="mt-2 w-full">
                        <div className="inline-block bg-[#7F77DD]/10 text-[#7F77DD] px-3 py-1 rounded-[8px] font-black text-xs mb-3">
                          {item.points} WP
                        </div>

                        <button
                          onClick={() => handleRedeem(item)}
                          disabled={isGenerating}
                          className="w-full py-2.5 rounded-[12px] bg-[#7F77DD] text-white font-bold text-[13px] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center shadow-[0_4px_12px_rgba(127,119,221,0.3)]"
                        >
                          {isGenerating ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : t('redeem')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // ── ESTADO BLOQUEADO ──
                    <div
                      key={item.id}
                      className="bg-[var(--bg-primary)] opacity-80 rounded-[16px] p-4 flex flex-col items-center text-center border-2 border-transparent w-full min-w-0 transition-colors"
                    >
                      <span className="text-[40px] leading-none mb-2 opacity-40 grayscale">{item.emoji}</span>
                      
                      <h3 className="text-[13px] font-bold text-[var(--text-secondary)] leading-tight flex-1 flex items-center justify-center min-h-[40px] px-1 w-full">
                        {t(item.nameKey) || item.nameKey}
                      </h3>
                      
                      <div className="mt-2 w-full flex flex-col gap-2 items-center">
                        <div className="inline-block bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] px-3 py-1 rounded-[8px] font-black text-xs mb-1">
                          {item.points} WP
                        </div>

                        <div className="w-full py-2.5 rounded-[12px] bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] font-bold text-[13px] text-center transition-colors">
                          {t('missingPoints')} {item.points - currentPts} WP
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Comercios adheridos - Grid on Desktop */}
        <div className="mt-4 pt-8 border-t border-[var(--border)]">
          <h2 className="font-bold text-[var(--text-primary)] text-lg mb-4 px-1 flex items-center gap-2"><span>🏪</span> {t('partnerBusinesses')}</h2>
          
          <div
            className="flex lg:grid lg:grid-cols-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 gap-3 hide-scrollbar lg:overflow-visible"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {displayCommerces.map((c, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[240px] lg:w-auto bg-[var(--bg-secondary)] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4 flex items-center gap-3 border border-transparent hover:border-[#7F77DD]/30 transition-colors"
              >
                <div className="w-12 h-12 bg-[var(--bg-primary)] rounded-[12px] flex items-center justify-center text-2xl shrink-0">
                  {c.emoji || "🏪"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">{c.commerce_name}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] mb-1 truncate">{c.category || "General"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {qrModal && (
        <QRRewardModal data={qrModal} onClose={() => setQrModal(null)} t={t} />
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

// ── QR Modal ──────────────────────────────────────────────────────────────────
function QRRewardModal({ data, onClose, t }) {
  const expiresAt = data.expiresAt ? new Date(data.expiresAt) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const expiryStr = expiresAt.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const qrContent = data.validateUrl || data.qrCode;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mi HORMI Beneficio",
          text: `Tengo un descuento de ${data.discountValue} con HORMI! Entregale este código al comercio: ${data.qrCode}`,
        });
      } catch (err) { }
    } else {
      toast.success("Código copiado al portapapeles");
      navigator.clipboard.writeText(data.qrCode);
    }
  };

  const getConditions = (name) => {
    const n = name.toLowerCase();
    if (n.includes("farmacia") || n.includes("pharmacy")) {
      return (
        <ul className="list-disc pl-4 text-[11px] text-[var(--text-secondary)] flex flex-col gap-1 mt-1">
          <li>15% de descuento en medicamentos genéricos</li>
          <li>Tope máximo: $2.000 por canje</li>
          <li>Válido en productos seleccionados</li>
          <li>No acumulable con otras promociones</li>
        </ul>
      );
    }
    if (n.includes("odontología") || n.includes("dentistry")) {
      return (
        <ul className="list-disc pl-4 text-[11px] text-[var(--text-secondary)] flex flex-col gap-1 mt-1">
          <li>20% de descuento en consulta y limpieza</li>
          <li>Tope máximo: $5.000 por canje</li>
          <li>Primer turno únicamente</li>
          <li>Presentar QR al momento del turno</li>
        </ul>
      );
    }
    if (n.includes("laboratorio") || n.includes("analysis")) {
      return (
        <ul className="list-disc pl-4 text-[11px] text-[var(--text-secondary)] flex flex-col gap-1 mt-1">
          <li>25% de descuento en análisis de rutina</li>
          <li>Incluye: hemograma, glucemia, colesterol</li>
          <li>No incluye estudios de alta complejidad</li>
          <li>Válido de lunes a viernes</li>
        </ul>
      );
    }
    if (n.includes("dietética") || n.includes("dietetics")) {
      return (
        <ul className="list-disc pl-4 text-[11px] text-[var(--text-secondary)] flex flex-col gap-1 mt-1">
          <li>10% de descuento en productos naturales</li>
          <li>Tope máximo: $1.500 por canje</li>
          <li>No incluye suplementos importados</li>
        </ul>
      );
    }
    if (n.includes("descuento") || n.includes("discount")) {
      return (
        <ul className="list-disc pl-4 text-[11px] text-[var(--text-secondary)] flex flex-col gap-1 mt-1">
          <li>Descuento válido en productos seleccionados</li>
          <li>Consultar condiciones en el local</li>
          <li>No acumulable con otras promociones</li>
          <li>Presentar QR al momento del canje</li>
        </ul>
      );
    }
    return null;
  };

  const conditionsNode = getConditions(data.name);

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center font-sans" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" />
      
      <div
        className="relative w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border)] rounded-t-[24px] sm:rounded-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-2 shrink-0 flex flex-col items-center border-b border-[var(--border)]">
          <div className="w-12 h-1.5 bg-[var(--border)] rounded-full mb-4 sm:hidden" />
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3 w-full">
              <span className="text-3xl bg-[var(--bg-primary)] p-2 rounded-[16px]">{data.emoji}</span>
              <div className="flex-1">
                <h2 className="text-[17px] font-black text-[var(--text-primary)] leading-tight">{data.name}</h2>
                <p className="text-[12px] font-bold text-[#22C55E] flex items-center gap-1 mt-0.5">
                  <span>⏱️</span> {t('validUntil')} {expiryStr}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto w-full px-6 flex flex-col items-center gap-4 py-6" style={{ WebkitOverflowScrolling: "touch" }}>
          
          <div className="p-4 bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#F8F7FF] flex justify-center w-full">
            <QRCodeSVG value={qrContent} size={180} bgColor="#ffffff" fgColor="#1A1A2E" level="M" />
          </div>

          <div className="bg-[var(--bg-primary)] rounded-[16px] px-6 py-3 w-full text-center border border-[var(--border)]">
            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-1">{t('qrTitle')}</p>
            <p className="font-mono text-xl text-[var(--text-primary)] font-black tracking-[0.2em]">{data.qrCode}</p>
          </div>

          {conditionsNode && (
            <div className="bg-[var(--bg-primary)] w-full rounded-[16px] p-4 text-left border border-[var(--border)] mt-2 mb-2">
              <p className="text-[12px] font-bold text-[var(--text-primary)] mb-1 flex items-center gap-1">
                <span>📋</span> {t('conditions')}:
              </p>
              {conditionsNode}
            </div>
          )}
        </div>

        {/* Bottom Buttons stick */}
        <div className="p-6 pt-3 shrink-0 bg-[var(--bg-secondary)] border-t border-[var(--border)] w-full">
          <div className="flex w-full gap-3">
            <button onClick={onClose} className="flex-1 py-3.5 rounded-[16px] bg-[var(--bg-primary)] text-[var(--text-primary)] font-bold text-[15px] active:scale-[0.98] transition-all border border-[var(--border)]">
              {t('close')}
            </button>
            <button onClick={handleShare} className="flex-1 py-3.5 rounded-[16px] bg-[#7F77DD] text-white font-bold text-[15px] active:scale-[0.98] transition-all shadow-sm">
              {t('shareQR')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
