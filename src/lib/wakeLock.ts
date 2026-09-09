/**
 * Keeps the screen on during a workout.
 *
 * The Screen Wake Lock API is released whenever the page is hidden, so the lock has to
 * be re-taken on visibilitychange. Safari on iOS 16.4+ supports it; older versions
 * simply do not, and the workout still runs, the screen just dims.
 */

type Sentinel = { released: boolean; release: () => Promise<void> }

let sentinel: Sentinel | null = null
let wanted = false

async function acquire(): Promise<void> {
  const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<Sentinel> } }
  if (!nav.wakeLock) return
  try {
    sentinel = await nav.wakeLock.request('screen')
  } catch {
    // Denied (low battery, no user gesture). Not worth surfacing.
    sentinel = null
  }
}

function onVisibility(): void {
  if (wanted && document.visibilityState === 'visible' && (!sentinel || sentinel.released)) {
    void acquire()
  }
}

export async function keepAwake(): Promise<void> {
  if (wanted) return
  wanted = true
  document.addEventListener('visibilitychange', onVisibility)
  await acquire()
}

export async function allowSleep(): Promise<void> {
  wanted = false
  document.removeEventListener('visibilitychange', onVisibility)
  if (sentinel && !sentinel.released) {
    try {
      await sentinel.release()
    } catch {
      /* already gone */
    }
  }
  sentinel = null
}

export function wakeLockSupported(): boolean {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator
}
