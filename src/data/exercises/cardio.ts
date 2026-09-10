import type { Exercise } from './types'
import { A, f, v, mirror } from './shared'

// --- local anchors ---------------------------------------------------------------
//
// Contact points are solved so that they do not move between frames: the burpee and
// squat-thrust hands sit where PLANK_HIGH puts them (x 75 / 77 on the ground line), and
// the standing feet stay where STAND_SIDE puts them (ankles at x 44.5 / 48.7). Leg and
// arm angles for planted contacts come from a two-bone solve, not by eye.

/** First part of the burpee drop: a quarter squat, arms starting to reach. */
const BURPEE_QUARTER = v(A.STAND_SIDE, {
  px: 45.5, py: 60.5, torso: 18, spine: 3, head: -4,
  uaL: 26, faL: 32, uaR: 22, faR: 28,
  thL: 33.4, shL: -23, ftL: 80, thR: 27, shR: -30.2, ftR: 80,
})

/** Half way into the burpee drop: a half squat, arms reaching down and forward. */
const BURPEE_HALF = v(A.STAND_SIDE, {
  px: 44, py: 67.5, torso: 32, spine: 6, head: -6,
  uaL: 38, faL: 46, uaR: 34, faR: 42,
  thL: 53.1, shL: -34.4, ftL: 80, thR: 45.6, shR: -43.5, ftR: 80,
})

/** Deep tuck with the hands planted: the bottom of the burpee drop, the squat-thrust start. */
const BURPEE_TUCK = v(A.STAND_SIDE, {
  px: 43.5, py: 78, torso: 66, spine: 10, head: -10,
  uaL: 6, faL: 33, uaR: -2, faR: 33.5,
  thL: 78.2, shL: -46, ftL: 80, thR: 66.4, shR: -60, ftR: 80,
})

/** Feet in flight between the tuck and the plank: hips piked, knees folded, hands planted. */
const BURPEE_FLIGHT = v(A.PLANK_HIGH, {
  px: 51, py: 70, torso: 84, spine: 4, head: -12,
  uaL: -15.2, faL: 16.7, uaR: -18.9, faR: 12.1,
  thL: 14, shL: -124, ftL: -110, thR: 10, shR: -128, ftR: -112,
})

/**
 * Quarter and half depth of the push-up, hands and toes where PLANK_HIGH and PUSHUP_LOW
 * put them. Interpolating straight from the plank to the bottom sinks the hands 3.5
 * below the floor half way, because an arm's vertical reach is concave in its angles;
 * these two frames keep that sag under one unit.
 */
const PUSHUP_QUARTER = v(A.PLANK_HIGH, {
  px: 53.43, py: 80.98, torso: 68,
  uaL: -31.5, faL: 31.4, uaR: -35.6, faR: 26.3,
  thL: -68, shL: -68, thR: -70, shR: -70,
})

const PUSHUP_MID = v(A.PLANK_HIGH, {
  px: 54.25, py: 83.55, torso: 72,
  uaL: -48.1, faL: 41.5, uaR: -52.9, faR: 35.2,
  thL: -72, shL: -72, thR: -74, shR: -74,
})

/** Rising out of the tuck: the half-squat legs again, arms already swinging forward. */
const BURPEE_RISE = v(BURPEE_HALF, {
  spine: 2, head: -6,
  uaL: 55, faL: 62, uaR: 51, faR: 58,
})

/** Driving up: legs nearly extended, arms swinging through shoulder height. */
const BURPEE_DRIVE = v(A.STAND_SIDE, {
  px: 46.6, py: 60, torso: 14, spine: -2, head: -4,
  uaL: 82, faL: 92, uaR: 78, faR: 88,
  thL: 29, shL: -22.3, ftL: 80, thR: 22.3, shR: -29, ftR: 80,
})

/** Top of the burpee jump: airborne, reaching up, toes pointed. Hands stay inside the view. */
const BURPEE_APEX = v(A.STAND_SIDE, {
  px: 47.5, py: 51, torso: 0, spine: -4, head: -6,
  uaL: 145, faL: 150, uaR: 141, faR: 146,
  thL: 6, shL: 3, ftL: 28, thR: 2, shR: -1, ftR: 26,
})

