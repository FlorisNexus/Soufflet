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
  COL_PITCH_CLASSES,
  getButtonLabel,
  colForPitchClass,
  pcToName,
} from '../constants/stradella'

type Props = {
  /** Detected bass pitch class (0–11), or null when no bass detected. */
  activePitchClass: number | null
}

const CELL_W = 34
const CELL_H = 27
const GAP = 2
const HEADER_H = 16
const ROW_LABEL_W = 28
// Columns 0-1 = bass rows (BC, B), columns 2-5 = chord rows
const BASS_COLS = 2
const SECTION_GAP = 6  // extra space between bass and chord sections

// Inactive cell backgrounds
const ROW_BG = [
  'rgba(255,255,255,0.09)',  // BC
  'rgba(255,255,255,0.13)',  // B
  'rgba(245,158,11,0.13)',   // Maj
  'rgba(99,102,241,0.13)',   // min
  'rgba(239,68,68,0.10)',    // 7
  'rgba(168,85,247,0.10)',   // dim
]
// Active cell backgrounds (when the pitch class row is detected)
const ACTIVE_BG = [
  'rgba(255,255,255,0.30)',
  'rgba(255,255,255,0.45)',
  'rgba(245,158,11,0.60)',
  'rgba(99,102,241,0.60)',
  'rgba(239,68,68,0.50)',
  'rgba(168,85,247,0.50)',
]
// Active cell border colors
const ACTIVE_BORDER = [
  'rgba(255,255,255,0.4)',
  'rgba(255,255,255,0.5)',
  'rgba(245,158,11,0.6)',
  'rgba(99,102,241,0.6)',
  'rgba(239,68,68,0.5)',
  'rgba(168,85,247,0.5)',
]

const SECTION_LABELS = ['← Basses', 'Accords →']
const SECTION_COLORS = ['rgba(255,255,255,0.18)', 'rgba(245,158,11,0.25)']

const COLS = 6
const totalW = ROW_LABEL_W + GAP + BASS_COLS * (CELL_W + GAP) + SECTION_GAP + (COLS - BASS_COLS) * (CELL_W + GAP)

export default function BassLayout({ activePitchClass }: Props) {
  const activeRow = activePitchClass !== null ? colForPitchClass(activePitchClass) : -1

  return (
    <div className="flex flex-col items-center select-none">
      <span
        className="text-[9px] font-black uppercase tracking-widest mb-2 shrink-0"
        style={{ color: '#374151', letterSpacing: '0.2em' }}
      >
        Main Gauche
      </span>

      <div style={{ width: totalW }}>

        {/* Section labels */}
        <div style={{ display: 'flex', marginLeft: ROW_LABEL_W + GAP, marginBottom: 2 }}>
          <div style={{ width: BASS_COLS * (CELL_W + GAP), paddingRight: GAP }}>
            <div style={{
              fontSize: 7, fontWeight: 900, textAlign: 'center', textTransform: 'uppercase',
              letterSpacing: '0.08em', color: SECTION_COLORS[0],
              fontFamily: "'Barlow Condensed', sans-serif",
            }}>
              {SECTION_LABELS[0]}
            </div>
          </div>
          <div style={{ width: SECTION_GAP }} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 7, fontWeight: 900, textAlign: 'center', textTransform: 'uppercase',
              letterSpacing: '0.08em', color: SECTION_COLORS[1],
              fontFamily: "'Barlow Condensed', sans-serif",
            }}>
              {SECTION_LABELS[1]}
            </div>
          </div>
        </div>

        {/* Column headers */}
        <div style={{ display: 'flex', marginLeft: ROW_LABEL_W + GAP, marginBottom: GAP }}>
          {Array.from({ length: COLS }, (_, col) => (
            <div
              key={col}
              style={{
                width: CELL_W,
                height: HEADER_H,
                marginRight: col === BASS_COLS - 1 ? SECTION_GAP + GAP : GAP,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8, fontWeight: 900,
                fontFamily: "'Barlow Condensed', sans-serif",
                color: col < BASS_COLS ? 'rgba(255,255,255,0.35)' : 'rgba(245,158,11,0.45)',
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}
            >
              {col === 0 ? 'BC' : col === 1 ? 'B' : col === 2 ? 'Maj' : col === 3 ? 'min' : col === 4 ? '7' : '°'}
            </div>
          ))}
        </div>

        {/* Rows */}
        {COL_PITCH_CLASSES.map((pc, rowIdx) => {
          const isActive = rowIdx === activeRow
          return (
            <div
              key={pc}
              style={{
                display: 'flex', alignItems: 'center',
                marginBottom: GAP,
                borderRadius: 4,
                background: isActive ? 'rgba(245,158,11,0.05)' : 'transparent',
                transition: 'background 0.12s',
              }}
            >
              {/* Note name label */}
              <div style={{
                width: ROW_LABEL_W, height: CELL_H, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                paddingRight: 4, marginRight: GAP,
                fontSize: 10, fontWeight: 900,
                fontFamily: "'Barlow Condensed', sans-serif",
                color: isActive ? '#f59e0b' : '#5b6470',
                transition: 'color 0.12s',
              }}>
                {pcToName(pc)}
              </div>

              {/* Bass cells (BC, B) */}
              {[0, 1].map(col => (
                <div
                  key={col}
                  style={{
                    width: CELL_W, height: CELL_H,
                    marginRight: col === 1 ? SECTION_GAP + GAP : GAP,
                    borderRadius: 4, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, fontWeight: 800,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    background: isActive ? ACTIVE_BG[col] : ROW_BG[col],
                    color: isActive ? '#fff' : '#555e6b',
                    border: `1px solid ${isActive ? ACTIVE_BORDER[col] : 'rgba(255,255,255,0.06)'}`,
                    transition: 'background 0.12s, color 0.12s, border-color 0.12s',
                  }}
                >
                  {getButtonLabel(col, pc)}
                </div>
              ))}

              {/* Visual separator */}
              <div style={{
                width: 1, height: CELL_H - 4, marginRight: GAP, flexShrink: 0,
                background: 'rgba(255,255,255,0.06)',
              }} />

              {/* Chord cells (Maj, min, 7, °) */}
              {[2, 3, 4, 5].map(col => (
                <div
                  key={col}
                  style={{
                    width: CELL_W, height: CELL_H,
                    marginRight: GAP, borderRadius: 4, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, fontWeight: 700,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    background: isActive ? ACTIVE_BG[col] : ROW_BG[col],
                    color: isActive ? '#fff' : '#3d4450',
                    border: `1px solid ${isActive ? ACTIVE_BORDER[col] : 'rgba(255,255,255,0.04)'}`,
                    transition: 'background 0.12s, color 0.12s, border-color 0.12s',
                  }}
                >
                  {getButtonLabel(col, pc)}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Detected note pill */}
      <div className="mt-3 text-center" style={{ minHeight: '1.5rem' }}>
        {activePitchClass !== null ? (
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '1.1rem', fontWeight: 900,
            color: '#f59e0b',
            textShadow: '0 0 20px rgba(245,158,11,0.5)',
          }}>
            {pcToName(activePitchClass)}
          </span>
        ) : (
          <span style={{ color: '#2d333a', fontSize: '0.8rem' }}>—</span>
        )}
      </div>
    </div>
  )
}
