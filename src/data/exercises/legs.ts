import type { Exercise } from './types'
import { A, f, v } from './shared'

/**
 * Lower-body poses. Every pose below was solved so that the planted feet sit at identical
 * coordinates across a repetition: the legs were inverse-kinematics-solved from a fixed
 * ankle, not eyeballed. Where a leg unfolds a long way (a squat, a lunge) an exactly solved
 * mid keyframe is inserted, because straight interpolation of thigh and shin angles bows
 * the foot through the floor half-way.
 *
 * Standing side-on, STAND_SIDE puts the far (L) ankle at (48.7, 95.9) and the near (R) ankle
 * at (44.5, 95.9). Lunges plant the rear foot on its toes with the ankle raised (ft 55,
 * ankle y 91.8) so the wedge reads as a foot standing on its ball.
 */

// --- squat: hips back first, knees over the toes, arms forward as a counterbalance -------
const SQ_TALL = v(A.STAND_SIDE, { torso: 2 })
const SQ_QTR = v(A.STAND_SIDE, { px: 44.2, py: 59.2, torso: 12, head: -3, uaL: 24, faL: 30, thL: 29.4, shL: -15.4, uaR: 22, faR: 28, thR: 23.9, shR: -23 })
const SQ_MID = v(A.STAND_SIDE, { px: 40, py: 64.5, torso: 22, head: -6, uaL: 40, faL: 48, thL: 50.9, shL: -20, uaR: 38, faR: 46, thR: 45.7, shR: -29.4 })
const SQ_LOW = v(A.STAND_SIDE, { px: 35.5, py: 73.5, torso: 35, head: -12, uaL: 72, faL: 82, thL: 80, shL: -18.9, uaR: 70, faR: 80, thR: 74.8, shR: -31 })

// --- jump squat: arms swing back at the bottom and forward through the drive; the toes
// stay planted as the heels leave the floor, then the feet point in the air ---------------
const JS_LOW = v(SQ_LOW, { head: -10, uaL: -35, faL: -45, uaR: -38, faR: -48 })
const JS_MID = v(SQ_MID, { uaL: 20, faL: 30, uaR: 18, faR: 28 })
const JS_QTR = v(SQ_QTR, { uaL: 65, faL: 80, uaR: 63, faR: 78 })
const JS_TOE = v(A.STAND_SIDE, { px: 49, py: 51.9, torso: 2, uaL: 100, faL: 114, ftL: 40, uaR: 98, faR: 112, ftR: 40 })
const JS_PEAK = v(A.STAND_SIDE, { px: 49.6, py: 42.5, torso: 2, uaL: 112, faL: 126, shL: 3, ftL: 25, uaR: 110, faR: 124, shR: -3, ftR: 25 })
const JS_LAND = v(A.STAND_SIDE, { px: 43.5, py: 61, torso: 18, head: -6, uaL: 55, faL: 65, thL: 36.6, shL: -19.6, uaR: 53, faR: 63, thR: 30.8, shR: -27.6 })

// --- sumo squat, front on: feet wide and turned out, knees pushed out, hands on hips ------
const SU_TOP = v(A.STAND_FRONT, { py: 58.6, uaL: -35, faL: 21, thL: -30.1, shL: -11.4, ftL: -125, uaR: 35, faR: -21, thR: 30.1, shR: 11.4, ftR: 125 })
const SU_MID = v(A.STAND_FRONT, { py: 66.5, uaL: -35, faL: 21, thL: -62.2, shL: 10.6, ftL: -125, uaR: 35, faR: -21, thR: 62.2, shR: -10.6, ftR: 125 })
const SU_LOW = v(A.STAND_FRONT, { py: 74, uaL: -35, faL: 21, thL: -83.2, shL: 17, ftL: -125, uaR: 35, faR: -21, thR: 83.2, shR: -17, ftR: 125 })

