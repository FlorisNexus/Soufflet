/**
 * @file layouts.test.ts
 * @description Tests for the 5-row Italian Continental layout (Sabatini-style).
 */

import { describe, it, expect } from 'vitest'
import {
  getLayout,
  getAllButtons,
  getButtonsForMidi,
  ROW_COUNT,
  COL_COUNT,
  MAX_BUTTONS_PER_ROW,
  BUTTONS_PER_ROW_LAYOUT,
  PRINCIPAL_ROW_COUNT,
} from './layouts'

describe('row constants', () => {
  it('5 rows total', () => expect(ROW_COUNT).toBe(5))
  it('3 principal rows', () => expect(PRINCIPAL_ROW_COUNT).toBe(3))
  it('alternating 17/18 buttons per row', () => {
    expect(BUTTONS_PER_ROW_LAYOUT).toEqual([17, 18, 17, 18, 17])
  })
  it('max buttons per row = 18', () => {
    expect(MAX_BUTTONS_PER_ROW).toBe(18)
    expect(COL_COUNT).toBe(18)
  })
})

describe('getAllButtons (5 rows, alternating counts)', () => {
  it('C-system returns 17+18+17+18+17 = 87 buttons', () => {
    expect(getAllButtons('C')).toHaveLength(87)
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

describe('Florian Sabatini calibration data (C-system)', () => {
  // All 8 measured data points from Florian's own accordion.
  // Convention: row index 0 = Florian's "rangée 1", col index 0 = position 1.
  const cases: { row: number; col: number; note: string; midi: number }[] = [
    { row: 1, col: 5, note: 'Do4',   midi: 60 }, // rangée 2 position 6
    { row: 1, col: 6, note: 'Ré#4',  midi: 63 }, // rangée 2 position 7
    { row: 1, col: 7, note: 'Fa#4',  midi: 66 }, // rangée 2 position 8
    { row: 1, col: 8, note: 'La4',   midi: 69 }, // rangée 2 position 9
    { row: 2, col: 5, note: 'Ré4',   midi: 62 }, // rangée 3 position 6
    { row: 0, col: 6, note: 'Mi4',   midi: 64 }, // rangée 1 position 7
    { row: 0, col: 7, note: 'Sol4',  midi: 67 }, // rangée 1 position 8
    { row: 2, col: 8, note: 'Si4',   midi: 71 }, // rangée 3 position 9
  ]

  cases.forEach(({ row, col, note, midi }) => {
    it(`row ${row} col ${col} = ${note} (MIDI ${midi})`, () => {
      const buttons = getAllButtons('C').filter(b => b.row === row && b.col === col)
      expect(buttons).toHaveLength(1)
      expect(buttons[0].midi).toBe(midi)
    })
  })
})

describe('chromatic coverage', () => {
  it('the 3 principal rows together cover all 12 pitch classes', () => {
    const principals = getAllButtons('C').filter(b => !b.isDuplicate)
    const pitchClasses = new Set(principals.map(b => ((b.midi % 12) + 12) % 12))
    expect(pitchClasses.size).toBe(12)
  })
})

describe('getButtonsForMidi', () => {
  it('Do4 (60) appears on rangée 2 + its mechanical duplicate rangée 5', () => {
    const buttons = getButtonsForMidi('C', 60)
    expect(buttons.length).toBeGreaterThanOrEqual(2)
    expect(buttons.some(b => b.row === 1 && b.col === 5 && !b.isDuplicate)).toBe(true) // rangée 2 pos 6
    expect(buttons.some(b => b.row === 4 && b.col === 4 && b.isDuplicate)).toBe(true)  // rangée 5 pos 5 (offset by +1)
  })

  it('Mi4 (64) appears on rangée 1 + its mechanical duplicate rangée 4', () => {
    const buttons = getButtonsForMidi('C', 64)
    expect(buttons.some(b => b.row === 0 && !b.isDuplicate)).toBe(true)
    expect(buttons.some(b => b.row === 3 && b.isDuplicate)).toBe(true)
  })

  it('Ré4 (62) appears only on rangée 3 (no duplicate row for it)', () => {
    const buttons = getButtonsForMidi('C', 62)
    expect(buttons.length).toBeGreaterThanOrEqual(1)
    expect(buttons.every(b => b.row === 2)).toBe(true)
  })

  it('returns empty array for an out-of-range MIDI', () => {
    expect(getButtonsForMidi('C', 12)).toEqual([])
  })
})

describe('getLayout backward-compat (principal only)', () => {
  it('contains exactly the principal positions for C', () => {
    const map = getLayout('C')
    map.forEach(pos => expect(pos.row).toBeLessThan(PRINCIPAL_ROW_COUNT))
  })
})
