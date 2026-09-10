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
| `npm run poses` | Render every category's pose contact sheet to `out/poses/` |
| `npm run check:poses` | Validate every animation numerically; non-zero exit on a defect |

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

Two ways to look at the poses, which are raw joint angles and cannot be reviewed by reading them:

```bash
npx tsx scripts/render-poses.ts --category core              # out/poses/core.png
npx tsx scripts/render-poses.ts --exercise sit-up --samples 8 # out/poses/sit-up.png
```

writes PNG contact sheets headless, with the authored keyframes boxed and the interpolated
in-betweens after each, so both the poses and the motion are visible. Long sequences wrap;
`--cols` sets the width. `#/dev-poses` in the dev server shows the same thing live and only
exists in dev builds.

Looking catches what is ugly. For what is *wrong*, run the validator:

```bash
npm run check:poses              # all 58, exits non-zero on a defect
npx tsx scripts/check-poses.ts --category core --verbose
```

It samples each cycle at 240 points, not just the keyframes, because the in-betweens are where
limbs sink through the floor. It checks floor penetration, joint range, contact drift, frame
bounds and front-view symmetry. Contacts that legitimately relocate (a step, a jump, the
inchworm walking out) are listed in `ACCEPTED_TRAVEL` in the script with their measured
distance, so only a worsening fails. Use both tools after touching `src/data/poses.ts`,
anything under `src/data/exercises/`, or the rig itself. The authoring checklist is in
[Content.md](Content.md).

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
