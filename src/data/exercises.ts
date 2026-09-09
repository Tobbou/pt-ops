import { Frame, Pose, mirror } from '../lib/pose'
import * as A from './poses'

export type Category = 'warmup' | 'push' | 'legs' | 'core' | 'cardio' | 'cooldown'

export type Muscle =
  | 'chest'
  | 'shoulders'
  | 'triceps'
  | 'back'
  | 'core'
  | 'obliques'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'hipflexors'
  | 'fullbody'

export interface Exercise {
  id: string
  name: string
  category: Category
  muscles: Muscle[]
  /** Metabolic equivalent, used for the calorie estimate. */
  met: number
  /** Seconds per repetition, for the animation and for rep -> time conversion. */
  cycle: number
  /** Performed one side at a time: the player runs it twice, once per side. */
  unilateral?: boolean
  /** Static hold: always prescribed in seconds, never in reps. */
  hold?: boolean
  /** Needs a wall, a chair or a step. */
  needs?: string
  cues: string[]
  frames: Frame[]
}

/** Shorthand for a pose derived from an anchor. */
const v = (base: Pose, over: Partial<Pose>): Pose => ({ ...base, ...over })
/** Shorthand for a frame. */
const f = (pose: Pose, d?: number, hold?: number): Frame => ({ pose, d, hold })

// --- shared derived poses ------------------------------------------------------

const SQUAT_TALL = v(A.STAND_SIDE, { uaL: 22, faL: 26, uaR: 18, faR: 22, torso: 4 })

const HANDS_DOWN_TUCK = v(A.STAND_SIDE, {
  px: 44, py: 80, torso: 60, head: -20,
  uaL: 3, faL: 3, uaR: -3, faR: -3,
  thL: 80, shL: -50, ftL: 80, thR: 78, shR: -52, ftR: 80,
})

const MC_RIGHT_IN = v(A.PLANK_HIGH, { thR: 76, shR: -40, ftR: -150, thL: -66, shL: -66 })
const MC_LEFT_IN = v(A.PLANK_HIGH, { thL: 74, shL: -42, ftL: -150, thR: -64, shR: -64 })

const SIDE_PLANK = v(A.PLANK_HIGH, {
  px: 51.8, py: 77.1, torso: -65, head: 10,
  uaL: 0, faL: 0, ftL: 100, thL: 65, shL: 65,
  uaR: 180, faR: 178, thR: 63, shR: 63, ftR: 98,
})

const GLUTE_UP = v(A.SUPINE_BENT, {
  px: 48, py: 80, torso: -117, thL: 105, shL: -13, thR: 103, shR: -15,
})

const KNEE_PLANK_HIGH = v(A.PLANK_HIGH, {
  px: 55, py: 82.3, torso: 54,
  uaL: 2, faL: 2, thL: -54, shL: -140, ftL: -110,
  uaR: -2, faR: -2, thR: -56, shR: -142, ftR: -112,
})

const KNEE_PLANK_LOW = v(KNEE_PLANK_HIGH, {
  px: 58, py: 89, torso: 74,
  uaL: -80, faL: 45, uaR: -82, faR: 47,
  thL: -74, shL: -155, ftL: -120, thR: -76, shR: -157, ftR: -122,
})

const QUADRUPED = v(A.PLANK_HIGH, {
  px: 38, py: 74, torso: 74, head: -10,
  uaL: 2, faL: 2, uaR: -2, faR: -2,
  thL: -10, shL: -95, ftL: -170, thR: -12, shR: -97, ftR: -172,
})

const SKATER = v(A.STAND_FRONT, {
  px: 62, py: 66, torso: 8,
  thR: 20, shR: -30, ftR: 105,
  thL: -60, shL: -140, ftL: -90,
  uaR: 60, faR: 70, uaL: -60, faL: -70,
})

const BOX_GUARD = v(A.STAND_SIDE, {
  py: 57, torso: 4,
  uaL: 15, faL: 105, uaR: -10, faR: 100,
  thL: 12, shL: 6, thR: -14, shR: -8,
})

// --- the catalogue -------------------------------------------------------------

