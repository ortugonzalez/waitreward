import { useEffect, useState } from 'react';

export function DemoNotification({ type, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!type) return;
    setIsExiting(false);
    const tExit = setTimeout(() => setIsExiting(true), 3600);
    const tClose = setTimeout(() => onClose(), 4000);
    return () => { clearTimeout(tExit); clearTimeout(tClose); };
  }, [type, onClose]);

  if (!type) return null;

  const content = {
    queue: {
      t1: "Fuiste registrado en cola 🏥",
      t2: "Tenés 5 pacientes delante. Demora est. 35 min."
    },
    points: {
      t1: "¡Recibiste 150 Puntos HORMI! ⏱️",
      t2: "Tu tiempo vale. Compensación por espera."
    },
    levelup: {
      t1: "¡Subiste a Plata! 🥈",
      t2: "Desbloqueaste nuevos beneficios. ¡Explorá el catálogo!"
    }
  }[type];

  if (!content) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '12px',
        left: '50%',
        width: '90%',
        maxWidth: '380px',
        background: 'rgba(30, 30, 30, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '14px 16px',
        zIndex: 99999,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        transform: isExiting ? 'translateX(-50%) translateY(-80px)' : 'translateX(-50%) translateY(0)',
        opacity: isExiting ? 0 : 1,
        transition: 'transform 0.4s ease-out, opacity 0.4s ease-out',
        animation: 'slideDownNav 0.4s ease-out forwards',
      }}
    >
      <style>{`
        @keyframes slideDownNav {
          from { opacity: 0; transform: translateX(-50%) translateY(-80px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      
      <div style={{
        width: 40, height: 40, flexShrink: 0,
        background: '#7F77DD', borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22
      }}>
        🐜
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ color: '#AAAAAA', fontSize: 12, fontWeight: 'bold' }}>HORMI</span>
          <span style={{ color: '#888888', fontSize: 11 }}>ahora</span>
        </div>
        <div style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', lineHeight: 1.2 }}>
          {content.t1}
        </div>
        <div style={{ color: '#BBBBBB', fontSize: 12, lineHeight: 1.3, marginTop: 2 }}>
          {content.t2}
        </div>
      </div>
    </div>
  );
}
