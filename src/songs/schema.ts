// schema.ts — TypeScript types for song data; intentionally avoids music-theory terminology
// midiNote is the universal currency: no key signatures, no time signatures, no clefs
export type SongNote = {
  midiNote: number       // MIDI standard: 60 = Do4 (middle C), 69 = La4 (440 Hz)
  startBeat: number      // position in song as beat count from 0 (e.g. 0, 0.5, 1, 1.5...)
  durationBeats: number  // how long the note lasts in beats (0.5 = half beat, 1 = one beat)
}

export type Song = {
  id: string
  title: string
  bpm: number            // beats per minute — controls scroll speed of falling notes
  notes: SongNote[]
}
