/**
 * @file layouts.ts
 * @description Physical button layout for chromatic accordion right hand.
 * Supports C-system and B-system.
 */

/**
 * Represents the position of a button on the accordion grid.
 */
export type ButtonPosition = { 
  /** Row index (0 = farthest from player, 2 = closest) */
  row: number; 
  /** Column index */
  col: number 
}

/** Starting MIDI note for each row in C-system (3 rows) */
const C_SYSTEM_ROW_STARTS = [
  56, // Row 0 (far): Ab3, Bb3, C4, D4, E4, F#4, Ab4, Bb4, C5...
  57, // Row 1 (mid): A3, B3, C#4, D#4, F4, G4, A4, B4, C#5...
  58, // Row 2 (near): Bb3, C4, D4, E4, F#4, Ab4, Bb4, C5...
]

/** Starting MIDI note for each row in B-system (rows 0 and 2 swapped compared to C-system) */
const B_SYSTEM_ROW_STARTS = [
  58, // Row 0 (far)
  57, // Row 1 (mid)
  56, // Row 2 (near)
]

const BUTTONS_PER_ROW = 21
const STEP = 2 // whole tone step between buttons in same row

/**
 * Builds a MIDI → ButtonPosition lookup table for a given row-starts configuration.
 * @param rowStarts - Array of starting MIDI notes for each row.
 * @returns A Map where key is MIDI note and value is ButtonPosition.
 */
function buildLayout(rowStarts: number[]): Map<number, ButtonPosition> {
  const map = new Map<number, ButtonPosition>()
  rowStarts.forEach((start, row) => {
    for (let col = 0; col < BUTTONS_PER_ROW; col++) {
      const midi = start + col * STEP
      // Lower row index wins to establish primary position
      if (!map.has(midi)) {
        map.set(midi, { row, col })
      }
    }
  })
  return map
}

/** Pre-built layout for C-system */
export const C_SYSTEM_LAYOUT = buildLayout(C_SYSTEM_ROW_STARTS)

/** Pre-built layout for B-system */
export const B_SYSTEM_LAYOUT = buildLayout(B_SYSTEM_ROW_STARTS)

/** Total number of rows on the accordion right hand */
export const ROW_COUNT = 3

/** Total number of buttons per row */
export const COL_COUNT = BUTTONS_PER_ROW

/** Supported accordion systems */
export type AccordionSystem = 'C' | 'B'

/**
 * Retrieves the layout Map for a specific accordion system.
 * @param system - The accordion system ('C' or 'B').
 * @returns The MIDI-to-position layout map.
 */
export function getLayout(system: AccordionSystem): Map<number, ButtonPosition> {
  return system === 'C' ? C_SYSTEM_LAYOUT : B_SYSTEM_LAYOUT
}
