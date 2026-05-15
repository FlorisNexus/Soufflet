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
}) as any
