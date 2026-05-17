/**
 * @file songLoader.ts
 * @description Build-time import and validation of song library JSON files.
 */

import type { Song } from './schema'
import auClairDeLaLune from './library/au-clair-de-la-lune.json'
import frereJacques from './library/frere-jacques.json'
import joyeuxAnniversaire from './library/joyeux-anniversaire.json'
import douceNuit from './library/douce-nuit.json'
import laMarseillaise from './library/la-marseillaise.json'
import laBambaIntro from './library/la-bamba-intro.json'
import valseMusette from './library/valse-musette.json'
import odeALaJoie from './library/ode-a-la-joie.json'
import tarantella from './library/tarantella.json'
import toZanarkand from './library/to-zanarkand.json'
import erika from './library/erika.json'

/**
 * Validates a raw object against the Song schema.
 * @throws Error if the data is invalid.
 * @param data - The raw JSON data.
 * @returns The validated Song object.
 */
function assertSong(data: unknown): Song {
  const s = data as Song
  if (!s.id || !s.title || !s.bpm || !Array.isArray(s.notes)) {
    throw new Error(`Invalid song data: ${JSON.stringify(data).slice(0, 100)}`)
  }
  return s
}

/**
 * The complete collection of available songs.
 */
export const SONGS: Song[] = [
  assertSong(auClairDeLaLune),
  assertSong(frereJacques),
  assertSong(joyeuxAnniversaire),
  assertSong(douceNuit),
  assertSong(laMarseillaise),
  assertSong(laBambaIntro),
  assertSong(valseMusette),
  assertSong(odeALaJoie),
  assertSong(tarantella),
  assertSong(toZanarkand),
  assertSong(erika),
]

/**
 * Finds a song by its unique ID.
 * @param id - The song ID to search for.
 * @returns The Song object if found, otherwise undefined.
 */
export function getSongById(id: string): Song | undefined {
  return SONGS.find(s => s.id === id)
}
