/**
 * @file freePlayReducer.ts
 * @description Pure state-machine for the Free Play timeline. Extracted out of
 * `useFreePlaySession` so the lifecycle rules can be unit-tested without
 * mocking WebAudio.
 *
 * WHY pure: the hook deals with refs, AudioContext, performance.now() — all
 * stateful side-effects. Testing the open/close/continue/reject rules through
 * the hook means mocking a whole pipeline. Instead, the hot-path logic lives
 * here as a (state, event) → state function.
 */

import type { DetectedNote } from '../audio/PitchDetector'

/** A note that has been (or is being) played. */
export type PlayedNote = {
  id: string
  midi: number
  frequencyHz: number
  startTime: number
  endTime: number | null
  _frequencySum: number
  _frequencyCount: number
}

export type FreePlayState = {
  timeline: PlayedNote[]
  openNote: PlayedNote | null
}

export const INITIAL_STATE: FreePlayState = { timeline: [], openNote: null }

export const MAX_TIMELINE_LENGTH = 1000
export const MIN_DURATION_MS = 60
export const MIDI_MIN = 36
export const MIDI_MAX = 96

/** Inputs accepted by the reducer. `detected` is the pitchy output or null for silence. */
export type FreePlayEvent = {
  detected: DetectedNote | null
  /** Time since session start, in ms. */
  now: number
  /** Stable id generator (injected for testability). */
  newId: () => string
}

function closeIfLongEnough(state: FreePlayState, endTime: number): FreePlayState {
  const open = state.openNote
  if (!open) return state
  const duration = endTime - open.startTime
  if (duration < MIN_DURATION_MS) {
    return { ...state, openNote: null }
  }
  const finalised: PlayedNote = {
    ...open,
    endTime,
    frequencyHz: open._frequencyCount > 0 ? open._frequencySum / open._frequencyCount : open.frequencyHz,
  }
  const nextTimeline = [...state.timeline, finalised]
  const trimmed = nextTimeline.length > MAX_TIMELINE_LENGTH
    ? nextTimeline.slice(nextTimeline.length - MAX_TIMELINE_LENGTH)
    : nextTimeline
  return { timeline: trimmed, openNote: null }
}

/**
 * Advances the state machine by one detection event.
 *
 * Rules:
 *   - `detected === null` or out-of-range MIDI → close the open note (if any).
 *   - Same MIDI as the open note → accumulate frequency and keep it open.
 *   - Different MIDI → close the previous one and open a new one.
 *   - Notes shorter than `MIN_DURATION_MS` are dropped on close.
 *   - Timeline capped at `MAX_TIMELINE_LENGTH`.
 */
export function freePlayReducer(state: FreePlayState, event: FreePlayEvent): FreePlayState {
  const { detected, now, newId } = event

  if (!detected || detected.midiNote < MIDI_MIN || detected.midiNote > MIDI_MAX) {
    return closeIfLongEnough(state, now)
  }

  const open = state.openNote
  if (open && open.midi === detected.midiNote) {
    const sum = open._frequencySum + detected.frequency
    const count = open._frequencyCount + 1
    const merged: PlayedNote = {
      ...open,
      _frequencySum: sum,
      _frequencyCount: count,
      frequencyHz: sum / count,
    }
    return { ...state, openNote: merged }
  }

  const closed = closeIfLongEnough(state, now)
  const fresh: PlayedNote = {
    id: newId(),
    midi: detected.midiNote,
    frequencyHz: detected.frequency,
    startTime: now,
    endTime: null,
    _frequencySum: detected.frequency,
    _frequencyCount: 1,
  }
  return { ...closed, openNote: fresh }
}
