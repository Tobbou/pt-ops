import Figure from '../components/Figure'
import { Stat, TopBar } from '../components/ui'
import { getExercise } from '../data/exercises'
import { PLAN_BY_ID } from '../data/plans'
import { DIFFICULTY } from '../data/workouts'
import { duration, longDate } from '../lib/format'
import { navigate } from '../lib/router'
import { currentStreak, useAppState, useDispatch } from '../state/store'

export default function Summary({ id }: { id: string }) {
  const state = useAppState()
  const dispatch = useDispatch()
  const session = state.sessions.find((s) => s.id === id)

  if (!session) {
    return (
      <div className="screen">
        <TopBar title="Session" back="/" />
        <p className="muted">That session is no longer in the log.</p>
      </div>
    )
  }

  const completedAll = session.completedSteps >= session.totalSteps
  const streak = currentStreak(state.sessions)

  // Group repeats so a three-round circuit reads as "Push-Up x3", not nine lines.
  const grouped = new Map<string, { count: number; reps: number; seconds: number }>()
  for (const e of session.exercises) {
    const entry = grouped.get(e.id) ?? { count: 0, reps: 0, seconds: 0 }
    entry.count += 1
    if (e.mode === 'reps') entry.reps += e.value
    else entry.seconds += e.value
    grouped.set(e.id, entry)
  }

  return (
    <div className="screen">
      <TopBar title="Session complete" back="/" />
      <div className="stack stack--lg">
        <div className="hero center">
          <div className="tiny" style={{ color: 'var(--accent)' }}>
            {completedAll ? 'Finished' : 'Partly finished'}
          </div>
          <h2 style={{ margin: '8px 0 2px' }}>{session.workoutName}</h2>
          <div className="small muted">
            {longDate(session.date)} · {DIFFICULTY[session.difficulty].label}
          </div>
          {streak > 1 && (
            <div className="chip chip--brass" style={{ marginTop: 12, display: 'inline-block' }}>
              {streak} day streak
            </div>
          )}
        </div>

        <div className="grid-3">
          <Stat value={duration(session.durationSec)} label="Duration" />
          <Stat value={session.kcal} label="Kcal est." />
          <Stat value={`${session.completedSteps}/${session.totalSteps}`} label="Sets" />
        </div>

        {session.planId && PLAN_BY_ID[session.planId] && (
          <button className="card card--tap" onClick={() => navigate(`/plans/${session.planId}`)}>
            <div className="row row--between">
              <div>
                <div className="tiny dim">Counted towards</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{PLAN_BY_ID[session.planId].name}</div>
              </div>
              <span className="chevron">›</span>
            </div>
          </button>
        )}

        <div>
          <div className="section-title">What you did</div>
          <div className="stack">
            {[...grouped.entries()].map(([exId, entry]) => {
              const ex = getExercise(exId)
              return (
                <button key={exId} className="rowitem" onClick={() => navigate(`/exercises/${exId}`)}>
                  <div className="rowitem__thumb">
                    <Figure frames={ex.frames} facing={ex.facing} />
                  </div>
                  <div className="grow">
                    <div className="rowitem__title">{ex.name}</div>
                    <div className="rowitem__meta">
                      {entry.count} set{entry.count === 1 ? '' : 's'}
                      {entry.reps > 0 && ` · ${entry.reps} reps total`}
                      {entry.seconds > 0 && ` · ${duration(entry.seconds)} under tension`}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="btn-row">
          <button
            className="btn btn--danger btn--ghost"
            onClick={() => {
              if (window.confirm('Delete this session from the log?')) {
                dispatch({ type: 'session/delete', id: session.id })
                navigate('/')
              }
            }}
          >
            Delete
          </button>
          <button className="btn btn--primary" onClick={() => navigate('/')}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
