const STEPS = [
  {
    n: 1,
    label: 'REFERENCE',
    body: 'One documented archival photograph of a WRA mess-hall interior served as the ground-truth reference — the windows, bench, and board wainscot below.',
  },
  {
    n: 2,
    label: 'CONCEPT RENDERS',
    body: 'AI image models (Gemini) generated interpretive views of the space to explore volume, framing, and dressing. These are interpretation, not evidence — see the disclosure below.',
  },
  {
    n: 3,
    label: 'WORLD GENERATION',
    body: 'The reference and concept images were fed into Marble (World Labs) to generate an explorable 3D world (Gaussian-splat reconstruction).',
  },
  {
    n: 4,
    label: 'MESH EXPORT',
    body: 'Marble exported the world as a textured GLB mesh, imported here into Three.js as the walkable shell.',
  },
  {
    n: 5,
    label: 'PROVENANCE LAYER',
    body: 'The eight verified, source-tracked artworks were placed on the walls on top of the generated shell — the layer the provenance pipeline actually protects.',
  },
]

const IMAGES = [
  {
    src: '/development/real_window_bench.png',
    label: 'Reference photograph',
    kind: 'documented',
    desc: 'Historical WRA-era mess-hall interior — the single ground-truth reference (windows, bench, board wainscot).',
  },
  {
    src: '/development/gemini_01_empty_interior.png',
    label: 'Concept · empty interior',
    kind: 'ai',
    desc: 'Gemini-generated study of the bare interior volume and roof framing.',
  },
  {
    src: '/development/gemini_03_window_tables.png',
    label: 'Concept · windows & tables',
    kind: 'ai',
    desc: 'Gemini render of the table rows and clerestory windows.',
  },
  {
    src: '/development/gemini_02_chalkboard.png',
    label: 'Concept · chalkboard view',
    kind: 'ai',
    desc: 'Interpretive render. The chalkboard is not confirmed by any located primary source — an AI interpolation.',
  },
  {
    src: '/development/gemini_04_artwall.png',
    label: 'Concept · student art wall',
    kind: 'ai',
    desc: 'Interpretive render of a gallery wall. The art-wall arrangement, stove, and supply shelving are AI interpolations, not documented.',
  },
]