// --- split squat: front foot at x 60.5, rear toes at x 28; the hips drop straight down,
// the front shin stays near vertical and the rear knee finishes just above the floor ------
const SP_TALL = v(A.STAND_SIDE, { px: 47, py: 58, torso: 4, uaL: -20.6, faL: 20.7, thL: -15.1, shL: -43.6, ftL: 55, uaR: -20.6, faR: 20.7, thR: 24.7, shR: 14.9 })
const SP_MID = v(A.STAND_SIDE, { px: 46.2, py: 65.5, torso: 6, head: -2, uaL: -22.8, faL: 19.1, thL: 2.2, shL: -71.6, ftL: 55, uaR: -22.8, faR: 19.1, thR: 59.3, shR: -8.3 })
const SP_LOW = v(A.STAND_SIDE, { px: 45.5, py: 72.5, torso: 8, head: -4, uaL: -25, faL: 17.5, thL: 7.2, shL: -91.6, ftL: 55, uaR: -25, faR: 17.5, thR: 79.8, shR: -13.5 })

// --- reverse lunge: the near leg steps back, touches down on its toes, the hips sink, then
// the front heel drives the body back up while the rear foot swings forward ---------------
const RL_STAND = v(A.STAND_SIDE, { px: 50.6 })
const RL_STEP = v(A.STAND_SIDE, { px: 49, py: 57.8, torso: 5, uaL: -6, faL: -8, thL: 22.4, shL: -11.3, uaR: 14, faR: 18, thR: -22, shR: -55, ftR: 30 })
const RL_TOUCH = v(A.STAND_SIDE, { px: 41.5, py: 60.5, torso: 6, uaL: 0, faL: 0, thL: 39.4, shL: -4.3, uaR: 8, faR: 10, thR: -18.1, shR: -52.1, ftR: 55 })
const RL_MID = v(A.STAND_SIDE, { px: 39.5, py: 66.5, torso: 7, head: -2, uaL: 6, faL: 8, thL: 60.5, shL: -12.1, uaR: 4, faR: 6, thR: -2.1, shR: -74.6, ftR: 55 })
const RL_LOW = v(A.STAND_SIDE, { px: 37.5, py: 72.3, torso: 8, head: -4, faL: 16, thL: 78.2, shL: -12.6, uaR: 10, faR: 14, thR: 5.7, shR: -91.1, ftR: 55 })
const RL_REC = v(A.STAND_SIDE, { px: 47.5, py: 59.5, torso: 4, uaL: 0, faL: 0, thL: 31.3, shL: -15.1, uaR: -4, faR: -6, thR: -10, shR: -62, ftR: 62 })

// --- jumping lunge: both feet land on the same two spots each time, only which leg is in
// front changes. The drive pushes off both feet while they are still on their marks (heels
// up, toe-off), slows into the apex where the legs pass each other tucked under the body,
// then the fall opens them into the new stance, lands on both feet with the knees soft and
// absorbs into the next lunge. The knees stay bent through the switch so neither foot sweeps
// the floor on its way past; the arms swing in opposition to the legs throughout -------------
const JL_R = v(A.STAND_SIDE, { px: 45.5, py: 72.5, torso: 6, head: -2, uaL: 40, faL: 70, thL: 7.2, shL: -91.6, ftL: 55, uaR: -35, thR: 80.1, shR: -12.1 })
const JL_R_PUSH = v(A.STAND_SIDE, { px: 46, py: 58, torso: 4, head: -1, uaL: 30, faL: 60, thL: 1.1, shL: -54, ftL: 30, uaR: -15, faR: 10, thR: 39.4, shR: 9, ftR: 60 })
const JL_AIR1 = v(A.STAND_SIDE, { px: 46, py: 47, torso: 4, uaL: 15, faL: 40, thL: 20, shL: -30, ftL: 40, uaR: 10, faR: 35, thR: -12, shR: -65, ftR: 45 })
const JL_L_LAND = v(A.STAND_SIDE, { px: 46, py: 63, torso: 6, head: -2, uaL: -25, faL: -5, thL: 51.3, shL: -1.7, ftL: 80, uaR: 30, faR: 55, thR: -0.1, shR: -63.9, ftR: 55 })
const JL_L = v(A.STAND_SIDE, { px: 45.5, py: 72.5, torso: 6, head: -2, uaL: -35, faL: -10, thL: 80.1, shL: -12.1, uaR: 40, faR: 70, thR: 7.2, shR: -91.6, ftR: 55 })
const JL_L_PUSH = v(A.STAND_SIDE, { px: 46, py: 58, torso: 4, head: -1, uaL: -15, faL: 10, thL: 39.4, shL: 9, ftL: 60, uaR: 30, faR: 60, thR: 1.1, shR: -54, ftR: 30 })
const JL_AIR2 = v(A.STAND_SIDE, { px: 46, py: 47, torso: 4, uaL: 10, faL: 35, thL: -12, shL: -65, ftL: 45, uaR: 15, faR: 40, thR: 20, shR: -30, ftR: 40 })
const JL_R_LAND = v(A.STAND_SIDE, { px: 46, py: 63, torso: 6, head: -2, uaL: 30, faL: 55, thL: -0.1, shL: -63.9, ftL: 55, uaR: -25, faR: -5, thR: 51.3, shR: -1.7, ftR: 80 })

