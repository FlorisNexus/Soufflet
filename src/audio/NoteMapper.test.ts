import { describe, it, expect } from 'vitest'
import { NoteMapper } from './NoteMapper'

describe('NoteMapper (C-system)', () => {
  const mapper = new NoteMapper('C')

  it('maps Do4 (60) to a valid button position', () => {
    const result = mapper.map(60)
    expect(result).not.toBeNull()
    expect(result!.row).toBeGreaterThanOrEqual(0)
    expect(result!.row).toBeLessThanOrEqual(2)
    expect(result!.col).toBeGreaterThanOrEqual(0)
  })

  it('maps a note to its French name and color', () => {
    const result = mapper.map(60)
    expect(result!.frenchName).toBe('Do')
    expect(result!.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })

  it('returns null for a MIDI note outside the layout range', () => {
    expect(mapper.map(20)).toBeNull() // below accordion range
  })
})

describe('NoteMapper (B-system)', () => {
  const mapperC = new NoteMapper('C')
  const mapperB = new NoteMapper('B')

  it('gives different row for same note in C vs B system', () => {
    // C-system row starts: [46, 45, 47, ...] with +3 semis per position.
    // B-system row starts: [45, 44, 46, ...] (shifted -1 semitone).
    // Mi4 (64): C-system → row 0 col 6 (46+18=64). B-system → row 2 col 6 (46+18=64).
    const c64 = mapperC.map(64)
    const b64 = mapperB.map(64)
    expect(c64!.row).toBe(0)
    expect(b64!.row).toBe(2)
  })
})
