# Mixamo source assets

Drop Mixamo downloads here. Nothing in `character/` or `animations/` is committed: the
files are large and they are reproducible from mixamo.com with an Adobe account. The
build turns them into one GLB under `public/`.

## The character (required, one file)

1. mixamo.com, **Characters** tab, pick one.
2. **Download** with:
   - Format: **FBX Binary (.fbx)**
   - Pose: **T-pose**
3. Save it as `character/character.fbx`.

T-pose matters: the conversion sets bone rotations relative to the rest pose, so a rest
pose that is already mid-stride would offset every exercise.

## Animations (optional, any number)

Mixamo is a general animation library, not a fitness one, so expect thin coverage. With
the character selected, search each term and download whatever genuinely matches:

    push up · sit up · squat · jumping jacks · burpee · plank · mountain climber
    lunges · boxing · jump · crawl · stretch · warm up

For each one, **Download** with:
   - Format: **FBX Binary (.fbx)**
   - Skin: **Without Skin**  (skeleton only; the mesh already came with the character,
     and repeating it per clip would multiply the download by fifty)
   - Frames per Second: **30**
   - Keyframe Reduction: **none**

Save them as `animations/<exercise-id>.fbx`, using the ids from
`src/data/exercises/`, for example `animations/push-up.fbx`. Anything that does not
match an id is ignored with a warning.

Exercises without a Mixamo clip are generated from the existing 2D catalogue instead:
the sagittal joint angles in `src/data/exercises/` map onto the rig's X-axis rotations,
so the whole catalogue has a 3D version whether or not a capture exists for it.
