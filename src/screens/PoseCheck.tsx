import Figure from '../components/Figure'
import { EXERCISES } from '../data/exercises'

/**
 * Development-only contact sheet: every exercise, every keyframe, drawn large.
 *
 * The poses are authored as raw joint angles, so the only way to know a limb is not
 * bent backwards is to look at all of them at once. Reachable at #/dev-poses when
 * running `npm run dev`; it is not built into the production bundle.
 */
export default function PoseCheck() {
  return (
    <div className="screen">
      <h1>Pose check</h1>
      <p className="small muted">{EXERCISES.length} exercises</p>
      {EXERCISES.map((ex) => (
        <div key={ex.id} style={{ marginTop: 18 }}>
          <div className="row row--between">
            <strong>{ex.name}</strong>
            <span className="tiny dim">{ex.category}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            {ex.frames.map((f, i) => (
              <div key={i} className="figure-stage" style={{ flex: 1, minWidth: 0 }}>
                <Figure frames={[f]} still={0} facing={ex.facing} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
