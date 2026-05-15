// Vitest global setup — imports jest-dom matchers (e.g. toBeInTheDocument)
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Canvas getContext
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  roundRect: vi.fn(),
  fillText: vi.fn(),
  setLineDash: vi.fn(),
  scale: vi.fn(),
  createLinearGradient: vi.fn().mockReturnValue({
    addColorStop: vi.fn(),
  }),
}) as any

// Mock getBoundingClientRect for Canvas
HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
  width: 600,
  height: 400,
  top: 0,
  left: 0,
  bottom: 400,
  right: 600,
})
