# Adding content

## A new exercise

1. **Author the poses.** Add an entry to `EXERCISES` in `src/data/exercises.ts`. Start from an
   anchor in `src/data/poses.ts` (`PLANK_HIGH`, `SQUAT_LOW`, `SUPINE_BENT`, …) with the `v()`
   helper and override only the joints that move. Read the conventions in
   [Architecture.md](Architecture.md#the-pose-rig) first; the angles are absolute and the figure
   faces right.
2. **Two frames is usually right.** A rep is a start and an end; `sampleCycle` eases between them
   and back. Use three or more for compound movements (a burpee has six), a `d` weight to make one
   transition faster, and `hold` for a static position.
3. **Keep contact points still.** If the hands are on the floor in both frames, they must be at the
   same coordinates in both frames, otherwise the figure slides.
4. **Check it.** `npm run dev`, then `#/dev-poses`. Look at your exercise next to its neighbours.
5. **Fill in the metadata.** `met` drives the calorie estimate (a compendium value: 8 for hard
   bodyweight work, 5 for moderate, 2,3 for stretching), `cycle` is seconds per rep and drives both
   the animation speed and the rep-to-time conversion, `unilateral` makes the player run it twice,
   `hold` forces it to be prescribed in seconds.
6. **Write three cues.** They rotate on screen during the set. Short, imperative, one idea each.

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
