import { useEffect } from 'react'
import { Icon, Segmented } from './components/ui'
import { DIFFICULTY, DIFFICULTY_ORDER, type Difficulty } from './data/workouts'
import { match, navigate, useRoute } from './lib/router'
import { ExerciseDetail, ExerciseList } from './screens/Library'
import { PlanDetail, PlanList } from './screens/Plans'
import Player from './screens/Player'
import Progress from './screens/Progress'
import PoseCheck from './screens/PoseCheck'
import PtTest from './screens/PtTest'
import Settings from './screens/Settings'
import Summary from './screens/Summary'
import Today from './screens/Today'
import { WorkoutDetail, WorkoutList } from './screens/Workouts'
import { useAppState, useDispatch } from './state/store'

const TABS = [
  { path: '/', label: 'Today', icon: Icon.home },
  { path: '/plans', label: 'Plans', icon: Icon.calendar },
  { path: '/workouts', label: 'Train', icon: Icon.bolt },
  { path: '/progress', label: 'Progress', icon: Icon.chart },
  { path: '/exercises', label: 'Moves', icon: Icon.library },
]

function isTabActive(tabPath: string, path: string): boolean {
  const [base] = path.split('?')
  if (tabPath === '/') return base === '/'
  return base === tabPath || base.startsWith(`${tabPath}/`)
}

export default function App() {
  const path = useRoute()
  const state = useAppState()
  const [base] = path.split('?')

  // Scroll back to the top on every navigation: a deep list should not carry its
  // scroll position into the next screen.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  if (!state.onboarded) return <Onboarding />

  const screen = (() => {
    if (base === '/') return <Today />
    if (base === '/plans') return <PlanList />
    if (base === '/workouts') return <WorkoutList />
    if (base === '/progress') return <Progress />
    if (base === '/exercises') return <ExerciseList />
    if (base === '/settings') return <Settings />
    if (base === '/pt-test') return <PtTest />
    if (import.meta.env.DEV && base === '/dev-poses') return <PoseCheck />

    let params = match('/plans/:id', base)
    if (params) return <PlanDetail id={params.id} />

    params = match('/workouts/:id', base)
    if (params) return <WorkoutDetail id={params.id} path={path} />

    params = match('/exercises/:id', base)
    if (params) return <ExerciseDetail id={params.id} />

    params = match('/play/:id', base)
    if (params) return <Player workoutId={params.id} path={path} />

    params = match('/summary/:id', base)
    if (params) return <Summary id={params.id} />

    return (
      <div className="screen">
        <h1>Not found</h1>
        <p className="muted">Nothing lives at {base}.</p>
        <button className="btn" style={{ marginTop: 14 }} onClick={() => navigate('/')}>
          Back to today
        </button>
      </div>
    )
  })()

  // The player owns the whole screen: a tab bar under a running timer is an invitation
  // to lose your place.
  const fullscreen = base.startsWith('/play/')

  return (
    <div className="app">
      {screen}
      {!fullscreen && (
        <nav className="tabbar">
          {TABS.map((tab) => (
            <a
              key={tab.path}
              href={`#${tab.path}`}
              className={isTabActive(tab.path, path) ? 'active' : ''}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}

function Onboarding() {
  const state = useAppState()
  const dispatch = useDispatch()
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true

  return (
    <div className="screen" style={{ paddingBottom: 40 }}>
      <div style={{ marginTop: 20 }}>
        <div className="tiny" style={{ color: 'var(--accent)' }}>
          Welcome
        </div>
        <h1 style={{ fontSize: 34, marginTop: 6 }}>PT Ops</h1>
        <p className="muted" style={{ marginTop: 8 }}>
          Military-style bodyweight training. No equipment, no account, no network. Everything you log
          stays on this phone.
        </p>
      </div>

      <div className="stack stack--lg" style={{ marginTop: 26 }}>
        <div>
          <div className="section-title">Pick a starting level</div>
          <Segmented
            value={state.profile.difficulty}
            onChange={(next: Difficulty) => dispatch({ type: 'profile', patch: { difficulty: next } })}
            options={DIFFICULTY_ORDER.map((d) => ({ value: d, label: DIFFICULTY[d].label }))}
          />
          <p className="small muted" style={{ marginTop: 8 }}>
            {DIFFICULTY[state.profile.difficulty].blurb}
          </p>
        </div>

        <div className="field">
          <label htmlFor="ob-weight">Body weight in kg</label>
          <input
            id="ob-weight"
            type="number"
            inputMode="decimal"
            step="0.1"
            value={state.profile.weightKg}
            onChange={(e) => dispatch({ type: 'profile', patch: { weightKg: Number(e.target.value) } })}
          />
          <span className="small muted">Only used to estimate calories. Change it any time.</span>
        </div>

        {!standalone && (
          <div className="card">
            <div className="tiny" style={{ color: 'var(--brass)' }}>
              Install it
            </div>
            <p className="small muted" style={{ marginTop: 6 }}>
              {isIos
                ? 'Tap the share button in Safari, then "Add to Home Screen". It then opens full screen and works offline.'
                : 'Use your browser menu and choose "Install app" or "Add to Home screen". It then opens full screen and works offline.'}
            </p>
          </div>
        )}

        <button className="btn btn--primary" onClick={() => dispatch({ type: 'onboarded' })}>
          Get started
        </button>
      </div>
    </div>
  )
}
