import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import ButtonLayout from './ButtonLayout'

describe('ButtonLayout', () => {
  it('renders an SVG element', () => {
    const { container } = render(<ButtonLayout system="C" activeMidi={null} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders 5 rows with alternating 17/18 buttons (= 87 circles)', () => {
    const { container } = render(<ButtonLayout system="C" activeMidi={null} />)
    expect(container.querySelectorAll('circle').length).toBe(17 + 18 + 17 + 18 + 17)
  })

  it('marks principal candidates as data-state="principal"', () => {
    // MIDI 60 = Do4. In C-system rangée 2 (row 1) col 5 produces it (principal).
    const { container } = render(<ButtonLayout system="C" activeMidi={60} />)
    const principal = container.querySelectorAll('[data-state="principal"]')
    expect(principal.length).toBeGreaterThanOrEqual(1)
  })

  it('marks duplicate candidates as data-state="duplicate"', () => {
    // MIDI 64 (Mi4) has principal on row 0 col 6 (rangée 1 pos 7) and a duplicate
    // on row 3 col 6 (rangée 4 pos 7, mechanically linked to rangée 1).
    const { container } = render(<ButtonLayout system="C" activeMidi={64} />)
    const duplicates = container.querySelectorAll('[data-state="duplicate"]')
    expect(duplicates.length).toBeGreaterThanOrEqual(1)
  })

  it('renders no highlight when activeMidi is null', () => {
    const { container } = render(<ButtonLayout system="C" activeMidi={null} />)
    expect(container.querySelectorAll('[data-state="principal"]').length).toBe(0)
    expect(container.querySelectorAll('[data-state="duplicate"]').length).toBe(0)
  })
})
