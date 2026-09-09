# Operations

## First-time deploy to GitHub Pages

1. Create the repository and push. The `base` default assumes it is called `pt-ops`; any other name
   works too, because the workflow sets `BASE_PATH` from the repository name.
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**. Without
   this the workflow fails at the deploy step.
3. Push to `main`. The workflow type-checks, builds and publishes.
4. The URL is `https://<user>.github.io/<repo>/`.

A private repository can publish Pages on a paid GitHub plan; on the free plan the repository has
to be public for Pages to serve. Nothing in this app is sensitive, but the training log is not
published either way: it lives only in the browser.

## Installing it on a phone

- **Android / Chrome:** open the URL, then menu → *Install app* (or *Add to Home screen*). It
  installs as a standalone app with the manifest icon.
- **iPhone / Safari:** open the URL, tap the share button, then *Add to Home Screen*. Safari only
  offers this from Safari itself, not from an in-app browser.

After installing, open it once with a connection so the service worker precaches. From then on it
works in flight mode.

To confirm it really is offline-capable: put the phone in flight mode and open the app from the
home screen. It should start normally, including the exercise animations.

## Updating

Push to `main`. `registerType: 'autoUpdate'` means the installed app fetches the new service worker
in the background and swaps to it on the next launch. There is no in-app update prompt by design.

If a phone appears stuck on an old version, close the app completely (swipe it away) and reopen it
twice: once to install the new worker, once to run it.

## Backup and restore

Settings → **Export backup** writes a JSON file of the whole state. **Restore** reads one back and
replaces the current state.

Do this before wiping a phone, changing browser, or clearing site data. There is no other copy.

A restore is destructive: it replaces the current state rather than merging. Export the current
state first if there is anything in it worth keeping.

## Hosting somewhere else

Nothing here is GitHub-specific except the workflow.

- **Cloudflare Pages / Netlify / any static host:** build command `npm run build`, output directory
  `dist`, and set `BASE_PATH=/` if the app is served from the domain root.
- **A subdirectory of an existing site:** set `BASE_PATH=/that/path/`.
- **Azure Static Web Apps:** same build output; set `BASE_PATH=/`, and remember the region standard
  is `swedencentral`.

The only hard requirement is HTTPS. Service workers, the install prompt and the Wake Lock API all
require a secure context, and without them it is a website rather than an app.

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Blank page after deploy, 404s on the JS bundle | `BASE_PATH` does not match the served path | Rebuild with the right `BASE_PATH`; check the manifest's `start_url` matches |
| No install option in Chrome | Not HTTPS, or the manifest icons failed to load | Check the manifest in DevTools → Application; run `npm run icons` if the PNGs are missing |
| Screen dims mid-workout | Wake Lock unsupported (iOS below 16.4) or denied on low battery | Nothing to fix in the app; Settings names the limitation |
| Silent timer on iPhone | Audio context suspended, or the ring/silent switch | Audio unlocks on the tap that starts the workout; check the hardware switch |
| Spoken cues cut off | Speech synthesis was cancelled by a pause | Expected: pausing stops speech deliberately |
| Timer drifted while the screen was off | Background tabs are throttled | Not a real drift: the timer works from a wall-clock deadline and catches up on resume |
| Log gone after clearing browser data | The log lives in `localStorage` | Restore from a backup; there is no server copy |

## Monitoring

There is none, deliberately. No analytics, no error reporting, no logging endpoint. If something
breaks, reproduce it with `npm run preview` and the browser console.
