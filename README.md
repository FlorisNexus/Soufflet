# 🪗 Soufflet

**Soufflet** (French for *Bellows*) is a modern web application designed to help musicians learn the **chromatic button accordion** (right hand) without the need for traditional music theory or solfège.

Inspired by visual learning tools like *Synthesia*, it uses a real-time pitch detection engine to provide instant feedback as you play your physical instrument.

## ✨ Features

- **Falling Notes Visualization:** Intuitive Canvas-based animation showing upcoming notes, durations, and timing.
- **Real-time Pitch Detection:** Uses the microphone and the `pitchy` library (YIN method) to detect what you play with high precision and low latency.
- **Dynamic Accordion Keyboard:** High-fidelity SVG rendering of the chromatic button layout (supporting both **C-System** and **B-System**).
- **Interactive Feedback:** 
    - **Target Highlighting:** The exact button to press pulses on the screen.
    - **Live Validation:** Instant visual cues (Green/Red) indicating if you hit the correct note.
- **Progress Tracking:** Saves your play counts and best scores (0-5 stars) locally using `localStorage`.
- **Customizable Tempo:** Slow down the music (50% to 120%) to learn at your own pace.
- **Built-in Song Library:** Includes classic starters like *Au Clair de la Lune*, *Frère Jacques*, *La Marseillaise*, and more.

## 🛠️ Tech Stack

- **Frontend:** [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 6](https://vitejs.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Audio:** Web Audio API + [Pitchy](https://github.com/mary-p0ppins/pitchy)
- **Rendering:** SVG (Keyboard) + HTML5 Canvas (Animations)
- **Testing:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **CI/CD:** GitHub Actions

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v22.12.0 or higher recommended)
- [mkcert](https://github.com/FiloSottile/mkcert) (optional, for local HTTPS)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/FlorisNexus/Soufflet.git
   cd Soufflet
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **(Recommended) Setup Local HTTPS:**
   Browser APIs like the Microphone often require a **Secure Context**.
   ```bash
   mkcert -install
   mkcert localhost
   ```
   Vite will automatically detect `localhost.pem` and `localhost-key.pem` in the root and serve over HTTPS.

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [https://localhost:5173](https://localhost:5173) in your browser.

## 🧪 Development

### Running Tests
The project follows a TDD approach for business logic.
```bash
npm run test           # Watch mode
npm run test -- --run  # CI mode (single run)
```

### Production Build
```bash
npm run build
```

### Formatting & Linting
```bash
npm run lint
```

## 📖 Project Structure

- `src/audio/`: Core audio logic (Mic management, Pitch detection, Note mapping).
- `src/constants/`: MIDI mappings, color palettes, and physical accordion layouts.
- `src/display/`: Visual components (Canvas animation, SVG Keyboard, Overlays).
- `src/hooks/`: Custom React hooks coordinating state and services.
- `src/pages/`: Main application screens (Home and Player).
- `src/songs/`: JSON library of songs and data schemas.

## 🤝 Contribution

This is a personal project under the **FlorisNexus** organization. While primarily built for Florian's learning journey, feedback and architectural insights are always welcome.

## 📄 License

MIT © 2026 FlorisNexus.
