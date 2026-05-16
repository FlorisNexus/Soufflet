# Changelog — Soufflet

## [Unreleased]

### Added
- **Free Play mode** (`/free`): real-time scrolling ribbon (PianoRoll Canvas, 100 px/s, time-accurate continuous scroll) annotating every detected note with its French name + octave, raw frequency in Hz, and deviation in cents — cross-checkable against any online tuner.
- **Audio reference player**: WebAudio sine oscillator triggered from a "▶ Référence" button and from clicks on PianoRoll blocks. Gated by a per-page toggle (off by default). 10 ms attack / 50 ms release envelope, 1 s duration cap, single-tone-at-a-time policy.
- **5-row keyboard layout**: `ButtonLayout` now renders the full 5-row C/B-system grid. Principal candidates (rows 0–2) are filled with the note's color and pulse on hit; duplicate candidates (rows 3–4) are outlined only. Multi-position highlight — every button that produces the played MIDI lights up at once.
- **First-launch calibration** (`/calibrate`): listens for a stable pitch on the user's reference button ("2nd row, 6th from the top"), infers C-system (pitch class = 0) or B-system (pitch class = 11), persists in `localStorage` under `soufflet.calibration`. Manual fallback after 10 s.
- "Mode libre" entry on the home screen + "Recalibrer le clavier" footer button.
- New helpers in `src/constants/notes.ts`: `equalTempHz(midi)`, `centsFromHz(detected, midi)`, `midiToFrenchNameWithOctave(midi)`.
- New layout helpers in `src/constants/layouts.ts`: `getAllButtons(system)` (5-row × 21 buttons) and `getButtonsForMidi(system, midi)` (all candidate positions for a played MIDI value).

### Changed
- `ButtonLayout` props: replaced `activeButtonPosition` + `onSystemChange` with a single `activeMidi: number | null`. The system is now decided at calibration time and passed top-down from `App`.
- `Player` accepts `system` as a prop (calibration-driven) and tracks session stats in `useState` rather than refs (fixes lint/refs-in-render violations).
- `FallingNotes` constants aligned with the new 5-row `ButtonLayout` spacing.
- `useCalibration` reads `localStorage` synchronously via the lazy useState initializer — no loading flicker.
- `usePlayerState`: `tick` recursion broken via `tickRef` (fixes self-reference lint violation).
- `useAudio` cleanup: snapshots refs inside the effect to satisfy `react-hooks/exhaustive-deps`.

### Fixed
- Multiple `react-hooks/refs` violations in `Player.tsx` (precision percentage now derived from state).
- Removed unused `eslint-disable` directive in `PitchDetector.ts`.
- `test-setup.ts`: dropped `as any` in favour of a typed mock context including `setTransform`, `fillRect`, `strokeRect`, and style accessors needed by the PianoRoll Canvas code.

### Calibration patch (Florian's Sabatini, real-world data)
- **Keyboard layout corrected** to match Florian's actual Sabatini Musette Doré (Italian Continental, not German Bayan as initially assumed):
  - Each row is a **diminished-seventh arpeggio** (+3 semitones per position), not a whole-tone scale.
  - Row counts: **17, 18, 17, 18, 17** (alternating, staggered) instead of 21 across the board.
  - Row 0 (rangée 1) starts at Si♭2 (46), row 1 (rangée 2) at La2 (45), row 2 (rangée 3) at Si2 (47).
  - Row 3 (rangée 4) is a mechanical duplicate of row 0 (1:1 mapping, position 18 is an orphan extrapolation).
  - Row 4 (rangée 5) is a mechanical duplicate of row 1 **offset by +1 position** (rangée 5 pos 1 = rangée 2 pos 2 = Do3).
- New constants in `layouts.ts`: `SEMITONES_PER_POSITION`, `BUTTONS_PER_ROW_LAYOUT`, `MAX_BUTTONS_PER_ROW`.
- Existing tests updated to assert the new pitches; 8 empirical calibration points encoded as regression tests.

### Documentation
- New `docs/keyboard-layout.md` — exhaustive reference of Florian's keyboard with reference tables (all 87 buttons), chromatic-coverage proof, mechanical-duplicate explanation, a "play a C-major scale" example, and notes for adapting the app to a different accordion.
- `README.md` rewritten to reflect the new Free Play mode, the corrected keyboard layout, the directory structure, and the calibration flow.

### Keyboard orientation (vertical, first-person view)
- `ButtonLayout` now defaults to `orientation="vertical"`: rows are vertical columns (rangée 1 = rightmost), positions run top-to-bottom (lowest pitch at top). The 18-button rows are staggered down by half a step to match the physical interleaving.
- `Player.tsx` explicitly passes `orientation="horizontal"` to preserve FallingNotes alignment until that mode is redesigned.
- `FreePlay.tsx` now uses a two-column desktop layout: left column (PianoRoll + readout + controls) + right column (vertical keyboard). Single-column on mobile with the keyboard below.
- Fixed layout instability where the central readout changing from `—` to `Do 4` would shift the keyboard column — the readout section now has a fixed height (`h-28`).

### Notes
- Spec: `30 Repos/conductor/plans/soufflet/soufflet-spec-freeplay-2026-05.md`.
- Plan: `30 Repos/conductor/plans/soufflet/soufflet-plan-freeplay-2026-05.md`.
- Test coverage: 98 passing tests across 14 files.

## [Initial Scaffold]

### Added
- Project scaffold (Vite + React + TS + Tailwind CSS 4)
