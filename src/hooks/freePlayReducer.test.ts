/**
 * @file freePlayReducer.test.ts
 * @description Pure-function tests for the Free Play state machine.
 */

import { describe, it, expect } from 'vitest'
import {
  freePlayReducer,
  INITIAL_STATE,
  MIN_DURATION_MS,
  type FreePlayEvent,
  type FreePlayState,
} from './freePlayReducer'

let idCounter = 0
const newId = () => `id-${++idCounter}`

function detect(midiNote: number, frequency = 261.6): FreePlayEvent['detected'] {
  return { midiNote, frequency, clarity: 0.95 }
}

function event(detected: FreePlayEvent['detected'], now: number): FreePlayEvent {
  return { detected, now, newId }
}

describe('freePlayReducer — open / continue / close', () => {
  it('opens a new note on first detection', () => {
    const next = freePlayReducer(INITIAL_STATE, event(detect(60, 261.6), 0))
    expect(next.openNote).not.toBeNull()
    expect(next.openNote!.midi).toBe(60)
    expect(next.timeline).toHaveLength(0)
  })

  it('continues the note when the same MIDI is detected again', () => {
    const s1 = freePlayReducer(INITIAL_STATE, event(detect(60, 260), 0))
    const s2 = freePlayReducer(s1, event(detect(60, 262), 50))
    expect(s2.openNote!.midi).toBe(60)
    // Average freq across both detections.
    expect(s2.openNote!.frequencyHz).toBeCloseTo((260 + 262) / 2, 4)
    expect(s2.timeline).toHaveLength(0)
  })

  it('closes the note on silence and pushes to timeline once long enough', () => {
    const s1 = freePlayReducer(INITIAL_STATE, event(detect(60), 0))
    const s2 = freePlayReducer(s1, event(null, MIN_DURATION_MS + 10))
    expect(s2.openNote).toBeNull()
    expect(s2.timeline).toHaveLength(1)
    expect(s2.timeline[0].endTime).toBe(MIN_DURATION_MS + 10)
  })

  it('drops notes shorter than MIN_DURATION_MS', () => {
    const s1 = freePlayReducer(INITIAL_STATE, event(detect(60), 0))
    const s2 = freePlayReducer(s1, event(null, 30))
    expect(s2.openNote).toBeNull()
    expect(s2.timeline).toHaveLength(0)
  })

  it('closes old + opens new when MIDI changes', () => {
    const s1 = freePlayReducer(INITIAL_STATE, event(detect(60), 0))
    const s2 = freePlayReducer(s1, event(detect(62), 100))
    expect(s2.timeline).toHaveLength(1)
    expect(s2.timeline[0].midi).toBe(60)
    expect(s2.openNote!.midi).toBe(62)
  })

  it('rejects MIDI values outside accordion range', () => {
    const next = freePlayReducer(INITIAL_STATE, event(detect(20), 0))
    expect(next.openNote).toBeNull()
    expect(next.timeline).toHaveLength(0)
  })

  it('caps the timeline at MAX_TIMELINE_LENGTH', () => {
    // Build a state with 1000 finalised notes.
    const fakeNote = (i: number) => ({
      id: `n-${i}`,
      midi: 60,
      frequencyHz: 261,
      startTime: i * 100,
      endTime: i * 100 + 80,
      _frequencySum: 261,
      _frequencyCount: 1,
    })
    const long: FreePlayState = {
      openNote: null,
      timeline: Array.from({ length: 1000 }, (_, i) => fakeNote(i)),
    }
    const opened = freePlayReducer(long, event(detect(60), 100_000))
    const closed = freePlayReducer(opened, event(null, 100_000 + MIN_DURATION_MS + 5))
    expect(closed.timeline).toHaveLength(1000)
    // Oldest evicted.
    expect(closed.timeline[0].id).toBe('n-1')
  })
})
