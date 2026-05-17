/**
 * @file FallingNotes.tsx
 * @description Canvas-based animation of colored rectangles falling toward the play line.
 * Canvas fills its flex-1 container so notes reach the full screen height.
 */

import { useRef, useEffect } from 'react'
import type { Song, SongNote } from '../songs/schema'
import { midiToColor, midiToFrenchName } from '../constants/notes'
import type { AccordionSystem } from '../constants/layouts'
import { getLayout } from '../constants/layouts'

type Props = {
  song: Song
  currentBeat: number
  system: AccordionSystem
  showNoteNames: boolean
  onNoteAtLine: (note: SongNote) => void
}

// Play line at 55% from top → 45% of screen height for notes to scroll after the line.
const PLAY_LINE_RATIO = 0.55
const BEATS_VISIBLE = 5
const NOTE_WIDTH = 40
const NOTE_CORNER_RADIUS = 10

const H_GAP = 48
const ROW_OFFSET = 22
const PADDING = 28
const ROWS_RENDERED = 5

function colToX(col: number, row: number): number {
  return PADDING + col * H_GAP + (ROWS_RENDERED - 1 - row) * ROW_OFFSET
}

export default function FallingNotes({ song, currentBeat, system, showNoteNames, onNoteAtLine }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const layout     = getLayout(system)

  // Mutable refs — updated every render without restarting the RAF loop.
  const beatRef        = useRef(currentBeat)
  const songRef        = useRef(song)
  const layoutRef      = useRef(layout)
  const showNamesRef   = useRef(showNoteNames)
  const onNoteAtLineRef = useRef(onNoteAtLine)

  useEffect(() => { beatRef.current = currentBeat },      [currentBeat])
  useEffect(() => { songRef.current = song },             [song])
  useEffect(() => { layoutRef.current = layout },         [layout])
  useEffect(() => { showNamesRef.current = showNoteNames },[showNoteNames])
  useEffect(() => { onNoteAtLineRef.current = onNoteAtLine },[onNoteAtLine])

  // Single RAF loop — starts once, uses refs so it never needs to restart.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    let cancelled = false

    function resize() {
      if (!canvas) return
      const r = canvas.getBoundingClientRect()
      canvas.width  = Math.max(1, Math.floor(r.width * dpr))
      canvas.height = Math.max(1, Math.floor(r.height * dpr))
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw() {
      if (cancelled || !canvas || !ctx) return
      if (document.hidden) { requestAnimationFrame(draw); return }

      const r = canvas.getBoundingClientRect()
      const W = r.width
      const H = r.height
      const playLineY = Math.round(H * PLAY_LINE_RATIO)

      ctx.clearRect(0, 0, W, H)

      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, 'rgba(255,255,255,0.02)')
      bg.addColorStop(1, 'rgba(0,0,0,0.0)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'
      ctx.lineWidth = 1
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 21; col++) {
          const x = colToX(col, row)
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
        }
      }

      // Play line
      ctx.shadowBlur = 10
      ctx.shadowColor = '#F59E0B'
      ctx.strokeStyle = 'rgba(245,158,11,0.8)'
      ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(0, playLineY); ctx.lineTo(W, playLineY); ctx.stroke()
      ctx.shadowBlur = 0

      const beat   = beatRef.current
      const notes  = songRef.current.notes
      const lt     = layoutRef.current

      // How many beats of "below-the-line" space the canvas provides.
      const maxBeatsBelow = BEATS_VISIBLE * ((H - playLineY) / playLineY)

      notes.forEach(note => {
        const bun = note.startBeat - beat   // beats until note hits line (negative = past)

        if (bun > BEATS_VISIBLE || bun < -(note.durationBeats + maxBeatsBelow)) return

        const pos = lt.get(note.midiNote)
        if (!pos) return

        const yProgress = 1 - bun / BEATS_VISIBLE
        const noteY  = yProgress * playLineY - (note.durationBeats / BEATS_VISIBLE) * playLineY
        const noteH  = Math.max(20, (note.durationBeats / BEATS_VISIBLE) * playLineY)
        const x      = colToX(pos.col, pos.row) - NOTE_WIDTH / 2

        const color = midiToColor(note.midiNote)
        const grad  = ctx.createLinearGradient(x, noteY, x, noteY + noteH)
        grad.addColorStop(0, color)
        grad.addColorStop(1, color + 'CC')

        if (Math.abs(bun) < 0.2) { ctx.shadowBlur = 15; ctx.shadowColor = color }

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.roundRect(x, noteY, NOTE_WIDTH, noteH, NOTE_CORNER_RADIUS)
        ctx.fill()

        ctx.strokeStyle = 'rgba(255,255,255,0.3)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.shadowBlur = 0

        // Always show note name when the rectangle is tall enough to fit the text.
        if (noteH >= 16) {
          ctx.fillStyle = '#000'
          ctx.font = `bold ${Math.min(12, Math.floor(noteH - 4))}px system-ui`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(midiToFrenchName(note.midiNote), x + NOTE_WIDTH / 2, noteY + noteH / 2)
        }

        if (Math.abs(bun) < 0.05) onNoteAtLineRef.current(note)
      })

      requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    requestAnimationFrame(draw)

    return () => {
      cancelled = true
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full bg-gray-950/50"
      aria-label="Notes en défilement"
    />
  )
}
