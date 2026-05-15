import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAudio } from './useAudio'

// Mocking Web Audio API
const mockMediaStream = {
  getTracks: vi.fn(() => [{ stop: vi.fn() }]),
}

const mockSourceNode = {
  connect: vi.fn(),
  disconnect: vi.fn(),
}

const mockAudioContext = {
  createMediaStreamSource: vi.fn(() => mockSourceNode),
  createScriptProcessor: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    onaudioprocess: null,
  })),
  close: vi.fn(),
  destination: {},
  state: 'running',
}

// Use a proper class mock
class MockAudioContext {
  createMediaStreamSource = mockAudioContext.createMediaStreamSource
  createScriptProcessor = mockAudioContext.createScriptProcessor
  close = mockAudioContext.close
  destination = mockAudioContext.destination
  state = mockAudioContext.state
}

vi.stubGlobal('AudioContext', MockAudioContext)
vi.stubGlobal('navigator', {
  mediaDevices: {
    getUserMedia: vi.fn(async () => mockMediaStream),
  },
})

describe('useAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAudioContext.state = 'running'
  })

  it('starts in non-listening state', () => {
    const { result } = renderHook(() => useAudio('C'))
    expect(result.current.isListening).toBe(false)
    expect(result.current.detectedNote).toBeNull()
  })

  it('starts listening when startListening is called', async () => {
    const { result } = renderHook(() => useAudio('C'))
    
    await act(async () => {
      await result.current.startListening()
    })

    expect(result.current.isListening).toBe(true)
    expect(globalThis.navigator.mediaDevices.getUserMedia).toHaveBeenCalled()
  })

  it('stops listening when stopListening is called', async () => {
    const { result } = renderHook(() => useAudio('C'))

    await act(async () => {
      await result.current.startListening()
    })
    
    act(() => {
      result.current.stopListening()
    })

    expect(result.current.isListening).toBe(false)
    expect(mockAudioContext.close).toHaveBeenCalled()
  })
})
