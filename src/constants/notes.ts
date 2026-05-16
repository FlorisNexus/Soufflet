/**
 * @file notes.ts
 * @description Central mapping between MIDI note numbers, French names, and Boomwhacker colors.
 * Single source of truth: every display component imports from here, never hardcodes names/colors.
 */

/**
 * French note names for all 12 semitones (index 0 = C).
 */
export const FRENCH_NOTE_NAMES: Record<number, string> = {
  0: 'Do', 1: 'Do#', 2: 'Ré', 3: 'Ré#', 4: 'Mi', 5: 'Fa',
  6: 'Fa#', 7: 'Sol', 8: 'Sol#', 9: 'La', 10: 'La#', 11: 'Si',
}

/**
 * Boomwhacker-inspired color palette (index = semitone 0–11).
 * Sharps use a slightly desaturated gradient color to visually distinguish them.
 */
export const NOTE_COLORS: Record<number, string> = {
  0: '#E53935',  // Do     — red
  1: '#D81B60',  // Do#    — rose-red
  2: '#F57C00',  // Ré     — orange
  3: '#F9A825',  // Ré#    — amber
  4: '#FDD835',  // Mi     — yellow
  5: '#7CB342',  // Fa     — light green
  6: '#00897B',  // Fa#    — teal
  7: '#43A047',  // Sol    — green
  8: '#1E88E5',  // Sol#   — light blue
  9: '#1565C0',  // La     — dark blue
  10: '#6D4C41', // La#    — brown
  11: '#8E24AA', // Si     — purple
}

/**
 * Returns the French name for a MIDI note.
 * @param midiNote - The MIDI note number (e.g. 60).
 * @returns The French name (e.g. "Do").
 */
export function midiToFrenchName(midiNote: number): string {
  return FRENCH_NOTE_NAMES[midiNote % 12]
}

/**
 * Returns the Boomwhacker color hex for a MIDI note.
 * @param midiNote - The MIDI note number.
 * @returns The hex color string.
 */
export function midiToColor(midiNote: number): string {
  return NOTE_COLORS[midiNote % 12]
}

/**
 * Returns the octave number for a MIDI note.
 * @param midiNote - The MIDI note number (60 = Do4 → octave 4).
 * @returns The octave number.
 */
export function midiToOctave(midiNote: number): number {
  return Math.floor(midiNote / 12) - 1
}

/**
 * Converts a frequency in Hz to the nearest MIDI note number.
 * @param frequency - The frequency in Hz.
 * @returns The nearest MIDI note number.
 */
export function frequencyToMidi(frequency: number): number {
  return Math.round(69 + 12 * Math.log2(frequency / 440))
}

/**
 * Equal-temperament frequency in Hz for a given MIDI note (A4 = 440 Hz reference).
 * Used by the audio reference player and the cents readout in Free Play mode.
 * @param midiNote - The MIDI note number.
 * @returns The theoretical frequency in Hz.
 */
export function equalTempHz(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12)
}

/**
 * Cents deviation between a detected frequency and its theoretical equal-temperament target.
 * Positive = sharp, negative = flat. Used to display "+5¢" in the Free Play readout
 * so the user can cross-check accuracy against any external tuner.
 * @param detectedHz - The frequency detected by pitchy.
 * @param midiNote - The MIDI note the detected frequency was rounded to.
 * @returns The deviation in cents (1/100 of a semitone).
 */
export function centsFromHz(detectedHz: number, midiNote: number): number {
  if (detectedHz <= 0) return 0
  const target = equalTempHz(midiNote)
  return 1200 * Math.log2(detectedHz / target)
}

/**
 * Human-readable French note name with octave (e.g. "Do 4", "Sol# 5").
 * The space between class and octave keeps it readable in tight UI labels.
 * @param midiNote - The MIDI note number.
 * @returns "Do 4" style label.
 */
export function midiToFrenchNameWithOctave(midiNote: number): string {
  return `${midiToFrenchName(midiNote)} ${midiToOctave(midiNote)}`
}
