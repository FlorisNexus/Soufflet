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
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-xl ${i <= stars ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-gray-700'}`}>
          ★
        </span>
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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 selection:bg-amber-500/30">
      <div className="w-full max-w-4xl animate-in fade-in slide-in-from-top-4 duration-700">
        {/* Header Section */}
        <header className="mb-16 text-center">
          <div className="inline-block p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 mb-6 animate-bounce duration-[3000ms]">
            <span className="text-6xl">🪗</span>
          </div>
          <h1 className="text-7xl font-black text-white tracking-tighter mb-4">
            SOUFFLET
          </h1>
          <p className="text-gray-400 text-xl font-medium max-w-md mx-auto leading-relaxed">
            Apprends l'accordéon chromatique <span className="text-amber-500">sans solfège</span>, par l'écoute et le jeu.
          </p>
        </header>

        {/* Song Library Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SONGS.map((song, index) => {
            const plays = progressStore.getPlays(song.id)
            const bestStars = progressStore.getBestStars(song.id)

            return (
              <button
                key={song.id}
                onClick={() => { onPlay(song); forceRender(n => n + 1) }}
                style={{ animationDelay: `${index * 100}ms` }}
                className="group relative bg-gray-900 hover:bg-gray-800 rounded-[2.5rem] p-8 text-left
                           border border-white/5 hover:border-amber-500/50 transition-all 
                           active:scale-[0.98] shadow-xl hover:shadow-amber-500/10 
                           animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
              >
                <div className="absolute top-6 right-8 text-gray-800 group-hover:text-amber-500/20 text-5xl font-black transition-colors">
                  {index + 1}
                </div>

                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gray-800 group-hover:bg-amber-500 rounded-2xl flex items-center justify-center mb-6 transition-colors shadow-inner">
                    <span className="text-2xl group-hover:scale-125 transition-transform">🎵</span>
                  </div>
                  
                  <h3 className="font-black text-2xl mb-1 leading-tight group-hover:text-amber-400 transition-colors">
                    {song.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-0.5 px-2 bg-black/30 rounded-md">
                      {song.bpm} BPM
                    </span>
                    {plays > 0 && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">
                        Joué {plays}×
                      </span>
                    )}
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <StarRating stars={bestStars} />
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all">
                      <span className="text-xl">→</span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer info */}
        <footer className="mt-20 text-center text-gray-600 font-bold text-sm tracking-widest uppercase">
          FlorisNexus &copy; 2026 — Chromatic Button Accordion Trainer
        </footer>
      </div>
    </div>
  )
}
