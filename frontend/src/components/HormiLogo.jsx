export const HormiLogo = ({ size = 'md' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <div style={{
      width: size === 'lg' ? 48 : 36,
      height: size === 'lg' ? 48 : 36,
      background: 'linear-gradient(135deg, #7F77DD, #9B8FE8)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size === 'lg' ? 24 : 18,
      boxShadow: '0 4px 12px rgba(127,119,221,0.4)'
    }}>
      🐜
    </div>
    <div>
      <div style={{
        fontWeight: 800,
        fontSize: size === 'lg' ? 28 : 20,
        background: 'linear-gradient(135deg, #7F77DD, #5B52CC)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.5px'
      }}>
        HORMI
      </div>
      {size === 'lg' && (
        <div style={{ fontSize: 12, color: '#888', marginTop: -2 }}>
          Tu tiempo vale
        </div>
      )}
    </div>
  </div>
);
