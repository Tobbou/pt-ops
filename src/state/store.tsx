import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { Difficulty } from '../data/workouts'
import { isoDate } from '../lib/format'

/**
 * All state lives in one object in localStorage.
 *
 * There is no account and no server: a training log is a few kilobytes of JSON even
 * after years of use, and keeping it on the device means the app works on a plane, in a
 * basement gym and with no privacy policy to write. Settings has an export button for
 * the one thing this costs you, moving to a new phone.
 */

export const STORAGE_KEY = 'pt-ops.state.v1'

export interface Profile {
  weightKg: number
  heightCm: number
  difficulty: Difficulty
}

export interface Settings {
  sound: boolean
  voice: boolean
  vibration: boolean
  keepAwake: boolean
  /** Seconds of "get ready" before the first exercise. */
  countdown: number
  /** Show the next exercise during rest. */
  showNext: boolean
}

export interface SessionExercise {
  id: string
  mode: 'time' | 'reps'
  value: number
  side?: 'left' | 'right'
}

export interface Session {
  id: string
  date: string
  workoutId: string
  workoutName: string
  difficulty: Difficulty
  planId?: string
  planDay?: number
  /** Wall-clock seconds from start to finish, pauses included. */
  durationSec: number
  /** Seconds actually spent working, rest excluded. */
  workSec: number
  kcal: number
  completedSteps: number
  totalSteps: number
  exercises: SessionExercise[]
}

export interface Metric {
  date: string
  weightKg?: number
  waistCm?: number
  chestCm?: number
  armCm?: number
  thighCm?: number
}

export interface PtResult {
  id: string
  date: string
  pushUps: number
  sitUps: number
  plankSeconds: number
  score: number
}

export interface PlanState {
  planId: string
  startDate: string
  /** Day indices already completed. */
  completed: number[]
}

export interface AppState {
  version: 1
  profile: Profile
  settings: Settings
  sessions: Session[]
  metrics: Metric[]
  ptResults: PtResult[]
  plan: PlanState | null
  /** Set once the intro has been dismissed. */
  onboarded: boolean
}

export const INITIAL_STATE: AppState = {
  version: 1,
  profile: { weightKg: 82, heightCm: 180, difficulty: 'soldier' },
  settings: {
    sound: true,
    voice: true,
    vibration: true,
    keepAwake: true,
    countdown: 5,
    showNext: true,
  },
  sessions: [],
  metrics: [],
  ptResults: [],
  plan: null,
  onboarded: false,
}

type Action =
  | { type: 'profile'; patch: Partial<Profile> }
  | { type: 'settings'; patch: Partial<Settings> }
  | { type: 'session/add'; session: Session }
  | { type: 'session/delete'; id: string }
  | { type: 'metric/add'; metric: Metric }
  | { type: 'metric/delete'; date: string }
  | { type: 'pt/add'; result: PtResult }
  | { type: 'pt/delete'; id: string }
  | { type: 'plan/start'; planId: string }
  | { type: 'plan/complete'; day: number }
  | { type: 'plan/uncomplete'; day: number }
  | { type: 'plan/stop' }
  | { type: 'onboarded' }
  | { type: 'replace'; state: AppState }
  | { type: 'reset' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'profile':
      return { ...state, profile: { ...state.profile, ...action.patch } }
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.patch } }
    case 'session/add':
      return { ...state, sessions: [action.session, ...state.sessions] }
    case 'session/delete':
      return { ...state, sessions: state.sessions.filter((s) => s.id !== action.id) }
    case 'metric/add': {
      // One entry per day: a second weigh-in on the same date replaces the first.
      const others = state.metrics.filter((m) => m.date !== action.metric.date)
      const previous = state.metrics.find((m) => m.date === action.metric.date)
      const merged = { ...previous, ...action.metric }
      return { ...state, metrics: [...others, merged].sort((a, b) => a.date.localeCompare(b.date)) }
    }
    case 'metric/delete':
      return { ...state, metrics: state.metrics.filter((m) => m.date !== action.date) }
    case 'pt/add':
      return { ...state, ptResults: [action.result, ...state.ptResults] }
    case 'pt/delete':
      return { ...state, ptResults: state.ptResults.filter((p) => p.id !== action.id) }
    case 'plan/start':
      return { ...state, plan: { planId: action.planId, startDate: isoDate(), completed: [] } }
    case 'plan/complete': {
      if (!state.plan || state.plan.completed.includes(action.day)) return state
      return {
        ...state,
        plan: { ...state.plan, completed: [...state.plan.completed, action.day].sort((a, b) => a - b) },
      }
    }
    case 'plan/uncomplete': {
      if (!state.plan) return state
      return { ...state, plan: { ...state.plan, completed: state.plan.completed.filter((d) => d !== action.day) } }
    }
    case 'plan/stop':
      return { ...state, plan: null }
    case 'onboarded':
      return { ...state, onboarded: true }
    case 'replace':
      return action.state
    case 'reset':
      return { ...INITIAL_STATE, onboarded: true }
    default:
      return state
  }
}

function load(): AppState {
  if (typeof localStorage === 'undefined') return INITIAL_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_STATE
    const parsed = JSON.parse(raw) as Partial<AppState>
    // Merge rather than trust: a state written by an older build may lack new keys.
    return {
      ...INITIAL_STATE,
      ...parsed,
      profile: { ...INITIAL_STATE.profile, ...parsed.profile },
      settings: { ...INITIAL_STATE.settings, ...parsed.settings },
      sessions: parsed.sessions ?? [],
      metrics: parsed.metrics ?? [],
      ptResults: parsed.ptResults ?? [],
      plan: parsed.plan ?? null,
    }
  } catch {
    return INITIAL_STATE
  }
}

interface Store {
  state: AppState
  dispatch: (action: Action) => void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Private mode, or the quota is full. Losing a log entry beats crashing mid-set.
    }
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside StoreProvider')
  return store
}

export function useAppState(): AppState {
  return useStore().state
}

export function useDispatch(): (action: Action) => void {
  const { dispatch } = useStore()
  return useCallback(dispatch, [dispatch])
}

// --- derived data --------------------------------------------------------------

/** Dates with at least one completed session, newest first. */
export function trainingDays(sessions: Session[]): string[] {
  return [...new Set(sessions.map((s) => s.date))].sort((a, b) => b.localeCompare(a))
}

/**
 * Current streak in days.
 *
 * A streak survives today being empty: you have not broken it until you have missed a
 * whole day. Anything stricter punishes training in the evening.
 */
export function currentStreak(sessions: Session[], today = isoDate()): number {
  const days = new Set(sessions.map((s) => s.date))
  if (days.size === 0) return 0
  const cursor = new Date(today)
  if (!days.has(isoDate(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(isoDate(cursor))) return 0
  }
  let streak = 0
  while (days.has(isoDate(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function longestStreak(sessions: Session[]): number {
  const days = [...new Set(sessions.map((s) => s.date))].sort()
  let best = 0
  let run = 0
  let previous: Date | null = null
  for (const day of days) {
    const d = new Date(day)
    if (previous && Math.round((d.getTime() - previous.getTime()) / 86400000) === 1) run++
    else run = 1
    previous = d
    best = Math.max(best, run)
  }
  return best
}

export function latestWeight(state: AppState): number {
  const withWeight = state.metrics.filter((m) => typeof m.weightKg === 'number')
  return withWeight.length ? (withWeight[withWeight.length - 1].weightKg as number) : state.profile.weightKg
}
