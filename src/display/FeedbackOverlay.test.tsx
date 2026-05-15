import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FeedbackOverlay from './FeedbackOverlay'

describe('FeedbackOverlay', () => {
  it('renders nothing when result is null', () => {
    const { container } = render(<FeedbackOverlay result={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a checkmark when result is correct', () => {
    render(<FeedbackOverlay result="correct" />)
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('renders an X and expected name when result is wrong', () => {
    render(<FeedbackOverlay result="wrong" expectedName="Do" />)
    expect(screen.getByText(/✗/)).toBeInTheDocument()
    expect(screen.getByText(/Do/)).toBeInTheDocument()
  })
})
