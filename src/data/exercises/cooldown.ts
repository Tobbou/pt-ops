import type { Exercise } from './types'
import { A, f, v } from './shared'

// --- local anchors ---------------------------------------------------------------
//
// Every hold below is two nearly identical frames with a long hold, so the figure
// breathes: frame 0 is the inhale (a touch less deep), frame 1 the exhale (settled).
// Contact points (feet, hands, knees, pelvis on the floor) were solved to the same
// coordinates in both frames; only the joints between them move.

/**
 * Standing fold: hips back over the heels, knees soft (about 20 degrees). Ankles stay at
 * x ≈ 49.1 / 48.4 on the ground line, the same spots STAND_SIDE puts them.
 */
const FOLD_BASE = v(A.STAND_SIDE, {
  px: 42.8, py: 57,
  thL: 18.99, shL: -0.71, ftL: 80,
  thR: 18.27, shR: -2, ftR: 80,
})

/**
 * Hands and knees, neutral spine: hips over the knees, shoulders over the hands.
 * Knees on the floor at x ≈ 38, hands at x ≈ 62.4. Feet relaxed, tops on the floor.
 */
const TABLE = v(A.PLANK_HIGH, {
  px: 38, py: 72.5, torso: 70, spine: 0, head: 0,
  uaL: 1, faL: 1, uaR: -1, faR: -1,
  thL: 1, shL: -89, ftL: -80,
  thR: -1, shR: -91, ftR: -80,
})

/** Cat: tail tucked, mid-back pushed to the ceiling, chin to the chest. Pelvis shifted so the knees stay put. */
const CAT = v(TABLE, { px: 39.2, torso: 53.4, spine: 34, head: 32, thL: -2.45, thR: -4.45 })

/** Cow: belly drops, chest opens, gaze forward. */
const COW = v(TABLE, { px: 38.82, torso: 82.25, spine: -28, head: -32, thL: -1.35, thR: -3.35 })

/** Lying face down, head right, pelvis on the floor, legs long, tops of the feet down. */
const PRONE_HIPS_DOWN = v(A.PRONE_FLAT, {
  px: 50, py: 90.5,
  thL: -89, shL: -89, ftL: -50,
  thR: -91, shR: -91, ftR: -50,
})

/** Kneeling, hips on the heels, shins along the floor. Knees at x ≈ 44, toes tucked back. */
const KNEEL_SIT = v(A.PLANK_HIGH, {
  px: 27, py: 82,
  thL: 59, shL: -88, ftL: -80,
  thR: 59, shR: -88, ftR: -80,
})

/** Sitting on the floor, legs long in front, toes pulled up. */
const SIT_LONG = v(A.SUPINE_FLAT, {
  px: 32, py: 90.8,
  thL: 84, shL: 86, ftL: 174,
  thR: 85, shR: 86.6, ftR: 175,
})

