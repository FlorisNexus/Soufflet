/**
 * @file NoteMapper.ts
 * @description Logic for mapping MIDI notes to accordion button positions and UI metadata.
 */

import { getLayout, type AccordionSystem, type ButtonPosition } from '../constants/layouts'
import { midiToFrenchName, midiToColor } from '../constants/notes'

/**
 * Represents a MIDI note mapped to its physical button position and display info.
 */
export type MappedNote = ButtonPosition & {
  /** The MIDI note number */
  midiNote: number
  /** The note's name in French (e.g., "Do") */
  frenchName: string
  /** The note's assigned Boomwhacker color */
  color: string
}

/**
 * Service class that converts MIDI note numbers to physical button positions.
 * Scoped to a specific accordion system (C or B).
 */
export class NoteMapper {
  private layout: Map<number, ButtonPosition>

  /**
   * Creates a new NoteMapper for the specified system.
   * @param system - The accordion system to use for mapping.
   */
  constructor(system: AccordionSystem) {
    this.layout = getLayout(system)
  }

  /**
   * Returns button position + display info for a MIDI note.
   * @param midiNote - The MIDI note number.
   * @returns MappedNote object or null if the note is out of the accordion's range.
   */
  map(midiNote: number): MappedNote | null {
    const pos = this.layout.get(midiNote)
    if (!pos) return null
    return {
      ...pos,
      midiNote,
      frenchName: midiToFrenchName(midiNote),
      color: midiToColor(midiNote),
    }
  }

  /**
   * Updates the accordion system (called when user toggles C/B in settings).
   * @param system - The new accordion system to use.
   */
  setSystem(system: AccordionSystem): void {
    this.layout = getLayout(system)
  }
}
