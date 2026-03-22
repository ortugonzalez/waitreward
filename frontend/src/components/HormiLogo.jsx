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

  const textColor = isDark ? '#C4BEFF' : '#5B52CC';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size === 'lg' ? 36 : 24,
        flexShrink: 0
      }}>
        🐜
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          fontWeight: 900,
          fontSize: size === 'lg' ? 28 : 20,
          color: textColor,
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
