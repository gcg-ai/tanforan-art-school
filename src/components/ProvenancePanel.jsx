import { useState, useEffect } from 'react'
import { gradeColor } from '../utils'
import { verifyArtwork } from '../integrity'

const gradeLabels = {
  'ground-truth': 'Ground Truth',
  'corroborated': 'Corroborated',
  'synthetic': 'Synthetic',
}

const gradeExplanations = {
  'ground-truth': 'This work is a documented original created at or documenting the Tanforan Assembly Center. Its source is identified and can be independently verified.',
  'corroborated': 'This element is supported by historical evidence but involves some interpretation or interpolation.',
  'synthetic': 'This element has no specific documented source. It represents the type of work produced at the school but is not a verified original.',
}

const mid = (s, head = 14, tail = 8) =>
  s && s.length > head + tail + 1 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s

export default function ProvenancePanel({ artwork, onClose }) {
  const [verify, setVerify] = useState(null) // null | 'checking' | {ok,cid} | {error}

  useEffect(() => { setVerify(null) }, [artwork && artwork.id])

  if (!artwork) return null
  const borderColor = gradeColor(artwork.provenanceGrade)
  const reg = artwork.registration

  const runVerify = async () => {
    if (!artwork.ipfsCid) return
    setVerify('checking')
    try {
      const r = await verifyArtwork(artwork)
      setVerify(r)
    } catch (e) {
      setVerify({ error: e.message })
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.panel, borderColor }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{artwork.title}</h2>
          <p style={styles.artist}>{artwork.artist}, {artwork.date}</p>
          <p style={styles.medium}>{artwork.medium}</p>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Provenance</div>
          <div style={styles.row}>
            <span style={styles.label}>Source:</span>
            <span style={styles.value}>{artwork.source}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Archive:</span>
            <span style={styles.value}>
              {artwork.sourceUrl ? (
                <a href={artwork.sourceUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
                  {artwork.sourceUrl.length > 50 ? artwork.sourceUrl.slice(0, 50) + '…' : artwork.sourceUrl}
                </a>
              ) : (
                <span style={styles.pending}>No URL available</span>
              )}
            </span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Perma.cc:</span>
            <span style={styles.value}>
              {artwork.permaUrl ? (
                <a href={artwork.permaUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>{artwork.permaUrl}</a>
              ) : (
                <span style={styles.pending}>Not yet captured</span>
              )}
            </span>
          </div>
        </div>

        {/* ── Content Credentials (Starling Lab integrity-v2) ── */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            Content Credentials <span style={styles.starling}>· Starling Lab</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>IPFS CID:</span>
            <span style={styles.value}>
              {artwork.ipfsCid ? (
                <code style={styles.code} title={artwork.ipfsCid}>{mid(artwork.ipfsCid, 16, 8)}</code>
              ) : <span style={styles.pending}>Not yet pinned</span>}
              {artwork.ipfsCid && <span style={styles.tag}>CIDv1 · raw · sha2-256</span>}
            </span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>SHA-256:</span>
            <span style={styles.value}>
              {artwork.sha256 ? <code style={styles.code} title={artwork.sha256}>{mid(artwork.sha256, 16, 8)}</code>
                : <span style={styles.pending}>—</span>}
            </span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>C2PA:</span>
            <span style={styles.value}>
              {artwork.c2paManifest ? (
                <a href={artwork.c2paManifest} target="_blank" rel="noopener noreferrer" style={styles.link}>View manifest ↗</a>
              ) : <span style={styles.pending}>—</span>}
              <span style={styles.tag}>prepared · unsigned</span>
            </span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>On-chain:</span>
            <span style={styles.value}>
              {reg ? (
                <>
                  <span style={reg.status === 'registered' ? styles.regOk : styles.regPending}>
                    {reg.status === 'registered' ? '● registered' : '○ pending registration'}
                  </span>
                  {reg.chains && <span style={styles.tag}>{reg.chains.join(' / ')}</span>}
                </>
              ) : <span style={styles.pending}>—</span>}
            </span>
          </div>

          {/* live verification result */}
          {verify === 'checking' && <div style={styles.verifyBox}>Computing SHA-256 in your browser…</div>}
          {verify && verify.ok && (
            <div style={{ ...styles.verifyBox, ...styles.verifyOk }}>
              ✓ Integrity verified — the image you are viewing reproduces its registered CID exactly.
            </div>
          )}
          {verify && verify.ok === false && !verify.error && (
            <div style={{ ...styles.verifyBox, ...styles.verifyBad }}>
              ✗ Mismatch — computed <code style={styles.codeSm}>{mid(verify.cid, 12, 6)}</code> ≠ claimed CID.
            </div>
          )}
          {verify && verify.error && (
            <div style={{ ...styles.verifyBox, ...styles.verifyBad }}>Verification error: {verify.error}</div>
          )}

          <p style={styles.note}>
            CID and SHA-256 are computed locally with Starling’s <code style={styles.codeSm}>integrity-v2</code> algorithm —
            independently verifiable now. C2PA signing and on-chain registration (Numbers / Cardano) are prepared and
            pending the class Starling server.
          </p>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Attestation</div>
          <div style={styles.row}><span style={styles.label}>Claim:</span><span style={styles.value}>{artwork.attestation.claim}</span></div>
          <div style={styles.row}><span style={styles.label}>Curator:</span><span style={styles.value}>{artwork.attestation.curator}</span></div>
          <div style={styles.row}><span style={styles.label}>Date:</span><span style={styles.value}>{artwork.attestation.date}</span></div>
          <div style={styles.row}>
            <span style={styles.label}>Signature:</span>
            <span style={styles.value}>{artwork.attestation.signature || <span style={styles.pending}>Unsigned</span>}</span>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Grade</div>
          <div style={styles.gradeRow}>
            <span style={{ ...styles.gradeDot, backgroundColor: borderColor }} />
            <span style={styles.gradeLabel}>{gradeLabels[artwork.provenanceGrade]}</span>
          </div>
          <p style={styles.gradeExplanation}>{gradeExplanations[artwork.provenanceGrade]}</p>
        </div>

        <div style={styles.actions}>
          <button
            style={{ ...styles.verifyBtn, ...(verify && verify.ok ? styles.verifyBtnOk : {}) }}
            onClick={runVerify}
            disabled={!artwork.ipfsCid || verify === 'checking'}
          >
            {verify === 'checking' ? 'Verifying…' : verify && verify.ok ? '✓ Verified' : '🛡 Verify integrity'}
          </button>
          {artwork.sourceUrl && (
            <button style={styles.sourceBtn} onClick={() => window.open(artwork.sourceUrl, '_blank', 'noopener')}>
              Source ↗
            </button>
          )}
          <button style={styles.closeBtn} onClick={onClose}>Close ✕</button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, cursor: 'default' },
  panel: { backgroundColor: '#1a1a1a', color: '#e8e0d4', borderLeft: '3px solid', borderRadius: '4px', padding: '28px 32px', maxWidth: '540px', width: '90vw', maxHeight: '86vh', overflowY: 'auto', fontFamily: "'Georgia','Times New Roman',serif", boxShadow: '0 8px 32px rgba(0,0,0,0.5)' },
  header: { marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '16px' },
  title: { margin: '0 0 6px 0', fontSize: '20px', fontWeight: 600, color: '#f0e8dc', lineHeight: 1.3 },
  artist: { margin: '0 0 4px 0', fontSize: '15px', color: '#c8c0b4' },
  medium: { margin: 0, fontSize: '13px', color: '#9a9488', fontStyle: 'italic' },
  section: { marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #2a2a2a' },
  sectionTitle: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#7a7468', marginBottom: '10px', fontFamily: "'Helvetica Neue',Arial,sans-serif" },
  starling: { color: '#c9962b', textTransform: 'none', letterSpacing: 0 },
  row: { display: 'flex', marginBottom: '6px', fontSize: '13px', lineHeight: 1.5, alignItems: 'baseline' },
  label: { flexShrink: 0, width: '80px', color: '#8a8278', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: '12px' },
  value: { flex: 1, color: '#d8d0c4', wordBreak: 'break-word', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'baseline' },
  link: { color: '#c9962b', textDecoration: 'none' },
  pending: { color: '#666', fontStyle: 'italic' },
  code: { fontFamily: "'SF Mono','Menlo',monospace", fontSize: '11px', backgroundColor: '#2a2a2a', padding: '2px 6px', borderRadius: '3px', color: '#cde8d6' },
  codeSm: { fontFamily: "'SF Mono','Menlo',monospace", fontSize: '11px', color: '#cdc6ba' },
  tag: { fontSize: '10px', color: '#7a7468', fontFamily: "'Helvetica Neue',Arial,sans-serif", border: '1px solid #3a3a3a', borderRadius: '3px', padding: '1px 5px' },
  regOk: { color: '#5cc98a', fontSize: '12px', fontFamily: "'Helvetica Neue',Arial,sans-serif" },
  regPending: { color: '#c9962b', fontSize: '12px', fontFamily: "'Helvetica Neue',Arial,sans-serif" },
  verifyBox: { marginTop: '10px', padding: '8px 10px', borderRadius: '4px', fontSize: '12px', fontFamily: "'Helvetica Neue',Arial,sans-serif", backgroundColor: '#222', color: '#c8c0b4', lineHeight: 1.5 },
  verifyOk: { backgroundColor: 'rgba(45,138,78,0.16)', border: '1px solid rgba(92,201,138,0.5)', color: '#bfe9cd' },
  verifyBad: { backgroundColor: 'rgba(192,57,43,0.16)', border: '1px solid rgba(192,57,43,0.5)', color: '#f0c4bd' },
  note: { fontSize: '11px', color: '#8a8278', lineHeight: 1.5, marginTop: '10px', marginBottom: 0, fontFamily: "'Helvetica Neue',Arial,sans-serif" },
  gradeRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  gradeDot: { width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' },
  gradeLabel: { fontSize: '14px', fontWeight: 600 },
  gradeExplanation: { fontSize: '12px', color: '#9a9488', lineHeight: 1.5, margin: 0, fontFamily: "'Helvetica Neue',Arial,sans-serif" },
  actions: { display: 'flex', gap: '10px', marginTop: '8px' },
  verifyBtn: { flex: 2, padding: '9px 16px', backgroundColor: '#2a2a2a', color: '#c9962b', border: '1px solid #3a3a3a', borderRadius: '4px', cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: '13px' },
  verifyBtnOk: { color: '#bfe9cd', borderColor: 'rgba(92,201,138,0.6)', backgroundColor: 'rgba(45,138,78,0.16)' },
  sourceBtn: { flex: 1, padding: '9px 16px', backgroundColor: '#2a2a2a', color: '#e8e0d4', border: '1px solid #3a3a3a', borderRadius: '4px', cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: '13px' },
  closeBtn: { flex: 1, padding: '9px 16px', backgroundColor: '#2a2a2a', color: '#e8e0d4', border: '1px solid #3a3a3a', borderRadius: '4px', cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: '13px' },
}
