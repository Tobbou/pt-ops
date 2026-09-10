import Figure from '../components/Figure'
import { Icon, Stat } from '../components/ui'
import { getExercise } from '../data/exercises'
import { PLAN_BY_ID } from '../data/plans'
import { DIFFICULTY, WORKOUT_BY_ID } from '../data/workouts'
import { duration, longDate, isoDate, shortDate } from '../lib/format'
import { navigate } from '../lib/router'
import { sessionsInWeek, todaysWork, workoutLength } from '../lib/planning'
import { currentStreak, useAppState } from '../state/store'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 5) return 'Still up'
  if (h < 11) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}

export default function Today() {
  const state = useAppState()
  const work = todaysWork(state)
  const streak = currentStreak(state.sessions)
  const week = sessionsInWeek(state.sessions)
  const weekMinutes = Math.round(week.reduce((s, x) => s + x.durationSec, 0) / 60)
  const trainedToday = state.sessions.some((s) => s.date === isoDate())

  const heroWorkout = work.workout
  const heroLength = heroWorkout ? workoutLength(heroWorkout, state) : 0
  const heroExercise = heroWorkout ? getExercise(heroWorkout.blocks[1]?.items[0]?.exercise ?? 'push-up') : null

  function startHero() {
    if (!heroWorkout) return
    const query = work.planId !== undefined ? `?plan=${work.planId}&day=${work.dayIndex}` : ''
    navigate(`/workouts/${heroWorkout.id}${query}`)
  }

  return (
    <div className="screen">
      <div className="topbar">
        <div className="grow">
          <div className="tiny dim">{longDate(isoDate())}</div>
          <h1>{greeting()}</h1>
        </div>
        <button className="iconbtn" onClick={() => navigate('/settings')} aria-label="Settings">
          <Icon.gear />
        </button>
      </div>

      <div className="stack stack--lg">
        {work.kind === 'plan-rest' ? (
          <div className="hero">
            <div className="tiny" style={{ color: 'var(--brass)' }}>
              Scheduled rest day
            </div>
            <h2 style={{ margin: '6px 0 8px' }}>Stand down</h2>
            <p className="small muted">
              {work.reason}. Rest is part of the programme, not a gap in it. Move if you want to, but
              keep it easy.
            </p>
            <div className="btn-row" style={{ marginTop: 14 }}>
              <button className="btn btn--sm" onClick={() => navigate('/workouts/recovery')}>
                Mobility session
              </button>
              <button
                className="btn btn--sm btn--ghost"
                onClick={() => navigate(`/plans/${work.planId}`)}
              >
                View plan
              </button>
            </div>
          </div>
        ) : work.kind === 'plan-done' ? (
          <div className="hero">
            <div className="tiny" style={{ color: 'var(--brass)' }}>
              Programme complete
            </div>
            <h2 style={{ margin: '6px 0 8px' }}>{work.reason}</h2>
            <p className="small muted">
              Run it again one difficulty higher rather than bolting on extra days.
            </p>
            <button className="btn btn--primary" style={{ marginTop: 14 }} onClick={() => navigate('/plans')}>
              Choose the next plan
            </button>
          </div>
        ) : (
          heroWorkout && (
            <button className="hero card--tap" onClick={startHero}>
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <div className="grow">
                  <div className="tiny" style={{ color: 'var(--accent)' }}>
                    {work.kind === 'plan' ? "Today's session" : 'No plan running'}
                  </div>
                  <h2 style={{ margin: '6px 0 4px' }}>{heroWorkout.name}</h2>
                  <div className="small muted">{work.reason}</div>
                </div>
                {heroExercise && (
                  <div style={{ width: 78, flex: 'none' }}>
                    <Figure frames={heroExercise.frames} facing={heroExercise.facing} />
                  </div>
                )}
              </div>
              <div className="chips" style={{ marginTop: 12 }}>
                <span className="chip chip--accent">{duration(heroLength)}</span>
                <span className="chip">{DIFFICULTY[state.profile.difficulty].label}</span>
                {heroWorkout.focus.slice(0, 2).map((t) => (
                  <span className="chip" key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="btn btn--primary" style={{ marginTop: 14 }}>
                {trainedToday ? 'Train again' : 'Start'}
              </div>
            </button>
          )
        )}

        <div className="grid-3">
          <Stat value={streak} label={streak === 1 ? 'Day streak' : 'Day streak'} />
          <Stat value={week.length} label="This week" />
          <Stat value={weekMinutes} label="Minutes" />
        </div>

        <div>
          <div className="section-title">Quick start</div>
          <div className="stack">
            {['reveille', 'core-blast', 'hiit-sprint'].map((id) => {
              const w = WORKOUT_BY_ID[id]
              const ex = getExercise(w.blocks[1]?.items[0]?.exercise ?? 'squat')
              return (
                <button key={id} className="rowitem" onClick={() => navigate(`/workouts/${id}`)}>
                  <div className="rowitem__thumb">
                    <Figure frames={ex.frames} facing={ex.facing} />
                  </div>
                  <div className="grow">
                    <div className="rowitem__title">{w.name}</div>
                    <div className="rowitem__meta">
                      {duration(workoutLength(w, state))} · {w.focus[0]}
                    </div>
                  </div>
                  <span className="chevron">›</span>
                </button>
              )
            })}
          </div>
        </div>

        {state.plan && PLAN_BY_ID[state.plan.planId] && (
          <button className="card card--tap" onClick={() => navigate(`/plans/${state.plan!.planId}`)}>
            <div className="row row--between">
              <div>
                <div className="tiny dim">Active plan</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{PLAN_BY_ID[state.plan.planId].name}</div>
              </div>
              <div className="center">
                <div style={{ fontSize: 20, fontWeight: 800 }}>
                  {state.plan.completed.length}
                  <span className="muted" style={{ fontSize: 13 }}>
                    /{PLAN_BY_ID[state.plan.planId].schedule.filter((d) => d !== 'rest').length}
                  </span>
                </div>
                <div className="tiny dim">Sessions</div>
              </div>
            </div>
          </button>
        )}

        <div>
          <div className="section-title">Recent</div>
          {state.sessions.length === 0 ? (
            <div className="empty">
              Nothing logged yet. Finish a session and it turns up here, along with your streak.
            </div>
          ) : (
            <div className="stack">
              {state.sessions.slice(0, 4).map((s) => (
                <button key={s.id} className="rowitem" onClick={() => navigate(`/summary/${s.id}`)}>
                  <div className="rowitem__thumb" style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>
                    {shortDate(s.date).split(' ')[0]}
                  </div>
                  <div className="grow">
                    <div className="rowitem__title">{s.workoutName}</div>
                    <div className="rowitem__meta">
                      {duration(s.durationSec)} · {s.kcal} kcal · {DIFFICULTY[s.difficulty].label}
                    </div>
                  </div>
                  <span className="chevron">›</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
