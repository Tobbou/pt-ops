# Motion capture pipeline

Turns a video of somebody performing an exercise into keyframes for the app's 2D rig. Two
steps, deliberately separate: extraction is slow and the raw landmarks are worth keeping,
so retuning the mapping never means re-running the model.

```bash
pip install mediapipe                       # opencv, numpy and scipy are also needed
curl -L -o mocap/models/pose_landmarker_heavy.task \
  https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task

python mocap/extract.py mocap/source/clip.mp4 mocap/data/push-up.npz
python mocap/to_pose.py mocap/data/push-up.npz --start 120 --end 170 --mirror --near l \
    --contacts handL,handR,toeL,toeR --max-frames 6
```

The second command prints a `frames: [...]` block ready to paste into a category file
under `src/data/exercises/`. Render it before adopting it:

```bash
npx tsx scripts/render-poses.ts --file mocap/scratch.ts --samples 2 --cell 200 --cols 6
npm run check:poses
```

## Choosing the clip

Sourced from [Pexels](https://www.pexels.com/license/) or Pixabay, whose licences
explicitly permit download, modification and derivative works with no attribution. Not
from YouTube: the movements themselves are not copyrightable, but the video is, and their
terms forbid downloading.

What makes a clip usable, in order of importance:

1. **Static camera.** Any pan or handheld drift moves the whole skeleton with it.
2. **Whole body in frame** for the entire repetition, feet included.
3. **Side on** for sagittal exercises, square on for the front-facing ones. A few degrees
   off axis is fine and foreshortens slightly; forty-five degrees is not.
4. **At least one complete repetition** at normal speed. Slow motion and speed ramps make
   the timing useless, which is half the reason to capture at all.

## Finding the repetition

`extract.py` reports nothing about reps; pick the frame range yourself. The quickest way
is to smooth a signal that swings once per rep and find its peaks, for example shoulder
height for a push-up:

```python
import numpy as np
from scipy.signal import savgol_filter, find_peaks
d = np.load('mocap/data/push-up.npz')
y = d['image'][:, [11, 12], 1].mean(axis=1)
s = savgol_filter(y, 11, 3)
print('bottoms', find_peaks(s, prominence=0.02)[0])
print('tops', find_peaks(-s, prominence=0.02)[0])
```

Take one top to the next top. Prefer a rep from the middle of the clip: the first is often
tentative and the last is tired.

## What the mapping can and cannot do

**Only the camera-facing side is trusted.** In a side view the far arm and leg are
occluded, and the model's numbers for them are invented. Check the visibility column: on
the reference clip the near side sits at 0,96-1,00 and the far side at 0,01-0,21. The near
side therefore drives both chains and the far side is offset a couple of degrees for
depth, which is what the hand-authored poses do anyway.

**There is no spine.** The landmark set has hips and shoulders and nothing between, so
`spine` comes out as 0. The neck still lands where the capture put it, so a flat-backed
movement is exact and a crunch is wrong. Curved-spine exercises need the bend added by
hand afterwards.

**Proportions are the rig's, not the subject's.** Only angles are taken. A tall subject
and a short one produce the same figure, which is what you want.

**The pelvis is solved, not measured.** Given the angles, `--contacts` names the points
that should be on the ground and the figure is placed to put them there. That is what
stops the capture sliding, and it is why the contact list matters: a push-up is
`handL,handR,toeL,toeR`, a squat is `toeL,toeR`.

**Keyframes are reduced, not sampled.** A greedy pass keeps the endpoints and repeatedly
adds whichever frame the current interpolation gets most wrong, so keyframes land where a
limb changes direction. `--tolerance` is in degrees; `--max-frames` caps it.

## Is it better than authoring by hand?

Not automatically. On the reference push-up the captured version and the hand-authored one
are close, and the hand-authored one has the better *prescription*: it lowers slower than
it presses, as a coach would tell you to, where the captured subject was on his third rep
and pressed slower than he lowered.

Capture earns its keep where authoring is hardest: long sequences with travel and
transitions, where real timing and weight shift are difficult to invent. It is weakest on
anything where the ideal form differs from what the person in the clip actually did.
