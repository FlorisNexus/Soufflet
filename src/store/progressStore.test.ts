import { describe, it, expect, beforeEach } from 'vitest'
import { progressStore } from './progressStore'

describe('progressStore', () => {
  beforeEach(() => {
    localStorage.clear()
    progressStore.reset()
  })

  it('returns 0 plays for a new song', () => {
    expect(progressStore.getPlays('test-song')).toBe(0)
  })

  it('increments play count', () => {
    progressStore.recordPlay('test-song', 3)
    progressStore.recordPlay('test-song', 4)
    expect(progressStore.getPlays('test-song')).toBe(2)
  })

  it('tracks best star rating', () => {
    progressStore.recordPlay('test-song', 3)
    progressStore.recordPlay('test-song', 5)
    expect(progressStore.getBestStars('test-song')).toBe(5)
  })

  it('persists across store resets (reads from localStorage)', () => {
    progressStore.recordPlay('persist-test', 4)
    progressStore.reset()  // simulate a page reload
    expect(progressStore.getPlays('persist-test')).toBe(1)
  })
})
