/**
 * Build the web character from the Mixamo FBX, then stage it for the preview tool.
 *
 *   npm run character                       # defaults below
 *   npm run character -- --drop Shirt,Shoes # pass anything through to the Blender script
 *
 * Blender is invoked headless. Its path is found from BLENDER_PATH, else the usual
 * Windows install location, so this works without putting Blender on PATH.
 */
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function findBlender() {
  if (process.env.BLENDER_PATH) return process.env.BLENDER_PATH
  const guesses = [
    'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe',
    'C:/Program Files/Blender Foundation/Blender 4.5/blender.exe',
    'blender',
  ]
  return guesses.find((g) => g === 'blender' || existsSync(g)) ?? 'blender'
}

const passthrough = process.argv.slice(2)
const has = (flag) => passthrough.includes(flag)

const src = join(root, 'assets/mixamo/character/character.fbx')
if (!existsSync(src)) {
  console.error(`No character at ${src}\nSee assets/mixamo/README.md for how to get one.`)
  process.exit(1)
}

const out = join(root, 'assets/build/character.glb')
mkdirSync(dirname(out), { recursive: true })

const args = [
  '--background',
  '--python',
  join(root, 'scripts/blender/build_character.py'),
  '--',
  '--in', src,
  '--out', out,
  ...(has('--texture') ? [] : ['--texture', '512']),
  ...(has('--decimate') ? [] : ['--decimate', '0.35']),
  ...(has('--preview') ? [] : ['--preview', join(root, 'assets/build/preview.png')]),
  ...passthrough,
]

execFileSync(findBlender(), args, { stdio: 'inherit' })

// The preview tool serves its own directory, so the result has to sit next to it.
copyFileSync(out, join(root, 'tools/character-preview/character.glb'))
console.log(`\n${(statSync(out).size / 1e6).toFixed(2)} MB -> tools/character-preview/character.glb`)
console.log('Look at it with:  npm run character:preview   (then open http://localhost:5190)')
