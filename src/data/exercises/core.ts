import type { Exercise } from './types'
import { A, f, v } from './shared'

// --- local anchors ---------------------------------------------------------------
// Solved so that every contact point stays put across a repetition. Supine poses lie on
// the line y = 92 with the head to the left; the ground is y = 96.

/** Lying on the back, arms resting on the floor by the hips, legs along the floor. */
const SUPINE = v(A.SUPINE_FLAT, {
  px: 50, py: 92, torso: -90, spine: 0, head: 0,
  uaL: 87, faL: 91, uaR: 85, faR: 89,
  thL: 92, shL: 92, ftL: 170, thR: 90, shR: 90, ftR: 168,
})

/** Lying on the back, knees bent, both feet flat on the floor at x = 62. */
const SUPINE_KNEES = v(SUPINE, { thL: 143, shL: 1, ftL: 93, thR: 143, shR: -1, ftR: 91 })

/** Hands at the temples while lying flat: elbows point at the ceiling. */
const TEMPLES_FLAT = { uaL: -156, faL: -27, uaR: -158, faR: -30 }

/**
 * Forearm plank: a straight line from the shoulders through the hips to the ankles,
 * elbows under the shoulders on the floor, forearms flat, toes tucked.
 */
const FOREARM_PLANK = v(A.PLANK_LOW, {
  px: 46.7, py: 84.3, torso: 76.6, spine: 0, head: -8,
  uaL: 2, faL: 90, uaR: -2, faR: 88,
  thL: -76.6, shL: -76.6, ftL: -150, thR: -77, shR: -77, ftR: -152,
})

/** Side plank on the far hand: hand at (27, 93), feet stacked at x = 86. */
const SIDE_PLANK_SAG = v(A.PLANK_HIGH, {
  px: 49.84, py: 76.43, torso: -61.5, spine: 0, head: 0,
  uaL: 0, faL: 0, thL: 65, shL: 65, ftL: 88,
  uaR: 180, faR: 180, thR: 64.4, shR: 64.4, ftR: 86,
})
const SIDE_PLANK_TALL = v(SIDE_PLANK_SAG, { px: 50.56, py: 75.0, torso: -65, thL: 62.7, shL: 62.7, thR: 62.1, shR: 62.1 })

/**
 * Mountain climber base: hands where PLANK_HIGH puts them (shoulders over the hands at
 * x = 76), hips a touch higher than a push-up plank so a knee can pass under them.
 */
const MC_BASE = v(A.PLANK_HIGH, { px: 51.0, py: 74.2, torso: 74, head: -8 })
const MC_R_IN = v(MC_BASE, { thR: 100, shR: -40, ftR: -150, thL: -59, shL: -59, ftL: -150 })
const MC_L_IN = v(MC_BASE, { thL: 100, shL: -40, ftL: -150, thR: -59, shR: -59, ftR: -150 })
/** Both feet airborne mid-switch: R driving back, L coming through. Hips hop up a unit. */
const MC_SWITCH_R_BACK = v(MC_BASE, {
  px: 50.4, py: 71.5, torso: 80,
  thR: 10, shR: -125, ftR: -150, thL: -30, shL: -120, ftL: -150,
})
const MC_SWITCH_L_BACK = v(MC_BASE, {
  px: 50.4, py: 71.5, torso: 80,
  thL: 10, shL: -125, ftL: -150, thR: -30, shR: -120, ftR: -150,
})

/** Bicycle crunch trunk: shoulders off the floor, hands at the temples. */
const BICYCLE_TRUNK = v(SUPINE, { torso: -80, spine: 22, head: 12 })
// Elbow bend held at a constant +129 degrees in all three: the forearm angle is always
// the upper-arm angle plus the bend, so interpolating between them rotates the whole arm
// instead of folding it shut half way.
const BIKE_ARM_FWD = { ua: -201, fa: -72 }
const BIKE_ARM_BACK = { ua: -81, fa: 48 }
const BIKE_ARM_MID = { ua: -141, fa: -12 }

/** Seated V for the Russian twist: heels on the floor, chest proud, leaned back. */
const TWIST_SEAT = v(SUPINE, {
  px: 50, py: 90, torso: -40, spine: 8, head: 5,
  thL: 131, shL: 19, ftL: 86, thR: 130, shR: 20, ftR: 84,
})

