// Player.tsx — the main play screen; assembles FallingNotes + ButtonLayout + useAudio + usePlayerState
// Angular equivalent: a "container component" that injects services and delegates to presentational components
import { useState, useEffect, useCallback, useRef } from 'react'
import type { Song, SongNote } from '../songs/schema'
import { useAudio } from '../hooks/useAudio'
import { usePlayerState } from '../hooks/usePlayerState'
import ButtonLayout from '../display/ButtonLayout'
import FallingNotes from '../display/FallingNotes'
import FeedbackOverlay from '../display/FeedbackOverlay'
import type { AccordionSystem } from '../constants/layouts'

type Props = {
  song: Song
  onBack: () => void
}

type FeedbackResult = { result: 'correct' | 'wrong'; expectedName: string } | null

export default function Player({ song, onBack }: Props) {
  const [system, setSystem] = useState<AccordionSystem>('C')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<FeedbackResult>(null)
  const [showNoteNames, setShowNoteNames] = useState(false)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { isListening, detectedNote, startListening, stopListening } = useAudio(system)
  const { isPlaying, isFinished, currentBeat, tempoMultiplier, play, stop, setTempoMultiplier } =
    usePlayerState(song)

  // Start the 3-second countdown then begin playback + mic
  const handleStart = useCallback(async () => {
    setCountdown(3)
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

  const handleStop = useCallback(() => {
    stop()
    stopListening()
    setCountdown(null)
    setFeedback(null)
  }, [stop, stopListening])

  // Check detected note against the current expected note
  const handleNoteAtLine = useCallback((note: SongNote) => {
    if (!detectedNote) return
    const isCorrect = detectedNote.midiNote === note.midiNote
    setFeedback({
      result: isCorrect ? 'correct' : 'wrong',
      expectedName: detectedNote.frenchName,
    })
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 600)
  }, [detectedNote])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleStop()
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    }
  }, [handleStop])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4 gap-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => { handleStop(); onBack() }} className="text-gray-400 hover:text-white text-2xl">←</button>
        <h1 className="text-xl font-bold flex-1">{song.title}</h1>
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => setTempoMultiplier(Math.max(0.5, tempoMultiplier - 0.1))} className="bg-gray-700 px-2 py-1 rounded">−</button>
          <span>{Math.round(tempoMultiplier * 100)}%</span>
          <button onClick={() => setTempoMultiplier(Math.min(1.2, tempoMultiplier + 0.1))} className="bg-gray-700 px-2 py-1 rounded">+</button>
        </div>
        <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer">
          <input type="checkbox" checked={showNoteNames} onChange={e => setShowNoteNames(e.target.checked)} />
          Noms
        </label>
      </div>

      {/* Falling notes zone */}
      <div className="flex-1 min-h-[300px]">
        <FallingNotes
          song={song}
          currentBeat={currentBeat}
          system={system}
          showNoteNames={showNoteNames}
          onNoteAtLine={handleNoteAtLine}
        />
      </div>

      {/* Accordion button layout + feedback overlay */}
      <div className="relative">
        <ButtonLayout
          system={system}
          activeButtonPosition={isListening ? detectedNote : null}
          onSystemChange={setSystem}
        />
        <FeedbackOverlay result={feedback?.result ?? null} expectedName={feedback?.expectedName} />
      </div>

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <span className="text-8xl font-bold text-amber-400 animate-pulse">{countdown}</span>
        </div>
      )}

      {/* Song finished screen */}
      {isFinished && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50 gap-6">
          <p className="text-4xl font-bold">Bravo !</p>
          <div className="flex gap-4">
            <button onClick={handleStart} className="bg-amber-500 text-black px-6 py-3 rounded-xl font-bold">Rejouer</button>
            <button onClick={() => { handleStop(); onBack() }} className="bg-gray-700 px-6 py-3 rounded-xl">Retour</button>
          </div>
        </div>
      )}

      {/* Start / stop button */}
      {!isPlaying && !isFinished && countdown === null && (
        <button
          onClick={handleStart}
          className="mt-auto bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 rounded-2xl text-xl transition-all"
        >
          ▶  Démarrer
        </button>
      )}
    </div>
  )
}
