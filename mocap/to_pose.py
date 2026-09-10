"""
Convert extracted landmarks into keyframes for the app's 2D rig.

Takes one repetition out of a landmark capture, turns each frame into the joint angles
the rig uses, places the figure so its contact points sit on the ground line, reduces the
result to a handful of keyframes, and prints them as TypeScript ready to paste into a
category file.

    python mocap/to_pose.py mocap/data/push-up.npz --start 120 --end 170 \
        --mirror --contacts handL,handR,toeL,toeR --max-frames 6

Three things are worth knowing about the mapping:

  * Only the camera-facing side is trusted. In a side view the far arm and leg are
    occluded and the model's estimates for them are noise, so the near side drives both
    chains and the far side is offset by a couple of degrees for depth, exactly as the
    hand-authored poses do.
  * The rig has a two-part spine but the landmarks do not: there is no chest joint
    between the hips and the shoulders. `spine` therefore comes out as 0 and the neck
    still lands in the right place, which is correct for a flat-backed movement and
    wrong for a crunch. Curved-spine exercises need the bend added by hand afterwards.
  * The pelvis position is solved, not measured. Given the angles, it is placed to put
    the named contacts on the ground line, which is what stops the figure sliding.
"""

import argparse
from pathlib import Path

import numpy as np

# MediaPipe pose landmark indices.
LM = {
    "nose": 0,
    "l_ear": 7,
    "r_ear": 8,
    "l_sh": 11,
    "r_sh": 12,
    "l_el": 13,
    "r_el": 14,
    "l_wr": 15,
    "r_wr": 16,
    "l_hip": 23,
    "r_hip": 24,
    "l_kn": 25,
    "r_kn": 26,
    "l_an": 27,
    "r_an": 28,
    "l_heel": 29,
    "r_heel": 30,
    "l_foot": 31,
    "r_foot": 32,
}

# Segment lengths and the ground line, mirroring src/lib/pose.ts.
SEG = {
    "lowerTorso": 14.0,
    "upperTorso": 12.0,
    "neckToHead": 9.0,
    "upperArm": 15.0,
    "forearm": 14.0,
    "thigh": 20.0,
    "shin": 20.0,
    "foot": 7.0,
}
GROUND = 96.0

POSE_KEYS = [
    "px", "py", "torso", "spine", "head",
    "uaL", "faL", "thL", "shL", "ftL",
    "uaR", "faR", "thR", "shR", "ftR",
]


def seg_angle(a: np.ndarray, b: np.ndarray) -> float:
    """Absolute angle of a->b in the rig's convention: 0 = down, +90 = right."""
    d = b - a
    return float(np.degrees(np.arctan2(d[0], d[1])))


def wrap(a: float) -> float:
    """Fold an angle into -180..180 so interpolation takes the short way round."""
    return (a + 180.0) % 360.0 - 180.0


def solve_fk(pose: dict) -> dict:
    """Forward kinematics, matching solve() in src/lib/pose.ts."""
    def step(p, angle, length):
        r = np.radians(angle)
        return p + np.array([np.sin(r) * length, np.cos(r) * length])

    pelvis = np.array([pose["px"], pose["py"]], dtype=float)
    lower = 180.0 - pose["torso"]
    upper = lower - pose["spine"]
    chest = step(pelvis, lower, SEG["lowerTorso"])
    neck = step(chest, upper, SEG["upperTorso"])
    head = step(neck, upper - pose["head"], SEG["neckToHead"])
    out = {"pelvis": pelvis, "chest": chest, "neck": neck, "head": head}
    for side in ("L", "R"):
        elbow = step(neck, pose[f"ua{side}"], SEG["upperArm"])
        out[f"elbow{side}"] = elbow
        out[f"hand{side}"] = step(elbow, pose[f"fa{side}"], SEG["forearm"])
        knee = step(pelvis, pose[f"th{side}"], SEG["thigh"])
        out[f"knee{side}"] = knee
        ankle = step(knee, pose[f"sh{side}"], SEG["shin"])
        out[f"ankle{side}"] = ankle
        out[f"toe{side}"] = step(ankle, pose[f"ft{side}"], SEG["foot"])
    return out


def frame_to_angles(pts: np.ndarray, near: str, far_offset: float) -> dict:
    """Joint angles for one frame. `pts` is (33, 2) in rig-space orientation."""
    p = lambda k: pts[LM[k]]
    n, f = near, "r" if near == "l" else "l"

    pelvis = (p("l_hip") + p("r_hip")) / 2
    neck = (p("l_sh") + p("r_sh")) / 2
    # No chest landmark exists, so the whole torso takes one angle and the spine stays
    # flat; the neck still lands where the capture put it.
    torso = 180.0 - seg_angle(pelvis, neck)
    lower = 180.0 - torso

    # Aim at the ear midpoint, which is close to the centre of the rig's head disc.
    # Including the nose biases the direction forward and makes every figure look like
    # it is hanging its head.
    head_dir = seg_angle(neck, (p("l_ear") + p("r_ear")) / 2)
    head = wrap(lower - head_dir)

    ua = seg_angle(neck, p(f"{n}_el"))
    fa = seg_angle(p(f"{n}_el"), p(f"{n}_wr"))
    th = seg_angle(pelvis, p(f"{n}_kn"))
    sh = seg_angle(p(f"{n}_kn"), p(f"{n}_an"))
    ft = seg_angle(p(f"{n}_heel"), p(f"{n}_foot"))

    o = far_offset
    return {
        "px": 0.0, "py": 0.0,
        "torso": wrap(torso), "spine": 0.0, "head": head,
        "uaR": ua, "faR": fa, "thR": th, "shR": sh, "ftR": ft,
        "uaL": ua - o, "faL": fa - o, "thL": th + o, "shL": sh + o, "ftL": ft + o,
    }


