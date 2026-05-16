/**
 * @file useFreePlaySession.ts
 * @description React hook wiring the Free Play state machine to the
 * microphone + pitch-detector pipeline.
 *
 * WHY a dedicated hook: `useAudio` is system-aware (returns a button mapping).
 * Free Play just wants the raw MIDI + frequency, so we keep this thin and
 * reuse the pure reducer in `freePlayReducer.ts` for the actual rules.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { MicrophoneManager } from '../audio/MicrophoneManager'
import { PitchDetector, type DetectedNote } from '../audio/PitchDetector'
import {
  freePlayReducer,
  INITIAL_STATE,
  type FreePlayState,
  type PlayedNote,
} from './freePlayReducer'

export type { PlayedNote }

export type UseFreePlaySessionReturn = {
  timeline: PlayedNote[]
  currentNote: PlayedNote | null
  sessionStartedAt: number
  isListening: boolean
  error: string | null
  start: () => Promise<void>
  stop: () => void
  reset: () => void
}

let idSeed = 0
const newId = () => `pn-${++idSeed}`

export function useFreePlaySession(): UseFreePlaySessionReturn {
  const [state, setState] = useState<FreePlayState>(INITIAL_STATE)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // 0 is a placeholder; the session clock resets to a real performance.now()
  // when `start()` is called. Reading the clock during render would be impure.
  const [sessionStartedAt, setSessionStartedAt] = useState<number>(0)

  const micRef = useRef(new MicrophoneManager())
  const detectorRef = useRef(new PitchDetector())
  const sessionStartedAtRef = useRef<number>(0)

  const teardown = useCallback(() => {
    detectorRef.current.stop()
    micRef.current.stop()
  }, [])

  useEffect(() => () => teardown(), [teardown])

  const handleDetection = useCallback((detected: DetectedNote | null) => {
    const now = performance.now() - sessionStartedAtRef.current
    setState(prev => freePlayReducer(prev, { detected, now, newId }))
  }, [])

  const start = useCallback(async () => {
    setError(null)
    try {
      const ctx = await micRef.current.start()
      const source = micRef.current.getSourceNode()
      const t0 = performance.now()
      sessionStartedAtRef.current = t0
      setSessionStartedAt(t0)
      setState(INITIAL_STATE)

      detectorRef.current.start(ctx, source, handleDetection)
      setIsListening(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur microphone inconnue')
      setIsListening(false)
    }
  }, [handleDetection])

  const stop = useCallback(() => {
    // Flush the open note (if any) by feeding a silence event.
    const now = performance.now() - sessionStartedAtRef.current
    setState(prev => freePlayReducer(prev, { detected: null, now, newId }))
    teardown()
    setIsListening(false)
  }, [teardown])

  const reset = useCallback(() => {
    const t0 = performance.now()
    sessionStartedAtRef.current = t0
    setSessionStartedAt(t0)
    setState(INITIAL_STATE)
  }, [])

  return {
    timeline: state.timeline,
    currentNote: state.openNote,
    sessionStartedAt,
    isListening,
    error,
    start,
    stop,
    reset,
  }
}
