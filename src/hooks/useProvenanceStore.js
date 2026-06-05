import { useState, useCallback } from 'react'

export function useProvenanceStore() {
  const [selectedArtwork, setSelectedArtwork] = useState(null)
  const [overlayActive, setOverlayActive] = useState(false)
  const [pipelineOpen, setPipelineOpen] = useState(false)

  const selectArtwork = useCallback((artwork) => {
    setSelectedArtwork(artwork)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedArtwork(null)
  }, [])

  const toggleOverlay = useCallback(() => {
    setOverlayActive(prev => !prev)
  }, [])

  const togglePipeline = useCallback(() => {
    setPipelineOpen(prev => !prev)
  }, [])

  return {
    selectedArtwork,
    selectArtwork,
    clearSelection,
    overlayActive,
    toggleOverlay,
    pipelineOpen,
    togglePipeline,
  }
}
