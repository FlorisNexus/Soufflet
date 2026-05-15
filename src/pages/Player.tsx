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
export default function Player({ song, onBack }: Props) {
  const [system, setSystem] = useState<AccordionSystem>('C')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<EvaluationResult>(null)
  const [showNoteNames, setShowNoteNames] = useState(false)
  
  // Tracking stats for the current session
  const totalNotesRef = useRef(0)
  const correctNotesRef = useRef(0)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { isListening, detectedNote, startListening, stopListening } = useAudio(system)
  const { isPlaying, isFinished, currentBeat, tempoMultiplier, play, stop, setTempoMultiplier } =
    usePlayerState(song)

  /**
   * Starts the 3-second countdown before launching playback.
   */
  const handleStart = useCallback(async () => {
    setCountdown(3)
    totalNotesRef.current = 0
    correctNotesRef.current = 0
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
  }, [stop, stopListening])

  /**
   * Evaluates the detected microphone input against the expected song note.
   */
  const handleNoteAtLine = useCallback((note: SongNote) => {
    totalNotesRef.current += 1
    if (!detectedNote) {
      setFeedback({ result: 'wrong', expectedName: '...' })
    } else {
      const isCorrect = detectedNote.midiNote === note.midiNote
      if (isCorrect) correctNotesRef.current += 1
      
      setFeedback({
        result: isCorrect ? 'correct' : 'wrong',
        expectedName: detectedNote.frenchName,
      })
    }

    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 600)
  }, [detectedNote])

  /**
   * Record progress when the song finishes.
   */
  useEffect(() => {
    if (isFinished) {
      const score = totalNotesRef.current > 0 
        ? Math.round((correctNotesRef.current / totalNotesRef.current) * 5)
        : 0
      progressStore.recordPlay(song.id, score)
      stopListening()
    }
  }, [isFinished, song.id, stopListening])

  // Component cleanup
  useEffect(() => {
    return () => {
      handleStop()
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    }
  }, [handleStop])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4 gap-4 max-w-2xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 py-2">
        <button onClick={() => { handleStop(); onBack() }} className="text-gray-400 hover:text-white text-3xl transition-colors">←</button>
        <h1 className="text-xl font-bold flex-1 truncate">{song.title}</h1>
        <div className="flex items-center gap-3 bg-gray-800 px-3 py-1.5 rounded-full text-sm">
          <button onClick={() => setTempoMultiplier(Math.max(0.5, tempoMultiplier - 0.1))} className="hover:text-amber-400 transition-colors">−</button>
          <span className="font-mono">{Math.round(tempoMultiplier * 100)}%</span>
          <button onClick={() => setTempoMultiplier(Math.min(1.2, tempoMultiplier + 0.1))} className="hover:text-amber-400 transition-colors">+</button>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={showNoteNames} 
            onChange={e => setShowNoteNames(e.target.checked)}
            className="accent-amber-500"
          />
          Noms
        </label>
      </div>

      {/* Falling notes zone */}
      <div className="flex-1 relative min-h-[200px]">
        <FallingNotes
          song={song}
          currentBeat={currentBeat}
          system={system}
          showNoteNames={showNoteNames}
          onNoteAtLine={handleNoteAtLine}
        />
      </div>

      {/* Accordion button layout + feedback overlay */}
      <div className="relative py-4">
        <ButtonLayout
          system={system}
          activeButtonPosition={isListening ? detectedNote : null}
          onSystemChange={setSystem}
        />
        <FeedbackOverlay result={feedback?.result ?? null} expectedName={feedback?.expectedName} />
      </div>

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <span className="text-9xl font-black text-amber-400 animate-ping">{countdown}</span>
        </div>
      )}

      {/* Song finished screen */}
      {isFinished && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 gap-8 backdrop-blur-md">
          <div className="text-center">
            <p className="text-6xl font-black text-amber-400 mb-2">Bravo !</p>
            <p className="text-gray-400">Chanson terminée avec succès.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleStart} 
              className="bg-amber-500 hover:bg-amber-400 text-black px-10 py-4 rounded-2xl font-black text-lg transition-transform active:scale-95 shadow-lg shadow-amber-500/20"
            >
              REJOUER
            </button>
            <button 
              onClick={() => { handleStop(); onBack() }} 
              className="bg-gray-800 hover:bg-gray-700 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-colors border border-gray-700"
            >
              RETOUR
            </button>
          </div>
        </div>
      )}

      {/* Start / stop button */}
      {!isPlaying && !isFinished && countdown === null && (
        <button
          onClick={handleStart}
          className="mt-auto bg-amber-500 hover:bg-amber-400 text-black font-black py-5 rounded-2xl text-2xl transition-all active:scale-95 shadow-xl shadow-amber-500/10 mb-2"
        >
          ▶  DÉMARRER
        </button>
      )}
    </div>
  )
}
