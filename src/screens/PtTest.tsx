import { useEffect, useRef, useState } from 'react'
import Figure from '../components/Figure'
import { ScoreBar } from '../components/charts'
import { TimerRing, TopBar } from '../components/ui'
import { getExercise } from '../data/exercises'
import { PT_EVENTS, ptRank, scoreEvent, type PtEventId } from '../data/plans'
import { cue, speak, unlockAudio, vibrate } from '../lib/audio'
import { isoDate, mmss, shortDate } from '../lib/format'
import { navigate } from '../lib/router'
import { allowSleep, keepAwake } from '../lib/wakeLock'
import { useAppState, useDispatch, type PtResult } from '../state/store'

type Stage = 'intro' | 'event' | 'recover' | 'result'

const RECOVERY_SECONDS = 120

export default function PtTest() {
  const state = useAppState()
  const dispatch = useDispatch()

  const [stage, setStage] = useState<Stage>('intro')
  const [eventIndex, setEventIndex] = useState(0)
  const [results, setResults] = useState<Record<PtEventId, number>>({
    'push-up': 0,
    'sit-up': 0,
    plank: 0,
  })

  const event = PT_EVENTS[eventIndex]

  useEffect(() => {
    if (stage === 'event' && state.settings.keepAwake) void keepAwake()
    return () => {
      if (stage !== 'event') void allowSleep()
    }
  }, [stage, state.settings.keepAwake])

  function finishEvent(value: number) {
    const next = { ...results, [event.id]: value }
    setResults(next)
    if (eventIndex === PT_EVENTS.length - 1) {
      setStage('result')
      void allowSleep()
    } else {
      setStage('recover')
    }
  }

  function nextEvent() {
    setEventIndex((i) => i + 1)
    setStage('event')
  }

  const total =
    scoreEvent(PT_EVENTS[0], results['push-up']) +
    scoreEvent(PT_EVENTS[1], results['sit-up']) +
    scoreEvent(PT_EVENTS[2], results.plank)

  if (stage === 'intro') {
    return (
      <div className="screen">
        <TopBar title="PT Test" back="/progress" />
        <div className="stack stack--lg">
          <p className="muted">
            Three events, back to back, scored out of 300. Take it on a rested day, log it honestly, and
            repeat it every four to six weeks. It is the only number in this app that is hard to fool.
          </p>

          <div className="stack">
            {PT_EVENTS.map((e, i) => (
              <div className="card" key={e.id}>
                <div className="row" style={{ alignItems: 'flex-start' }}>
                  <div style={{ width: 56, flex: 'none' }}>
                    <Figure frames={getExercise(e.exercise).frames} />
                  </div>
                  <div className="grow">
                    <div style={{ fontWeight: 700 }}>
                      {i + 1}. {e.name}
                    </div>
                    <p className="small muted" style={{ marginTop: 2 }}>
                      {e.brief}
                    </p>
                    <div className="chips" style={{ marginTop: 8 }}>
                      <span className="chip">100 pts at {e.max100} {e.unit}</span>
                      <span className="chip">60 pts at {e.min60}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="btn btn--primary"
            onClick={() => {
              unlockAudio()
              setStage('event')
            }}
          >
            Begin test
          </button>

          {state.ptResults.length > 0 && (
            <div>
              <div className="section-title">Previous results</div>
              <div className="stack">
                {state.ptResults.map((r) => (
                  <div className="rowitem" key={r.id}>
                    <div className="grow">
                      <div className="rowitem__title">
                        {r.score}/300 · {ptRank(r.score)}
                      </div>
                      <div className="rowitem__meta">
                        {shortDate(r.date)} · {r.pushUps} push-ups · {r.sitUps} sit-ups ·{' '}
                        {mmss(r.plankSeconds)} plank
                      </div>
                    </div>
                    <button
                      className="iconbtn"
                      aria-label="Delete result"
                      onClick={() => dispatch({ type: 'pt/delete', id: r.id })}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (stage === 'recover') {
    return <Recovery next={PT_EVENTS[eventIndex + 1].name} onDone={nextEvent} sound={state.settings.sound} />
  }

  if (stage === 'result') {
    return (
      <div className="screen">
        <TopBar title="Result" back="/progress" />
        <div className="stack stack--lg">
          <div className="hero center">
            <div className="tiny" style={{ color: 'var(--brass)' }}>
              Total score
            </div>
            <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1 }}>{total}</div>
            <div className="muted">out of 300 · {ptRank(total)}</div>
          </div>

          <div className="card stack" style={{ gap: 14 }}>
            {PT_EVENTS.map((e) => {
              const raw = results[e.id]
              return (
                <ScoreBar
                  key={e.id}
                  label={e.name}
                  value={scoreEvent(e, raw)}
                  detail={`${e.kind === 'hold' ? mmss(raw) : `${raw} ${e.unit}`} · ${scoreEvent(e, raw)} pts`}
                />
              )
            })}
          </div>

          <div className="btn-row">
            <button className="btn btn--ghost" onClick={() => navigate('/progress')}>
              Discard
            </button>
            <button
              className="btn btn--primary"
              onClick={() => {
                const result: PtResult = {
                  id: `${Date.now()}`,
                  date: isoDate(),
                  pushUps: results['push-up'],
                  sitUps: results['sit-up'],
                  plankSeconds: results.plank,
                  score: total,
                }
                dispatch({ type: 'pt/add', result })
                navigate('/progress')
              }}
            >
              Save result
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <EventRunner key={event.id} eventIndex={eventIndex} onDone={finishEvent} sound={state.settings.sound} />
}

function Recovery({ next, onDone, sound }: { next: string; onDone: () => void; sound: boolean }) {
  const [left, setLeft] = useState(RECOVERY_SECONDS)
  useEffect(() => {
    const deadline = Date.now() + RECOVERY_SECONDS * 1000
    const id = window.setInterval(() => {
      const remaining = Math.max(0, (deadline - Date.now()) / 1000)
      setLeft(remaining)
      if (remaining <= 0) {
        window.clearInterval(id)
        if (sound) cue.go()
        onDone()
      }
    }, 200)
    return () => window.clearInterval(id)
  }, [onDone, sound])

  return (
    <div className="screen">
      <TopBar title="Recover" />
      <div className="stack stack--lg" style={{ marginTop: 30 }}>
        <TimerRing value={left} total={RECOVERY_SECONDS} resting caption={mmss(left)} sub="recover" />
        <p className="center muted">
          Two minutes before <strong>{next}</strong>. Walk it off, breathe, do not sit down.
        </p>
        <button className="btn" onClick={onDone}>
          Skip ahead
        </button>
      </div>
    </div>
  )
}

function EventRunner({
  eventIndex,
  onDone,
  sound,
}: {
  eventIndex: number
  onDone: (value: number) => void
  sound: boolean
}) {
  const event = PT_EVENTS[eventIndex]
  const exercise = getExercise(event.exercise)
  const isHold = event.kind === 'hold'

  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(isHold ? 0 : event.limit)
  const [reps, setReps] = useState(0)
  const startRef = useRef(0)
  // The interval below outlives any single render, so it reads the count through a ref.
  const repsRef = useRef(0)
  repsRef.current = reps

  useEffect(() => {
    if (!running) return
    startRef.current = Date.now()
    const id = window.setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000
      if (isHold) {
        setSeconds(elapsed)
        if (elapsed >= event.limit) {
          window.clearInterval(id)
          setRunning(false)
          onDone(Math.round(elapsed))
        }
      } else {
        const left = Math.max(0, event.limit - elapsed)
        setSeconds(left)
        if (left <= 0) {
          window.clearInterval(id)
          setRunning(false)
          if (sound) cue.finish()
          onDone(repsRef.current)
        }
      }
    }, 200)
    return () => window.clearInterval(id)
    // `reps` is read at timeout only; re-subscribing on every tap would restart the clock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, isHold, event.limit])

  function addRep() {
    setReps((r) => r + 1)
    vibrate(20)
  }

  return (
    <div className="screen">
      <TopBar title={`${eventIndex + 1}/${PT_EVENTS.length} · ${event.name}`} />
      <div className="stack stack--lg">
        <div className="figure-stage player__figure" style={{ height: '22vh' }}>
          <Figure frames={exercise.frames} animated={running} cycle={exercise.cycle} />
        </div>

        <TimerRing
          value={isHold ? Math.max(0, event.limit - seconds) : seconds}
          total={event.limit}
          caption={mmss(seconds)}
          sub={isHold ? 'held' : 'left'}
        />

        {!running ? (
          <>
            <p className="center muted small">{event.brief}</p>
            <button
              className="btn btn--primary"
              onClick={() => {
                if (sound) cue.go()
                speak(`${event.name}. Go.`)
                setRunning(true)
              }}
            >
              Start {event.name.toLowerCase()}
            </button>
          </>
        ) : isHold ? (
          <button
            className="btn btn--danger"
            style={{ minHeight: 70 }}
            onClick={() => {
              setRunning(false)
              if (sound) cue.finish()
              onDone(Math.round(seconds))
            }}
          >
            Broken position, stop the clock
          </button>
        ) : (
          <>
            <button className="big-tap" onClick={addRep}>
              <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1 }}>{reps}</div>
              <div className="tiny dim">Tap anywhere to count a rep</div>
            </button>
            <div className="btn-row">
              <button className="btn btn--ghost btn--sm" onClick={() => setReps((r) => Math.max(0, r - 1))}>
                Miscount, minus one
              </button>
              <button
                className="btn btn--sm"
                onClick={() => {
                  setRunning(false)
                  onDone(reps)
                }}
              >
                Finished early
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
