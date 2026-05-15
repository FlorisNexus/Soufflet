/**
 * @file Home.tsx
 * @description Song picker screen; shows all available songs with progress indicators.
 */

import { useState } from 'react'
import { SONGS } from '../songs/songLoader'
import { progressStore } from '../store/progressStore'
import type { Song } from '../songs/schema'

/**
 * Props for the Home component.
 */
type Props = {
  /** Callback fired when a song is selected for playback */
  onPlay: (song: Song) => void
}

/**
 * Presentational component for displaying star rating achievement.
 */
function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= stars ? 'text-amber-400' : 'text-gray-600'}>★</span>
      ))}
    </div>
  )
}

/**
 * Main entrance screen for the application.
 * Displays a grid of song cards with their titles, BPMs, and user progress.
 */
export default function Home({ onPlay }: Props) {
  // forceRender used to refresh progress indicators after returning from player
  const [, forceRender] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-amber-400 drop-shadow-sm">🪗 Soufflet</h1>
        <p className="text-gray-400 mt-4 text-lg">Apprends l'accordéon chromatique, sans solfège.</p>
      </div>

      {/* Song grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SONGS.map(song => {
          const plays = progressStore.getPlays(song.id)
          const bestStars = progressStore.getBestStars(song.id)

          return (
            <button
              key={song.id}
              onClick={() => { onPlay(song); forceRender(n => n + 1) }}
              className="bg-gray-800 hover:bg-gray-700 rounded-2xl p-5 text-left
                         border border-gray-700 hover:border-amber-500 transition-all 
                         active:scale-95 group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🎵</div>
              <div className="font-bold text-base leading-tight">{song.title}</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{song.bpm} BPM</div>
              <div className="mt-4 flex items-center justify-between">
                <StarRating stars={bestStars} />
                {plays > 0 && (
                  <span className="text-xs text-gray-500 font-medium">{plays}×</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
