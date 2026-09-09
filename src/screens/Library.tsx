import { useState } from 'react'
import Figure from '../components/Figure'
import { Segmented, TopBar } from '../components/ui'
import {
  CATEGORY_LABEL,
  EXERCISES,
  EXERCISE_BY_ID,
  MUSCLE_LABEL,
  type Category,
} from '../data/exercises'
import { WORKOUTS } from '../data/workouts'
import { navigate } from '../lib/router'

const CATEGORIES: (Category | 'all')[] = ['all', 'warmup', 'push', 'legs', 'core', 'cardio', 'cooldown']

export function ExerciseList() {
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [search, setSearch] = useState('')

  const shown = EXERCISES.filter((e) => {
    if (category !== 'all' && e.category !== category) return false
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="screen">
      <TopBar title="Exercises" />
      <div className="field" style={{ marginBottom: 10 }}>
        <input
          type="search"
          placeholder="Search exercises"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div style={{ overflowX: 'auto', marginBottom: 14, paddingBottom: 4 }}>
        <div className="chips" style={{ flexWrap: 'nowrap' }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`chip ${category === c ? 'chip--accent' : ''}`}
              onClick={() => setCategory(c)}
              style={{ cursor: 'pointer' }}
            >
              {c === 'all' ? 'All' : CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="stack">
        {shown.map((e) => (
          <button key={e.id} className="rowitem" onClick={() => navigate(`/exercises/${e.id}`)}>
            <div className="rowitem__thumb">
              <Figure frames={e.frames} />
            </div>
            <div className="grow">
              <div className="rowitem__title">{e.name}</div>
              <div className="rowitem__meta">
                {CATEGORY_LABEL[e.category]} · {e.muscles.slice(0, 2).map((m) => MUSCLE_LABEL[m]).join(', ')}
              </div>
            </div>
            <span className="chevron">›</span>
          </button>
        ))}
        {shown.length === 0 && <div className="empty">Nothing matches that.</div>}
      </div>
    </div>
  )
}

export function ExerciseDetail({ id }: { id: string }) {
  const exercise = EXERCISE_BY_ID[id]
  const [playing, setPlaying] = useState(true)

  if (!exercise) {
    return (
      <div className="screen">
        <TopBar title="Not found" back="/exercises" />
        <p className="muted">No such exercise.</p>
      </div>
    )
  }

  const usedIn = WORKOUTS.filter((w) => w.blocks.some((b) => b.items.some((i) => i.exercise === id)))

  return (
    <div className="screen">
      <TopBar title={exercise.name} back="/exercises" />
      <div className="stack stack--lg">
        <div className="figure-stage" style={{ padding: 12 }}>
          <Figure frames={exercise.frames} animated={playing} cycle={exercise.cycle} />
        </div>

        <Segmented
          value={playing ? 'play' : 'pause'}
          onChange={(v) => setPlaying(v === 'play')}
          options={[
            { value: 'play', label: 'Animate' },
            { value: 'pause', label: 'Hold position' },
          ]}
        />

        <div className="chips">
          <span className="chip chip--accent">{CATEGORY_LABEL[exercise.category]}</span>
          {exercise.muscles.map((m) => (
            <span className="chip" key={m}>
              {MUSCLE_LABEL[m]}
            </span>
          ))}
          {exercise.unilateral && <span className="chip chip--brass">One side at a time</span>}
          {exercise.hold && <span className="chip chip--brass">Static hold</span>}
          {exercise.needs && <span className="chip chip--brass">Needs: {exercise.needs}</span>}
        </div>

        <div>
          <div className="section-title">Form</div>
          <div className="card stack" style={{ gap: 10 }}>
            {exercise.cues.map((c, i) => (
              <div className="row" key={i} style={{ alignItems: 'flex-start' }}>
                <span
                  className="tiny"
                  style={{
                    color: 'var(--accent)',
                    minWidth: 18,
                    paddingTop: 2,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="grow small">{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="section-title">Roughly</div>
          <div className="grid-2">
            <div className="stat">
              <div className="stat__value">{exercise.met}</div>
              <div className="stat__label">MET</div>
            </div>
            <div className="stat">
              <div className="stat__value">{exercise.cycle.toString().replace('.', ',')} s</div>
              <div className="stat__label">Per rep</div>
            </div>
          </div>
        </div>

        {usedIn.length > 0 && (
          <div>
            <div className="section-title">Appears in</div>
            <div className="stack">
              {usedIn.map((w) => (
                <button key={w.id} className="rowitem" onClick={() => navigate(`/workouts/${w.id}`)}>
                  <div className="grow">
                    <div className="rowitem__title">{w.name}</div>
                    <div className="rowitem__meta">{w.focus.join(' · ')}</div>
                  </div>
                  <span className="chevron">›</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