// --- lateral lunge, front on: the far foot never moves; the near foot steps wide, lands
// with both legs long, then the hips sit towards it with the trailing leg kept straight. On
// the way back the near leg pushes until it is nearly long and only then leaves the floor,
// so the body is already travelling over the standing leg when the foot swings in ----------
const LL_STAND = v(A.STAND_FRONT, { px: 30 })
const LL_STEP = v(A.STAND_FRONT, { px: 38, py: 58.5, uaL: -22, faL: -30, thL: -29.5, shL: -0.7, uaR: 22, faR: 30, thR: 45, shR: 15 })
const LL_LAND = v(A.STAND_FRONT, { px: 51, py: 63.5, uaL: -28, faL: -40, thL: -41.3, shL: -29.6, uaR: 28, faR: 40, thR: 45.6, shR: 25.8, ftR: 115 })
const LL_LOW = v(A.STAND_FRONT, { px: 58, py: 71, torso: 4, uaL: -34, faL: -48, thL: -62.8, shL: -38, uaR: 34, faR: 48, thR: 76.1, shR: -9.8, ftR: 115 })
const LL_PUSH = v(A.STAND_FRONT, { px: 53, py: 65, torso: 2, uaL: -28, faL: -40, thL: -44.7, shL: -33.5, uaR: 28, faR: 40, thR: 56.8, shR: 12.3, ftR: 115 })
const LL_SWING = v(A.STAND_FRONT, { px: 40, py: 58, uaL: -18, faL: -24, thL: -23.7, shL: -11.8, uaR: 18, faR: 24, thR: 49.1, shR: 5.4 })

// --- wall sit: back vertical, thighs level, shins vertical, hands resting on the thighs ----
const WS_A = v(A.STAND_SIDE, { px: 40, py: 75.9, uaL: 3, faL: 70.7, thL: 90, shL: 0, uaR: 1.8, faR: 68.6, thR: 91.5, shR: 1 })
const WS_B = v(A.STAND_SIDE, { px: 40, py: 75.9, spine: 1, head: 2, uaL: 4, faL: 72.2, thL: 90, shL: 0, uaR: 2.8, faR: 70.1, thR: 91.5, shR: 1 })

// --- calf raise: hands on hips; the toes stay where they are and the whole body rises and
// shifts slightly forward over them as the heels lift --------------------------------------
const CR_DOWN = v(A.STAND_SIDE, { uaL: -16.2, faL: 23.9, uaR: -16.2, faR: 23.9 })
const CR_UP = v(A.STAND_SIDE, { px: 49, py: 51.9, uaL: -16.2, faL: 23.9, ftL: 40, uaR: -16.2, faR: 23.9, ftR: 40 })

// --- glute bridge: feet flat a shin's length from the hips; at the top the shoulders are
// still on the floor, the shins are vertical and the torso and thighs form one line -------
const GB_DOWN = v(A.SUPINE_BENT, { thL: 141.1, shL: 13.2, thR: 140.7, shR: 14.3 })
const GB_UP = v(A.SUPINE_BENT, { px: 48.3, py: 82.9, torso: -112.4, spine: 4, head: 16, thL: 110.5, shL: 0.2, thR: 110.5, shR: 1.6 })
// the raised knee points at the ceiling with the shin level and the toes relaxed; it tips a
// little further over as the pelvis lifts, because the hip stays flexed
const SB_DOWN = v(GB_DOWN, { thR: 160, shR: 74, ftR: 30 })
const SB_UP = v(GB_UP, { thR: 166, shR: 78, ftR: 30 })

