/** Multi-week programmes. A plan is a schedule of workout ids plus a weekly ramp. */

export interface Plan {
  id: string
  name: string
  subtitle: string
  description: string
  /** One entry per day. 'rest' means a scheduled rest day. */
  schedule: string[]
  /** Work multiplier applied per week, so week 4 is harder than week 1. */
  weekly: number[]
}

const REST = 'rest'

export const PLANS: Plan[] = [
  {
    id: 'basic-training',
    name: '28-Day Basic Training',
    subtitle: 'Four weeks, six sessions a week, one full rest day',
    description:
      'The default programme. It rotates full-body, upper, lower and core work so nothing gets trained two hard days in a row, and it adds roughly eight percent more work each week. Finish it and repeat it at the next difficulty rather than adding days.',
    weekly: [1, 1.08, 1.16, 1.25],
    schedule: [
      'daily-pt', 'core-blast', 'quiet-ops', REST, 'hiit-sprint', 'leg-day', 'recovery',
      'daily-pt', 'upper-assault', 'core-blast', REST, 'hiit-sprint', 'full-body-burn', 'recovery',
      'daily-pt', 'upper-assault', 'ab-ladder', REST, 'conditioning-circuit', 'leg-day', 'recovery',
      'full-body-burn', 'upper-assault', 'core-blast', REST, 'hiit-sprint', 'strength-ladder', 'recovery',
    ],
  },
  {
    id: 'core-challenge',
    name: '14-Day Core Challenge',
    subtitle: 'Two weeks of short, focused midsection work',
    description:
      'Fifteen to twenty minutes a day, almost all of it on the floor. Built to slot alongside another programme or to run on its own when time is short.',
    weekly: [1, 1.15],
    schedule: [
      'core-blast', 'ab-ladder', REST, 'core-blast', 'ab-ladder', 'quiet-ops', REST,
      'core-blast', 'ab-ladder', REST, 'core-blast', 'ab-ladder', 'daily-pt', REST,
    ],
  },
  {
    id: 'conditioning',
    name: '21-Day Conditioning',
    subtitle: 'Three weeks aimed squarely at the engine',
    description:
      'Interval-heavy and deliberately repetitive: the same handful of sessions come back often enough that you can see the progress. Expect to be out of breath most days.',
    weekly: [1, 1.1, 1.2],
    schedule: [
      'hiit-sprint', 'conditioning-circuit', REST, 'daily-pt', 'hiit-sprint', 'recovery', REST,
      'conditioning-circuit', 'hiit-sprint', 'core-blast', REST, 'conditioning-circuit', 'full-body-burn', 'recovery',
      'hiit-sprint', 'conditioning-circuit', 'leg-day', REST, 'hiit-sprint', 'full-body-burn', 'recovery',
    ],
  },
]

export const PLAN_BY_ID: Record<string, Plan> = Object.fromEntries(PLANS.map((p) => [p.id, p]))

export function weekOf(plan: Plan, dayIndex: number): number {
  return Math.min(plan.weekly.length - 1, Math.floor(dayIndex / 7))
}

export function multiplierFor(plan: Plan, dayIndex: number): number {
  return plan.weekly[weekOf(plan, dayIndex)]
}

// --- PT test -------------------------------------------------------------------

export type PtEventId = 'push-up' | 'sit-up' | 'plank'

export interface PtEvent {
  id: PtEventId
  name: string
  exercise: string
  /** 'reps' events are capped by a clock; 'hold' events are the clock. */
  kind: 'reps' | 'hold'
  /** Seconds allowed for a rep event. */
  limit: number
  unit: string
  /** Score anchors: the value worth 60 points and the value worth 100. */
  min60: number
  max100: number
  brief: string
}

export const PT_EVENTS: PtEvent[] = [
  {
    id: 'push-up',
    name: 'Push-Ups',
    exercise: 'push-up',
    kind: 'reps',
    limit: 120,
    unit: 'reps',
    min60: 42,
    max100: 71,
    brief: 'As many correct push-ups as possible in two minutes. Resting is allowed in the front leaning rest, not on the floor.',
  },
  {
    id: 'sit-up',
    name: 'Sit-Ups',
    exercise: 'sit-up',
    kind: 'reps',
    limit: 120,
    unit: 'reps',
    min60: 53,
    max100: 78,
    brief: 'As many correct sit-ups as possible in two minutes. Shoulder blades to the floor, chest past vertical.',
  },
  {
    id: 'plank',
    name: 'Plank Hold',
    exercise: 'plank',
    kind: 'hold',
    limit: 400,
    unit: 'seconds',
    min60: 90,
    max100: 220,
    brief: 'Hold a correct forearm plank for as long as you can. The clock stops when the hips drop or rise out of line.',
  },
]

/** Linear score with 60 and 100 point anchors, clamped to 0-100. */
export function scoreEvent(event: PtEvent, value: number): number {
  if (value <= 0) return 0
  if (value >= event.max100) return 100
  if (value >= event.min60) {
    return Math.round(60 + ((value - event.min60) / (event.max100 - event.min60)) * 40)
  }
  return Math.round((value / event.min60) * 60)
}

export function ptRank(total: number): string {
  if (total >= 270) return 'Special Forces'
  if (total >= 210) return 'Soldier'
  if (total >= 150) return 'Trained'
  if (total >= 90) return 'Recruit'
  return 'Untested'
}
