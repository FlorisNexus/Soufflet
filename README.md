# 🪗 Soufflet

**Soufflet** (French for *Bellows*) is a web app that helps Florian learn his grandfather's **chromatic button accordion** (Sabatini Musette Doré, Belgian/French Continental C-system) — without solfège, without staff, and without theory.

It listens through the microphone, names every note you play in real time, and shows you exactly *where* on your accordion that note lives — including all the alternative fingerings.

## ✨ Features

### 🎯 Calibration
On first launch, the app calibrates itself to your accordion: play your reference button, the app figures out whether you're on a C-system or B-system, and remembers it forever. Recalibrate anytime from the home screen if you switch instruments.

### 🎤 Free Play mode (`/free`) — the daily-use mode
Play whatever you want. The app gives you, in real time:
- A **scrolling ribbon** (PianoRoll Canvas, 100 px/s) listing every note you just played, with its French name and octave (`Do 4`, `Sol# 5`, …).
- A **central readout** showing the current note's raw frequency in Hz and deviation from equal-temperament in cents (`Do 4 — 261.6 Hz — +5¢`) — cross-checkable against any online tuner.
- A **5-row keyboard visualisation** with **every** physical button that produces the played note highlighted. Principal candidates are filled with the note's color and pulse; mechanical duplicates (rows 4-5) are outlined only — so you learn that a Do, for instance, is reachable from two different positions on your accordion.
- A **WebAudio reference tone** button (▶ Référence) playing the equal-temperament target so you can compare by ear what you just played.

### 🎵 Player mode — the song-learning mode (carried over from the MVP)
Pick a song from the library and play it Synthesia-style: colored rectangles fall toward your keyboard, you press the button when each rectangle arrives, the mic confirms correct/wrong in real time. Slow the tempo down to 50%, speed up to 120%, track your accuracy across sessions. Built-in starters: *Au Clair de la Lune*, *Frère Jacques*, *La Marseillaise*, …

### 💾 Progress tracking
0–5 stars per song stored locally via `localStorage`. No account, no backend, no tracking.

## 📐 Florian's keyboard, in one sentence

Italian Continental C-system: **5 rows, 17/18/17/18/17 buttons, +3 semitones (minor third) per position**, the 3 principal rows being diminished-7th arpeggios that interlock to cover the chromatic scale. See [`docs/keyboard-layout.md`](docs/keyboard-layout.md) for the full picture with reference tables, examples, and how to play a C-major scale across the 3 rows.

## 🛠️ Tech Stack

- **Frontend:** [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Build:** [Vite 6](https://vitejs.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Audio in:** Web Audio API + [Pitchy](https://github.com/ianprime0509/pitchy) (YIN monophonic pitch detection, ~50 KB, ~30 ms latency)
- **Audio out (reference tone):** WebAudio `OscillatorNode` (sine, 10 ms attack / 50 ms release)
- **Rendering:** SVG (Keyboard) + HTML5 Canvas (Falling Notes, Piano Roll)
- **Testing:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) (98 tests across 14 files)
- **CI/CD:** GitHub Actions

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v22.12.0+
- [mkcert](https://github.com/FiloSottile/mkcert) (recommended — the microphone requires HTTPS even on localhost)

### Installation

```bash
git clone https://github.com/FlorisNexus/Soufflet.git
cd Soufflet
npm install
```

### (Recommended) Setup local HTTPS

```bash
mkcert -install
mkcert localhost
```

Vite detects `localhost.pem` / `localhost-key.pem` in the project root and serves over HTTPS automatically.

### Run the dev server

```bash
npm run dev
```

Open [https://localhost:5173](https://localhost:5173). On first launch you'll be redirected to the calibration screen — play your reference button (rangée 2 position 6 on a Sabatini-style accordion → should be a Do), confirm, and you're in.

## 🧪 Development

```bash
npm run test            # Watch mode (Vitest)
npm run test -- --run   # Single run (CI)
npm run lint            # ESLint + typescript-eslint
npm run build           # tsc -b + vite build (production)
```

For Windows users: the Vitest default `forks` pool can hang. Use `--pool=threads`:
```bash
npm run test -- --run --pool=threads
```

## 📖 Project Structure

```
src/
├── audio/
│   ├── MicrophoneManager.ts        getUserMedia + AudioContext lifecycle
│   ├── PitchDetector.ts            pitchy YIN wrapper (Float32 → {midi, Hz, clarity})
│   ├── NoteMapper.ts               MIDI → principal-row button position
│   └── AudioReferencePlayer.ts     WebAudio sine reference tone
├── constants/
│   ├── notes.ts                    MIDI ↔ French note names, Boomwhacker colors, Hz, cents
│   └── layouts.ts                  5-row Sabatini layout (THE source of truth)
├── display/
│   ├── ButtonLayout.tsx            SVG 5-row keyboard with principal/duplicate highlighting
│   ├── PianoRoll.tsx               Canvas scrolling ribbon (Free Play)
│   ├── FallingNotes.tsx            Canvas Synthesia-style falling rectangles (Player)
│   └── FeedbackOverlay.tsx         green/red flash overlay (Player)
├── hooks/
│   ├── useAudio.ts                 Coordinates mic + detector + mapper (Player)
│   ├── useFreePlaySession.ts       Wires the reducer to mic + RAF
│   ├── freePlayReducer.ts          Pure state machine (open/close/continue notes)
│   ├── useCalibration.ts           localStorage shape + system inference
│   └── usePlayerState.ts           BPM clock for song playback
├── pages/
│   ├── Home.tsx                    Song picker + Mode libre entry + Recalibrer button
│   ├── Player.tsx                  Player mode (song playback)
│   ├── FreePlay.tsx                Free Play mode (the new mode)
│   └── Calibration.tsx             First-launch C/B-system detection
├── songs/
│   ├── schema.ts                   TypeScript types
│   ├── library/*.json              Built-in songs
│   └── songLoader.ts               JSON import + validation
└── store/
    └── progressStore.ts            localStorage for play counts / star ratings

docs/
└── keyboard-layout.md              Detailed reference of Florian's accordion
```

## 📜 Documentation

- [`docs/keyboard-layout.md`](docs/keyboard-layout.md) — the precise layout of Florian's Sabatini accordion, with all 87 buttons mapped, the diminished-arpeggio logic explained, and notes for adapting the app to a different instrument.
- [`CHANGELOG.md`](CHANGELOG.md) — version history.
- [`CLAUDE.md`](CLAUDE.md) — architect notes (Claude).
- [`GEMINI.md`](GEMINI.md) — agent instructions (Gemini).

## 🤝 Contribution

This is a personal project under the **FlorisNexus** organization, primarily built for Florian's own learning journey. Architectural feedback and pull requests welcome.

## 📄 License

MIT © 2026 FlorisNexus.
