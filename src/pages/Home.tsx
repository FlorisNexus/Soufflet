// Home.tsx — song picker screen; shows all songs with progress indicators
// Simple grid of cards, no router needed (App.tsx handles navigation via state)
import { useState } from 'react'
import { SONGS } from '../songs/songLoader'
import { progressStore } from '../store/progressStore'
import type { Song } from '../songs/schema'

type Props = {
  onPlay: (song: Song) => void
}

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= stars ? 'text-amber-400' : 'text-gray-600'}>★</span>
      ))}
    </div>
  )
}

export default function Home({ onPlay }: Props) {
  const [, forceRender] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-amber-400">🪗 Soufflet</h1>
        <p className="text-gray-400 mt-2">Apprends l'accordéon, sans solfège.</p>
      </div>

      {/* Song grid */}
      <div className="grid grid-cols-2 gap-4">
        {SONGS.map(song => {
          const plays = progressStore.getPlays(song.id)
          const bestStars = progressStore.getBestStars(song.id)

          return (
            <button
              key={song.id}
              onClick={() => { onPlay(song); forceRender(n => n + 1) }}
              className="bg-gray-800 hover:bg-gray-700 rounded-2xl p-4 text-left
                         border border-gray-700 hover:border-amber-500 transition-all active:scale-95"
            >
              <div className="text-2xl mb-2">🎵</div>
              <div className="font-semibold text-sm leading-tight">{song.title}</div>
              <div className="text-xs text-gray-500 mt-1">{song.bpm} BPM</div>
              <div className="mt-2 flex items-center gap-2">
                <StarRating stars={bestStars} />
                {plays > 0 && (
                  <span className="text-xs text-gray-500">{plays}×</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
