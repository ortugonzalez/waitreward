import { useState, useEffect } from "react";
import { useTranslation } from "../i18n";

export const HormiLogo = ({ size = 'md' }) => {
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const logoBg = isDark 
    ? 'linear-gradient(135deg, #5B52CC, #7F77DD)' 
    : 'linear-gradient(135deg, #7F77DD, #9B8FE8)';
    
  const textBg = isDark
    ? 'linear-gradient(135deg, #A89FEE, #C4BEFF)'
    : 'linear-gradient(135deg, #7F77DD, #5B52CC)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: size === 'lg' ? 48 : 36,
        height: size === 'lg' ? 48 : 36,
        background: logoBg,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size === 'lg' ? 24 : 18,
        boxShadow: '0 4px 12px rgba(127,119,221,0.4)',
        flexShrink: 0
      }}>
        🐜
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          fontWeight: 900,
          fontSize: size === 'lg' ? 28 : 20,
          background: textBg,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
          lineHeight: 1
        }}>
          HORMI
        </div>
        {size === 'lg' && (
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, fontWeight: 'bold' }}>
            {t('tagline')}
          </div>
        )}
      </div>
    </div>
  );
};
