/**
 * @file stradella.ts
 * @description Layout constants for the standard 120-button Stradella bass system.
 *
 * The Stradella system has 6 rows (types) and 20 physical columns (note positions).
 * For display purposes we collapse to 12 unique pitch classes ordered by the circle
 * of 5ths — the natural ordering of the physical accordion columns.
 *
 * Rows (0–5):
 *   0  Basse-contre  (counter-bass): note 7 semitones above the fundamental
 *   1  Basse         (fundamental bass): the root note
 *   2  Accord Majeur
 *   3  Accord Mineur
 *   4  Accord Dominante 7ème
 *   5  Accord Diminué
 */

export const ROW_COUNT = 6

// Row short labels shown in the column headers.
export const ROW_LABELS = ['BC', 'B', 'Maj', 'min', '7', '°'] as const
export const ROW_FULL_LABELS = [
  'Basse-contre',
  'Basse',
  'Accord Majeur',
  'Accord Mineur',
  'Dom. 7ème',
  'Diminué',
] as const

// 12 columns ordered by circle of 5ths (C → G → D → … → F).
// Index into this array gives the display row position (0 = top = C).
export const COL_PITCH_CLASSES = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5] as const
// [C, G, D, A, E, B, F#/Gb, Db/C#, Ab/G#, Eb/Bb-enharmonic, Bb, F]

// French solfège note names (sharp preferred, except Bb and Eb).
export const NOTE_NAMES_FR = [
  'Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'Sib', 'Si',
] as const
// Enharmonic display overrides for readability on the accordion (flat preferred):
const ENHARMONIC: Partial<Record<number, string>> = {
  1:  'Réb',
  3:  'Mib',
  6:  'Solb',
  8:  'Lab',
  10: 'Sib',
}
export function pcToName(pc: number): string {
  return ENHARMONIC[pc] ?? NOTE_NAMES_FR[pc]
}

// Counter-bass is the note 7 semitones (a perfect 5th) above the fundamental.
export function counterBassPc(fundamentalPc: number): number {
  return (fundamentalPc + 7) % 12
}

/**
 * Returns the display label for a given row type and pitch class.
 */
export function getButtonLabel(rowIndex: number, pitchClass: number): string {
  const pc = rowIndex === 0 ? counterBassPc(pitchClass) : pitchClass
  const name = pcToName(pc)
  switch (rowIndex) {
    case 0: return name          // counter-bass — just the note name
    case 1: return name          // fundamental bass
    case 2: return name          // major (no suffix — column header says "Maj")
    case 3: return `${name}m`    // minor
    case 4: return `${name}7`    // dominant 7th
    case 5: return `${name}°`    // diminished
    default: return name
  }
}

/**
 * Returns the column index (0–11) for a detected pitch class.
 * Returns -1 if the pitch class has no column (shouldn't happen with 12-note coverage).
 */
export function colForPitchClass(pc: number): number {
  return COL_PITCH_CLASSES.indexOf(pc as typeof COL_PITCH_CLASSES[number])
}
