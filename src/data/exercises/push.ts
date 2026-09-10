import type { Exercise } from './types'
import { A, f, v, KNEE_PLANK_HIGH } from './shared'

/**
 * Push category.
 *
 * Every keyframe below was solved from fixed contact points: the toes-tucked ankle of
 * A.PLANK_HIGH at (16.1, 94.7), the hands at x = 75 / 76 on the ground line, the knee of
 * KNEE_PLANK_HIGH at (38.4, 93.5). The body pivots on the contact as a straight line and
 * the arms are inverse-kinematics solutions to the hand spot, so nothing slides or sinks.
 *
 * Push-ups use six frames (top, two mids, bottom, two mids) rather than two: a straight
 * blend of joint angles from top to bottom carries the hands 3-4 units through the floor
 * half way down, because the elbow's chord shortens as a cosine while the body drops
 * linearly. The first mid sits a quarter of the way down, where that curve bends most,
 * the second near two thirds; with both, the hands stay within a unit of their spot.
 * The `d` of each leg is set so the 'in' leg, the 'linear' leg and the 'out' leg meet
 * at the same speed: the movement flows through the mids instead of pausing on them.
 * Eccentric legs total ~1.3, concentric ~0.8.
 */

// --- push-up family: body line pivots on the toes, hands at x 75/76 -------------------

/** High plank, arms straight, eyes on the floor a metre ahead. */
const PU_TOP = v(A.PLANK_HIGH, {
  px: 52.4, py: 77.9, torso: 65.2, spine: 0, head: 8,
  uaL: 0.1, faL: 0.1, thL: -63.2, shL: -63.2, ftL: -150.2,
  uaR: -1.9, faR: -1.9, thR: -65.2, shR: -65.2, ftR: -152.2,
})
/** A quarter of the way down: elbows just breaking, hands on their spot. */
const PU_MID = v(A.PLANK_HIGH, {
  px: 53.4, py: 80.3, torso: 69, spine: 0, head: 8,
  uaL: -33, faL: 27.6, thL: -67, shL: -67, ftL: -154,
  uaR: -34.9, faR: 25, thR: -69, shR: -69, ftR: -156,
})
/** Two thirds of the way down. */
const PU_MID2 = v(A.PLANK_HIGH, {
  px: 54.9, py: 85, torso: 76, spine: 0, head: 8,
  uaL: -63, faL: 41.5, thL: -74, shL: -74, ftL: -161,
  uaR: -65.5, faR: 37.7, thR: -76, shR: -76, ftR: -163,
})
/** Bottom: chest a fist off the floor, upper arms horizontal, elbows back. */
const PU_LOW = v(A.PLANK_HIGH, {
  px: 55.7, py: 89.1, torso: 82, spine: 0, head: 8,
  uaL: -88.8, faL: 43.2, thL: -80, shL: -80, ftL: -167,
  uaR: -92.1, faR: 37.8, thR: -82, shR: -82, ftR: -169,
})

/** Wide hands: a shallower bottom, elbows near ninety degrees. */
const WIDE_MID2 = v(A.PLANK_HIGH, {
  px: 54.5, py: 83.6, torso: 74, spine: 0, head: 8,
  uaL: -54.9, faL: 38.8, thL: -72, shL: -72, ftL: -159,
  uaR: -57.3, faR: 35.4, thR: -74, shR: -74, ftR: -161,
})
const WIDE_LOW = v(A.PLANK_HIGH, {
  px: 55.3, py: 86.7, torso: 78.5, spine: 0, head: 8,
  uaL: -73.2, faL: 43.5, thL: -76.5, shL: -76.5, ftL: -163.5,
  uaR: -76, faR: 39.1, thR: -78.5, shR: -78.5, ftR: -165.5,
})

/** Diamond: hands under the sternum (x 72/73), so the arms angle back even at the top. */
const DIA_TOP = v(A.PLANK_HIGH, {
  px: 52.5, py: 78.1, torso: 65.5, spine: 0, head: 8,
  uaL: -11.5, faL: -0.6, thL: -63.5, shL: -63.5, ftL: -150.5,
  uaR: -9.3, faR: -6.9, thR: -65.5, shR: -65.5, ftR: -152.5,
})
const DIA_MID = v(A.PLANK_HIGH, {
  px: 53.4, py: 80.3, torso: 69, spine: 0, head: 8,
  uaL: -38.3, faL: 19.3, thL: -67, shL: -67, ftL: -154,
  uaR: -39.7, faR: 16.2, thR: -69, shR: -69, ftR: -156,
})
const DIA_MID2 = v(A.PLANK_HIGH, {
  px: 54.9, py: 85, torso: 76, spine: 0, head: 8,
  uaL: -69.9, faL: 29.9, thL: -74, shL: -74, ftL: -161,
  uaR: -71.7, faR: 26, thR: -76, shR: -76, ftR: -163,
})
/** Deep bottom, elbows brushing past the ribs. */
const DIA_LOW = v(A.PLANK_HIGH, {
  px: 55.8, py: 89.8, torso: 83, spine: 0, head: 8,
  uaL: -102.5, faL: 25.7, thL: -81, shL: -81, ftL: -168,
  uaR: -104.3, faR: 20.8, thR: -83, shR: -83, ftR: -170,
})

