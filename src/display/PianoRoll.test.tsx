/**
 * @file PianoRoll.test.tsx
 * @description Smoke tests for the PianoRoll Canvas component. The RAF loop
 * is not exercised here (Canvas is mocked in `test-setup.ts` and animation
 * frames are unreliable in jsdom). We just verify the component mounts,
 * accepts the expected props, and exposes the canvas role for a11y.
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import PianoRoll from './PianoRoll'
import type { PlayedNote } from '../hooks/freePlayReducer'

const sampleTimeline: PlayedNote[] = [
  {
    id: 'a',
    midi: 60,
    frequencyHz: 261.6,
    startTime: 0,
    endTime: 500,
    _frequencySum: 261.6,
    _frequencyCount: 1,
  },
  {
    id: 'b',
    midi: 62,
    frequencyHz: 293.7,
    startTime: 500,
    endTime: null,
    _frequencySum: 293.7,
    _frequencyCount: 1,
  },
]

describe('PianoRoll', () => {
  it('renders a <canvas> element', () => {
    const { container } = render(
      <PianoRoll timeline={[]} sessionStartedAt={0} />,
    )
    expect(container.querySelector('canvas')).not.toBeNull()
  })

  it('accepts a populated timeline without crashing', () => {
    const { container } = render(
      <PianoRoll timeline={sampleTimeline} sessionStartedAt={performance.now() - 600} />,
    )
    expect(container.querySelector('canvas')).not.toBeNull()
  })

  it('exposes a meaningful aria-label', () => {
    const { container } = render(
      <PianoRoll timeline={[]} sessionStartedAt={0} />,
    )
    const canvas = container.querySelector('canvas')
    expect(canvas?.getAttribute('aria-label')).toMatch(/notes/i)
  })
})
