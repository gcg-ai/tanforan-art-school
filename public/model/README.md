# Marble world models

The two World Labs **Marble** GLB exports are ~140 MB each — over GitHub's
100 MB file limit — so they are **not committed** to this repo.

To get the full first-person Marble worlds, place your exports here with these
exact names:

```
public/model/tanforan_messhall.glb   # "Mess Hall" world
public/model/art_studio.glb          # "Art Studio" world
```

**Without these files the app still runs** — each world gracefully falls back to
a procedural mess hall built from the NPS *Confinement and Ethnicity* / WRA
Theater-of-Operations barracks spec. All 8 artworks and every provenance feature
(panel, overlay, pipeline, Content Credentials, "How it was built") work either
way.

Spawn positions for the Art Studio world are pinned in `src/data/worlds.js`
(`spawn` / `look`); if you regenerate that GLB, re-tune those.