// --- knee push-up: body line pivots on the knee, shins lifted --------------------------

const KP_TOP = v(KNEE_PLANK_HIGH, {
  px: 54.8, py: 82, torso: 54.9, spine: 0, head: 8,
  uaL: -2.8, faL: 2.7, thL: -52.9, shL: -118, ftL: -98,
  uaR: -3.8, faR: -0.2, thR: -54.9, shR: -120, ftR: -100,
})
const KP_MID = v(KNEE_PLANK_HIGH, {
  px: 55.8, py: 83.6, torso: 60.5, spine: 0, head: 8,
  uaL: -33.8, faL: 24.9, thL: -58.5, shL: -118, ftL: -98,
  uaR: -35.6, faR: 22.1, thR: -60.5, shR: -120, ftR: -100,
})
const KP_MID2 = v(KNEE_PLANK_HIGH, {
  px: 57.2, py: 86.6, torso: 70, spine: 0, head: 8,
  uaL: -63.8, faL: 33.9, thL: -68, shL: -118, ftL: -98,
  uaR: -65.8, faR: 30.2, thR: -70, shR: -120, ftR: -100,
})
const KP_LOW = v(KNEE_PLANK_HIGH, {
  px: 57.9, py: 89, torso: 77, spine: 0, head: 8,
  uaL: -85.5, faL: 33.4, thL: -75, shL: -118, ftL: -98,
  uaR: -87.7, faR: 28.8, thR: -77, shR: -120, ftR: -100,
})

// --- pike push-up: toes at (26.4, 96) with the heels up, hands at x 78.6 ---------------
// The legs pivot on the toes and the hands stay put, so the hips travel forward as the
// shoulders drop: an inverted V at the top, a flatter V with the head down at the bottom.
// At the top the torso sits at ~50 degrees to the floor with the arms continuing that line
// (shoulders open, ~170 degrees). The bottom is a compromise the rig forces: with the
// elbows folding back towards the feet, the shoulder has to be almost over the hands or
// the elbow lands on the floor, so the torso flattens to ~33 degrees, the crown of the
// head stops three units short of the floor and the forearms come down to ~20 degrees.
// Both arms are given the same angles: staggering them a degree floats the far hand.

/** Inverted V, hips the apex, arms straight in line with the torso, eyes on the floor between the hands. */
const PK_TOP = v(A.PLANK_HIGH, {
  px: 40.4, py: 56.5, torso: 131, spine: 4, head: -6,
  uaL: 41.2, faL: 41.2, thL: -28.4, shL: -28.4, ftL: 52,
  uaR: 41.2, faR: 41.2, thR: -29, shR: -29, ftR: 50,
})
/** Elbows breaking back, hips starting forward, chin beginning to tuck. */
const PK_MID = v(A.PLANK_HIGH, {
  px: 45.1, py: 59.6, torso: 127.5, spine: 2, head: 10,
  uaL: 0.6, faL: 67.8, thL: -36.4, shL: -36.4, ftL: 52,
  uaR: 0.6, faR: 67.8, thR: -37, shR: -37, ftR: 50,
})
/** Crown of the head towards the floor between the hands, elbows folded back past ninety. */
const PK_LOW = v(A.PLANK_HIGH, {
  px: 50.2, py: 64.1, torso: 123, spine: 0, head: 29,
  uaL: -26.5, faL: 72, thL: -46.2, shL: -46.2, ftL: 52,
  uaR: -26.5, faR: 72, thR: -46.75, shR: -46.75, ftR: 50,
})

// --- explosive push-up -----------------------------------------------------------------

