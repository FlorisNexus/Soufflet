/**
 * @file progressStore.ts
 * @description LocalStorage persistence for user song progress.
 */

/** Key used in LocalStorage to store progress data, includes versioning. */
const STORAGE_KEY = 'soufflet_progress_v1'

/**
 * Represents progress for a single song.
 */
type SongProgress = {
  /** Number of times the song has been played */
  plays: number
  /** Highest star rating achieved (0-5) */
  bestStars: number
}

/**
 * Map of song IDs to their progress data.
 */
type ProgressData = Record<string, SongProgress>

/**
 * Loads progress data from LocalStorage.
 * @returns ProgressData object, defaults to empty object on error or missing data.
 */
function load(): ProgressData {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

/**
 * Saves progress data to LocalStorage.
 * @param data - The progress data to persist.
 */
function save(data: ProgressData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * Singleton service for managing user progress.
 * Equivalent to an Angular @Injectable({ providedIn: 'root' }).
 */
export const progressStore = {
  /** Internal cache of the progress data */
  _cache: load() as ProgressData,

  /**
   * Resets the internal cache by re-loading from LocalStorage.
   * Useful for simulating page reloads in tests.
   */
  reset(): void {
    this._cache = load()
  },

  /**
   * Gets the play count for a specific song.
   * @param songId - The unique song ID.
   * @returns Total play count.
   */
  getPlays(songId: string): number {
    return this._cache[songId]?.plays ?? 0
  },

  /**
   * Gets the best star rating achieved for a specific song.
   * @param songId - The unique song ID.
   * @returns Best star rating (0-5).
   */
  getBestStars(songId: string): number {
    return this._cache[songId]?.bestStars ?? 0
  },

  /**
   * Records a completed song play and updates stats.
   * @param songId - The unique song ID.
   * @param stars - Star rating achieved in the play.
   */
  recordPlay(songId: string, stars: number): void {
    const existing = this._cache[songId] ?? { plays: 0, bestStars: 0 }
    this._cache[songId] = {
      plays: existing.plays + 1,
      bestStars: Math.max(existing.bestStars, stars),
    }
    save(this._cache)
  },
}
