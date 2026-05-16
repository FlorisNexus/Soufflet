import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import ButtonLayout from './ButtonLayout'

describe('ButtonLayout', () => {
  it('renders an SVG element', () => {
    const { container } = render(<ButtonLayout system="C" activeMidi={null} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders 5 rows of 21 buttons = 105 circles', () => {
    const { container } = render(<ButtonLayout system="C" activeMidi={null} />)
    expect(container.querySelectorAll('circle').length).toBe(5 * 21)
  })

  it('marks principal candidates as data-state="principal"', () => {
    // MIDI 60 = Do4. In C-system rows 0–2 start at 56/57/58, so 60 sits at
    // (row 2, col 1). It also has a duplicate in rows 3–4.
    const { container } = render(<ButtonLayout system="C" activeMidi={60} />)
    const principal = container.querySelectorAll('[data-state="principal"]')
    expect(principal.length).toBeGreaterThanOrEqual(1)
  })

  it('marks duplicate candidates as data-state="duplicate"', () => {
    // MIDI 59 (Si3) has both a principal (row 1 col 1) and a duplicate (row 3 col 0).
    const { container } = render(<ButtonLayout system="C" activeMidi={59} />)
    const duplicates = container.querySelectorAll('[data-state="duplicate"]')
    expect(duplicates.length).toBeGreaterThanOrEqual(1)
  })

  it('renders no highlight when activeMidi is null', () => {
    const { container } = render(<ButtonLayout system="C" activeMidi={null} />)
    expect(container.querySelectorAll('[data-state="principal"]').length).toBe(0)
    expect(container.querySelectorAll('[data-state="duplicate"]').length).toBe(0)
  })
})
