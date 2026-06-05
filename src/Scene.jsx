import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import artworks from './data/artworks.json'

// ---------------------------------------------------------------------------
// Mode + tunables
// ---------------------------------------------------------------------------
const USE_GLB = true
const COLLIDE_BUFFER = 0.4        // stop this far (world units) from a wall
const GLB_ART_SCALE = 0.7         // base scale for artwork planes inside the GLB world
const EYE_ABOVE_FLOOR = 1.6       // camera eye height above the detected floor (world units)
const MOVE_SPEED_GLB = 4          // walking speed inside the GLB world
const ROLL_STEP = Math.PI / 24    // editor roll increment

const UNIT_Z = new THREE.Vector3(0, 0, 1)
const DOWN = new THREE.Vector3(0, -1, 0)
const CENTER = new THREE.Vector2(0, 0)

// Procedural fallback room dims (only used if the GLB is missing / fails)
const MOVE_SPEED_PROC = 8
let EYE_HEIGHT = 5
let ROOM_BOUNDS = { minX: -9, maxX: 9, minZ: 1, maxZ: 99 }
let ROOM_LENGTH = 100
let WALL_X = 9.7

function gradeColor(grade) {
  switch (grade) {
    case 'ground-truth': return 0x2d8a4e
    case 'corroborated': return 0xc9962b
    case 'synthetic': return 0xc0392b
    default: return 0x888888
  }
}

