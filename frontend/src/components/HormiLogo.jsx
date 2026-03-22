const HormiLogo = ({ size = 'md' }) => {
  const isDark = document.documentElement
    .getAttribute('data-theme') === 'dark'
  
  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', gap: '8px' 
    }}>
      <span style={{ 
        fontSize: size === 'lg' ? 32 : 22,
        lineHeight: 1
      }}>🐜</span>
      <span style={{
        fontWeight: 900,
        fontSize: size === 'lg' ? 28 : 18,
        color: isDark ? '#C4BEFF' : '#4338CA',
        letterSpacing: '-0.5px',
        lineHeight: 1
      }}>
        HORMI
      </span>
    </div>
  )
}

export { HormiLogo };
