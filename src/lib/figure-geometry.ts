import { GROUND, Pose, Pt, SEG, Skeleton, solve } from './pose'

/**
 * Turns a solved pose into drawable shapes.
 *
 * This is the single source of the figure's appearance. The React component maps the
 * shapes to SVG elements for the app; the render script maps them to an SVG string for
 * the contact sheets. Keeping the geometry here means the sheet you review is exactly
 * what the phone draws.
 *
 * Limbs are tapered quads with a disc at each joint, so a bent elbow reads as a bent
 * elbow rather than two sticks meeting at a corner. Shapes are grouped in draw order:
 * far limbs, torso, head, near limbs. Each layer is meant to be drawn twice by the
 * renderer, first as a dark ring (fill and stroke in the background colour) and then as
 * the coloured fill, which gives every layer a seamless outline where it crosses
 * another.
 */

export type Shape =
  | { kind: 'poly'; pts: Pt[] }
  | { kind: 'circle'; c: Pt; r: number }

export interface Layer {
  /** CSS class / colour role: 'far', 'body', 'near', 'ground', 'shadow'. */
  role: 'far' | 'body' | 'near' | 'ground' | 'shadow'
  shapes: Shape[]
  /** Only the shadow uses this. */
  opacity?: number
}

export type Facing = 'side' | 'front'

export interface GeometryOptions {
  /** Front-on exercises draw both chains in the near colour and omit the nose. */
  facing?: Facing
}

const W = {
  upperArm: [3.4, 2.7],
  forearm: [2.7, 2.1],
  hand: 2.3,
  thigh: [4.6, 3.5],
  shin: [3.5, 2.5],
  ankle: 2.3,
  footHeel: 1.7,
  footToe: 1.1,
  pelvis: 5.2,
  chest: 5.9,
  neckBase: 4.1,
  neck: 2.3,
} as const

function sub(a: Pt, b: Pt): Pt {
  return { x: a.x - b.x, y: a.y - b.y }
}
function add(a: Pt, b: Pt): Pt {
  return { x: a.x + b.x, y: a.y + b.y }
}
function mul(a: Pt, k: number): Pt {
  return { x: a.x * k, y: a.y * k }
}
function norm(a: Pt): Pt {
  const l = Math.hypot(a.x, a.y) || 1
  return { x: a.x / l, y: a.y / l }
}
function perp(a: Pt): Pt {
  return { x: -a.y, y: a.x }
}

/** A tapered segment from a to b with half-widths wa and wb. */
function taper(a: Pt, b: Pt, wa: number, wb: number): Shape {
  const n = perp(norm(sub(b, a)))
  return {
    kind: 'poly',
    pts: [add(a, mul(n, wa)), add(b, mul(n, wb)), sub(b, mul(n, wb)), sub(a, mul(n, wa))],
  }
}

function disc(c: Pt, r: number): Shape {
  return { kind: 'circle', c, r }
}

function limbs(s: Skeleton, side: 'L' | 'R', scale: number): Shape[] {
  const [neck, elbow, hand] = side === 'L' ? [s.neck, s.elbowL, s.handL] : [s.neck, s.elbowR, s.handR]
  const [pelvis, knee, ankle, toe] =
    side === 'L' ? [s.pelvis, s.kneeL, s.ankleL, s.toeL] : [s.pelvis, s.kneeR, s.ankleR, s.toeR]

  const k = (v: number) => v * scale
  const footDir = norm(sub(toe, ankle))
  const footN = perp(footDir)
  const heel = sub(ankle, mul(footDir, 1.6))

  return [
    // arm
    taper(neck, elbow, k(W.upperArm[0]), k(W.upperArm[1])),
    disc(elbow, k(W.upperArm[1])),
    taper(elbow, hand, k(W.forearm[0]), k(W.forearm[1])),
    disc(add(hand, mul(norm(sub(hand, elbow)), 1.1)), k(W.hand)),
    // leg
    taper(pelvis, knee, k(W.thigh[0]), k(W.thigh[1])),
    disc(knee, k(W.thigh[1])),
    taper(knee, ankle, k(W.shin[0]), k(W.shin[1])),
    disc(ankle, k(W.ankle)),
    // foot: a wedge from the heel to the toe, thicker at the heel
    {
      kind: 'poly',
      pts: [
        add(heel, mul(footN, k(W.footHeel))),
        add(toe, mul(footN, k(W.footToe))),
        sub(toe, mul(footN, k(W.footToe))),
        sub(heel, mul(footN, k(W.footHeel))),
      ],
    },
  ]
}

