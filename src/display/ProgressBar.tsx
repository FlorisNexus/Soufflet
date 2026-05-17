/**
 * @file ProgressBar.tsx
 * @description Seekable progress bar showing current position in the song.
 * Click or drag to jump to any position. Shows elapsed / total time.
 */

import { useRef, useEffect } from 'react'

type Props = {
  currentBeat: number
  totalBeats: number
  bpm: number
  tempoMultiplier: number
  onSeek: (beat: number) => void
  color?: string
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function ProgressBar({
  currentBeat,
  totalBeats,
  bpm,
  tempoMultiplier,
  onSeek,
  color = '#f59e0b',
}: Props) {
  const barRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const beatsPerSecond = (bpm * tempoMultiplier) / 60
  const totalTimeS = beatsPerSecond > 0 ? totalBeats / beatsPerSecond : 0
  const currentTimeS = beatsPerSecond > 0 ? currentBeat / beatsPerSecond : 0
  const progress = totalBeats > 0 ? Math.min(1, currentBeat / totalBeats) : 0

  function beatFromPointer(clientX: number): number {
    if (!barRef.current) return 0
    const rect = barRef.current.getBoundingClientRect()
    const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return fraction * totalBeats
  }

  function handleMouseDown(e: React.MouseEvent) {
    isDragging.current = true
    onSeek(beatFromPointer(e.clientX))
  }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (isDragging.current) onSeek(beatFromPointer(e.clientX))
    }
    function onUp() {
      isDragging.current = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSeek, totalBeats])

  return (
    <div
      className="shrink-0 flex items-center gap-3 px-4 py-2 border-t select-none"
      style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(6,6,14,0.8)' }}
    >
      <span
        className="text-[10px] font-black tabular-nums shrink-0"
        style={{ fontFamily: "'JetBrains Mono', monospace", color, minWidth: '2.8rem' }}
      >
        {formatTime(currentTimeS)}
      </span>

      {/* Track */}
      <div
        ref={barRef}
        className="flex-1 relative h-1.5 rounded-full cursor-pointer group"
        style={{ background: 'rgba(255,255,255,0.08)' }}
        onMouseDown={handleMouseDown}
      >
        {/* Fill */}
        <div
          className="absolute left-0 top-0 bottom-0 rounded-full pointer-events-none"
          style={{ width: `${progress * 100}%`, background: color, transition: 'width 0.1s linear' }}
        />
        {/* Thumb — visible on hover */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress * 100}% - 6px)` }}
        />
      </div>

      <span
        className="text-[10px] font-black tabular-nums shrink-0"
        style={{ fontFamily: "'JetBrains Mono', monospace", color: '#4b5563', minWidth: '2.8rem', textAlign: 'right' }}
      >
        {formatTime(totalTimeS)}
      </span>
    </div>
  )
}