export default function BuildingDevPanel({ open, onClose }) {
  if (!open) return null

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button style={styles.close} onClick={onClose}>✕</button>

        <div style={styles.header}>
          <div style={styles.kicker}>BEHIND THE RECONSTRUCTION</div>
          <h2 style={styles.title}>How the Art School Building Was Developed</h2>
          <p style={styles.intro}>
            The room you walk through is a generated reconstruction, not a scan of a surviving
            building. This panel exposes how it was made — and is honest about which parts are
            documented and which are interpretation.
          </p>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Pipeline</div>
          <div style={styles.flow}>Reference → Concept renders → Marble world → GLB → Provenance layer</div>
          {STEPS.map((s) => (
            <div key={s.n} style={styles.step}>
              <div style={styles.stepNum}>{s.n}</div>
              <div>
                <div style={styles.stepLabel}>{s.label}</div>
                <div style={styles.stepBody}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Source images</div>
          <div style={styles.grid}>
            {IMAGES.map((img) => (
              <figure key={img.src} style={styles.figure}>
                <div style={styles.imgWrap}>
                  <img src={img.src} alt={img.label} style={styles.img} />
                  <span style={{ ...styles.badge, ...(img.kind === 'documented' ? styles.badgeDoc : styles.badgeAi) }}>
                    {img.kind === 'documented' ? '● Documented' : '● AI-generated'}
                  </span>
                </div>
                <figcaption style={styles.caption}>
                  <span style={styles.capLabel}>{img.label}</span>
                  <span style={styles.capDesc}>{img.desc}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div style={styles.disclosure}>
          <div style={styles.discTitle}>⚠ Provenance disclosure</div>
          <p style={styles.discBody}>
            Only the reference photograph is documented. The concept renders were AI-generated and
            contain speculative elements — notably the <em>chalkboard</em>, <em>stove</em>, and the{' '}
            <em>arrangement of the student art wall</em> — that are <strong>not</strong> confirmed by any
            located primary source. They guided the spatial generation but should be read as
            interpretation. The verified layer of this project is the artworks, not the room.
          </p>
        </div>

        <div style={styles.actions}>
          <button style={styles.closeBtn} onClick={onClose}>Close ✕</button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.66)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
  },
  panel: {
    backgroundColor: '#1a1a1a', color: '#e8e0d4', borderLeft: '3px solid #c9962b',
    borderRadius: '4px', padding: '30px 34px', maxWidth: '720px', width: '92vw',
    maxHeight: '88vh', overflowY: 'auto', position: 'relative',
    fontFamily: "'Georgia','Times New Roman',serif", boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
  },
  close: {
    position: 'absolute', top: '16px', right: '18px', background: 'none', border: 'none',
    color: '#8a8278', fontSize: '18px', cursor: 'pointer',
  },
  header: { marginBottom: '22px', borderBottom: '1px solid #333', paddingBottom: '18px' },
  kicker: {
    fontSize: '11px', letterSpacing: '2px', color: '#c9962b', marginBottom: '8px',
    fontFamily: "'Helvetica Neue',Arial,sans-serif",
  },
  title: { margin: '0 0 10px 0', fontSize: '23px', fontWeight: 600, color: '#f0e8dc', lineHeight: 1.25 },
  intro: { margin: 0, fontSize: '14px', color: '#b8b0a4', lineHeight: 1.6 },
  section: { marginBottom: '22px' },
  sectionTitle: {
    fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#7a7468',
    marginBottom: '12px', fontFamily: "'Helvetica Neue',Arial,sans-serif",
  },
  flow: {
    fontSize: '12px', color: '#6a6258', marginBottom: '16px',
    fontFamily: "'SF Mono','Menlo',monospace", lineHeight: 1.5,
  },
  step: { display: 'flex', gap: '12px', marginBottom: '12px' },
  stepNum: {
    flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#2a2a2a',
    color: '#c9962b', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 600,
  },
  stepLabel: {
    fontSize: '11px', letterSpacing: '1px', color: '#c9962b', marginBottom: '3px', fontWeight: 600,
    fontFamily: "'Helvetica Neue',Arial,sans-serif",
  },
  stepBody: { fontSize: '13px', color: '#c8c0b4', lineHeight: 1.55, fontFamily: "'Helvetica Neue',Arial,sans-serif" },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  figure: { margin: 0 },
  imgWrap: { position: 'relative', borderRadius: '4px', overflow: 'hidden', border: '1px solid #333' },
  img: { width: '100%', display: 'block', aspectRatio: '3/2', objectFit: 'cover' },
  badge: {
    position: 'absolute', top: '8px', left: '8px', fontSize: '10px', padding: '3px 8px',
    borderRadius: '3px', fontFamily: "'Helvetica Neue',Arial,sans-serif", backdropFilter: 'blur(4px)',
  },
  badgeDoc: { backgroundColor: 'rgba(45,138,78,0.85)', color: '#eafff0' },
  badgeAi: { backgroundColor: 'rgba(192,57,43,0.82)', color: '#ffecea' },
  caption: { marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px' },
  capLabel: { fontSize: '13px', color: '#e8e0d4', fontFamily: "'Georgia',serif" },
  capDesc: { fontSize: '11.5px', color: '#9a9488', lineHeight: 1.45, fontFamily: "'Helvetica Neue',Arial,sans-serif" },
  disclosure: {
    backgroundColor: 'rgba(192,57,43,0.10)', border: '1px solid rgba(192,57,43,0.4)',
    borderRadius: '4px', padding: '14px 16px', marginBottom: '20px',
  },
  discTitle: {
    fontSize: '12px', color: '#e08a7e', marginBottom: '6px', fontWeight: 600,
    fontFamily: "'Helvetica Neue',Arial,sans-serif", letterSpacing: '0.5px',
  },
  discBody: { margin: 0, fontSize: '12.5px', color: '#cbb8b2', lineHeight: 1.6, fontFamily: "'Helvetica Neue',Arial,sans-serif" },
  actions: { display: 'flex', justifyContent: 'flex-end' },
  closeBtn: {
    padding: '8px 18px', backgroundColor: '#2a2a2a', color: '#e8e0d4', border: '1px solid #3a3a3a',
    borderRadius: '4px', cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: '13px',
  },
}
