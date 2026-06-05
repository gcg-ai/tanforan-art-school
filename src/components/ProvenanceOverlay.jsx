export default function ProvenanceOverlay({ active }) {
  if (!active) return null

  return (
    <div style={styles.legend}>
      <div style={styles.heading}>PROVENANCE OVERLAY</div>
      <div style={styles.row}>
        <span style={{ ...styles.dot, backgroundColor: '#2d8a4e' }} />
        <span style={styles.label}>Green — Ground truth (documented source)</span>
      </div>
      <div style={styles.row}>
        <span style={{ ...styles.dot, backgroundColor: '#c9962b' }} />
        <span style={styles.label}>Amber — Corroborated (historical basis, partly inferred)</span>
      </div>
      <div style={styles.row}>
        <span style={{ ...styles.dot, backgroundColor: '#c0392b' }} />
        <span style={styles.label}>Red — Synthetic (no specific source)</span>
      </div>
    </div>
  )
}

const styles = {
  legend: {
    position: 'fixed',
    top: '16px',
    right: '16px',
    backgroundColor: 'rgba(26, 26, 26, 0.92)',
    color: '#e8e0d4',
    padding: '14px 18px',
    borderRadius: '6px',
    border: '1px solid #3a3a3a',
    zIndex: 500,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    minWidth: '260px',
    backdropFilter: 'blur(8px)',
  },
  heading: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    color: '#8a8278',
    marginBottom: '10px',
    fontWeight: '600',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '5px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  label: {
    fontSize: '12px',
    color: '#c8c0b4',
  },
}
