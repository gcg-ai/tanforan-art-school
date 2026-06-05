import { useEffect, useCallback, useState } from 'react'
import ThreeScene from './Scene'
import ProvenancePanel from './components/ProvenancePanel'
import ProvenanceOverlay from './components/ProvenanceOverlay'
import PipelineView from './components/PipelineView'
import BuildingDevPanel from './components/BuildingDevPanel'
import HUD from './components/HUD'
import { useProvenanceStore } from './hooks/useProvenanceStore'
import { WORLDS, DEFAULT_WORLD_ID } from './data/worlds'

export default function App() {
  const {
    selectedArtwork,
    selectArtwork,
    clearSelection,
    overlayActive,
    toggleOverlay,
    pipelineOpen,
    togglePipeline,
  } = useProvenanceStore()

  const [worldId, setWorldId] = useState(DEFAULT_WORLD_ID)
  const [buildingDevOpen, setBuildingDevOpen] = useState(false)
  const world = WORLDS.find((w) => w.id === worldId) || WORLDS[0]

  const switchWorld = useCallback((id) => {
    setWorldId(id)
    clearSelection()
  }, [clearSelection])

  const handleKeyPress = useCallback((e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return
    if (e.ctrlKey || e.metaKey) return
    if (e.code === 'KeyP') toggleOverlay()
    if (e.code === 'KeyI') togglePipeline()
    if (e.code === 'KeyB') setBuildingDevOpen((v) => !v)
    if (e.code === 'Escape') { clearSelection(); setBuildingDevOpen(false) }
  }, [toggleOverlay, togglePipeline, clearSelection])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a', overflow: 'hidden' }}>
      {/* key forces a clean remount + GLB reload when switching worlds */}
      <ThreeScene
        key={world.id}
        world={world}
        onSelectArtwork={selectArtwork}
        overlayActive={overlayActive}
      />

      <HUD
        overlayActive={overlayActive}
        pipelineOpen={pipelineOpen}
        onToggleOverlay={toggleOverlay}
        onTogglePipeline={togglePipeline}
        worlds={WORLDS}
        worldId={world.id}
        onSwitchWorld={switchWorld}
        onOpenBuildingDev={() => setBuildingDevOpen(true)}
      />

      <ProvenanceOverlay active={overlayActive} />

      <PipelineView
        artwork={selectedArtwork}
        open={pipelineOpen}
        onClose={togglePipeline}
      />

      <ProvenancePanel
        artwork={selectedArtwork}
        onClose={clearSelection}
      />

      <BuildingDevPanel
        open={buildingDevOpen}
        onClose={() => setBuildingDevOpen(false)}
      />
    </div>
  )
}
