/**
 * @file FreePlay.tsx
 * @description Free-play mode: live pitch detection with a scrolling ribbon and
 * a multi-position keyboard highlight. The user plays whatever they want and
 * the app annotates each note in real time so they can map the instrument's
 * geography by experimenting.
 *
 * WHY: the user has a 5-row chromatic accordion where each note is reachable
 * from several positions (rows 4–5 duplicate rows 1–2). Visualising every
 * candidate button each time a note fires builds that mental map without
 * pre-loaded songs or solfège.
 *
 * NOTE: implementation lives mostly in `useFreePlaySession` (state machine)
 * and `PianoRoll` (Canvas). This file is the page composition.
 */

import { useCallback, useEffect, useState } from 'react'
import type { AccordionSystem } from '../constants/layouts'
import { useFreePlaySession } from '../hooks/useFreePlaySession'
import PianoRoll from '../display/PianoRoll'
import ButtonLayout from '../display/ButtonLayout'
import {
  centsFromHz,
  midiToFrenchNameWithOctave,
} from '../constants/notes'
import { AudioReferencePlayer } from '../audio/AudioReferencePlayer'

type Props = {
  system: AccordionSystem
  onBack: () => void
  onRecalibrate: () => void
}

export default function FreePlay({ system, onBack, onRecalibrate }: Props) {
  const {
    timeline,
    currentNote,
    sessionStartedAt,
    isListening,
    error,
    start,
    stop,
    reset,
  } = useFreePlaySession()

  const [audioRefEnabled, setAudioRefEnabled] = useState(false)
  const [audioRef] = useState(() => new AudioReferencePlayer())

  // Keep the player in sync with the toggle, and release WebAudio resources
  // when the page unmounts.
  useEffect(() => { audioRef.setMuted(!audioRefEnabled) }, [audioRef, audioRefEnabled])
  useEffect(() => () => audioRef.dispose(), [audioRef])

  const playReference = useCallback(
    (midi: number) => {
      if (!audioRefEnabled) return
      audioRef.play(midi)
    },
    [audioRef, audioRefEnabled],
  )

  const stopRef = useCallback(() => {
    audioRef.stopAll()
  }, [audioRef])

  const handleBack = useCallback(() => {
    stop()
    stopRef()
    onBack()
  }, [stop, stopRef, onBack])

  // Format the central readout: name + Hz + cents.
  const readout = (() => {
    if (!currentNote) return { name: '—', hz: '', cents: '' }
    const name = midiToFrenchNameWithOctave(currentNote.midi)
    const hz = `${currentNote.frequencyHz.toFixed(1)} Hz`
    const cents = centsFromHz(currentNote.frequencyHz, currentNote.midi)
    const sign = cents >= 0 ? '+' : ''
    return { name, hz, cents: `${sign}${cents.toFixed(0)}¢` }
  })()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col max-w-5xl mx-auto overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
        <button
          onClick={handleBack}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all active:scale-90"
        >
          <span className="text-2xl">←</span>
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black truncate tracking-tight">Mode libre</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">
            {isListening ? '🎤 À l\'écoute' : '⏸ Inactif'}
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs font-bold text-gray-400 cursor-pointer select-none px-3 py-2 rounded-xl hover:bg-gray-800 transition-colors">
          <input
            type="checkbox"
            checked={audioRefEnabled}
            onChange={e => setAudioRefEnabled(e.target.checked)}
            className="w-4 h-4 accent-amber-500 rounded border-gray-700 bg-gray-800"
          />
          RÉFÉRENCE AUDIO
        </label>

        <button
          onClick={onRecalibrate}
          className="hidden sm:inline-flex text-xs font-bold text-gray-500 hover:text-amber-400 px-3 py-2 rounded-xl hover:bg-gray-800 transition-colors"
          title="Recalibrer C/B-system"
        >
          ⚙
        </button>
      </header>

      {error && (
        <div className="bg-red-900/30 border-b border-red-700/30 text-red-200 text-sm px-6 py-3">
          {error}
        </div>
      )}

      {/* Main content: two columns on desktop (left = roll+readout+controls, right = keyboard) */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

        {/* ── Left column ── */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* PianoRoll */}
          <section className="bg-black border-b border-white/5 p-4">
            <PianoRoll
              timeline={timeline}
              sessionStartedAt={sessionStartedAt}
              height={140}
              onBlockClick={playReference}
            />
          </section>

          {/* Central readout — fixed height so the keyboard column never shifts
               when content transitions between "—" and "Do 4 — 261.6 Hz — +5¢". */}
          <section className="bg-gray-900 border-b border-white/5 px-6 py-4 flex flex-col sm:flex-row items-center justify-center gap-4 h-28 shrink-0">
            <div className="text-center">
              <div className="text-5xl font-black tracking-tight leading-none">{readout.name}</div>
              <div className="text-gray-400 text-sm font-mono mt-1 h-5">
                {readout.hz}{readout.cents && <span className="text-amber-400 ml-2">{readout.cents}</span>}
              </div>
            </div>
            <button
              onClick={() => currentNote && playReference(currentNote.midi)}
              disabled={!currentNote || !audioRefEnabled}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black disabled:bg-gray-800 disabled:text-gray-600 transition-all active:scale-95"
              title={audioRefEnabled ? 'Jouer la référence' : 'Active la référence audio dans le menu'}
            >
              ▶ Référence
            </button>
          </section>

          {/* Footer controls */}
          <footer className="bg-gray-950 px-6 py-4 flex gap-3 justify-center mt-auto">
            {!isListening ? (
              <button
                onClick={start}
                className="flex-1 max-w-xs bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl text-lg transition-all active:scale-95"
              >
                🎤 Démarrer
              </button>
            ) : (
              <>
                <button
                  onClick={reset}
                  className="flex-1 max-w-xs bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-2xl text-lg transition-all active:scale-95"
                >
                  ↻ Réinitialiser
                </button>
                <button
                  onClick={stop}
                  className="flex-1 max-w-xs bg-red-500 hover:bg-red-400 text-white font-black py-4 rounded-2xl text-lg transition-all active:scale-95"
                >
                  ⏸ Pause
                </button>
              </>
            )}
          </footer>
        </div>

        {/* ── Right column — vertical keyboard ── */}
        <aside className="bg-gray-900/80 border-t md:border-t-0 md:border-l border-white/5 p-4 flex items-start justify-center overflow-y-auto">
          <ButtonLayout
            system={system}
            activeMidi={currentNote?.midi ?? null}
          />
        </aside>

      </div>
    </div>
  )
}
