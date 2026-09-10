/**
 * Renders exercise contact sheets to PNG, headless.
 *
 * The poses are raw joint angles, so the only reliable review is to look at them. This
 * script draws the exact geometry the app draws (via figure-geometry) so a sheet on disk
 * is what the phone will show.
 *
 *   npx tsx scripts/render-poses.ts --category push              -> out/poses/push.png
 *   npx tsx scripts/render-poses.ts --exercise push-up            -> out/poses/push-up.png
 *   npx tsx scripts/render-poses.ts --category all                -> one sheet per category
 *   npx tsx scripts/render-poses.ts --file mocap/scratch.ts       -> any module exporting Exercise[]
 *   npx tsx scripts/render-poses.ts --exercise push-up --samples 12 --cols 8
 *
 * A category sheet shows every exercise as one row: the authored keyframes (boxed) with
 * interpolated in-betweens after each, so both the poses and the motion between them
 * are visible. Category files are imported directly so an error in one category never
 * blocks rendering another.
 */
import { Resvg } from '@resvg/resvg-js'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Exercise } from '../src/data/exercises/types'
import { Layer, buildGeometry, polyPoints } from '../src/lib/figure-geometry'
import { Frame, Pose, sampleCycle } from '../src/lib/pose'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'out', 'poses')
mkdirSync(outDir, { recursive: true })

const args = process.argv.slice(2)
const opt = (name: string): string | undefined => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}

const CATEGORY_FILES: Record<string, string> = {
  warmup: 'warmup',
  push: 'push',
  legs: 'legs',
  core: 'core',
  cardio: 'cardio',
  cooldown: 'cooldown',
}

const COLOURS = {
  ring: '#10151c',
  body: '#e8eef5',
  near: '#9dbb3a',
  far: '#5b6675',
  ground: '#29323f',
  shadow: '#000000',
  stage: '#151c26',
  text: '#8f9dae',
  label: '#e8eef5',
  boxed: '#2c3a4d',
}

function layerSvg(layer: Layer, ring: boolean): string {
  const fill = ring ? COLOURS.ring : COLOURS[layer.role]
  const stroke = ring ? ` stroke="${COLOURS.ring}" stroke-width="2.4" stroke-linejoin="round"` : ''
  const opacity = !ring && layer.opacity !== undefined ? ` opacity="${layer.opacity.toFixed(2)}"` : ''
  const shapes = layer.shapes
    .map((s) =>
      s.kind === 'poly'
        ? `<polygon points="${polyPoints(s.pts)}"/>`
        : `<circle cx="${s.c.x.toFixed(2)}" cy="${s.c.y.toFixed(2)}" r="${s.r}"/>`,
    )
    .join('')
  return `<g fill="${fill}"${stroke}${opacity}>${shapes}</g>`
}

/** One figure as an SVG fragment positioned at (x, y) with the given cell size. */
function figureCell(pose: Pose, ex: Exercise, x: number, y: number, size: number, boxed: boolean): string {
  const { layers } = buildGeometry(pose, { facing: ex.facing })
  const inner = layers
    .map((l) => (l.role === 'ground' || l.role === 'shadow' ? layerSvg(l, false) : layerSvg(l, true) + layerSvg(l, false)))
    .join('')
  const scale = size / 104
  const frame = boxed
    ? `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="6" fill="${COLOURS.stage}" stroke="${COLOURS.boxed}" stroke-width="1.5"/>`
    : `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="6" fill="${COLOURS.stage}"/>`
  return `${frame}<g transform="translate(${x} ${y}) scale(${scale})">${inner}</g>`
}

/** Keyframes plus in-betweens, in cycle order, flagged so the sheet can box the keyframes. */
function samples(frames: Frame[], between: number): { pose: Pose; key: boolean; label: string }[] {
  const out: { pose: Pose; key: boolean; label: string }[] = []
  // Total weight of the cycle, to place each keyframe at its true time.
  const legs: number[] = []
  for (let i = 0; i < frames.length; i++) {
    const next = frames[(i + 1) % frames.length]
    if (frames[i].hold) legs.push(frames[i].hold as number)
    legs.push(next.d ?? 1)
  }
  const total = legs.reduce((a, b) => a + b, 0)
  let acc = 0
  for (let i = 0; i < frames.length; i++) {
    out.push({ pose: frames[i].pose, key: true, label: `K${i}` })
    const hold = frames[i].hold ?? 0
    const span = frames[(i + 1) % frames.length].d ?? 1
    const start = acc + hold
    for (let b = 1; b <= between; b++) {
      const u = (start + (span * b) / (between + 1)) / total
      out.push({ pose: sampleCycle(frames, u), key: false, label: '' })
    }
    acc += hold + span
  }
  return out
}

