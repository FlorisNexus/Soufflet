/**
 * @file useAudio.ts
 * @description Coordinates microphone access and pitch detection.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { MicrophoneManager } from '../audio/MicrophoneManager'
import { PitchDetector, type DetectedNote } from '../audio/PitchDetector'
import type { AccordionSystem } from '../constants/layouts'
import { NoteMapper, type MappedNote } from '../audio/NoteMapper'

/**
 * State exposed by the useAudio hook.
 */
type AudioState = {
  /** Whether the microphone is currently listening */
  isListening: boolean
  /** The currently detected MIDI note, mapped to accordion button */
  detectedNote: MappedNote | null
  /** Current error message, if any */
  error: string | null
}

/**
 * Return type for the useAudio hook.
 */
type UseAudioReturn = AudioState & {
  /** Starts the microphone and detection pipeline */
  startListening: () => Promise<void>
  /** Stops the microphone and detection pipeline */
  stopListening: () => void
}

/**
 * Custom hook that encapsulates the audio processing pipeline.
 * Coordinates MicManager, PitchDetector, and NoteMapper.
 * @param system - The current accordion system (C or B).
 * @returns Audio state and control functions.
 */
export function useAudio(system: AccordionSystem): UseAudioReturn {
  const [state, setState] = useState<AudioState>({
    isListening: false,
    detectedNote: null,
    error: null,
  })

  // useRef keeps instances stable across re-renders (similar to private properties in Angular services)
  const micRef = useRef(new MicrophoneManager())
  const detectorRef = useRef(new PitchDetector())
  const mapperRef = useRef(new NoteMapper(system))

  // Sync the mapper when the system preference changes (C ↔ B)
  useEffect(() => {
    mapperRef.current.setSystem(system)
  }, [system])

  // Cleanup on unmount — equivalent to ngOnDestroy. We snapshot the refs
  // inside the effect so the lint rule (refs may have changed by cleanup time)
  // is satisfied.
  useEffect(() => {
    const detector = detectorRef.current
    const mic = micRef.current
    return () => {
      detector.stop()
      mic.stop()
    }
  }, [])

  const startListening = useCallback(async () => {
    try {
      const context = await micRef.current.start()
      const source = micRef.current.getSourceNode()
      detectorRef.current.start(context, source, (detected: DetectedNote | null) => {
        const mappedNote = detected ? mapperRef.current.map(detected.midiNote) : null
        setState(prev => ({ ...prev, detectedNote: mappedNote }))
      })
      setState(prev => ({ ...prev, isListening: true, error: null }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur microphone inconnue'
      setState(prev => ({ ...prev, error: message }))
    }
  }, [])

  const stopListening = useCallback(() => {
    detectorRef.current.stop()
    micRef.current.stop()
    setState({ isListening: false, detectedNote: null, error: null })
  }, [])

  return { ...state, startListening, stopListening }
}
