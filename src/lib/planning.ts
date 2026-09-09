import { PLAN_BY_ID, type Plan } from '../data/plans'
import { WORKOUT_BY_ID, buildSteps, totalSeconds, type Workout } from '../data/workouts'
import type { AppState, PlanState, Session } from '../state/store'
import { daysBetween, isoDate } from './format'

/**
 * A plan advances by completion, not by the calendar.
 *
 * Miss three days and a date-driven plan would silently skip three sessions, which
 * punishes exactly the person who needs the programme most. The calendar date is still
 * shown, so it is obvious when you are behind.
 */
export function currentPlanDay(plan: Plan, planState: PlanState): number {
  for (let i = 0; i < plan.schedule.length; i++) {
    if (!planState.completed.includes(i)) return i
  }
  return plan.schedule.length
}

export function planIsFinished(plan: Plan, planState: PlanState): boolean {
  return currentPlanDay(plan, planState) >= plan.schedule.length
}

/** How many calendar days have passed since the plan started. */
export function planCalendarDay(planState: PlanState): number {
  return daysBetween(planState.startDate, isoDate())
}

export interface TodaysWork {
  kind: 'plan' | 'suggestion' | 'plan-rest' | 'plan-done'
  workout?: Workout
  planId?: string
  dayIndex?: number
  reason: string
}

const SUGGESTION_ROTATION = ['daily-pt', 'core-blast', 'upper-assault', 'hiit-sprint', 'leg-day', 'quiet-ops']

/** What the Today screen should offer, in priority order. */
export function todaysWork(state: AppState): TodaysWork {
  if (state.plan) {
    const plan = PLAN_BY_ID[state.plan.planId]
    if (plan) {
      const day = currentPlanDay(plan, state.plan)
      if (day >= plan.schedule.length) {
        return { kind: 'plan-done', reason: `${plan.name} complete` }
      }
      const id = plan.schedule[day]
      if (id === 'rest') {
        return {
          kind: 'plan-rest',
          planId: plan.id,
          dayIndex: day,
          reason: `Day ${day + 1} of ${plan.schedule.length}`,
        }
      }
      return {
        kind: 'plan',
        workout: WORKOUT_BY_ID[id],
        planId: plan.id,
        dayIndex: day,
        reason: `${plan.name} · day ${day + 1} of ${plan.schedule.length}`,
      }
    }
  }

  // No plan: rotate so the same session does not come up two days running.
  const lastId = state.sessions[0]?.workoutId
  const lastIndex = SUGGESTION_ROTATION.indexOf(lastId ?? '')
  const pick = SUGGESTION_ROTATION[(lastIndex + 1) % SUGGESTION_ROTATION.length]
  return {
    kind: 'suggestion',
    workout: WORKOUT_BY_ID[pick],
    reason: state.sessions.length ? 'Suggested next session' : 'A good place to start',
  }
}

/** Prescribed length of a workout at the current difficulty, in seconds. */
export function workoutLength(workout: Workout, state: AppState, weekMultiplier = 1): number {
  return totalSeconds(buildSteps(workout, state.profile.difficulty, weekMultiplier))
}

export function sessionsInWeek(sessions: Session[], weeksAgo = 0): Session[] {
  const now = new Date()
  const mondayOffset = (now.getDay() + 6) % 7
  const start = new Date(now)
  start.setDate(now.getDate() - mondayOffset - weeksAgo * 7)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)
  const startIso = isoDate(start)
  const endIso = isoDate(end)
  return sessions.filter((s) => s.date >= startIso && s.date < endIso)
}