// ---------------------------------------------------------------------------
// Procedural fallback room (used only if the GLB can't load)
// ---------------------------------------------------------------------------
function buildProceduralRoom(scene) {
  const wood = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.9 })
  const floor = new THREE.MeshStandardMaterial({ color: 0x6B5B45, roughness: 0.95 })

  const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(20, 0.3, 100), floor)
  floorMesh.position.set(0, -0.15, 50)
  floorMesh.userData.provenanceGrade = 'corroborated'
  scene.add(floorMesh)

  const wallGeo = new THREE.BoxGeometry(0.5, 10, 100)
  const leftWall = new THREE.Mesh(wallGeo, wood.clone())
  leftWall.position.set(-10.25, 5, 50)
  leftWall.userData.provenanceGrade = 'corroborated'
  scene.add(leftWall)
  const rightWall = new THREE.Mesh(wallGeo, wood.clone())
  rightWall.position.set(10.25, 5, 50)
  rightWall.userData.provenanceGrade = 'corroborated'
  scene.add(rightWall)

  const sideGeo = new THREE.BoxGeometry(8, 10, 0.5)
  const leftEntry = new THREE.Mesh(sideGeo, wood.clone()); leftEntry.position.set(-6, 5, -0.25); scene.add(leftEntry)
  const rightEntry = new THREE.Mesh(sideGeo, wood.clone()); rightEntry.position.set(6, 5, -0.25); scene.add(rightEntry)
  const aboveDoor = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 0.5), wood.clone()); aboveDoor.position.set(0, 8.5, -0.25); scene.add(aboveDoor)
  const leftFar = new THREE.Mesh(sideGeo, wood.clone()); leftFar.position.set(-6, 5, 100.25); scene.add(leftFar)
  const rightFar = new THREE.Mesh(sideGeo, wood.clone()); rightFar.position.set(6, 5, 100.25); scene.add(rightFar)
  const aboveFar = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 0.5), wood.clone()); aboveFar.position.set(0, 8.5, 100.25); scene.add(aboveFar)

  const gableVerts = new Float32Array([-10,10,0, 10,10,0, 0,14,0])
  const gableGeo = new THREE.BufferGeometry()
  gableGeo.setAttribute('position', new THREE.BufferAttribute(gableVerts, 3))
  gableGeo.setIndex([0, 1, 2]); gableGeo.computeVertexNormals()
  const gableMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.9, side: THREE.DoubleSide })
  const gable1 = new THREE.Mesh(gableGeo, gableMat.clone()); gable1.position.z = -0.3; scene.add(gable1)
  const gable2 = new THREE.Mesh(gableGeo.clone(), gableMat.clone()); gable2.position.z = 100.3; scene.add(gable2)

  const roofAngle = Math.atan2(4, 10)
  const roofLen = Math.sqrt(100 + 16)
  const roofGeo = new THREE.PlaneGeometry(roofLen, 100)
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x6B5F50, roughness: 0.9, side: THREE.DoubleSide })
  const roofL = new THREE.Mesh(roofGeo, roofMat.clone()); roofL.position.set(-5, 12, 50); roofL.rotation.z = roofAngle; scene.add(roofL)
  const roofR = new THREE.Mesh(roofGeo.clone(), roofMat.clone()); roofR.position.set(5, 12, 50); roofR.rotation.z = -roofAngle; scene.add(roofR)

  const rafterMat = new THREE.MeshStandardMaterial({ color: 0x7A6B55, roughness: 0.85 })
  for (let i = 0; i < 50; i++) {
    const z = 1 + i * 2
    const rl = new THREE.Mesh(new THREE.BoxGeometry(roofLen, 0.15, 0.3), rafterMat.clone()); rl.position.set(-5, 12, z); rl.rotation.z = roofAngle; scene.add(rl)
    const rr = new THREE.Mesh(new THREE.BoxGeometry(roofLen, 0.15, 0.3), rafterMat.clone()); rr.position.set(5, 12, z); rr.rotation.z = -roofAngle; scene.add(rr)
  }

  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xd0d4dc, transparent: true, opacity: 0.15, roughness: 0.1 })
  for (let i = 0; i < 12; i++) {
    const z = 8 + i * 7.5
    const wl = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), glassMat.clone()); wl.position.set(-10.01, 8, z); wl.rotation.y = Math.PI / 2; scene.add(wl)
    const wr = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), glassMat.clone()); wr.position.set(10.01, 8, z); wr.rotation.y = -Math.PI / 2; scene.add(wr)
  }

  const tableMat = new THREE.MeshStandardMaterial({ color: 0x5C4A32, roughness: 0.9 })
  const legMat = new THREE.MeshStandardMaterial({ color: 0x4A3A25 })
  const benchMat = new THREE.MeshStandardMaterial({ color: 0x6B5740, roughness: 0.9 })
  for (const z of [10, 22, 34, 46, 58, 70, 82]) {
    for (const xOff of [-4, 4]) {
      const table = new THREE.Mesh(new THREE.BoxGeometry(3, 0.15, 8), tableMat.clone())
      table.position.set(xOff, 2.5, z); table.userData.provenanceGrade = 'corroborated'; scene.add(table)
      for (const dz of [-3, 3]) for (const dx of [-1.5, 0, 1.5]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 0.15), legMat.clone()); leg.position.set(xOff + dx, 1.25, z + dz); scene.add(leg)
      }
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 8), benchMat.clone()); b1.position.set(xOff - 2, 1.5, z); scene.add(b1)
      const b2 = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 8), benchMat.clone()); b2.position.set(xOff + 2, 1.5, z); scene.add(b2)
    }
  }
}

// ---------------------------------------------------------------------------
// Placement helper: given a configured raycaster + target mesh, return a
// transform that sits a plane flush on the hit surface, facing the viewer.
// ---------------------------------------------------------------------------
function placeOnWall(raycaster, target, viewerPos) {
  const hit = raycaster.intersectObject(target, true)[0]
  if (!hit || !hit.face) return null
  let n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize()
  // The world is double-sided; winding is unreliable. Force the normal to
  // point back toward the viewer so the artwork always faces us.
  if (n.dot(viewerPos.clone().sub(hit.point)) < 0) n.negate()
  const position = hit.point.clone().addScaledVector(n, 0.03)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(UNIT_Z, n)
  return { position, quaternion, point: hit.point.clone(), normal: n }
}

