import { describe, it, expect } from 'vitest'
import { SONGS, getSongById } from './songLoader'

describe('songLoader', () => {
  it('loads at least 2 songs', () => {
    expect(SONGS.length).toBeGreaterThanOrEqual(2)
  })

  it('each song has required fields', () => {
    for (const song of SONGS) {
      expect(song.id).toBeTruthy()
      expect(song.title).toBeTruthy()
      expect(song.bpm).toBeGreaterThan(0)
      expect(song.notes.length).toBeGreaterThan(0)
    }
  })

  it('each note has valid midiNote (21–108)', () => {
    for (const song of SONGS) {
      for (const note of song.notes) {
        expect(note.midiNote).toBeGreaterThanOrEqual(21)
        expect(note.midiNote).toBeLessThanOrEqual(108)
        expect(note.startBeat).toBeGreaterThanOrEqual(0)
        expect(note.durationBeats).toBeGreaterThan(0)
      }
    }
  })

  it('getSongById returns correct song', () => {
    const song = getSongById('au-clair-de-la-lune')
    expect(song?.title).toBe('Au Clair de la Lune')
  })

  it('getSongById returns undefined for unknown id', () => {
    expect(getSongById('does-not-exist')).toBeUndefined()
  })
})
