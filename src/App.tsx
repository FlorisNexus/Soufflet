// App.tsx — root component; manages navigation between Home and Player screens
// No router library: single-page app with two views toggled via state (simpler than React Router for MVP)
import { useState } from 'react'
import Home from './pages/Home'
import Player from './pages/Player'
import type { Song } from './songs/schema'

export default function App() {
  const [activeSong, setActiveSong] = useState<Song | null>(null)

  if (activeSong) {
    return <Player song={activeSong} onBack={() => setActiveSong(null)} />
  }
  return <Home onPlay={setActiveSong} />
}
