/**
 * @file Player.tsx
 * @description Main play screen; integrates audio detection and falling notes.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Song, SongNote } from '../songs/schema'
import { useAudio } from '../hooks/useAudio'
import { usePlayerState } from '../hooks/usePlayerState'
import ButtonLayout from '../display/ButtonLayout'
import FallingNotes from '../display/FallingNotes'
import FeedbackOverlay from '../display/FeedbackOverlay'
import type { AccordionSystem } from '../constants/layouts'
import { progressStore } from '../store/progressStore'

/**
 * Props for the Player component.
 */
type Props = {
  /** The song to play */
  song: Song
  /** The accordion system, decided by calibration at boot. */
  system: AccordionSystem
  /** Callback fired when the user wants to return to the home screen */
  onBack: () => void
}

/**
 * Result of a single note evaluation (success or error).
 */
type EvaluationResult = { result: 'correct' | 'wrong'; expectedName: string } | null

/**
 * Main game engine screen.
 * Coordinates the timing clock, microphone detection, and visual renderings.
 */
export default function Player({ song, system, onBack }: Props) {
  const [countdown, setCountdown] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<EvaluationResult>(null)
  const [showNoteNames, setShowNoteNames] = useState(false)
  const [targetNote, setTargetNote] = useState<SongNote | null>(null)

  // Tracking stats for the current session. State (not refs) because the
  // precision percentage is rendered in the header and the final score screen.
  const [totalNotes, setTotalNotes] = useState(0)
  const [correctNotes, setCorrectNotes] = useState(0)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { isListening, detectedNote, startListening, stopListening } = useAudio(system)
  const { isPlaying, isFinished, currentBeat, tempoMultiplier, play, stop, setTempoMultiplier } =
    usePlayerState(song)

  /**
   * Starts the 3-second countdown before launching playback.
   */
  const handleStart = useCallback(async () => {
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
  }, [startListening, play])

  /**
   * Immediately halts playback and audio processing.
   */
  const handleStop = useCallback(() => {
    stop()
    stopListening()
    setCountdown(null)
    setFeedback(null)
    setTargetNote(null)
  }, [stop, stopListening])

  /**
   * Evaluates the detected microphone input against the expected song note.
   */
  const handleNoteAtLine = useCallback((note: SongNote) => {
    setTargetNote(note)
    setTotalNotes(n => n + 1)

    if (!detectedNote) {
      setFeedback({ result: 'wrong', expectedName: '...' })
    } else {
      const isCorrect = detectedNote.midiNote === note.midiNote
      if (isCorrect) setCorrectNotes(n => n + 1)

      setFeedback({
        result: isCorrect ? 'correct' : 'wrong',
        expectedName: detectedNote.frenchName,
      })
    }

    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback(null)
      // On garde le targetNote jusqu'à la prochaine note pour que l'utilisateur voit ce qu'il doit jouer
    }, 600)
  }, [detectedNote])

  /**
   * Record progress when the song finishes.
   */
  useEffect(() => {
    if (isFinished) {
      const score = totalNotes > 0
        ? Math.round((correctNotes / totalNotes) * 5)
        : 0
      progressStore.recordPlay(song.id, score)
      stopListening()
    }
  }, [isFinished, song.id, stopListening, totalNotes, correctNotes])

  // Component cleanup
  useEffect(() => {
    return () => {
      handleStop()
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    }
  }, [handleStop])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col max-w-4xl mx-auto overflow-hidden shadow-2xl border-x border-gray-900">
      {/* Header */}
      <header className="flex items-center gap-6 px-6 py-4 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
        <button 
          onClick={() => { handleStop(); onBack() }} 
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all active:scale-90"
        >
          <span className="text-2xl">←</span>
        </button>
        
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black truncate tracking-tight">{song.title}</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Session en cours</p>
        </div>

        <div className="hidden sm:flex items-center gap-4 bg-black/30 px-4 py-2 rounded-2xl border border-white/5">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">Précision</span>
            <span className="text-sm font-mono font-bold text-amber-500">
              {totalNotes > 0 ? Math.round((correctNotes / totalNotes) * 100) : 0}%
            </span>
          </div>
          <div className="w-px h-6 bg-gray-800" />
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTempoMultiplier(Math.max(0.5, tempoMultiplier - 0.1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >−</button>
            <span className="font-mono text-sm w-10 text-center">{Math.round(tempoMultiplier * 100)}%</span>
            <button 
              onClick={() => setTempoMultiplier(Math.min(1.2, tempoMultiplier + 0.1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >+</button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs font-bold text-gray-400 cursor-pointer select-none px-3 py-2 rounded-xl hover:bg-gray-800 transition-colors">
          <input 
            type="checkbox" 
            checked={showNoteNames} 
            onChange={e => setShowNoteNames(e.target.checked)}
            className="w-4 h-4 accent-amber-500 rounded border-gray-700 bg-gray-800"
          />
          LABELS
        </label>
      </header>

      {/* Falling notes zone */}
      <main className="flex-1 relative bg-black overflow-hidden flex flex-col">
        <FallingNotes
          song={song}
          currentBeat={currentBeat}
          system={system}
          showNoteNames={showNoteNames}
          onNoteAtLine={handleNoteAtLine}
        />
        <FeedbackOverlay result={feedback?.result ?? null} expectedName={feedback?.expectedName} />
      </main>

      {/* Accordion button layout */}
      <footer className="bg-gray-900/90 backdrop-blur-xl border-t border-white/5 py-8 px-4 relative z-10">
        <ButtonLayout
          system={system}
          activeMidi={isListening ? (detectedNote?.midiNote ?? null) : null}
          targetMidiNote={targetNote?.midiNote}
          orientation="horizontal"
        />
      </footer>

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-xl">
          <div className="relative">
            <span className="text-[12rem] font-black text-amber-500 animate-ping absolute inset-0 flex items-center justify-center opacity-20">{countdown}</span>
            <span className="text-[12rem] font-black text-white relative z-10">{countdown}</span>
          </div>
        </div>
      )}

      {/* Song finished screen */}
      {isFinished && (
        <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-50 gap-12 backdrop-blur-2xl p-6 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-8xl mb-6 scale-110">🎉</div>
            <h2 className="text-7xl font-black text-white tracking-tighter mb-4">BRAVO !</h2>
            <div className="h-1 w-24 bg-amber-500 mx-auto rounded-full mb-8" />
            <p className="text-gray-400 text-xl max-w-xs mx-auto leading-relaxed">
              Tu as terminé <span className="text-white font-bold">{song.title}</span> avec une précision de <span className="text-amber-500 font-black">{totalNotes > 0 ? Math.round((correctNotes / totalNotes) * 100) : 0}%</span>.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm animate-in fade-in zoom-in duration-1000 delay-300">
            <button 
              onClick={handleStart} 
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black px-8 py-5 rounded-3xl font-black text-xl transition-all active:scale-95 shadow-2xl shadow-amber-500/30"
            >
              REESSAYER
            </button>
            <button 
              onClick={() => { handleStop(); onBack() }} 
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-8 py-5 rounded-3xl font-bold text-xl transition-all border border-white/10 active:scale-95"
            >
              QUITTER
            </button>
          </div>
        </div>
      )}

      {/* Start / stop button */}
      {!isPlaying && !isFinished && countdown === null && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent pointer-events-none z-30">
          <button
            onClick={handleStart}
            className="w-full max-w-md mx-auto flex items-center justify-center gap-4 bg-amber-500 hover:bg-amber-400 text-black font-black py-6 rounded-3xl text-2xl transition-all active:scale-95 shadow-2xl shadow-amber-500/40 pointer-events-auto border-b-4 border-amber-700"
          >
            <span className="text-3xl">▶</span> DÉMARRER LA SESSION
          </button>
        </div>
      )}
    </div>
  )
}
