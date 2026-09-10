import type { Exercise } from './types'
import { A, f, v } from './shared'

// --- local anchors -------------------------------------------------------------

/** Jumping jack: feet together, arms at the sides, knees soft from the landing. */
const JJ_IN = v(A.STAND_FRONT, { uaL: -8, faL: -9, uaR: 8, faR: 9, thL: -3, shL: -2, thR: 3, shR: 2 })
/** Jumping jack apex: off the floor, legs half way, arms passing shoulder height, toes pointed. */
const JJ_AIR = v(A.STAND_FRONT, {
  py: 51,
  uaL: -90, faL: -100, uaR: 90, faR: 100,
  thL: -14, shL: -12, ftL: -55, thR: 14, shR: 12, ftR: 55,
})
/** Jumping jack landed wide: knees out over the feet, hands nearly touching overhead. */
const JJ_WIDE = v(A.STAND_FRONT, {
  py: 58.8,
  uaL: -160, faL: -175, uaR: 160, faR: 175,
  thL: -27, shL: -15, ftL: -105, thR: 27, shR: 15, ftR: 105,
})

/** Shoulder-width stance for the twists; STAND_FRONT keeps the feet nearly together. */
const STANCE_FRONT = v(A.STAND_FRONT, { thL: -6, shL: -4, thR: 6, shR: 4 })

/**
 * Running drills are up on the balls of the feet: the support ankle sits at y = 92 so the
 * toe (ft 55) touches the floor at x = 50, just ahead of the pelvis.
 */
const RUN_BASE = v(A.STAND_SIDE, { py: 52.1, torso: 5, head: 2 })

/** Leg swing support: the left foot is planted at x = 45.6 and never moves. */
const SWING_BASE = v(A.STAND_SIDE, { thL: -2, shL: -1, ftL: 80 })

