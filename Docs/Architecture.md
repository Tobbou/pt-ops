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

`src/lib/pose.ts` is a two-dimensional forward kinematics rig for a eleven-joint figure. It is the
reason the app ships no exercise media.

A **pose** is the pelvis position plus one angle per segment:

```ts
{ px, py, torso, head, uaL, faL, thL, shL, ftL, uaR, faR, thR, shR, ftR }
```

Conventions, which are what you need to author a new exercise:

- Limb angles are **absolute**, not relative to the parent: `0` is straight down, `+90` right,
  `-90` left, `180` straight up. Absolute angles are far easier to reason about ("the forearm points
  forward" is `90`, whatever the upper arm is doing) and they make mirroring a sign flip.
- The **torso** is the exception: `0` is upright, `+90` horizontal with the head to the right.
- The figure faces **right** in side views. The `R` chain is drawn in the accent colour in front of
  the body, the `L` chain in grey behind it, which is what gives a flat stick figure depth.
- `y` grows downwards, the ground line is at `y = 96`, and the view box is `0 0 100 104`.
- In prone positions the "toe" segment is drawn as the raised heel (`ft ≈ -150`), because in a plank
  the ball of the foot is the contact point and the heel is the visible part.

`solve()` walks the chain into world coordinates, `lerpPose()` blends two poses, and
`sampleCycle()` walks a list of frames on a loop with smoothstep easing and optional holds.
`src/components/Figure.tsx` renders the result at about 33 fps, and only when `animated` is set:
lists render a static "signature" frame instead, so a screen of forty exercises is forty static
SVGs rather than forty animation loops.

Each layer is drawn twice, a dark ring first and the mark on top. Limbs cross constantly in a side
view and without the ring an accent-coloured arm in front of an accent-coloured leg reads as one
blob.

**Anchor poses** in `src/data/poses.ts` (plank, push-up bottom, squat bottom, lunge, supine, prone)
were solved so that contact points hold still across a repetition: in a push-up the hands and toes
do not move, only the joints fold. An exercise then overrides a handful of numbers from an anchor
rather than starting from scratch. Getting this wrong is what makes an animation look like a figure
sliding across the floor.

To check your work, run the dev server and open `#/dev-poses`: a contact sheet of every exercise
and every keyframe, drawn large. It is compiled out of production builds.

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
