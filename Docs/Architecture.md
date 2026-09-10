# Architecture

A single-page React app with no server component. Everything below the "the pose rig" section is
ordinary; the rig is the part worth reading before changing anything.

## Layers

```
screens/        one file per route, no logic beyond presentation and local UI state
components/     Figure, charts, shared controls
state/store     the single reducer, persisted to localStorage on every change
lib/            pure helpers: pose maths, routing, audio, wake lock, formatting, plan logic
data/           content as typed literals: exercises, workouts, plans, PT standards
```

Data flows one way: `data/` describes what exists, `lib/planning` and `data/workouts.buildSteps`
turn that into what to do now, screens render it, and completing a session writes one record into
`state/store`.

## The pose rig

`src/lib/pose.ts` is a two-dimensional forward kinematics rig. It is the reason the app ships no
exercise media.

A **pose** is the pelvis position plus one angle per segment:

```ts
{ px, py, torso, spine, head, uaL, faL, thL, shL, ftL, uaR, faR, thR, shR, ftR }
```

The chain: pelvis to chest (lower torso), chest to neck base (upper torso), neck base to head.
Arms hang off the neck base, legs off the pelvis. Segment lengths are fixed in `SEG`.

Conventions, which are what you need to author a new exercise (the full table and the realism
checklist are in [Content.md](Content.md)):

- Limb angles are **absolute**, not relative to the parent: `0` is straight down, `+90` right,
  `-90` left, `180` straight up. Absolute angles are far easier to reason about ("the forearm points
  forward" is `90`, whatever the upper arm is doing) and they make mirroring a sign flip.
- The **torso** is the exception: `0` is upright, `+90` horizontal with the head to the right.
- **`spine`** bends the upper torso relative to the lower (`+` rounds forward, `-` arches) and
  **`head`** tilts the head relative to the upper torso (`+` nods). These are what let a crunch
  round and a superman arch instead of hinging a plank at the hip.
- The figure **faces +x when upright**. That fixes "front" for every lean, so a supine pose
  (authored head-left) faces the ceiling and a prone pose (authored head-right) faces the floor. The
  nose on the head is drawn on the front, so you can tell which is which at a glance. Author prone
  exercises head-right.
- The `R` chain is the **near** side, drawn in the accent colour in front of the body; the `L`
  chain is the far side in grey behind it. An exercise seen head-on sets `facing: 'front'`, which
  colours both chains alike and drops the nose.
- `y` grows downwards, the ground line is at `y = 96`, and the view box is `0 0 100 104`.

`solve()` walks the chain into world coordinates. `sampleCycle()` walks a list of frames on a loop;
each frame carries a duration weight `d`, an optional `hold`, and an **easing** for the transition
into it (`inout`, `out`, `in`, `linear`, `snap`). That is how a push-up lowers slower than it rises
and a jump leaves the ground abruptly: the eccentric and concentric halves get different weights
and curves rather than one symmetric blend.

`src/lib/figure-geometry.ts` turns a solved pose into shapes: tapered quads for limbs with a disc
at each joint, a filled torso with width, a neck, a head with a nose, wedge feet. It is the single
source of the figure's appearance, consumed by both `components/Figure.tsx` (React, for the app)
and `scripts/render-poses.ts` (SVG string to PNG, for review). Every layer is drawn twice, a dark
ring first and the fill on top, which gives the figure a seamless outline wherever an accent limb
crosses another.

`Figure.tsx` animates at about 33 fps, and only when `animated` is set: lists render a static
"signature" frame instead, so a screen of forty exercises is forty static SVGs rather than forty
animation loops.

**Anchor poses** in `src/data/poses.ts` (plank, push-up bottom, squat bottom, lunge, supine,
prone) were solved so that contact points hold still across a repetition: in a push-up the hands
and toes do not move, only the joints fold. An exercise then overrides a handful of numbers from an
anchor rather than starting from scratch. Getting this wrong is what makes an animation look like a
figure sliding across the floor.

To check your work, `npx tsx scripts/render-poses.ts --category core` writes a contact sheet with
every exercise, every keyframe and the interpolated in-betweens to `out/poses/`, and
`--exercise <id>` writes one large strip. It is the same geometry the phone draws. The dev server
also serves the sheet live at `#/dev-poses`; that route is compiled out of production builds.

## The workout model

```
Workout -> Block[] -> BlockItem[]      what is written down
buildSteps(workout, difficulty, week) -> Step[]    what the player runs
```

`buildSteps` resolves everything up front so the player has no branching to do: rounds are
unrolled, unilateral exercises become two steps (right, then left), rest is inserted as its own
step, and each step is annotated with the exercise that follows it so rest can preview it.

Difficulty is a multiplier triple applied at that point:

| Level | Work | Rest | Rounds |
| --- | --- | --- | --- |
| Recruit | ×0,75 | ×1,4 | −1 |
| Soldier | ×1 | ×1 | ±0 |
| Special Forces | ×1,3 | ×0,7 | +1 |

A plan adds a second multiplier on work, per week (week four of Basic Training is +25%). This is
why there is one definition of "Daily PT" rather than nine.

Rep-based steps still get a duration, computed from the exercise's `cycle` (seconds per rep). That
duration drives the timer and the calorie estimate; the "Done" button lets you finish early.

## State

One object, one reducer, one `localStorage` key (`pt-ops.state.v1`). Loading merges the stored
object over `INITIAL_STATE` rather than trusting it, so a build that adds a setting does not break
on state written by the previous build.

Derived values (streaks, weekly totals, the current plan day) are computed on read in
`state/store.tsx` and `lib/planning.ts` rather than stored. There is not enough data for that to
matter, and stored derived state is the usual source of "my streak says 4 but I trained yesterday".

A plan advances **by completion, not by the calendar**: the current day is the first uncompleted
one. Missing three days does not silently skip three sessions. The calendar date is shown alongside
so it is obvious when you are behind.

## Offline

`vite-plugin-pwa` in `generateSW` mode precaches the entire build (about 285 KB across 15 entries).
There are no runtime network calls at all, so there is no runtime caching strategy to tune and no
offline fallback page to design: after the first load the app is complete on the device.

`registerType: 'autoUpdate'` means a new deploy is picked up on the next launch without prompting.

## Deliberate omissions

- **No nutrition tracking.** A useful food log needs a food database, which needs a paid API and a
  backend, which is the thing this app exists to avoid.
- **No push notifications or reminders.** They need a server and a subscription endpoint, and on
  iOS they only work once the app is installed to the home screen. A phone alarm does the job.
- **No light theme.** The app is used on a floor early in the morning; a light theme there is a
  flashbulb. Committing to dark also halves the palette work.
- **No cross-device sync.** See the trade-off in the README. Export and restore cover the move to a
  new phone.
