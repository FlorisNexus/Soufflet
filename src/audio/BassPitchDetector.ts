/**
 * @file BassPitchDetector.ts
 * @description Detects the fundamental bass note from a microphone stream by
 * running a separate AudioContext with a low-pass filter, isolating accordion
 * bass-reed frequencies (roughly 40–200 Hz) from the higher right-hand notes.
 *
 * WHY a separate AudioContext: the right-hand PitchDetector uses the existing
 * context from MicrophoneManager. Creating an independent context here lets us
 * apply a different filter chain without touching the main pipeline.
 *
 * Detection range: MIDI 24–55 (C1–G3). Bass notes on a standard Stradella
 * accordion fall roughly in this range. We detect pitch class (0–11) and let
 * the caller look up the Stradella column.
 */

import { PitchDetector as PitchyDetector } from 'pitchy'
import { frequencyToMidi } from '../constants/notes'

export type BasssNote = {
  midiNote: number
  pitchClass: number
  frequency: number
  clarity: number
}

const LOWPASS_CUTOFF_HZ = 180   // attenuates right-hand notes while passing bass reeds
const LOWPASS_Q = 2.5           // slightly steeper rolloff
const BUFFER_SIZE = 4096        // larger buffer → better low-frequency resolution
const CLARITY_THRESHOLD = 0.72  // more lenient than right-hand (bass reeds are noisier)
const BASS_MIDI_MIN = 24        // C1  (~32 Hz)
const BASS_MIDI_MAX = 55        // G3  (~196 Hz, slightly above cutoff so 2nd harmonic can help)
const HOLDOFF_MS = 150          // longer holdoff than right-hand (bass articulation is slower)

export class BassPitchDetector {
  private ctx: AudioContext | null = null
  private processor: ScriptProcessorNode | null = null
  private detector = PitchyDetector.forFloat32Array(BUFFER_SIZE)
  private onDetect: ((note: BasssNote | null) => void) | null = null

  private lastValid: BasssNote | null = null
  private lastValidAt = 0

  start(stream: MediaStream, onDetect: (note: BasssNote | null) => void): void {
    this.stop()
    this.onDetect = onDetect

    try {
      this.ctx = new AudioContext()
      const source = this.ctx.createMediaStreamSource(stream)

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = LOWPASS_CUTOFF_HZ
      filter.Q.value = LOWPASS_Q

      this.processor = this.ctx.createScriptProcessor(BUFFER_SIZE, 1, 1)
      this.processor.onaudioprocess = (e) => {
        const buffer = e.inputBuffer.getChannelData(0)
        const [freq, clarity] = this.detector.findPitch(buffer, this.ctx!.sampleRate)
        const midi = frequencyToMidi(freq)

        if (clarity >= CLARITY_THRESHOLD && freq > 0 && midi >= BASS_MIDI_MIN && midi <= BASS_MIDI_MAX) {
          const note: BasssNote = { midiNote: midi, pitchClass: midi % 12, frequency: freq, clarity }
          this.lastValid = note
          this.lastValidAt = Date.now()
          this.onDetect?.(note)
        } else if (this.lastValid && Date.now() - this.lastValidAt < HOLDOFF_MS) {
          this.onDetect?.(this.lastValid)
        } else {
          this.lastValid = null
          this.onDetect?.(null)
        }
      }

      source.connect(filter)
      filter.connect(this.processor)
      this.processor.connect(this.ctx.destination)

      if (this.ctx.state === 'suspended') void this.ctx.resume()
    } catch {
      // Audio unavailable — fail silently
    }
  }

  stop(): void {
    this.processor?.disconnect()
    this.processor = null
    void this.ctx?.close()
    this.ctx = null
    this.lastValid = null
    this.lastValidAt = 0
    this.onDetect = null
  }
}
