// Vitest global setup — imports jest-dom matchers (e.g. toBeInTheDocument)
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Canvas getContext. We expose just enough of the 2D API to let our
// rendering code execute without runtime errors in jsdom.
const fakeContext = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  roundRect: vi.fn(),
  fillText: vi.fn(),
  setLineDash: vi.fn(),
  scale: vi.fn(),
  setTransform: vi.fn(),
  createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  globalAlpha: 1,
  font: '',
  textBaseline: 'alphabetic',
}
HTMLCanvasElement.prototype.getContext = vi
  .fn()
  .mockReturnValue(fakeContext) as unknown as HTMLCanvasElement['getContext']

HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
  width: 600,
  height: 400,
  top: 0,
  left: 0,
  bottom: 400,
  right: 600,
})
