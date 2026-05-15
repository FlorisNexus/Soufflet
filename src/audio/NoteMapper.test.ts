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
    // Let's test note 56 (La3).
    // C-system: row 0 (56+2*0) YES.
    // B-system: row 2 (56+2*0) YES.
    const c56 = mapperC.map(56)
    const b56 = mapperB.map(56)
    expect(c56!.row).toBe(0)
    expect(b56!.row).toBe(2)
  })
})
