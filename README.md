# Tanforan Art School, 1942 — a provenance-tracked 3D reconstruction

A first-person, walkable reconstruction of the **Tanforan Assembly Center**
mess-hall art school (a 1942 Japanese American incarceration site in San Bruno,
CA), built for **Stanford EE 292J: Designing for Authenticity**.

The thesis: *a 3D historical reconstruction should carry embedded provenance so a
viewer can verify what they are seeing and distinguish documented ground truth
from interpolation or invention.* The room is a generated reconstruction; the
**artworks on its walls are the verified layer** the provenance pipeline
actually protects — each one traceable from archival source to a cryptographic
content credential you can check live, in your browser.

---

## Features

- **Two walkable worlds** generated with [World Labs **Marble**](https://marble.worldlabs.ai/) — *Mess Hall* and *Art Studio* — switchable in the top bar. (The GLBs aren't in the repo — see [Marble world models](#marble-world-models).)
- **8 authenticated historical artworks** placed on the walls. Click any one for a full **provenance panel**.
- **Content Credentials** (Starling Lab [`integrity-v2`](https://github.com/starlinglab/integrity-v2)): a real **IPFS CIDv1 + SHA-256** per artwork, a **C2PA manifest**, on-chain registration status, and a live **🛡 Verify integrity** button that re-hashes the displayed image in-browser and confirms it reproduces the registered CID exactly.
- **Provenance overlay** (`P`): color-codes the whole scene by authenticity grade — green = ground-truth, amber = corroborated, red = synthetic.
- **Reconstruction pipeline** (`I`): the chain from archival source → capture → attestation → placement → display.
- **"How it was built"**: the honest development story (one documented reference photo → AI **Gemini** concept renders → Marble 3D world → GLB), with every image badged *Documented* vs *AI-generated* and a provenance disclosure.

## Controls

`WASD` move · mouse look · **click** an artwork for provenance · `P` overlay · `I` pipeline · `B` build story · `E` placement editor (GLB worlds)

## Tech stack

Vite + React 18, vanilla **Three.js** (`GLTFLoader`, `PointerLockControls`). No
backend — all provenance data is static JSON in `src/data/`. Cryptographic
hashing uses the Web Crypto API (`crypto.subtle`).

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
```

## Marble world models

The two Marble GLB exports are ~140 MB each (over GitHub's 100 MB limit) and are
**not committed**. Drop your exports in `public/model/` as `tanforan_messhall.glb`
and `art_studio.glb` (see [`public/model/README.md`](public/model/README.md)).
**Without them the app falls back to a procedural mess hall** built from the NPS
*Confinement and Ethnicity* spec — all artworks and provenance features still work.

## Authenticity / Content Credentials

The `ipfsCid` and `sha256` for each artwork are computed with the **exact**
algorithm from Starling's `integrity-v2` (`util.CalculateFileCid`): CIDv1, raw
multicodec, sha2-256 multihash, multibase base32 — i.e. the same value
`starling file cid <image>` produces. C2PA manifests (`public/c2pa/*.c2pa.json`)
are generated from the kit's `densho.json` template.

- **Verifiable now (locally):** IPFS CID + SHA-256. The in-browser *Verify
  integrity* check proves the rendered image matches its registered content ID.
- **Prepared, pending the class Starling server:** C2PA signing
  (`starling file c2pa`) and on-chain registration on Numbers / Cardano
  (`starling file register --on numbers <cid>` — the command is stored per
  artwork in `src/data/artworks.json`).

## Artwork sources & credits

| Work | Artist | Source |
|------|--------|--------|
| Still Life Class / Morning Class / Children After Hours | Dorothea Lange (WRA) | National Archives via Calisphere — **public domain** |
| Tanforan Assembly Center / A Few Renovated Horse Stables | Hisako Hibi | Japanese American National Museum |
| Mess Hall #7 / #9 | Kenneth Nobuji Iyeki | Densho Digital Repository (`ddr-densho-392`) |
| *Cicada on a Grapevine* (representative sumi-e) | Bokurin Guan | The Met (CC0) — a **synthetic** placeholder, not a documented Tanforan work |

Archival images are used for non-commercial educational research with attribution.

## Honesty notes

- The room shell is a **generated reconstruction** (graded *corroborated*), not a
  scan. No stove, chalkboard, or supply shelving is asserted as documented —
  where they appear in Marble worlds they originate from AI interpolation, and
  the *How it was built* panel says so.
- The mess hall number is documented as both **#14** and **Block 6** — the
  discrepancy is surfaced, not silently resolved.

## Acknowledgments

[Starling Lab](https://www.starlinglab.org/) `integrity-v2` · [Densho](https://densho.org/) · [JANM](https://janm.org/) · U.S. National Archives · [World Labs Marble](https://marble.worldlabs.ai/) · Stanford EE 292J.
