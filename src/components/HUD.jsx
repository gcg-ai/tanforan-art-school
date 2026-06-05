import artworks from '../data/artworks.json'

export default function HUD({
  overlayActive, pipelineOpen, onToggleOverlay, onTogglePipeline,
  worlds = [], worldId, onSwitchWorld, onOpenBuildingDev,
}) {
  const counts = artworks.reduce((acc, a) => {
    acc[a.provenanceGrade] = (acc[a.provenanceGrade] || 0) + 1
    return acc
  }, {})

  return (
    <>
      {/* Title — top left */}
      <div style={styles.title}>
        <div style={styles.titleMain}>Tanforan Art School, 1942</div>
        <div style={styles.titleSub}>Mess Hall No. 14</div>
        <div style={styles.titleNote}>
          Note: Documented in sources as both Mess Hall #14 and Block 6 — discrepancy unresolved
        </div>
      </div>

      {/* World switcher — top center */}
      <div style={styles.switcher}>
        {worlds.map((w) => (
          <button
            key={w.id}
            style={{ ...styles.switchTab, ...(w.id === worldId ? styles.switchActive : {}) }}
            onClick={() => onSwitchWorld && onSwitchWorld(w.id)}
            title={w.sub}
          >
            {w.label}
          </button>
        ))}
        <button style={styles.builtBtn} onClick={onOpenBuildingDev} title="How this building was developed">
          ⓘ How it was built
        </button>
      </div>

      {/* Provenance counter — top right */}
      <div style={styles.counter}>
        <span style={styles.counterItem}>
          <span style={{ ...styles.counterDot, backgroundColor: '#2d8a4e' }} />
          {counts['ground-truth'] || 0} ground-truth
        </span>
        <span style={styles.counterItem}>
          <span style={{ ...styles.counterDot, backgroundColor: '#c9962b' }} />
          {counts['corroborated'] || 0} corroborated
        </span>
        <span style={styles.counterItem}>
          <span style={{ ...styles.counterDot, backgroundColor: '#c0392b' }} />
          {counts['synthetic'] || 0} synthetic
        </span>
      </div>

      {/* Controls reminder — bottom left */}
      <div style={styles.controls}>
        WASD move · Mouse look · Click artwork for provenance · P overlay · I pipeline · B build story
      </div>

      {/* Toggle buttons — bottom right */}
      <div style={styles.toggles}>
        <button
          style={{
            ...styles.toggleBtn,
            ...(overlayActive ? styles.toggleActive : {}),
          }}
          onClick={onToggleOverlay}
        >
          {overlayActive ? '● Overlay ON' : '○ Overlay'}
        </button>
        <button
          style={{
            ...styles.toggleBtn,
            ...(pipelineOpen ? styles.toggleActive : {}),
          }}
          onClick={onTogglePipeline}
        >
          {pipelineOpen ? '● Pipeline ON' : '○ Pipeline'}
        </button>
      </div>

      {/* Click to start prompt (when pointer not locked) */}
      <div style={styles.startPrompt} id="start-prompt">
        Click to enter
      </div>
    </>
  )
}

const styles = {
  title: {
    position: 'fixed',
    top: '16px',
    left: '16px',
    zIndex: 400,
    pointerEvents: 'none',
  },
  titleMain: {
    fontSize: '14px',
    color: 'rgba(232, 224, 212, 0.7)',
    fontFamily: "'Georgia', serif",
    letterSpacing: '0.5px',
  },
  titleSub: {
    fontSize: '11px',
    color: 'rgba(232, 224, 212, 0.4)',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    marginTop: '2px',
  },
  titleNote: {
    fontSize: '9px',
    color: 'rgba(232, 224, 212, 0.25)',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    marginTop: '4px',
    maxWidth: '280px',
    lineHeight: '1.3',
    fontStyle: 'italic',
  },
  switcher: {
    position: 'fixed',
    top: '14px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 450,
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.82)',
    padding: '5px',
    borderRadius: '8px',
    border: '1px solid rgba(58, 58, 58, 0.6)',
    backdropFilter: 'blur(8px)',
  },
  switchTab: {
    padding: '6px 16px',
    backgroundColor: 'transparent',
    color: 'rgba(232, 224, 212, 0.55)',
    border: '1px solid transparent',
    borderRadius: '5px',
    cursor: 'pointer',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: '12px',
  },
  switchActive: {
    backgroundColor: 'rgba(201, 150, 43, 0.15)',
    color: '#e8c87a',
    borderColor: '#c9962b',
  },
  builtBtn: {
    padding: '6px 14px',
    marginLeft: '4px',
    backgroundColor: 'transparent',
    color: 'rgba(232, 224, 212, 0.6)',
    border: '1px solid rgba(58, 58, 58, 0.6)',
    borderRadius: '5px',
    cursor: 'pointer',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: '12px',
  },
  counter: {
    position: 'fixed',
    top: '56px',
    right: '16px',
    zIndex: 400,
    display: 'flex',
    gap: '14px',
    pointerEvents: 'none',
  },
  counterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    color: 'rgba(232, 224, 212, 0.5)',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  counterDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  controls: {
    position: 'fixed',
    bottom: '16px',
    left: '16px',
    zIndex: 400,
    fontSize: '11px',
    color: 'rgba(232, 224, 212, 0.35)',
    fontFamily: "'SF Mono', 'Menlo', monospace",
    pointerEvents: 'none',
  },
  toggles: {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    zIndex: 400,
    display: 'flex',
    gap: '8px',
  },
  toggleBtn: {
    padding: '6px 14px',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    color: 'rgba(232, 224, 212, 0.5)',
    border: '1px solid rgba(58, 58, 58, 0.6)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: '11px',
    backdropFilter: 'blur(4px)',
  },
  toggleActive: {
    color: '#c9962b',
    borderColor: '#c9962b',
  },
  startPrompt: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 300,
    fontSize: '16px',
    color: 'rgba(232, 224, 212, 0.6)',
    fontFamily: "'Georgia', serif",
    letterSpacing: '2px',
    pointerEvents: 'none',
  },
}
