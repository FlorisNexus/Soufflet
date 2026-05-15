// FallingNotes.tsx — Canvas animation: colored rectangles fall from top to the play line
// Each rectangle maps to one SongNote; its x-position is derived from the button column
// so it falls directly toward the button the user must press.
// Angular equivalent: a service + component pair running an imperative animation loop.
import { useRef, useEffect } from 'react'
import type { Song, SongNote } from '../songs/schema'
import { midiToColor, midiToFrenchName } from '../constants/notes'
import type { AccordionSystem } from '../constants/layouts'
import { getLayout } from '../constants/layouts'

type Props = {
  song: Song
  currentBeat: number          // drives which notes are visible and where
  system: AccordionSystem
  showNoteNames: boolean        // progressive display: false = color only, true = color+name
  onNoteAtLine: (note: SongNote) => void  // fired when a note reaches the play line
}

const CANVAS_HEIGHT = 280
const PLAY_LINE_Y = CANVAS_HEIGHT - 40  // px from top where player must press
const BEATS_VISIBLE = 4                 // how many beats ahead to show notes
const NOTE_WIDTH = 28
const NOTE_CORNER_RADIUS = 6

export default function FallingNotes({ song, currentBeat, system, showNoteNames, onNoteAtLine }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layout = getLayout(system)

  // Build col → x-position mapping (mirrors ButtonLayout.tsx spacing)
  const H_GAP = 36
  const ROW_OFFSET = 18
  const PADDING = 24

  function colToX(col: number, row: number): number {
    return PADDING + col * H_GAP + (3 - 1 - row) * ROW_OFFSET
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, CANVAS_HEIGHT)

    // Draw play line
    ctx.strokeStyle = '#F59E0B'  // amber-400
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    ctx.beginPath()
    ctx.moveTo(0, PLAY_LINE_Y)
    ctx.lineTo(canvas.width, PLAY_LINE_Y)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw each visible note rectangle
    song.notes.forEach(note => {
      const beatsUntilNote = note.startBeat - currentBeat
      if (beatsUntilNote > BEATS_VISIBLE || beatsUntilNote < -note.durationBeats) return

      const pos = layout.get(note.midiNote)
      if (!pos) return

      // y: 0 = top (far future), PLAY_LINE_Y = now
      const yProgress = 1 - beatsUntilNote / BEATS_VISIBLE
      const noteY = yProgress * PLAY_LINE_Y - (note.durationBeats / BEATS_VISIBLE) * PLAY_LINE_Y
      const noteHeight = Math.max(12, (note.durationBeats / BEATS_VISIBLE) * PLAY_LINE_Y)
      const x = colToX(pos.col, pos.row) - NOTE_WIDTH / 2

      // Draw rounded rectangle
      const color = midiToColor(note.midiNote)
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.roundRect(x, noteY, NOTE_WIDTH, noteHeight, NOTE_CORNER_RADIUS)
      ctx.fill()

      // Note name label (progressive: only when showNoteNames or 2 beats away)
      if (showNoteNames || beatsUntilNote < 2) {
        ctx.fillStyle = '#000'
        ctx.font = 'bold 9px system-ui'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(midiToFrenchName(note.midiNote), x + NOTE_WIDTH / 2, noteY + noteHeight / 2)
      }

      // Fire event when note reaches play line
      if (Math.abs(beatsUntilNote) < 0.05) {
        onNoteAtLine(note)
      }
    })
  }, [currentBeat, song, system, showNoteNames, onNoteAtLine, layout])

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={CANVAS_HEIGHT}
      className="w-full rounded-lg bg-gray-900"
      aria-label="Notes en défilement"
    />
  )
}
