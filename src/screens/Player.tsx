import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Figure from '../components/Figure'
import { TimerRing } from '../components/ui'
import { getExercise } from '../data/exercises'
import { PLAN_BY_ID, multiplierFor } from '../data/plans'
import { WORKOUT_BY_ID, buildSteps, estimateKcal, type Step } from '../data/workouts'
import { cue, speak, stopSpeech, unlockAudio, vibrate } from '../lib/audio'
import { isoDate, mmss } from '../lib/format'
import { navigate, queryOf } from '../lib/router'
import { allowSleep, keepAwake } from '../lib/wakeLock'
import { useAppState, useDispatch, type Session, type SessionExercise } from '../state/store'

type Phase = 'ready' | 'countdown' | 'running' | 'paused' | 'done'

export default function Player({ workoutId, path }: { workoutId: string; path: string }) {
  const state = useAppState()
  const dispatch = useDispatch()
  const query = queryOf(path)
  const planId = query.get('plan') ?? undefined
  const planDay = query.get('day') ? Number(query.get('day')) : undefined

  const workout = WORKOUT_BY_ID[workoutId]
  const weekMultiplier =
    planId && PLAN_BY_ID[planId] && planDay !== undefined ? multiplierFor(PLAN_BY_ID[planId], planDay) : 1

  const steps = useMemo(
    () => (workout ? buildSteps(workout, state.profile.difficulty, weekMultiplier) : []),
    [workout, state.profile.difficulty, weekMultiplier],
  )

  const [index, setIndex] = useState(0)
  const [remaining, setRemaining] = useState(steps[0]?.seconds ?? 0)
  const [phase, setPhase] = useState<Phase>('ready')
  const [countdown, setCountdown] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  const completedRef = useRef<SessionExercise[]>([])
  const workSecRef = useRef(0)
  // Wall-clock deadline, so a throttled background tab cannot make the timer drift.
  const deadlineRef = useRef<number>(0)
  const lastBeepRef = useRef<number>(-1)

  const step: Step | undefined = steps[index]
  const settings = state.settings

  const beep = useCallback(
    (fn: () => void) => {
      if (settings.sound) fn()
    },
    [settings.sound],
  )

  const say = useCallback(
    (text: string) => {
      if (settings.voice) speak(text)
    },
    [settings.voice],
  )

  const buzz = useCallback(
    (pattern: number | number[]) => {
      if (settings.vibration) vibrate(pattern)
    },
    [settings.vibration],
  )

  // --- screen wake lock ---------------------------------------------------
  useEffect(() => {
    if (settings.keepAwake) void keepAwake()
    return () => {
      void allowSleep()
      stopSpeech()
    }
  }, [settings.keepAwake])

  // --- advancing ----------------------------------------------------------
  const finish = useCallback(
    (completedAll: boolean) => {
      setPhase('done')
      void allowSleep()
      beep(cue.finish)
      buzz([120, 80, 120, 80, 240])
      say(completedAll ? 'Session complete. Well done.' : 'Session ended.')

      const totalWork = steps.filter((s) => s.kind === 'work').length
      const session: Session = {
        id: `${Date.now()}`,
        date: isoDate(),
        workoutId,
        workoutName: workout?.name ?? 'Workout',
        difficulty: state.profile.difficulty,
        planId,
        planDay,
        durationSec: Math.round(elapsed),
        workSec: Math.round(workSecRef.current),
        kcal: estimateKcal(
          steps.filter((_, i) => i < index || completedAll),
          state.profile.weightKg,
        ),
        completedSteps: completedRef.current.length,
        totalSteps: totalWork,
        exercises: completedRef.current,
      }
      dispatch({ type: 'session/add', session })
      if (completedAll && planId && planDay !== undefined) {
        dispatch({ type: 'plan/complete', day: planDay })
      }
      navigate(`/summary/${session.id}`, true)
    },
    [beep, buzz, dispatch, elapsed, index, planDay, planId, say, state.profile, steps, workout, workoutId],
  )

  const advance = useCallback(
    (recordCurrent: boolean) => {
      const current = steps[index]
      if (current && recordCurrent && current.kind === 'work') {
        completedRef.current.push({
          id: current.exercise,
          mode: current.mode,
          value: current.value,
          side: current.side,
        })
        workSecRef.current += current.seconds
      }
      const next = index + 1
      if (next >= steps.length) {
        finish(true)
        return
      }
      setIndex(next)
      setRemaining(steps[next].seconds)
      lastBeepRef.current = -1
      const upcoming = steps[next]
      if (upcoming.kind === 'rest') {
        beep(cue.rest)
        buzz(60)
        say(upcoming.nextExercise ? `Rest. Next: ${upcoming.nextExercise}` : 'Rest')
      } else {
        beep(cue.go)
        buzz([80, 50, 80])
        const sideWord = upcoming.side ? `, ${upcoming.side} side` : ''
        const target =
          upcoming.mode === 'reps' ? `${upcoming.value} reps` : `${upcoming.value} seconds`
        say(`${upcoming.label}${sideWord}. ${target}`)
      }
    },
    [beep, buzz, finish, index, say, steps],
  )

  // --- the clock ----------------------------------------------------------
  useEffect(() => {
    if (phase !== 'running' && phase !== 'countdown') return
    deadlineRef.current = Date.now() + remaining * 1000
    const id = window.setInterval(() => {
      const left = (deadlineRef.current - Date.now()) / 1000
      setElapsed((e) => e + 0.2)
      if (phase === 'countdown') {
        const whole = Math.ceil(left)
        setCountdown(whole)
        if (whole !== lastBeepRef.current && whole > 0) {
          lastBeepRef.current = whole
          beep(cue.tick)
        }
        if (left <= 0) {
          setPhase('running')
          setRemaining(steps[0]?.seconds ?? 0)
          lastBeepRef.current = -1
          beep(cue.go)
          buzz([80, 50, 80])
          const first = steps[0]
          if (first) {
            say(
              `${first.label}. ${first.mode === 'reps' ? `${first.value} reps` : `${first.value} seconds`}`,
            )
          }
        }
        return
      }
      setRemaining(Math.max(0, left))
      const whole = Math.ceil(left)
      if (whole <= 3 && whole > 0 && whole !== lastBeepRef.current) {
        lastBeepRef.current = whole
        beep(cue.tick)
      }
      if (left <= 0) advance(true)
    }, 200)
    return () => window.clearInterval(id)
    // `remaining` is intentionally excluded: the interval owns it once started.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index])

  // --- controls -----------------------------------------------------------
  function start() {
    unlockAudio()
    if (settings.countdown > 0) {
      setRemaining(settings.countdown)
      setCountdown(settings.countdown)
      setPhase('countdown')
    } else {
      setPhase('running')
      beep(cue.go)
      const first = steps[0]
      if (first) say(first.label)
    }
  }

  function togglePause() {
    if (phase === 'running') {
      setPhase('paused')
      stopSpeech()
    } else if (phase === 'paused') {
      setPhase('running')
    }
  }

  function skipBack() {
    if (index === 0) {
      setRemaining(steps[0].seconds)
      return
    }
    const previous = index - 1
    setIndex(previous)
    setRemaining(steps[previous].seconds)
    lastBeepRef.current = -1
  }

  function addTime(seconds: number) {
    setRemaining((r) => r + seconds)
    deadlineRef.current += seconds * 1000
  }

  function quit() {
    const done = completedRef.current.length
    const message =
      done > 0
        ? `Stop here and log ${done} completed exercise${done === 1 ? '' : 's'}?`
        : 'Leave without logging anything?'
    if (!window.confirm(message)) return
    if (done > 0) finish(false)
    else {
      void allowSleep()
      navigate(`/workouts/${workoutId}`, true)
    }
  }

  if (!workout) {
    return (
      <div className="screen">
        <p>Unknown workout.</p>
        <button className="btn" onClick={() => navigate('/workouts')}>
          Back to workouts
        </button>
      </div>
    )
  }

  const totalSteps = steps.length
  const progress = totalSteps ? (index / totalSteps) * 100 : 0
  const resting = step?.kind === 'rest'
  // During rest the stage shows what is coming, not what just finished: knowing the next
  // move is the only thing you can usefully do with those twenty seconds.
  const shownId = resting && step?.nextExerciseId ? step.nextExerciseId : step?.exercise
  const exercise = shownId ? getExercise(shownId) : null
  const isReps = step?.kind === 'work' && step.mode === 'reps'

  return (
    <div className="screen screen--player">
      {phase === 'countdown' && (
        <div className="countdown-overlay">
          <div className="center">
            <div className="countdown-overlay__num">{Math.max(1, countdown)}</div>
            <div className="tiny dim">Get ready</div>
            <div style={{ marginTop: 10, fontSize: 18, fontWeight: 700 }}>{steps[0]?.label}</div>
          </div>
        </div>
      )}

      <div className="player__head">
        <button className="iconbtn" onClick={quit} aria-label="Stop workout">
          <svg viewBox="0 0 24 24">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="grow center">
          <div className="tiny dim">{step?.blockName}</div>
          <div className="small">
            {step && step.totalRounds > 1 ? `Round ${step.round} of ${step.totalRounds}` : workout.name}
          </div>
        </div>
        <div className="iconbtn" style={{ fontSize: 12, fontWeight: 700 }}>
          {mmss(elapsed)}
        </div>
      </div>

      <div className="player__progress">
        <i style={{ width: `${progress}%` }} />
      </div>

      <div className="player__stage">
        <div className="figure-stage player__figure">
          {exercise && (
            <Figure
              key={`${index}-${phase}`}
              frames={exercise.frames}
              animated={phase === 'running' && !resting}
              cycle={exercise.cycle}
              facing={exercise.facing}
              className={resting ? 'figure--rest' : ''}
            />
          )}
        </div>

        <div>
          <div className="player__name">
            {resting ? 'Rest' : step?.label}
            {step?.side && !resting && <span className="muted"> · {step.side}</span>}
          </div>
          <div className="player__target">
            {resting
              ? settings.showNext && step?.nextExercise
                ? `Next: ${step.nextExercise}`
                : ''
              : isReps
                ? `${step?.value} reps`
                : `${step?.value} seconds`}
          </div>
        </div>

        <TimerRing
          value={remaining}
          total={step?.seconds ?? 1}
          resting={resting}
          caption={isReps ? String(step?.value) : mmss(remaining)}
          sub={isReps ? 'reps' : resting ? 'rest' : 'remaining'}
        />

        <div className="player__cue">
          {exercise
            ? exercise.cues[index % exercise.cues.length]
            : 'Last one. Finish it properly.'}
        </div>
      </div>

      {phase === 'ready' ? (
        <button className="btn btn--primary" onClick={start} style={{ minHeight: 58 }}>
          Start workout
        </button>
      ) : (
        <>
          {(isReps || resting) && (
            <div className="btn-row" style={{ marginBottom: 10 }}>
              {resting && (
                <button className="btn btn--ghost btn--sm" onClick={() => addTime(20)}>
                  +20 s
                </button>
              )}
              <button className="btn btn--sm" onClick={() => advance(true)}>
                {isReps ? 'Done' : 'Skip rest'}
              </button>
            </div>
          )}
          <div className="player__controls">
            <button className="circlebtn" onClick={skipBack} aria-label="Previous">
              <svg viewBox="0 0 24 24">
                <path d="M7 5h2v14H7zM20 5v14l-10-7z" />
              </svg>
            </button>
            <button className="circlebtn circlebtn--main" onClick={togglePause} aria-label="Play or pause">
              {phase === 'running' || phase === 'countdown' ? (
                <svg viewBox="0 0 24 24">
                  <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24">
                  <path d="M7 4l13 8-13 8z" />
                </svg>
              )}
            </button>
            <button className="circlebtn" onClick={() => advance(false)} aria-label="Next">
              <svg viewBox="0 0 24 24">
                <path d="M17 5h-2v14h2zM4 5v14l10-7z" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
