/**
 * @file schema.ts
 * @description TypeScript types for song data.
 * Intentionally avoids music-theory terminology (solfège) to keep it simple.
 */

/**
 * Represents a single note within a song.
 */
export type SongNote = {
  /** MIDI standard note number: 60 = Do4 (middle C), 69 = La4 (440 Hz) */
  midiNote: number
  /** Position in the song, measured in beats from the start (0-based) */
  startBeat: number
  /** How long the note lasts, measured in beats (e.g., 0.5 = half beat, 1.0 = one beat) */
  durationBeats: number
}

/**
 * Represents a full song definition.
 */
export type Song = {
  /** Unique identifier for the song */
  id: string
  /** Human-readable title */
  title: string
  /** Beats per minute — controls the scroll speed of falling notes */
  bpm: number
  /** Array of notes that make up the song */
  notes: SongNote[]
}
