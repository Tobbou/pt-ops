import { useRef, useState } from 'react'
import { Segmented, Toggle, TopBar } from '../components/ui'
import { DIFFICULTY, DIFFICULTY_ORDER, type Difficulty } from '../data/workouts'
import { unlockAudio, cue, speak } from '../lib/audio'
import { wakeLockSupported } from '../lib/wakeLock'
import { navigate } from '../lib/router'
import { INITIAL_STATE, STORAGE_KEY, useAppState, useDispatch, type AppState } from '../state/store'

export default function Settings() {
  const state = useAppState()
  const dispatch = useDispatch()
  const fileRef = useRef<HTMLInputElement>(null)
  const [note, setNote] = useState<string | null>(null)

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pt-ops-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importData(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AppState
        if (typeof parsed !== 'object' || parsed === null || !('sessions' in parsed)) {
          throw new Error('Not a PT Ops backup')
        }
        dispatch({ type: 'replace', state: { ...INITIAL_STATE, ...parsed } })
        setNote('Backup restored.')
      } catch (error) {
        setNote(`Could not read that file: ${(error as Error).message}`)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="screen">
      <TopBar title="Settings" back="/" />
      <div className="stack stack--lg">
        <div>
          <div className="section-title">Default difficulty</div>
          <Segmented
            value={state.profile.difficulty}
            onChange={(next: Difficulty) => dispatch({ type: 'profile', patch: { difficulty: next } })}
            options={DIFFICULTY_ORDER.map((d) => ({ value: d, label: DIFFICULTY[d].label }))}
          />
          <p className="small muted" style={{ marginTop: 8 }}>
            {DIFFICULTY[state.profile.difficulty].blurb}
          </p>
        </div>

        <div>
          <div className="section-title">You</div>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                id="weight"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={state.profile.weightKg}
                onChange={(e) => dispatch({ type: 'profile', patch: { weightKg: Number(e.target.value) } })}
              />
            </div>
            <div className="field">
              <label htmlFor="height">Height (cm)</label>
              <input
                id="height"
                type="number"
                inputMode="numeric"
                value={state.profile.heightCm}
                onChange={(e) => dispatch({ type: 'profile', patch: { heightCm: Number(e.target.value) } })}
              />
            </div>
          </div>
          <p className="small muted" style={{ marginTop: 8 }}>
            Weight is only used for the calorie estimate, which is a MET calculation and therefore a
            rough guide, not a measurement.
          </p>
        </div>

        <div>
          <div className="section-title">During a workout</div>
          <div className="stack">
            <Toggle
              label="Sound cues"
              hint="Beeps on the last three seconds and at every change"
              on={state.settings.sound}
              onChange={(v) => {
                dispatch({ type: 'settings', patch: { sound: v } })
                if (v) {
                  unlockAudio()
                  cue.go()
                }
              }}
            />
            <Toggle
              label="Spoken cues"
              hint="Announces the next exercise out loud"
              on={state.settings.voice}
              onChange={(v) => {
                dispatch({ type: 'settings', patch: { voice: v } })
                if (v) speak('Spoken cues on')
              }}
            />
            <Toggle
              label="Vibration"
              hint="A short buzz at every change"
              on={state.settings.vibration}
              onChange={(v) => dispatch({ type: 'settings', patch: { vibration: v } })}
            />
            <Toggle
              label="Keep the screen on"
              hint={
                wakeLockSupported()
                  ? 'Holds a wake lock for the length of the session'
                  : 'Not supported by this browser, the screen will dim as usual'
              }
              on={state.settings.keepAwake}
              onChange={(v) => dispatch({ type: 'settings', patch: { keepAwake: v } })}
            />
            <Toggle
              label="Show what is next during rest"
              on={state.settings.showNext}
              onChange={(v) => dispatch({ type: 'settings', patch: { showNext: v } })}
            />
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="countdown">Get-ready countdown (seconds)</label>
            <input
              id="countdown"
              type="number"
              inputMode="numeric"
              min={0}
              max={20}
              value={state.settings.countdown}
              onChange={(e) =>
                dispatch({
                  type: 'settings',
                  patch: { countdown: Math.max(0, Math.min(20, Number(e.target.value))) },
                })
              }
            />
          </div>
        </div>

        <div>
          <div className="section-title">Your data</div>
          <p className="small muted" style={{ marginBottom: 10 }}>
            Everything lives in this browser on this device. Nothing is uploaded anywhere, which also
            means a lost phone is a lost log: export a backup now and then.
          </p>
          <div className="btn-row">
            <button className="btn" onClick={exportData}>
              Export backup
            </button>
            <button className="btn" onClick={() => fileRef.current?.click()}>
              Restore
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) importData(file)
              e.target.value = ''
            }}
          />
          {note && (
            <p className="small" style={{ marginTop: 8, color: 'var(--brass)' }}>
              {note}
            </p>
          )}
        </div>

        <div>
          <div className="section-title">About</div>
          <div className="card">
            <p className="small muted">
              PT Ops is a bodyweight training app that runs entirely offline. Add it to your home
              screen and it behaves like any other app, including with the phone in flight mode.
            </p>
            <p className="small muted" style={{ marginTop: 8 }}>
              It is not medical advice. If something hurts in a way that is not muscular effort, stop.
            </p>
            <p className="small dim" style={{ marginTop: 8 }}>
              Storage key: {STORAGE_KEY} · {state.sessions.length} sessions ·{' '}
              {state.metrics.length} measurements
            </p>
          </div>
        </div>

        <button
          className="btn btn--danger"
          onClick={() => {
            if (
              window.confirm(
                'Erase every session, measurement and test result on this device? This cannot be undone.',
              )
            ) {
              dispatch({ type: 'reset' })
              navigate('/')
            }
          }}
        >
          Erase all data
        </button>
      </div>
    </div>
  )
}
