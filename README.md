# Stray Saga

A browser-based RPG where you play as a stray cat navigating a city neighborhood. Choose your cat's archetype, explore the map, encounter scenarios, manage your stats (Energy, Warmth, Trust), and find your way to safety — or not.

---

## Prerequisites

Before running the project, make sure you have the following installed:

- **Node.js** v18 or higher — [https://nodejs.org](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
- A modern browser (Chrome, Firefox, Edge, Safari)

To verify your versions:

```bash
node -v
npm -v
```

---

## Required Configuration

The game uses the **Google Generative AI (Gemini)** API to generate contextual inner-monologue lines for your cat during scenarios. This feature is optional — the game works fully without it, but the AI lines won't appear.

### Get a free API key (it's totally okay to skip this, the game will still run properly:>>)

1. Go to [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with a Google account
3. Click **Create API key** and copy it

### Set up the environment file (You can skip this too)

Create a file named `.env` in the `StraySaga/` project root (same folder as `package.json`):

```
VITE_GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with the key you copied from AI Studio.

> **Note:** If you skip this step, the game still runs — the AI dialogue feature simply falls back silently and no inner-monologue lines are shown during scenarios.

> **Free tier limits:** Gemini 2.0 Flash offers 1,500 free requests/day and 1M tokens/minute. A typical play session uses well under this limit.

---

## Installation

From the `StraySaga/` directory, install dependencies:

```bash
cd StraySaga
npm install
```

---

## Running the Game

Start the development server:

```bash
npm run dev
```

Then open your browser and navigate to:

```
http://localhost:3000
```

The page hot-reloads automatically when you save changes to source files.

---

## Running Tests

Run the test suite once (unit tests + property-based tests):

```bash
npm test
```

To open the interactive test UI in your browser:

```bash
npm run test:ui
```


## Project Structure

```
StraySaga/
├── public/             # Static assets (map, cat sprites, environment images)
├── src/
│   ├── assets/         # UI assets (backgrounds, buttons)
│   ├── components/     # React components (GameMap, ScenarioDialog, AvatarSelection, etc.)
│   ├── data/           # Static story and scenario data
│   ├── utils/          # Game logic, AI dialogue, map helpers, audio
│   └── types.ts        # Shared TypeScript types
├── .env                # Local environment variables (not committed — you must create this)
├── index.html
├── package.json
└── vite.config.ts
```

---

## Gameplay Overview

1. **Name your cat** on the intro screen and click Begin Journey
2. **Pick an archetype** — Forager, Cautious, Rogue, or Innocent — each with different starting stats
3. **Explore the map** — click waypoints to trigger scenarios and manage AP (action points)
4. **Make choices** in scenarios — outcomes depend on your current Energy, Warmth, and Trust
5. **Survive** until the turn limit or reach the ending condition

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `npm install` fails | Make sure Node.js v18+ is installed |
| Port 3000 already in use | Kill the process using port 3000, or edit `package.json` dev script to use a different port |
| AI lines not showing | Check that `.env` exists and `VITE_GEMINI_API_KEY` is set correctly |
| Blank screen on load | Open browser DevTools console and check for errors; ensure `npm install` completed successfully |
