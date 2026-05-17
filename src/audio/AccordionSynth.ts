/**
 * @file AccordionSynth.ts
 * @description Synthesized accordion-like tone using two slightly detuned sawtooth
 * oscillators routed through a low-pass filter. The detuning simulates accordion
 * reeds (push and pull), and the sawtooth waveform naturally contains all harmonics
 * at 1/n amplitude — giving the characteristic reedy timbre without manual additive
 * synthesis.
 */

import { equalTempHz } from '../constants/notes'

const DETUNE_CENTS = 5       // slight chorus between two reeds
const CUTOFF_HZ   = 1800     // low-pass warmth (removes harsh highs)
const ATTACK_S    = 0.015
const RELEASE_S   = 0.08
const PEAK_GAIN   = 0.20
const MAX_DUR_S   = 6

type ActiveNote = {
  oscs:   OscillatorNode[]
  filter: BiquadFilterNode
  gain:   GainNode
}

export class AccordionSynth {
  private ctx: AudioContext | null = null
  private active = new Map<number, ActiveNote>()

  /**
   * Plays a synthesized accordion note at `midi` for `durationS` seconds.
   * If the same MIDI note is already playing, the previous instance is stopped first.
   */
  playNote(midi: number, durationS: number): void {
    try {
      const ctx  = this.ensureContext()
      this.stopNote(midi)

      const dur  = Math.min(durationS, MAX_DUR_S)
      const freq = equalTempHz(midi)
      const now  = ctx.currentTime

      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      osc1.type = 'sawtooth'
      osc2.type = 'sawtooth'
      osc1.frequency.setValueAtTime(freq, now)
      osc2.frequency.setValueAtTime(freq, now)
      osc1.detune.setValueAtTime(-DETUNE_CENTS / 2, now)
      osc2.detune.setValueAtTime(+DETUNE_CENTS / 2, now)

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(CUTOFF_HZ, now)
      filter.Q.setValueAtTime(0.8, now)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(PEAK_GAIN, now + ATTACK_S)
      gain.gain.setValueAtTime(PEAK_GAIN, now + dur - RELEASE_S)
      gain.gain.linearRampToValueAtTime(0, now + dur)

      osc1.connect(filter)
      osc2.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + dur + 0.05)
      osc2.stop(now + dur + 0.05)

      const note: ActiveNote = { oscs: [osc1, osc2], filter, gain }
      this.active.set(midi, note)

      osc1.onended = () => {
        if (this.active.get(midi) === note) {
          note.filter.disconnect()
          note.gain.disconnect()
          this.active.delete(midi)
        }
      }
    } catch {
      // Audio unavailable (browser policy before user gesture, or context closed)
    }
  }

  /** Stops a single note immediately with a short fade-out to avoid clicks. */
  stopNote(midi: number): void {
    const note = this.active.get(midi)
    if (!note || !this.ctx) return
    try {
      const now = this.ctx.currentTime
      note.gain.gain.cancelScheduledValues(now)
      note.gain.gain.linearRampToValueAtTime(0, now + 0.02)
      note.oscs.forEach(o => {
        try { o.stop(now + 0.03) } catch { /* already stopped */ }
      })
    } catch { /* context closed */ }
    this.active.delete(midi)
  }

  /** Stops all currently playing notes. */
  stopAll(): void {
    for (const midi of [...this.active.keys()]) {
      this.stopNote(midi)
    }
  }

  /** Releases the AudioContext. Call on component unmount. */
  dispose(): void {
    this.stopAll()
    void this.ctx?.close()
    this.ctx = null
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext()
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }
}
