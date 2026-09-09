import { getExercise } from './exercises'

export type Difficulty = 'recruit' | 'soldier' | 'special'

export interface BlockItem {
  exercise: string
  mode: 'time' | 'reps'
  value: number
  /** Rest in seconds after this item. */
  rest: number
}

export interface WorkoutBlock {
  name: string
  rounds: number
  /** Rest in seconds between rounds of this block. */
  roundRest: number
  items: BlockItem[]
}

export interface Workout {
  id: string
  name: string
  subtitle: string
  /** Tags shown on the card. */
  focus: string[]
  /** Equipment or space the workout assumes. */
  needs?: string[]
  /** True for workouts that avoid jumping and floor impact. */
  quiet?: boolean
  blocks: WorkoutBlock[]
}

// --- authoring helpers ---------------------------------------------------------

const t = (exercise: string, value: number, rest = 15): BlockItem => ({
  exercise,
  mode: 'time',
  value,
  rest,
})
const r = (exercise: string, value: number, rest = 20): BlockItem => ({
  exercise,
  mode: 'reps',
  value,
  rest,
})
const block = (name: string, rounds: number, roundRest: number, items: BlockItem[]): WorkoutBlock => ({
  name,
  rounds,
  roundRest,
  items,
})

/** The standard warm-up. Every workout except the recovery session opens with it. */
const WARMUP = block('Warm-Up', 1, 20, [
  t('jumping-jacks', 40, 10),
  t('arm-swings', 30, 10),
  t('torso-twists', 30, 10),
  t('high-knees', 30, 10),
  t('leg-swings', 20, 10),
  t('inchworm', 40, 20),
])

const WARMUP_QUIET = block('Warm-Up', 1, 20, [
  t('arm-circles', 30, 10),
  t('arm-swings', 30, 10),
  t('torso-twists', 30, 10),
  t('leg-swings', 20, 10),
  t('inchworm', 40, 10),
  t('cat-cow', 40, 20),
])

const COOLDOWN = block('Cool-Down', 1, 0, [
  t('forward-fold', 40, 5),
  t('quad-stretch', 30, 5),
  t('cobra-stretch', 40, 5),
  t('child-pose', 40, 5),
  t('chest-opener', 30, 5),
  t('hamstring-stretch', 40, 0),
])

// --- the workouts --------------------------------------------------------------