/** Dead bug: everything pointing at the ceiling. */
const DEAD_BUG_UP = v(SUPINE, {
  px: 57,
  uaL: 181, faL: 181, uaR: 179, faR: 179,
  thL: 181, shL: 91, ftL: 171, thR: 179, shR: 89, ftR: 169,
})

/** Face down, arms long overhead, soft elbows so the hands stay on the stage. */
const PRONE_LONG = v(A.PRONE_FLAT, {
  px: 44, py: 90, torso: 92, spine: 0, head: 6,
  uaL: 107, faL: 79, uaR: 105, faR: 77,
  thL: -90, shL: -90, ftL: -30, thR: -92, shR: -92, ftR: -32,
})

export const CORE: Exercise[] = [
  {
    id: 'plank',
    name: 'Forearm Plank',
    category: 'core',
    muscles: ['core', 'shoulders', 'glutes'],
    met: 3.3,
    cycle: 6,
    hold: true,
    cues: ['Elbows under the shoulders', 'Squeeze the glutes, tuck the ribs', 'Do not let the hips drift up'],
    frames: [
      f(FOREARM_PLANK, 1, 3),
      f(v(FOREARM_PLANK, { torso: 77, spine: 2, head: -10 }), 1, 3),
    ],
  },
  {
    id: 'side-plank',
    name: 'Side Plank',
    category: 'core',
    muscles: ['obliques', 'core', 'shoulders'],
    met: 3.3,
    cycle: 6,
    hold: true,
    unilateral: true,
    cues: ['Elbow or hand under the shoulder', 'Stack the hips and drive them up', 'Head in line with the spine'],
    frames: [f(SIDE_PLANK_SAG, 1, 3), f(SIDE_PLANK_TALL, 1, 3)],
  },
  {
    id: 'mountain-climber',
    name: 'Mountain Climbers',
    category: 'core',
    muscles: ['core', 'hipflexors', 'shoulders'],
    met: 8,
    cycle: 0.9,
    cues: ['Shoulders stay over the hands', 'Drive the knee to the chest', 'Hips stay low and level'],
    frames: [
      // the knee drive settles at the chest, the switch is fast and airborne
      f(MC_R_IN, 1, 0, 'inout'),
      f(MC_SWITCH_R_BACK, 1, 0, 'in'),
      f(MC_L_IN, 1, 0, 'inout'),
      f(MC_SWITCH_L_BACK, 1, 0, 'in'),
    ],
  },
  {
    id: 'flutter-kicks',
    name: 'Flutter Kicks',
    category: 'core',
    muscles: ['core', 'hipflexors'],
    met: 5,
    cycle: 0.9,
    cues: ['Lower back pressed into the floor', 'Small, fast kicks', 'Heels never touch down'],
    frames: [
      f(v(SUPINE, { spine: 6, head: 18, uaL: 99, faL: 93, uaR: 97, faR: 91, thL: 116, shL: 116, ftL: 131, thR: 104, shR: 104, ftR: 119 })),
      f(v(SUPINE, { spine: 6, head: 18, uaL: 99, faL: 93, uaR: 97, faR: 91, thL: 104, shL: 104, ftL: 119, thR: 116, shR: 116, ftR: 131 })),
    ],
  },
  {
    id: 'leg-raise',
    name: 'Lying Leg Raise',
    category: 'core',
    muscles: ['core', 'hipflexors'],
    met: 5,
    cycle: 3,
    cues: ['Legs straight, toes pointed', 'Lower slowly, stop before the back arches', 'Hands under the hips if needed'],
    frames: [
      f(v(SUPINE, { px: 49, thL: 97, shL: 97, ftL: 112, thR: 95, shR: 95, ftR: 110 }), 1.4),
      f(v(SUPINE, { px: 49, thL: 171, shL: 171, ftL: 186, thR: 169, shR: 169, ftR: 184 }), 0.9, 0.1),
    ],
  },
  {
    id: 'reverse-crunch',
    name: 'Reverse Crunch',
    category: 'core',
    muscles: ['core'],
    met: 4.5,
    cycle: 2.4,
    cues: ['Knees towards the chest', 'Lift the hips off the floor', 'Control the way back down'],
    frames: [
      f(v(SUPINE, { thL: 150, shL: 60, ftL: 130, thR: 148, shR: 58, ftR: 128 }), 1.3),
      f(v(SUPINE, { py: 89, torso: -100, spine: 10, head: 6, thL: 200, shL: 110, ftL: 180, thR: 198, shR: 108, ftR: 178 }), 0.9, 0.15),
    ],
  },
  {
    id: 'hollow-hold',
    name: 'Hollow Hold',
    category: 'core',
    muscles: ['core', 'hipflexors'],
    met: 4,
    cycle: 6,
    hold: true,
    cues: ['Lower back glued to the floor', 'Arms by the ears, legs low', 'Bend the knees to make it easier'],
    frames: [
      f(v(SUPINE, { torso: -82, spine: 18, head: 15, uaL: 226, faL: 224, uaR: 224, faR: 222, thL: 113, shL: 113, ftL: 128, thR: 111, shR: 111, ftR: 126 }), 1, 3),
      f(v(SUPINE, { torso: -81, spine: 17, head: 14, uaL: 225, faL: 223, uaR: 223, faR: 221, thL: 111, shL: 111, ftL: 126, thR: 109, shR: 109, ftR: 124 }), 1, 3),
    ],
  },
  {
    id: 'sit-up',
    name: 'Sit-Up',
    category: 'core',
    muscles: ['core', 'hipflexors'],
    met: 4.5,
    cycle: 2.4,
    cues: ['Feet flat, knees bent', 'Roll up one vertebra at a time', 'Do not yank on the neck'],
    frames: [
      // flat, then the chin tucks and the upper back peels off, then seated with the elbows towards the knees
      f(v(SUPINE_KNEES, TEMPLES_FLAT), 0.8),
      f(v(SUPINE_KNEES, { torso: -75, spine: 24, head: 18, uaL: -213, faL: -84, uaR: -215, faR: -87 }), 0.6),
      f(v(SUPINE_KNEES, { torso: -15, spine: 15, head: 10, uaL: -256, faL: -127, uaR: -258, faR: -130 }), 0.6, 0.1),
      f(v(SUPINE_KNEES, { torso: -55, spine: 20, head: 12, uaL: -223, faL: -94, uaR: -225, faR: -97 }), 0.8),
    ],
  },
  {
    id: 'crunch',
    name: 'Crunch',
    category: 'core',
    muscles: ['core'],
    met: 3.8,
    cycle: 2,
    cues: ['Lift only the shoulder blades', 'Chin off the chest, eyes to the ceiling', 'Exhale at the top'],
    frames: [
      f(v(SUPINE_KNEES, TEMPLES_FLAT), 1.1),
      f(v(SUPINE_KNEES, { torso: -85, spine: 22, head: 12, uaL: -195, faL: -66, uaR: -197, faR: -69 }), 0.8, 0.15),
    ],
  },
  {
    id: 'v-up',
    name: 'V-Up',
    category: 'core',
    muscles: ['core', 'hipflexors'],
    met: 6,
    cycle: 2.6,
    cues: ['Arms and legs meet over the middle', 'Keep the legs straight if you can', 'Lower without touching down'],
    frames: [
      // hovering hollow start, the V with hands on the shins, arms sweeping back over the top on the way down
      f(v(SUPINE, { px: 52.4, torso: -88, spine: 4, head: 12, uaL: 231, faL: 229, uaR: 229, faR: 227, thL: 110, shL: 110, ftL: 125, thR: 108, shR: 108, ftR: 123 }), 0.7),
      f(v(SUPINE, { px: 52.4, torso: -40, spine: 12, head: 12, uaL: 105, faL: 102, uaR: 103, faR: 100, thL: 148, shL: 148, ftL: 160, thR: 146, shR: 146, ftR: 158 }), 0.9, 0.1),
      f(v(SUPINE, { px: 52.4, torso: -72, spine: 8, head: 12, uaL: 186, faL: 184, uaR: 184, faR: 182, thL: 125, shL: 125, ftL: 140, thR: 123, shR: 123, ftR: 138 }), 0.6),
    ],
  },
  {
    id: 'toe-touch',
    name: 'Toe Touches',
    category: 'core',
    muscles: ['core'],
    met: 4.5,
    cycle: 2,
    cues: ['Legs vertical the whole time', 'Reach past the toes', 'Short, sharp crunch at the top'],
    frames: [
      f(v(SUPINE, { head: 8, thL: 178, shL: 178, ftL: 190, thR: 176, shR: 176, ftR: 188, uaL: 161, faL: 159, uaR: 159, faR: 157 }), 1.1),
      f(v(SUPINE, { torso: -80, spine: 25, head: 12, thL: 182, shL: 182, ftL: 194, thR: 180, shR: 180, ftR: 192, uaL: 143, faL: 140, uaR: 141, faR: 138 }), 0.8, 0.1),
    ],
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist',
    category: 'core',
    muscles: ['obliques', 'core'],
    met: 5,
    cycle: 2,
    cues: ['Lean back until you feel the abs switch on', 'Rotate the ribs, not just the hands', 'Feet up to make it harder'],
    frames: [
      // hands together in front of the chest, swept to one hip and back through the middle to the other
      f(v(TWIST_SEAT, { uaL: 75, faL: 138, uaR: 73, faR: 136 }), 1, 0, 'in'),
      f(v(TWIST_SEAT, { torso: -43, uaR: 8, faR: 129, uaL: 122, faL: 1 }), 1, 0, 'out'),
      f(v(TWIST_SEAT, { uaL: 75, faL: 138, uaR: 73, faR: 136 }), 1, 0, 'in'),
      f(v(TWIST_SEAT, { torso: -43, uaL: 8, faL: 129, uaR: 122, faR: 1 }), 1, 0, 'out'),
    ],
  },
  {
    id: 'bicycle-crunch',
    name: 'Bicycle Crunch',
    category: 'core',
    muscles: ['obliques', 'core', 'hipflexors'],
    met: 6,
    cycle: 1.6,
    cues: ['Opposite elbow towards opposite knee', 'Extend the other leg long and low', 'Slow beats fast here'],
    frames: [
      // far knee in, near elbow driving to it; then the legs pedal (out along the top, back along the bottom)
      f(v(BICYCLE_TRUNK, { thL: 165, shL: 72, ftL: 142, thR: 104, shR: 104, ftR: 118, uaR: BIKE_ARM_FWD.ua, faR: BIKE_ARM_FWD.fa, uaL: BIKE_ARM_BACK.ua, faL: BIKE_ARM_BACK.fa })),
      f(v(BICYCLE_TRUNK, { torso: -83, spine: 18, thL: 135, shL: 100, ftL: 115, thR: 125, shR: 60, ftR: 130, uaR: BIKE_ARM_MID.ua, faR: BIKE_ARM_MID.fa, uaL: BIKE_ARM_MID.ua - 1, faL: BIKE_ARM_MID.fa + 1 })),
      f(v(BICYCLE_TRUNK, { thR: 165, shR: 72, ftR: 142, thL: 104, shL: 104, ftL: 118, uaL: BIKE_ARM_FWD.ua, faL: BIKE_ARM_FWD.fa, uaR: BIKE_ARM_BACK.ua, faR: BIKE_ARM_BACK.fa })),
      f(v(BICYCLE_TRUNK, { torso: -83, spine: 18, thR: 135, shR: 100, ftR: 115, thL: 125, shL: 60, ftL: 130, uaR: BIKE_ARM_MID.ua, faR: BIKE_ARM_MID.fa, uaL: BIKE_ARM_MID.ua - 1, faL: BIKE_ARM_MID.fa + 1 })),
    ],
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    category: 'core',
    muscles: ['core'],
    met: 3.8,
    cycle: 3.6,
    cues: ['Lower back stays pinned to the floor', 'Opposite arm and leg, slowly', 'Breathe out as you extend'],
    frames: [
      // arms and shins to the ceiling; opposite arm and leg reach away and hover, then return
      f(DEAD_BUG_UP, 1),
      f(v(DEAD_BUG_UP, { uaR: 248, faR: 242, thL: 122, shL: 122, ftL: 137 }), 1.2, 0.2),
      f(DEAD_BUG_UP, 1),
      f(v(DEAD_BUG_UP, { uaL: 248, faL: 242, thR: 122, shR: 122, ftR: 137 }), 1.2, 0.2),
    ],
  },
  {
    id: 'superman',
    name: 'Superman',
    category: 'core',
    muscles: ['back', 'glutes'],
    met: 3.8,
    cycle: 2.4,
    cues: ['Lift the chest and thighs together', 'Reach long, do not crank the neck', 'Squeeze for a beat at the top'],
    frames: [
      f(PRONE_LONG, 1.2),
      f(v(PRONE_LONG, {
        torso: 80, spine: -18, head: -6,
        uaL: 123, faL: 121, uaR: 121, faR: 119,
        thL: -98, shL: -98, ftL: -30, thR: -100, shR: -100, ftR: -32,
      }), 1, 0.3),
    ],
  },
]
