/**
 * Character preview.
 *
 * Loads whatever GLB the build script last produced and lets you orbit it. This exists
 * so a candidate character can be judged in seconds without opening Blender: drop the
 * FBX in, run `npm run character`, reload.
 *
 * The lighting is deliberately the lighting the app would use, a strong key with a rim
 * behind, because on a human figure that is what makes muscle definition read. Judging a
 * body under flat light tells you nothing about how it will look in the product.
 */
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
  Group,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const stage = document.getElementById('stage')
const stat = document.getElementById('stat')

const renderer = new WebGLRenderer({ antialias: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.outputColorSpace = SRGBColorSpace
renderer.toneMapping = ACESFilmicToneMapping
renderer.toneMappingExposure = 1.1
stage.appendChild(renderer.domElement)

const scene = new Scene()
scene.background = new Color('#0d1117')

const camera = new PerspectiveCamera(35, 1, 0.01, 100)
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

const ambient = new AmbientLight(0xffffff, 0.35)
const key = new DirectionalLight(0xffffff, 2.6)
const rim = new DirectionalLight(0xbcd6ff, 2.2)
const fill = new DirectionalLight(0xffffff, 0.5)
scene.add(ambient, key, rim, fill)

const root = new Group()
scene.add(root)

function frame(object) {
  const box = new Box3().setFromObject(object)
  const size = box.getSize(new Vector3())
  const centre = box.getCenter(new Vector3())
  const height = size.y || 1

  controls.target.copy(centre)
  camera.position.set(centre.x + height * 0.9, centre.y + height * 0.12, centre.z + height * 2.0)
  camera.near = height / 100
  camera.far = height * 40
  camera.updateProjectionMatrix()

  key.position.set(centre.x + height, centre.y + height * 1.4, centre.z + height * 1.2)
  rim.position.set(centre.x - height * 1.2, centre.y + height * 0.9, centre.z - height * 1.3)
  fill.position.set(centre.x - height, centre.y + height * 0.3, centre.z + height)

  return { size, height }
}

let meshCount = 0
let triCount = 0

new GLTFLoader().load(
  `./character.glb?t=${Date.now()}`,
  (gltf) => {
    root.add(gltf.scene)
    gltf.scene.traverse((o) => {
      if (o.isMesh) {
        meshCount++
        const g = o.geometry
        triCount += (g.index ? g.index.count : g.attributes.position.count) / 3
      }
    })
    const { size, height } = frame(gltf.scene)
    stat.textContent =
      `${meshCount} meshes · ${Math.round(triCount).toLocaleString('da-DK')} triangles · ` +
      `${height.toFixed(2)} units tall · ${size.x.toFixed(2)} wide`
  },
  undefined,
  (err) => {
    stat.textContent = `failed to load: ${err.message ?? err}`
  },
)

let spinning = true
document.getElementById('spin').addEventListener('click', (e) => {
  spinning = !spinning
  e.currentTarget.classList.toggle('on', spinning)
})
document.getElementById('light').addEventListener('input', (e) => {
  const v = Number(e.target.value)
  key.intensity = 1.6 * v
  rim.intensity = 1.4 * v
  ambient.intensity = 0.22 * v
})
// A dark-clothed character on the app's near-black stage reads as a blob however hard
// it is lit, so the stage colour is part of judging a character, not a detail to settle
// later. These are the app's current stage and a lighter alternative.
const STAGES = ['#0d1117', '#39434f', '#8d96a3']
let stageIndex = 0
document.getElementById('bg').addEventListener('click', (e) => {
  stageIndex = (stageIndex + 1) % STAGES.length
  scene.background = new Color(STAGES[stageIndex])
  e.currentTarget.textContent = `Stage: ${['dark', 'mid', 'light'][stageIndex]}`
})

function resize() {
  const w = innerWidth
  const h = innerHeight
  renderer.setSize(w, h)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}
addEventListener('resize', resize)
resize()

let last = performance.now()
function tick(now) {
  const dt = (now - last) / 1000
  last = now
  if (spinning) root.rotation.y += dt * 0.35
  controls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
