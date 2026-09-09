import { TopBar } from '../components/ui'
import { PLANS, PLAN_BY_ID } from '../data/plans'
import { WORKOUT_BY_ID } from '../data/workouts'
import { duration } from '../lib/format'
import { currentPlanDay, planCalendarDay, workoutLength } from '../lib/planning'
import { navigate } from '../lib/router'
import { useAppState, useDispatch } from '../state/store'

export function PlanList() {
  const state = useAppState()
  const activeId = state.plan?.planId

  return (
    <div className="screen">
      <TopBar title="Plans" />
      <p className="muted small" style={{ marginBottom: 16 }}>
        A plan decides what you train and when, so the only decision left in the morning is whether
        you get up. One plan runs at a time.
      </p>
      <div className="stack">
        {PLANS.map((p) => {
          const active = p.id === activeId
          const sessions = p.schedule.filter((d) => d !== 'rest').length
          return (
            <button
              key={p.id}
              className={`card card--tap ${active ? 'card--accent' : ''}`}
              onClick={() => navigate(`/plans/${p.id}`)}
            >
              {active && (
                <div className="tiny" style={{ color: 'var(--accent)', marginBottom: 4 }}>
                  In progress
                </div>
              )}
              <div style={{ fontWeight: 700, fontSize: 17 }}>{p.name}</div>
              <div className="small muted" style={{ marginTop: 3 }}>
                {p.subtitle}
              </div>
              <div className="chips" style={{ marginTop: 10 }}>
                <span className="chip chip--accent">{p.schedule.length} days</span>
                <span className="chip">{sessions} sessions</span>
                <span className="chip">{p.weekly.length} weeks</span>
              </div>
              {active && state.plan && (
                <div style={{ marginTop: 12 }}>
                  <div className="player__progress">
                    <i style={{ width: `${(state.plan.completed.length / sessions) * 100}%` }} />
                  </div>
                  <div className="tiny dim" style={{ marginTop: 6 }}>
                    {state.plan.completed.length} of {sessions} sessions done
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function PlanDetail({ id }: { id: string }) {
  const state = useAppState()
  const dispatch = useDispatch()
  const plan = PLAN_BY_ID[id]

  if (!plan) {
    return (
      <div className="screen">
        <TopBar title="Not found" back="/plans" />
        <p className="muted">That plan does not exist.</p>
      </div>
    )
  }

  const active = state.plan?.planId === plan.id ? state.plan : null
  const day = active ? currentPlanDay(plan, active) : 0
  const behind = active ? planCalendarDay(active) - day : 0
  const sessionCount = plan.schedule.filter((d) => d !== 'rest').length

  function open(index: number) {
    const workoutId = plan.schedule[index]
    if (workoutId === 'rest') return
    navigate(`/workouts/${workoutId}?plan=${plan.id}&day=${index}`)
  }

  return (
    <div className="screen">
      <TopBar title={plan.name} back="/plans" />
      <div className="stack stack--lg">
        <p className="muted">{plan.description}</p>

        {active ? (
          <div className="card card--accent">
            <div className="row row--between">
              <div>
                <div className="tiny" style={{ color: 'var(--accent)' }}>
                  Next up
                </div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>
                  {day >= plan.schedule.length
                    ? 'Programme complete'
                    : plan.schedule[day] === 'rest'
                      ? `Day ${day + 1}: rest`
                      : `Day ${day + 1}: ${WORKOUT_BY_ID[plan.schedule[day]]?.name}`}
                </div>
              </div>
              {day < plan.schedule.length && plan.schedule[day] !== 'rest' && (
                <button className="btn btn--primary btn--sm" onClick={() => open(day)}>
                  Open
                </button>
              )}
            </div>
            {behind > 1 && (
              <p className="small muted" style={{ marginTop: 10 }}>
                You started {planCalendarDay(active)} days ago and are on day {day + 1}. The plan waits
                for you rather than skipping ahead, so just carry on.
              </p>
            )}
          </div>
        ) : (
          <button
            className="btn btn--primary"
            onClick={() => {
              if (state.plan && !window.confirm('Starting this plan replaces the one already running. Continue?'))
                return
              dispatch({ type: 'plan/start', planId: plan.id })
            }}
          >
            Start this plan
          </button>
        )}

        <div>
          <div className="section-title">Schedule</div>
          <div className="stack" style={{ gap: 14 }}>
            {Array.from({ length: Math.ceil(plan.schedule.length / 7) }, (_, weekIndex) => (
              <div key={weekIndex}>
                <div className="row row--between" style={{ marginBottom: 6 }}>
                  <span className="tiny dim">Week {weekIndex + 1}</span>
                  <span className="tiny dim">
                    +{Math.round((plan.weekly[Math.min(weekIndex, plan.weekly.length - 1)] - 1) * 100)}% load
                  </span>
                </div>
                <div className="plangrid">
                  {plan.schedule.slice(weekIndex * 7, weekIndex * 7 + 7).map((entry, i) => {
                    const index = weekIndex * 7 + i
                    const done = active?.completed.includes(index)
                    const isToday = active && index === day
                    return (
                      <button
                        key={index}
                        className={`planday ${entry === 'rest' ? 'rest' : ''} ${done ? 'done' : ''} ${
                          isToday ? 'today' : ''
                        }`}
                        onClick={() => open(index)}
                        title={entry === 'rest' ? 'Rest' : WORKOUT_BY_ID[entry]?.name}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="section-title">Sessions used</div>
          <div className="stack">
            {[...new Set(plan.schedule.filter((d) => d !== 'rest'))].map((wid) => {
              const w = WORKOUT_BY_ID[wid]
              if (!w) return null
              const count = plan.schedule.filter((d) => d === wid).length
              return (
                <button key={wid} className="rowitem" onClick={() => navigate(`/workouts/${wid}`)}>
                  <div className="grow">
                    <div className="rowitem__title">{w.name}</div>
                    <div className="rowitem__meta">
                      {count}× · {duration(workoutLength(w, state))}
                    </div>
                  </div>
                  <span className="chevron">›</span>
                </button>
              )
            })}
          </div>
        </div>

        {active && (
          <button
            className="btn btn--danger btn--ghost"
            onClick={() => {
              if (window.confirm('Stop this plan? Your logged sessions stay, the schedule resets.'))
                dispatch({ type: 'plan/stop' })
            }}
          >
            Stop plan ({active.completed.length}/{sessionCount} done)
          </button>
        )}
      </div>
    </div>
  )
}
