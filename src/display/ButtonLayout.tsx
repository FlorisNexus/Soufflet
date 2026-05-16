/**
 * @file ButtonLayout.tsx
 * @description 5-row SVG rendering of the accordion's right-hand button grid.
 *
 * WHY two orientations: Free Play uses `vertical` (default) so the on-screen
 * keyboard matches what the player sees when looking at their accordion —
 * rangée 1 on the right, lowest pitch at the top. Player mode keeps
 * `horizontal` because FallingNotes's x-coordinates are tuned to that layout
 * and will be migrated in a future pass.
 *
 * In `vertical` mode:
 *   - X axis: rows (row 0 = Florian's rangée 1 = rightmost).
 *   - Y axis: col within each row (col 0 = position 1 = lowest pitch = top).
 *   - 18-button rows (rows 1 & 3) are staggered down by half a V_GAP so their
 *     buttons interleave visually with the adjacent 17-button rows.
 */

import {
  ROW_COUNT,
  COL_COUNT,
  MAX_BUTTONS_PER_ROW,
  BUTTONS_PER_ROW_LAYOUT,
  getAllButtons,
  getButtonsForMidi,
  type AccordionSystem,
} from '../constants/layouts'
import { midiToColor, midiToFrenchName } from '../constants/notes'

type Props = {
  system: AccordionSystem
  activeMidi: number | null
  targetMidiNote?: number | null
  /** Display orientation. Default `vertical` (Free Play, first-person view).
   *  Pass `horizontal` for Player mode (FallingNotes alignment). */
  orientation?: 'vertical' | 'horizontal'
}

// ─── Vertical layout constants ───────────────────────────────────────────────
const V_BTN = 19       // button radius
const V_ROW_GAP = 60   // horizontal distance between row centres
const V_COL_GAP = 36   // vertical distance between button centres
// 18-button rows are physically staggered UP by half a step on the instrument.
// This means Do (rangée 2, 18-btn) appears ABOVE Ré (rangée 3, 17-btn)
// at the same position number — which matches the physical layout.
const V_STAGGER = 18   // = V_COL_GAP / 2
const V_HPAD = 22      // horizontal padding
const V_VPAD = 28      // vertical padding (extra top room for the upward-shifted rows)

// Width: 5 rows spaced by V_ROW_GAP.
const V_SVG_WIDTH = V_HPAD * 2 + V_BTN * 2 + (ROW_COUNT - 1) * V_ROW_GAP
// Height: accounts for the upward stagger on 18-btn rows and 17 steps on the tallest column.
// Tallest cy = V_VPAD + V_BTN + 17 * V_COL_GAP (18-btn row, shifted up, col 17 is tallest).
const V_SVG_HEIGHT = 2 * (V_VPAD + V_BTN) + (MAX_BUTTONS_PER_ROW - 1) * V_COL_GAP - V_STAGGER

// ─── Horizontal layout constants (Player mode, unchanged) ────────────────────
const H_BTN = 18
const H_H_GAP = 48
const H_V_GAP = 42
const H_ROW_OFFSET = 22
const H_PAD = 28

const H_SVG_WIDTH = H_PAD * 2 + (COL_COUNT - 1) * H_H_GAP + H_ROW_OFFSET * (ROW_COUNT - 1)
const H_SVG_HEIGHT = H_PAD * 2 + (ROW_COUNT - 1) * H_V_GAP + H_BTN * 2

export default function ButtonLayout({
  system,
  activeMidi,
  targetMidiNote,
  orientation = 'vertical',
}: Props) {
  const buttons = getAllButtons(system)
  const activePositions = activeMidi !== null ? getButtonsForMidi(system, activeMidi) : []
  const activeKeys = new Set(activePositions.map(b => `${b.row}-${b.col}`))
  const activeColor = activeMidi !== null ? midiToColor(activeMidi) : null

  const isVertical = orientation === 'vertical'

  const svgWidth = isVertical ? V_SVG_WIDTH : H_SVG_WIDTH
  const svgHeight = isVertical ? V_SVG_HEIGHT : H_SVG_HEIGHT
  const btnRadius = isVertical ? V_BTN : H_BTN
  const fontSize = 11

  function getCx(row: number, col: number): number {
    if (isVertical) {
      // Rangée 1 (row 0) on the right; rangée 5 (row 4) on the left.
      return V_HPAD + V_BTN + (ROW_COUNT - 1 - row) * V_ROW_GAP
    }
    return H_PAD + col * H_H_GAP + (ROW_COUNT - 1 - row) * H_ROW_OFFSET
  }

  function getCy(row: number, col: number): number {
    if (isVertical) {
      // 18-btn rows (rows 1 & 3 = rangées 2 & 4) are shifted UP by V_STAGGER
      // so their buttons physically interleave between the adjacent 17-btn rows.
      // Result: Do (rangée 2 pos 6) appears ABOVE Ré (rangée 3 pos 6), matching
      // the real instrument where rangée 2's pos 6 is higher than rangée 3's.
      const shift = BUTTONS_PER_ROW_LAYOUT[row] === 18 ? -V_STAGGER : 0
      return V_VPAD + V_BTN + shift + col * V_COL_GAP
    }
    return H_PAD + H_BTN + row * H_V_GAP
  }

  return (
    <div className={isVertical ? 'flex items-start justify-center' : 'flex flex-col items-center gap-3 w-full'}>
      <div className={isVertical ? 'overflow-y-auto' : 'w-full overflow-x-auto pb-2 hide-scrollbar flex justify-center'}>
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="drop-shadow-2xl"
          aria-label="Clavier accordéon main droite — 5 rangées"
        >
          {buttons.map(({ row, col, midi, isDuplicate }) => {
            const cx = getCx(row, col)
            const cy = getCy(row, col)

            const isActive = activeKeys.has(`${row}-${col}`)
            const isTarget = targetMidiNote === midi

            let fill: string
            let stroke: string
            let strokeWidth: number
            let textColor: string
            let pulse = false

            if (isActive && activeColor && isDuplicate) {
              fill = 'transparent'
              stroke = activeColor
              strokeWidth = 3
              textColor = activeColor
            } else if (isActive && activeColor) {
              fill = activeColor
              stroke = '#fff'
              strokeWidth = 3
              textColor = '#000'
              pulse = true
            } else if (isTarget) {
              fill = '#4B5563'
              stroke = '#F59E0B'
              strokeWidth = 2
              textColor = '#F59E0B'
              pulse = true
            } else if (isDuplicate) {
              fill = '#111827'
              stroke = '#1F2937'
              strokeWidth = 1
              textColor = '#4B5563'
            } else {
              fill = '#1F2937'
              stroke = '#374151'
              strokeWidth = 1
              textColor = '#9CA3AF'
            }

            return (
              <g
                key={`${row}-${col}`}
                data-testid={`button-${row}-${col}`}
                data-state={isActive ? (isDuplicate ? 'duplicate' : 'principal') : (isTarget ? 'target' : 'idle')}
                className="transition-all duration-150"
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={btnRadius}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  className={`transition-all duration-150 ${pulse ? 'animate-pulse' : ''}`}
                />
                <text
                  x={cx}
                  y={cy + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={fontSize}
                  fill={textColor}
                  fontWeight={isActive || isTarget ? 'bold' : 'medium'}
                  className="pointer-events-none select-none"
                >
                  {midiToFrenchName(midi)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
