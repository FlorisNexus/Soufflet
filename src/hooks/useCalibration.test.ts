/**
 * @file useCalibration.test.ts
 * @description Tests for the calibration hook and its inference helper.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCalibration, inferSystemFromMidi, type Calibration } from './useCalibration'

const STORAGE_KEY = 'soufflet.calibration'

describe('inferSystemFromMidi', () => {
  it('Do4 (60, pitch class 0) → C-system', () => {
    expect(inferSystemFromMidi(60)).toBe('C')
  })
  it('Do5 (72, pitch class 0) → C-system', () => {
    expect(inferSystemFromMidi(72)).toBe('C')
  })
  it('Si3 (59, pitch class 11) → B-system', () => {
    expect(inferSystemFromMidi(59)).toBe('B')
  })
  it('Si4 (71, pitch class 11) → B-system', () => {
    expect(inferSystemFromMidi(71)).toBe('B')
  })
  it('Mi4 (64) → null (neither C nor B)', () => {
    expect(inferSystemFromMidi(64)).toBeNull()
  })
})

describe('useCalibration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with status "unset" when nothing is stored', async () => {
    const { result } = renderHook(() => useCalibration())
    // Wait for the initial-load effect.
    await act(async () => {})
    expect(result.current.status).toBe('unset')
    expect(result.current.calibration).toBeNull()
  })

  it('loads existing calibration from localStorage', async () => {
    const existing: Calibration = {
      system: 'C',
      referenceMidi: 60,
      calibratedAt: '2026-05-16T12:00:00.000Z',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))

    const { result } = renderHook(() => useCalibration())
    await act(async () => {})

    expect(result.current.status).toBe('set')
    expect(result.current.calibration).toEqual(existing)
  })

  it('treats malformed localStorage data as unset', async () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    const { result } = renderHook(() => useCalibration())
    await act(async () => {})
    expect(result.current.status).toBe('unset')
  })

  it('saveCalibration writes to localStorage and updates state', async () => {
    const { result } = renderHook(() => useCalibration())
    await act(async () => {})

    const cal: Calibration = {
      system: 'B',
      referenceMidi: 59,
      calibratedAt: '2026-05-16T13:00:00.000Z',
    }
    act(() => result.current.saveCalibration(cal))

    expect(result.current.status).toBe('set')
    expect(result.current.calibration).toEqual(cal)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toEqual(cal)
  })

  it('clearCalibration removes localStorage entry and resets state', async () => {
    const cal: Calibration = {
      system: 'C',
      referenceMidi: 60,
      calibratedAt: '2026-05-16T13:00:00.000Z',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cal))

    const { result } = renderHook(() => useCalibration())
    await act(async () => {})
    expect(result.current.status).toBe('set')

    act(() => result.current.clearCalibration())
    expect(result.current.status).toBe('unset')
    expect(result.current.calibration).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
