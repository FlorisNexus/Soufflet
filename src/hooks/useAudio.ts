// useAudio.ts — coordinates mic + pitch detection; Angular DeviceService + PitchService equivalent
// This is a custom hook: in React, hooks are how you share stateful logic between components
// (same role as @Injectable services in Angular, but scoped to the component tree)
import { useState, useCallback, useRef, useEffect } from 'react'
import { MicrophoneManager } from '../audio/MicrophoneManager'
import { PitchDetector, type DetectedNote } from '../audio/PitchDetector'
import type { AccordionSystem } from '../constants/layouts'
import { NoteMapper, type MappedNote } from '../audio/NoteMapper'

type AudioState = {
  isListening: boolean
  detectedNote: MappedNote | null
  error: string | null
}

type UseAudioReturn = AudioState & {
  startListening: () => Promise<void>
  stopListening: () => void
}

export function useAudio(system: AccordionSystem): UseAudioReturn {
  const [state, setState] = useState<AudioState>({
    isListening: false,
    detectedNote: null,
    error: null,
  })

  // useRef keeps instances stable across re-renders (Angular: private service properties)
  const micRef = useRef(new MicrophoneManager())
  const detectorRef = useRef(new PitchDetector())
  const mapperRef = useRef(new NoteMapper(system))

  // Sync the mapper when the system preference changes (C ↔ B)
  useEffect(() => {
    mapperRef.current.setSystem(system)
  }, [system])

  // Cleanup on unmount — equivalent to ngOnDestroy
  useEffect(() => {
    return () => {
      detectorRef.current.stop()
      micRef.current.stop()
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
