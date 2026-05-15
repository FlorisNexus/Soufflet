// PitchDetector.ts — wraps pitchy to detect pitch from an audio buffer
// Processing happens on the main thread (not AudioWorklet) for simplicity.
// The ScriptProcessorNode is deprecated but still widely supported; AudioWorklet adds complexity
// for no meaningful latency benefit at 80ms target latency.
import { PitchDetector as PitchyDetector } from 'pitchy'
import { frequencyToMidi } from '../constants/notes'

export type DetectedNote = {
  midiNote: number
  frequency: number
  clarity: number
}

export class PitchDetector {
  private readonly bufferSize = 2048
  private detector: PitchyDetector<Float32Array>
  private processorNode: ScriptProcessorNode | null = null
  private onDetect: ((note: DetectedNote | null) => void) | null = null

  // Minimum clarity threshold — lower = more false positives; 0.9 is well-tested for instruments
  private readonly CLARITY_THRESHOLD = 0.9

  constructor() {
    this.detector = PitchyDetector.forFloat32Array(this.bufferSize)
  }

  /** Attaches to an AudioContext source and starts calling onDetect with each detected note */
  start(
    context: AudioContext,
    source: MediaStreamAudioSourceNode,
    onDetect: (note: DetectedNote | null) => void
  ): void {
    this.onDetect = onDetect

    // ScriptProcessorNode runs on main thread — sufficient for ~40ms latency
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    this.processorNode = context.createScriptProcessor(this.bufferSize, 1, 1)
    this.processorNode.onaudioprocess = (event) => {
      const buffer = event.inputBuffer.getChannelData(0)
      const [frequency, clarity] = this.detector.findPitch(buffer, context.sampleRate)

      if (clarity >= this.CLARITY_THRESHOLD && frequency > 0) {
        const midiNote = frequencyToMidi(frequency)
        this.onDetect?.({ midiNote, frequency, clarity })
      } else {
        this.onDetect?.(null)
      }
    }

    source.connect(this.processorNode)
    this.processorNode.connect(context.destination)
  }

  stop(): void {
    this.processorNode?.disconnect()
    this.processorNode = null
    this.onDetect = null
  }
}
