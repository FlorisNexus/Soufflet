import { describe, it, expect } from 'vitest'
import { midiToFrenchName, midiToColor, midiToOctave, frequencyToMidi } from './notes'
import { getLayout, C_SYSTEM_LAYOUT } from './layouts'

describe('midiToFrenchName', () => {
  it('maps Do4 (60) to "Do"', () => expect(midiToFrenchName(60)).toBe('Do'))
  it('maps Ré4 (62) to "Ré"', () => expect(midiToFrenchName(62)).toBe('Ré'))
  it('maps Mi4 (64) to "Mi"', () => expect(midiToFrenchName(64)).toBe('Mi'))
  it('maps Do5 (72) to "Do" (octave wrap)', () => expect(midiToFrenchName(72)).toBe('Do'))
  it('maps Do#4 (61) to "Do#"', () => expect(midiToFrenchName(61)).toBe('Do#'))
})

describe('midiToColor', () => {
  it('returns a hex color string for every semitone', () => {
    for (let i = 0; i < 12; i++) {
      expect(midiToColor(60 + i)).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
  it('same semitone class gives same color across octaves', () => {
    expect(midiToColor(60)).toBe(midiToColor(72)) // Do4 and Do5
  })
})

describe('midiToOctave', () => {
  it('Do4 (60) is octave 4', () => expect(midiToOctave(60)).toBe(4))
  it('La4 (69) is octave 4', () => expect(midiToOctave(69)).toBe(4))
})

describe('frequencyToMidi', () => {
  it('La4 = 440 Hz → MIDI 69', () => expect(frequencyToMidi(440)).toBe(69))
  it('La5 = 880 Hz → MIDI 81', () => expect(frequencyToMidi(880)).toBe(81))
  it('Do4 ≈ 261.63 Hz → MIDI 60', () => expect(frequencyToMidi(261.63)).toBe(60))
})

describe('C-system layout', () => {
  it('covers all 12 semitone classes', () => {
    const semitones = new Set<number>()
    C_SYSTEM_LAYOUT.forEach((_, midi) => semitones.add(midi % 12))
    expect(semitones.size).toBe(12)
  })

  it('Do4 (60) has a position in C-system', () => {
    expect(C_SYSTEM_LAYOUT.has(60)).toBe(true)
  })

  it('getLayout returns different layouts for C and B', () => {
    const c = getLayout('C')
    const b = getLayout('B')
    const pos60c = c.get(60)
    const pos60b = b.get(60)
    expect(pos60c).not.toEqual(pos60b)
  })
})
