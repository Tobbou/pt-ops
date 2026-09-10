/**
 * A small forward-kinematics rig for the exercise figures.
 *
 * Every exercise animation in this app is drawn from joint angles rather than from
 * images or video, which is what keeps the whole app offline-capable and under a
 * megabyte. A pose is a handful of numbers; an exercise is a few poses that the
 * renderer interpolates between.
 *
 * Angle conventions (SVG coordinates, y grows downwards):
 *   - Limb segments use an ABSOLUTE angle where 0 = straight down, +90 = right,
 *     -90 = left, 180 = straight up. Absolute angles are far easier to author than
 *     relative ones: "forearm points right" is just 90, whatever the upper arm does.
 *   - The torso is the exception: 0 = upright, +90 = horizontal with the head to the
 *     right (a plank), -90 = horizontal with the head to the left.
 *   - The spine bends the upper torso relative to the lower: positive rounds forward
 *     (a crunch), negative arches (a superman). The head tilts relative to the upper
 *     torso in the same sense.
 *
 * The figure faces +x when upright. That fixes which way is "front" for every lean, so
 * a supine pose (head left) faces the ceiling and a prone pose (head right) faces the
 * floor. Author prone exercises head-right.
 */

export const SEG = {
  /** Pelvis to chest. */
  lowerTorso: 14,
  /** Chest to the base of the neck, where the arms attach. */
  upperTorso: 12,
  /** Neck base to head centre. */
  neckToHead: 9,
  headR: 6.5,
  upperArm: 15,
  forearm: 14,
  thigh: 20,
  shin: 20,
  foot: 7,
} as const

/** Ground line inside the 0..100 view box. */
export const GROUND = 96

export interface Pose {
  /** Pelvis position: the root of the rig. */
  px: number
  py: number
  /** Torso lean: 0 upright, +90 horizontal head-right. */
  torso: number
  /** Spine flexion: upper torso relative to lower. + rounds forward, - arches. */
  spine: number
  /** Head tilt relative to the upper torso. + nods forward, - looks up. */
  head: number
  /** Far side (drawn behind), absolute segment angles. */
  uaL: number
  faL: number
  thL: number
  shL: number
  ftL: number
  /** Near side (drawn in front), absolute segment angles. */
  uaR: number
  faR: number
  thR: number
  shR: number
  ftR: number
}

/** Neutral standing pose. Every exercise pose is authored as a delta from this. */
export const STAND: Pose = {
  px: 50,
  py: 56,
  torso: 0,
  spine: 0,
  head: 0,
  uaL: 10,
  faL: 12,
  thL: 3,
  shL: 1,
  ftL: 80,
  uaR: -10,
  faR: -12,
  thR: -3,
  shR: -1,
  ftR: 80,
}

/** Build a pose from a partial override of the standing pose. */
export function p(over: Partial<Pose>): Pose {
  return { ...STAND, ...over }
}

/** Mirror a pose across the vertical axis, swapping the near and far chains. */
export function mirror(pose: Pose): Pose {
  return {
    px: 100 - pose.px,
    py: pose.py,
    torso: -pose.torso,
    spine: -pose.spine,
    head: -pose.head,
    uaL: -pose.uaR,
    faL: -pose.faR,
    thL: -pose.thR,
    shL: -pose.shR,
    ftL: -pose.ftR,
    uaR: -pose.uaL,
    faR: -pose.faL,
    thR: -pose.thL,
    shR: -pose.shL,
    ftR: -pose.ftL,
  }
}

export type Pt = { x: number; y: number }

export interface Skeleton {
  pelvis: Pt
  chest: Pt
  /** Base of the neck; the arms attach here. */
  neck: Pt
  head: Pt
  /** Unit vector the chest faces. */
  front: Pt
  /** Unit vector along the neck, towards the head. */
  up: Pt
  elbowL: Pt
  handL: Pt
  elbowR: Pt
  handR: Pt
  kneeL: Pt
  ankleL: Pt
  toeL: Pt
  kneeR: Pt
  ankleR: Pt
  toeR: Pt
}

const RAD = Math.PI / 180

/** Step from a point along an absolute segment angle (0 = down). */
export function step(from: Pt, angle: number, length: number): Pt {
  return {
    x: from.x + Math.sin(angle * RAD) * length,
    y: from.y + Math.cos(angle * RAD) * length,
  }
}