/**
 * An exercise occupies a band of one or more rows of cells. Long sequences like a burpee
 * wrap rather than running off to the right, because a strip 70 cells wide is unreadable
 * once it is scaled to fit a screen.
 */
function sheet(exercises: Exercise[], title: string, between: number, cell: number, cols: number): string {
  const pad = 14
  const labelW = 150
  const gap = 6
  const width = pad * 2 + labelW + cols * (cell + gap)
  const headerH = 30

  const bands = exercises.map((ex) => {
    const cells = samples(ex.frames, between)
    return { ex, cells, rows: Math.ceil(cells.length / cols) }
  })

  let y = pad + headerH
  const parts: string[] = []
  for (const band of bands) {
    const meta = `${band.ex.category} · ${band.ex.frames.length} keyframes · ${band.ex.cycle}s${band.ex.facing === 'front' ? ' · front' : ''}`
    parts.push(
      `<text x="${pad}" y="${y + 18}" fill="${COLOURS.label}" font-size="13" font-weight="700" font-family="Segoe UI, Arial, sans-serif">${escape(band.ex.name)}</text>` +
        `<text x="${pad}" y="${y + 34}" fill="${COLOURS.text}" font-size="10" font-family="Segoe UI, Arial, sans-serif">${escape(meta)}</text>` +
        `<text x="${pad}" y="${y + 48}" fill="${COLOURS.text}" font-size="9" font-family="Segoe UI, Arial, sans-serif">${escape(band.ex.id)}</text>`,
    )
    band.cells.forEach((s, i) => {
      const cx = pad + labelW + (i % cols) * (cell + gap)
      const cy = y + Math.floor(i / cols) * (cell + gap)
      parts.push(figureCell(s.pose, band.ex, cx, cy, cell, s.key))
    })
    y += band.rows * (cell + gap) + 10
  }
  const height = y + pad

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="#0d1117"/>
<text x="${pad}" y="${pad + 14}" fill="${COLOURS.label}" font-size="15" font-weight="700" font-family="Segoe UI, Arial, sans-serif">${escape(title)}</text>
<text x="${pad + 260}" y="${pad + 14}" fill="${COLOURS.text}" font-size="10" font-family="Segoe UI, Arial, sans-serif">boxed = authored keyframe, unboxed = interpolated in-between; reading order is left to right, wrapping; the figure faces right, near side is green</text>
${parts.join('')}
</svg>`
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

function writePng(svg: string, file: string): void {
  const png = new Resvg(svg, { fitTo: { mode: 'original' } }).render().asPng()
  writeFileSync(file, png)
  console.log(`${file}  (${Math.round(png.length / 1024)} KB)`)
}

async function loadModule(spec: string): Promise<Exercise[]> {
  const mod = (await import(spec)) as Record<string, unknown>
  const list = Object.values(mod).find((v) => Array.isArray(v)) as Exercise[] | undefined
  if (!list) throw new Error(`No exercise array exported from ${spec}`)
  return list
}

async function loadCategory(cat: string): Promise<Exercise[]> {
  return loadModule(`../src/data/exercises/${CATEGORY_FILES[cat]}.ts`)
}

async function main() {
  const between = Number(opt('samples') ?? (opt('exercise') ? 5 : 2))
  const cell = Number(opt('cell') ?? (opt('exercise') ? 200 : 110))
  const cols = Number(opt('cols') ?? (opt('exercise') ? 8 : 14))

  // --file renders any module exporting an Exercise[]. Used to review a motion capture
  // before adopting it into a category file.
  const file = opt('file')
  if (file) {
    const list = await loadModule(file.startsWith('.') ? file : `../${file}`)
    writePng(sheet(list, file, between, cell, cols), join(outDir, 'scratch.png'))
    return
  }

  if (opt('exercise')) {
    const id = opt('exercise') as string
    for (const cat of Object.keys(CATEGORY_FILES)) {
      const list = await loadCategory(cat)
      const ex = list.find((e) => e.id === id)
      if (ex) {
        writePng(sheet([ex], `${ex.name} (${ex.id})`, between, cell, cols), join(outDir, `${id}.png`))
        return
      }
    }
    throw new Error(`Unknown exercise id: ${id}`)
  }

  const wanted = opt('category') ?? 'all'
  const cats = wanted === 'all' ? Object.keys(CATEGORY_FILES) : [wanted]
  for (const cat of cats) {
    if (!CATEGORY_FILES[cat]) throw new Error(`Unknown category: ${cat}`)
    const list = await loadCategory(cat)
    writePng(sheet(list, `${cat} (${list.length} exercises)`, between, cell, cols), join(outDir, `${cat}.png`))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
