# Soufflet — Architect Notes (CLAUDE.md)

## Context

Personal project for Florian to learn his grandfather's accordion (Michel Sabatini Musette Doré, chromatic button, C-system likely).

## Open questions

- [x] ~~Confirm C-system vs B-system~~ — resolved via the first-launch calibration flow (`src/pages/Calibration.tsx` + `src/hooks/useCalibration.ts`). Persisted in `localStorage.soufflet.calibration`.
- [x] ~~Exact row count of the Sabatini right hand~~ — keyboard now renders **5 rows × 21 buttons** (rows 0–2 principal, rows 3–4 duplicates shifted by a minor third). Florian's reference: Do = row 2, position 6 from the top.

## V2 backlog

- Left hand (Stradella bass system)
- Song import (MusicXML)
- Polyphonic detection (CREPE / TensorFlow.js)
- User accounts / cross-device sync
- Accompaniment mode
