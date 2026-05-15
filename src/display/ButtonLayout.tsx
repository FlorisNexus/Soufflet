/**
 * @file ButtonLayout.tsx
 * @description SVG rendering of the accordion's right-hand button grid.
 */

import type { MappedNote } from '../audio/NoteMapper'
import { ROW_COUNT, COL_COUNT } from '../constants/layouts'
import { midiToFrenchName } from '../constants/notes'
import { getLayout, type AccordionSystem } from '../constants/layouts'

/**
 * Props for the ButtonLayout component.
 */
type Props = {
  /** The current accordion system ('C' or 'B') */
  system: AccordionSystem
  /** The position of the button to highlight (active note) */
  activeButtonPosition: MappedNote | null
  /** Callback fired when the user toggles the system */
  onSystemChange: (system: AccordionSystem) => void
}

const BTN_RADIUS = 14
const H_GAP = 36      // horizontal distance between button centers
const V_GAP = 32      // vertical distance between row centers
const ROW_OFFSET = 18 // horizontal stagger between rows (mimics physical accordion)
const PADDING = 24

const SVG_WIDTH = PADDING * 2 + (COL_COUNT - 1) * H_GAP + ROW_OFFSET * 2
const SVG_HEIGHT = PADDING * 2 + (ROW_COUNT - 1) * V_GAP + BTN_RADIUS * 2

/**
 * Component that renders the accordion button layout as an interactive SVG.
 * High-performance, resolution-independent, and easily animatable.
 */
export default function ButtonLayout({ system, activeButtonPosition, onSystemChange }: Props) {
  const layout = getLayout(system)

  // Build a reverse map: "row-col" → midiNote for label rendering
  const posToMidi = new Map<string, number>()
  layout.forEach((pos, midi) => posToMidi.set(`${pos.row}-${pos.col}`, midi))

  const rows = Array.from({ length: ROW_COUNT }, (_, row) => row)

  return (
    <div className="flex flex-col items-center gap-2">
      {/* System toggle */}
      <div className="flex gap-2 text-sm text-gray-400">
        <span>Système :</span>
        {(['C', 'B'] as AccordionSystem[]).map(s => (
          <button
            key={s}
            onClick={() => onSystemChange(s)}
            className={`px-2 py-0.5 rounded transition-colors ${system === s ? 'bg-amber-500 text-black font-bold' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            {s}-system
          </button>
        ))}
      </div>

      {/* Accordion button grid */}
      <svg
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="max-w-full drop-shadow-lg"
        aria-label="Clavier accordéon main droite"
      >
        {rows.map(row => (
          <g key={row} data-testid={`button-row-${row}`}>
            {Array.from({ length: COL_COUNT }, (_, col) => {
              const midi = posToMidi.get(`${row}-${col}`)
              if (midi === undefined) return null

              const cx = PADDING + col * H_GAP + (ROW_COUNT - 1 - row) * ROW_OFFSET
              const cy = PADDING + BTN_RADIUS + row * V_GAP
              const isActive =
                activeButtonPosition?.row === row && activeButtonPosition?.col === col
              const color = isActive ? activeButtonPosition!.color : '#374151' // gray-700
              const labelColor = isActive ? '#000' : '#9CA3AF'

              return (
                <g key={col}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={BTN_RADIUS}
                    fill={color}
                    stroke={isActive ? '#fff' : '#4B5563'}
                    strokeWidth={isActive ? 2 : 1}
                    className="transition-all duration-100"
                    data-active={isActive ? 'true' : undefined}
                  />
                  <text
                    x={cx}
                    y={cy + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={9}
                    fill={labelColor}
                    fontWeight={isActive ? 'bold' : 'normal'}
                    className="pointer-events-none select-none transition-colors duration-100"
                  >
                    {midiToFrenchName(midi)}
                  </text>
                </g>
              )
            })}
          </g>
        ))}
      </svg>
    </div>
  )
}
