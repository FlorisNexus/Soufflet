/**
 * @file Calibration.tsx
 * @description First-launch (and "Recalibrer") screen that detects whether the
 * user's accordion is a C-system or a B-system.
 *
 * WHY: pitchy can detect frequency but cannot tell which button was pressed.
 * The same physical button on a C-system produces a Do, on a B-system it
 * produces a Si. We ask the user to play their reference button
 * ("2nd row, 6th from the top"), listen for a stable pitch, and persist the
 * inferred system in localStorage so the rest of the app can map MIDI back
 * to the right physical button.
 *
 * UI flow: prompt → listening → confirmation (or manual fallback after 10 s).
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { MicrophoneManager } from '../audio/MicrophoneManager'
import { PitchDetector, type DetectedNote } from '../audio/PitchDetector'
import {
  inferSystemFromMidi,
  type Calibration,
} from '../hooks/useCalibration'
import type { AccordionSystem } from '../constants/layouts'
import { midiToFrenchNameWithOctave } from '../constants/notes'

/** Time the pitch must remain stable before we accept it. */
const STABLE_MS = 500
/** Manual fallback timer. */
const FALLBACK_MS = 10_000

type Props = {
  /** Called when the user confirms a system. */
  onConfirmed: (cal: Calibration) => void
}

type Phase = 'idle' | 'listening' | 'detected' | 'unrecognised' | 'fallback'

/**
 * Calibration flow.
 * Uses its own MicrophoneManager + PitchDetector (no `useAudio`) because
 * `useAudio` is system-aware, and during calibration we precisely don't have
 * a system yet — we need the raw MIDI value.
 */
