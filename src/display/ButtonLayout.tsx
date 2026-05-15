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
  /** The MIDI note currently expected by the song (target) */
  targetMidiNote?: number | null
}

const BTN_RADIUS = 20 // Agrandissement (était 14)
const H_GAP = 52      // Agrandissement (était 36)
const V_GAP = 46      // Agrandissement (était 32)
const ROW_OFFSET = 26 // Agrandissement (était 18)
const PADDING = 30

const SVG_WIDTH = PADDING * 2 + (COL_COUNT - 1) * H_GAP + ROW_OFFSET * 2
const SVG_HEIGHT = PADDING * 2 + (ROW_COUNT - 1) * V_GAP + BTN_RADIUS * 2

/**
 * Component that renders the accordion button layout as an interactive SVG.
 * High-performance, resolution-independent, and easily animatable.
 */
export default function ButtonLayout({ system, activeButtonPosition, onSystemChange, targetMidiNote }: Props) {
  const layout = getLayout(system)

  // Build a reverse map: "row-col" → midiNote for label rendering
  const posToMidi = new Map<string, number>()
  layout.forEach((pos, midi) => posToMidi.set(`${pos.row}-${pos.col}`, midi))

  const rows = Array.from({ length: ROW_COUNT }, (_, row) => row)

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* System toggle */}
      <div className="flex items-center gap-3 text-sm font-medium bg-gray-800/50 p-1.5 rounded-xl border border-gray-700/50 backdrop-blur-sm">
        <span className="text-gray-400 ml-2">Système :</span>
        {(['C', 'B'] as AccordionSystem[]).map(s => (
          <button
            key={s}
            onClick={() => onSystemChange(s)}
            className={`px-4 py-1.5 rounded-lg transition-all ${system === s ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:text-gray-200'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Accordion button grid */}
      <div className="w-full overflow-x-auto pb-4 hide-scrollbar flex justify-center">
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="drop-shadow-2xl filter"
          aria-label="Clavier accordéon main droite"
        >
          {rows.map(row => (
            <g key={row} data-testid={`button-row-${row}`}>
              {Array.from({ length: COL_COUNT }, (_, col) => {
                const midi = posToMidi.get(`${row}-${col}`)
                if (midi === undefined) return null

                const cx = PADDING + col * H_GAP + (ROW_COUNT - 1 - row) * ROW_OFFSET
                const cy = PADDING + BTN_RADIUS + row * V_GAP
                
                const isActive = activeButtonPosition?.row === row && activeButtonPosition?.col === col
                const isTarget = targetMidiNote === midi
                
                const color = isActive ? activeButtonPosition!.color : (isTarget ? '#4B5563' : '#1F2937')
                const labelColor = isActive ? '#000' : (isTarget ? '#F59E0B' : '#6B7280')
                const strokeColor = isActive ? '#fff' : (isTarget ? '#F59E0B' : '#374151')

                return (
                  <g key={col} className="transition-all duration-150">
                    <circle
                      cx={cx}
                      cy={cy}
                      r={BTN_RADIUS}
                      fill={color}
                      stroke={strokeColor}
                      strokeWidth={isActive ? 3 : (isTarget ? 2 : 1)}
                      className={`transition-all duration-150 ${isTarget && !isActive ? 'animate-pulse' : ''}`}
                      data-active={isActive ? 'true' : undefined}
                    />
                    <text
                      x={cx}
                      y={cy + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={12} // Plus grand
                      fill={labelColor}
                      fontWeight={isActive || isTarget ? 'bold' : 'medium'}
                      className="pointer-events-none select-none"
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
    </div>
  )
}
