// layouts.ts — physical button layout for chromatic accordion right hand
// C-system: 3 rows × 21 buttons. Row 0 = farthest from player, Row 2 = closest.
// Each row ascends by whole tones (2 semitones per button).
// Row 0 and Row 2 cover the C whole-tone scale (C,D,E,F#,Ab,Bb).
// Row 1 covers the C# whole-tone scale (C#,D#,F,G,A,B).
// Together all 12 semitones are reachable.
// B-system is the mirror image (row assignment swapped).

export type ButtonPosition = { row: number; col: number }

// C-system: starting MIDI note for each row (21 buttons per row, +2 semitones per button)
const C_SYSTEM_ROW_STARTS = [
  56, // Row 0 (far): Ab3, Bb3, C4, D4, E4, F#4, Ab4, Bb4, C5...
  57, // Row 1 (mid): A3, B3, C#4, D#4, F4, G4, A4, B4, C#5...
  58, // Row 2 (near): Bb3, C4, D4, E4, F#4, Ab4, Bb4, C5...
]

const BUTTONS_PER_ROW = 21
const STEP = 2 // whole tone step between buttons in same row

/** Builds a MIDI→ButtonPosition lookup table for a given row-starts configuration */
function buildLayout(rowStarts: number[]): Map<number, ButtonPosition> {
  const map = new Map<number, ButtonPosition>()
  rowStarts.forEach((start, row) => {
    for (let col = 0; col < BUTTONS_PER_ROW; col++) {
      const midi = start + col * STEP
      // Prefer row 0 for notes in the C whole-tone group, row 1 for C# group
      // Lower row index wins (first write wins) to establish primary position
      if (!map.has(midi)) {
        map.set(midi, { row, col })
      }
    }
  })
  return map
}

export const C_SYSTEM_LAYOUT = buildLayout(C_SYSTEM_ROW_STARTS)

// B-system: same notes but rows 0 and 2 are swapped (mirror of C-system)
const B_SYSTEM_ROW_STARTS = [
  58, // Row 0 (far): Bb3, C4, D4... (was C-system row 2)
  57, // Row 1 (mid): A3, B3, C#4... (same middle row)
  56, // Row 2 (near): Ab3, Bb3, C4... (was C-system row 0)
]
export const B_SYSTEM_LAYOUT = buildLayout(B_SYSTEM_ROW_STARTS)

export const ROW_COUNT = 3
export const COL_COUNT = BUTTONS_PER_ROW

export type AccordionSystem = 'C' | 'B'

export function getLayout(system: AccordionSystem): Map<number, ButtonPosition> {
  return system === 'C' ? C_SYSTEM_LAYOUT : B_SYSTEM_LAYOUT
}
