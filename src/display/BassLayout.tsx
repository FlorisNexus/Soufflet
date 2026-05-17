/**
 * @file BassLayout.tsx
 * @description Visual grid for the Stradella 120-button bass system.
 *
 * Layout: 12 rows (one per pitch class, circle-of-5ths order) × 6 columns
 * (button types: counter-bass, bass, major, minor, dom7, dim).
 *
 * When a bass pitch class is detected, the entire corresponding row glows
 * in the accent colour so the player immediately sees which accordion column
 * they are pressing — and all six button types available for that root.
 */

import {
  ROW_LABELS,
  COL_PITCH_CLASSES,
  getButtonLabel,
  colForPitchClass,
  pcToName,
} from '../constants/stradella'

type Props = {
  /** Detected bass pitch class (0–11), or null when no bass detected. */
  activePitchClass: number | null
}

const CELL_W = 36
const CELL_H = 28
const GAP = 2
const HEADER_H = 18
const ROW_LABEL_W = 28

const ROW_COLORS = [
  'rgba(255,255,255,0.08)',  // BC - subtle
  'rgba(255,255,255,0.12)',  // B  - slightly brighter
  'rgba(245,158,11,0.15)',   // Maj - warm amber hint
  'rgba(99,102,241,0.15)',   // min - indigo hint
  'rgba(239,68,68,0.12)',    // 7   - red hint
  'rgba(168,85,247,0.12)',   // dim - purple hint
]

const ACTIVE_ROW_COLORS = [
  'rgba(255,255,255,0.25)',
  'rgba(255,255,255,0.35)',
  'rgba(245,158,11,0.55)',
  'rgba(99,102,241,0.55)',
  'rgba(239,68,68,0.45)',
  'rgba(168,85,247,0.45)',
]

const ACTIVE_TEXT_COLOR = '#fff'
const INACTIVE_TEXT_COLOR = '#4b5563'
const DIM_TEXT_COLOR = '#374151'

export default function BassLayout({ activePitchClass }: Props) {
  const totalW = ROW_LABEL_W + GAP + 6 * (CELL_W + GAP)

  const activeRow = activePitchClass !== null ? colForPitchClass(activePitchClass) : -1

  return (
    <div className="flex flex-col items-center">
      <span
        className="text-[9px] font-black uppercase tracking-widest mb-2 shrink-0"
        style={{ color: '#374151', letterSpacing: '0.2em' }}
      >
        Main Gauche
      </span>

      <div style={{ width: totalW, position: 'relative' }}>
        {/* Column headers */}
        <div style={{ display: 'flex', marginLeft: ROW_LABEL_W + GAP, gap: GAP, marginBottom: GAP }}>
          {Array.from({ length: 6 }, (_, col) => (
            <div
              key={col}
              style={{
                width: CELL_W,
                height: HEADER_H,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 8,
                fontWeight: 900,
                fontFamily: "'Barlow Condensed', sans-serif",
                color: '#6b7280',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {ROW_LABELS[col]}
            </div>
          ))}
        </div>

        {/* Rows (one per pitch class in circle-of-5ths order) */}
        {COL_PITCH_CLASSES.map((pc, rowIdx) => {
          const isActive = rowIdx === activeRow
          return (
            <div
              key={pc}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: GAP,
                marginBottom: GAP,
                borderRadius: 4,
                padding: '1px 0',
                background: isActive ? 'rgba(245,158,11,0.06)' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              {/* Row label (note name) */}
              <div
                style={{
                  width: ROW_LABEL_W,
                  height: CELL_H,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: 4,
                  fontSize: 10,
                  fontWeight: 900,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  color: isActive ? '#f59e0b' : '#6b7280',
                  transition: 'color 0.15s',
                }}
              >
                {pcToName(pc)}
              </div>

              {/* 6 cells for the 6 row types */}
              {Array.from({ length: 6 }, (_, col) => {
                const label = getButtonLabel(col, pc)
                return (
                  <div
                    key={col}
                    style={{
                      width: CELL_W,
                      height: CELL_H,
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 8,
                      fontWeight: 700,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      background: isActive ? ACTIVE_ROW_COLORS[col] : ROW_COLORS[col],
                      color: isActive ? ACTIVE_TEXT_COLOR : (col <= 1 ? INACTIVE_TEXT_COLOR : DIM_TEXT_COLOR),
                      border: `1px solid ${isActive ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.04)'}`,
                      transition: 'background 0.12s, color 0.12s',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {label}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Active note indicator */}
      <div
        className="mt-3 text-center"
        style={{ minHeight: '1.5rem' }}
      >
        {activePitchClass !== null ? (
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '1.1rem',
              fontWeight: 900,
              color: '#f59e0b',
              textShadow: '0 0 20px rgba(245,158,11,0.5)',
            }}
          >
            {pcToName(activePitchClass)}
          </span>
        ) : (
          <span style={{ color: '#374151', fontSize: '0.8rem' }}>—</span>
        )}
      </div>
    </div>
  )
}
