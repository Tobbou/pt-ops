/**
 * A tiny forward-kinematics rig for the exercise figures.
 *
 * Every exercise animation in this app is drawn from joint angles rather than from
 * images or video, which is what keeps the whole app offline-capable and under a
 * megabyte. A pose is a handful of numbers; an exercise is two or three poses that
 * the renderer interpolates between.
 *
 * Angle conventions (SVG coordinates, y grows downwards):
 *   - Limb segments use an ABSOLUTE angle where 0 = straight down, +90 = right,
 *     -90 = left, 180 = straight up. Absolute angles are far easier to author than
 *     relative ones: "forearm points right" is just 90, whatever the upper arm does.
 *   - The torso is the exception: 0 = upright, +90 = horizontal with the head to the
 *     right (a plank), -90 = horizontal with the head to the left.
 */

export const SEG = {
  torso: 26,
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
  /** Head tilt relative to the torso. */
  head: number
  /** Left side (drawn behind), absolute segment angles. */
  uaL: number
  faL: number
  thL: number
  shL: number
  ftL: number
  /** Right side (drawn in front), absolute segment angles. */
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

/** Mirror a pose across the vertical axis, swapping the left and right chains. */
export function mirror(pose: Pose): Pose {
  return {
    px: 100 - pose.px,
    py: pose.py,
    torso: -pose.torso,
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
  neck: Pt
  head: Pt
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
function step(from: Pt, angle: number, length: number): Pt {
  return {
    x: from.x + Math.sin(angle * RAD) * length,
    y: from.y + Math.cos(angle * RAD) * length,
  }
}

/** Resolve a pose into world-space joint positions. */
export function solve(pose: Pose): Skeleton {
  const pelvis: Pt = { x: pose.px, y: pose.py }
  // The torso points "up" from the pelvis, rotated by the lean.
  const neck = step(pelvis, 180 - pose.torso, SEG.torso)
  const head = step(neck, 180 - pose.torso - pose.head, SEG.neckToHead)

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

  return { pelvis, neck, head, elbowL, handL, elbowR, handR, kneeL, ankleL, toeL, kneeR, ankleR, toeR }
}

const KEYS = Object.keys(STAND) as (keyof Pose)[]

/** Linear blend between two poses. */
export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const out = {} as Pose
  for (const k of KEYS) out[k] = a[k] + (b[k] - a[k]) * t
  return out
}

/** Smoothstep easing: motion that settles at each end of the rep. */
export function ease(t: number): number {
  return t * t * (3 - 2 * t)
}

export interface Frame {
  pose: Pose
  /** Relative time weight of the transition INTO this frame. Default 1. */
  d?: number
  /** Relative time held at this frame before moving on. Default 0. */
  hold?: number
}

/**
 * Sample an animation cycle at normalised time u (0..1), looping frame 0 -> 1 -> ... -> 0.
 */
export function sampleCycle(frames: Frame[], u: number): Pose {
  if (frames.length === 1) return frames[0].pose
  const legs: { from: Pose; to: Pose; span: number; hold: boolean }[] = []
  for (let i = 0; i < frames.length; i++) {
    const cur = frames[i]
    const next = frames[(i + 1) % frames.length]
    if (cur.hold) legs.push({ from: cur.pose, to: cur.pose, span: cur.hold, hold: true })
    legs.push({ from: cur.pose, to: next.pose, span: next.d ?? 1, hold: false })
  }
  const total = legs.reduce((s, l) => s + l.span, 0)
  let t = ((u % 1) + 1) % 1
  let acc = t * total
  for (const leg of legs) {
    if (acc <= leg.span || leg === legs[legs.length - 1]) {
      const local = leg.span === 0 ? 0 : Math.min(1, Math.max(0, acc / leg.span))
      return leg.hold ? leg.from : lerpPose(leg.from, leg.to, ease(local))
    }
    acc -= leg.span
  }
  return frames[0].pose
}
