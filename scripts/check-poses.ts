/**
 * Numeric validation of every exercise animation.
 *
 * Looking at a render catches what is ugly; this catches what is wrong. It samples each
 * exercise's whole cycle, not just the authored keyframes, because the interpolated
 * in-betweens are where limbs sink through the floor: a straight blend from straight
 * arms to a bent elbow shortens the chord as a cosine while the body drops linearly.
 *
 *   npx tsx scripts/check-poses.ts            all categories
 *   npx tsx scripts/check-poses.ts --category core
 *   npx tsx scripts/check-poses.ts --verbose  list every violation, not a summary
 *
 * Exits non-zero if any error-level check fails, so it can gate a commit.
 */
import type { Exercise } from '../src/data/exercises/types'
import { GROUND, Pose, Pt, Skeleton, sampleCycle, solve } from '../src/lib/pose'

const CATEGORIES = ['warmup', 'push', 'legs', 'core', 'cardio', 'cooldown'] as const

const args = process.argv.slice(2)
const opt = (n: string) => {
  const i = args.indexOf(`--${n}`)
  return i >= 0 ? args[i + 1] : undefined
}
const verbose = args.includes('--verbose')

/** How many points along the cycle to test. */
const SAMPLES = 240
/** A joint may dip this far into the ground band before it counts. Feet are wedges. */
const FLOOR_TOLERANCE = 1.2
/** A contact point may wander this far across the cycle. */
const CONTACT_TOLERANCE = 2.0
/**
 * Interior joint angle limits. Full knee flexion (heel against the buttock, as in
 * kneeling or a quad stretch) leaves about 20 degrees; the elbow bottoms out sooner.
 * Above MAX_JOINT the joint is bending backwards.
 */
const MIN_JOINT: Record<string, number> = { knee: 19, elbow: 28 }
const MAX_JOINT = 183

/**
 * Accepted contact travel, keyed by exercise/point.
 *
 * Every entry here is a movement where a hand or foot legitimately relocates: the figure
 * walks (inchworm, bear crawl), steps to a new stance (the lunges, the single-leg
 * deadlift), or lands a jump somewhere other than where it took off. The checker cannot
 * tell a relocation from a drag, so the measured distance is recorded and only a
 * WORSENING fails. Lower a number when an exercise is improved; never raise one without
 * looking at the render first.
 *
 * What is not in here, and must stay at zero: a contact that is meant to be planted for
 * the whole exercise. A push-up hand or a plank toe appearing in this list is a bug.
 */
const ACCEPTED_TRAVEL: Record<string, number> = {
  // Running drills: the trailing foot scuffs back as the heel peels off.
  'high-knees/toeL': 5.4,
  'high-knees/toeR': 5.4,
  'butt-kicks/toeL': 10.7,
  'butt-kicks/toeR': 10.7,
  // Travelling movements: hands walk out, feet walk in, the bear crawl advances.
  'inchworm/handL': 4.2,
  'inchworm/handR': 5.6,
  'inchworm/ankleL': 43.9,
  'inchworm/ankleR': 43.8,
  'inchworm/toeL': 43.6,
  'inchworm/toeR': 43.6,
  'bear-crawl/handL': 8.0,
  'bear-crawl/handR': 8.0,
  'bear-crawl/ankleL': 8.0,
  'bear-crawl/ankleR': 8.0,
  // Steps into and out of a stance.
  'reverse-lunge/ankleR': 12.3,
  'reverse-lunge/toeR': 25.5,
  'lateral-lunge/ankleR': 16.7,
  'single-leg-deadlift/ankleL': 16.7,
  'single-leg-deadlift/toeL': 29.8,
  // Jumps: the tail of the descent, where the foot is already low as it arrives.
  'jumping-lunge/ankleL': 3.5,
  'jumping-lunge/ankleR': 3.5,
  'jumping-lunge/toeL': 18.7,
  'jumping-lunge/toeR': 18.7,
  'burpee/ankleL': 3.1,
  'burpee/ankleR': 2.5,
  'burpee/toeL': 16.7,
  'burpee/toeR': 13.0,
  'squat-thrust/ankleL': 2.5,
  'squat-thrust/toeL': 17.1,
  'squat-thrust/toeR': 13.9,
  'skater-jump/ankleL': 4.9,
  'skater-jump/ankleR': 4.9,
  'skater-jump/toeL': 20.8,
  'skater-jump/toeR': 20.8,
}

/** How much worse than the baseline a contact may get before it fails. */
const REGRESSION_MARGIN = 1.15

interface Finding {
  exercise: string
  level: 'error' | 'warn'
  check: string
  detail: string
}