export default function Calibration({ onConfirmed }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [detectedMidi, setDetectedMidi] = useState<number | null>(null)
  const [detectedSystem, setDetectedSystem] = useState<AccordionSystem | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Long-lived audio plumbing — stable across renders.
  const micRef = useRef(new MicrophoneManager())
  const detectorRef = useRef(new PitchDetector())

  // Stability tracking refs (avoid re-renders for hot-path values).
  const stableMidiRef = useRef<number | null>(null)
  const stableSinceRef = useRef<number>(0)
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** Cleans up audio resources and timers. */
  const teardown = useCallback(() => {
    detectorRef.current.stop()
    micRef.current.stop()
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
    stableMidiRef.current = null
    stableSinceRef.current = 0
  }, [])

  // Cleanup on unmount — equivalent to ngOnDestroy.
  useEffect(() => () => teardown(), [teardown])

  /** Starts the microphone and listens for a stable reference note. */
  const startListening = useCallback(async () => {
    setError(null)
    setPhase('listening')

    try {
      const ctx = await micRef.current.start()
      const source = micRef.current.getSourceNode()

      // Manual fallback timer — if nothing is recognised within 10 s,
      // show the C/B radio buttons.
      fallbackTimerRef.current = setTimeout(() => {
        setPhase('fallback')
        teardown()
      }, FALLBACK_MS)

      detectorRef.current.start(ctx, source, (note: DetectedNote | null) => {
        if (!note) {
          // Lost the signal — reset stability tracking.
          stableMidiRef.current = null
          stableSinceRef.current = 0
          return
        }

        const now = performance.now()
        if (stableMidiRef.current !== note.midiNote) {
          stableMidiRef.current = note.midiNote
          stableSinceRef.current = now
          return
        }

        if (now - stableSinceRef.current >= STABLE_MS) {
          const system = inferSystemFromMidi(note.midiNote)
          if (system) {
            setDetectedMidi(note.midiNote)
            setDetectedSystem(system)
            setPhase('detected')
            teardown()
          } else {
            // Stable but unrecognised pitch class — bounce and let the user retry.
            setDetectedMidi(note.midiNote)
            setPhase('unrecognised')
            // Reset for a new attempt while keeping the mic open.
            stableMidiRef.current = null
            stableSinceRef.current = 0
          }
        }
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur microphone inconnue'
      setError(message)
      setPhase('idle')
      teardown()
    }
  }, [teardown])

  const confirmDetected = useCallback(() => {
    if (!detectedSystem || detectedMidi === null) return
    onConfirmed({
      system: detectedSystem,
      referenceMidi: detectedMidi,
      calibratedAt: new Date().toISOString(),
    })
  }, [detectedSystem, detectedMidi, onConfirmed])

  const confirmManual = useCallback((system: AccordionSystem) => {
    // No reference MIDI available in fallback mode — use the canonical
    // C-system Do4 (60) or B-system Si3 (59) as a sane default.
    const referenceMidi = system === 'C' ? 60 : 59
    onConfirmed({
      system,
      referenceMidi,
      calibratedAt: new Date().toISOString(),
    })
  }, [onConfirmed])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-gray-900 rounded-3xl p-8 border border-white/5 shadow-2xl">
        <header className="mb-8 text-center">
          <div className="inline-block p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4 text-4xl">
            🎯
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Calibrons ton clavier</h1>
          <p className="text-gray-400 text-sm">
            Avant de jouer, on doit savoir si ton accordéon est en <strong>C-system</strong> ou <strong>B-system</strong>.
          </p>
        </header>

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-2xl p-4 mb-6 text-sm text-red-200">
            {error}
          </div>
        )}

        {phase === 'idle' && (
          <CalibrationIdle onStart={startListening} />
        )}

        {phase === 'listening' && (
          <CalibrationListening />
        )}

        {phase === 'unrecognised' && detectedMidi !== null && (
          <CalibrationUnrecognised
            detectedMidi={detectedMidi}
            onRetry={() => {
              setPhase('listening')
              // Stability tracking is already reset inside the callback.
            }}
            onManual={() => {
              setPhase('fallback')
              teardown()
            }}
          />
        )}

        {phase === 'detected' && detectedSystem && detectedMidi !== null && (
          <CalibrationDetected
            system={detectedSystem}
            midi={detectedMidi}
            onConfirm={confirmDetected}
            onRetry={() => { setDetectedSystem(null); setDetectedMidi(null); startListening() }}
          />
        )}

        {phase === 'fallback' && (
          <CalibrationFallback onChoose={confirmManual} />
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Inline presentational sub-components — split for clarity (<200 LoC) */
/* ------------------------------------------------------------------ */

function CalibrationIdle({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-black/30 rounded-2xl p-5 border border-white/5">
        <p className="text-sm text-gray-300 leading-relaxed">
          Joue le bouton de la <strong className="text-amber-400">2ᵉ rangée</strong>, le{' '}
          <strong className="text-amber-400">6ᵉ en partant du haut</strong>. Maintiens la note quelques secondes.
        </p>
      </div>
      <button
        onClick={onStart}
        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl text-lg transition-all active:scale-95 shadow-xl shadow-amber-500/20"
      >
        🎤 Commencer
      </button>
    </div>
  )
}

function CalibrationListening() {
  return (
    <div className="text-center py-8">
      <div className="inline-block w-16 h-16 rounded-full bg-amber-500/20 animate-pulse mb-4 flex items-center justify-center text-3xl">
        🎤
      </div>
      <p className="text-gray-300 font-medium">À l'écoute…</p>
      <p className="text-gray-500 text-xs mt-2">Joue ton bouton de référence et tiens la note.</p>
    </div>
  )
}

function CalibrationUnrecognised({
  detectedMidi,
  onRetry,
  onManual,
}: {
  detectedMidi: number
  onRetry: () => void
  onManual: () => void
}) {
  return (
    <div className="space-y-5">
      <div className="bg-orange-900/20 border border-orange-700/30 rounded-2xl p-4 text-sm text-orange-200">
        Note détectée : <strong>{midiToFrenchNameWithOctave(detectedMidi)}</strong>. Ce n'est ni un Do ni un Si — ce n'est probablement pas le bon bouton.
      </div>
      <button onClick={onRetry} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-2xl">
        Réessayer
      </button>
      <button onClick={onManual} className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-2xl text-sm">
        Choisir manuellement
      </button>
    </div>
  )
}

function CalibrationDetected({
  system,
  midi,
  onConfirm,
  onRetry,
}: {
  system: AccordionSystem
  midi: number
  onConfirm: () => void
  onRetry: () => void
}) {
  return (
    <div className="space-y-5">
      <div className="bg-green-900/20 border border-green-700/30 rounded-2xl p-5 text-center">
        <div className="text-3xl mb-2">✅</div>
        <p className="text-sm text-gray-300">
          Détecté : <strong className="text-green-400">{midiToFrenchNameWithOctave(midi)}</strong>
        </p>
        <p className="text-2xl font-black text-white mt-2">
          Tu es en {system}-system
        </p>
      </div>
      <button onClick={onConfirm} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl text-lg">
        Confirmer
      </button>
      <button onClick={onRetry} className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-2xl text-sm">
        Réessayer
      </button>
    </div>
  )
}

function CalibrationFallback({ onChoose }: { onChoose: (s: AccordionSystem) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400 text-center">
        Pas de note reconnue. Choisis manuellement :
      </p>
      <button onClick={() => onChoose('C')} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 rounded-2xl">
        C-system
      </button>
      <button onClick={() => onChoose('B')} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-2xl">
        B-system
      </button>
    </div>
  )
}