export const WORKOUTS: Workout[] = [
  {
    id: 'daily-pt',
    name: 'Daily PT',
    subtitle: 'The standard full-body session. If in doubt, do this one.',
    focus: ['Full body', 'Strength', 'Conditioning'],
    blocks: [
      WARMUP,
      block('Circuit A', 3, 60, [
        r('push-up', 12),
        r('squat', 20),
        t('mountain-climber', 40),
        r('reverse-lunge', 10),
      ]),
      block('Circuit B', 3, 60, [
        t('plank', 45),
        r('sit-up', 15),
        r('burpee', 8),
        t('superman', 30),
      ]),
      COOLDOWN,
    ],
  },
  {
    id: 'reveille',
    name: 'Reveille',
    subtitle: 'Five honest minutes. No excuses, no equipment, no sweat needed.',
    focus: ['Short', 'Wake-up', 'Full body'],
    blocks: [
      block('Wake Up', 1, 15, [
        t('jumping-jacks', 40, 10),
        t('arm-swings', 30, 10),
        t('torso-twists', 30, 15),
      ]),
      block('Work', 2, 40, [r('squat', 15), r('push-up', 8), t('plank', 30)]),
      block('Finish', 1, 0, [t('forward-fold', 30, 5), t('chest-opener', 30, 0)]),
    ],
  },
  {
    id: 'upper-assault',
    name: 'Upper Body Assault',
    subtitle: 'Chest, shoulders, triceps and everything that holds a plank together.',
    focus: ['Upper body', 'Push', 'Strength'],
    blocks: [
      WARMUP,
      block('Press', 3, 60, [
        r('push-up', 12),
        r('pike-push-up', 8),
        r('wide-push-up', 10),
        t('plank-shoulder-tap', 40),
      ]),
      block('Finisher', 2, 45, [
        r('diamond-push-up', 8),
        r('plank-up-down', 8),
        t('plank', 40),
      ]),
      COOLDOWN,
    ],
  },
  {
    id: 'leg-day',
    name: 'Leg Day',
    subtitle: 'Quads, glutes and hamstrings. Stairs will feel different tomorrow.',
    focus: ['Lower body', 'Strength'],
    blocks: [
      WARMUP,
      block('Strength', 3, 60, [
        r('squat', 20),
        r('split-squat', 10),
        r('glute-bridge', 15),
        r('calf-raise', 20),
      ]),
      block('Burnout', 2, 60, [
        t('wall-sit', 45),
        r('jump-squat', 12),
        r('single-leg-deadlift', 8),
      ]),
      COOLDOWN,
    ],
  },
  {
    id: 'core-blast',
    name: 'Core Blast',
    subtitle: 'Ten minutes of midsection. Every rep slow enough to feel.',
    focus: ['Core', 'Short'],
    blocks: [
      block('Prep', 1, 15, [t('cat-cow', 40, 10), t('torso-twists', 30, 15)]),
      block('Core Circuit', 3, 45, [
        t('plank', 40),
        r('sit-up', 15),
        t('flutter-kicks', 30),
        r('russian-twist', 20),
        t('side-plank', 30),
      ]),
      block('Cool-Down', 1, 0, [t('cobra-stretch', 30, 5), t('child-pose', 40, 0)]),
    ],
  },
  {
    id: 'hiit-sprint',
    name: 'HIIT Sprint',
    subtitle: 'Twenty on, ten off. It is over before you can talk yourself out of it.',
    focus: ['Conditioning', 'Short', 'High intensity'],
    blocks: [
      block('Warm-Up', 1, 20, [t('jumping-jacks', 40, 10), t('high-knees', 30, 20)]),
      block('Tabata', 4, 60, [
        t('burpee', 20, 10),
        t('mountain-climber', 20, 10),
        t('jump-squat', 20, 10),
        t('high-knees', 20, 10),
      ]),
      block('Cool-Down', 1, 0, [t('forward-fold', 40, 5), t('hamstring-stretch', 40, 0)]),
    ],
  },
  {
    id: 'full-body-burn',
    name: 'Full Body Burn',
    subtitle: 'The long one. Four circuits, no equipment, plenty of regret.',
    focus: ['Full body', 'Long', 'Conditioning'],
    blocks: [
      WARMUP,
      block('Circuit 1', 2, 45, [r('push-up', 12), r('squat', 20), t('mountain-climber', 40)]),
      block('Circuit 2', 2, 45, [r('reverse-lunge', 12), r('pike-push-up', 8), t('plank', 45)]),
      block('Circuit 3', 2, 45, [r('burpee', 10), r('sit-up', 20), r('jump-squat', 12)]),
      block('Circuit 4', 2, 45, [t('bear-crawl', 40), t('hollow-hold', 30), r('superman', 15)]),
      COOLDOWN,
    ],
  },
  {
    id: 'quiet-ops',
    name: 'Quiet Ops',
    subtitle: 'Nothing that lands hard. Built for a flat with neighbours below.',
    focus: ['Full body', 'No jumping', 'Apartment'],
    quiet: true,
    blocks: [
      WARMUP_QUIET,
      block('Circuit A', 3, 60, [
        r('push-up', 12),
        r('squat', 20),
        r('reverse-lunge', 10),
        t('plank', 45),
      ]),
      block('Circuit B', 2, 60, [
        r('glute-bridge', 15),
        r('dead-bug', 12),
        t('side-plank', 30),
        r('superman', 15),
      ]),
      COOLDOWN,
    ],
  },
  {
    id: 'ab-ladder',
    name: 'Ab Ladder',
    subtitle: 'Six core moves, three descending rounds. The last round is the point.',
    focus: ['Core', 'Endurance'],
    blocks: [
      block('Prep', 1, 15, [t('cat-cow', 40, 10), t('inchworm', 40, 15)]),
      block('Ladder', 3, 50, [
        r('sit-up', 20),
        r('leg-raise', 15),
        r('bicycle-crunch', 20),
        r('reverse-crunch', 15),
        r('toe-touch', 15),
        t('hollow-hold', 30),
      ]),
      block('Cool-Down', 1, 0, [t('cobra-stretch', 40, 5), t('child-pose', 40, 0)]),
    ],
  },
  {
    id: 'conditioning-circuit',
    name: 'Endurance Circuit',
    subtitle: 'Long intervals, short rests. Trains the engine, not the max.',
    focus: ['Conditioning', 'Endurance'],
    blocks: [
      WARMUP,
      block('Engine', 4, 60, [
        t('jump-rope', 60, 15),
        t('shadow-boxing', 60, 15),
        t('squat-thrust', 45, 15),
        t('bear-crawl', 45, 15),
      ]),
      COOLDOWN,
    ],
  },
  {
    id: 'strength-ladder',
    name: 'Strength Ladder',
    subtitle: 'Low reps, long rests. Quality over sweat.',
    focus: ['Strength', 'Full body'],
    blocks: [
      WARMUP,
      block('Ladder', 4, 75, [
        r('diamond-push-up', 8, 30),
        r('split-squat', 8, 30),
        r('explosive-push-up', 6, 30),
        r('single-leg-glute-bridge', 10, 30),
      ]),
      COOLDOWN,
    ],
  },
  {
    id: 'recovery',
    name: 'Recovery & Mobility',
    subtitle: 'Active rest. Do it on the day off, not instead of the day off.',
    focus: ['Mobility', 'Recovery', 'Low intensity'],
    quiet: true,
    blocks: [
      block('Mobility', 1, 20, [
        t('cat-cow', 60, 10),
        t('arm-circles', 40, 10),
        t('torso-twists', 40, 10),
        t('leg-swings', 30, 10),
        t('inchworm', 60, 20),
      ]),
      block('Stretch', 2, 20, [
        t('forward-fold', 45, 10),
        t('quad-stretch', 40, 10),
        t('cobra-stretch', 45, 10),
        t('hamstring-stretch', 45, 10),
        t('child-pose', 60, 10),
      ]),
    ],
  },
]