function angleAt(a: Pt, b: Pt, c: Pt): number {
  // Interior angle at b, in degrees.
  const v1 = { x: a.x - b.x, y: a.y - b.y }
  const v2 = { x: c.x - b.x, y: c.y - b.y }
  const dot = v1.x * v2.x + v1.y * v2.y
  const m = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y)
  if (m === 0) return 180
  return (Math.acos(Math.max(-1, Math.min(1, dot / m))) * 180) / Math.PI
}

/** Points that must not go through the floor. Toes are excluded: the wedge rests on it. */
function floorPoints(s: Skeleton): [string, Pt][] {
  return [
    ['head', s.head],
    ['neck', s.neck],
    ['chest', s.chest],
    ['pelvis', s.pelvis],
    ['elbowL', s.elbowL],
    ['elbowR', s.elbowR],
    ['handL', s.handL],
    ['handR', s.handR],
    ['kneeL', s.kneeL],
    ['kneeR', s.kneeR],
    ['ankleL', s.ankleL],
    ['ankleR', s.ankleR],
  ]
}

function allPoints(s: Skeleton): [string, Pt][] {
  return [...floorPoints(s), ['toeL', s.toeL], ['toeR', s.toeR]]
}

function checkExercise(ex: Exercise): Finding[] {
  const out: Finding[] = []
  const add = (level: Finding['level'], check: string, detail: string) =>
    out.push({ exercise: ex.id, level, check, detail })

  const poses: Pose[] = []
  for (let i = 0; i < SAMPLES; i++) poses.push(sampleCycle(ex.frames, i / SAMPLES))
  const skels = poses.map(solve)

  // --- floor -----------------------------------------------------------------
  let worstFloor = { name: '', depth: 0, at: 0 }
  skels.forEach((s, i) => {
    for (const [name, pt] of floorPoints(s)) {
      const depth = pt.y - GROUND
      if (depth > worstFloor.depth) worstFloor = { name, depth, at: i / SAMPLES }
    }
  })
  if (worstFloor.depth > FLOOR_TOLERANCE) {
    add(
      'error',
      'floor',
      `${worstFloor.name} is ${worstFloor.depth.toFixed(1)} below the ground at t=${worstFloor.at.toFixed(2)}`,
    )
  }

  // --- joint range -------------------------------------------------------------
  const joints: [string, (s: Skeleton) => [Pt, Pt, Pt]][] = [
    ['elbowL', (s) => [s.neck, s.elbowL, s.handL]],
    ['elbowR', (s) => [s.neck, s.elbowR, s.handR]],
    ['kneeL', (s) => [s.pelvis, s.kneeL, s.ankleL]],
    ['kneeR', (s) => [s.pelvis, s.kneeR, s.ankleR]],
  ]
  for (const [name, pick] of joints) {
    let min = 999
    let max = -999
    let minAt = 0
    skels.forEach((s, i) => {
      const [a, b, c] = pick(s)
      const ang = angleAt(a, b, c)
      if (ang < min) {
        min = ang
        minAt = i / SAMPLES
      }
      if (ang > max) max = ang
    })
    const limit = name.startsWith('knee') ? MIN_JOINT.knee : MIN_JOINT.elbow
    if (min < limit) {
      add('error', 'joint', `${name} folds to ${min.toFixed(0)} degrees at t=${minAt.toFixed(2)}`)
    }
    if (max > MAX_JOINT) {
      add('warn', 'joint', `${name} opens to ${max.toFixed(0)} degrees (hyperextension)`)
    }
  }

  // --- contact drift ------------------------------------------------------------
  // A point resting on the floor should not slide along it. Measured within each
  // continuous run of contact, not across the whole cycle: a foot that leaves the
  // ground and lands somewhere else (a burpee, a jumping lunge, a bear crawl) has not
  // slid, it has stepped. Runs are taken on the looped cycle so a contact that spans
  // the wrap point counts as one.
  for (const [name] of allPoints(skels[0])) {
    const pts = skels.map((s) => allPoints(s).find(([n]) => n === name)![1])
    // Touching, not merely low: a supine figure has its whole body within a few units
    // of the floor, and an arm sweeping just above it is not a load-bearing contact.
    const grounded = pts.map((p) => p.y > GROUND - 1.5)
    if (!grounded.some(Boolean)) continue
    if (grounded.every(Boolean)) {
      const xs = pts.map((p) => p.x)
      const drift = Math.max(...xs) - Math.min(...xs)
      if (drift > CONTACT_TOLERANCE) {
        add('error', 'slide', `${name} rests on the floor all cycle but slides ${drift.toFixed(1)}`)
      }
      continue
    }
    // Walk twice round the loop and take runs that start after a lift-off.
    let run: Pt[] = []
    let worst = 0
    let worstLen = 0
    for (let i = 0; i < SAMPLES * 2; i++) {
      const idx = i % SAMPLES
      if (grounded[idx]) {
        run.push(pts[idx])
      } else {
        if (run.length > SAMPLES * 0.12) {
          const xs = run.map((p) => p.x)
          const drift = Math.max(...xs) - Math.min(...xs)
          if (drift > worst) {
            worst = drift
            worstLen = run.length
          }
        }
        run = []
      }
    }
    if (worst > CONTACT_TOLERANCE) {
      const accepted = ACCEPTED_TRAVEL[`${ex.id}/${name}`]
      const detail = `${name} slides ${worst.toFixed(1)} while in contact (over ${Math.round((worstLen / SAMPLES) * 100)}% of the cycle)`
      if (accepted === undefined) {
        add('error', 'slide', detail)
      } else if (worst > accepted * REGRESSION_MARGIN) {
        add('error', 'slide', `${detail}; accepted travel for this contact is ${accepted}`)
      } else {
        add('warn', 'travel', `${detail}; accepted as relocation`)
      }
    }
  }

  // --- frame in the box ----------------------------------------------------------
  let minX = 999
  let maxX = -999
  let minY = 999
  skels.forEach((s) => {
    for (const [, pt] of allPoints(s)) {
      minX = Math.min(minX, pt.x)
      maxX = Math.max(maxX, pt.x)
      minY = Math.min(minY, pt.y)
    }
  })
  // The head disc and limb widths add roughly 7 units beyond a joint centre.
  if (minX < 1) add('warn', 'bounds', `reaches x=${minX.toFixed(0)}, clipped at the left edge`)
  if (maxX > 99) add('warn', 'bounds', `reaches x=${maxX.toFixed(0)}, clipped at the right edge`)
  if (minY < 3) add('warn', 'bounds', `reaches y=${minY.toFixed(0)}, clipped at the top`)

  // --- the figure should move ------------------------------------------------------
  let travel = 0
  for (let i = 1; i < skels.length; i++) {
    travel = Math.max(travel, Math.hypot(skels[i].handR.x - skels[0].handR.x, skels[i].handR.y - skels[0].handR.y))
    travel = Math.max(travel, Math.hypot(skels[i].kneeR.x - skels[0].kneeR.x, skels[i].kneeR.y - skels[0].kneeR.y))
  }
  if (travel < 2 && !ex.hold) {
    add('warn', 'static', `barely moves (max joint travel ${travel.toFixed(1)}) but is not a hold`)
  }
  if (ex.hold && travel > 14) {
    add('warn', 'static', `is a hold but moves ${travel.toFixed(0)} units`)
  }

  // --- symmetry for front-on exercises ------------------------------------------
  if (ex.facing === 'front') {
    let worst = 0
    for (const f of ex.frames) {
      const p = f.pose
      worst = Math.max(
        worst,
        Math.abs(p.uaL + p.uaR),
        Math.abs(p.faL + p.faR),
        Math.abs(p.thL + p.thR),
        Math.abs(p.shL + p.shR),
      )
    }
    // Some asymmetry is intentional (a lateral lunge, a skater jump).
    if (worst > 30 && !ex.unilateral && !['skater-jump'].includes(ex.id)) {
      add('warn', 'symmetry', `front-on but limbs differ by up to ${worst.toFixed(0)} degrees`)
    }
  }

  return out
}