/** Landing from the jump: knees soft, arms forward for balance. */
const BURPEE_LAND = v(A.STAND_SIDE, {
  px: 45, py: 58.6, torso: 12, spine: 2, head: -4,
  uaL: 58, faL: 68, uaR: 54, faR: 64,
  thL: 26.5, shL: -15.2, ftL: 80, thR: 20.8, shR: -22.3, ftR: 80,
})

/** Quarter squat with feet together and arms crossed low: the star jump load. */
const STAR_LOAD = v(A.STAND_FRONT, {
  py: 59,
  uaL: 20, faL: 35, uaR: -20, faR: -35,
  thL: -31, shL: 12, ftL: -105, thR: 31, shR: -12, ftR: 105,
})

/** Take-off: legs straight and driving, arms sweeping through shoulder height. */
const STAR_TAKEOFF = v(A.STAND_FRONT, {
  py: 55.7,
  uaL: -90, faL: -92, uaR: 90, faR: 92,
  thL: -9, shL: -9, ftL: -105, thR: 9, shR: 9, ftR: 105,
})

/** Apex: a full star, airborne, toes pointed. */
const STAR_APEX = v(A.STAND_FRONT, {
  py: 48,
  uaL: -135, faL: -138, uaR: 135, faR: 138,
  thL: -30, shL: -32, ftL: -14, thR: 30, shR: 32, ftR: 14,
})

/** Landing: feet back together, knees soft, arms settling at the sides. */
const STAR_LAND = v(A.STAND_FRONT, {
  py: 57.3,
  uaL: -45, faL: -52, uaR: 45, faR: 52,
  thL: -22, shL: 4, ftL: -105, thR: 22, shR: -4, ftR: 105,
})

/** Landed on the right leg after a bound to the right; the left leg sweeps behind. */
const SKATER_LAND = v(A.STAND_FRONT, {
  px: 58, py: 60, torso: 5,
  thR: 28.8, shR: -22.5, ftR: 105,
  thL: 34, shL: -44, ftL: -55,
  uaL: 45, faL: 65, uaR: -35, faR: -55,
})

/** Sunk deeper into the right leg, arms fully swung: the load before the next bound. */
const SKATER_LOAD = v(SKATER_LAND, {
  px: 58.5, py: 62.5, torso: 7,
  thR: 35.6, shR: -30.5,
  thL: 42, shL: -50, ftL: -55,
  uaL: 60, faL: 85, uaR: -50, faR: -70,
})

/** Airborne, bounding to the left: the right leg trails, the left leg reaches. */
const SKATER_FLIGHT = v(A.STAND_FRONT, {
  px: 50, py: 53, torso: 0,
  thR: 28, shR: 30, ftR: 50,
  thL: -10, shL: -35, ftL: -60,
  uaL: -12, faL: -24, uaR: 12, faR: 24,
})

/**
 * Bear crawl body: back flat and nearly horizontal, hips a touch above the shoulders,
 * knees a fist off the floor, weight on the balls of the feet. Hands land at x 59.9 /
 * 63.9 / 67.9 and feet at x 8 / 12 / 16 as the stride cycles; a swinging limb lifts.
 */
const BEAR = v(A.PLANK_HIGH, {
  px: 38, py: 70, torso: 86, spine: -2, head: -14,
})

// hand: front  ua -5.7  fa 23.1 | mid  ua -16 fa 17.1 | back  ua -22.1 fa 6.8 | swing ua -39.3 fa 43.3
// foot: front  th -7.3  sh -76.5 | mid  th -20 sh -73.4 | back th -36.3 sh -65.2 | swing th -17.5 sh -87.3

/** Right hand and left foot forward, left hand and right foot back. */
const BEAR_A = v(BEAR, {
  uaR: -5.7, faR: 23.1, uaL: -22.1, faL: 6.8,
  thL: -7.3, shL: -76.5, ftL: -150, thR: -36.3, shR: -65.2, ftR: -152,
})

/** Mid stride: left hand and right foot lifted and swinging forward, the others under the body. */
const BEAR_B = v(BEAR, {
  uaR: -16, faR: 17.1, uaL: -39.3, faL: 43.3,
  thL: -20, shL: -73.4, ftL: -150, thR: -17.5, shR: -87.3, ftR: -130,
})

