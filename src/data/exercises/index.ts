/**
 * The exercise catalogue, one file per category so each can be authored and reviewed on
 * its own. Everything else imports from here.
 */
import { CARDIO } from './cardio'
import { COOLDOWN } from './cooldown'
import { CORE } from './core'
import { LEGS } from './legs'
import { PUSH } from './push'
import type { Exercise } from './types'
import { WARMUP } from './warmup'

export * from './types'

export const EXERCISES: Exercise[] = [...WARMUP, ...PUSH, ...LEGS, ...CORE, ...CARDIO, ...COOLDOWN]

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e]),
)

export function getExercise(id: string): Exercise {
  const ex = EXERCISE_BY_ID[id]
  if (!ex) throw new Error(`Unknown exercise: ${id}`)
  return ex
}
