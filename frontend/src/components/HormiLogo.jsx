const HormiLogo = ({ size = 'md' }) => {
  const boxSize = size === 'lg' ? 48 : 36
  const fontSize = size === 'lg' ? 28 : 18
  const emojiSize = size === 'lg' ? 26 : 20

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px'
    }}>
      <div style={{
        width: boxSize,
        height: boxSize,
        background: '#FFFFFF',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: emojiSize,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        flexShrink: 0
      }}>
        🐜
      </div>
      <span style={{
        fontWeight: 900,
        fontSize,
        color: '#000000',
        WebkitTextFillColor: '#000000',
        background: 'none',
        letterSpacing: '-0.5px',
        lineHeight: 1
      }}>
        HORMI
      </span>
    </div>
  )
}

export { HormiLogo }
