/**
 * Renders the app icons from one SVG source.
 *
 * Chrome wants real PNGs in the manifest before it will offer "Install", and iOS wants a
 * 180px apple-touch-icon, so the SVG is rasterised at build-prep time rather than shipped
 * alone. Run `npm run icons` after changing the artwork.
 */
import { Resvg } from '@resvg/resvg-js'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public')
mkdirSync(outDir, { recursive: true })

const BG = '#0d1117'
const ACCENT = '#9dbb3a'
const BRASS = '#d9a441'

/**
 * Three sergeant-style chevrons over a bar. `inset` is the fraction of the canvas kept
 * clear at the edges, which is what makes the maskable variant survive a circular crop.
 */
function icon({ size, inset, rounded }) {
  const pad = size * inset
  const inner = size - pad * 2
  const cx = size / 2
  // Chevron geometry, expressed relative to the inner box.
  const w = inner * 0.62
  const h = inner * 0.17
  const gap = inner * 0.055
  const top = pad + inner * 0.14
  const stroke = inner * 0.095

  const chevrons = [0, 1, 2]
    .map((i) => {
      const y = top + i * (h + gap)
      return `<path d="M${cx - w / 2} ${y + h} L${cx} ${y} L${cx + w / 2} ${y + h}"
        fill="none" stroke="${i === 0 ? BRASS : ACCENT}" stroke-width="${stroke}"
        stroke-linecap="round" stroke-linejoin="round" opacity="${i === 0 ? 1 : 0.92 - i * 0.12}" />`
    })
    .join('\n')

  const barY = top + 3 * (h + gap) + inner * 0.05
  const bar = `<rect x="${cx - w / 2}" y="${barY}" width="${w}" height="${stroke}" rx="${stroke / 2}" fill="${ACCENT}" />`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rounded ? size * 0.22 : 0}" fill="${BG}" />
  ${chevrons}
  ${bar}
</svg>`
}

function png(svg, size) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } })
  return resvg.render().asPng()
}

const standard = icon({ size: 512, inset: 0.14, rounded: true })
const maskable = icon({ size: 512, inset: 0.26, rounded: false })

writeFileSync(join(outDir, 'favicon.svg'), icon({ size: 64, inset: 0.1, rounded: true }))
writeFileSync(join(outDir, 'icon-512.png'), png(standard, 512))
writeFileSync(join(outDir, 'icon-192.png'), png(standard, 192))
writeFileSync(join(outDir, 'apple-touch-icon.png'), png(icon({ size: 512, inset: 0.16, rounded: false }), 180))
writeFileSync(join(outDir, 'icon-maskable-512.png'), png(maskable, 512))

console.log('Icons written to public/')
