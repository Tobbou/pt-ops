/**
 * Named anchor poses shared by several exercises.
 *
 * The numbers were solved so that contact points stay put across a repetition: in a
 * push-up the hands and toes hold still while only the joints fold, which is what makes
 * the animation read as a push-up instead of a figure sliding around.
 */
import { Pose, p } from '../lib/pose'

/** Standing, side-on, facing right. Feet land at x = 48 on the ground line. */
export const STAND_SIDE: Pose = p({
  px: 46.6,
  py: 56,
  uaL: 12,
  faL: 14,
  uaR: -8,
  faR: -10,
  thL: 4,
  shL: 2,
  ftL: 80,
  thR: -4,
  shR: -2,
  ftR: 80,
})

/** Standing, facing the viewer. Limbs splay left and right. */
export const STAND_FRONT: Pose = p({
  px: 50,
  py: 56,
  uaL: -9,
  faL: -11,
  uaR: 9,
  faR: 11,
  thL: -4,
  shL: -2,
  ftL: -105,
  thR: 4,
  shR: 2,
  ftR: 105,
})

/** Top of a push-up, i.e. a high plank on straight arms. */
export const PLANK_HIGH: Pose = p({
  px: 52.6,
  py: 78.4,
  torso: 64,
  head: -8,
  uaL: 2,
  faL: 2,
  ftL: -150,
  thL: -64,
  shL: -64,
  uaR: -2,
  faR: -2,
  thR: -66,
  shR: -66,
  ftR: -152,
})

/** Bottom of a push-up: chest low, elbows driven back, hands and toes unmoved. */
export const PUSHUP_LOW: Pose = p({
  px: 55.9,
  py: 88.7,
  torso: 80,
  head: -8,
  uaL: -84,
  faL: 42,
  ftL: -150,
  thL: -80,
  shL: -80,
  uaR: -86,
  faR: 44,
  thR: -82,
  shR: -82,
  ftR: -152,
})

/** Forearm plank. */
export const PLANK_LOW: Pose = p({
  px: 46.5,
  py: 82.1,
  torso: 79,
  head: -10,
  uaL: 0,
  faL: 88,
  ftL: -150,
  thL: -79,
  shL: -79,
  uaR: -2,
  faR: 86,
  thR: -81,
  shR: -81,
  ftR: -152,
})

/** Bottom of a bodyweight squat: hips back, shins near vertical, chest proud. */
export const SQUAT_LOW: Pose = p({
  px: 35.3,
  py: 73.5,
  torso: 35,
  head: -10,
  uaL: 60,
  faL: 75,
  ftL: 80,
  thL: 79,
  shL: -20,
  uaR: 58,
  faR: 73,
  thR: 77,
  shR: -22,
  ftR: 80,
})

/** Split-stance lunge, right leg forward, back knee low. */
export const LUNGE_LOW: Pose = p({
  px: 44,
  py: 71.5,
  torso: 6,
  head: 0,
  uaR: 14,
  faR: 16,
  thR: 77,
  shR: 0,
  ftR: 80,
  uaL: -14,
  faL: -16,
  thL: -40,
  shL: -65,
  ftL: -150,
})

/** Standing tall in a split stance: the top of a lunge or split squat. */
export const LUNGE_TALL: Pose = p({
  px: 46,
  py: 55.5,
  torso: 3,
  uaR: 12,
  faR: 14,
  thR: 14,
  shR: 9,
  ftR: 80,
  uaL: -12,
  faL: -14,
  thL: -16,
  shL: -11,
  ftL: -150,
})

/** Lying on the back, head to the left, knees bent, feet flat. */
export const SUPINE_BENT: Pose = p({
  px: 50,
  py: 92,
  torso: -90,
  head: 0,
  uaL: 95,
  faL: 90,
  thL: 143,
  shL: 0,
  ftL: 92,
  uaR: 97,
  faR: 92,
  thR: 141,
  shR: -2,
  ftR: 92,
})

/** Lying on the back, legs straight along the floor. */
export const SUPINE_FLAT: Pose = p({
  px: 50,
  py: 92,
  torso: -90,
  head: 0,
  uaL: 95,
  faL: 90,
  thL: 92,
  shL: 92,
  ftL: 20,
  uaR: 97,
  faR: 92,
  thR: 90,
  shR: 90,
  ftR: 20,
})

/**
 * Lying face down, head to the RIGHT, arms overhead along the floor: the bottom of a
 * superman. Prone poses are authored head-right so the face points at the floor; supine
 * poses are head-left so it points at the ceiling. See the facing note in lib/pose.ts.
 */
export const PRONE_FLAT: Pose = p({
  px: 38,
  py: 90,
  torso: 92,
  head: 6,
  uaL: 96,
  faL: 94,
  thL: -90,
  shL: -90,
  ftL: -20,
  uaR: 94,
  faR: 92,
  thR: -92,
  shR: -92,
  ftR: -20,
})