export const WORKOUT_BY_ID: Record<string, Workout> = Object.fromEntries(
  WORKOUTS.map((w) => [w.id, w]),
)

// --- difficulty scaling --------------------------------------------------------

export interface Scaling {
  /** Multiplier on prescribed work (seconds or reps). */
  work: number
  /** Multiplier on every rest period. */
  rest: number
  /** Added to the round count of every multi-round block. */
  rounds: number
}

export const DIFFICULTY: Record<Difficulty, { label: string; blurb: string; scale: Scaling }> = {
  recruit: {
    label: 'Recruit',
    blurb: 'Shorter work, longer rest, one round less. Start here if you are coming back.',
    scale: { work: 0.75, rest: 1.4, rounds: -1 },
  },
  soldier: {
    label: 'Soldier',
    blurb: 'The prescribed session as written. Demanding but sustainable.',
    scale: { work: 1, rest: 1, rounds: 0 },
  },
  special: {
    label: 'Special Forces',
    blurb: 'More work, less rest, an extra round. Only when the middle tier feels easy.',
    scale: { work: 1.3, rest: 0.7, rounds: 1 },
  },
}

export const DIFFICULTY_ORDER: Difficulty[] = ['recruit', 'soldier', 'special']

/** Round to something a human can actually count. */
function tidy(value: number, mode: 'time' | 'reps'): number {
  if (mode === 'reps') return Math.max(1, Math.round(value))
  if (value <= 30) return Math.max(10, Math.round(value / 5) * 5)
  return Math.round(value / 5) * 5
}

/**
 * One step of a running workout. The player walks a flat list of these, so all the
 * branching (rounds, per-side repeats, rest) is resolved up front.
 */
export interface Step {
  kind: 'work' | 'rest'
  exercise: string
  label: string
  blockName: string
  round: number
  totalRounds: number
  mode: 'time' | 'reps'
  value: number
  /** Seconds this step lasts. Rep-based work uses the exercise cycle as an estimate. */
  seconds: number
  side?: 'left' | 'right'
  /** The work step that follows, for the "up next" line and the rest preview. */
  nextExercise?: string
  nextExerciseId?: string
}

/** Expand a workout into the flat list of steps the player runs. */
export function buildSteps(workout: Workout, difficulty: Difficulty, weekMultiplier = 1): Step[] {
  const scale = DIFFICULTY[difficulty].scale
  const steps: Step[] = []

  for (const b of workout.blocks) {
    const rounds = Math.max(1, b.rounds + (b.rounds > 1 ? scale.rounds : 0))
    for (let round = 1; round <= rounds; round++) {
      b.items.forEach((item, itemIndex) => {
        const ex = getExercise(item.exercise)
        const raw = item.value * scale.work * weekMultiplier
        const value = tidy(ex.hold && item.mode === 'reps' ? raw * ex.cycle : raw, ex.hold ? 'time' : item.mode)
        const mode: 'time' | 'reps' = ex.hold ? 'time' : item.mode
        const sides: (undefined | 'right' | 'left')[] = ex.unilateral ? ['right', 'left'] : [undefined]

        sides.forEach((side, sideIndex) => {
          steps.push({
            kind: 'work',
            exercise: ex.id,
            label: ex.name,
            blockName: b.name,
            round,
            totalRounds: rounds,
            mode,
            value,
            seconds: mode === 'time' ? value : Math.round(value * ex.cycle),
            side,
          })
          const isLastItem = itemIndex === b.items.length - 1 && sideIndex === sides.length - 1
          const isLastRound = round === rounds
          const restSeconds = isLastItem
            ? isLastRound
              ? 0
              : Math.round(b.roundRest * scale.rest)
            : Math.round(item.rest * scale.rest * (side === 'right' ? 0.5 : 1))
          if (restSeconds > 0) {
            steps.push({
              kind: 'rest',
              exercise: ex.id,
              label: 'Rest',
              blockName: b.name,
              round,
              totalRounds: rounds,
              mode: 'time',
              value: restSeconds,
              seconds: restSeconds,
            })
          }
        })
      })
    }
  }

  // Annotate every step with the exercise that follows, for the "up next" line.
  for (let i = 0; i < steps.length; i++) {
    const next = steps.slice(i + 1).find((s) => s.kind === 'work')
    steps[i].nextExercise = next?.label
    steps[i].nextExerciseId = next?.exercise
  }
  return steps
}

export function totalSeconds(steps: Step[]): number {
  return steps.reduce((sum, s) => sum + s.seconds, 0)
}

/** Estimated energy cost in kcal, from the MET of each exercise and the body weight. */
export function estimateKcal(steps: Step[], weightKg: number): number {
  const kcal = steps.reduce((sum, s) => {
    const met = s.kind === 'rest' ? 1.5 : getExercise(s.exercise).met
    return sum + (met * 3.5 * weightKg) / 200 / 60 * s.seconds
  }, 0)
  return Math.round(kcal)
}