export const EXERCISES: Exercise[] = [
  // ============================ WARM-UP ============================
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    category: 'warmup',
    muscles: ['fullbody', 'calves', 'shoulders'],
    met: 8,
    cycle: 1,
    cues: ['Land softly on the balls of your feet', 'Arms all the way overhead', 'Keep a steady rhythm'],
    frames: [
      f(v(A.STAND_FRONT, { uaL: -8, faL: -9, uaR: 8, faR: 9, thL: -2, shL: -1, thR: 2, shR: 1 })),
      f(v(A.STAND_FRONT, { py: 58.5, uaL: -158, faL: -168, uaR: 158, faR: 168, thL: -20, shL: -22, ftL: -115, thR: 20, shR: 22, ftR: 115 })),
    ],
  },
  {
    id: 'arm-circles',
    name: 'Arm Circles',
    category: 'warmup',
    muscles: ['shoulders'],
    met: 3.5,
    cycle: 2.4,
    cues: ['Draw the biggest circle you can', 'Half the reps forward, half backward', 'Keep the elbows long'],
    frames: [
      f(v(A.STAND_FRONT, { uaL: -92, faL: -94, uaR: 92, faR: 94 })),
      f(v(A.STAND_FRONT, { uaL: -145, faL: -155, uaR: 145, faR: 155 })),
      f(v(A.STAND_FRONT, { uaL: -92, faL: -94, uaR: 92, faR: 94 })),
      f(v(A.STAND_FRONT, { uaL: -35, faL: -40, uaR: 35, faR: 40 })),
    ],
  },
  {
    id: 'arm-swings',
    name: 'Arm Swings',
    category: 'warmup',
    muscles: ['chest', 'shoulders', 'back'],
    met: 3.5,
    cycle: 1.6,
    cues: ['Swing wide to open the chest', 'Cross low, open high', 'Stay tall through the ribs'],
    frames: [
      f(v(A.STAND_FRONT, { uaL: -100, faL: -102, uaR: 100, faR: 102 })),
      f(v(A.STAND_FRONT, { uaL: 55, faL: 80, uaR: -55, faR: -80 })),
    ],
  },
  {
    id: 'torso-twists',
    name: 'Torso Twists',
    category: 'warmup',
    muscles: ['obliques', 'core', 'back'],
    met: 3.5,
    cycle: 1.6,
    cues: ['Rotate from the ribs, not the arms', 'Hips stay square to the front', 'Let the arms follow loosely'],
    frames: [
      f(v(A.STAND_FRONT, { uaL: -80, faL: -25, uaR: -70, faR: -20, torso: -6 })),
      f(v(A.STAND_FRONT, { uaL: 80, faL: 25, uaR: 70, faR: 20, torso: 6 })),
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
    frames: [
      f(v(A.STAND_SIDE, { py: 53, torso: 6, thR: 105, shR: 28, ftR: 60, thL: -8, shL: -4, uaL: 10, faL: 115, uaR: -35, faR: -125 })),
      f(v(A.STAND_SIDE, { py: 53, torso: 6, thL: 105, shL: 28, ftL: 60, thR: -8, shR: -4, uaR: 10, faR: 115, uaL: -35, faL: -125 })),
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
    frames: [
      f(v(A.STAND_SIDE, { py: 55, torso: 4, thR: -14, shR: -165, ftR: -120, thL: 6, shL: 3, uaL: 10, faL: 110, uaR: -30, faR: -120 })),
      f(v(A.STAND_SIDE, { py: 55, torso: 4, thL: -14, shL: -165, ftL: -120, thR: 6, shR: 3, uaR: 10, faR: 110, uaL: -30, faL: -120 })),
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
    frames: [
      f(v(A.STAND_SIDE, { thR: 55, shR: 50, ftR: 70, thL: -2, shL: -1, uaL: 35, faL: 40, uaR: -35, faR: -40, torso: -6 })),
      f(v(A.STAND_SIDE, { thR: -38, shR: -30, ftR: -120, thL: -2, shL: -1, uaL: 35, faL: 40, uaR: -35, faR: -40, torso: 8 })),
    ],
  },
  {
    id: 'inchworm',
    name: 'Inchworm',
    category: 'warmup',
    muscles: ['hamstrings', 'core', 'shoulders'],
    met: 5,
    cycle: 5,
    cues: ['Walk the hands out to a plank', 'Keep the legs as straight as they allow', 'Walk the feet back in'],
    frames: [
      f(A.STAND_SIDE),
      f(v(A.STAND_SIDE, { torso: 110, head: -20, uaL: 3, faL: 3, uaR: -3, faR: -3 })),
      f(A.PLANK_HIGH),
      f(v(A.STAND_SIDE, { torso: 110, head: -20, uaL: 3, faL: 3, uaR: -3, faR: -3 })),
    ],
  },

  // ============================ PUSH ============================
  {
    id: 'push-up',
    name: 'Push-Up',
    category: 'push',
    muscles: ['chest', 'triceps', 'shoulders', 'core'],
    met: 8,
    cycle: 2.4,
    cues: ['Hands under the shoulders', 'Elbows back at 45 degrees, not flared wide', 'One straight line from head to heels'],
    frames: [f(A.PLANK_HIGH), f(A.PUSHUP_LOW)],
  },
  {
    id: 'wide-push-up',
    name: 'Wide Push-Up',
    category: 'push',
    muscles: ['chest', 'shoulders'],
    met: 8,
    cycle: 2.4,
    cues: ['Hands well outside the shoulders', 'Chest leads the way down', 'Do not let the hips sag'],
    frames: [f(A.PLANK_HIGH), f(A.PUSHUP_LOW)],
  },
  {
    id: 'diamond-push-up',
    name: 'Diamond Push-Up',
    category: 'push',
    muscles: ['triceps', 'chest'],
    met: 8,
    cycle: 2.6,
    cues: ['Thumbs and index fingers form a diamond', 'Elbows brush past the ribs', 'Slow on the way down'],
    frames: [f(A.PLANK_HIGH), f(A.PUSHUP_LOW)],
  },
  {
    id: 'knee-push-up',
    name: 'Knee Push-Up',
    category: 'push',
    muscles: ['chest', 'triceps'],
    met: 5,
    cycle: 2.4,
    cues: ['Knees, hips and shoulders in one line', 'Do not let the hips lead', 'Full range every rep'],
    frames: [f(KNEE_PLANK_HIGH), f(KNEE_PLANK_LOW)],
  },
  {
    id: 'pike-push-up',
    name: 'Pike Push-Up',
    category: 'push',
    muscles: ['shoulders', 'triceps'],
    met: 8,
    cycle: 2.8,
    cues: ['Hips high, body in an upside-down V', 'Crown of the head towards the floor', 'Press straight back up'],
    frames: [
      f(v(A.PLANK_HIGH, { px: 48, py: 60, torso: 107, head: -15, uaL: 12, faL: 12, uaR: 9, faR: 9, thL: -33, shL: -33, thR: -35, shR: -35 })),
      f(v(A.PLANK_HIGH, { px: 48, py: 64, torso: 122, head: -25, uaL: -14, faL: 75, uaR: -17, faR: 72, thL: -37, shL: -37, thR: -39, shR: -39 })),
    ],
  },
  {
    id: 'explosive-push-up',
    name: 'Explosive Push-Up',
    category: 'push',
    muscles: ['chest', 'triceps', 'shoulders'],
    met: 9,
    cycle: 2,
    cues: ['Drive hard enough to leave the floor', 'Land with soft elbows', 'Reset the plank before the next rep'],
    frames: [
      f(A.PLANK_HIGH),
      f(A.PUSHUP_LOW, 1.2),
      f(v(A.PLANK_HIGH, { py: 74, uaL: 20, faL: 25, uaR: 16, faR: 21 }), 0.5),
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
      f(A.PLANK_HIGH),
      f(A.PUSHUP_LOW),
      f(v(A.PUSHUP_LOW, { uaL: -95, faL: -95, uaR: -97, faR: -97 }), 0.6, 0.4),
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
      f(A.PLANK_HIGH),
      f(v(A.PLANK_HIGH, { uaL: -40, faL: -140 })),
      f(A.PLANK_HIGH),
      f(v(A.PLANK_HIGH, { uaR: -44, faR: -144 })),
    ],
  },
  {
    id: 'plank-up-down',
    name: 'Plank Up-Downs',
    category: 'push',
    muscles: ['core', 'triceps', 'shoulders'],
    met: 6,
    cycle: 2.8,
    cues: ['Elbow, elbow, hand, hand', 'Keep the hips as quiet as you can', 'Alternate the leading arm'],
    frames: [f(A.PLANK_LOW), f(A.PLANK_HIGH)],
  },

  // ============================ LEGS ============================
  {
    id: 'squat',
    name: 'Bodyweight Squat',
    category: 'legs',
    muscles: ['quads', 'glutes', 'core'],
    met: 5,
    cycle: 2.4,
    cues: ['Sit the hips back and down', 'Knees track over the toes', 'Chest up, heels planted'],
    frames: [f(SQUAT_TALL), f(A.SQUAT_LOW)],
  },
  {
    id: 'jump-squat',
    name: 'Jump Squat',
    category: 'legs',
    muscles: ['quads', 'glutes', 'calves'],
    met: 8,
    cycle: 1.8,
    cues: ['Explode straight up', 'Land quietly and absorb into the next rep', 'Full hip extension in the air'],
    frames: [
      f(A.SQUAT_LOW),
      f(v(A.STAND_SIDE, { py: 44, torso: 6, thL: 14, shL: 20, thR: 10, shR: 16, uaL: -30, faL: -40, uaR: -34, faR: -44, ftL: 60, ftR: 60 }), 0.6),
      f(SQUAT_TALL, 0.6),
    ],
  },
  {
    id: 'sumo-squat',
    name: 'Sumo Squat',
    category: 'legs',
    muscles: ['glutes', 'quads', 'hamstrings'],
    met: 5,
    cycle: 2.6,
    cues: ['Feet wide, toes turned out', 'Drive the knees out over the toes', 'Squeeze the glutes at the top'],
    frames: [
      f(v(A.STAND_FRONT, { py: 57.5, thL: -16, shL: -18, thR: 16, shR: 18, uaL: -20, faL: -30, uaR: 20, faR: 30, ftL: -120, ftR: 120 })),
      f(v(A.STAND_FRONT, { py: 72, thL: -75, shL: -25, thR: 75, shR: 25, uaL: -6, faL: -4, uaR: 6, faR: 4, ftL: -120, ftR: 120, torso: 6 })),
    ],
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
    frames: [f(A.LUNGE_TALL), f(A.LUNGE_LOW)],
  },
  {
    id: 'reverse-lunge',
    name: 'Reverse Lunge',
    category: 'legs',
    muscles: ['quads', 'glutes', 'hamstrings'],
    met: 5,
    cycle: 2.6,
    unilateral: true,
    cues: ['Step back, not down', 'Weight stays in the front heel', 'Drive through to stand tall'],
    frames: [f(A.STAND_SIDE), f(A.LUNGE_LOW)],
  },
  {
    id: 'jumping-lunge',
    name: 'Jumping Lunge',
    category: 'legs',
    muscles: ['quads', 'glutes', 'calves'],
    met: 9,
    cycle: 1.8,
    cues: ['Switch the legs in mid-air', 'Land soft, absorb, go again', 'Torso stays upright'],
    frames: [
      f(A.LUNGE_LOW),
      f(v(A.STAND_SIDE, { py: 46, thL: 30, shL: 40, thR: -25, shR: -35, uaL: -30, faL: -40, uaR: 30, faR: 40 }), 0.6),
      f(mirror(A.LUNGE_LOW), 0.6),
      f(v(A.STAND_SIDE, { py: 46, thL: -25, shL: -35, thR: 30, shR: 40, uaL: 30, faL: 40, uaR: -30, faR: -40 }), 0.6),
    ],
  },
  {
    id: 'lateral-lunge',
    name: 'Lateral Lunge',
    category: 'legs',
    muscles: ['glutes', 'quads', 'hamstrings'],
    met: 5,
    cycle: 2.6,
    unilateral: true,
    cues: ['Push the hips back as you step out', 'Keep the trailing leg straight', 'Both feet stay flat'],
    frames: [
      f(A.STAND_FRONT),
      f(v(A.STAND_FRONT, { px: 62, py: 72, torso: 8, thR: 70, shR: -20, ftR: 110, thL: -55, shL: -55, ftL: -120, uaL: -15, faL: -20, uaR: 15, faR: 20 })),
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
    frames: [
      f(v(A.STAND_SIDE, { px: 40, py: 76, torso: 0, thL: 90, shL: 0, thR: 88, shR: -2, uaL: 20, faL: 70, uaR: 16, faR: 66 }), 1, 3),
      f(v(A.STAND_SIDE, { px: 40, py: 77, torso: 1, thL: 91, shL: 1, thR: 89, shR: -1, uaL: 22, faL: 72, uaR: 18, faR: 68 }), 1, 3),
    ],
  },
  {
    id: 'calf-raise',
    name: 'Calf Raise',
    category: 'legs',
    muscles: ['calves'],
    met: 4,
    cycle: 2,
    cues: ['All the way up onto the toes', 'Pause at the top', 'Lower under control'],
    frames: [
      f(A.STAND_SIDE),
      f(v(A.STAND_SIDE, { py: 50, ftL: 40, ftR: 42, thL: 2, shL: 1, thR: -2, shR: -1 })),
    ],
  },
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    category: 'legs',
    muscles: ['glutes', 'hamstrings', 'core'],
    met: 4,
    cycle: 2.4,
    cues: ['Drive through the heels', 'Squeeze the glutes at the top', 'Ribs down, do not arch the back'],
    frames: [f(A.SUPINE_BENT), f(GLUTE_UP)],
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
    frames: [
      f(v(A.SUPINE_BENT, { thR: 120, shR: 120 })),
      f(v(GLUTE_UP, { thR: 120, shR: 120 })),
    ],
  },
  {
    id: 'single-leg-deadlift',
    name: 'Single-Leg Deadlift',
    category: 'legs',
    muscles: ['hamstrings', 'glutes', 'back'],
    met: 4,
    cycle: 3,
    unilateral: true,
    cues: ['Hinge at the hip, back stays flat', 'Free leg extends straight behind', 'Slow and balanced, no rush'],
    frames: [
      f(A.STAND_SIDE),
      f(v(A.STAND_SIDE, { px: 48, torso: 85, head: -15, thR: 0, shR: -4, ftR: 80, thL: -85, shL: -88, ftL: -160, uaL: 5, faL: 5, uaR: -5, faR: -5 })),
    ],
  },

  // ============================ CORE ============================
  {
    id: 'plank',
    name: 'Forearm Plank',
    category: 'core',
    muscles: ['core', 'shoulders', 'glutes'],
    met: 3.3,
    cycle: 6,
    hold: true,
    cues: ['Elbows under the shoulders', 'Squeeze the glutes, tuck the ribs', 'Do not let the hips drift up'],
    frames: [f(A.PLANK_LOW, 1, 3), f(v(A.PLANK_LOW, { py: 82.8, torso: 80 }), 1, 3)],
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
    frames: [f(SIDE_PLANK, 1, 3), f(v(SIDE_PLANK, { py: 78.4, torso: -63 }), 1, 3)],
  },
  {
    id: 'mountain-climber',
    name: 'Mountain Climbers',
    category: 'core',
    muscles: ['core', 'hipflexors', 'shoulders'],
    met: 8,
    cycle: 0.9,
    cues: ['Shoulders stay over the hands', 'Drive the knee to the chest', 'Hips stay low and level'],
    frames: [f(MC_RIGHT_IN), f(MC_LEFT_IN)],
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
      f(v(A.SUPINE_FLAT, { head: -20, thL: 75, shL: 75, thR: 95, shR: 95 })),
      f(v(A.SUPINE_FLAT, { head: -20, thL: 95, shL: 95, thR: 75, shR: 75 })),
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
      f(v(A.SUPINE_FLAT, { thL: 92, shL: 92, thR: 90, shR: 90 })),
      f(v(A.SUPINE_FLAT, { thL: 165, shL: 165, thR: 163, shR: 163, ftL: 120, ftR: 118 })),
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
      f(v(A.SUPINE_BENT, { thL: 120, shL: 60, thR: 118, shR: 58 })),
      f(v(A.SUPINE_BENT, { py: 89, thL: 155, shL: 90, thR: 153, shR: 88 })),
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
      f(v(A.SUPINE_FLAT, { px: 58, torso: -70, head: -10, uaL: -110, faL: -105, uaR: -108, faR: -103, thL: 115, shL: 115, ftL: 60, thR: 113, shR: 113, ftR: 58 }), 1, 3),
      f(v(A.SUPINE_FLAT, { px: 58, torso: -68, head: -10, uaL: -108, faL: -103, uaR: -106, faR: -101, thL: 117, shL: 117, ftL: 60, thR: 115, shR: 115, ftR: 58 }), 1, 3),
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
      f(v(A.SUPINE_BENT, { uaL: 95, faL: 80, uaR: 97, faR: 82 })),
      f(v(A.SUPINE_BENT, { torso: -45, head: 5, uaL: 81, faL: 81, uaR: 83, faR: 83 })),
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
      f(v(A.SUPINE_BENT, { uaL: 100, faL: -140, uaR: 102, faR: -138 })),
      f(v(A.SUPINE_BENT, { torso: -70, uaL: 100, faL: -140, uaR: 102, faR: -138 })),
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
      f(v(A.SUPINE_FLAT, { px: 58, uaL: -95, faL: -93, uaR: -93, faR: -91 })),
      f(v(A.SUPINE_FLAT, { px: 56, torso: -40, uaL: 112, faL: 112, uaR: 110, faR: 110, thL: 150, shL: 150, ftL: 80, thR: 148, shR: 148, ftR: 78 })),
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
      f(v(A.SUPINE_FLAT, { thL: 170, shL: 170, thR: 168, shR: 168, uaL: 150, faL: 150, uaR: 148, faR: 148 })),
      f(v(A.SUPINE_FLAT, { torso: -55, thL: 170, shL: 170, thR: 168, shR: 168, uaL: 131, faL: 131, uaR: 129, faR: 129 })),
    ],
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist',
    category: 'core',
    muscles: ['obliques', 'core'],
    met: 5,
    cycle: 1.6,
    cues: ['Lean back until you feel the abs switch on', 'Rotate the ribs, not just the hands', 'Feet up to make it harder'],
    frames: [
      f(v(A.SUPINE_BENT, { px: 52, py: 86, torso: -40, head: 10, thL: 135, shL: 70, ftL: 40, thR: 133, shR: 68, ftR: 38, uaL: 60, faL: 100, uaR: 58, faR: 98 })),
      f(v(A.SUPINE_BENT, { px: 52, py: 86, torso: -45, head: 10, thL: 135, shL: 70, ftL: 40, thR: 133, shR: 68, ftR: 38, uaL: 78, faL: 132, uaR: 76, faR: 130 })),
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
      f(v(A.SUPINE_FLAT, { px: 52, py: 90, torso: -62, head: -5, uaL: -155, faL: -20, uaR: -157, faR: -22, thL: 135, shL: 75, ftL: 40, thR: 80, shR: 80, ftR: 20 })),
      f(v(A.SUPINE_FLAT, { px: 52, py: 90, torso: -62, head: -5, uaL: -155, faL: -20, uaR: -157, faR: -22, thR: 135, shR: 75, ftR: 40, thL: 80, shL: 80, ftL: 20 })),
    ],
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    category: 'core',
    muscles: ['core'],
    met: 3.8,
    cycle: 3,
    cues: ['Lower back stays pinned to the floor', 'Opposite arm and leg, slowly', 'Breathe out as you extend'],
    frames: [
      f(v(A.SUPINE_BENT, { uaL: 180, faL: 178, uaR: -120, faR: -118, thL: 100, shL: 96, ftL: 20, thR: 135, shR: 45, ftR: 60 })),
      f(v(A.SUPINE_BENT, { uaR: 180, faR: 178, uaL: -120, faL: -118, thR: 100, shR: 96, ftR: 20, thL: 135, shL: 45, ftL: 60 })),
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
      f(A.PRONE_FLAT),
      f(v(A.PRONE_FLAT, { py: 88, torso: -98, head: 8, uaL: -112, faL: -110, uaR: -110, faR: -108, thL: 76, shL: 76, thR: 78, shR: 78 })),
    ],
  },

  // ============================ CARDIO / FULL BODY ============================
  {
    id: 'burpee',
    name: 'Burpee',
    category: 'cardio',
    muscles: ['fullbody'],
    met: 8,
    cycle: 3.2,
    cues: ['Hands down, feet back, chest to the floor', 'Jump the feet back in under the hips', 'Finish with a full jump and reach'],
    frames: [
      f(v(A.STAND_SIDE, { py: 48, uaL: 175, faL: 178, uaR: -175, faR: -178, thL: 6, shL: 4, thR: -6, shR: -4 }), 0.6),
      f(HANDS_DOWN_TUCK, 0.6),
      f(A.PLANK_HIGH, 0.6),
      f(A.PUSHUP_LOW, 0.6),
      f(A.PLANK_HIGH, 0.6),
      f(HANDS_DOWN_TUCK, 0.6),
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
    frames: [f(HANDS_DOWN_TUCK), f(A.PLANK_HIGH)],
  },
  {
    id: 'star-jump',
    name: 'Star Jump',
    category: 'cardio',
    muscles: ['fullbody', 'quads', 'shoulders'],
    met: 8,
    cycle: 1.4,
    cues: ['Load into a quarter squat', 'Explode into a full star', 'Land soft and reload'],
    frames: [
      f(v(A.STAND_FRONT, { py: 63, thL: -40, shL: 20, thR: 40, shR: -20, uaL: -30, faL: -90, uaR: 30, faR: 90, torso: 6 })),
      f(v(A.STAND_FRONT, { py: 52, uaL: -150, faL: -155, uaR: 150, faR: 155, thL: -30, shL: -32, ftL: -140, thR: 30, shR: 32, ftR: 140 })),
    ],
  },
  {
    id: 'skater-jump',
    name: 'Skater Jumps',
    category: 'cardio',
    muscles: ['glutes', 'quads', 'calves'],
    met: 7,
    cycle: 1.2,
    cues: ['Bound sideways, not up', 'Land on one leg and stick it', 'Swing the arms across the body'],
    frames: [f(SKATER), f(mirror(SKATER))],
  },
  {
    id: 'bear-crawl',
    name: 'Bear Crawl',
    category: 'cardio',
    muscles: ['fullbody', 'core', 'shoulders'],
    met: 8,
    cycle: 1.6,
    cues: ['Knees hover a fist above the floor', 'Opposite hand and foot move together', 'Keep the back flat, hips low'],
    frames: [
      f(v(QUADRUPED, { uaL: 14, faL: 14, thL: -15, shL: -100, uaR: -16, faR: -14, thR: 0, shR: -70 })),
      f(v(QUADRUPED, { uaR: 14, faR: 14, thR: -15, shR: -100, uaL: -16, faL: -14, thL: 0, shL: -70 })),
    ],
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
      f(BOX_GUARD),
      f(v(BOX_GUARD, { torso: 10, uaL: 85, faL: 88 })),
      f(BOX_GUARD),
      f(v(BOX_GUARD, { torso: 12, uaR: 85, faR: 88 })),
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
      f(v(A.STAND_SIDE, { uaL: -20, faL: 60, uaR: -24, faR: 56, thL: 6, shL: 12, thR: 2, shR: 8 })),
      f(v(A.STAND_SIDE, { py: 48, thL: 16, shL: 26, thR: 12, shR: 22, ftL: 50, ftR: 52, uaL: -20, faL: 70, uaR: -24, faR: 66 })),
    ],
  },

  // ============================ COOL-DOWN ============================
  {
    id: 'forward-fold',
    name: 'Standing Forward Fold',
    category: 'cooldown',
    muscles: ['hamstrings', 'back'],
    met: 2.3,
    cycle: 8,
    hold: true,
    cues: ['Soft knees, heavy head', 'Let the arms hang', 'Breathe into the back of the legs'],
    frames: [
      f(v(A.STAND_SIDE, { torso: 105, head: -20, uaL: 5, faL: 5, uaR: -5, faR: -5 }), 1, 4),
      f(v(A.STAND_SIDE, { torso: 110, head: -22, uaL: 3, faL: 3, uaR: -3, faR: -3 }), 1, 4),
    ],
  },
  {
    id: 'quad-stretch',
    name: 'Standing Quad Stretch',
    category: 'cooldown',
    muscles: ['quads', 'hipflexors'],
    met: 2.3,
    cycle: 8,
    hold: true,
    unilateral: true,
    cues: ['Knees side by side', 'Push the hip forward', 'Hold a wall if you wobble'],
    frames: [
      f(v(A.STAND_SIDE, { torso: 2, thR: -12, shR: -160, ftR: -120, uaR: -30, faR: -110, uaL: 20, faL: -40 }), 1, 4),
      f(v(A.STAND_SIDE, { torso: 3, thR: -14, shR: -163, ftR: -122, uaR: -32, faR: -112, uaL: 22, faL: -42 }), 1, 4),
    ],
  },
  {
    id: 'chest-opener',
    name: 'Chest Opener',
    category: 'cooldown',
    muscles: ['chest', 'shoulders'],
    met: 2.3,
    cycle: 8,
    hold: true,
    cues: ['Clasp the hands behind the back', 'Lift the chest, drop the shoulders', 'Do not shrug up to the ears'],
    frames: [
      f(v(A.STAND_SIDE, { torso: -4, head: 8, uaL: -28, faL: -46, uaR: -32, faR: -50 }), 1, 4),
      f(v(A.STAND_SIDE, { torso: -6, head: 10, uaL: -34, faL: -52, uaR: -38, faR: -56 }), 1, 4),
    ],
  },
  {
    id: 'cobra-stretch',
    name: 'Cobra Stretch',
    category: 'cooldown',
    muscles: ['core', 'back', 'chest'],
    met: 2.3,
    cycle: 8,
    hold: true,
    cues: ['Hips stay on the floor', 'Press up only as far as it feels good', 'Shoulders down and back'],
    frames: [
      f(v(A.PRONE_FLAT, { px: 58, py: 92, torso: -55, head: 12, uaL: -60, faL: 40, uaR: -62, faR: 38, thL: 88, shL: 88, thR: 90, shR: 90 }), 1, 4),
      f(v(A.PRONE_FLAT, { px: 58, py: 92, torso: -52, head: 14, uaL: -63, faL: 43, uaR: -65, faR: 41, thL: 88, shL: 88, thR: 90, shR: 90 }), 1, 4),
    ],
  },
  {
    id: 'child-pose',
    name: 'Child Pose',
    category: 'cooldown',
    muscles: ['back', 'glutes', 'shoulders'],
    met: 2.3,
    cycle: 8,
    hold: true,
    cues: ['Sit the hips back onto the heels', 'Walk the hands as far forward as you can', 'Let the forehead rest down'],
    frames: [
      f(v(A.PLANK_HIGH, { px: 34, py: 86, torso: 100, head: -20, uaL: 85, faL: 85, uaR: 83, faR: 83, thL: 66, shL: -87, ftL: -100, thR: 64, shR: -89, ftR: -102 }), 1, 4),
      f(v(A.PLANK_HIGH, { px: 34, py: 87, torso: 101, head: -21, uaL: 86, faL: 86, uaR: 84, faR: 84, thL: 67, shL: -88, ftL: -100, thR: 65, shR: -90, ftR: -102 }), 1, 4),
    ],
  },
  {
    id: 'cat-cow',
    name: 'Cat-Cow',
    category: 'cooldown',
    muscles: ['back', 'core'],
    met: 2.5,
    cycle: 4,
    cues: ['Arch and round through the whole spine', 'Move with the breath', 'Hands under shoulders, knees under hips'],
    frames: [
      f(v(QUADRUPED, { py: 76, torso: 78, head: 20 })),
      f(v(QUADRUPED, { py: 70, torso: 68, head: -30 })),
    ],
  },
  {
    id: 'hamstring-stretch',
    name: 'Seated Hamstring Stretch',
    category: 'cooldown',
    muscles: ['hamstrings', 'back'],
    met: 2.3,
    cycle: 8,
    hold: true,
    cues: ['Hinge from the hips, not the upper back', 'Reach towards the toes, not past the knees', 'Breathe and settle deeper'],
    frames: [
      f(v(A.SUPINE_FLAT, { px: 30, py: 88, torso: 70, head: -10, uaL: 55, faL: 55, uaR: 53, faR: 53, thL: 85, shL: 88, ftL: 30, thR: 87, shR: 90, ftR: 32 }), 1, 4),
      f(v(A.SUPINE_FLAT, { px: 30, py: 88, torso: 74, head: -12, uaL: 58, faL: 58, uaR: 56, faR: 56, thL: 85, shL: 88, ftL: 30, thR: 87, shR: 90, ftR: 32 }), 1, 4),
    ],
  },
]

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e]),
)

export function getExercise(id: string): Exercise {
  const ex = EXERCISE_BY_ID[id]
  if (!ex) throw new Error(`Unknown exercise: ${id}`)
  return ex
}

export const CATEGORY_LABEL: Record<Category, string> = {
  warmup: 'Warm-Up',
  push: 'Upper Body',
  legs: 'Lower Body',
  core: 'Core',
  cardio: 'Conditioning',
  cooldown: 'Cool-Down',
}

export const MUSCLE_LABEL: Record<Muscle, string> = {
  chest: 'Chest',
  shoulders: 'Shoulders',
  triceps: 'Triceps',
  back: 'Back',
  core: 'Core',
  obliques: 'Obliques',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  hipflexors: 'Hip Flexors',
  fullbody: 'Full Body',
}
