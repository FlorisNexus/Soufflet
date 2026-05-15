// NoteMapper.ts — converts a MIDI note number to the physical button position on the accordion
// and enriches it with display info (French name, color) for the UI
import { getLayout, type AccordionSystem, type ButtonPosition } from '../constants/layouts'
import { midiToFrenchName, midiToColor } from '../constants/notes'

export type MappedNote = ButtonPosition & {
  midiNote: number
  frenchName: string
  color: string
}

export class NoteMapper {
  private layout: Map<number, ButtonPosition>

  constructor(system: AccordionSystem) {
    this.layout = getLayout(system)
  }

  /** Returns button position + display info for a MIDI note, or null if out of range */
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

  /** Updates the accordion system (called when user toggles C/B in settings) */
  setSystem(system: AccordionSystem): void {
    this.layout = getLayout(system)
  }
}