/** Left hand and right foot forward, right hand and left foot back. */
const BEAR_C = v(BEAR, {
  uaL: -5.7, faL: 23.1, uaR: -22.1, faR: 6.8,
  thR: -7.3, shR: -76.5, ftR: -150, thL: -36.3, shL: -65.2, ftL: -152,
})

/** Mid stride: right hand and left foot lifted and swinging forward. */
const BEAR_D = v(BEAR, {
  uaL: -16, faL: 17.1, uaR: -39.3, faR: 43.3,
  thR: -20, shR: -73.4, ftR: -150, thL: -17.5, shL: -87.3, ftL: -130,
})

/** Boxing guard: left foot leading, knees soft, shoulders rounded, hands at the chin. */
const GUARD = v(A.STAND_SIDE, {
  px: 46.6, py: 57, torso: 4, spine: 6, head: 10,
  // The rear hand guards in front of the cheek rather than on it: the arms attach at
  // the neck base, so a hand literally at the chin folds the elbow shut.
  uaL: 25, faL: 140, uaR: 31.5, faR: 178,
  thL: 18.2, shL: -1, ftL: 80, thR: -18.2, shR: -1, ftR: 80,
})

/** Left jab: lead hand snaps out, weight shifts onto the front foot, rear heel lifts a little. */
const JAB = v(GUARD, {
  px: 48, py: 56.8, torso: 9, spine: 8, head: 8,
  uaL: 88, faL: 92, uaR: 31.5, faR: 178,
  thL: 16, shL: -2.9, thR: -25.7, shR: 2.8, ftR: 70,
})

/** Right cross: rear hand extends, hips drive forward, rear heel comes up onto the toe. */
const CROSS = v(GUARD, {
  px: 49.6, py: 56.8, torso: 11, spine: 8, head: 8,
  uaR: 88, faR: 92, uaL: 15, faL: 155,
  thL: 14.9, shL: -6.4, thR: -32.4, shR: 5.5, ftR: 59,
})

/** Jump rope, lowest point of the landing: knees soft, feet flat, hands at the hips. */
const ROPE_CONTACT = v(A.STAND_SIDE, {
  px: 45.6, py: 57.3, torso: 2, head: 4,
  uaL: -12, faL: 80, uaR: -16, faR: 76,
  thL: 18.3, shL: -9.7, ftL: 80, thR: 12.9, shR: -16.2, ftR: 80,
})

/** Toes still on the floor, legs straight, heels high: the instant before leaving the ground. */
const ROPE_EXTEND = v(A.STAND_SIDE, {
  px: 48.1, py: 52.3, torso: 1, head: 2,
  uaL: -15, faL: 74, uaR: -19, faR: 70,
  thL: 3.5, shL: 2.5, ftL: 45, thR: -2.5, shR: -1.5, ftR: 45,
})

/** Apex of the hop: airborne, toes pointed, hands at the bottom of the turn. */
const ROPE_APEX = v(A.STAND_SIDE, {
  px: 48.3, py: 49, torso: 0, head: 0,
  uaL: -18, faL: 68, uaR: -22, faR: 64,
  thL: 4, shL: 3, ftL: 30, thR: -2, shR: -1, ftR: 30,
})

