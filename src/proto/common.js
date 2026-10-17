// Shared bits for the three rendering prototypes: renderer, HDRI, camera framing, RE4 art, rotate/open input, stats.
import * as THREE from 'three'
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js'
import { ItemRotator } from '../demo/itemRotate.js'
import { loadRE4 } from '../demo/art.js'
export const BASE = import.meta.env.BASE_URL
export const qs = new URLSearchParams(location.search)
export const T0 = performance.now()
export const GZ = 0.62, CASE_C = new THREE.Vector3(0, 0.62 + 0.85 + 0.0005, 0.12) // glass-shelf top; case centre (three coords)
export function makeRenderer() {
  const canvas = document.getElementById('c')
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight, false)
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap
  const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.05, 60)
  camera.position.set(1.15, 2.05, 6.1); camera.lookAt(0, 1.62, 0.1)
  addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); onResize.forEach((f) => f()) })
  return { renderer, camera, canvas }
}
export const onResize = []
export async function loadEnv(renderer, scene, intensity = 0.7) {
  const hdr = await new HDRLoader().loadAsync(BASE + 'proto/env.hdr'); hdr.mapping = THREE.EquirectangularReflectionMapping
  scene.environment = hdr; scene.environmentIntensity = intensity
  scene.background = new THREE.Color(0x24211e); return hdr
}
/** RE4 Gold Edition print set → one wrap canvas laid out back | spine | front (matches the GLB UVs) */
export async function re4Art() {
  const art = await loadRE4(BASE)
  const INS_W = 1.29, D = 0.135, PX = 800, w = Math.round((2 * INS_W + D) * PX), h = Math.round(1.62 * PX)
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'
  const a = Math.round(INS_W * PX), b = Math.round((INS_W + D) * PX)
  g.drawImage(art.back, 0, 0, a, h); g.drawImage(art.spine, a, 0, b - a, h); g.drawImage(art.front, b, 0, w - b, h)
  return { art, wrap: c }
}
export function tex(src, flipY = false) { const t = new THREE.Texture(src); t.colorSpace = THREE.SRGBColorSpace; t.flipY = flipY; t.anisotropy = 8; t.needsUpdate = true; return t }
/** Turn the case (camera fixed) + open toggle. rig: { root, spine, cover } pivots; onPose(open) optional */
export function interaction(canvas, camera, rig, onChange) {
  const rot = new ItemRotator(canvas, camera, { onInput: onChange }); rot.enabled = true
  const base = rig.root.quaternion.clone(), basePos = rig.root.position.clone(), q = new THREE.Quaternion(), v = new THREE.Vector3()
  let open = 0, openT = qs.has('open') ? 1 : 0
  const btn = document.getElementById('bOpen'); const sync = () => { btn.textContent = openT ? '合上 Close' : '打开 Open' }
  btn.onclick = () => { openT = openT ? 0 : 1; rot.reset(); sync(); onChange() }; sync()
  document.getElementById('bReset').onclick = () => { rot.reset(); onChange() }
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2), MAX = THREE.MathUtils.degToRad(178)
  return {
    rot,
    get open() { return open },
    update(dt) { // returns true while anything moves
      let moving = rot.update(dt) || rot.active
      const o0 = open; open = openT > open ? Math.min(openT, open + dt / 0.9) : Math.max(openT, open - dt / 0.9); if (o0 !== open) moving = true
      const e = ease(open); rig.spine.rotation.y = -e * MAX / 2; rig.cover.rotation.y = -e * MAX / 2; rig.onPose?.(e)
      rot.quaternion(q); rig.root.quaternion.copy(q).multiply(base)
      // keep the opened spread centred: pivot about the centre of the spread (−W/2 when fully open)
      rig.root.position.copy(basePos).add(rot.offset(basePos, v)).sub(v.set(-0.66 * e, 0, 0).applyQuaternion(rig.root.quaternion))
      return moving
    },
  }
}
export function stats() {
  const el = document.getElementById('stats'), s = { ttff: null, bytes: 0, samples: 0, mode: '', ready: false, note: '' }
  const bytes = () => performance.getEntriesByType('resource').concat(performance.getEntriesByType('navigation')).reduce((n, e) => n + (e.transferSize || e.encodedBodySize || 0), 0)
  s.firstFrame = () => { if (s.ttff == null) { s.ttff = Math.round(performance.now() - T0); s.bytes = bytes(); s.ready = true } }
  s.show = () => { el.textContent = `load ${(s.bytes / 1048576).toFixed(2)} MB · first frame ${s.ttff ?? '…'} ms · ${s.mode}${s.samples ? ' · samples ' + s.samples : ''}${s.note ? ' · ' + s.note : ''}` }
  setInterval(() => { if (s.ready) s.bytes = bytes(); s.show() }, 1000)
  window.__proto = s; return s
}
