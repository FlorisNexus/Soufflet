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

### Notes
- Spec: `30 Repos/conductor/plans/soufflet/soufflet-spec-freeplay-2026-05.md`.
- Plan: `30 Repos/conductor/plans/soufflet/soufflet-plan-freeplay-2026-05.md`.
- Test coverage: 88 passing tests across 14 files.

## [Initial Scaffold]

### Added
- Project scaffold (Vite + React + TS + Tailwind CSS 4)
