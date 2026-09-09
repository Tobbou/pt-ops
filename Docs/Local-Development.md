# Local development

## Prerequisites

- Node.js 20 or newer (developed on 24)
- npm 10 or newer

No database, no services, no secrets.

## Running it

```bash
npm install
npm run dev
```

Vite serves on `http://localhost:5173/pt-ops/`. The path matters: `base` is set to `/pt-ops/`
because GitHub Pages serves a project site from a subpath, and the dev server mirrors it so the
two behave the same.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type check, then production build into `dist/` |
| `npm run preview` | Serve `dist/` on the network, service worker included |
| `npm run typecheck` | Type check only |
| `npm run icons` | Re-render the app icons from `scripts/generate-icons.mjs` |

The service worker is disabled in dev (`devOptions.enabled: false`). Anything about offline
behaviour, installability or update flow has to be tested against `npm run preview`.

## Testing on a phone

The Wake Lock API, the install prompt and the audio unlock all behave differently on a real device,
so test there before believing a change works.

```bash
npm run build
npm run preview      # binds to 0.0.0.0, prints a Network URL
```

Open the Network URL on a phone on the same Wi-Fi. Note that an install prompt and the Wake Lock
API both require a secure context: `http://` over LAN gives you the app but not installability. For
the full experience either deploy to Pages and test there, or put a TLS-terminating tunnel in front
of the preview server.

## The pose contact sheet

`#/dev-poses` renders every exercise and every keyframe large, in a grid. It only exists in dev
builds. Use it after touching `src/data/poses.ts`, `src/data/exercises.ts` or the rig itself: the
poses are raw joint angles and the only reliable way to catch a limb bent the wrong way is to look
at all of them.

## Seeding a log for UI work

The progress screen is empty on a fresh install, which makes the charts hard to work on. Paste this
in the browser console, then reload:

```js
const key = 'pt-ops.state.v1'
const s = JSON.parse(localStorage.getItem(key))
const iso = (d) => d.toISOString().slice(0, 10)
s.sessions = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - i)
  return { id: 's' + i, date: iso(d), workoutId: 'daily-pt', workoutName: 'Daily PT',
    difficulty: 'soldier', durationSec: 1200, workSec: 800, kcal: 210,
    completedSteps: 24, totalSteps: 26, exercises: [] }
})
localStorage.setItem(key, JSON.stringify(s))
```

Settings has "Erase all data" to get back to a clean state.

## Conventions

- TypeScript strict, including `noUnusedLocals`. The build fails on an unused import.
- No CSS framework. `src/styles.css` holds design tokens at the top and component classes below.
- Comments explain why a thing is the way it is, not what the line does. The pose numbers are the
  exception: they carry the geometry they were solved for.
