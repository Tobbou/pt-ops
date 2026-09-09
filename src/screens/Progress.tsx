import { useState } from 'react'
import { BarChart, Heatmap, LineChart, type HeatDay } from '../components/charts'
import { Icon, Stat, TopBar } from '../components/ui'
import { ptRank } from '../data/plans'
import { DIFFICULTY } from '../data/workouts'
import { addDays, decimal, duration, isoDate, longDate, shortDate, weekdayIndex } from '../lib/format'
import { navigate } from '../lib/router'
import { sessionsInWeek } from '../lib/planning'
import {
  currentStreak,
  latestWeight,
  longestStreak,
  useAppState,
  useDispatch,
  type Metric,
} from '../state/store'


const WEEKS_SHOWN = 12

function heatmapDays(sessions: { date: string; durationSec: number }[]): HeatDay[] {
  const today = isoDate()
  // Start on the Monday of the week that begins the window, so the grid lines up.
  const start = addDays(today, -(WEEKS_SHOWN * 7 - 1 - (6 - weekdayIndex(today))))
  const minutesByDate = new Map<string, number>()
  for (const s of sessions) {
    minutesByDate.set(s.date, (minutesByDate.get(s.date) ?? 0) + s.durationSec / 60)
  }
  const days: HeatDay[] = []
  for (let i = 0; i < WEEKS_SHOWN * 7; i++) {
    const date = addDays(start, i)
    days.push({ date, minutes: Math.round(minutesByDate.get(date) ?? 0) })
  }
  return days
}

export default function Progress() {
  const state = useAppState()
  const [showMetric, setShowMetric] = useState(false)

  const sessions = state.sessions
  const streak = currentStreak(sessions)
  const best = longestStreak(sessions)
  const totalMinutes = Math.round(sessions.reduce((s, x) => s + x.durationSec, 0) / 60)
  const totalKcal = sessions.reduce((s, x) => s + x.kcal, 0)

  const weekBars = Array.from({ length: 8 }, (_, i) => {
    const weeksAgo = 7 - i
    const week = sessionsInWeek(sessions, weeksAgo)
    const minutes = Math.round(week.reduce((s, x) => s + x.durationSec, 0) / 60)
    return { label: weeksAgo === 0 ? 'Now' : `-${weeksAgo}`, value: minutes, display: `${minutes} min` }
  })

  const weightPoints = state.metrics
    .filter((m) => typeof m.weightKg === 'number')
    .map((m) => ({ x: m.date, y: m.weightKg as number }))

  const latestPt = state.ptResults[0]

  return (
    <div className="screen">
      <TopBar
        title="Progress"
        action={
          <button className="iconbtn" onClick={() => setShowMetric((v) => !v)} aria-label="Log measurement">
            <Icon.plus />
          </button>
        }
      />

      <div className="stack stack--lg">
        <div className="grid-2">
          <Stat value={streak} label="Current streak" />
          <Stat value={best} label="Longest streak" />
          <Stat value={sessions.length} label="Sessions" />
          <Stat value={duration(totalMinutes * 60)} label="Time trained" />
        </div>

        {showMetric && <MetricForm onDone={() => setShowMetric(false)} />}

        <div>
          <div className="section-title">Last {WEEKS_SHOWN} weeks</div>
          <div className="card">
            <Heatmap days={heatmapDays(sessions)} />
          </div>
        </div>

        <div>
          <div className="section-title">Minutes per week</div>
          <div className="card">
            {sessions.length === 0 ? (
              <p className="small muted center">Nothing to plot yet.</p>
            ) : (
              <BarChart data={weekBars} unit=" min" />
            )}
          </div>
        </div>

        <div>
          <div className="section-title">Body weight</div>
          <div className="card">
            {weightPoints.length < 2 ? (
              <div className="center">
                <div style={{ fontSize: 30, fontWeight: 800 }}>{decimal(latestWeight(state))} kg</div>
                <p className="small muted" style={{ marginTop: 6 }}>
                  Log a second weigh-in and the trend line starts here.
                </p>
                <button className="btn btn--sm" style={{ marginTop: 10 }} onClick={() => setShowMetric(true)}>
                  Log a measurement
                </button>
              </div>
            ) : (
              <LineChart data={weightPoints} unit="kg" />
            )}
          </div>
        </div>

        <div>
          <div className="section-title">PT test</div>
          <button className="card card--tap" onClick={() => navigate('/pt-test')}>
            {latestPt ? (
              <div className="row row--between">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 20 }}>
                    {latestPt.score}
                    <span className="muted" style={{ fontSize: 14 }}>
                      /300
                    </span>
                  </div>
                  <div className="small muted">
                    {ptRank(latestPt.score)} · {shortDate(latestPt.date)}
                  </div>
                </div>
                <span className="chip chip--brass">{state.ptResults.length} taken</span>
              </div>
            ) : (
              <div className="row row--between">
                <div>
                  <div style={{ fontWeight: 700 }}>Take the PT test</div>
                  <div className="small muted">Push-ups, sit-ups and a plank. Scored out of 300.</div>
                </div>
                <span className="chevron">›</span>
              </div>
            )}
          </button>
        </div>

        <div>
          <div className="section-title">Totals</div>
          <div className="grid-2">
            <Stat value={totalKcal} label="Kcal burned (est.)" />
            <Stat
              value={sessions.reduce((s, x) => s + x.completedSteps, 0)}
              label="Sets completed"
            />
          </div>
        </div>

        <div>
          <div className="section-title">History</div>
          {sessions.length === 0 ? (
            <div className="empty">No sessions logged yet.</div>
          ) : (
            <div className="stack">
              {sessions.slice(0, 30).map((s) => (
                <button key={s.id} className="rowitem" onClick={() => navigate(`/summary/${s.id}`)}>
                  <div className="grow">
                    <div className="rowitem__title">{s.workoutName}</div>
                    <div className="rowitem__meta">
                      {longDate(s.date)} · {duration(s.durationSec)} · {DIFFICULTY[s.difficulty].label}
                    </div>
                  </div>
                  <span className="chip">{s.kcal} kcal</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricForm({ onDone }: { onDone: () => void }) {
  const state = useAppState()
  const dispatch = useDispatch()
  const [form, setForm] = useState<Metric>({
    date: isoDate(),
    weightKg: latestWeight(state),
  })

  function field(key: keyof Metric, label: string, step = '0.1') {
    return (
      <div className="field">
        <label htmlFor={key}>{label}</label>
        <input
          id={key}
          type="number"
          inputMode="decimal"
          step={step}
          value={(form[key] as number | undefined) ?? ''}
          onChange={(e) =>
            setForm({ ...form, [key]: e.target.value === '' ? undefined : Number(e.target.value) })
          }
        />
      </div>
    )
  }

  return (
    <div className="card stack">
      <div className="row row--between">
        <strong>Log measurement</strong>
        <span className="small muted">{shortDate(form.date)}</span>
      </div>
      <div className="grid-2">
        {field('weightKg', 'Weight (kg)')}
        {field('waistCm', 'Waist (cm)')}
        {field('chestCm', 'Chest (cm)')}
        {field('armCm', 'Arm (cm)')}
      </div>
      <div className="btn-row">
        <button className="btn btn--ghost" onClick={onDone}>
          Cancel
        </button>
        <button
          className="btn btn--primary"
          onClick={() => {
            dispatch({ type: 'metric/add', metric: form })
            if (typeof form.weightKg === 'number') {
              dispatch({ type: 'profile', patch: { weightKg: form.weightKg } })
            }
            onDone()
          }}
        >
          Save
        </button>
      </div>
    </div>
  )
}