function torso(s: Skeleton, widthScale: number): Shape[] {
  const k = (v: number) => v * widthScale
  const neckTop = add(s.neck, mul(s.up, 4.2))
  return [
    taper(s.pelvis, s.chest, k(W.pelvis), k(W.chest)),
    disc(s.pelvis, k(W.pelvis)),
    disc(s.chest, k(W.chest)),
    taper(s.chest, s.neck, k(W.chest), k(W.neckBase)),
    disc(s.neck, k(W.neckBase)),
    taper(s.neck, neckTop, W.neck, W.neck * 0.9),
  ]
}

function head(s: Skeleton, facing: Facing): Shape[] {
  const shapes: Shape[] = [disc(s.head, SEG.headR)]
  if (facing === 'side') {
    // A small bump on the front of the head is enough to read as a nose, and with it
    // you can tell a figure on its back from one on its front.
    shapes.push(disc(add(add(s.head, mul(s.front, 6.1)), mul(s.up, 0.4)), 1.7))
  }
  return shapes
}

export interface Geometry {
  layers: Layer[]
  skeleton: Skeleton
}

export function buildGeometry(pose: Pose, opts: GeometryOptions = {}): Geometry {
  const facing = opts.facing ?? 'side'
  const s = solve(pose)

  const lowest = Math.max(s.toeL.y, s.toeR.y, s.handL.y, s.handR.y, s.pelvis.y)
  const spanX = Math.max(s.head.x, s.toeL.x, s.toeR.x, s.handL.x, s.handR.x) -
    Math.min(s.head.x, s.toeL.x, s.toeR.x, s.handL.x, s.handR.x)
  const centreX = (s.pelvis.x + s.neck.x) / 2

  const widthScale = facing === 'front' ? 1.35 : 1
  const farScale = facing === 'front' ? 1 : 0.9

  const layers: Layer[] = [
    {
      role: 'ground',
      shapes: [
        {
          kind: 'poly',
          pts: [
            { x: 4, y: GROUND + 1.4 },
            { x: 96, y: GROUND + 1.4 },
            { x: 96, y: GROUND + 2.6 },
            { x: 4, y: GROUND + 2.6 },
          ],
        },
      ],
    },
    {
      role: 'shadow',
      shapes: [
        {
          kind: 'poly',
          pts: ellipse(centreX, GROUND + 2, Math.max(10, spanX * 0.42), 2.6),
        },
      ],
      opacity: Math.max(0.1, 0.45 - (GROUND - lowest) / 60),
    },
    { role: facing === 'front' ? 'near' : 'far', shapes: limbs(s, 'L', farScale) },
    { role: 'body', shapes: torso(s, widthScale) },
    { role: 'body', shapes: head(s, facing) },
    { role: 'near', shapes: limbs(s, 'R', 1) },
  ]

  return { layers, skeleton: s }
}

/** Polygon approximation of an ellipse, so every shape stays one of two kinds. */
function ellipse(cx: number, cy: number, rx: number, ry: number, n = 20): Pt[] {
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    pts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry })
  }
  return pts
}

/** Serialise a shape's coordinates for SVG. */
export function polyPoints(pts: Pt[]): string {
  return pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
}