// ---------------------------------------------------------------------------
// Build the 8 artwork groups. mode 'glb' uses baked/auto wall placement;
// mode 'procedural' uses the original left/right wall distribution.
// ---------------------------------------------------------------------------
function buildArtworks(scene, artworkMeshes, artworkGroups, opts) {
  const loader = new THREE.TextureLoader()
  const mode = opts.mode

  // procedural distribution helpers
  const leftArts = artworks.filter(a => a.wall === 'left')
  const rightArts = artworks.filter(a => a.wall === 'right')
  const margin = ROOM_LENGTH * 0.1
  const usable = ROOM_LENGTH - 2 * margin
  const getZ = (idx, count) => (count <= 1 ? ROOM_LENGTH / 2 : margin + (idx / (count - 1)) * usable)

  for (let i = 0; i < artworks.length; i++) {
    const aw = artworks[i]
    const w = aw.width || 1.5
    const h = aw.height || 2.0
    const group = new THREE.Group()

    // Unlit plane (matches the baked world; lit material would render black)
    const placeholderColor = aw.provenanceGrade === 'synthetic' ? 0x3a2a2a : 0x252525
    const planeMat = new THREE.MeshBasicMaterial({ color: placeholderColor, side: THREE.FrontSide })
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), planeMat)
    plane.userData.artwork = aw
    group.add(plane)

    loader.load(
      aw.imagePath,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        plane.material.map = tex
        plane.material.color.set(0xffffff)
        plane.material.needsUpdate = true
      },
      undefined,
      () => {} // missing image → styled placeholder stays
    )

    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(w + 0.06, h + 0.06)),
      new THREE.LineBasicMaterial({ color: 0xd8c89a })
    )
    frame.position.z = 0.006
    group.add(frame)

    const dot = new THREE.Mesh(
      new THREE.CircleGeometry(0.07, 16),
      new THREE.MeshBasicMaterial({ color: gradeColor(aw.provenanceGrade) })
    )
    dot.position.set(w / 2 - 0.12, -h / 2 + 0.12, 0.02)
    group.add(dot)

    if (mode === 'glb') {
      const baked = aw[opts.posKey]
      group.scale.setScalar(GLB_ART_SCALE * (aw[opts.scaleKey] || 1))
      if (baked) {
        group.position.fromArray(baked)
        if (aw[opts.quatKey]) group.quaternion.fromArray(aw[opts.quatKey])
      } else {
        // Gallery auto-placement: spread each wall's artworks along the hall
        // length (Z) and cast toward that side wall (±X).
        const sideArts = artworks.filter((a) => a.wall === aw.wall)
        const j = sideArts.indexOf(aw)
        const K = sideArts.length
        const SPACING = 3.4
        const zOff = (j - (K - 1) / 2) * SPACING
        const sideSign = aw.wall === 'left' ? -1 : 1
        const origin = new THREE.Vector3(opts.spawn.x, opts.spawn.y, opts.spawn.z + zOff)
        let placed = null
        for (let t = 0; t < 7 && !placed; t++) {
          const ang = (t === 0 ? 0 : (t % 2 ? 1 : -1) * Math.ceil(t / 2) * 0.13)
          const dir = new THREE.Vector3(sideSign * Math.cos(ang), 0, Math.sin(ang)).normalize()
          opts.raycaster.set(origin, dir)
          opts.raycaster.far = opts.maxReach
          placed = placeOnWall(opts.raycaster, opts.worldRoot, origin)
        }
        if (placed) {
          // Hang vertically and face the hall centreline (clean, no tilt from
          // bumpy generated walls)
          const inward = new THREE.Vector3(origin.x - placed.point.x, 0, origin.z - placed.point.z).normalize()
          group.position.copy(placed.point).addScaledVector(inward, 0.06)
          group.quaternion.setFromUnitVectors(UNIT_Z, inward)
        } else {
          group.position.copy(origin).add(new THREE.Vector3(sideSign * 2.5, 0, 0))
          group.quaternion.setFromUnitVectors(UNIT_Z, new THREE.Vector3(-sideSign, 0, 0))
        }
      }
    } else {
      const isLeft = aw.wall === 'left'
      const wallArts = isLeft ? leftArts : rightArts
      const idx = wallArts.indexOf(aw)
      group.position.set(isLeft ? -WALL_X : WALL_X, EYE_HEIGHT + 0.5, getZ(idx, wallArts.length))
      group.rotation.set(0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0)
    }

    scene.add(group)
    artworkMeshes.push(plane)
    artworkGroups.push({ aw, group, plane, w, h })
  }
}

