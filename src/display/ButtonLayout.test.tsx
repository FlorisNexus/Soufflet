import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import ButtonLayout from './ButtonLayout'

describe('ButtonLayout', () => {
  it('renders an SVG element', () => {
    const { container } = render(
      <ButtonLayout system="C" activeButtonPosition={null} onSystemChange={() => {}} />
    )
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders 3 rows of buttons', () => {
    const { container } = render(
      <ButtonLayout system="C" activeButtonPosition={null} onSystemChange={() => {}} />
    )
    const groups = container.querySelectorAll('[data-testid^="button-row-"]')
    expect(groups.length).toBe(3)
  })

  it('highlights active button with active color', () => {
    const { container } = render(
      <ButtonLayout
        system="C"
        activeButtonPosition={{ row: 1, col: 3, midiNote: 62, frenchName: 'Ré', color: '#F57C00' }}
        onSystemChange={() => {}}
      />
    )
    const activeBtn = container.querySelector('[data-active="true"]')
    expect(activeBtn).not.toBeNull()
  })
})