export const CARDIO: Exercise[] = [
  {
    id: 'burpee',
    name: 'Burpee',
    category: 'cardio',
    muscles: ['fullbody'],
    met: 8,
    cycle: 3.6,
    cues: ['Hands down, feet back, chest to the floor', 'Jump the feet back in under the hips', 'Finish with a full jump and reach'],
    // Three-frame runs use in -> linear -> out so the motion accelerates through the
    // intermediate frames instead of settling on each one; the d weights are scaled so
    // the speed stays continuous across the joins.
    frames: [
      f(A.STAND_SIDE, 0.4),
      f(BURPEE_QUARTER, 0.27, 0, 'in'),
      f(BURPEE_HALF, 0.09, 0, 'linear'),
      f(BURPEE_TUCK, 0.39, 0, 'out'),
      f(BURPEE_FLIGHT, 0.3, 0, 'out'),
      f(A.PLANK_HIGH, 0.3, 0, 'out'),
      f(PUSHUP_QUARTER, 0.18, 0, 'in'),
      f(PUSHUP_MID, 0.06, 0, 'linear'),
      f(A.PUSHUP_LOW, 0.36, 0, 'out'),
      f(PUSHUP_MID, 0.27, 0, 'in'),
      f(PUSHUP_QUARTER, 0.045, 0, 'linear'),
      f(A.PLANK_HIGH, 0.135, 0, 'out'),
      f(BURPEE_FLIGHT, 0.3, 0, 'out'),
      f(BURPEE_TUCK, 0.3, 0, 'out'),
      f(BURPEE_RISE, 0.34, 0, 'in'),
      f(BURPEE_DRIVE, 0.07, 0, 'linear'),
      f(BURPEE_APEX, 0.34, 0, 'out'),
      f(BURPEE_LAND, 0.4, 0, 'in'),
    ],
  },
  {
    id: 'squat-thrust',
    name: 'Squat Thrust',
    category: 'cardio',
    muscles: ['fullbody', 'core'],
    met: 8,
    cycle: 1.8,
    cues: ['Hands stay planted', 'Jump the feet back and in', 'No push-up, keep the rhythm going'],
    frames: [
      f(BURPEE_TUCK, 0.3, 0.1, 'out'),
      f(BURPEE_FLIGHT, 0.3, 0, 'out'),
      f(A.PLANK_HIGH, 0.3, 0.1, 'out'),
      f(BURPEE_FLIGHT, 0.3, 0, 'out'),
    ],
  },
  {
    id: 'star-jump',
    name: 'Star Jump',
    category: 'cardio',
    facing: 'front',
    muscles: ['fullbody', 'quads', 'shoulders'],
    met: 8,
    cycle: 1.4,
    cues: ['Load into a quarter squat', 'Explode into a full star', 'Land soft and reload'],
    frames: [
      f(STAR_LOAD, 0.4),
      f(STAR_TAKEOFF, 0.3, 0, 'in'),
      f(STAR_APEX, 0.4, 0, 'out'),
      f(STAR_LAND, 0.45, 0, 'in'),
    ],
  },
  {
    id: 'skater-jump',
    name: 'Skater Jumps',
    category: 'cardio',
    facing: 'front',
    muscles: ['glutes', 'quads', 'calves'],
    met: 7,
    cycle: 1.2,
    cues: ['Bound sideways, not up', 'Land on one leg and stick it', 'Swing the arms across the body'],
    frames: [
      f(SKATER_LAND, 0.3, 0, 'in'),
      f(SKATER_LOAD, 0.35, 0.05),
      f(SKATER_FLIGHT, 0.4, 0, 'out'),
      f(mirror(SKATER_LAND), 0.3, 0, 'in'),
      f(mirror(SKATER_LOAD), 0.35, 0.05),
      f(mirror(SKATER_FLIGHT), 0.4, 0, 'out'),
    ],
  },
  {
    id: 'bear-crawl',
    name: 'Bear Crawl',
    category: 'cardio',
    muscles: ['fullbody', 'core', 'shoulders'],
    met: 8,
    cycle: 1.6,
    cues: ['Knees hover a fist above the floor', 'Opposite hand and foot move together', 'Keep the back flat, hips low'],
    frames: [f(BEAR_A), f(BEAR_B), f(BEAR_C), f(BEAR_D)],
  },
  {
    id: 'shadow-boxing',
    name: 'Shadow Boxing',
    category: 'cardio',
    muscles: ['shoulders', 'core', 'fullbody'],
    met: 7,
    cycle: 1.2,
    cues: ['Hands up, chin down', 'Rotate the hips into every punch', 'Stay light on the feet'],
    frames: [
      f(GUARD, 0.5),
      f(JAB, 0.3, 0, 'out'),
      f(GUARD, 0.45),
      f(CROSS, 0.35, 0, 'out'),
    ],
  },
  {
    id: 'jump-rope',
    name: 'Jump Rope',
    category: 'cardio',
    muscles: ['calves', 'shoulders'],
    met: 8,
    cycle: 0.7,
    cues: ['Rope optional, the rhythm is the point', 'Small hops, quiet landings', 'Turn from the wrists'],
    frames: [
      f(ROPE_CONTACT, 0.4, 0, 'in'),
      f(ROPE_EXTEND, 0.3, 0, 'in'),
      f(ROPE_APEX, 0.3, 0, 'out'),
    ],
  },
]
