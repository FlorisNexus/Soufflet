/**
 * @file Listen.tsx
 * @description Listen mode — plays the song with synthesized accordion sound so the
 * user can internalize the melody and tempo before attempting to play it themselves.
 * No microphone, no scoring — just the music and the visual keyboard.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Song, SongNote } from '../songs/schema'
import { usePlayerState } from '../hooks/usePlayerState'
import ButtonLayout from '../display/ButtonLayout'
import FallingNotes from '../display/FallingNotes'
import type { AccordionSystem } from '../constants/layouts'
import { AccordionSynth } from '../audio/AccordionSynth'
import { midiToColor, midiToFrenchNameWithOctave } from '../constants/notes'

type Props = {
  song: Song
  system: AccordionSystem
  onBack: () => void
}

export default function Listen({ song, system, onBack }: Props) {
  const [countdown, setCountdown] = useState<number | null>(null)
  const [currentNote, setCurrentNote] = useState<SongNote | null>(null)
  const [synth] = useState(() => new AccordionSynth())
  const clearNoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { isPlaying, isFinished, currentBeat, tempoMultiplier, play, stop, setTempoMultiplier } =
    usePlayerState(song)

  const handleStop = useCallback(() => {
    stop()
    synth.stopAll()
    setCountdown(null)
    setCurrentNote(null)
  }, [stop, synth])

  const handleStart = useCallback(() => {
    setCountdown(3)
    setCurrentNote(null)
    synth.stopAll()
    let count = 3
    const interval = setInterval(() => {
      count -= 1
      if (count <= 0) {
        clearInterval(interval)
        setCountdown(null)
        play()
      } else {
        setCountdown(count)
      }
    }, 1000)
  }, [play, synth])

  const handleNoteAtLine = useCallback((note: SongNote) => {
    const durationS = (note.durationBeats * 60) / (song.bpm * tempoMultiplier)
    synth.playNote(note.midiNote, durationS)
    setCurrentNote(note)

    if (clearNoteTimer.current) clearTimeout(clearNoteTimer.current)
    clearNoteTimer.current = setTimeout(() => setCurrentNote(null), durationS * 1000 + 200)
  }, [synth, song.bpm, tempoMultiplier])

  useEffect(() => {
    if (isFinished) {
      synth.stopAll()
      setCurrentNote(null)
    }
  }, [isFinished, synth])

  useEffect(() => {
    return () => {
      handleStop()
      synth.dispose()
      if (clearNoteTimer.current) clearTimeout(clearNoteTimer.current)
    }
  }, [handleStop, synth])

  const noteColor = currentNote ? midiToColor(currentNote.midiNote) : null

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #080810 0%, #0d0d18 50%, #080810 100%)' }}
    >
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header
        className="flex items-center gap-3 px-5 py-3 shrink-0 border-b z-40"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(10,10,18,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <button
          onClick={() => { handleStop(); onBack() }}
          className="w-9 h-9 flex items-center justify-center rounded-xl border text-gray-400 hover:text-white transition-all active:scale-90 text-lg"
          style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
        >
          ←
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-sm font-bold uppercase tracking-widest text-gray-300 truncate"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.25em' }}
          >
            {song.title}
          </span>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0"
            style={{
              background: 'rgba(99,102,241,0.12)',
              color: '#818cf8',
              border: '1px solid rgba(99,102,241,0.25)',
            }}
          >
            Écoute
          </span>
        </div>

        <div className="flex-1" />

        {/* Tempo controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTempoMultiplier(Math.max(0.5, tempoMultiplier - 0.1))}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }}
          >−</button>
          <span
            className="text-sm font-black w-10 text-center"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: '#818cf8' }}
          >
            {Math.round(tempoMultiplier * 100)}%
          </span>
          <button
            onClick={() => setTempoMultiplier(Math.min(1.2, tempoMultiplier + 0.1))}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }}
          >+</button>
        </div>
      </header>

      {/* ── MAIN AREA ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Falling notes */}
          <div className="flex-1 relative overflow-hidden" style={{ background: '#06060f' }}>
            <FallingNotes
              song={song}
              currentBeat={currentBeat}
              system={system}
              showNoteNames={true}
              onNoteAtLine={handleNoteAtLine}
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
            <div
              className="w-1 self-stretch rounded-full shrink-0 transition-all duration-200"
              style={{
                background: noteColor ?? 'rgba(255,255,255,0.08)',
                boxShadow: noteColor ? `0 0 16px ${noteColor}88` : 'none',
              }}
            />
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
              {currentNote ? midiToFrenchNameWithOctave(currentNote.midiNote) : '—'}
            </div>
          </div>

          {/* ── CONTROLS ──────────────────────────────────────────────── */}
          <div
            className="shrink-0 flex items-center gap-3 px-6 py-4 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(6,6,14,0.95)' }}
          >
            {!isPlaying && !isFinished && countdown === null ? (
              <button
                onClick={handleStart}
                className="flex-1 flex items-center justify-center gap-3 py-3.5 rounded-2xl font-black text-base uppercase tracking-wider transition-all active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: '#fff',
                  boxShadow: '0 0 24px rgba(99,102,241,0.3)',
                }}
              >
                <span>▶</span> Écouter
              </button>
            ) : isPlaying ? (
              <button
                onClick={handleStop}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all active:scale-[0.98] border"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  borderColor: 'rgba(239,68,68,0.2)',
                  color: '#f87171',
                }}
              >
                ⏸ Arrêter
              </button>
            ) : null}
          </div>
        </div>

        {/* ── RIGHT PANEL — vertical keyboard ─────────────────────────── */}
        <aside
          className="shrink-0 flex items-start justify-center overflow-y-auto border-l"
          style={{
            width: '24rem',
            borderColor: 'rgba(255,255,255,0.06)',
            background: 'rgba(8,8,18,0.95)',
            padding: '1rem 0.75rem',
            boxShadow: '-1px 0 0 0 rgba(99,102,241,0.08)',
          }}
        >
          <ButtonLayout
            system={system}
            activeMidi={currentNote?.midiNote ?? null}
            orientation="vertical"
          />
        </aside>
      </div>

      {/* ── COUNTDOWN OVERLAY ───────────────────────────────────────────── */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-xl">
          <div className="relative">
            <span className="text-[12rem] font-black text-indigo-500 animate-ping absolute inset-0 flex items-center justify-center opacity-20">{countdown}</span>
            <span className="text-[12rem] font-black text-white relative z-10">{countdown}</span>
          </div>
        </div>
      )}

      {/* ── FINISHED OVERLAY ────────────────────────────────────────────── */}
      {isFinished && (
        <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-50 gap-12 backdrop-blur-2xl p-6 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-8xl mb-6">🎵</div>
            <h2
              className="text-7xl font-black text-white tracking-tighter mb-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              TERMINÉ !
            </h2>
            <div className="h-1 w-24 bg-indigo-500 mx-auto rounded-full mb-8" />
            <p className="text-gray-400 text-xl max-w-xs mx-auto leading-relaxed">
              Tu as écouté <span className="text-white font-bold">{song.title}</span>. Prêt à l'essayer ?
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm animate-in fade-in zoom-in duration-1000 delay-300">
            <button
              onClick={handleStart}
              className="flex-1 px-8 py-5 rounded-3xl font-black text-xl transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff' }}
            >
              RÉÉCOUTER
            </button>
            <button
              onClick={() => { handleStop(); onBack() }}
              className="flex-1 px-8 py-5 rounded-3xl font-bold text-xl transition-all active:scale-95 border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
            >
              RETOUR
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
