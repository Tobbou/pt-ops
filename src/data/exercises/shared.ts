import { Easing, Frame, Pose, mirror } from '../../lib/pose'
import * as A from '../poses'

/** Shorthand for a pose derived from an anchor. */
export const v = (base: Pose, over: Partial<Pose>): Pose => ({ ...base, ...over })
/** Shorthand for a frame. */
export const f = (pose: Pose, d?: number, hold?: number, ease?: Easing): Frame => ({ pose, d, hold, ease })

// --- shared derived poses ------------------------------------------------------

export const SQUAT_TALL = v(A.STAND_SIDE, { uaL: 22, faL: 26, uaR: 18, faR: 22, torso: 4 })

export const HANDS_DOWN_TUCK = v(A.STAND_SIDE, {
  px: 44, py: 80, torso: 60, head: -20,
  uaL: 3, faL: 3, uaR: -3, faR: -3,
  thL: 80, shL: -50, ftL: 80, thR: 78, shR: -52, ftR: 80,
})

export const MC_RIGHT_IN = v(A.PLANK_HIGH, { thR: 76, shR: -40, ftR: -150, thL: -66, shL: -66 })
export const MC_LEFT_IN = v(A.PLANK_HIGH, { thL: 74, shL: -42, ftL: -150, thR: -64, shR: -64 })

export const SIDE_PLANK = v(A.PLANK_HIGH, {
  px: 51.8, py: 77.1, torso: -65, head: 10,
  uaL: 0, faL: 0, ftL: 100, thL: 65, shL: 65,
  uaR: 180, faR: 178, thR: 63, shR: 63, ftR: 98,
})

export const GLUTE_UP = v(A.SUPINE_BENT, {
  px: 48, py: 80, torso: -117, thL: 105, shL: -13, thR: 103, shR: -15,
})

export const KNEE_PLANK_HIGH = v(A.PLANK_HIGH, {
  px: 55, py: 82.3, torso: 54,
  uaL: 2, faL: 2, thL: -54, shL: -140, ftL: -110,
  uaR: -2, faR: -2, thR: -56, shR: -142, ftR: -112,
})

export const KNEE_PLANK_LOW = v(KNEE_PLANK_HIGH, {
  px: 58, py: 89, torso: 74,
  uaL: -80, faL: 45, uaR: -82, faR: 47,
  thL: -74, shL: -155, ftL: -120, thR: -76, shR: -157, ftR: -122,
})

export const QUADRUPED = v(A.PLANK_HIGH, {
  px: 38, py: 74, torso: 74, head: -10,
  uaL: 2, faL: 2, uaR: -2, faR: -2,
  thL: -10, shL: -95, ftL: -170, thR: -12, shR: -97, ftR: -172,
})

export const SKATER = v(A.STAND_FRONT, {
  px: 62, py: 66, torso: 8,
  thR: 20, shR: -30, ftR: 105,
  thL: -60, shL: -140, ftL: -90,
  uaR: 60, faR: 70, uaL: -60, faL: -70,
})

export const BOX_GUARD = v(A.STAND_SIDE, {
  py: 57, torso: 4,
  uaL: 15, faL: 105, uaR: -10, faR: 100,
  thL: 12, shL: 6, thR: -14, shR: -8,
})

export { A, mirror }
