// MicrophoneManager.ts — manages the getUserMedia lifecycle (Angular DeviceService equivalent)
// Separated from pitch detection so each class has one responsibility
export class MicrophoneManager {
  private stream: MediaStream | null = null
  private context: AudioContext | null = null
  private sourceNode: MediaStreamAudioSourceNode | null = null

  async start(): Promise<AudioContext> {
    if (this.context) return this.context

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    this.context = new AudioContext()
    this.sourceNode = this.context.createMediaStreamSource(this.stream)
    return this.context
  }

  getSourceNode(): MediaStreamAudioSourceNode {
    if (!this.sourceNode) throw new Error('MicrophoneManager: call start() first')
    return this.sourceNode
  }

  stop(): void {
    this.stream?.getTracks().forEach(t => t.stop())
    this.context?.close()
    this.stream = null
    this.context = null
    this.sourceNode = null
  }

  isRunning(): boolean {
    return this.context !== null && this.context.state === 'running'
  }
}