/** Apex of the flight: body pivoted past the plank line, hands five units clear. */
const EX_AIR = v(A.PLANK_HIGH, {
  px: 50.9, py: 75, torso: 60.5, spine: 0, head: 8,
  uaL: 6, faL: 6, thL: -58.5, shL: -58.5, ftL: -145.5,
  uaR: 2, faR: 2, thR: -60.5, shR: -60.5, ftR: -147.5,
})
/** Touchdown: hands back on their spot with the elbows already thirty degrees soft, never locked. */
const EX_LAND = v(A.PLANK_HIGH, {
  px: 52.7, py: 78.6, torso: 66.3, spine: 0, head: 8,
  uaL: -16.8, faL: 15.8, thL: -64.3, shL: -64.3, ftL: -151.3,
  uaR: -18.6, faR: 13.5, thR: -66.3, shR: -66.3, ftR: -153.3,
})
/** Landing absorbed with soft elbows. */
const EX_ABSORB = v(A.PLANK_HIGH, {
  px: 53.9, py: 81.6, torso: 71, spine: 0, head: 8,
  uaL: -42.3, faL: 33.1, thL: -69, shL: -69, ftL: -156,
  uaR: -44.4, faR: 30.2, thR: -71, shR: -71, ftR: -158,
})

// --- hand-release push-up ---------------------------------------------------------------

/** Chest and hips on the floor, elbows folded up behind. */
const HR_DOWN = v(A.PLANK_HIGH, {
  px: 55.8, py: 90.5, torso: 84, spine: 0, head: 8,
  uaL: -99.2, faL: 40.6, thL: -82, shL: -82, ftL: -169,
  uaR: -102.7, faR: 34.5, thR: -84, shR: -84, ftR: -171,
})
/**
 * Same body, shoulders pulled back so both hands hover clear of the floor: the elbows
 * rise and the hands lift four units and drift a touch back, folding to ~148 degrees
 * rather than past 160, which is as far as an elbow goes.
 */
const HR_RELEASE = v(HR_DOWN, { uaL: -128.6, faL: 18.7, uaR: -130.5, faR: 13.1 })

// --- plank shoulder taps: lift the hand straight up, then curl it to the far shoulder --

const LIFT_L = v(PU_TOP, { uaL: -35, faL: 30 })
const TAP_L = v(PU_TOP, { uaL: -40, faL: 108 })
const LIFT_R = v(PU_TOP, { uaR: -35, faR: 30 })
const TAP_R = v(PU_TOP, { uaR: -40, faR: 108 })

// --- plank up-downs: shifted four units left so the forearm hands stay in frame ---------
// Contacts: toes at (12.1, 94.7), hands at x 71/72, elbows on the floor at x 74/75 with
// the forearms pointing forward. Each arm lifts clear of the floor between its spots.

const UD_HIGH = v(A.PLANK_HIGH, {
  px: 48.4, py: 77.9, torso: 65.2, spine: 0, head: 8,
  uaL: 0.1, faL: 0.1, thL: -63.2, shL: -63.2, ftL: -150.2,
  uaR: -1.9, faR: -1.9, thR: -65.2, shR: -65.2, ftR: -152.2,
})
/** Near hand lifted straight up off its spot, body starting to sink. */
const UD_R_LIFT_DOWN = v(A.PLANK_HIGH, {
  px: 49.1, py: 79.7, torso: 68, spine: 0, head: 8,
  uaL: -27.7, faL: 24.1, thL: -66, shL: -66, ftL: -153,
  uaR: -45, faR: 45, thR: -68, shR: -68, ftR: -155,
})
/** Near elbow down on the floor under the shoulder, far hand still planted, bent. */
const UD_R_ELBOW = v(A.PLANK_HIGH, {
  px: 50.8, py: 84.9, torso: 75.8, spine: 0, head: 8,
  uaL: -62.2, faL: 41.2, thL: -73.8, shL: -73.8, ftL: -160.8,
  uaR: -8, faR: 87, thR: -75.8, shR: -75.8, ftR: -162.8,
})
/** Far hand lifted, about to place the far forearm. */
const UD_L_LIFT_DOWN = v(UD_R_ELBOW, { uaL: -70, faL: 60 })
/** Forearm plank. */
const UD_LOW = v(UD_R_ELBOW, { uaL: -4, faL: 89 })
/** Near hand lifted off the forearm position, travelling back under the shoulder. */
const UD_R_LIFT_UP = v(UD_R_ELBOW, { uaL: -4, faL: 89, uaR: -70, faR: 60 })
/** Near hand planted and pushing, far arm still on the forearm. */
const UD_R_HAND = v(UD_R_ELBOW, { uaL: -4, faL: 89, uaR: -64.7, faR: 37.5 })
/** Body rising on the near hand while the far hand comes up off the forearm. */
const UD_L_LIFT_UP = v(A.PLANK_HIGH, {
  px: 50.4, py: 83.3, torso: 73.5, spine: 0, head: 8,
  uaL: -62, faL: 58, thL: -71.5, shL: -71.5, ftL: -158.5,
  uaR: -55.2, faR: 34.7, thR: -73.5, shR: -73.5, ftR: -160.5,
})
/** Both hands planted, body half way back up. */
const UD_MID_UP = v(A.PLANK_HIGH, {
  px: 49.8, py: 81.3, torso: 70.5, spine: 0, head: 8,
  uaL: -40.1, faL: 31.9, thL: -68.5, shL: -68.5, ftL: -155.5,
  uaR: -42.2, faR: 29, thR: -70.5, shR: -70.5, ftR: -157.5,
})

