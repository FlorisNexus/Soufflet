/**
 * @file FreePlay.tsx
 * @description Free-play mode — full-screen dark-studio layout.
 * The played note is the hero element. The keyboard lives in a fixed-width
 * right panel, the scrolling ribbon fills the top, and controls are kept
 * minimal to maximise the music-making focus.
 */

import { useCallback, useEffect, useState } from 'react'
import type { AccordionSystem } from '../constants/layouts'
import { useFreePlaySession } from '../hooks/useFreePlaySession'
import PianoRoll from '../display/PianoRoll'
import ButtonLayout from '../display/ButtonLayout'
import { centsFromHz, midiToColor, midiToFrenchNameWithOctave } from '../constants/notes'
import { AudioReferencePlayer } from '../audio/AudioReferencePlayer'

type Props = {
  system: AccordionSystem
  onBack: () => void
  onRecalibrate: () => void
}

export default function FreePlay({ system, onBack, onRecalibrate }: Props) {
  const { timeline, currentNote, sessionStartedAt, isListening, error, start, stop, reset } =
    useFreePlaySession()

  const [audioRefEnabled, setAudioRefEnabled] = useState(false)
  const [audioRef] = useState(() => new AudioReferencePlayer())

  useEffect(() => { audioRef.setMuted(!audioRefEnabled) }, [audioRef, audioRefEnabled])
  useEffect(() => () => audioRef.dispose(), [audioRef])

  const playReference = useCallback(
    (midi: number) => { if (audioRefEnabled) audioRef.play(midi) },
    [audioRef, audioRefEnabled],
  )

  const handleBack = useCallback(() => { stop(); audioRef.stopAll(); onBack() }, [stop, audioRef, onBack])

  const noteColor = currentNote ? midiToColor(currentNote.midi) : null
  const readout = (() => {
    if (!currentNote) return { name: '—', hz: '', cents: '' }
    const name = midiToFrenchNameWithOctave(currentNote.midi)
    const hz = currentNote.frequencyHz.toFixed(1)
    const c = centsFromHz(currentNote.frequencyHz, currentNote.midi)
    return { name, hz, cents: `${c >= 0 ? '+' : ''}${c.toFixed(0)}¢` }
  })()

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #080810 0%, #0d0d18 50%, #080810 100%)' }}
    >
      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <header
        className="flex items-center gap-3 px-5 py-3 shrink-0 border-b z-40"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(10,10,18,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <button
          onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl border text-gray-400 hover:text-white transition-all active:scale-90 text-lg"
          style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
        >
          ←
        </button>

        <div className="flex items-center gap-2">
          <span
            className="text-sm font-bold uppercase tracking-[0.2em] text-gray-300"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.25em' }}
          >
            Mode Libre
          </span>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
            style={{
              background: isListening ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
              color: isListening ? '#4ade80' : '#6b7280',
              border: `1px solid ${isListening ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isListening ? '#4ade80' : '#374151',
                boxShadow: isListening ? '0 0 6px #4ade80' : 'none',
                animation: isListening ? 'pulse 1.5s ease-in-out infinite' : 'none',
              }}
            />
            {isListening ? 'Écoute' : 'Arrêté'}
          </span>
        </div>

        <div className="flex-1" />

        {/* Audio reference toggle */}
        <label
          className="flex items-center gap-2 cursor-pointer select-none px-3 py-1.5 rounded-lg transition-all"
          style={{ background: audioRefEnabled ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)' }}
        >
          <input
            type="checkbox"
            checked={audioRefEnabled}
            onChange={e => setAudioRefEnabled(e.target.checked)}
            className="sr-only"
          />
          <span
            className="w-8 h-4 rounded-full relative transition-colors duration-200"
            style={{ background: audioRefEnabled ? '#f59e0b' : '#1f2937' }}
          >
            <span
              className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200 shadow"
              style={{ left: audioRefEnabled ? '17px' : '2px' }}
            />
          </span>
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: audioRefEnabled ? '#f59e0b' : '#6b7280' }}
          >
            Référence
          </span>
        </label>

        <button
          onClick={onRecalibrate}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:text-amber-400 transition-colors text-lg"
          title="Recalibrer"
        >
          ⚙
        </button>
      </header>

      {error && (
        <div className="px-5 py-2.5 text-sm shrink-0" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {/* ── MAIN: left column + right keyboard ──────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Piano roll — flex-1 so it fills all available space */}
          <div className="flex-1 min-h-0 p-3" style={{ background: '#06060f' }}>
            <PianoRoll
              timeline={timeline}
              sessionStartedAt={sessionStartedAt}
              onBlockClick={playReference}
            />
          </div>

          {/* ── NOTE HERO ─────────────────────────────────────────────── */}
          <div
            className="shrink-0 flex items-center gap-6 px-8 py-5 border-t"
            style={{
              borderColor: 'rgba(255,255,255,0.06)',
              background: 'rgba(8,8,16,0.9)',
              minHeight: '5.5rem',
            }}
          >
            {/* Color stripe — takes the active note's color */}
            <div
              className="w-1 self-stretch rounded-full shrink-0 transition-all duration-200"
              style={{
                background: noteColor ?? 'rgba(255,255,255,0.08)',
                boxShadow: noteColor ? `0 0 16px ${noteColor}88` : 'none',
              }}
            />

            {/* Note name */}
            <div
              className="leading-none transition-all duration-150"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 900,
                color: noteColor ?? '#374151',
                textShadow: noteColor ? `0 0 40px ${noteColor}66` : 'none',
                minWidth: '5ch',
              }}
            >
              {readout.name}
            </div>

            {/* Hz + cents */}
            <div className="flex flex-col gap-0.5">
              {readout.hz && (
                <span
                  className="text-sm font-bold"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: '#9ca3af' }}
                >
                  {readout.hz} Hz
                </span>
              )}
              {readout.cents && (
                <span
                  className="text-sm font-bold"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: '#f59e0b' }}
                >
                  {readout.cents}
                </span>
              )}
            </div>

            <div className="flex-1" />

            {/* Reference button */}
            <button
              onClick={() => currentNote && playReference(currentNote.midi)}
              disabled={!currentNote || !audioRefEnabled}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-all active:scale-95 disabled:opacity-30"
              style={{
                background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.25)',
                color: '#f59e0b',
              }}
            >
              <span>▶</span> Réf
            </button>
          </div>

          {/* ── CONTROLS ──────────────────────────────────────────────── */}
          <div
            className="shrink-0 flex items-center gap-3 px-6 py-4 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(6,6,14,0.95)' }}
          >
            {!isListening ? (
              <button
                onClick={start}
                className="flex-1 flex items-center justify-center gap-3 py-3.5 rounded-2xl font-black text-base uppercase tracking-wider transition-all active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#000',
                  boxShadow: '0 0 24px rgba(245,158,11,0.3)',
                }}
              >
                <span>🎤</span> Démarrer
              </button>
            ) : (
              <>
                <button
                  onClick={reset}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all active:scale-[0.98] border"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: '#9ca3af',
                  }}
                >
                  ↻ Réinitialiser
                </button>
                <button
                  onClick={stop}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all active:scale-[0.98] border"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    borderColor: 'rgba(239,68,68,0.2)',
                    color: '#f87171',
                  }}
                >
                  ⏸ Pause
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL — keyboard ───────────────────────────────────── */}
        <aside
          className="shrink-0 flex items-start justify-center overflow-y-auto border-l"
          style={{
            width: '18rem',
            borderColor: 'rgba(255,255,255,0.06)',
            background: 'rgba(8,8,18,0.95)',
            padding: '1rem 0.75rem',
            /* Subtle vertical line on the left to separate panel */
            boxShadow: '-1px 0 0 0 rgba(245,158,11,0.08)',
          }}
        >
          <ButtonLayout system={system} activeMidi={currentNote?.midi ?? null} />
        </aside>

      </div>
    </div>
  )
}
