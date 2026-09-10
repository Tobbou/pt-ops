import { useEffect, useMemo, useRef, useState } from 'react'
import { Facing, Layer, buildGeometry, cycleViewBox } from '../lib/figure-geometry'
import { Frame, Pose, sampleCycle } from '../lib/pose'

interface FigureProps {
  frames: Frame[]
  /** Run the animation loop. Lists render a static signature pose instead. */
  animated?: boolean
  /** Seconds per repetition. */
  cycle?: number
  /** Mirror horizontally (some exercises read better facing the other way). */
  flip?: boolean
  /** Front-on exercises colour both chains alike and drop the nose. */
  facing?: Facing
  /** Frame to show when not animated. Defaults to the working position. */
  still?: number
  className?: string
}

/** Every layer is drawn twice: a dark ring first, then the fill. See figure-geometry. */
function LayerShapes({ layer, ring }: { layer: Layer; ring: boolean }) {
  const cls = ring ? 'fig-ring' : `fig-${layer.role}${layer.far ? ' fig-far' : ''}`
  return (
    <g className={cls} opacity={!ring && layer.opacity !== undefined ? layer.opacity : undefined}>
      {layer.shapes.map((s, i) =>
        s.kind === 'path' ? (
          <path key={i} d={s.d} />
        ) : (
          <circle key={i} cx={s.c.x.toFixed(2)} cy={s.c.y.toFixed(2)} r={s.r} />
        ),
      )}
    </g>
  )
}

export default function Figure({
  frames,
  animated = false,
  cycle = 2.4,
  flip = false,
  facing = 'side',
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
      // ~33 fps is plenty for a figure this size and keeps phones cool.
      if (now - last > 30) {
        last = now
        setPose(sampleCycle(frames, ((now - start) / 1000 / cycle) % 1))
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [frames, animated, cycle, stillIndex])

  const { layers } = buildGeometry(pose, { facing })

  // Crop to the movement rather than to a fixed box. A standing figure used barely a
  // third of the old 100x104 box, which is why every thumbnail was unreadable. Sampling
  // the whole cycle keeps the crop still while the figure moves inside it.
  const viewBox = useMemo(
    () => cycleViewBox(Array.from({ length: 18 }, (_, i) => sampleCycle(frames, i / 18)), { facing }),
    [frames, facing],
  )

  return (
    <svg
      className={`figure ${className ?? ''}`}
      viewBox={viewBox}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform={flip ? 'translate(100,0) scale(-1,1)' : undefined}>
        {layers.map((layer, i) =>
          layer.role === 'ground' || layer.role === 'shadow' ? (
            <LayerShapes key={i} layer={layer} ring={false} />
          ) : (
            <g key={i}>
              <LayerShapes layer={layer} ring />
              <LayerShapes layer={layer} ring={false} />
            </g>
          ),
        )}
      </g>
    </svg>
  )
}
