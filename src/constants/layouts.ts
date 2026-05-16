/**
 * @file layouts.ts
 * @description Physical button layout for chromatic accordion right hand
 * (Italian "Continental" 5-row C/B-system, as found on Sabatini and similar
 * French/Belgian musette accordions).
 *
 * WHY this layout: each row plays a *diminished-seventh arpeggio* (every
 * position step = a minor third = +3 semitones), not a whole-tone scale
 * like the German Bayan / Hohner C-griff convention. The 3 principal rows
 * are pitched a semitone apart from each other, and together they cover all
 * 12 chromatic notes. Rows 4 and 5 are *mechanical duplicates* of rows 1
 * and 2 (pressing one physically depresses the other), so they share the
 * pitches of their pair — they exist purely to offer alternative fingerings.
 *
 * Florian's calibration (Sabatini Musette Doré, Belgian-French):
 *   Rangée 2, position 6 = Do (60).  Rangée 2, position 7 = Ré# (63).
 *   Rangée 2, position 8 = Fa# (66). Rangée 2, position 9 = La (69).
 *   Rangée 3, position 6 = Ré (62).  Rangée 1, position 7 = Mi (64).
 *   Rangée 4 position N is mechanically linked to rangée 1 position N
 *     (1:1, with rangée 4 position 18 being an orphan beyond rangée 1's 17 buttons).
 *   Rangée 5 position N is mechanically linked to rangée 2 position N+1
 *     (offset by +1 position; rangée 5 has 17 buttons covering rangée 2's positions 2–18).
 *
 * Conventions used here:
 *   - Row index `row` 0..4 maps to Florian's "rangée 1..5" (row 0 = rangée 1).
 *   - "Rangée 1 = la plus à droite" in his frame = outer side (chin-side, far
 *     from bellows). Mapped to `row 0` in code.
 *   - Position index `col` 0..N-1 is 0-based; Florian's "position 1" = col 0.
 *   - Position 1 / col 0 sits at the top of the keyboard (lowest pitch).
 */

/** Position of a button on the accordion grid. */
export type ButtonPosition = {
  /** Row index 0..4. 0 = outer (Florian's "rangée 1"). */
  row: number
  /** Column index 0..16 or 0..17 depending on the row's button count. */
  col: number
}

/** A button on the 5-row layout including duplicate-row tagging. */
export type KeyboardButton = ButtonPosition & {
  midi: number
  /** True for rows 3 and 4 (mechanical duplicates of rows 0 and 1). */
  isDuplicate: boolean
}

/** Semitones between two adjacent positions in the same row. */
const SEMITONES_PER_POSITION = 3

/** Buttons per row, alternating 17/18/17/18/17 due to staggering. */
const BUTTONS_PER_ROW = [17, 18, 17, 18, 17] as const

/** Number of principal rows (the rest are mechanical duplicates). */
export const PRINCIPAL_ROW_COUNT = 3

/**
 * MIDI starting note (position 1 / col 0) per row, C-system Sabatini layout.
 * Derived empirically from Florian's calibration (see the file header).
 */
const C_SYSTEM_ROW_STARTS = [
  46, // Row 0 = Florian's rangée 1 → Bb2 arpeggio (Bb, C#, E, G) — 17 buttons
  45, // Row 1 = rangée 2 → A2 arpeggio  (A, C, D#, F#) — 18 buttons
  47, // Row 2 = rangée 3 → B2 arpeggio  (B, D, F, G#)  — 17 buttons
  46, // Row 3 = rangée 4 = mechanical duplicate of row 0 (same start, 18 buttons; pos 18 is an orphan extrapolation)
  48, // Row 4 = rangée 5 = mechanical duplicate of row 1 OFFSET BY +1 POSITION (rangée 5 pos 1 = rangée 2 pos 2 = C3)
]

/**
 * MIDI starting notes for the B-system variant. The reference button (rangée
 * 2 position 6) plays Si (B) instead of Do (C), so the entire grid shifts
 * down by one semitone. Not validated on a real B-system instrument; treat
 * as a best guess that the calibration will correct if needed.
 */
const B_SYSTEM_ROW_STARTS = C_SYSTEM_ROW_STARTS.map(start => start - 1)

const ROW_COUNT_VALUE = BUTTONS_PER_ROW.length

/**
 * Builds the principal MIDI → ButtonPosition map (rows 0..PRINCIPAL_ROW_COUNT-1).
 * Used by the legacy `NoteMapper` consumer that wants one position per note.
 */
function buildPrincipalLayout(rowStarts: number[]): Map<number, ButtonPosition> {
  const map = new Map<number, ButtonPosition>()
  for (let row = 0; row < PRINCIPAL_ROW_COUNT; row++) {
    const start = rowStarts[row]
    const buttonCount = BUTTONS_PER_ROW[row]
    for (let col = 0; col < buttonCount; col++) {
      const midi = start + col * SEMITONES_PER_POSITION
      if (!map.has(midi)) map.set(midi, { row, col })
    }
  }
  return map
}

/**
 * Builds the full 5-row layout. Each MIDI value can appear on multiple buttons.
 * `isDuplicate` flags rows that are mechanical duplicates (rows 3 and 4).
 */
function buildFullLayout(rowStarts: number[]): KeyboardButton[] {
  const buttons: KeyboardButton[] = []
  rowStarts.forEach((start, row) => {
    const buttonCount = BUTTONS_PER_ROW[row]
    for (let col = 0; col < buttonCount; col++) {
      buttons.push({
        row,
        col,
        midi: start + col * SEMITONES_PER_POSITION,
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

/** Total number of rows on the right hand. */
export const ROW_COUNT = ROW_COUNT_VALUE

/** Maximum number of buttons in any row (used for rendering bounds). */
export const MAX_BUTTONS_PER_ROW = Math.max(...BUTTONS_PER_ROW)

/** Buttons-per-row array, exposed for rendering. */
export const BUTTONS_PER_ROW_LAYOUT: readonly number[] = BUTTONS_PER_ROW

/** Backwards-compatible alias — equal to MAX_BUTTONS_PER_ROW. */
export const COL_COUNT = MAX_BUTTONS_PER_ROW

/** Supported accordion systems. */
export type AccordionSystem = 'C' | 'B'

/** Returns the principal-only layout (rows 0..2). */
export function getLayout(system: AccordionSystem): Map<number, ButtonPosition> {
  return system === 'C' ? C_SYSTEM_LAYOUT : B_SYSTEM_LAYOUT
}

/** Returns the full 5-row layout. */
export function getAllButtons(system: AccordionSystem): KeyboardButton[] {
  return system === 'C' ? C_SYSTEM_FULL : B_SYSTEM_FULL
}

/** Returns every physical button that produces a given MIDI value. */
export function getButtonsForMidi(
  system: AccordionSystem,
  midi: number,
): KeyboardButton[] {
  return getAllButtons(system).filter(b => b.midi === midi)
}