export const COOLDOWN: Exercise[] = [
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
      // Inhale: hips hinged to horizontal, the upper back rounded and the head hanging, arms
      // hanging straight with the fingertips a whisker off the floor. The lift is quicker than
      // the sink and the deep position is held longest, as a relaxed stretch is.
      f(v(FOLD_BASE, { torso: 89, spine: 31, head: 38, uaL: -3, faL: -3, uaR: -4.5, faR: -4.5 }), 1.2, 3),
      // Exhale: the spine rounds a little more and the fingertips touch down. Feet and knees
      // do not move; only the hinge deepens.
      f(v(FOLD_BASE, { torso: 90.5, spine: 32.5, head: 40, uaL: -3.5, faL: -3.5, uaR: -5, faR: -5 }), 1.8, 4),
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
      // Standing tall on the far leg; near heel drawn to the glute, near hand gripping the ankle,
      // far arm reaching forward for balance.
      f(v(A.STAND_SIDE, {
        px: 47.5, py: 56, torso: 1, head: 0,
        thL: 2, shL: 0, ftL: 80,
        thR: -8, shR: -156, ftR: -120,
        uaR: -22, faR: -22, uaL: 55, faL: 75,
      }), 1.5, 3.5),
      // Exhale: hip pushes forward, heel pulls in; the hand follows the ankle.
      f(v(A.STAND_SIDE, {
        px: 48, py: 56, torso: 1, head: 0,
        thL: 1.6, shL: -1, ftL: 80,
        thR: -12, shR: -162, ftR: -124,
        uaR: -22, faR: -22, uaL: 55, faL: 75,
      }), 1.5, 3.5),
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
      // Exhale: standing tall, arms straight and hands clasped behind the sacrum, a little
      // thoracic extension, chin level so the gaze stays ahead. The lift comes from the upper
      // back only; the pelvis stays over the feet rather than leaning the whole body back.
      f(v(A.STAND_SIDE, { torso: 0, spine: -8, head: 6, uaL: -26, faL: -26, uaR: -28, faR: -28 }), 1.2, 3.5),
      // Inhale: the clasped hands lift away from the body, the chest opens further and the head
      // tucks a touch more to keep the gaze level. The lift is slower than the release.
      f(v(A.STAND_SIDE, { torso: 0, spine: -12, head: 9, uaL: -42, faL: -42, uaR: -44, faR: -44 }), 1.8, 3.5),
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
      // Low cobra: hands under the shoulders, elbows tucked back, upper back arched, gaze forward.
      f(v(PRONE_HIPS_DOWN, { torso: 74, spine: -20, head: -26, uaL: -55.8, faL: 70.9, uaR: -60.2, faR: 66.6 }), 1.5, 3.5),
      // Inhale: press a little higher; the hands stay, the elbows straighten a touch.
      f(v(PRONE_HIPS_DOWN, { torso: 64, spine: -28, head: -30, uaL: -34.4, faL: 66.5, uaR: -38, faR: 64.1 }), 1.5, 3.5),
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
      // Solved so the hips actually rest on the heels (pelvis over the ankle, its
      // underside at the heel line) with the trunk draped forward over the thighs and
      // the forehead on the floor. The previous version left the hips floating four
      // units clear and the whole figure read as lying flat.
      f(v(KNEEL_SIT, {
        px: 30, py: 87, torso: 98, spine: 8, head: -34,
        thL: 71, shL: -87, ftL: -100, thR: 69, shR: -89, ftR: -102,
        uaL: 86.6, faL: 86.6, uaR: 84.6, faR: 84.6,
      }), 1.5, 3.5),
      // Exhale: the hips settle, the back rounds a fraction more, the hands creep out.
      f(v(KNEEL_SIT, {
        px: 30, py: 87.6, torso: 99, spine: 10, head: -35,
        thL: 72, shL: -88, ftL: -100, thR: 70, shR: -90, ftR: -102,
        uaL: 87.4, faL: 87.4, uaR: 85.4, faR: 85.4,
      }), 1.5, 3.5),
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
      // Cat (exhale) -> neutral -> cow (inhale) -> neutral. Hands and knees never move; the
      // pelvis slides a fraction so the shoulders stay over the hands as the spine changes length.
      // 'in' into neutral and 'out' into the ends make one continuous wave rather than four stops.
      f(CAT, 1, 0.3, 'out'),
      f(TABLE, 1, 0, 'in'),
      f(COW, 1, 0.3, 'out'),
      f(TABLE, 1, 0, 'in'),
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
      // Hinged forward from the hips, back long, arms reaching to the toes.
      f(v(SIT_LONG, { torso: 40, spine: 6, head: 6, uaL: 34.3, faL: 74.8, uaR: 35.9, faR: 75.9 }), 1.5, 3.5),
      // Exhale: fold a little deeper holding the toes; the elbows soften.
      f(v(SIT_LONG, { torso: 46, spine: 9, head: 8, uaL: 22.3, faL: 91.1, uaR: 24, faR: 92.4 }), 1.5, 3.5),
    ],
  },
]
