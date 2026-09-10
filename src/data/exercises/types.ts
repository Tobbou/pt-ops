import type { Frame } from '../../lib/pose'
import type { Facing } from '../../lib/figure-geometry'

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
  /** Camera angle. Front-on exercises colour both chains alike and omit the nose. */
  facing?: Facing
  cues: string[]
  frames: Frame[]
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