def place(pose: dict, contacts: list[str]) -> dict:
    """Choose px/py so the named contact points sit on the ground line."""
    probe = dict(pose, px=0.0, py=0.0)
    fk = solve_fk(probe)
    ys = [fk[c][1] for c in contacts]
    xs = [fk[c][0] for c in contacts] + [fk["head"][0], fk["pelvis"][0]]
    pose = dict(pose)
    # A single offset cannot put every contact exactly on the floor, so aim at the mean
    # and let the checker report what is left.
    pose["py"] = GROUND - float(np.mean(ys))
    pose["px"] = 50.0 - (float(np.min(xs)) + float(np.max(xs))) / 2
    return pose


def resample(seq: list[dict], n: int) -> list[dict]:
    keys = [k for k in POSE_KEYS]
    arr = np.array([[f[k] for k in keys] for f in seq])
    # Unwrap angles before interpolating so a pass through 180 does not spin the limb.
    for j, k in enumerate(keys):
        if k not in ("px", "py"):
            arr[:, j] = np.degrees(np.unwrap(np.radians(arr[:, j])))
    src = np.linspace(0, 1, len(seq))
    dst = np.linspace(0, 1, n)
    out = np.stack([np.interp(dst, src, arr[:, j]) for j in range(arr.shape[1])], axis=1)
    return [dict(zip(keys, row)) for row in out]


def reduce_keyframes(seq: list[dict], max_frames: int, tolerance: float) -> list[int]:
    """
    Greedy keyframe reduction: keep the endpoints, then repeatedly add whichever sample
    the current piecewise-linear approximation gets most wrong. This puts keyframes
    exactly where a limb changes direction, which is where they belong, instead of at
    even intervals.
    """
    keys = [k for k in POSE_KEYS if k not in ("px", "py")]
    arr = np.array([[f[k] for k in keys] for f in seq])
    chosen = [0, len(seq) - 1]
    while len(chosen) < max_frames:
        approx = np.stack(
            [np.interp(np.arange(len(seq)), chosen, arr[chosen, j]) for j in range(arr.shape[1])],
            axis=1,
        )
        err = np.abs(approx - arr).max(axis=1)
        err[chosen] = 0
        worst = int(err.argmax())
        if err[worst] < tolerance:
            break
        chosen = sorted(chosen + [worst])
    return chosen


def emit(poses: list[dict], indices: list[int], name: str, cycle: float) -> str:
    def fmt(v: float) -> str:
        return f"{v:.1f}".rstrip("0").rstrip(".") if abs(v) >= 0.05 else "0"

    lines = [
        f"// {name}: captured from video, {len(indices)} keyframes over {cycle:.1f}s.",
        "frames: [",
    ]
    for i in indices:
        p = poses[i]
        lines.append("  f(p({")
        lines.append(f"    px: {fmt(p['px'])}, py: {fmt(p['py'])}, torso: {fmt(p['torso'])}, "
                     f"spine: {fmt(p['spine'])}, head: {fmt(p['head'])},")
        lines.append(f"    uaL: {fmt(p['uaL'])}, faL: {fmt(p['faL'])}, "
                     f"thL: {fmt(p['thL'])}, shL: {fmt(p['shL'])}, ftL: {fmt(p['ftL'])},")
        lines.append(f"    uaR: {fmt(p['uaR'])}, faR: {fmt(p['faR'])}, "
                     f"thR: {fmt(p['thR'])}, shR: {fmt(p['shR'])}, ftR: {fmt(p['ftR'])},")
        lines.append("  })),")
    lines.append("],")
    return "\n".join(lines)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("npz", type=Path)
    ap.add_argument("--start", type=int, required=True)
    ap.add_argument("--end", type=int, required=True)
    ap.add_argument("--mirror", action="store_true", help="flip so the figure faces right")
    ap.add_argument("--near", choices=["l", "r"], default="l", help="side facing the camera")
    ap.add_argument("--contacts", default="handL,handR,toeL,toeR")
    ap.add_argument("--max-frames", type=int, default=6)
    ap.add_argument("--tolerance", type=float, default=6.0, help="degrees")
    ap.add_argument("--far-offset", type=float, default=2.0)
    ap.add_argument("--name", default="captured")
    ap.add_argument("--samples", type=int, default=60)
    ap.add_argument("--out", type=Path, help="also write the full sampled cycle as .npy")
    args = ap.parse_args()

    d = np.load(args.npz)
    img = d["image"]
    fps = float(d["fps"])
    h, w = 1.0, 1.0
    # x is normalised by width and y by height, so x has to be rescaled to square pixels
    # before any angle is meaningful. The aspect ratio comes from the capture itself.
    aspect = float(d["aspect"]) if "aspect" in d else 2732 / 1440

    seq = []
    for i in range(args.start, args.end + 1):
        pts = img[i, :, :2].copy()
        pts[:, 0] *= aspect * w
        pts[:, 1] *= h
        if args.mirror:
            pts[:, 0] = -pts[:, 0]
        seq.append(frame_to_angles(pts, args.near, args.far_offset))

    dense = resample(seq, args.samples)
    dense = [place(p, args.contacts.split(",")) for p in dense]
    idx = reduce_keyframes(dense, args.max_frames, args.tolerance)
    cycle = (args.end - args.start + 1) / fps

    print(emit(dense, idx, args.name, cycle))
    print(f"\n// reduced {args.samples} samples to {len(idx)} keyframes at "
          f"{args.tolerance} degrees tolerance; indices {idx}")
    if args.out:
        np.save(args.out, np.array([[p[k] for k in POSE_KEYS] for p in dense]))


if __name__ == "__main__":
    main()
