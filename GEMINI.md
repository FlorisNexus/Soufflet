# Soufflet — Developer Instructions (GEMINI.md)

## Project

Web app teaching chromatic button accordion (right hand) via Synthesia-style falling notes + mic validation. No solfège, no backend.

## Stack

Vite 6 · React 19 · TypeScript 5 · Tailwind CSS 4 · pitchy · Web Audio API · Vitest

## Rules

- **Max 200 lines per file.** Split by responsibility if a file grows beyond this.
- **Every file starts with a one-line comment** explaining its purpose and WHY.
- **TDD for pure logic** (NoteMapper, progressStore, songLoader). Visual components: manual test.
- **No solfège in the UI** — never show staff notation, clefs, or beat names (croche etc.).
- **French UI** — all user-visible strings in French.

## Angular → React Reference

| Angular | React (this project) |
|---|---|
| @Injectable Service | Custom hook in `src/hooks/` or plain TS module |
| ngOnInit | `useEffect(() => { ... }, [])` |
| ngOnDestroy | `return () => cleanup()` inside useEffect |
| @Input() | Function component props |
| BehaviorSubject | `useState` |

## Key architectural decisions

- **Pitch detection on main thread** (not AudioWorklet) — simpler, sufficient latency (~40ms)
- **pitchy** for pitch detection (McLeod Pitch Method, monophonic only)
- **SVG** for button layout (resolution-independent, animatable)
- **Canvas** for falling notes (60fps imperative animation)
- **localStorage** for progress (no backend in MVP)

## Commands

```bash
npm run dev      # dev server https://localhost:5173
npm run build    # production build
npm test         # watch mode
npm test -- --run  # CI mode (run once)
```

## Local HTTPS (SSL)

The project is configured to use HTTPS in development for better alignment with browser APIs (like Web Audio).
To set it up:

1. Install [mkcert](https://github.com/FiloSottile/mkcert).
2. Run `mkcert -install` (once per machine).
3. In the project root, run: `mkcert localhost`.
4. Vite will automatically detect `localhost.pem` and `localhost-key.pem` and start in HTTPS mode.
