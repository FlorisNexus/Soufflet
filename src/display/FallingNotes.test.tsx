import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import FallingNotes from './FallingNotes'
import { SONGS } from '../songs/songLoader'

describe('FallingNotes', () => {
  it('renders a canvas element', () => {
    const { container } = render(
      <FallingNotes
        song={SONGS[0]}
        currentBeat={0}
        system="C"
        showNoteNames={false}
        onNoteAtLine={vi.fn()}
      />
    )
    expect(container.querySelector('canvas')).not.toBeNull()
  })
})
