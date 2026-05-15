// usePlayerState.ts — timing engine for song playback; Angular TimerService equivalent
// Manages the BPM clock and current beat position using requestAnimationFrame
// for smooth 60fps synchronization with the FallingNotes canvas.
import { useState, useRef, useCallback, useEffect } from 'react'
import type { Song } from '../songs/schema'

type PlayerState = {
  isPlaying: boolean
  currentBeat: number
  tempoMultiplier: number
  isFinished: boolean
}

type UsePlayerStateReturn = PlayerState & {
  play: () => void
  stop: () => void
  setTempoMultiplier: (m: number) => void
}

export function usePlayerState(song: Song): UsePlayerStateReturn {
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentBeat: 0,
    tempoMultiplier: 1,
    isFinished: false,
  })

  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const startBeatRef = useRef(0)
  const tempoRef = useRef(1)

  const totalBeats = song.notes.length > 0 
    ? song.notes.reduce((max, n) => Math.max(max, n.startBeat + n.durationBeats), 0)
    : 0

  const tick = useCallback((timestamp: number) => {
    if (startTimeRef.current === null) startTimeRef.current = timestamp

    const elapsedSeconds = (timestamp - startTimeRef.current) / 1000
    const beatsPerSecond = (song.bpm / 60) * tempoRef.current
    const currentBeat = startBeatRef.current + elapsedSeconds * beatsPerSecond

    if (currentBeat >= totalBeats) {
      setState(prev => ({ ...prev, isPlaying: false, currentBeat: totalBeats, isFinished: true }))
      return
    }

    setState(prev => ({ ...prev, currentBeat }))
    rafRef.current = requestAnimationFrame(tick)
  }, [song.bpm, totalBeats])

  const play = useCallback(() => {
    startTimeRef.current = null
    startBeatRef.current = 0
    setState(prev => ({ ...prev, isPlaying: true, isFinished: false, currentBeat: 0 }))
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    startTimeRef.current = null
    setState({ isPlaying: false, currentBeat: 0, tempoMultiplier: tempoRef.current, isFinished: false })
  }, [])

  const setTempoMultiplier = useCallback((m: number) => {
    tempoRef.current = m
    setState(prev => ({ ...prev, tempoMultiplier: m }))
  }, [])

  // Cleanup on unmount (Angular ngOnDestroy equivalent)
  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  return { ...state, play, stop, setTempoMultiplier }
}