async function main() {
  const wanted = opt('category')
  const cats = wanted ? [wanted] : [...CATEGORIES]
  const findings: Finding[] = []
  let count = 0

  for (const cat of cats) {
    const mod = (await import(`../src/data/exercises/${cat}.ts`)) as Record<string, Exercise[]>
    const list = Object.values(mod).find((v) => Array.isArray(v))
    if (!list) throw new Error(`No exercise array in ${cat}.ts`)
    for (const ex of list) {
      count++
      findings.push(...checkExercise(ex))
    }
  }

  const errors = findings.filter((f) => f.level === 'error')
  const warns = findings.filter((f) => f.level === 'warn')

  const byExercise = new Map<string, Finding[]>()
  for (const f of findings) {
    if (!byExercise.has(f.exercise)) byExercise.set(f.exercise, [])
    byExercise.get(f.exercise)!.push(f)
  }

  for (const [ex, fs] of byExercise) {
    const errs = fs.filter((f) => f.level === 'error')
    if (!verbose && errs.length === 0) continue
    console.log(`\n${ex}`)
    for (const f of verbose ? fs : errs) {
      console.log(`  ${f.level === 'error' ? 'ERROR' : 'warn '} ${f.check.padEnd(9)} ${f.detail}`)
    }
  }

  console.log(
    `\n${count} exercises checked at ${SAMPLES} samples each: ${errors.length} errors, ${warns.length} warnings` +
      (verbose ? '' : ' (use --verbose to list warnings)'),
  )
  process.exit(errors.length > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(2)
})
