/** Formatting helpers. Numbers follow the Danish convention: comma as decimal separator. */

export function mmss(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const m = Math.floor(s / 60)
  const rest = s % 60
  return `${m}:${String(rest).padStart(2, '0')}`
}

export function duration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  if (s < 60) return `${s} s`
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  return `${h} t ${m % 60} min`
}

export function decimal(value: number, digits = 1): string {
  return value.toFixed(digits).replace('.', ',')
}

export function integer(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** Local calendar date as YYYY-MM-DD, which is what every record is keyed by. */
export function isoDate(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseIsoDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(s: string, days: number): string {
  const d = parseIsoDate(s)
  d.setDate(d.getDate() + days)
  return isoDate(d)
}

export function daysBetween(a: string, b: string): number {
  const ms = parseIsoDate(b).getTime() - parseIsoDate(a).getTime()
  return Math.round(ms / 86400000)
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function shortDate(s: string): string {
  const d = parseIsoDate(s)
  return `${d.getDate()}. ${MONTHS[d.getMonth()]}`
}

export function longDate(s: string): string {
  const d = parseIsoDate(s)
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function weekdayLetter(s: string): string {
  return WEEKDAYS[parseIsoDate(s).getDay()][0]
}

/** Monday-based weekday index, 0 = Monday. */
export function weekdayIndex(s: string): number {
  return (parseIsoDate(s).getDay() + 6) % 7
}
