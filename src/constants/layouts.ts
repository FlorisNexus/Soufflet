/**
 * @file layouts.ts
 * @description Physical button layout for chromatic accordion right hand.
 * Supports C-system and B-system in their 5-row variant.
 *
 * WHY 5 rows: a chromatic button accordion physically exposes 5 rows on the
 * right hand. Rows 1–3 are the "principal" rows (each note appears at most
 * once). Rows 4 and 5 are *duplicates* of rows 1 and 2 transposed by a minor
 * third — they exist so the player can choose alternative fingerings. Visually
 * we render all 5 rows and tag rows 4–5 as duplicates, so the user can learn
 * the geography of their instrument including these alternative positions.
 *
 * The previous 3-row default is preserved as the *principal* layout (returned
 * by `getLayout`) for backward compatibility with the Player flow.
 */

/**
 * Position of a button on the accordion grid.
 */
export type ButtonPosition = {
  /** Row index (0 = farthest from player, 4 = closest) */
  row: number
  /** Column index */
  col: number
}

/** A button on the 5-row layout, including whether it duplicates a principal row. */
export type KeyboardButton = ButtonPosition & {
  midi: number
  /** True for rows 3 and 4 (the duplicates of rows 0 and 1). */
  isDuplicate: boolean
}

/** Starting MIDI note per row for C-system. Rows 0–2 are principal, 3–4 are duplicates. */
const C_SYSTEM_ROW_STARTS = [
  56, // Row 0 (principal)
  57, // Row 1 (principal)
  58, // Row 2 (principal)
  56 + 3, // Row 3 = duplicate of row 0, shifted by a minor third
  57 + 3, // Row 4 = duplicate of row 1, shifted by a minor third
]

/** Starting MIDI note per row for B-system (rows 0/2 swapped vs C). */
const B_SYSTEM_ROW_STARTS = [
  58,
  57,
  56,
  58 + 3,
  57 + 3,
]

const BUTTONS_PER_ROW = 21
const STEP = 2 // whole-tone step within a row
const PRINCIPAL_ROW_COUNT = 3

/**
 * Builds the principal MIDI → ButtonPosition map (rows 0–2 only).
 * Used by NoteMapper and any legacy consumer that wants a single position per note.
 */
function buildPrincipalLayout(rowStarts: number[]): Map<number, ButtonPosition> {
  const map = new Map<number, ButtonPosition>()
  for (let row = 0; row < PRINCIPAL_ROW_COUNT; row++) {
    const start = rowStarts[row]
    for (let col = 0; col < BUTTONS_PER_ROW; col++) {
      const midi = start + col * STEP
      if (!map.has(midi)) map.set(midi, { row, col })
    }
  }
  return map
}

/**
 * Builds the full 5-row layout. Each MIDI value can appear multiple times,
 * once per row that produces it. `isDuplicate` is true for rows 3 and 4.
 */
function buildFullLayout(rowStarts: number[]): KeyboardButton[] {
  const buttons: KeyboardButton[] = []
  rowStarts.forEach((start, row) => {
    for (let col = 0; col < BUTTONS_PER_ROW; col++) {
      buttons.push({
        row,
        col,
        midi: start + col * STEP,
        isDuplicate: row >= PRINCIPAL_ROW_COUNT,
      })
    }
  })
  return buttons
}

export const C_SYSTEM_LAYOUT = buildPrincipalLayout(C_SYSTEM_ROW_STARTS)
export const B_SYSTEM_LAYOUT = buildPrincipalLayout(B_SYSTEM_ROW_STARTS)

const C_SYSTEM_FULL = buildFullLayout(C_SYSTEM_ROW_STARTS)
const B_SYSTEM_FULL = buildFullLayout(B_SYSTEM_ROW_STARTS)

/** Total number of rows rendered on the accordion right hand. */
export const ROW_COUNT = 5
/** Number of principal rows (1–3, where each note appears exactly once). */
export { PRINCIPAL_ROW_COUNT }
/** Total number of buttons per row. */
export const COL_COUNT = BUTTONS_PER_ROW

/** Supported accordion systems. */
export type AccordionSystem = 'C' | 'B'

/**
 * Returns the principal-row layout (rows 0–2) for a system. Used by the
 * existing Player flow and tests that assume a single position per note.
 */
export function getLayout(system: AccordionSystem): Map<number, ButtonPosition> {
  return system === 'C' ? C_SYSTEM_LAYOUT : B_SYSTEM_LAYOUT
}

/**
 * Returns the full list of 5-row buttons for a system. Stable order:
 * row 0..4 then col 0..N. Consumed by ButtonLayout to render the grid.
 */
export function getAllButtons(system: AccordionSystem): KeyboardButton[] {
  return system === 'C' ? C_SYSTEM_FULL : B_SYSTEM_FULL
}

/**
 * Returns every physical button that produces a given MIDI value.
 * Order: principal positions first (rows 0–2), duplicates last (rows 3–4).
 * Used by ButtonLayout to highlight a played note across all its candidate
 * positions.
 */
export function getButtonsForMidi(
  system: AccordionSystem,
  midi: number,
): KeyboardButton[] {
  return getAllButtons(system).filter(b => b.midi === midi)
}
