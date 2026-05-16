/**
 * @file useCalibration.ts
 * @description Persists the user's chromatic-system choice (C vs B) in localStorage.
 *
 * WHY: pitchy detects pitch but never knows which physical button produced it.
 * To map a MIDI value back to a button, the app must know whether the instrument
 * is a C-system or a B-system accordion. Florian's Sabatini is probably C but
 * not certain — we ask the user once (or auto-detect from a known reference button)
 * and remember forever via localStorage.
 *
 * Detection logic: the calibration screen asks the user to play their reference
 * button ("2nd row, 6th from the top"). On a C-system that button = Do (pitch
 * class 0). On a B-system it = Si (pitch class 11). Anything else → retry.
 */

import { useCallback, useState } from 'react'
import type { AccordionSystem } from '../constants/layouts'

const STORAGE_KEY = 'soufflet.calibration'

/** Shape persisted in localStorage. */
export type Calibration = {
  system: AccordionSystem
  /** The MIDI note detected when the user played the reference button (anchors the grid). */
  referenceMidi: number
  /** ISO 8601 date of calibration. */
  calibratedAt: string
}

/** Status of the calibration on app boot. */
export type CalibrationStatus = 'loading' | 'unset' | 'set'

/**
 * Infers the accordion system from a MIDI value played on the reference button.
 * Pure function — kept exported for unit-testability.
 */
export function inferSystemFromMidi(midi: number): AccordionSystem | null {
  const pitchClass = ((midi % 12) + 12) % 12
  if (pitchClass === 0) return 'C'
  if (pitchClass === 11) return 'B'
  return null
}

/** Reads localStorage once; pure (called by the lazy useState initializer). */
function readInitial(): { status: CalibrationStatus; calibration: Calibration | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { status: 'unset', calibration: null }
    const parsed = JSON.parse(raw) as Calibration
    if (parsed && (parsed.system === 'C' || parsed.system === 'B') && typeof parsed.referenceMidi === 'number') {
      return { status: 'set', calibration: parsed }
    }
    return { status: 'unset', calibration: null }
  } catch {
    return { status: 'unset', calibration: null }
  }
}

/**
 * Reads/writes the calibration in localStorage and exposes it reactively.
 * The initial read happens synchronously in the lazy useState initializer,
 * so there is no "loading" flicker — the caller can rely on the first render
 * having the final status.
 */
export function useCalibration() {
  const [initial] = useState(readInitial)
  const [status, setStatus] = useState<CalibrationStatus>(initial.status)
  const [calibration, setCalibration] = useState<Calibration | null>(initial.calibration)

  /** Persists a new calibration and updates state synchronously. */
  const saveCalibration = useCallback((cal: Calibration) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cal))
    setCalibration(cal)
    setStatus('set')
  }, [])

  /** Clears the calibration (used by the "Recalibrer" entry). */
  const clearCalibration = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setCalibration(null)
    setStatus('unset')
  }, [])

  return { status, calibration, saveCalibration, clearCalibration }
}
