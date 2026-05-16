/**
 * @file ButtonLayout.tsx
 * @description 5-row SVG rendering of the accordion's right-hand button grid.
 *
 * WHY 5 rows: chromatic accordions physically have 5 rows. Rows 0–2 are
 * principal (each note appears once). Rows 3–4 duplicate rows 0–1 shifted by a
 * minor third, offering alternative fingerings. We highlight the principal
 * candidate with a filled circle and the duplicates with an outline, so the
 * user can learn where the same note is reachable.
 *
 * The component takes `activeMidi` (not a position) because pitchy can't tell
 * which physical button was pressed — we light up every candidate.
 */

import {
  ROW_COUNT,
  COL_COUNT,
  getAllButtons,
  getButtonsForMidi,
  type AccordionSystem,
} from '../constants/layouts'
import { midiToColor, midiToFrenchName } from '../constants/notes'

type Props = {
  /** The accordion system, decided by calibration. */
  system: AccordionSystem
  /** The MIDI note currently played (highlights all candidate buttons). */
  activeMidi: number | null
  /** Optional: the MIDI note the song wants the user to play (Player mode). */
  targetMidiNote?: number | null
}

const BTN_RADIUS = 18
const H_GAP = 48
const V_GAP = 42
const ROW_OFFSET = 22
const PADDING = 28

const SVG_WIDTH = PADDING * 2 + (COL_COUNT - 1) * H_GAP + ROW_OFFSET * (ROW_COUNT - 1)
const SVG_HEIGHT = PADDING * 2 + (ROW_COUNT - 1) * V_GAP + BTN_RADIUS * 2

export default function ButtonLayout({ system, activeMidi, targetMidiNote }: Props) {
  const buttons = getAllButtons(system)
  const activePositions = activeMidi !== null ? getButtonsForMidi(system, activeMidi) : []
  const activeKeys = new Set(activePositions.map(b => `${b.row}-${b.col}`))
  const activeColor = activeMidi !== null ? midiToColor(activeMidi) : null

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="w-full overflow-x-auto pb-2 hide-scrollbar flex justify-center">
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="drop-shadow-2xl"
          aria-label="Clavier accordéon main droite — 5 rangées"
        >
          {buttons.map(({ row, col, midi, isDuplicate }) => {
            const cx = PADDING + col * H_GAP + (ROW_COUNT - 1 - row) * ROW_OFFSET
            const cy = PADDING + BTN_RADIUS + row * V_GAP

            const isActive = activeKeys.has(`${row}-${col}`)
            const isTarget = targetMidiNote === midi

            // Fill rules:
            //  - active + principal → full color
            //  - active + duplicate → transparent fill, color outline
            //  - target (Player mode) → muted background with amber outline
            //  - default → dark slate (duplicates dimmer than principals)
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
              // Slightly dim the duplicates by default so the eye knows they are
              // alternatives, not separate notes.
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
                  r={BTN_RADIUS}
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
                  fontSize={11}
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