// --- single-leg deadlift: the near leg stands with a soft knee (ankle fixed at 55.9, 95.9)
// while the hips travel back behind the heel and the torso and the free leg hinge into one
// line; the arms hang plumb from the shoulders and the neck stays neutral, eyes on the floor -
const DL_STAND = v(A.STAND_SIDE, { px: 58 })
const DL_MID = v(A.STAND_SIDE, { px: 53.5, py: 57.3, torso: 40, spine: -2, head: -6, uaL: 2, faL: 2, thL: -40, shL: -44, ftL: 45, uaR: -2, faR: -2, thR: 18.3, shR: -11.2 })
const DL_LOW = v(A.STAND_SIDE, { px: 48.5, py: 58.5, torso: 74, spine: -3, head: -8, uaL: 1, faL: 1, thL: -74, shL: -78, ftL: 10, uaR: -1, faR: -1, thR: 28.8, shR: -6.4 })

export const LEGS: Exercise[] = [
  {
    id: 'squat',
    name: 'Bodyweight Squat',
    category: 'legs',
    muscles: ['quads', 'glutes', 'core'],
    met: 5,
    cycle: 2.4,
    cues: ['Sit the hips back and down', 'Knees track over the toes', 'Chest up, heels planted'],
    // Down in 1.35, up in 0.85. The easing runs in / linear / out across the three legs of
    // each direction so the whole descent reads as one controlled movement.
    frames: [
      f(SQ_TALL, 0.3, 0, 'out'),
      f(SQ_QTR, 0.4, 0, 'in'),
      f(SQ_MID, 0.45, 0, 'linear'),
      f(SQ_LOW, 0.5, 0.1, 'out'),
      f(SQ_MID, 0.28, 0, 'in'),
      f(SQ_QTR, 0.27, 0, 'linear'),
    ],
  },
  {
    id: 'jump-squat',
    name: 'Jump Squat',
    category: 'legs',
    muscles: ['quads', 'glutes', 'calves'],
    met: 8,
    cycle: 1.8,
    cues: ['Explode straight up', 'Land quietly and absorb into the next rep', 'Full hip extension in the air'],
    // Load at the bottom, accelerate through the quarter squat onto the toes, float to the
    // peak, fall, and absorb the landing straight into the next bottom position.
    frames: [
      f(JS_LOW, 0.8, 0.1, 'out'),
      f(JS_MID, 0.25, 0, 'in'),
      f(JS_QTR, 0.15, 0, 'linear'),
      f(JS_TOE, 0.15, 0, 'linear'),
      f(JS_PEAK, 0.35, 0, 'out'),
      f(JS_LAND, 0.4, 0, 'in'),
    ],
  },
  {
    id: 'sumo-squat',
    name: 'Sumo Squat',
    category: 'legs',
    facing: 'front',
    muscles: ['glutes', 'quads', 'hamstrings'],
    met: 5,
    cycle: 2.6,
    cues: ['Feet wide, toes turned out', 'Drive the knees out over the toes', 'Squeeze the glutes at the top'],
    frames: [f(SU_TOP, 0.4, 0, 'out'), f(SU_MID, 0.65, 0, 'in'), f(SU_LOW, 0.65, 0.1, 'out'), f(SU_MID, 0.45, 0, 'in')],
  },
  {
    id: 'split-squat',
    name: 'Split Squat',
    category: 'legs',
    muscles: ['quads', 'glutes'],
    met: 5,
    cycle: 2.6,
    unilateral: true,
    cues: ['Feet stay planted the whole set', 'Back knee straight down towards the floor', 'Front shin close to vertical'],
    frames: [f(SP_TALL, 0.4, 0, 'out'), f(SP_MID, 0.65, 0, 'in'), f(SP_LOW, 0.65, 0.1, 'out'), f(SP_MID, 0.45, 0, 'in')],
  },
  {
    id: 'reverse-lunge',
    name: 'Reverse Lunge',
    category: 'legs',
    muscles: ['quads', 'glutes', 'hamstrings'],
    met: 5,
    cycle: 3,
    unilateral: true,
    cues: ['Step back, not down', 'Weight stays in the front heel', 'Drive through to stand tall'],
    frames: [
      f(RL_STAND, 0.5),
      f(RL_STEP, 0.7),
      f(RL_TOUCH, 0.5),
      f(RL_MID, 0.55),
      f(RL_LOW, 0.6, 0.1),
      f(RL_REC, 0.75, 0, 'out'),
    ],
  },
  {
    id: 'jumping-lunge',
    name: 'Jumping Lunge',
    category: 'legs',
    muscles: ['quads', 'glutes', 'calves'],
    met: 9,
    cycle: 2,
    cues: ['Switch the legs in mid-air', 'Land soft, absorb, go again', 'Torso stays upright'],
    // Per side: accelerate off both feet ('in'), float to the apex ('out'), fall onto both
    // feet ('in'), absorb into the lunge ('out').
    frames: [
      f(JL_R, 0.3, 0.1, 'out'),
      f(JL_R_PUSH, 0.2, 0, 'in'),
      f(JL_AIR1, 0.35, 0, 'out'),
      f(JL_L_LAND, 0.35, 0, 'in'),
      f(JL_L, 0.3, 0.1, 'out'),
      f(JL_L_PUSH, 0.2, 0, 'in'),
      f(JL_AIR2, 0.35, 0, 'out'),
      f(JL_R_LAND, 0.35, 0, 'in'),
    ],
  },
  {
    id: 'lateral-lunge',
    name: 'Lateral Lunge',
    category: 'legs',
    facing: 'front',
    muscles: ['glutes', 'quads', 'hamstrings'],
    met: 5,
    cycle: 3,
    unilateral: true,
    cues: ['Push the hips back as you step out', 'Keep the trailing leg straight', 'Both feet stay flat'],
    frames: [
      f(LL_STAND, 0.4, 0, 'out'),
      f(LL_STEP, 0.5),
      f(LL_LAND, 0.4),
      f(LL_LOW, 0.8, 0.1),
      f(LL_PUSH, 0.5),
      f(LL_SWING, 0.4),
    ],
  },
  {
    id: 'wall-sit',
    name: 'Wall Sit',
    category: 'legs',
    muscles: ['quads', 'glutes'],
    met: 4.3,
    cycle: 6,
    hold: true,
    needs: 'A wall',
    cues: ['Back flat against the wall', 'Thighs parallel to the floor', 'Knees stacked over the ankles'],
    frames: [f(WS_A, 1, 3), f(WS_B, 1, 3)],
  },
  {
    id: 'calf-raise',
    name: 'Calf Raise',
    category: 'legs',
    muscles: ['calves'],
    met: 4,
    cycle: 2.2,
    cues: ['All the way up onto the toes', 'Pause at the top', 'Lower under control'],
    frames: [f(CR_DOWN, 1.3), f(CR_UP, 0.8, 0.3)],
  },
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    category: 'legs',
    muscles: ['glutes', 'hamstrings', 'core'],
    met: 4,
    cycle: 2.4,
    cues: ['Drive through the heels', 'Squeeze the glutes at the top', 'Ribs down, do not arch the back'],
    frames: [f(GB_DOWN, 1.3), f(GB_UP, 0.8, 0.3)],
  },
  {
    id: 'single-leg-glute-bridge',
    name: 'Single-Leg Glute Bridge',
    category: 'legs',
    muscles: ['glutes', 'hamstrings'],
    met: 4.5,
    cycle: 2.6,
    unilateral: true,
    cues: ['One foot planted, the other knee towards the ceiling', 'Keep the hips level', 'Pause at the top'],
    frames: [f(SB_DOWN, 1.3), f(SB_UP, 0.8, 0.3)],
  },
  {
    id: 'single-leg-deadlift',
    name: 'Single-Leg Deadlift',
    category: 'legs',
    muscles: ['hamstrings', 'glutes', 'back'],
    met: 4,
    cycle: 3.4,
    unilateral: true,
    cues: ['Hinge at the hip, back stays flat', 'Free leg extends straight behind', 'Slow and balanced, no rush'],
    frames: [f(DL_STAND, 0.5, 0, 'out'), f(DL_MID, 0.65), f(DL_LOW, 0.7, 0.2), f(DL_MID, 0.45)],
  },
]
