// songLoader.ts — imports and validates all song JSON files at build time
// Using static imports (not dynamic) so Vite can bundle them without a server
import type { Song } from './schema'
import auClairDeLaLune from './library/au-clair-de-la-lune.json'
import frereJacques from './library/frere-jacques.json'
import joyeuxAnniversaire from './library/joyeux-anniversaire.json'
import douceNuit from './library/douce-nuit.json'
import laMarseillaise from './library/la-marseillaise.json'
import laBambaIntro from './library/la-bamba-intro.json'
import valseMusette from './library/valse-musette.json'

function assertSong(data: unknown): Song {
  const s = data as Song
  if (!s.id || !s.title || !s.bpm || !Array.isArray(s.notes)) {
    throw new Error(`Invalid song data: ${JSON.stringify(data).slice(0, 100)}`)
  }
  return s
}

export const SONGS: Song[] = [
  assertSong(auClairDeLaLune),
  assertSong(frereJacques),
  assertSong(joyeuxAnniversaire),
  assertSong(douceNuit),
  assertSong(laMarseillaise),
  assertSong(laBambaIntro),
  assertSong(valseMusette),
]

export function getSongById(id: string): Song | undefined {
  return SONGS.find(s => s.id === id)
}
