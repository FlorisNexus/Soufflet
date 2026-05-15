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
    const c = mapperC.map(60)
    const b = mapperB.map(60)
    // C-system: row 0 start=56, row 1 start=57, row 2 start=58. 60 = 56 + 2*2 (row 0, col 2)
    // B-system: row 0 start=58, row 1 start=57, row 2 start=56. 60 = 58 + 2*1 (row 0, col 1)
    // Wait, 60 is reachable from multiple rows. Prefer lower row index.
    // C-system: 60 is row 0 (start 56 + 2*2) and row 2 (start 58 + 2*1). Mapper prefers row 0.
    // B-system: 60 is row 0 (start 58 + 2*1) and row 2 (start 56 + 2*2). Mapper prefers row 0.
    // So both return row 0! 
    // Let's test note 57 (La3#).
    // C-system: row 0 (56+2n) NO, row 1 (57+2*0) YES (row 1, col 0), row 2 (58+2n) NO.
    // B-system: row 0 (58+2n) NO, row 1 (57+2*0) YES (row 1, col 0), row 2 (56+2n) NO.
    // Still same. 
    // Let's test note 56 (La3).
    // C-system: row 0 (56+2*0) YES.
    // B-system: row 2 (56+2*0) YES.
    const c56 = mapperC.map(56)
    const b56 = mapperB.map(56)
    expect(c56!.row).toBe(0)
    expect(b56!.row).toBe(2)
  })
})
