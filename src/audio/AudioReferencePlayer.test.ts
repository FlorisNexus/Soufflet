/**
 * @file AudioReferencePlayer.test.ts
 * @description Tests for the WebAudio reference-tone player. The WebAudio
 * APIs are stubbed with minimal fakes — we only assert the wiring (create
 * oscillator, set frequency, schedule envelope, stop) so the test is
 * deterministic in jsdom.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AudioReferencePlayer } from './AudioReferencePlayer'
import { equalTempHz } from '../constants/notes'

type FakeOsc = {
  type: string
  frequency: { setValueAtTime: ReturnType<typeof vi.fn> }
  connect: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
  onended: (() => void) | null
}

type FakeGain = {
  gain: {
    setValueAtTime: ReturnType<typeof vi.fn>
    linearRampToValueAtTime: ReturnType<typeof vi.fn>
  }
  connect: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
}

let lastOsc: FakeOsc | null = null

beforeEach(() => {
  lastOsc = null
  ;(globalThis as unknown as { AudioContext: unknown }).AudioContext = class {
    currentTime = 0
    state = 'running'
    destination = {}
    createOscillator(): FakeOsc {
      const osc: FakeOsc = {
        type: 'sine',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn().mockReturnThis(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null,
      }
      lastOsc = osc
      return osc
    }
    createGain(): FakeGain {
      return {
        gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
        connect: vi.fn().mockReturnThis(),
        disconnect: vi.fn(),
      }
    }
    close() { return Promise.resolve() }
    resume() { return Promise.resolve() }
  }
})

describe('AudioReferencePlayer', () => {
  it('plays the correct frequency for a MIDI note', () => {
    const p = new AudioReferencePlayer()
    p.play(69) // A4
    expect(lastOsc).not.toBeNull()
    expect(lastOsc!.frequency.setValueAtTime).toHaveBeenCalledWith(equalTempHz(69), 0)
    expect(lastOsc!.start).toHaveBeenCalled()
    expect(lastOsc!.stop).toHaveBeenCalled()
  })

  it('replaces an in-flight tone with a new one', () => {
    const p = new AudioReferencePlayer()
    p.play(60)
    const first = lastOsc!
    p.play(62)
    // First osc was stopped + disconnected when the second one started.
    expect(first.stop).toHaveBeenCalled()
    expect(first.disconnect).toHaveBeenCalled()
  })

  it('does nothing when muted', () => {
    const p = new AudioReferencePlayer()
    p.setMuted(true)
    p.play(60)
    expect(lastOsc).toBeNull()
  })

  it('stopAll silences the active tone', () => {
    const p = new AudioReferencePlayer()
    p.play(60)
    const osc = lastOsc!
    p.stopAll()
    expect(osc.stop).toHaveBeenCalled()
    expect(osc.disconnect).toHaveBeenCalled()
  })
})
