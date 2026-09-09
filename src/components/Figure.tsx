import { useEffect, useRef, useState } from 'react'
import { Frame, GROUND, Pose, SEG, Skeleton, sampleCycle, solve } from '../lib/pose'

interface FigureProps {
  frames: Frame[]
  /** Run the animation loop. Lists render a static signature pose instead. */
  animated?: boolean
  /** Seconds per repetition. */
  cycle?: number
  /** Mirror horizontally (some exercises read better facing the other way). */
  flip?: boolean
  /** Frame to show when not animated. Defaults to the working position. */
  still?: number
  className?: string
}

function line(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x1: a.x, y1: a.y, x2: b.x, y2: b.y }
}

/** Segment widths, and the extra width of the dark ring drawn behind each one. */
const ARM = [7, 6]
const LEG = [9, 7.5, 5]
const RING = 3

function Limb({ s, side, outline }: { s: Skeleton; side: 'L' | 'R'; outline?: boolean }) {
  const cls = outline ? 'fig-ring' : side === 'L' ? 'fig-back' : 'fig-front'
  const bump = outline ? RING : 0
  const arm = side === 'L' ? [s.neck, s.elbowL, s.handL] : [s.neck, s.elbowR, s.handR]
  const leg = side === 'L' ? [s.pelvis, s.kneeL, s.ankleL, s.toeL] : [s.pelvis, s.kneeR, s.ankleR, s.toeR]
  return (
    <g className={cls}>
      <line {...line(arm[0], arm[1])} strokeWidth={ARM[0] + bump} />
      <line {...line(arm[1], arm[2])} strokeWidth={ARM[1] + bump} />
      <line {...line(leg[0], leg[1])} strokeWidth={LEG[0] + bump} />
      <line {...line(leg[1], leg[2])} strokeWidth={LEG[1] + bump} />
      <line {...line(leg[2], leg[3])} strokeWidth={LEG[2] + bump} />
    </g>
  )
}

export default function Figure({
  frames,
  animated = false,
  cycle = 2.4,
  flip = false,
  still,
  className,
}: FigureProps) {
  const stillIndex = still ?? Math.min(1, frames.length - 1)
  const [pose, setPose] = useState<Pose>(() =>
    animated ? sampleCycle(frames, 0) : frames[stillIndex].pose,
  )
  const raf = useRef(0)

  useEffect(() => {
    if (!animated) {
      setPose(frames[stillIndex].pose)
      return
    }
    const start = performance.now()
    let last = 0
    const tick = (now: number) => {
      // ~33 fps is plenty for a stick figure and keeps phones cool.
      if (now - last > 30) {
        last = now
        setPose(sampleCycle(frames, ((now - start) / 1000 / cycle) % 1))
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [frames, animated, cycle, stillIndex])

  const s = solve(pose)
  const lowest = Math.max(s.toeL.y, s.toeR.y, s.handL.y, s.handR.y, s.pelvis.y)
  const shadowW = 26 + (GROUND - Math.min(s.pelvis.y, s.neck.y)) * 0.12

  return (
    <svg
      className={`figure ${className ?? ''}`}
      viewBox="0 0 100 104"
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
    >
      <g transform={flip ? 'translate(100,0) scale(-1,1)' : undefined}>
        <ellipse
          className="fig-shadow"
          cx={(s.pelvis.x + s.neck.x) / 2}
          cy={GROUND + 2}
          rx={shadowW}
          ry={3}
          opacity={Math.max(0.12, 0.5 - (GROUND - lowest) / 60)}
        />
        <line className="fig-ground" x1={4} y1={GROUND + 2} x2={96} y2={GROUND + 2} strokeWidth={1.5} />
        {/* Each layer is drawn twice: a dark ring first, then the mark. Limbs cross
            constantly in a side view, and without the ring a green arm in front of a
            green leg reads as one thick blob. */}
        <Limb s={s} side="L" outline />
        <Limb s={s} side="L" />
        <g className="fig-ring">
          <line {...line(s.pelvis, s.neck)} strokeWidth={12 + RING} />
          <circle cx={s.head.x} cy={s.head.y} r={SEG.headR + RING / 2} />
        </g>
        <g className="fig-body">
          <line {...line(s.pelvis, s.neck)} strokeWidth={12} />
          <circle cx={s.head.x} cy={s.head.y} r={SEG.headR} />
        </g>
        <Limb s={s} side="R" outline />
        <Limb s={s} side="R" />
      </g>
    </svg>
  )
}
