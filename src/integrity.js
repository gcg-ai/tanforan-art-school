// Client-side reproduction of Starling Lab `starling file cid`
// (integrity-v2 util.CalculateFileCid): CIDv1, raw multicodec (0x55),
// sha2-256 multihash, multibase base32 ("b"). Lets a viewer independently
// verify, in-browser, that the image they're seeing matches its claimed CID.

const B32 = 'abcdefghijklmnopqrstuvwxyz234567' // RFC4648 lower, multibase 'b'

function base32(bytes) {
  let bits = 0
  let value = 0
  let out = ''
  for (const b of bytes) {
    value = (value << 8) | b
    bits += 8
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31]
  return out
}

function toHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function computeIntegrity(arrayBuffer) {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', arrayBuffer))
  const cid = 'b' + base32(new Uint8Array([0x01, 0x55, 0x12, 0x20, ...digest]))
  return { cid, sha256: toHex(digest) }
}

// Fetch the artwork image, recompute its CID, and compare to the claimed one.
export async function verifyArtwork(artwork) {
  const res = await fetch(artwork.imagePath)
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`)
  const buf = await res.arrayBuffer()
  const { cid, sha256 } = await computeIntegrity(buf)
  return {
    ok: cid === artwork.ipfsCid && (!artwork.sha256 || sha256 === artwork.sha256),
    cid,
    sha256,
    expectedCid: artwork.ipfsCid,
  }
}