/** Resolve a pose into world-space joint positions. */
export function solve(pose: Pose): Skeleton {
  const pelvis: Pt = { x: pose.px, y: pose.py }
  // The torso points "up" from the pelvis, rotated by the lean; the upper torso adds
  // the spine bend on top of that.
  const lowerDir = 180 - pose.torso
  const upperDir = lowerDir - pose.spine
  const chest = step(pelvis, lowerDir, SEG.lowerTorso)
  const neck = step(chest, upperDir, SEG.upperTorso)
  const headDir = upperDir - pose.head
  const head = step(neck, headDir, SEG.neckToHead)

  const up: Pt = { x: Math.sin(headDir * RAD), y: Math.cos(headDir * RAD) }
  // Front is "up" rotated a quarter turn towards +x for an upright figure.
  const front: Pt = { x: -up.y, y: up.x }

  const elbowL = step(neck, pose.uaL, SEG.upperArm)
  const handL = step(elbowL, pose.faL, SEG.forearm)
  const elbowR = step(neck, pose.uaR, SEG.upperArm)
  const handR = step(elbowR, pose.faR, SEG.forearm)

  const kneeL = step(pelvis, pose.thL, SEG.thigh)
  const ankleL = step(kneeL, pose.shL, SEG.shin)
  const toeL = step(ankleL, pose.ftL, SEG.foot)
  const kneeR = step(pelvis, pose.thR, SEG.thigh)
  const ankleR = step(kneeR, pose.shR, SEG.shin)
  const toeR = step(ankleR, pose.ftR, SEG.foot)

  return {
    pelvis,
    chest,
    neck,
    head,
    front,
    up,
    elbowL,
    handL,
    elbowR,
    handR,
    kneeL,
    ankleL,
    toeL,
    kneeR,
    ankleR,
    toeR,
  }
}

const KEYS = Object.keys(STAND) as (keyof Pose)[]

/** Linear blend between two poses. */
export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const out = {} as Pose
  for (const k of KEYS) out[k] = (a[k] ?? 0) + ((b[k] ?? 0) - (a[k] ?? 0)) * t
  return out
}

export type Easing = 'inout' | 'out' | 'in' | 'linear' | 'snap'

/**
 * Easing curves for one transition.
 *
 *   inout   settles at both ends: controlled strength work
 *   out     fast start, soft landing: an explosive drive that decelerates
 *   in      slow start, fast finish: a drop or a collapse into the floor
 *   linear  constant speed: cyclic running motion
 *   snap    almost all the change happens late: a hop that leaves the ground abruptly
 */
export function easeBy(kind: Easing, t: number): number {
  switch (kind) {
    case 'linear':
      return t
    case 'out':
      return 1 - (1 - t) * (1 - t) * (1 - t)
    case 'in':
      return t * t * t
    case 'snap':
      return t < 0.6 ? t * t * 0.5 : 0.18 + (t - 0.6) * 2.05
    default:
      return t * t * (3 - 2 * t)
  }
}

/** Kept for callers that only need the default curve. */
export function ease(t: number): number {
  return easeBy('inout', t)
}

export interface Frame {
  pose: Pose
  /** Relative time weight of the transition INTO this frame. Default 1. */
  d?: number
  /** Relative time held at this frame before moving on. Default 0. */
  hold?: number
  /** Easing of the transition INTO this frame. Default 'inout'. */
  ease?: Easing
}

/**
 * Sample an animation cycle at normalised time u (0..1), looping frame 0 -> 1 -> ... -> 0.
 */
export function sampleCycle(frames: Frame[], u: number): Pose {
  if (frames.length === 1) return frames[0].pose
  const legs: { from: Pose; to: Pose; span: number; hold: boolean; ease: Easing }[] = []
  for (let i = 0; i < frames.length; i++) {
    const cur = frames[i]
    const next = frames[(i + 1) % frames.length]
    if (cur.hold) legs.push({ from: cur.pose, to: cur.pose, span: cur.hold, hold: true, ease: 'linear' })
    legs.push({ from: cur.pose, to: next.pose, span: next.d ?? 1, hold: false, ease: next.ease ?? 'inout' })
  }
  const total = legs.reduce((s, l) => s + l.span, 0)
  const t = ((u % 1) + 1) % 1
  let acc = t * total
  for (const leg of legs) {
    if (acc <= leg.span || leg === legs[legs.length - 1]) {
      const local = leg.span === 0 ? 0 : Math.min(1, Math.max(0, acc / leg.span))
      return leg.hold ? leg.from : lerpPose(leg.from, leg.to, easeBy(leg.ease, local))
    }
    acc -= leg.span
  }
  return frames[0].pose
}