export const WARMUP: Exercise[] = [
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    category: 'warmup',
    facing: 'front',
    muscles: ['fullbody', 'calves', 'shoulders'],
    met: 8,
    cycle: 1,
    cues: ['Land softly on the balls of your feet', 'Arms all the way overhead', 'Keep a steady rhythm'],
    // Ground, air, ground, air: the arms pass shoulder height at the apex of each hop. The
    // limbs accelerate into the mid frame ('in') and settle into the ends ('out'), which is
    // the bell-shaped speed of a swing; the short hop rides along with them.
    frames: [
      f(JJ_IN, 1, 0, 'out'),
      f(JJ_AIR, 1, 0, 'in'),
      f(JJ_WIDE, 1, 0, 'out'),
      f(JJ_AIR, 1, 0, 'in'),
    ],
  },
  {
    id: 'arm-circles',
    name: 'Arm Circles',
    category: 'warmup',
    facing: 'front',
    muscles: ['shoulders'],
    met: 3.5,
    cycle: 2.4,
    cues: ['Draw the biggest circle you can', 'Half the reps forward, half backward', 'Keep the elbows long'],
    // Seen head-on, a sagittal circle is the arm rising and falling at the side; the
    // depth is what the camera cannot show. Full range, straight arms. The timing is the
    // height of a point on a wheel: fastest through shoulder height ('in' towards it, 'out'
    // away from it), dwelling at the top and bottom where the hand is really travelling
    // fore and aft. A pause at the horizontal would read as two lateral raises.
    frames: [
      f(v(A.STAND_FRONT, { uaL: -12, faL: -16, uaR: 12, faR: 16 }), 1, 0, 'out'),
      f(v(A.STAND_FRONT, { uaL: -92, faL: -96, uaR: 92, faR: 96 }), 1, 0, 'in'),
      f(v(A.STAND_FRONT, { uaL: -158, faL: -166, uaR: 158, faR: 166 }), 1, 0, 'out'),
      f(v(A.STAND_FRONT, { uaL: -92, faL: -96, uaR: 92, faR: 96 }), 1, 0, 'in'),
    ],
  },
  {
    id: 'arm-swings',
    name: 'Arm Swings',
    category: 'warmup',
    facing: 'front',
    muscles: ['chest', 'shoulders', 'back'],
    met: 3.5,
    cycle: 1.6,
    cues: ['Swing wide to open the chest', 'Cross low, open high', 'Stay tall through the ribs'],
    // A pendulum: fastest as the arms pass the sides, slowing into the open and crossed
    // ends. The forearms fold across in front of the hips at the bottom.
    frames: [
      f(v(A.STAND_FRONT, { uaL: -100, faL: -104, uaR: 100, faR: 104 }), 1, 0.15, 'out'),
      f(v(A.STAND_FRONT, { uaL: -8, faL: -10, uaR: 8, faR: 10 }), 1, 0, 'in'),
      f(v(A.STAND_FRONT, { uaL: 18, faL: 62, uaR: -18, faR: -62 }), 0.35, 0, 'out'),
      f(v(A.STAND_FRONT, { uaL: -8, faL: -10, uaR: 8, faR: 10 }), 0.35, 0, 'in'),
    ],
  },
  {
    id: 'torso-twists',
    name: 'Torso Twists',
    category: 'warmup',
    facing: 'front',
    muscles: ['obliques', 'core', 'back'],
    met: 3.5,
    cycle: 1.6,
    cues: ['Rotate from the ribs, not the arms', 'Hips stay square to the front', 'Let the arms follow loosely'],
    // The rotation itself has no depth to show head-on, so the loose arms carry it: the
    // arm on the trailing side wraps across the chest with the forearm hanging, the arm on
    // the leading side swings out low and wide, and both pass the sides hanging straight
    // as the shoulders come through neutral. A few degrees of torso follow the shoulders.
    frames: [
      f(v(STANCE_FRONT, { torso: -3, uaR: -70, faR: -20, uaL: -35, faL: -25 }), 1, 0, 'out'),
      f(v(STANCE_FRONT, { uaR: 8, faR: 12, uaL: -8, faL: -12 }), 1, 0, 'in'),
      f(v(STANCE_FRONT, { torso: 3, uaL: 70, faL: 20, uaR: 35, faR: 25 }), 1, 0, 'out'),
      f(v(STANCE_FRONT, { uaR: 8, faR: 12, uaL: -8, faL: -12 }), 1, 0, 'in'),
    ],
  },
  {
    id: 'high-knees',
    name: 'High Knees',
    category: 'warmup',
    muscles: ['hipflexors', 'quads', 'calves'],
    met: 8,
    cycle: 0.8,
    cues: ['Knee above hip height', 'Stay on the balls of the feet', 'Pump the arms hard'],
    // A run in place, so the cycle is the runner's: knee at the top while the support leg
    // is tall on its toes, then TOUCHDOWN, the lifted foot landing on the planted spot with
    // a soft knee (pelvis 0.9 lower) while the other heel peels off and its knee is already
    // on the way up, then the mirror. There is no long flight: one foot is always on or a
    // hair off the floor, which is what stops the figure floating. The landing legs were
    // solved so the ball of the foot hits x = 50.2 exactly where the support foot stood.
    // Toe up on the driving knee. Elbows at ninety: hand to the chin in front, hand to the
    // hip pocket behind, passing each other at touchdown.
    frames: [
      f(v(RUN_BASE, { thR: 100, shR: 15, ftR: 105, thL: -3, shL: -3, ftL: 55, uaL: 45, faL: 135, uaR: -40, faR: 50 }), 1, 0, 'linear'),
      f(v(RUN_BASE, { py: 53, thR: 9.1, shR: -15.2, ftR: 55, thL: 12, shL: -20, ftL: 60, uaL: 5, faL: 95, uaR: -5, faR: 85 }), 1, 0, 'linear'),
      f(v(RUN_BASE, { thL: 100, shL: 15, ftL: 105, thR: -3, shR: -3, ftR: 55, uaR: 45, faR: 135, uaL: -40, faL: 50 }), 1, 0, 'linear'),
      f(v(RUN_BASE, { py: 53, thL: 9.1, shL: -15.2, ftL: 55, thR: 12, shR: -20, ftR: 60, uaR: 5, faR: 95, uaL: -5, faL: 85 }), 1, 0, 'linear'),
    ],
  },
  {
    id: 'butt-kicks',
    name: 'Butt Kicks',
    category: 'warmup',
    muscles: ['hamstrings', 'calves'],
    met: 8,
    cycle: 0.8,
    cues: ['Heel to the seat', 'Keep the knees pointing down', 'Quick, light contacts'],
    // Same runner's cycle as the high knees, with the action behind: the thigh stays near
    // vertical while the shin folds the heel up to the seat, the support leg tall on its
    // toes. At TOUCHDOWN the kicking foot lands on the planted spot (solved, x = 50.2) with a
    // soft knee, pelvis 1.3 lower, while the other heel is already peeling up and back. The
    // shin sweeps down through horizontal on the way to the floor, which is the arc a heel
    // flick really follows.
    frames: [
      f(v(RUN_BASE, { torso: 3, head: 0, thR: -12, shR: -160, ftR: -90, thL: -3, shL: -3, ftL: 55, uaL: 30, faL: 120, uaR: -30, faR: 60 }), 1, 0, 'linear'),
      f(v(RUN_BASE, { torso: 3, head: 0, py: 53.4, thR: 5.8, shR: -13.2, ftR: 62, thL: 0, shL: -18, ftL: 75, uaL: 5, faL: 95, uaR: -5, faR: 85 }), 1, 0, 'linear'),
      f(v(RUN_BASE, { torso: 3, head: 0, thL: -12, shL: -160, ftL: -90, thR: -3, shR: -3, ftR: 55, uaR: 30, faR: 120, uaL: -30, faL: 60 }), 1, 0, 'linear'),
      f(v(RUN_BASE, { torso: 3, head: 0, py: 53.4, thL: 5.8, shL: -13.2, ftL: 62, thR: 0, shR: -18, ftR: 75, uaR: 5, faR: 95, uaL: -5, faL: 85 }), 1, 0, 'linear'),
    ],
  },
  {
    id: 'leg-swings',
    name: 'Leg Swings',
    category: 'warmup',
    muscles: ['hamstrings', 'hipflexors', 'glutes'],
    met: 3.5,
    cycle: 1.8,
    unilateral: true,
    cues: ['Swing from the hip, not the back', 'Only as high as control allows', 'Support yourself if you need to'],
    // The near leg swings front to back over a planted far foot. The pelvis shifts a
    // little against the swing (the support leg re-solved each time so its foot stays at
    // x = 45.6), the torso counter-leans a few degrees, and the arms drift the other way.
    // The pass-through frames keep the knee soft and the toe up so nothing catches the floor.
    frames: [
      f(v(SWING_BASE, { px: 45.6, torso: -3, spine: 2, thL: 0, shL: 0, thR: 65, shR: 55, ftR: 140, uaL: 12, faL: 14, uaR: 10, faR: 12 }), 0.7, 0, 'out'),
      f(v(SWING_BASE, { torso: 2, thR: 14, shR: -16, ftR: 100, uaL: 23, faL: 26, uaR: 21, faR: 24 }), 0.5, 0, 'in'),
      f(v(SWING_BASE, { px: 47.6, torso: 6, spine: -3, head: -3, thL: -2.9, shL: -2.9, thR: -35, shR: -50, ftR: 20, uaL: 34, faL: 38, uaR: 32, faR: 36 }), 0.6, 0, 'out'),
      f(v(SWING_BASE, { torso: 2, thR: 14, shR: -16, ftR: 100, uaL: 23, faL: 26, uaR: 21, faR: 24 }), 0.5, 0, 'in'),
    ],
  },
  {
    id: 'inchworm',
    name: 'Inchworm',
    category: 'warmup',
    muscles: ['hamstrings', 'core', 'shoulders'],
    met: 5,
    cycle: 6,
    cues: ['Walk the hands out to a plank', 'Keep the legs as straight as they allow', 'Walk the feet back in'],
    // A travelling exercise: fold, walk the hands out to a high plank one hand at a time,
    // walk the feet in one foot at a time, stand. The figure covers 43.5 units per rep, so
    // the loop cuts from the final standing pose back to the first (d = 0 on frame 0)
    // rather than sliding the figure back.
    //
    // Poses were solved with two-link IK so the planted contacts never move: feet at
    // x = 18.6 / 18.1 from the fold to the plank, hands at x = 79 / 77 from the plank to the
    // final fold. Tucked toes are written as 210 (= -150) so a flat foot rolls up onto its
    // toes through vertical rather than through the floor.
    frames: [
      // stand, left
      f({ px: 16.5, py: 56, torso: 0, spine: 0, head: 0, uaL: 12, faL: 14, thL: 3, shL: 3, ftL: 80, uaR: -8, faR: -10, thR: 2.3, shR: 2.3, ftR: 80 }, 0, 0, 'linear'),
      // fold, hands to the floor
      f({ px: 11.5, py: 56.5, torso: 113, spine: 4, head: 12, uaL: -8.5, faL: 10.9, thL: 10.2, shL: 10.2, ftL: 80, uaR: -12.1, faR: 6.4, thR: 12.4, shR: 6.6, ftR: 80 }, 0.7),
      // L hand lifts
      f({ px: 17, py: 57, torso: 116, spine: 6, head: 6, uaL: -23.7, faL: 61.1, thL: 15.6, shL: -10.9, ftL: 80, uaR: -32.7, faR: 7.6, thR: 15, shR: -11.8, ftR: 80 }, 0.25, 0, 'out'),
      // L hand lands
      f({ px: 23, py: 57, torso: 120, spine: 6, head: 0, uaL: 9.7, faL: 43.5, thL: 5.4, shL: -18.3, ftL: 80, uaR: -42.9, faR: -4.6, thR: 4.2, shR: -18.6, ftR: 80 }, 0.25),
      // R hand lifts
      f({ px: 27.5, py: 57.5, torso: 118, spine: 5, head: 0, uaL: -8.2, faL: 41.1, thL: -3.3, shL: -22.8, ftL: 80, uaR: -58.6, faR: 34.2, thR: -5, shR: -22.5, ftR: 80 }, 0.25, 0, 'out'),
      // R hand lands
      f({ px: 32, py: 58.4, torso: 113, spine: 4, head: -2, uaL: -19, faL: 26.8, thL: -14.3, shL: -25.1, ftL: 80, uaR: -23.5, faR: 22.6, thR: -19.3, shR: -21.4, ftR: 80 }, 0.25),
      // L hand lifts
      f({ px: 36.8, py: 60.5, torso: 109, spine: 3, head: -4, uaL: -21.7, faL: 62.3, thL: -21.5, shL: -32.9, ftL: 80, uaR: -32.9, faR: 8.2, thR: -27.8, shR: -27.9, ftR: 80 }, 0.25, 0, 'out'),
      // L hand lands at the plank position
      f({ px: 41, py: 63.3, torso: 105, spine: 2, head: -6, uaL: 18.8, faL: 35.7, thL: -25.9, shL: -43.1, ftL: 80, uaR: -39, faR: -6.4, thR: -29.9, shR: -40.2, ftR: 80 }, 0.25),
      // R hand lifts, heels start to rise
      f({ px: 48, py: 70, torso: 85, spine: 0, head: -8, uaL: 2.6, faL: 18.4, thL: -37, shL: -60.2, ftL: 145, uaR: -53.6, faR: 17.3, thR: -40.6, shR: -57.6, ftR: 143 }, 0.25, 0, 'out'),
      // high plank
      f({ px: 54.6, py: 78.4, torso: 64, spine: 0, head: -8, uaL: 2, faL: 2.1, thL: -64.1, shL: -64.1, ftL: 210, uaR: -1.9, faR: -1.9, thR: -65, shR: -65, ftR: 208 }, 0.3, 0.25),
      // R foot lifts
      f({ px: 48, py: 69, torso: 88, spine: 0, head: -8, uaL: -1.5, faL: 22.7, thL: -42.6, shL: -52.5, ftL: 210, uaR: -7.9, faR: 21.2, thR: 2.8, shR: -88.5, ftR: 60 }, 0.22, 0, 'out'),
      // R foot lands
      f({ px: 46, py: 68, torso: 90, spine: 2, head: -6, uaL: 3.5, faL: 25.8, thL: -32.3, shL: -56.6, ftL: 210, uaR: -4, faR: 25.7, thR: 31.8, shR: -56.6, ftR: 80 }, 0.22),
      // L foot lifts
      f({ px: 45, py: 63, torso: 105, spine: 3, head: -4, uaL: 0, faL: 40.4, thL: 11.4, shL: -71.4, ftL: 100, uaR: -7.1, faR: 39.6, thR: 24.5, shR: -42.3, ftR: 80 }, 0.22, 0, 'out'),
      // L foot lands
      f({ px: 44, py: 58, torso: 117, spine: 4, head: 0, uaL: 13.1, faL: 39.2, thL: 12.3, shL: -23.3, ftL: 80, uaR: 3.7, faR: 41.4, thR: 10.9, shR: -23.4, ftR: 80 }, 0.22),
      // R foot lifts
      f({ px: 49, py: 58.5, torso: 115, spine: 4, head: 2, uaL: -7.6, faL: 38.9, thL: 3.3, shL: -29.3, ftL: 80, uaR: -13.8, faR: 36.9, thR: 43.9, shR: -36.4, ftR: 100 }, 0.22, 0, 'out'),
      // R foot lands
      f({ px: 54, py: 60, torso: 106, spine: 4, head: 4, uaL: -13.7, faL: 15.9, thL: -4.6, shL: -37, ftL: 80, uaR: -17.4, faR: 11.4, thR: 35.4, shR: -11.5, ftR: 80 }, 0.22),
      // L foot lifts
      f({ px: 54.3, py: 58.5, torso: 110, spine: 4, head: 6, uaL: -14.5, faL: 18.1, thL: 33.7, shL: -46.1, ftL: 100, uaR: -18.4, faR: 13.7, thR: 28.7, shR: -6.7, ftR: 80 }, 0.22, 0, 'out'),
      // fold, right
      f({ px: 55, py: 56.5, torso: 113, spine: 4, head: 12, uaL: -8.5, faL: 10.9, thL: 10.2, shL: 10.2, ftL: 80, uaR: -12.1, faR: 6.4, thR: 12.4, shR: 6.6, ftR: 80 }, 0.22),
      // stand, right
      f({ px: 60, py: 56, torso: 0, spine: 0, head: 0, uaL: 12, faL: 14, thL: 3, shL: 3, ftL: 80, uaR: -8, faR: -10, thR: 2.3, shR: 2.3, ftR: 80 }, 0.7, 0.4),
    ],
  },
]
