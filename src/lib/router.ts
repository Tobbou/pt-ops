import { useEffect, useState } from 'react'

/**
 * Hash routing, deliberately hand-rolled.
 *
 * A hash route needs no server rewrite rules, which matters on GitHub Pages, and it
 * keeps the back button working inside an installed PWA without pulling in a router.
 */

export function currentPath(): string {
  const raw = window.location.hash.replace(/^#/, '')
  return raw === '' ? '/' : raw
}

export function navigate(path: string, replace = false): void {
  const target = `#${path}`
  if (replace) window.location.replace(target)
  else window.location.hash = path
}

export function useRoute(): string {
  const [path, setPath] = useState(currentPath)
  useEffect(() => {
    const onChange = () => setPath(currentPath())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return path
}

/** Match '/workouts/:id' against '/workouts/daily-pt'. Returns null when it does not fit. */
export function match(pattern: string, path: string): Record<string, string> | null {
  const pp = pattern.split('/').filter(Boolean)
  const [pathOnly] = path.split('?')
  const ap = pathOnly.split('/').filter(Boolean)
  if (pp.length !== ap.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(':')) params[pp[i].slice(1)] = decodeURIComponent(ap[i])
    else if (pp[i] !== ap[i]) return null
  }
  return params
}

export function queryOf(path: string): URLSearchParams {
  const q = path.split('?')[1] ?? ''
  return new URLSearchParams(q)
}
