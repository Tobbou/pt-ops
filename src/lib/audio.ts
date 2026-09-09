/**
 * Cues for the workout player.
 *
 * Beeps are synthesised with the Web Audio API rather than shipped as files, so the app
 * stays asset-free and the service worker has nothing extra to cache. Speech uses the
 * browser's own voices; both degrade to silence where the platform says no.
 */

let ctx: AudioContext | null = null

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  // iOS suspends the context whenever the app loses focus.
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/**
 * Must be called from inside a real user gesture, once, or iOS will keep the audio
 * context suspended for the rest of the session.
 */
export function unlockAudio(): void {
  const c = context()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  gain.gain.value = 0.0001
  osc.connect(gain).connect(c.destination)
  osc.start()
  osc.stop(c.currentTime + 0.01)
}

function tone(freq: number, durationMs: number, volume = 0.25, type: OscillatorType = 'sine'): void {
  const c = context()
  if (!c) return
  const now = c.currentTime
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  // A short attack and release keeps the beep from clicking.
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000)
  osc.connect(gain).connect(c.destination)
  osc.start(now)
  osc.stop(now + durationMs / 1000 + 0.02)
}

export const cue = {
  tick: () => tone(880, 90, 0.18),
  go: () => {
    tone(1320, 160, 0.3)
    setTimeout(() => tone(1760, 220, 0.3), 140)
  },
  rest: () => tone(520, 260, 0.22, 'triangle'),
  halfway: () => tone(1100, 120, 0.2, 'square'),
  finish: () => {
    tone(880, 180, 0.3)
    setTimeout(() => tone(1175, 180, 0.3), 170)
    setTimeout(() => tone(1568, 420, 0.32), 340)
  },
}

export function vibrate(pattern: number | number[]): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // Some browsers expose vibrate but refuse to run it outside a gesture.
    }
  }
}

let voiceReady = false

export function speak(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  try {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.05
    utterance.pitch = 1
    utterance.volume = 1
    utterance.lang = 'en-GB'
    if (!voiceReady) {
      // Priming the queue once stops the first phrase being swallowed on iOS.
      voiceReady = true
      window.speechSynthesis.cancel()
    }
    window.speechSynthesis.speak(utterance)
  } catch {
    // Speech is a nicety, never a requirement.
  }
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
  }
}
