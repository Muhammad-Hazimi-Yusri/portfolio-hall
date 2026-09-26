import { useCallback, useEffect, useRef, useState } from 'react'
import { createSpatialSound } from './spatialSound'
import type { SpatialSound } from './spatialSound'

export type SpatialTone = SpatialSound

/** A quiet synthetic example, started only by the visitor's explicit button. */
export function useSpatialTone(active: boolean) {
  const audioRef = useRef<SpatialTone | null>(null)
  const fadingRef = useRef<SpatialTone | null>(null)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState(false)
  const [volume, setVolume] = useState(.35)
  const stop = useCallback((immediate = false) => {
    fadingRef.current?.stop(true); fadingRef.current = null
    const audio = audioRef.current
    audioRef.current = null
    audio?.stop(immediate)
    if (audio && !immediate) fadingRef.current = audio
    setPlaying(false)
  }, [])
  const toggle = () => {
    if (audioRef.current) { stop(); return }
    if (!active) return
    fadingRef.current?.stop(true); fadingRef.current = null
    let created: AudioContext | undefined
    try {
      const context = new AudioContext()
      created = context
      audioRef.current = createSpatialSound(context, volume); setPlaying(true); setError(false)
      void context.resume().catch(() => { if (audioRef.current?.context === context) { stop(true); setError(true) } })
    } catch { if (created && created !== audioRef.current?.context) void created.close().catch(() => undefined); stop(true); setError(true) }
  }
  useEffect(() => { if (!active) stop(true) }, [active, stop])
  useEffect(() => { audioRef.current?.setVolume(volume) }, [volume])
  useEffect(() => {
    const hide = () => { if (document.hidden) stop(true) }
    document.addEventListener('visibilitychange', hide)
    return () => { document.removeEventListener('visibilitychange', hide); audioRef.current?.stop(true); fadingRef.current?.stop(true); audioRef.current = null; fadingRef.current = null }
  }, [stop])
  return { audioRef, playing, error, toggle, volume, setVolume }
}
