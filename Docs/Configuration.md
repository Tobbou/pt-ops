# Configuration

There is no configuration file, no environment file and no secret anywhere in this project. What
follows is the complete list of everything configurable.

## Build-time

| Variable | Where | Default | Purpose |
| --- | --- | --- | --- |
| `BASE_PATH` | Environment, read in `vite.config.ts` | `/pt-ops/` | Public base path. GitHub Pages serves a project site from `/<repo>/`, so the workflow sets it from the repository name. Set it to `/` for a custom domain or a root deployment. |

It feeds three things that must agree: Vite's `base`, the manifest's `start_url` and `scope`, and
the service worker's `navigateFallback`. Changing one by hand and not the others produces an app
that installs but opens on a blank page.

## User settings

Stored in `localStorage` under `pt-ops.state.v1`, editable in the Settings screen.

| Setting | Default | Effect |
| --- | --- | --- |
| Difficulty | Soldier | Multiplier applied to work, rest and round count of every workout |
| Weight (kg) | 82 | Only used for the MET calorie estimate |
| Height (cm) | 180 | Recorded, not currently used in any calculation |
| Sound cues | on | Web Audio beeps on the last three seconds and at every change |
| Spoken cues | on | Speech synthesis announces the next exercise |
| Vibration | on | Short buzz at every change, where the browser allows it |
| Keep the screen on | on | Screen Wake Lock for the length of a session |
| Show what is next during rest | on | Names the upcoming exercise on the rest screen |
| Get-ready countdown | 5 s | Seconds before the first exercise; 0 disables it |

## What is stored on the device

The whole state object, in one `localStorage` key:

| Key | Contents |
| --- | --- |
| `profile` | Weight, height, difficulty |
| `settings` | The table above |
| `sessions` | One record per completed session: date, workout, duration, kcal, sets, exercises |
| `metrics` | One record per day you logged a measurement: weight, waist, chest, arm |
| `ptResults` | PT test results and scores |
| `plan` | The active plan, its start date, and which day indices are completed |
| `onboarded` | Whether the intro has been dismissed |

Nothing is transmitted anywhere. There is no analytics, no error reporting and no font or CDN
request at runtime.

**This is not a secret store.** It is readable by anything with access to that browser profile, and
it is deleted if the site's data is cleared or the app is uninstalled. Use Settings → Export backup
before wiping a phone.

## Loading and migration

`load()` in `src/state/store.tsx` merges the stored object over `INITIAL_STATE` rather than
trusting it, so a build that adds a setting reads correctly against state written by an older
build. Parse failures fall back to defaults rather than throwing.

If a future change makes old state genuinely unreadable, bump the key (`pt-ops.state.v2`) and
migrate explicitly in `load()`, rather than changing the shape under the old key.