export default function ThreeScene({ onSelectArtwork, overlayActive, world }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const artworkMeshesRef = useRef([])
  const artworkGroupsRef = useRef([])
  const worldRef = useRef(null)        // { root, box, size, eyeOffset, moveSpeed }
  const editorRef = useRef({ active: false, index: 0, roll: 0 })
  const keysRef = useRef({})
  const clockRef = useRef(new THREE.Clock())
  const overlayMeshesRef = useRef([])
  const onSelectRef = useRef(onSelectArtwork)
  onSelectRef.current = onSelectArtwork

  useEffect(() => {
    const container = mountRef.current
    const w = container.clientWidth
    const h = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)
    if (!USE_GLB) scene.fog = new THREE.Fog(0xb8b0a8, 60, 120)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.05, 500)
    camera.position.set(0, EYE_HEIGHT, 5)
    camera.lookAt(0, EYE_HEIGHT, 50)

    // Renderer — baked GLB must render UNLIT (no tone mapping); procedural uses ACES
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    if (USE_GLB) {
      renderer.toneMapping = THREE.NoToneMapping
    } else {
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.2
    }
    renderer.setClearColor(0x0a0a0a)
    container.appendChild(renderer.domElement)

    // Lighting
    if (USE_GLB) {
      scene.add(new THREE.AmbientLight(0xffffff, 0.4)) // insurance only; MeshBasic ignores it
    } else {
      scene.add(new THREE.AmbientLight(0xc8c0b8, 0.4))
      for (const [x, z] of [[-15, 30], [-15, 70], [15, 30], [15, 70]]) {
        const dl = new THREE.DirectionalLight(0xd0d4dc, 0.5); dl.position.set(x, 8, z); scene.add(dl)
      }
      for (const z of [15, 30, 45, 60, 75, 90]) {
        const bulb = new THREE.PointLight(0xffe4b5, 0.6, 25, 2); bulb.position.set(0, 9.5, z); scene.add(bulb)
      }
    }

    // Shared state
    const artworkMeshes = []
    const artworkGroups = []
    artworkMeshesRef.current = artworkMeshes
    artworkGroupsRef.current = artworkGroups
    const placeRaycaster = new THREE.Raycaster()
    const collideRaycaster = new THREE.Raycaster()

    // Editor preview ghost
    const preview = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthTest: false })
    )
    preview.visible = false
    preview.renderOrder = 999
    scene.add(preview)

    // Loading + editor HUD overlays (imperative, self-contained)
    const overlayBase = 'position:absolute;left:50%;transform:translateX(-50%);font-family:Georgia,serif;color:#e8e0d4;pointer-events:none;z-index:50;'
    const loadingEl = document.createElement('div')
    loadingEl.style.cssText = overlayBase + 'top:50%;font-size:15px;letter-spacing:1px;text-align:center;'
    const editorHud = document.createElement('div')
    editorHud.style.cssText = overlayBase + "bottom:64px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;background:rgba(20,20,20,0.85);padding:8px 14px;border-radius:6px;border:1px solid #c9962b;display:none;white-space:nowrap;"

    function updateEditorHud() {
      const ed = editorRef.current
      if (!ed.active) { editorHud.style.display = 'none'; return }
      const entry = artworkGroups[ed.index]
      const label = entry ? `${entry.aw.artist} — ${entry.aw.title}` : '—'
      editorHud.style.display = 'block'
      editorHud.innerHTML = `<b style="color:#c9962b">PLACEMENT MODE</b> &nbsp; [${ed.index + 1}/${artworks.length}] ${label}` +
        `<br><span style="color:#9a9488">look at a wall · <b>click</b> place · <b>[ ]</b> cycle · <b>R</b> roll · <b>− =</b> size · <b>X</b> export · <b>E</b> exit</span>`
    }

    // -----------------------------------------------------------------------
    // World setup
    // -----------------------------------------------------------------------
    function setupGlbWorld(model) {
      model.updateMatrixWorld(true)
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())

      model.traverse((c) => {
        if (c.isMesh) {
          c.userData.provenanceGrade = 'corroborated'
          c.userData.isWorld = true
          if (c.material) {
            const mats = Array.isArray(c.material) ? c.material : [c.material]
            mats.forEach((m) => { m.side = THREE.DoubleSide; m.fog = false })
          }
        }
      })
      scene.add(model)

      // Spawn position. Sparse exports vary too much to auto-detect a floor
      // reliably, so a world may pin an explicit eye height / position. Else,
      // detect the floor with a down-ray (first surface below the bbox centre).
      const sp = world.spawn // optional [x, y, z]
      let spawnY, spawn
      if (sp) {
        spawn = new THREE.Vector3(sp[0], sp[1], sp[2])
        spawnY = sp[1]
      } else {
        placeRaycaster.set(new THREE.Vector3(center.x, box.max.y + 1, center.z), DOWN)
        placeRaycaster.far = size.y + 2
        const downHits = placeRaycaster.intersectObject(model, true)
        let floorY = center.y
        for (const h of downHits) { if (h.point.y < center.y) { floorY = h.point.y; break } }
        spawnY = floorY + EYE_ABOVE_FLOOR
        spawn = new THREE.Vector3(center.x, spawnY, center.z)
      }

      camera.position.copy(spawn)
      if (world.look) camera.lookAt(world.look[0], world.look[1], world.look[2])
      else camera.lookAt(spawn.x, spawnY, spawn.z - 1) // look down the hall (-Z)
      camera.far = Math.max(50, size.length() * 3)
      camera.updateProjectionMatrix()

      worldRef.current = { root: model, box, size, spawnY, moveSpeed: MOVE_SPEED_GLB }

      buildArtworks(scene, artworkMeshes, artworkGroups, {
        mode: 'glb', worldRoot: model, spawn, raycaster: placeRaycaster, maxReach: size.length(),
        posKey: world.posKey, quatKey: world.quatKey, scaleKey: world.scaleKey,
      })
      updateEditorHud()
    }

    function fallbackProcedural() {
      buildProceduralRoom(scene)
      buildArtworks(scene, artworkMeshes, artworkGroups, { mode: 'procedural' })
      camera.position.set(0, EYE_HEIGHT, 5)
      camera.lookAt(0, EYE_HEIGHT, 50)
    }

    const startPrompt = document.getElementById('start-prompt')
    if (USE_GLB) {
      if (startPrompt) startPrompt.style.display = 'none'
      loadingEl.textContent = 'Loading Marble world… 0%'
      container.appendChild(loadingEl)
      new GLTFLoader().load(
        world.glbUrl,
        (gltf) => {
          if (loadingEl.parentNode) loadingEl.parentNode.removeChild(loadingEl)
          if (startPrompt) startPrompt.style.display = 'block'
          setupGlbWorld(gltf.scene)
        },
        (xhr) => {
          if (xhr.lengthComputable && xhr.total) {
            loadingEl.textContent = `Loading Marble world… ${Math.floor((xhr.loaded / xhr.total) * 100)}%`
          } else {
            loadingEl.textContent = `Loading Marble world… ${(xhr.loaded / 1048576).toFixed(0)} MB`
          }
        },
        () => {
          if (loadingEl.parentNode) loadingEl.parentNode.removeChild(loadingEl)
          if (startPrompt) startPrompt.style.display = 'block'
          fallbackProcedural()
        }
      )
    } else {
      fallbackProcedural()
    }

    container.appendChild(editorHud)

    // -----------------------------------------------------------------------
    // Controls + input
    // -----------------------------------------------------------------------
    const controls = new PointerLockControls(camera, renderer.domElement)
    controls.addEventListener('lock', () => { if (startPrompt) startPrompt.style.display = 'none' })
    controls.addEventListener('unlock', () => { if (startPrompt) startPrompt.style.display = 'block' })

    function exportPlacements() {
      const out = artworkGroups.map(({ aw, group }) => ({
        id: aw.id,
        glbPosition: group.position.toArray().map((n) => +n.toFixed(4)),
        glbQuaternion: group.quaternion.toArray().map((n) => +n.toFixed(5)),
        glbScale: +(group.scale.x / GLB_ART_SCALE).toFixed(4),
      }))
      const json = JSON.stringify(out, null, 2)
      // eslint-disable-next-line no-console
      console.log('=== ARTWORK PLACEMENTS — paste glb* fields into artworks.json ===\n' + json)
      if (navigator.clipboard) navigator.clipboard.writeText(json).catch(() => {})
      try {
        const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
        const a = document.createElement('a'); a.href = url; a.download = 'artwork-placements.json'; a.click()
        URL.revokeObjectURL(url)
      } catch { /* ignore */ }
    }

    const onKeyDown = (e) => {
      keysRef.current[e.code] = true
      if (!USE_GLB) return
      const ed = editorRef.current
      if (e.code === 'KeyE') {
        ed.active = !ed.active; ed.roll = 0; preview.visible = false; updateEditorHud()
      } else if (ed.active) {
        const N = artworks.length
        if (e.code === 'BracketRight') { ed.index = (ed.index + 1) % N; ed.roll = 0 }
        else if (e.code === 'BracketLeft') { ed.index = (ed.index - 1 + N) % N; ed.roll = 0 }
        else if (e.code === 'KeyR') { ed.roll += ROLL_STEP }
        else if (e.code === 'Equal') { const g = artworkGroups[ed.index]?.group; if (g) g.scale.multiplyScalar(1.08) }
        else if (e.code === 'Minus') { const g = artworkGroups[ed.index]?.group; if (g) g.scale.multiplyScalar(0.92) }
        else if (e.code === 'KeyX') { exportPlacements() }
        updateEditorHud()
      }
    }
    const onKeyUp = (e) => { keysRef.current[e.code] = false }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    const selectAt = (ndc) => {
      placeRaycaster.setFromCamera(ndc, camera)
      placeRaycaster.far = camera.far
      const hits = placeRaycaster.intersectObjects(artworkMeshes, false)
      if (hits.length && hits[0].object.userData.artwork) {
        onSelectRef.current(hits[0].object.userData.artwork)
        return true
      }
      return false
    }

    const onMouseClick = (e) => {
      const ed = editorRef.current
      if (controls.isLocked) {
        // In editor mode a click commits the current placement and advances.
        if (USE_GLB && ed.active) {
          ed.index = (ed.index + 1) % artworks.length
          ed.roll = 0
          updateEditorHud()
          return
        }
        // Walking: crosshair (screen-centre) selection.
        if (selectAt(CENTER)) controls.unlock()
        return
      }
      // Not locked: a direct click on an artwork opens it; otherwise enter walk mode.
      const rect = renderer.domElement.getBoundingClientRect()
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      )
      if (selectAt(ndc)) return
      controls.lock()
    }
    renderer.domElement.addEventListener('click', onMouseClick)

    const onResize = () => {
      const nw = container.clientWidth, nh = container.clientHeight
      camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    // -----------------------------------------------------------------------
    // Animation loop
    // -----------------------------------------------------------------------
    let animId
    const dir = new THREE.Vector3()
    const right = new THREE.Vector3()
    const move = new THREE.Vector3()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const delta = clockRef.current.getDelta()
      const world = worldRef.current
      const ed = editorRef.current

      if (controls.isLocked) {
        camera.getWorldDirection(dir); dir.y = 0; dir.normalize()
        right.crossVectors(dir, camera.up).normalize()
        move.set(0, 0, 0)
        const k = keysRef.current
        if (k['KeyW'] || k['ArrowUp']) move.add(dir)
        if (k['KeyS'] || k['ArrowDown']) move.sub(dir)
        if (k['KeyD'] || k['ArrowRight']) move.add(right)
        if (k['KeyA'] || k['ArrowLeft']) move.sub(right)

        if (move.lengthSq() > 0) {
          const speed = world ? world.moveSpeed : MOVE_SPEED_PROC
          move.normalize().multiplyScalar(speed * delta)
          if (world) {
            // Component-wise raycast collision so we slide along walls
            const p = camera.position
            if (Math.abs(move.x) > 1e-5) {
              const s = Math.sign(move.x)
              collideRaycaster.set(p, new THREE.Vector3(s, 0, 0))
              collideRaycaster.far = Math.abs(move.x) + COLLIDE_BUFFER
              if (!collideRaycaster.intersectObject(world.root, true).length) p.x += move.x
            }
            if (Math.abs(move.z) > 1e-5) {
              const s = Math.sign(move.z)
              collideRaycaster.set(p, new THREE.Vector3(0, 0, s))
              collideRaycaster.far = Math.abs(move.z) + COLLIDE_BUFFER
              if (!collideRaycaster.intersectObject(world.root, true).length) p.z += move.z
            }
            // Keep a constant eye height (barracks floor is flat)
            p.y = world.spawnY
          } else {
            camera.position.add(move)
            camera.position.x = THREE.MathUtils.clamp(camera.position.x, ROOM_BOUNDS.minX, ROOM_BOUNDS.maxX)
            camera.position.z = THREE.MathUtils.clamp(camera.position.z, ROOM_BOUNDS.minZ, ROOM_BOUNDS.maxZ)
            camera.position.y = EYE_HEIGHT
          }
        }

        // Editor live preview: the ghost tracks the wall the user is facing
        if (USE_GLB && ed.active && world) {
          placeRaycaster.setFromCamera(CENTER, camera)
          placeRaycaster.far = camera.far
          const res = placeOnWall(placeRaycaster, world.root, camera.position)
          const entry = artworkGroups[ed.index]
          if (res && entry) {
            const rollQ = new THREE.Quaternion().setFromAxisAngle(UNIT_Z, ed.roll)
            const q = res.quaternion.clone().multiply(rollQ)
            // Move the actual artwork group so it places where the user clicks
            entry.group.position.copy(res.position)
            entry.group.quaternion.copy(q)
            preview.position.copy(res.position)
            preview.quaternion.copy(q)
            preview.scale.set(entry.w * entry.group.scale.x * 1.06, entry.h * entry.group.scale.y * 1.06, 1)
            preview.visible = true
          } else {
            preview.visible = false
          }
        } else if (preview.visible) {
          preview.visible = false
        }
      }

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('resize', onResize)
      renderer.domElement.removeEventListener('click', onMouseClick)
      if (loadingEl.parentNode) loadingEl.parentNode.removeChild(loadingEl)
      if (editorHud.parentNode) editorHud.parentNode.removeChild(editorHud)
      controls.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  // -------------------------------------------------------------------------
  // Provenance overlay (P): tint world + artworks by grade
  // -------------------------------------------------------------------------
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    for (const m of overlayMeshesRef.current) {
      if (m.parent) m.parent.remove(m)
      m.geometry.dispose(); m.material.dispose()
    }
    overlayMeshesRef.current = []

    if (!overlayActive) return

    // Tint room/world elements
    scene.traverse((child) => {
      if (!child.isMesh || !child.userData.provenanceGrade || child.userData.artwork) return
      const gc = gradeColor(child.userData.provenanceGrade)
      if (child.material && child.material.emissive) {
        child.material.emissive.set(gc); child.material.emissiveIntensity = 0.15
      } else if (child.userData.isWorld && child.material && child.material.color) {
        if (!child.userData._origColor) child.userData._origColor = child.material.color.clone()
        child.material.color.copy(child.userData._origColor).lerp(new THREE.Color(gc), 0.35)
      }
    })

    // Tint plane in front of each artwork
    artworkGroupsRef.current.forEach(({ aw, group, w, h }) => {
      const overlay = new THREE.Mesh(
        new THREE.PlaneGeometry(w + 0.15, h + 0.15),
        new THREE.MeshBasicMaterial({ color: gradeColor(aw.provenanceGrade), transparent: true, opacity: 0.3, side: THREE.DoubleSide })
      )
      overlay.position.z = 0.02
      group.add(overlay)
      overlayMeshesRef.current.push(overlay)
    })

    return () => {
      scene.traverse((child) => {
        if (!child.isMesh || !child.userData.provenanceGrade || child.userData.artwork) return
        if (child.material && child.material.emissive) {
          child.material.emissive.set(0x000000); child.material.emissiveIntensity = 0
        } else if (child.userData.isWorld && child.userData._origColor && child.material) {
          child.material.color.copy(child.userData._origColor)
        }
      })
      for (const m of overlayMeshesRef.current) {
        if (m.parent) m.parent.remove(m)
        m.geometry.dispose(); m.material.dispose()
      }
      overlayMeshesRef.current = []
    }
  }, [overlayActive])

  return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'relative' }} />
}
