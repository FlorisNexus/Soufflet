/**
 * @file Player.tsx
 * @description Main play screen; full-screen dark-studio layout matching FreePlay.
 * Left column: falling notes + stats + controls. Right panel: vertical keyboard.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Song, SongNote } from '../songs/schema'
import { useAudio } from '../hooks/useAudio'
import { usePlayerState } from '../hooks/usePlayerState'
import ButtonLayout from '../display/ButtonLayout'
import FallingNotes from '../display/FallingNotes'
import FeedbackOverlay from '../display/FeedbackOverlay'
import ProgressBar from '../display/ProgressBar'
import type { AccordionSystem } from '../constants/layouts'
import { progressStore } from '../store/progressStore'
import { midiToFrenchNameWithOctave } from '../constants/notes'

type Props = {
  song: Song
  system: AccordionSystem
  onBack: () => void
}

type EvaluationResult = { result: 'correct' | 'wrong'; expectedName: string } | null

export default function Player({ song, system, onBack }: Props) {
  const [countdown, setCountdown] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<EvaluationResult>(null)
  const [showNoteNames, setShowNoteNames] = useState(false)
  const [targetNote, setTargetNote] = useState<SongNote | null>(null)
  const [totalNotes, setTotalNotes] = useState(0)
  const [correctNotes, setCorrectNotes] = useState(0)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { isListening, detectedNote, startListening, stopListening } = useAudio(system)
  const { isPlaying, isFinished, currentBeat, tempoMultiplier, play, stop, seek, setTempoMultiplier, totalBeats } =
    usePlayerState(song)

  const handleStart = useCallback(async () => {
    // Call stop() first to immediately clear isFinished state — without this the
    // finished overlay stays visible on top of the countdown (same z-index, later DOM).
    stop()
    setCountdown(3)
    setTotalNotes(0)
    setCorrectNotes(0)
    setTargetNote(null)
    await startListening()
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
  }, [stop, startListening, play])

  const handleStop = useCallback(() => {
    stop()
    // Keep mic listening after pause so note detection stays visible on keyboard.
    // Mic is only stopped on component unmount or when navigating back.
    setCountdown(null)
    setFeedback(null)
    setTargetNote(null)
  }, [stop, stopListening])

  const handleNoteAtLine = useCallback((note: SongNote) => {
    setTargetNote(note)
    setTotalNotes(n => n + 1)

    if (!detectedNote) {
      setFeedback({ result: 'wrong', expectedName: '...' })
    } else {
      const isCorrect = detectedNote.midiNote === note.midiNote
      if (isCorrect) setCorrectNotes(n => n + 1)
      setFeedback({ result: isCorrect ? 'correct' : 'wrong', expectedName: detectedNote.frenchName })
    }

    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 600)
  }, [detectedNote])

  useEffect(() => {
    if (isFinished) {
      const score = totalNotes > 0 ? Math.round((correctNotes / totalNotes) * 5) : 0
      progressStore.recordPlay(song.id, score)
      stopListening()
    }
  }, [isFinished, song.id, stopListening, totalNotes, correctNotes])

  useEffect(() => {
    return () => {
      handleStop()
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    }
  }, [handleStop])

  const precision = totalNotes > 0 ? Math.round((correctNotes / totalNotes) * 100) : 0

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

        {/* Precision badge */}
        {totalNotes > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg shrink-0"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Précision</span>
            <span
              className="text-sm font-black"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#f59e0b' }}
            >
              {precision}%
            </span>
          </div>
        )}

        {/* Labels toggle */}
        <label
          className="flex items-center gap-2 cursor-pointer select-none px-3 py-1.5 rounded-lg transition-all shrink-0"
          style={{ background: showNoteNames ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)' }}
        >
          <input
            type="checkbox"
            checked={showNoteNames}
            onChange={e => setShowNoteNames(e.target.checked)}
            className="sr-only"
          />
          <span
            className="w-8 h-4 rounded-full relative transition-colors duration-200"
            style={{ background: showNoteNames ? '#f59e0b' : '#1f2937' }}
          >
            <span
              className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200 shadow"
              style={{ left: showNoteNames ? '17px' : '2px' }}
            />
          </span>
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: showNoteNames ? '#f59e0b' : '#6b7280' }}
          >
            Labels
          </span>
        </label>
      </header>

      {/* ── MAIN AREA ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Falling notes — fills available space */}
          <div className="flex-1 relative overflow-hidden" style={{ background: '#06060f' }}>
            <FallingNotes
              song={song}
              currentBeat={currentBeat}
              system={system}
              showNoteNames={showNoteNames}
              onNoteAtLine={handleNoteAtLine}
            />
            <FeedbackOverlay result={feedback?.result ?? null} expectedName={feedback?.expectedName} />
          </div>

          <ProgressBar
            currentBeat={currentBeat}
            totalBeats={totalBeats}
            bpm={song.bpm}
            tempoMultiplier={tempoMultiplier}
            onSeek={seek}
            color="#f59e0b"
          />

          {/* ── STATS BAR ─────────────────────────────────────────────── */}
          <div
            className="shrink-0 flex items-center gap-6 px-8 py-4 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(8,8,16,0.9)', minHeight: '4.5rem' }}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Notes jouées</span>
              <span
                className="text-xl font-black"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#e5e7eb' }}
              >
                {totalNotes > 0 ? `${correctNotes} / ${totalNotes}` : '—'}
              </span>
            </div>

            <div className="w-px h-8 self-center" style={{ background: 'rgba(255,255,255,0.08)' }} />

            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Tempo</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTempoMultiplier(Math.max(0.5, tempoMultiplier - 0.1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }}
                >−</button>
                <span
                  className="text-sm font-black w-10 text-center"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: '#f59e0b' }}
                >
                  {Math.round(tempoMultiplier * 100)}%
                </span>
                <button
                  onClick={() => setTempoMultiplier(Math.min(1.2, tempoMultiplier + 0.1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }}
                >+</button>
              </div>
            </div>

            <div className="flex-1" />

            {targetNote && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}
              >
                <span>Attendu :</span>
                <span style={{ color: '#e5e7eb' }}>{midiToFrenchNameWithOctave(targetNote.midiNote)}</span>
              </div>
            )}
          </div>

          {/* ── CONTROLS BAR ──────────────────────────────────────────── */}
          <div
            className="shrink-0 flex items-center gap-3 px-6 py-4 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(6,6,14,0.95)' }}
          >
            {!isPlaying && !isFinished && countdown === null ? (
              <button
                onClick={handleStart}
                className="flex-1 flex items-center justify-center gap-3 py-3.5 rounded-2xl font-black text-base uppercase tracking-wider transition-all active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#000',
                  boxShadow: '0 0 24px rgba(245,158,11,0.3)',
                }}
              >
                <span>▶</span> Démarrer la session
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
            boxShadow: '-1px 0 0 0 rgba(245,158,11,0.08)',
          }}
        >
          <ButtonLayout
            system={system}
            activeMidi={isListening ? (detectedNote?.midiNote ?? null) : null}
            targetMidiNote={targetNote?.midiNote}
            orientation="vertical"
          />
        </aside>
      </div>

      {/* ── COUNTDOWN OVERLAY ───────────────────────────────────────────── */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-xl">
          <div className="relative">
            <span className="text-[12rem] font-black text-amber-500 animate-ping absolute inset-0 flex items-center justify-center opacity-20">{countdown}</span>
            <span className="text-[12rem] font-black text-white relative z-10">{countdown}</span>
          </div>
        </div>
      )}

      {/* ── SONG FINISHED OVERLAY ───────────────────────────────────────── */}
      {isFinished && (
        <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-50 gap-12 backdrop-blur-2xl p-6 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-8xl mb-6 scale-110">🎉</div>
            <h2
              className="text-7xl font-black text-white tracking-tighter mb-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              BRAVO !
            </h2>
            <div className="h-1 w-24 bg-amber-500 mx-auto rounded-full mb-8" />
            <p className="text-gray-400 text-xl max-w-xs mx-auto leading-relaxed">
              Tu as terminé <span className="text-white font-bold">{song.title}</span> avec une précision de{' '}
              <span className="text-amber-500 font-black">{precision}%</span>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm animate-in fade-in zoom-in duration-1000 delay-300">
            <button
              onClick={handleStart}
              className="flex-1 px-8 py-5 rounded-3xl font-black text-xl transition-all active:scale-95 shadow-2xl shadow-amber-500/30"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000' }}
            >
              RÉESSAYER
            </button>
            <button
              onClick={() => { handleStop(); onBack() }}
              className="flex-1 px-8 py-5 rounded-3xl font-bold text-xl transition-all active:scale-95 border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
            >
              QUITTER
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
