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
