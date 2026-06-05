export default function PipelineView({ artwork, open, onClose }) {
  if (!open) return null

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.heading}>
          {artwork ? 'ASSET PROVENANCE CHAIN' : 'RECONSTRUCTION PIPELINE'}
        </span>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      {artwork ? (
        <ArtworkPipeline artwork={artwork} />
      ) : (
        <GeneralPipeline />
      )}
    </div>
  )
}

function ArtworkPipeline({ artwork }) {
  const steps = [
    {
      num: 1,
      label: 'SOURCE',
      content: (
        <>
          <div style={styles.stepTitle}>{artwork.title}</div>
          <div style={styles.stepDetail}>by {artwork.artist}</div>
          <div style={styles.stepDetail}>Archive: {artwork.source}</div>
        </>
      ),
    },
    {
      num: 2,
      label: 'CAPTURE',
      content: (
        <>
          <div style={styles.stepDetail}>
            Perma.cc: {artwork.permaUrl || <span style={styles.pending}>pending</span>}
          </div>
          <div style={styles.stepDetail}>
            IPFS CID: {artwork.ipfsCid || <span style={styles.pending}>pending</span>}
          </div>
        </>
      ),
    },
    {
      num: 3,
      label: 'ATTESTATION',
      content: (
        <>
          <div style={styles.stepDetail}>"{artwork.attestation.claim}"</div>
          <div style={styles.stepDetail}>
            Signed by: {artwork.attestation.curator} on {artwork.attestation.date}
          </div>
          <div style={styles.stepDetail}>
            Signature: {artwork.attestation.signature || <span style={styles.pending}>Unsigned</span>}
          </div>
        </>
      ),
    },
    {
      num: 4,
      label: 'PLACEMENT',
      content: (
        <>
          <div style={styles.stepDetail}>
            Wall: {artwork.wall} at Z={artwork.position[2]}
          </div>
          <div style={styles.stepDetail}>
            Grade: {artwork.provenanceGrade}
          </div>
        </>
      ),
    },
    {
      num: 5,
      label: 'DISPLAY',
      content: (
        <>
          <div style={styles.stepDetail}>
            Rendered as textured plane in Three.js
          </div>
          <div style={styles.stepDetail}>
            Dimensions: {artwork.width} × {artwork.height} ft
          </div>
        </>
      ),
    },
  ]

  return (
    <div style={styles.steps}>
      <div style={styles.flowLabel}>
        Document → Capture → Attestation → Placement → Display
      </div>
      {steps.map((step, i) => (
        <div key={step.num} style={styles.step}>
          <div style={styles.stepNum}>{step.num}</div>
          <div style={styles.stepBody}>
            <div style={styles.stepLabel}>{step.label}</div>
            {step.content}
          </div>
          {i < steps.length - 1 && <div style={styles.connector}>│</div>}
        </div>
      ))}
    </div>
  )
}

function GeneralPipeline() {
  const steps = [
    { label: 'REFERENCE', detail: 'NPS Confinement & Ethnicity study, WRA barracks specs, Dorothea Lange photographs, Hibi & Iyeki collections' },
    { label: 'GENERATION', detail: 'Marble (World Labs) GLB export from reference images and dimensional specs' },
    { label: 'IMPORT', detail: 'GLB loaded into Three.js via GLTFLoader, scaled to 1 unit = 1 foot, floor at Y=0' },
    { label: 'ARTWORK LAYER', detail: '8 artworks placed as textured planes on wall surfaces, each with individual provenance records' },
    { label: 'PROVENANCE BINDING', detail: 'Each asset carries source, capture state (Perma.cc/IPFS), attestation, and authenticity grade' },
    { label: 'DISPLAY', detail: 'Interactive first-person walkable scene with clickable provenance panels and color-coded overlay' },
  ]

  return (
    <div style={styles.steps}>
      <div style={styles.flowLabel}>
        Reference → Generation → Import → Artwork Layer → Provenance → Display
      </div>
      {steps.map((step, i) => (
        <div key={i} style={styles.step}>
          <div style={styles.stepNum}>{i + 1}</div>
          <div style={styles.stepBody}>
            <div style={styles.stepLabel}>{step.label}</div>
            <div style={styles.stepDetail}>{step.detail}</div>
          </div>
          {i < steps.length - 1 && <div style={styles.connector}>│</div>}
        </div>
      ))}
    </div>
  )
}

const styles = {
  panel: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '380px',
    height: '100vh',
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    color: '#e8e0d4',
    zIndex: 600,
    overflowY: 'auto',
    borderLeft: '1px solid #2a2a2a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    backdropFilter: 'blur(8px)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #2a2a2a',
  },
  heading: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    color: '#8a8278',
    fontWeight: '600',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#8a8278',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  steps: {
    padding: '16px 20px',
  },
  flowLabel: {
    fontSize: '11px',
    color: '#6a6258',
    marginBottom: '18px',
    paddingBottom: '12px',
    borderBottom: '1px solid #2a2a2a',
    fontFamily: "'SF Mono', 'Menlo', monospace",
    lineHeight: '1.5',
  },
  step: {
    position: 'relative',
    marginBottom: '4px',
  },
  stepNum: {
    position: 'absolute',
    left: 0,
    top: '2px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#2a2a2a',
    color: '#c9962b',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
  },
  stepBody: {
    marginLeft: '32px',
    paddingBottom: '8px',
  },
  stepLabel: {
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: '#c9962b',
    marginBottom: '4px',
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: '14px',
    color: '#e8e0d4',
    fontFamily: "'Georgia', serif",
    marginBottom: '2px',
  },
  stepDetail: {
    fontSize: '12px',
    color: '#9a9488',
    lineHeight: '1.5',
    marginBottom: '2px',
  },
  pending: {
    color: '#555',
    fontStyle: 'italic',
  },
  connector: {
    marginLeft: '9px',
    color: '#3a3a3a',
    fontSize: '14px',
    lineHeight: '1',
    marginBottom: '4px',
  },
}
