// progressStore.ts — reads/writes song progress to localStorage; no backend needed for MVP
// Versioned schema (v1) so future changes can migrate old data without breaking
const STORAGE_KEY = 'soufflet_progress_v1'

type SongProgress = {
  plays: number
  bestStars: number
}

type ProgressData = Record<string, SongProgress>

function load(): ProgressData {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function save(data: ProgressData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Exported as a singleton object (Angular @Injectable({ providedIn: 'root' }) equivalent)
export const progressStore = {
  _cache: load() as ProgressData,

  reset(): void {
    this._cache = load()
  },

  getPlays(songId: string): number {
    return this._cache[songId]?.plays ?? 0
  },

  getBestStars(songId: string): number {
    return this._cache[songId]?.bestStars ?? 0
  },

  recordPlay(songId: string, stars: number): void {
    const existing = this._cache[songId] ?? { plays: 0, bestStars: 0 }
    this._cache[songId] = {
      plays: existing.plays + 1,
      bestStars: Math.max(existing.bestStars, stars),
    }
    save(this._cache)
  },
}
