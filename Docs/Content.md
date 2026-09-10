# Adding content

## Authoring exercise animations

Every exercise is a list of keyframes, each a pose expressed as joint angles, in one of the
category files under `src/data/exercises/`. The rig, the conventions, and the checklist below
are what make those angles come out looking like a person exercising rather than a figure
falling over.

### The rig in one paragraph

Root at the pelvis (`px`, `py`). A two-part spine: lower torso to the chest, upper torso to the
neck base, then a neck to the head. Arms hang off the neck base, legs off the pelvis. Segment
lengths are fixed (`SEG` in `src/lib/pose.ts`). Facing +x when upright, which fixes "front" for
every lean: a supine figure is authored head-left and faces the ceiling, a prone figure is
authored head-right and faces the floor. The nose shows which.

### Conventions

| Field | Meaning | Notes |
| --- | --- | --- |
| `px`, `py` | Pelvis position | y grows downwards, ground is `y = 96` |
| `torso` | Lean of the lower torso | `0` upright, `+90` horizontal head-right, `-90` head-left |
| `spine` | Upper torso relative to lower | `+` rounds forward (crunch), `-` arches (superman). Stay within about ±35 |
| `head` | Head relative to the upper torso | `+` nods forward, `-` looks up. Within ±40 |
| `uaL/uaR` | Upper arm, absolute | `0` straight down, `+90` right (forward), `180` up |
| `faL/faR` | Forearm, absolute | Same scale. Elbow flexion is the difference from the upper arm |
| `thL/thR`, `shL/shR` | Thigh and shin, absolute | Same scale. Knee flexion is the difference |
| `ftL/ftR` | Foot from the ankle towards the toes | Standing flat ≈ `80`, toes tucked in a plank ≈ `-150` (drawn as the raised heel) |

`R` is the **near** side (drawn in front, accent colour), `L` the far side. Set `facing: 'front'`
on an exercise seen head-on: both chains then draw alike and the nose is dropped.

Frames: `f(pose, d, hold, ease)`. `d` weights the time of the transition **into** that frame,
`hold` pauses on it, `ease` shapes the transition into it: `'inout'` (default, controlled),
`'out'` (explosive start, soft finish), `'in'` (slow start, fast finish), `'linear'` (cyclic
running), `'snap'` (a hop that leaves the ground late). The cycle loops back to frame 0, so frame
0's `d` and `ease` describe the return.

### What makes it look real

1. **Contact points do not move.** Hands on the floor in two frames must be at the same
   coordinates in both. Feet likewise. A figure whose feet drift is the single most common tell.
   Work backwards: fix the contact, place the shoulder or hip, solve the joint between.
2. **Nothing goes through the floor.** No joint below `y = 96`; the foot wedge may touch it.
3. **Weight over the base.** Standing, the pelvis sits over the feet. In a squat the hips travel
   back as the knees travel forward, and the torso leans to keep the chest over mid-foot. In a
   lunge the front shin is near vertical.
4. **Joints bend one way.** Knees and elbows flex to about 150°, never past straight the wrong
   way. Check the render, not the numbers.
5. **The spine does the work it does in life.** Crunches, sit-ups, hollow holds and cat round it
   (`spine +`). Superman, cobra and cow arch it (`spine -`). Planks, squats, push-ups hold it
   neutral. Do not leave `spine: 0` on a movement that is about the spine.
6. **The head is neutral.** Eyes a metre ahead on the floor in a plank (`head ≈ 10`), forward in
   a squat, up in a cobra. Nobody cranes.
7. **Eccentric slower than concentric.** Lowering a push-up or squat takes longer than driving up:
   `d ≈ 1.3` in, `d ≈ 0.8` out. Explosive moves load slowly, fire with `'out'`, hang briefly, land
   and absorb. Holds get two nearly identical frames with a long `hold` so the figure breathes.
8. **Arcs need a middle frame.** Arms in jumping jacks pass through shoulder height, not a
   straight line from hip to overhead. Three to five keyframes for anything with a swing, a jump
   or a floor transition; two are fine for a piston movement like a push-up.
9. **Counterbalance.** Arms come forward in a deep squat, swing in a lunge, pump in running.
10. **Feet flatten and heels lift.** Flat when standing, heel up on toes and in planks, toes
    pointed in leg raises.

### The loop

```bash
npx tsx scripts/render-poses.ts --category core                    # out/poses/core.png
npx tsx scripts/render-poses.ts --exercise sit-up --samples 8      # one strip, wraps at --cols
npm run check:poses                                                # numeric validation, all 58
npx tsc -p tsconfig.json --noEmit
```

Boxed cells are authored keyframes, the cells after each are the interpolated motion towards
the next. Look at the strip, adjust, render again. Two passes minimum; the first one is always
wrong somewhere. `#/dev-poses` in the dev server shows the same sheet live.

`check-poses` is the other half and catches what the eye skims over: a hand 1,5 units below the
floor half way through a transition, an elbow that folds shut because two keyframes express the
same bend with opposite signs, a planted foot that slides. It samples the whole cycle, so it sees
the in-betweens you did not author. Run it before you call an exercise done.

Shared anchors (`src/data/poses.ts`) and helpers (`src/data/exercises/shared.ts`) are used by
several categories; a new anchor that only one category needs belongs in that category's file.

## A new exercise

1. Add an entry to the right category file under `src/data/exercises/`. Start from an anchor with
   `v()` and override only the joints that move.
2. Author the keyframes per the checklist above, render, look, adjust.
3. Fill in the metadata: `met` drives the calorie estimate (a compendium value: 8 for hard
   bodyweight work, 5 for moderate, 2,3 for stretching), `cycle` is seconds per rep and drives both
   the animation speed and the rep-to-time conversion, `unilateral` makes the player run it twice,
   `hold` forces it to be prescribed in seconds, `facing: 'front'` for a head-on view.
4. Write three cues. They rotate on screen during the set. Short, imperative, one idea each.

## A new workout

Add to `WORKOUTS` in `src/data/workouts.ts`. Use the `t()` (time), `r()` (reps) and `block()`
helpers, and reuse `WARMUP` / `WARMUP_QUIET` / `COOLDOWN` unless there is a reason not to.

Write the **Soldier** version. Recruit and Special Forces are derived by multiplier, so a session
that only makes sense at one intensity is a session that will read badly at the other two.

Set `quiet: true` if nothing in it lands hard; that drives the "No jumping" filter.

## A new plan

Add to `PLANS` in `src/data/plans.ts`. A plan is a flat array of workout ids with `'rest'` for rest
days, plus one work multiplier per week.

Keep the schedule a multiple of seven so the week grid renders cleanly, and do not schedule the
same muscle group hard on consecutive days: the rotation in `basic-training` is the reference.

## Changing the PT test

`PT_EVENTS` in `src/data/plans.ts` holds the standards. `min60` and `max100` are the score anchors
and everything between them is linear. If you change them, previously saved results keep their
stored score and are not re-scored, which is intentional: a past result should not move because the
yardstick did.
