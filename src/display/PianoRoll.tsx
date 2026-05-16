/**
 * @file PianoRoll.tsx
 * @description Canvas-based scrolling ribbon for Free Play mode.
 *
 * WHY Canvas (not SVG): we redraw 60× per second to keep the ribbon scrolling
 * smoothly even during silence. SVG accumulates DOM nodes per block; Canvas
 * stays at a single element and lets us batch-clear and redraw with zero GC
 * churn.
 *
 * Layout:
 *   - Horizontal time axis: 1 s of real time = `PX_PER_SECOND` horizontal pixels.
 *   - The "now" line sits at the right edge of the canvas.
 *   - Each `PlayedNote` is a coloured rectangle whose width = duration.
 *   - The open note (endTime === null) is drawn growing toward the right edge.
 *   - Blocks that scroll past the left edge are simply not drawn (and the
 *     timeline cap in the reducer takes care of memory).
 *
 * Click hit-testing: we keep a parallel `hitRects` array (recomputed each
 * frame) so a `pointerdown` can locate the block under the cursor and trigger
 * the audio reference player.
 */

import { useEffect, useRef } from 'react'
import type { PlayedNote } from '../hooks/freePlayReducer'
import { midiToColor, midiToFrenchNameWithOctave } from '../constants/notes'

type Props = {
  timeline: PlayedNote[]
  sessionStartedAt: number
  /** Pixel height of the canvas. Defaults to 140. */
  height?: number
  /** Called when the user clicks/taps a block. */
  onBlockClick?: (midi: number) => void
}

const PX_PER_SECOND = 100
const BLOCK_VPADDING = 14
const LABEL_MIN_WIDTH = 30
const NOW_LINE_WIDTH = 2

type HitRect = { x: number; y: number; w: number; h: number; midi: number }

export default function PianoRoll({ timeline, sessionStartedAt, height = 140, onBlockClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const timelineRef = useRef<PlayedNote[]>(timeline)
  const hitRectsRef = useRef<HitRect[]>([])

  // Keep refs in sync with props so the RAF loop sees the latest values
  // without restarting.
  useEffect(() => { timelineRef.current = timeline }, [timeline])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cancelled = false

    function resize() {
      if (!canvas) return
      // Match the canvas backing store to the rendered size for crisp pixels.
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw() {
      if (cancelled || !canvas || !ctx) return
      if (document.hidden) {
        // Suspend rendering while the tab is backgrounded.
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const now = performance.now() - sessionStartedAt

      // Clear.
      ctx.clearRect(0, 0, width, height)

      // Background gradient (subtle).
      const bg = ctx.createLinearGradient(0, 0, 0, height)
      bg.addColorStop(0, 'rgba(255,255,255,0.02)')
      bg.addColorStop(1, 'rgba(0,0,0,0.0)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, width, height)

      const blockY = BLOCK_VPADDING
      const blockH = height - BLOCK_VPADDING * 2
      const newHitRects: HitRect[] = []

      const timeAtLeftEdge = now - width / PX_PER_SECOND * 1000

      for (const note of timelineRef.current) {
        const start = note.startTime
        const end = note.endTime ?? now
        if (end < timeAtLeftEdge) continue // off-screen left

        // x = right_edge - (now - end)/1000 * px_per_second
        const xRight = width - ((now - end) / 1000) * PX_PER_SECOND
        const xLeft = width - ((now - start) / 1000) * PX_PER_SECOND
        const blockW = Math.max(2, xRight - xLeft)

        const color = midiToColor(note.midi)
        ctx.fillStyle = color
        ctx.globalAlpha = note.endTime === null ? 0.9 : 0.75
        ctx.fillRect(xLeft, blockY, blockW, blockH)
        ctx.globalAlpha = 1

        // Border for open note (highlights the currently held note).
        if (note.endTime === null) {
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 2
          ctx.strokeRect(xLeft + 1, blockY + 1, blockW - 2, blockH - 2)
        }

        if (blockW >= LABEL_MIN_WIDTH) {
          ctx.fillStyle = '#000'
          ctx.font = 'bold 12px system-ui, sans-serif'
          ctx.textBaseline = 'middle'
          const label = midiToFrenchNameWithOctave(note.midi)
          ctx.fillText(label, xLeft + 6, blockY + blockH / 2)
        }

        newHitRects.push({ x: xLeft, y: blockY, w: blockW, h: blockH, midi: note.midi })
      }

      // Now line.
      ctx.fillStyle = '#F59E0B'
      ctx.fillRect(width - NOW_LINE_WIDTH, 0, NOW_LINE_WIDTH, height)

      hitRectsRef.current = newHitRects
      rafRef.current = requestAnimationFrame(draw)
    }

    resize()
    const onResize = () => resize()
    window.addEventListener('resize', onResize)
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelled = true
      window.removeEventListener('resize', onResize)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [sessionStartedAt, height])

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!onBlockClick) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    // Iterate from newest to oldest (rightmost first) so overlapping picks the
    // most recent one.
    for (let i = hitRectsRef.current.length - 1; i >= 0; i--) {
      const h = hitRectsRef.current[i]
      if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {
        onBlockClick(h.midi)
        return
      }
    }
  }

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      style={{ width: '100%', height: `${height}px`, display: 'block', cursor: onBlockClick ? 'pointer' : 'default' }}
      className="rounded-2xl bg-black/40 border border-white/5"
      role="img"
      aria-label="Ruban des notes jouées"
    />
  )
}
