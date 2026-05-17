/**
 * @file usePlayerState.ts
 * @description Timing engine for song playback using requestAnimationFrame.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import type { Song } from '../songs/schema'

/**
 * State for the song player.
 */
type PlayerState = {
  /** Whether the song is currently playing */
  isPlaying: boolean
  /** The current position in the song (beats) */
  currentBeat: number
  /** Multiplier for the song's BPM (0.5 to 1.2) */
  tempoMultiplier: number
  /** Whether the song has reached the end */
  isFinished: boolean
}

type UsePlayerStateReturn = PlayerState & {
  play: () => void
  stop: () => void
  seek: (beat: number) => void
  setTempoMultiplier: (m: number) => void
  totalBeats: number
}

/**
 * Custom hook that manages the timing and playback state of a song.
 * Uses requestAnimationFrame for precise synchronization with the Canvas renderer.
 * @param song - The song to play.
 * @returns Player state and control functions.
 */
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

  // `tickRef` breaks the self-reference cycle that would otherwise force `tick`
  // to capture itself in its own closure (a lint error: react-hooks/immutability).
  const tickRef = useRef<(timestamp: number) => void>(() => {})

  useEffect(() => {
    const loop = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp

      const elapsedSeconds = (timestamp - startTimeRef.current) / 1000
      const beatsPerSecond = (song.bpm / 60) * tempoRef.current
      const currentBeat = startBeatRef.current + elapsedSeconds * beatsPerSecond

      if (currentBeat >= totalBeats) {
        setState(prev => ({ ...prev, isPlaying: false, currentBeat: totalBeats, isFinished: true }))
        return
      }

      setState(prev => ({ ...prev, currentBeat }))
      rafRef.current = requestAnimationFrame(tickRef.current)
    }
    tickRef.current = loop
  }, [song.bpm, totalBeats])

  const play = useCallback(() => {
    startTimeRef.current = null
    // Respect any position set by seek(); default 0 on first play or after stop().
    setState(prev => ({ ...prev, isPlaying: true, isFinished: false, currentBeat: startBeatRef.current }))
    rafRef.current = requestAnimationFrame(tickRef.current)
  }, [])

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    startTimeRef.current = null
    startBeatRef.current = 0
    setState({ isPlaying: false, currentBeat: 0, tempoMultiplier: tempoRef.current, isFinished: false })
  }, [])

  const seek = useCallback((beat: number) => {
    const clamped = Math.max(0, Math.min(beat, totalBeats))
    startBeatRef.current = clamped
    startTimeRef.current = null
    setState(prev => {
      if (prev.isPlaying) {
        // Restart RAF from new position while keeping playback active.
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(tickRef.current)
      }
      return { ...prev, currentBeat: clamped, isFinished: false }
    })
  }, [totalBeats])

  const setTempoMultiplier = useCallback((m: number) => {
    // Re-anchor the beat clock at the current position so tempo changes apply
    // immediately without causing a visual jump (startBeatRef absorbs the drift).
    if (startTimeRef.current !== null) {
      const elapsed = (performance.now() - startTimeRef.current) / 1000
      startBeatRef.current = startBeatRef.current + elapsed * (song.bpm / 60) * tempoRef.current
      startTimeRef.current = null
    }
    tempoRef.current = m
    setState(prev => ({ ...prev, tempoMultiplier: m }))
  }, [song.bpm])

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  return { ...state, play, stop, seek, setTempoMultiplier, totalBeats }
}
