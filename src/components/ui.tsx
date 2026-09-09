import type { ReactNode } from 'react'
import { navigate } from '../lib/router'

/** Line icons, inlined so the app ships no icon font and no sprite request. */
export const Icon = {
  home: () => (
    <svg viewBox="0 0 24 24">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  ),
  calendar: () => (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  ),
  bolt: () => (
    <svg viewBox="0 0 24 24">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  ),
  chart: () => (
    <svg viewBox="0 0 24 24">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  ),
  library: () => (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.6" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" />
    </svg>
  ),
  back: () => (
    <svg viewBox="0 0 24 24">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  ),
  gear: () => (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.2 14.4a1.6 1.6 0 0 0 .32 1.76l.06.06a1.9 1.9 0 1 1-2.7 2.7l-.05-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-.97 1.46v.17a1.9 1.9 0 1 1-3.8 0v-.09a1.6 1.6 0 0 0-1.05-1.46 1.6 1.6 0 0 0-1.76.32l-.06.06a1.9 1.9 0 1 1-2.7-2.7l.06-.06a1.6 1.6 0 0 0 .32-1.76 1.6 1.6 0 0 0-1.46-.97H3.4a1.9 1.9 0 1 1 0-3.8h.09a1.6 1.6 0 0 0 1.46-1.05 1.6 1.6 0 0 0-.32-1.76l-.06-.06a1.9 1.9 0 1 1 2.7-2.7l.06.06a1.6 1.6 0 0 0 1.76.32h.08a1.6 1.6 0 0 0 .97-1.46V3.4a1.9 1.9 0 1 1 3.8 0v.09a1.6 1.6 0 0 0 .97 1.46 1.6 1.6 0 0 0 1.77-.32l.05-.06a1.9 1.9 0 1 1 2.7 2.7l-.06.06a1.6 1.6 0 0 0-.32 1.76v.08a1.6 1.6 0 0 0 1.46.97h.17a1.9 1.9 0 1 1 0 3.8h-.09a1.6 1.6 0 0 0-1.46.97z" />
    </svg>
  ),
  plus: () => (
    <svg viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  medal: () => (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="15" r="6" />
      <path d="M8.5 9.5 6 2h12l-2.5 7.5" />
    </svg>
  ),
  trash: () => (
    <svg viewBox="0 0 24 24">
      <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14" />
    </svg>
  ),
}

export function TopBar({
  title,
  back,
  action,
}: {
  title: string
  back?: string
  action?: ReactNode
}) {
  return (
    <div className="topbar">
      {back !== undefined && (
        <button className="iconbtn" onClick={() => navigate(back)} aria-label="Back">
          <Icon.back />
        </button>
      )}
      <h1>{title}</h1>
      {action}
    </div>
  )
}

export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="stat">
      <div className="stat__value">{value}</div>
      <div className="stat__label">{label}</div>
    </div>
  )
}

export function Toggle({
  label,
  hint,
  on,
  onChange,
}: {
  label: string
  hint?: string
  on: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button className={`toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)} role="switch" aria-checked={on}>
      <span className="grow">
        <span style={{ display: 'block', fontWeight: 600 }}>{label}</span>
        {hint && <span className="small muted">{hint}</span>}
      </span>
      <span className="toggle__switch">
        <i />
      </span>
    </button>
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (next: T) => void
}) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <button key={o.value} className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>
}

/** Circular countdown. `value` and `total` are seconds. */
export function TimerRing({
  value,
  total,
  resting,
  caption,
  sub,
}: {
  value: number
  total: number
  resting?: boolean
  caption?: string
  sub?: string
}) {
  const r = 46
  const circumference = 2 * Math.PI * r
  const fraction = total > 0 ? Math.max(0, Math.min(1, value / total)) : 0
  return (
    <div className={`ring ${resting ? 'ring--rest' : ''}`}>
      <svg viewBox="0 0 100 100">
        <circle className="ring__track" cx="50" cy="50" r={r} strokeWidth="6" />
        <circle
          className="ring__value"
          cx="50"
          cy="50"
          r={r}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
        />
      </svg>
      <div className="ring__label">
        <div className="ring__big">{caption}</div>
        {sub && <div className="tiny dim">{sub}</div>}
      </div>
    </div>
  )
}
