/**
 * @file layouts.test.ts
 * @description Tests for the 5-row chromatic-accordion layout helpers.
 */

import { describe, it, expect } from 'vitest'
import {
  getLayout,
  getAllButtons,
  getButtonsForMidi,
  ROW_COUNT,
  COL_COUNT,
  PRINCIPAL_ROW_COUNT,
} from './layouts'

describe('row constants', () => {
  it('5 rows total', () => expect(ROW_COUNT).toBe(5))
  it('3 principal rows', () => expect(PRINCIPAL_ROW_COUNT).toBe(3))
  it('21 buttons per row', () => expect(COL_COUNT).toBe(21))
})

describe('getAllButtons (5 rows)', () => {
  it('C-system returns 5 × 21 = 105 buttons', () => {
    expect(getAllButtons('C')).toHaveLength(5 * 21)
  })
  it('B-system returns 5 × 21 = 105 buttons', () => {
    expect(getAllButtons('B')).toHaveLength(5 * 21)
  })
  it('rows 0–2 are principals', () => {
    const buttons = getAllButtons('C').filter(b => b.row <= 2)
    expect(buttons.every(b => !b.isDuplicate)).toBe(true)
  })
  it('rows 3–4 are duplicates', () => {
    const buttons = getAllButtons('C').filter(b => b.row >= 3)
    expect(buttons.every(b => b.isDuplicate)).toBe(true)
  })
})

describe('getButtonsForMidi', () => {
  it('returns the principal Do4 (60) on the C-system', () => {
    const buttons = getButtonsForMidi('C', 60)
    expect(buttons.length).toBeGreaterThanOrEqual(1)
    expect(buttons.some(b => !b.isDuplicate)).toBe(true)
  })

  it('row 3 of C-system contains the duplicate of row 0 (minor-third shift)', () => {
    // Row 0 starts at MIDI 56, row 3 starts at 56 + 3 = 59. So buttons at midi=59
    // should include a duplicate from row 3 and a principal from somewhere
    // (row 1 starts at 57 → 57+2=59 at col 1).
    const buttons59 = getButtonsForMidi('C', 59)
    expect(buttons59.some(b => b.row === 3 && b.col === 0)).toBe(true)
    expect(buttons59.some(b => !b.isDuplicate)).toBe(true)
  })

  it('returns an empty array for an out-of-range MIDI', () => {
    expect(getButtonsForMidi('C', 12)).toEqual([])
  })
})

describe('getLayout backward-compat (principal only)', () => {
  it('contains exactly the principal positions for C', () => {
    const map = getLayout('C')
    map.forEach(pos => expect(pos.row).toBeLessThan(PRINCIPAL_ROW_COUNT))
  })
})
