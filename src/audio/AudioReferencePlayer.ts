/**
 * @file AudioReferencePlayer.ts
 * @description Plays a short sine reference tone for a given MIDI note via WebAudio.
 *
 * WHY: in Free Play mode the user can compare what they played against the
 * equal-temperament target — either visually (cents readout against an
 * external tuner) or by ear (this player). The oscillator runs locally with
 * no extra dependency.
 *
 * Behaviour:
 *   - One `AudioContext` per instance, created lazily on the first `play()`
 *     so we don't ask the browser for audio resources until they are needed.
 *   - Each `play(midi)` cancels the previous in-flight tone — only one
 *     reference sound at a time.
 *   - A small envelope (10 ms attack, 50 ms release) avoids click artefacts
 *     at start and end.
 */

import { equalTempHz } from '../constants/notes'

const TONE_DURATION_S = 1
const ATTACK_S = 0.01
const RELEASE_S = 0.05
const PEAK_GAIN = 0.25

export class AudioReferencePlayer {
  private ctx: AudioContext | null = null
  private activeOsc: OscillatorNode | null = null
  private activeGain: GainNode | null = null
  private muted = false

  /** Disables `play` without tearing the context down. */
  setMuted(muted: boolean) {
    this.muted = muted
    if (muted) this.stopAll()
  }

  /** Stops any in-flight reference tone immediately. */
  stopAll(): void {
    try {
      this.activeOsc?.stop()
    } catch {
      // Already stopped — ignore.
    }
    this.activeOsc?.disconnect()
    this.activeGain?.disconnect()
    this.activeOsc = null
    this.activeGain = null
  }

  /** Plays a 1-second sine wave at the equal-temperament frequency of `midi`. */
  play(midi: number): void {
    if (this.muted) return
    try {
      const ctx = this.ensureContext()
      this.stopAll()

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const now = ctx.currentTime

      osc.type = 'sine'
      osc.frequency.setValueAtTime(equalTempHz(midi), now)

      // Envelope: ramp to peak, hold, ramp down to silence.
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(PEAK_GAIN, now + ATTACK_S)
      gain.gain.setValueAtTime(PEAK_GAIN, now + TONE_DURATION_S - RELEASE_S)
      gain.gain.linearRampToValueAtTime(0, now + TONE_DURATION_S)

      osc.connect(gain).connect(ctx.destination)
      osc.start(now)
      osc.stop(now + TONE_DURATION_S + 0.02)

      this.activeOsc = osc
      this.activeGain = gain

      osc.onended = () => {
        if (this.activeOsc === osc) {
          this.activeOsc = null
          this.activeGain = null
        }
      }
    } catch {
      // Audio unavailable (e.g. user hasn't interacted yet on Safari) — fail silently.
    }
  }

  /** Releases the AudioContext. Call on unmount. */
  dispose(): void {
    this.stopAll()
    void this.ctx?.close()
    this.ctx = null
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }
    return this.ctx
  }
}