const UD_RECOVER = v(A.PLANK_HIGH, {
  px: 49.1, py: 79.6, torso: 67.9, spine: 0, head: 8,
  uaL: -27.3, faL: 23.5, uaR: -29.3, faR: 20.8,
  thL: -65.9, shL: -65.9, ftL: -152.9, thR: -67.9, shR: -67.9, ftR: -154.9,
})

const EX_RECOVER = v(A.PLANK_HIGH, {
  px: 53.2, py: 79.8, torso: 68.2, spine: 0, head: 8,
  uaL: -28.9, faL: 24.5, uaR: -30.9, faR: 21.8,
  thL: -66.2, shL: -66.2, ftL: -153.2, thR: -68.2, shR: -68.2, ftR: -155.2,
})

export const PUSH: Exercise[] = [
  {
    id: 'push-up',
    name: 'Push-Up',
    category: 'push',
    muscles: ['chest', 'triceps', 'shoulders', 'core'],
    met: 8,
    cycle: 2.4,
    cues: ['Hands under the shoulders', 'Elbows back at 45 degrees, not flared wide', 'One straight line from head to heels'],
    frames: [
      f(PU_TOP, 0.25, 0.15, 'out'),
      f(PU_MID, 0.41, 0, 'in'),
      f(PU_MID2, 0.25, 0, 'linear'),
      f(PU_LOW, 0.64, 0.05, 'out'),
      f(PU_MID2, 0.4, 0, 'in'),
      f(PU_MID, 0.155, 0, 'linear'),
    ],
  },
  {
    id: 'wide-push-up',
    name: 'Wide Push-Up',
    category: 'push',
    muscles: ['chest', 'shoulders'],
    met: 8,
    cycle: 2.4,
    cues: ['Hands well outside the shoulders', 'Chest leads the way down', 'Do not let the hips sag'],
    frames: [
      f(PU_TOP, 0.31, 0.15, 'out'),
      f(PU_MID, 0.5, 0, 'in'),
      f(WIDE_MID2, 0.22, 0, 'linear'),
      f(WIDE_LOW, 0.58, 0.05, 'out'),
      f(WIDE_MID2, 0.36, 0, 'in'),
      f(PU_MID, 0.13, 0, 'linear'),
    ],
  },
  {
    id: 'diamond-push-up',
    name: 'Diamond Push-Up',
    category: 'push',
    muscles: ['triceps', 'chest'],
    met: 8,
    cycle: 2.6,
    cues: ['Thumbs and index fingers form a diamond', 'Elbows brush past the ribs', 'Slow on the way down'],
    frames: [
      f(DIA_TOP, 0.22, 0.15, 'out'),
      f(DIA_MID, 0.35, 0, 'in'),
      f(DIA_MID2, 0.24, 0, 'linear'),
      f(DIA_LOW, 0.71, 0.05, 'out'),
      f(DIA_MID2, 0.44, 0, 'in'),
      f(DIA_MID, 0.14, 0, 'linear'),
    ],
  },
  {
    id: 'knee-push-up',
    name: 'Knee Push-Up',
    category: 'push',
    muscles: ['chest', 'triceps'],
    met: 5,
    cycle: 2.4,
    cues: ['Knees, hips and shoulders in one line', 'Do not let the hips lead', 'Full range every rep'],
    frames: [
      f(KP_TOP, 0.28, 0.15, 'out'),
      f(KP_MID, 0.46, 0, 'in'),
      f(KP_MID2, 0.26, 0, 'linear'),
      f(KP_LOW, 0.58, 0.05, 'out'),
      f(KP_MID2, 0.36, 0, 'in'),
      f(KP_MID, 0.16, 0, 'linear'),
    ],
  },
  {
    id: 'pike-push-up',
    name: 'Pike Push-Up',
    category: 'push',
    muscles: ['shoulders', 'triceps'],
    met: 8,
    cycle: 2.8,
    cues: ['Hips high, body in an upside-down V', 'Crown of the head towards the floor', 'Press straight back up'],
    frames: [f(PK_TOP, 0.2, 0.15, 'out'), f(PK_MID, 0.3, 0, 'in'), f(PK_LOW, 0.85, 0.05, 'out'), f(PK_MID, 0.6, 0, 'in')],
  },
  {
    id: 'explosive-push-up',
    name: 'Explosive Push-Up',
    category: 'push',
    muscles: ['chest', 'triceps', 'shoulders'],
    met: 9,
    cycle: 2,
    cues: ['Drive hard enough to leave the floor', 'Land with soft elbows', 'Reset the plank before the next rep'],
    // Load slowly; drive accelerating through the mids and out of the top at constant
    // speed; decelerate to the apex; fall, bending the elbows before touchdown so the
    // hands never land on locked arms; absorb the rest; reset.
    frames: [
      f(PU_TOP, 0.3, 0.2),
      f(PU_MID, 0.41, 0, 'in'),
      f(PU_MID2, 0.25, 0, 'linear'),
      f(PU_LOW, 0.64, 0.05, 'out'),
      f(PU_MID2, 0.25, 0, 'in'),
      f(PU_MID, 0.1, 0, 'linear'),
      f(PU_TOP, 0.05, 0, 'linear'),
      f(EX_AIR, 0.25, 0, 'out'),
      f(EX_LAND, 0.25, 0, 'in'),
      f(EX_ABSORB, 0.3, 0, 'out'),
      // Hands solved back onto the floor before the arms straighten into PU_TOP.
      f(EX_RECOVER, 0.18, 0, 'linear'),
    ],
  },
  {
    id: 'hand-release-push-up',
    name: 'Hand-Release Push-Up',
    category: 'push',
    muscles: ['chest', 'back', 'triceps'],
    met: 8,
    cycle: 3,
    cues: ['Chest all the way to the floor', 'Lift both hands clear at the bottom', 'Press up as one piece'],
    frames: [
      f(PU_TOP, 0.21, 0.15, 'out'),
      f(PU_MID, 0.38, 0, 'in'),
      f(PU_MID2, 0.23, 0, 'linear'),
      f(HR_DOWN, 0.79, 0, 'out'),
      f(HR_RELEASE, 0.3, 0.35),
      f(HR_DOWN, 0.3, 0.1),
      f(PU_MID2, 0.44, 0, 'in'),
      f(PU_MID, 0.13, 0, 'linear'),
    ],
  },
  {
    id: 'plank-shoulder-tap',
    name: 'Plank Shoulder Taps',
    category: 'push',
    muscles: ['core', 'shoulders'],
    met: 5,
    cycle: 2.4,
    cues: ['Feet wide for a stable base', 'Do not let the hips rock', 'Tap the opposite shoulder'],
    frames: [
      f(PU_TOP, 0.25, 0.15, 'out'),
      f(LIFT_L, 0.2, 0, 'in'),
      f(TAP_L, 0.6, 0.15, 'out'),
      f(LIFT_L, 0.5, 0, 'in'),
      f(PU_TOP, 0.25, 0, 'out'),
      f(LIFT_R, 0.2, 0, 'in'),
      f(TAP_R, 0.6, 0.15, 'out'),
      f(LIFT_R, 0.5, 0, 'in'),
    ],
  },
  {
    id: 'plank-up-down',
    name: 'Plank Up-Downs',
    category: 'push',
    muscles: ['core', 'triceps', 'shoulders'],
    met: 6,
    cycle: 3.6,
    cues: ['Elbow, elbow, hand, hand', 'Keep the hips as quiet as you can', 'Alternate the leading arm'],
    frames: [
      f(UD_HIGH, 0.5, 0.15),
      f(UD_R_LIFT_DOWN, 0.35, 0, 'in'),
      f(UD_R_ELBOW, 0.55, 0.05, 'out'),
      f(UD_L_LIFT_DOWN, 0.35, 0, 'in'),
      f(UD_LOW, 0.45, 0.15, 'out'),
      f(UD_R_LIFT_UP, 0.35, 0, 'in'),
      f(UD_R_HAND, 0.45, 0.05, 'out'),
      f(UD_L_LIFT_UP, 0.35, 0, 'in'),
      f(UD_MID_UP, 0.35, 0, 'out'),
      // Hands solved back onto the floor: the direct blend to UD_HIGH sank them through it.
      f(UD_RECOVER, 0.2, 0, 'linear'),
    ],
  },
]
