import { useState } from 'react'
import { isoDate, mmss, shortDate } from '../lib/format'

/*
 * Hand-rolled SVG charts.
 *
 * Every chart here plots a single series, so there is no categorical palette to get
 * wrong: identity is carried by the chart title, not by hue. The one place a ramp is
 * used is the calendar heatmap, and its four steps are a single hue, monotonic in
 * lightness, each at least 3:1 against the card surface so the quiet days are still
 * legible. Tapping a mark reveals its value, which is the mobile equivalent of hover.
 */

/** Sequential ramp for the heatmap: one hue, light steps upward, all readable on #151b23. */
const RAMP = ['#52701f', '#6c8f28', '#85a831', '#9dbb3a']

function roundedTopBar(x: number, y: number, w: number, h: number, r: number): string {
  const radius = Math.min(r, w / 2, h)
  return [
    `M${x},${y + h}`,
    `V${y + radius}`,
    `Q${x},${y} ${x + radius},${y}`,
    `H${x + w - radius}`,
    `Q${x + w},${y} ${x + w},${y + radius}`,
    `V${y + h}`,
    'Z',
  ].join(' ')
}

export interface BarPoint {
  label: string
  value: number
  /** Shown in the tooltip instead of the raw number. */
  display?: string
}

export function BarChart({
  data,
  height = 130,
  unit = '',
}: {
  data: BarPoint[]
  height?: number
  unit?: string
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const w = 320
  const padBottom = 18
  const padTop = 14
  const plot = height - padBottom - padTop
  const max = Math.max(1, ...data.map((d) => d.value))
  const slot = w / Math.max(1, data.length)
  // A 2px surface gap between adjacent bars keeps them from reading as one block.
  const barW = Math.max(6, Math.min(28, slot - 8))

  const active = selected !== null ? data[selected] : null

  return (
    <div>
      <svg className="chart" viewBox={`0 0 ${w} ${height}`} role="img">
        <line className="axis" x1={0} y1={height - padBottom} x2={w} y2={height - padBottom} />
        {[0.5, 1].map((f) => (
          <line
            key={f}
            className="gridline"
            x1={0}
            y1={height - padBottom - plot * f}
            x2={w}
            y2={height - padBottom - plot * f}
          />
        ))}
        {data.map((d, i) => {
          const h = d.value === 0 ? 0 : Math.max(3, (d.value / max) * plot)
          const x = i * slot + (slot - barW) / 2
          const y = height - padBottom - h
          return (
            <g key={i} onClick={() => setSelected(selected === i ? null : i)} style={{ cursor: 'pointer' }}>
              <rect x={i * slot} y={0} width={slot} height={height} fill="transparent" />
              {h > 0 && (
                <path
                  className={selected === null || selected === i ? 'bar' : 'bar bar--muted'}
                  d={roundedTopBar(x, y, barW, h, 4)}
                />
              )}
              <text className="label" x={i * slot + slot / 2} y={height - 6} textAnchor="middle">
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="small muted center" style={{ minHeight: 20 }}>
        {active ? `${active.display ?? active.value}${active.display ? '' : unit} · ${active.label}` : ''}
      </div>
    </div>
  )
}

export interface LinePoint {
  x: string
  y: number
}

export function LineChart({
  data,
  height = 150,
  unit = '',
  digits = 1,
}: {
  data: LinePoint[]
  height?: number
  unit?: string
  digits?: number
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const w = 320
  const padLeft = 30
  const padBottom = 18
  const padTop = 12
  const plotW = w - padLeft - 6
  const plotH = height - padBottom - padTop

  if (data.length === 0) return null
  const ys = data.map((d) => d.y)
  const rawMin = Math.min(...ys)
  const rawMax = Math.max(...ys)
  const span = rawMax - rawMin || 1
  const min = rawMin - span * 0.15
  const max = rawMax + span * 0.15

  const px = (i: number) => padLeft + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW)
  const py = (y: number) => padTop + plotH - ((y - min) / (max - min)) * plotH

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(d.y).toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${px(data.length - 1).toFixed(1)},${(padTop + plotH).toFixed(1)} L${px(0).toFixed(
    1,
  )},${(padTop + plotH).toFixed(1)} Z`

  const active = selected !== null ? data[selected] : data[data.length - 1]
  const activeIndex = selected ?? data.length - 1

  return (
    <div>
      <svg className="chart" viewBox={`0 0 ${w} ${height}`} role="img">
        {[0, 0.5, 1].map((f) => {
          const y = padTop + plotH * f
          const value = max - (max - min) * f
          return (
            <g key={f}>
              <line className="gridline" x1={padLeft} y1={y} x2={w - 6} y2={y} />
              <text className="label" x={padLeft - 5} y={y + 3} textAnchor="end">
                {value.toFixed(digits).replace('.', ',')}
              </text>
            </g>
          )
        })}
        <path className="area" d={areaPath} />
        <path className="line" d={linePath} />
        {data.map((d, i) => (
          <g key={i} onClick={() => setSelected(i)} style={{ cursor: 'pointer' }}>
            <rect
              x={px(i) - plotW / Math.max(1, data.length) / 2}
              y={0}
              width={plotW / Math.max(1, data.length)}
              height={height}
              fill="transparent"
            />
            {(i === activeIndex || data.length <= 12) && (
              <circle
                className="dot"
                cx={px(i)}
                cy={py(d.y)}
                r={i === activeIndex ? 4 : 2.6}
                stroke="#151b23"
                strokeWidth={i === activeIndex ? 2 : 0}
              />
            )}
          </g>
        ))}
      </svg>
      <div className="small muted center" style={{ minHeight: 20 }}>
        {active && `${active.y.toFixed(digits).replace('.', ',')} ${unit} · ${shortDate(active.x)}`}
      </div>
    </div>
  )
}

export interface HeatDay {
  date: string
  /** Minutes trained that day. Zero means a rest day. */
  minutes: number
}

/**
 * Calendar heatmap, Monday-first, oldest week at the top.
 * `days` must be a contiguous run of dates.
 */
export function Heatmap({ days }: { days: HeatDay[] }) {
  const [selected, setSelected] = useState<HeatDay | null>(null)
  const today = isoDate()
  const max = Math.max(1, ...days.map((d) => d.minutes))

  function stepFor(minutes: number): string | null {
    if (minutes <= 0) return null
    const ratio = minutes / max
    if (ratio <= 0.25) return RAMP[0]
    if (ratio <= 0.5) return RAMP[1]
    if (ratio <= 0.75) return RAMP[2]
    return RAMP[3]
  }

  return (
    <div>
      <div className="heat__wrap">
        <div className="heat__head">
          {['M', '', 'W', '', 'F', '', 'S'].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="heat">
          {days.map((d) => {
            const colour = stepFor(d.minutes)
            return (
              <button
                key={d.date}
                className={`heat__cell ${colour ? 'on' : ''} ${d.date === today ? 'today' : ''} ${
                  d.date > today ? 'future' : ''
                }`}
                style={colour ? { background: colour } : undefined}
                onClick={() => setSelected(selected?.date === d.date ? null : d)}
                aria-label={`${d.date}: ${d.minutes} minutes`}
              />
            )
          })}
        </div>
      </div>
      <div className="small muted center" style={{ minHeight: 20, marginTop: 6 }}>
        {selected
          ? `${shortDate(selected.date)} · ${selected.minutes > 0 ? `${selected.minutes} min` : 'Rest'}`
          : ''}
      </div>
    </div>
  )
}

/** Horizontal bar used for the PT test score breakdown. */
export function ScoreBar({ value, max = 100, label, detail }: { value: number; max?: number; label: string; detail: string }) {
  const pct = Math.max(0, Math.min(1, value / max))
  return (
    <div className="stack" style={{ gap: 4 }}>
      <div className="row row--between small">
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span className="muted">{detail}</span>
      </div>
      <div style={{ height: 8, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 999 }} />
      </div>
    </div>
  )
}

export function formatMinutes(seconds: number): string {
  return mmss(seconds)
}
