// v3 - hormiga pura sin fondo
const HormiLogo = ({ size = 'md' }) => {
  const isDark = document.documentElement
    .getAttribute('data-theme') === 'dark'
  const textColor = isDark ? '#C4BEFF' : '#4338CA'
  const fontSize = size === 'lg' ? 28 : 18
  const emojiSize = size === 'lg' ? 32 : 22

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      textDecoration: 'none'
    }}>
      <span style={{ fontSize: emojiSize, lineHeight: 1 }}>🐜</span>
      <span style={{
        fontWeight: 900,
        fontSize,
        color: textColor,
        letterSpacing: '-0.5px',
        lineHeight: 1,
        WebkitTextFillColor: textColor,
        background: 'none'
      }}>HORMI</span>
    </div>
  )
}

export { HormiLogo };
