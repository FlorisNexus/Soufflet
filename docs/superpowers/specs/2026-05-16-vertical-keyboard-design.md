# Vertical Keyboard Layout — Design Spec

**Project:** Soufflet
**Created:** 2026-05-16 22:47
**Status:** Approved

---

## Summary

Rotate the `ButtonLayout` SVG from horizontal (rows stacked top-to-bottom, positions left-to-right) to **vertical** (rows side-by-side left-to-right, positions top-to-bottom). The new orientation matches what the player sees when they look down at their accordion: rangée 1 (the outermost row) on the right, position 1 (the lowest note) at the top.

---

## User Story

As Florian learning his accordion, I want the on-screen keyboard to look like what I see when I look at my own instrument, so that the mental mapping between screen and hand is immediate and requires no mental rotation.

---

## Section 1 — Layout Design

**New geometry (first-person view):**

```
          ← LEFT (rangée 5)          RIGHT (rangée 1) →
          ____  ____  ____  ____  ____
pos 1 → | Bb | La | Si | Bb | Do |    (lowest notes, top)
pos 2 → | C# | Do | Ré | C# | D# |
pos 3 → | Mi | D# | Fa | Mi | F# |
  ...       ...   ...   ...
pos17 → | Bb | ... |    |    | Do |    (highest notes, bottom)
```

- **X axis:** rows (rangée 1 = rightmost, rangée 5 = leftmost). `cx = H_PADDING + (ROW_COUNT - 1 - row) * ROW_GAP + BTN_RADIUS`
- **Y axis:** positions within a row (position 1 = top). `cy = V_PADDING + col * V_GAP + (18-btn row ? STAGGER : 0) + BTN_RADIUS`
- **Stagger:** rows 1 and 3 (18-btn) are shifted down by `V_GAP / 2` so their buttons interleave visually with the adjacent 17-btn rows.

**Target dimensions (fits most laptop screens without scrolling):**
- `BTN_RADIUS = 14`, `ROW_GAP = 38`, `V_GAP = 28`, `STAGGER = 14`, `H_PADDING = 20`, `V_PADDING = 20`
- SVG width ≈ 220 px, height ≈ 530 px

---

## Section 2 — Backward Compatibility

Two modes are needed because Player mode has `FallingNotes` whose x-coordinates are aligned with the *current* horizontal keyboard:

- `ButtonLayout` gains an optional prop `orientation: 'horizontal' | 'vertical'` defaulting to **`'vertical'`** (new default).
- `Player.tsx` explicitly passes `orientation="horizontal"` to preserve the falling-note alignment.
- `FreePlay.tsx` uses the default (vertical).
- The horizontal formulas stay untouched in the `'horizontal'` branch — zero regression risk on the Player.

The Player / FallingNotes alignment will need its own redesign later (separate scope).

---

## Section 3 — Layout changes in FreePlay.tsx

With the keyboard now tall and narrow (~220 × 530 px), `FreePlay.tsx` switches from a full-width footer keyboard to a **two-column layout** on desktop:

```
┌──────────────────────────────────────────────────┐
│ ← header                                         │
├────────────────────────────┬─────────────────────┤
│  PianoRoll (flex-1)        │                     │
├────────────────────────────┤  Keyboard SVG       │
│  Central readout + ▶ Ref   │  (vertical, right)  │
├────────────────────────────┤                     │
│  Footer controls           │                     │
└────────────────────────────┴─────────────────────┘
```

On mobile (< 768 px) the keyboard collapses below the readout (single-column, scrollable).

---

## Section 4 — Tests

- Update `ButtonLayout.test.tsx`: pass `orientation="vertical"` explicitly and keep assertions on `data-state` attributes (these don't depend on geometry).
- Add one test asserting the SVG height > width when `orientation="vertical"` (smoke check that the rotation happened).
- No change to logic-level tests (`layouts.test.ts`, `freePlayReducer.test.ts`, etc.).

---

## Out of Scope

- Player / FallingNotes alignment with the new vertical keyboard → separate future task.
- Left-hand (Stradella bass) keyboard → V2.
- Auto-scroll to the active note range → V2.

---

## Validation

Design confirmed verbally by Florian during the 2026-05-16 session ("ok pour moi").
