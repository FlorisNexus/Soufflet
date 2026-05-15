/**
 * @file PitchDetector.ts
 * @description Real-time pitch detection using the pitchy library.
 */

import { PitchDetector as PitchyDetector } from 'pitchy'
import { frequencyToMidi } from '../constants/notes'

/**
 * Represents a detected musical note.
 */
export type DetectedNote = {
  /** The nearest MIDI note number */
  midiNote: number
  /** The fundamental frequency in Hz */
  frequency: number
  /** Detection clarity (0.0 to 1.0) */
  clarity: number
}

/**
 * Service class that performs pitch detection on an audio stream.
 * Processing occurs on the main thread using ScriptProcessorNode for simplicity.
 */
export class PitchDetector {
  private readonly bufferSize = 2048
  private detector: PitchyDetector<Float32Array>
  private processorNode: ScriptProcessorNode | null = null
  private onDetect: ((note: DetectedNote | null) => void) | null = null

  /** Minimum clarity threshold required to report a note (prevents noise false positives) */
  private readonly CLARITY_THRESHOLD = 0.9

  /**
   * Initializes the Pitchy detector.
   */
  constructor() {
    this.detector = PitchyDetector.forFloat32Array(this.bufferSize)
  }

  /**
   * Attaches to an AudioContext source and starts pitch detection.
   * @param context - The current AudioContext.
   * @param source - The source node to analyze.
   * @param onDetect - Callback invoked with each detection result.
   */
  start(
    context: AudioContext,
    source: MediaStreamAudioSourceNode,
    onDetect: (note: DetectedNote | null) => void
  ): void {
    this.onDetect = onDetect

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

  /**
   * Stops processing and disconnects from the audio graph.
   */
  stop(): void {
    this.processorNode?.disconnect()
    this.processorNode = null
    this.onDetect = null
  }
}
