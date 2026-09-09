# PT Ops

An offline-first military-style bodyweight training app, built as an installable PWA. Guided
workouts with a timer and animated form illustrations, multi-week plans, a scored PT test, and a
training log with streaks and body-weight tracking.

It exists as an alternative to a subscription fitness app: everything runs on the device, there is
no account, no backend and no network traffic after the first load.

**Live: https://tobbou.github.io/pt-ops/**. Open it on a phone and add it to the home screen.

## Why it is built this way

- **No images or video.** Every exercise animation is drawn from joint angles by a small forward
  kinematics rig ([src/lib/pose.ts](src/lib/pose.ts)). An exercise is a handful of numbers, which is
  what lets the whole app precache to under 300 KB and run in flight mode.
- **No backend.** The training log is a few kilobytes of JSON in `localStorage`. That removes
  hosting cost, sign-in, and a privacy policy, at the price of the log being tied to one browser
  profile; Settings has export and restore for that.
- **One workout definition per session, scaled at runtime.** Difficulty (Recruit / Soldier /
  Special Forces) and the weekly ramp inside a plan are multipliers applied when the session is
  expanded into steps, rather than three copies of every workout.

## Tech stack

| Piece | Choice |
| --- | --- |
| Build | Vite 5 |
| UI | React 18 + TypeScript, no UI framework |
| Routing | ~40 lines of hash routing ([src/lib/router.ts](src/lib/router.ts)) |
| State | `useReducer` + context, persisted to `localStorage` |
| Charts | Hand-rolled inline SVG ([src/components/charts.tsx](src/components/charts.tsx)) |
| Offline | `vite-plugin-pwa` (Workbox `generateSW`, precache everything) |
| Hosting | GitHub Pages via GitHub Actions |

## Repository layout

```
src/
  lib/          pose rig, router, audio cues, wake lock, formatting, plan logic
  data/         exercises (58), workouts (12), plans (3), PT test standards
  state/        the single persisted store
  components/   Figure, charts, shared UI
  screens/      Today, Plans, Workouts, Player, Progress, Library, PT Test, Settings
scripts/        icon generation
Docs/           architecture, local development, configuration, operations
```

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173/pt-ops/
```

Full detail, including how to test on a phone, is in
[Docs/Local-Development.md](Docs/Local-Development.md).

## Deploy

Push to `main`. The [Pages workflow](.github/workflows/deploy.yml) type-checks, builds with
`BASE_PATH` set from the repository name, and publishes `dist/`. See
[Docs/Operations.md](Docs/Operations.md) for first-time setup and for hosting somewhere other than
GitHub Pages.

The repository is public because GitHub Pages does not serve private repositories on the Free
plan. Nothing sensitive is published by that: there are no keys in the repository, and the training
log never leaves the device it was recorded on.

## Documentation

| Document | Contents |
| --- | --- |
| [Docs/Architecture.md](Docs/Architecture.md) | The pose rig, the workout model, state, offline strategy |
| [Docs/Local-Development.md](Docs/Local-Development.md) | Running it, testing on a phone, the pose contact sheet |
| [Docs/Configuration.md](Docs/Configuration.md) | Every setting, where it lives, what is stored |
| [Docs/Operations.md](Docs/Operations.md) | Deploy, install on a phone, backup, troubleshooting |
| [Docs/Content.md](Docs/Content.md) | Adding exercises, workouts and plans |

## A note on the numbers

Calorie figures are MET estimates from body weight and time, not measurements. The PT test scoring
uses fixed anchors loosely modelled on the US Army APFT and is meant for tracking your own trend,
not for comparing against a real standard. This is not medical advice.
