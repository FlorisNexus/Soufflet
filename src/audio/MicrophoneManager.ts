/**
 * @file MicrophoneManager.ts
 * @description Manages the browser's Web Audio microphone stream lifecycle.
 */

/**
 * Service class that handles microphone access and AudioContext lifecycle.
 * Equivalent to an Angular DeviceService.
 */
export class MicrophoneManager {
  private stream: MediaStream | null = null
  private context: AudioContext | null = null
  private sourceNode: MediaStreamAudioSourceNode | null = null

  /**
   * Requests microphone access and initializes the AudioContext.
   * @returns A promise that resolves to the initialized AudioContext.
   */
  async start(): Promise<AudioContext> {
    if (this.context) return this.context

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    this.context = new AudioContext()
    this.sourceNode = this.context.createMediaStreamSource(this.stream)
    return this.context
  }

  /**
   * Returns the MediaStreamAudioSourceNode for the current microphone stream.
   * @throws Error if start() has not been called.
   * @returns The source node.
   */
  getSourceNode(): MediaStreamAudioSourceNode {
    if (!this.sourceNode) throw new Error('MicrophoneManager: call start() first')
    return this.sourceNode
  }

  getStream(): MediaStream | null {
    return this.stream
  }

  /**
   * Stops all audio tracks and closes the AudioContext.
   */
  stop(): void {
    this.stream?.getTracks().forEach(t => t.stop())
    this.context?.close()
    this.stream = null
    this.context = null
    this.sourceNode = null
  }

  /**
   * Checks if the microphone is currently active.
   * @returns True if the AudioContext is running.
   */
  isRunning(): boolean {
    return this.context !== null && this.context.state === 'running'
  }
}
