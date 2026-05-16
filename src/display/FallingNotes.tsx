/**
 * @file FallingNotes.tsx
 * @description Canvas-based animation of colored rectangles falling toward the play line.
 */

import { useRef, useEffect } from 'react'
import type { Song, SongNote } from '../songs/schema'
import { midiToColor, midiToFrenchName } from '../constants/notes'
import type { AccordionSystem } from '../constants/layouts'
import { getLayout } from '../constants/layouts'

/**
 * Props for the FallingNotes component.
 */
type Props = {
  /** The song being played */
  song: Song
  /** The current position in the song (beats) */
  currentBeat: number
  /** The current accordion system ('C' or 'B') */
  system: AccordionSystem
  /** Whether to always show note names on the rectangles */
  showNoteNames: boolean
  /** Callback fired when a note reaches the hit-line */
  onNoteAtLine: (note: SongNote) => void
}

const CANVAS_HEIGHT = 400 // Plus haut
const PLAY_LINE_Y = CANVAS_HEIGHT - 60  // Plus d'espace en bas
const BEATS_VISIBLE = 5                 // Plus de visibilité anticipée
const NOTE_WIDTH = 40                   // Plus large pour correspondre aux nouveaux boutons
const NOTE_CORNER_RADIUS = 10

/**
 * Component that renders the Synthesia-style falling notes visualization.
 * Uses a Canvas element for 60fps imperative animation.
 */
export default function FallingNotes({ song, currentBeat, system, showNoteNames, onNoteAtLine }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layout = getLayout(system)

  // Build col → x-position mapping (mirrors ButtonLayout.tsx 5-row spacing).
  // Kept in sync with ButtonLayout's constants — the falling rectangles land
  // visually above the corresponding button, so any change there must mirror
  // here.
  const H_GAP = 48
  const ROW_OFFSET = 22
  const PADDING = 28
  const ROWS_RENDERED = 5

  function colToX(col: number, row: number): number {
    return PADDING + col * H_GAP + (ROWS_RENDERED - 1 - row) * ROW_OFFSET
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // On ajuste la largeur du canvas dynamiquement pour remplir le parent
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = CANVAS_HEIGHT * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, rect.width, CANVAS_HEIGHT)

    // Draw grid lines for columns (background)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
    ctx.lineWidth = 1
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 21; col++) {
        const x = colToX(col, row)
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, CANVAS_HEIGHT)
        ctx.stroke()
      }
    }

    // Draw play line (neon style)
    ctx.shadowBlur = 10
    ctx.shadowColor = '#F59E0B'
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, PLAY_LINE_Y)
    ctx.lineTo(rect.width, PLAY_LINE_Y)
    ctx.stroke()
    ctx.shadowBlur = 0 // Reset shadow

    // Draw each visible note rectangle
    song.notes.forEach(note => {
      const beatsUntilNote = note.startBeat - currentBeat
      if (beatsUntilNote > BEATS_VISIBLE || beatsUntilNote < -note.durationBeats) return

      const pos = layout.get(note.midiNote)
      if (!pos) return

      // y: 0 = top (far future), PLAY_LINE_Y = now
      const yProgress = 1 - beatsUntilNote / BEATS_VISIBLE
      const noteY = yProgress * PLAY_LINE_Y - (note.durationBeats / BEATS_VISIBLE) * PLAY_LINE_Y
      const noteHeight = Math.max(20, (note.durationBeats / BEATS_VISIBLE) * PLAY_LINE_Y)
      const x = colToX(pos.col, pos.row) - NOTE_WIDTH / 2

      // Gradient color
      const color = midiToColor(note.midiNote)
      const gradient = ctx.createLinearGradient(x, noteY, x, noteY + noteHeight)
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, color + 'CC') // semi-transparent bottom

      // Draw rounded rectangle with glow if close
      if (Math.abs(beatsUntilNote) < 0.2) {
        ctx.shadowBlur = 15
        ctx.shadowColor = color
      }
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.roundRect(x, noteY, NOTE_WIDTH, noteHeight, NOTE_CORNER_RADIUS)
      ctx.fill()
      
      // Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1
      ctx.stroke()
      
      ctx.shadowBlur = 0

      // Note name label
      if (showNoteNames || beatsUntilNote < 1.5) {
        ctx.fillStyle = '#000'
        ctx.font = 'bold 12px system-ui'
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
      className="w-full h-[400px] bg-gray-950/50"
      aria-label="Notes en défilement"
    />
  )
}
