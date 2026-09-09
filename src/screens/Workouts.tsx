import { useState } from 'react'
import Figure from '../components/Figure'
import { Segmented, TopBar } from '../components/ui'
import { getExercise } from '../data/exercises'
import { PLAN_BY_ID, multiplierFor } from '../data/plans'
import {
  DIFFICULTY,
  DIFFICULTY_ORDER,
  WORKOUTS,
  WORKOUT_BY_ID,
  buildSteps,
  estimateKcal,
  totalSeconds,
  type Difficulty,
} from '../data/workouts'
import { duration, mmss } from '../lib/format'
import { navigate, queryOf } from '../lib/router'
import { workoutLength } from '../lib/planning'
import { latestWeight, useAppState, useDispatch } from '../state/store'

export function WorkoutList() {
  const state = useAppState()
  const [filter, setFilter] = useState<'all' | 'short' | 'quiet'>('all')

  const shown = WORKOUTS.filter((w) => {
    if (filter === 'short') return workoutLength(w, state) <= 16 * 60
    if (filter === 'quiet') return w.quiet
    return true
  })

  return (
    <div className="screen">
      <TopBar title="Workouts" />
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'All' },
          { value: 'short', label: 'Under 15 min' },
          { value: 'quiet', label: 'No jumping' },
        ]}
      />
      <div className="stack" style={{ marginTop: 14 }}>
        {shown.map((w) => {
          const ex = getExercise(w.blocks[1]?.items[0]?.exercise ?? 'squat')
          return (
            <button key={w.id} className="card card--tap" onClick={() => navigate(`/workouts/${w.id}`)}>
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <div className="grow">
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{w.name}</div>
                  <div className="small muted" style={{ marginTop: 3 }}>
                    {w.subtitle}
                  </div>
                  <div className="chips" style={{ marginTop: 10 }}>
                    <span className="chip chip--accent">{duration(workoutLength(w, state))}</span>
                    {w.focus.map((t) => (
                      <span className="chip" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ width: 64, flex: 'none' }}>
                  <Figure frames={ex.frames} />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function WorkoutDetail({ id, path }: { id: string; path: string }) {
  const state = useAppState()
  const dispatch = useDispatch()
  const query = queryOf(path)
  const planId = query.get('plan') ?? undefined
  const planDay = query.get('day') ? Number(query.get('day')) : undefined
  const workout = WORKOUT_BY_ID[id]

  if (!workout) {
    return (
      <div className="screen">
        <TopBar title="Not found" back="/workouts" />
        <p className="muted">That workout does not exist.</p>
      </div>
    )
  }

  const weekMultiplier =
    planId && PLAN_BY_ID[planId] && planDay !== undefined ? multiplierFor(PLAN_BY_ID[planId], planDay) : 1
  const difficulty = state.profile.difficulty
  const steps = buildSteps(workout, difficulty, weekMultiplier)
  const seconds = totalSeconds(steps)
  const kcal = estimateKcal(steps, latestWeight(state))
  const workSteps = steps.filter((s) => s.kind === 'work')
  const unique = [...new Set(workSteps.map((s) => s.exercise))]
  const suffix = planId !== undefined ? `?plan=${planId}&day=${planDay}` : ''

  return (
    <div className="screen">
      <TopBar title={workout.name} back={planId ? `/plans/${planId}` : '/workouts'} />
      <div className="stack stack--lg">
        <div>
          <p className="muted">{workout.subtitle}</p>
          <div className="grid-3" style={{ marginTop: 14 }}>
            <div className="stat">
              <div className="stat__value">{Math.round(seconds / 60)}</div>
              <div className="stat__label">Minutes</div>
            </div>
            <div className="stat">
              <div className="stat__value">{workSteps.length}</div>
              <div className="stat__label">Sets</div>
            </div>
            <div className="stat">
              <div className="stat__value">{kcal}</div>
              <div className="stat__label">Kcal est.</div>
            </div>
          </div>
        </div>

        <div>
          <div className="section-title">Difficulty</div>
          <Segmented
            value={difficulty}
            onChange={(next: Difficulty) => dispatch({ type: 'profile', patch: { difficulty: next } })}
            options={DIFFICULTY_ORDER.map((d) => ({ value: d, label: DIFFICULTY[d].label }))}
          />
          <p className="small muted" style={{ marginTop: 8 }}>
            {DIFFICULTY[difficulty].blurb}
          </p>
        </div>

        {weekMultiplier !== 1 && (
          <div className="card">
            <div className="tiny" style={{ color: 'var(--brass)' }}>
              Plan progression
            </div>
            <p className="small muted" style={{ marginTop: 4 }}>
              Week {Math.floor((planDay ?? 0) / 7) + 1} of the plan adds{' '}
              {Math.round((weekMultiplier - 1) * 100)} percent to every prescribed set.
            </p>
          </div>
        )}

        <div>
          <div className="section-title">The session</div>
          <div className="stack">
            {workout.blocks.map((b) => {
              const rounds = Math.max(
                1,
                b.rounds + (b.rounds > 1 ? DIFFICULTY[difficulty].scale.rounds : 0),
              )
              const blockSteps = steps.filter((s) => s.blockName === b.name && s.round === 1)
              return (
                <div className="card" key={b.name}>
                  <div className="row row--between" style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 700 }}>{b.name}</div>
                    <span className="chip">{rounds > 1 ? `${rounds} rounds` : '1 round'}</span>
                  </div>
                  <div className="stack" style={{ gap: 6 }}>
                    {blockSteps
                      .filter((s) => s.kind === 'work')
                      .map((s, i) => (
                        <div className="row row--between small" key={i}>
                          <span className="grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.label}
                            {s.side && <span className="dim"> · {s.side}</span>}
                          </span>
                          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                            {s.mode === 'reps' ? `${s.value} reps` : mmss(s.value)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <div className="section-title">Exercises in this session</div>
          <div className="grid-3">
            {unique.map((exId) => {
              const ex = getExercise(exId)
              return (
                <button
                  key={exId}
                  className="card card--tap center"
                  style={{ padding: 8 }}
                  onClick={() => navigate(`/exercises/${exId}`)}
                >
                  <Figure frames={ex.frames} />
                  <div className="small" style={{ marginTop: 4, lineHeight: 1.2 }}>
                    {ex.name}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ position: 'sticky', bottom: 'calc(var(--tab-h) + var(--safe-bottom) + 8px)', marginTop: 20 }}>
        <button className="btn btn--primary" onClick={() => navigate(`/play/${workout.id}${suffix}`)}>
          Start · {duration(seconds)}
        </button>
      </div>
    </div>
  )
}
