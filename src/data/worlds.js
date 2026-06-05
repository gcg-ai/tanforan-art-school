// The two rendered worlds. Each artwork in artworks.json can carry per-world
// baked placement under the keys below; if absent, the artwork auto-places by
// raycasting the imported mesh.
export const WORLDS = [
  {
    id: 'artstudio',
    label: 'Art Studio',
    sub: 'Converted mess-hall art school',
    glbUrl: '/model/art_studio.glb',
    posKey: 'glbPositionStudio',
    quatKey: 'glbQuaternionStudio',
    scaleKey: 'glbScaleStudio',
    spawn: [-0.7, 2.2, -1.7],   // explicit eye position (sparse export; auto-detect unreliable)
    look: [-0.7, 2.0, -10],
  },
  {
    id: 'messhall',
    label: 'Mess Hall',
    sub: 'Original reconstruction',
    glbUrl: '/model/tanforan_messhall.glb',
    posKey: 'glbPosition',
    quatKey: 'glbQuaternion',
    scaleKey: 'glbScale',
  },
]

export const DEFAULT_WORLD_ID = 'artstudio'
