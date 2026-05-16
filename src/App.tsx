// App.tsx — root component; gates the app on calibration and routes between
// Home, Player, FreePlay, and Calibration.
// Single-page app: no router library — the active view is derived from local state.
// WHY: keeps bundle small and routing logic obvious. With only 4 views, a router
// is overkill.
import { useState } from 'react'
import Home from './pages/Home'
import Player from './pages/Player'
import FreePlay from './pages/FreePlay'
import Calibration from './pages/Calibration'
import { useCalibration } from './hooks/useCalibration'
import type { Song } from './songs/schema'

type View = 'home' | 'player' | 'free'

export default function App() {
  const { status, calibration, saveCalibration, clearCalibration } = useCalibration()
  const [view, setView] = useState<View>('home')
  const [activeSong, setActiveSong] = useState<Song | null>(null)

  // Calibration gate. Status is computed synchronously from localStorage on
  // first render so there is no loading flicker.
  if (status !== 'set' || !calibration) {
    return <Calibration onConfirmed={saveCalibration} />
  }

  if (view === 'player' && activeSong) {
    return (
      <Player
        song={activeSong}
        system={calibration.system}
        onBack={() => { setActiveSong(null); setView('home') }}
      />
    )
  }

  if (view === 'free') {
    return (
      <FreePlay
        system={calibration.system}
        onBack={() => setView('home')}
        onRecalibrate={() => { clearCalibration(); setView('home') }}
      />
    )
  }

  return (
    <Home
      onPlay={song => { setActiveSong(song); setView('player') }}
      onFreePlay={() => setView('free')}
      onRecalibrate={clearCalibration}
    />
  )
}
