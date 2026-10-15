import './box.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const BASE = import.meta.env.BASE_URL
const canvas = document.getElementById('c')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.9
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

const scene = new THREE.Scene()
const pmrem = new THREE.PMREMGenerator(renderer)
const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04)
scene.environment = envRT.texture
pmrem.dispose()

const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 50)
const HOME = new THREE.Vector3(1.6, 0.9, 3.4)
camera.position.copy(HOME)
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
controls.minDistance = 1.6
controls.maxDistance = 7
controls.target.set(0, 0.85, 0)

// lights
const key = new THREE.DirectionalLight(0xfff4e6, 2.2)
key.position.set(2.5, 4, 3)
key.castShadow = true
key.shadow.mapSize.set(1024, 1024)
key.shadow.radius = 6
Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: 0.5, far: 12 })
scene.add(key)
const fill = new THREE.DirectionalLight(0xd8ecff, 0.7)
fill.position.set(-3, 2, -1)
scene.add(fill)
scene.add(new THREE.HemisphereLight(0xffffff, 0xe8e2d6, 0.4))

const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.16 }))
ground.rotation.x = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

// Dimensions (units ≈ dm): PS5 keep case ~135 x 170 x 14 mm
const W = 1.35, H = 1.7, D = 0.14, T = 0.012
const plastic = new THREE.MeshPhysicalMaterial({ color: 0x2a5bd7, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.25, metalness: 0 })
const trayMat = new THREE.MeshPhysicalMaterial({ color: 0x1d3f9e, roughness: 0.55, clearcoat: 0.2 })
const sleeve = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.15, transmission: 0.0, transparent: true, opacity: 0.05, clearcoat: 1, clearcoatRoughness: 0.05 })

const loader = new THREE.TextureLoader()
function coverTex() {
  const tex = loader.load(`${BASE}demo/cover.jpg`)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
// front art: draw cover with PS5 blue header band onto canvas
function makeFrontTexture(img) {
  const c = document.createElement('canvas'); c.width = 810; c.height = 1020
  const g = c.getContext('2d')
  g.fillStyle = '#111'; g.fillRect(0, 0, c.width, c.height)
  const top = 92
  // cover fills area below band (crop square to fit 810x928)
  const ar = img.width / img.height, bw = c.width, bh = c.height - top
  let sw = img.width, sh = img.height, sx = 0, sy = 0
  if (ar > bw / bh) { sw = img.height * bw / bh; sx = (img.width - sw) / 2 } else { sh = img.width * bh / bw; sy = (img.height - sh) / 2 }
  g.drawImage(img, sx, sy, sw, sh, 0, top, bw, bh)
  const grad = g.createLinearGradient(0, 0, c.width, 0); grad.addColorStop(0, '#0b3fbf'); grad.addColorStop(1, '#2d6cf0')
  g.fillStyle = grad; g.fillRect(0, 0, c.width, top)
  g.fillStyle = '#fff'; g.font = '600 52px system-ui, sans-serif'; g.textBaseline = 'middle'; g.fillText('PS5', 34, top / 2)
  g.font = '500 22px system-ui'; g.textAlign = 'right'; g.fillText('PlayStation 5', c.width - 34, top / 2)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t
}
function labelTexture(img) {
  const s = 1024, c = document.createElement('canvas'); c.width = c.height = s
  const g = c.getContext('2d')
  g.save(); g.beginPath(); g.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2); g.clip()
  if (img) g.drawImage(img, 0, 0, s, s); else { g.fillStyle = '#eee'; g.fillRect(0, 0, s, s) }
  g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, 0, s, s)
  g.fillStyle = '#0b3fbf'; g.fillRect(0, s * 0.82, s, s * 0.18)
  g.fillStyle = '#fff'; g.font = '600 46px system-ui'; g.textAlign = 'center'; g.fillText('PS5 · BLU-RAY DISC', s / 2, s * 0.9)
  g.restore()
  g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(s / 2, s / 2, s * 0.2, 0, Math.PI * 2); g.fill()
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}

const root = new THREE.Group(); scene.add(root)
root.position.y = H / 2 // stands upright on ground, front facing +z

// Back half (base) — sits at z in [-D/2, -D/2+T]
const base = new THREE.Group(); root.add(base)
function box(w, h, d, mat, x, y, z, parent) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m
}
box(W, H, T, plastic, 0, 0, -D / 2 + T / 2, base)
box(W, T, D - T, plastic, 0, H / 2 - T / 2, 0, base)
box(W, T, D - T, plastic, 0, -H / 2 + T / 2, 0, base)
box(T, H, D - T, plastic, W / 2 - T / 2, 0, 0, base) // right side (opening side)
// Spine on left (hinge side) with print
const spineTex = (() => {
  const c = document.createElement('canvas'); c.width = 64; c.height = 800; const g = c.getContext('2d')
  g.fillStyle = '#0b3fbf'; g.fillRect(0, 0, 64, 70); g.fillStyle = '#111'; g.fillRect(0, 70, 64, 730)
  g.fillStyle = '#fff'; g.font = '600 28px system-ui'; g.save(); g.translate(42, 110); g.rotate(Math.PI / 2); g.fillText('羊蹄之魂 GHOST OF YŌTEI', 0, 0); g.restore()
  g.save(); g.translate(42, 18); g.rotate(Math.PI / 2); g.font = '700 22px system-ui'; g.fillText('PS5', 0, 0); g.restore()
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
})()
const spine = box(T, H, D, new THREE.MeshStandardMaterial({ map: spineTex, roughness: 0.4 }), -W / 2 + T / 2, 0, 0, base)
// interior tray + hub
box(W - 0.05, H - 0.05, 0.01, trayMat, 0, 0, -D / 2 + T + 0.005, base)
const trayZ = -D / 2 + T + 0.01
const discY = 0.12
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.012, 12, 96), trayMat); ring.position.set(0, discY, trayZ + 0.008); base.add(ring)
const hub = new THREE.Group(); hub.position.set(0, discY, trayZ); base.add(hub)
for (let i = 0; i < 8; i++) {
  const a = (i / 8) * Math.PI * 2
  const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.03), trayMat)
  tooth.position.set(Math.cos(a) * 0.065, Math.sin(a) * 0.065, 0.02); tooth.rotation.z = a; hub.add(tooth)
}
const hubBase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.012, 48), trayMat)
hubBase.rotation.x = Math.PI / 2; hubBase.position.z = 0.004; hub.add(hubBase)
// manual clip (left side area)
box(0.32, 0.04, 0.006, trayMat, -0.36, -0.6, trayZ + 0.006, base)

// Front cover — pivot on hinge (left edge x=-W/2, front z=D/2)
const hinge = new THREE.Group(); hinge.position.set(-W / 2, 0, D / 2 - T / 2); root.add(hinge)
const coverMesh = new THREE.Mesh(new THREE.BoxGeometry(W, H, T), [plastic, plastic, plastic, plastic, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 }), trayMat])
coverMesh.position.set(W / 2, 0, 0); coverMesh.castShadow = true; hinge.add(coverMesh)
const artMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 })
const art = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.02, H - 0.02), artMat)
art.position.set(W / 2, 0, T / 2 + 0.001); hinge.add(art)
const film = new THREE.Mesh(new THREE.PlaneGeometry(W, H), sleeve); film.position.set(W / 2, 0, T / 2 + 0.003); hinge.add(film)
// inner retaining tabs on cover inside
coverMesh.material[5] = trayMat

// back cover art
const backArt = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.02, H - 0.02), new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.5 }))
backArt.position.set(0, 0, -D / 2 - 0.001); backArt.rotation.y = Math.PI; base.add(backArt)

// Disc
const disc = new THREE.Group(); base.add(disc)
const R = 0.6, r = 0.075
const shape = new THREE.Shape(); shape.absarc(0, 0, R, 0, Math.PI * 2)
const hole = new THREE.Path(); hole.absarc(0, 0, r, 0, Math.PI * 2, true); shape.holes.push(hole)
const discGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.012, bevelEnabled: false, curveSegments: 96 })
const dataSide = new THREE.MeshPhysicalMaterial({ color: 0xb9c8ff, metalness: 1, roughness: 0.12, iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [200, 800] })
const discMesh = new THREE.Mesh(discGeo, dataSide); discMesh.castShadow = true; disc.add(discMesh)
const labelMat = new THREE.MeshStandardMaterial({ roughness: 0.5, transparent: true })
const label = new THREE.Mesh(new THREE.CircleGeometry(R - 0.004, 96), labelMat); label.position.z = 0.0125; disc.add(label)
const clear = new THREE.Mesh(new THREE.RingGeometry(r, 0.12, 64), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, roughness: 0.1 }))
clear.position.z = 0.013; disc.add(clear)
const SEAT = new THREE.Vector3(0, discY, trayZ + 0.012)
const OUT = new THREE.Vector3(0.25, discY + 0.25, D / 2 + 0.5)
disc.position.copy(SEAT)

const img = new Image()
img.onload = () => {
  artMat.map = makeFrontTexture(img); artMat.needsUpdate = true
  labelMat.map = labelTexture(img); labelMat.needsUpdate = true
}
img.src = `${BASE}demo/cover.jpg`

// State + animation
let open = 0, openTarget = 0, out = 0, outTarget = 0
const ui = { bOpen: q('bOpen'), bDisc: q('bDisc'), bReset: q('bReset'), lang: q('lang') }
function q(id) { return document.getElementById(id) }
let lang = localStorage.getItem('game-catalog-lang') === 'en' ? 'en' : 'zh'
const T_ = {
  zh: { h1: 'PS5 游戏盒', sub: '羊蹄之魂 · 可拖动旋转查看', open: '打开盒子', close: '合上盒子', take: '取出光盘', put: '放回光盘', reset: '复位视角', hint: '拖动旋转 · 双指缩放 · 点击盒盖或光盘交互', back: '← 返回目录', lang: 'EN' },
  en: { h1: 'PS5 Game Case', sub: 'Ghost of Yōtei · drag to rotate', open: 'Open case', close: 'Close case', take: 'Take out disc', put: 'Put disc back', reset: 'Reset view', hint: 'Drag to rotate · pinch to zoom · tap cover or disc', back: '← Back to catalog', lang: '中文' },
}
function syncUI() {
  const t = T_[lang]
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN'
  q('h1').textContent = t.h1; q('sub').textContent = t.sub; q('hint').textContent = t.hint; q('back').textContent = t.back
  ui.lang.textContent = t.lang; ui.bReset.textContent = t.reset
  ui.bOpen.textContent = openTarget ? t.close : t.open
  ui.bOpen.disabled = outTarget === 1 // must reseat before closing
  ui.bDisc.textContent = outTarget ? t.put : t.take
  ui.bDisc.disabled = !(openTarget && open > 0.6)
}
function toggleOpen() { if (outTarget) return; openTarget = openTarget ? 0 : 1; syncUI() }
function toggleDisc() { if (!openTarget) return; outTarget = outTarget ? 0 : 1; syncUI() }
ui.bOpen.onclick = toggleOpen
ui.bDisc.onclick = toggleDisc
ui.lang.onclick = () => { lang = lang === 'en' ? 'zh' : 'en'; try { localStorage.setItem('game-catalog-lang', lang) } catch {} ; syncUI() }
let resetT = 0
ui.bReset.onclick = () => { resetT = 1 }
q('back').href = BASE

// Picking (tap, not drag)
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2()
let downAt = null
canvas.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY] })
canvas.addEventListener('pointerup', (e) => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return
  ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1)
  ray.setFromCamera(ptr, camera)
  const hit = ray.intersectObjects([discMesh, label, coverMesh, art, film, ...base.children.filter((m) => m.isMesh)], false)[0]
  if (!hit) return
  const o = hit.object
  if (o === discMesh || o === label) toggleDisc()
  else if (o === coverMesh || o === art || o === film) toggleOpen()
  else if (outTarget) toggleDisc() // tap tray to reseat
  else if (!openTarget) toggleOpen()
})

function resize() {
  const w = innerWidth, h = innerHeight
  renderer.setSize(w, h, false); camera.aspect = w / h
  camera.position.z = Math.max(camera.position.z, 0)
  camera.fov = w / h < 0.8 ? 48 : 35
  camera.updateProjectionMatrix()
}
addEventListener('resize', resize); resize()

const ease = (x) => x * x * (3 - 2 * x)
const clock = new THREE.Clock()
const tmp = new THREE.Vector3()
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05)
  const k = 1 - Math.exp(-dt * 6)
  open += (openTarget - open) * k
  out += (outTarget - out) * k
  hinge.rotation.y = -ease(open) * THREE.MathUtils.degToRad(165)
  // disc path: lift straight off hub first, then forward/up, with tilt & spin
  const e = ease(out)
  const lift = Math.min(1, out * 3)
  tmp.lerpVectors(SEAT, OUT, e); tmp.z = Math.max(tmp.z, SEAT.z + lift * 0.06)
  disc.position.copy(tmp)
  disc.rotation.set(-e * 0.5, e * 0.6, disc.rotation.z + (out > 0.02 && out < 0.98 ? dt * 2 : 0))
  if (resetT) {
    camera.position.lerp(HOME, k); controls.target.lerp(new THREE.Vector3(0, 0.85, 0), k)
    if (camera.position.distanceTo(HOME) < 0.01) resetT = 0
  }
  if (Math.abs(open - openTarget) > 0.001) syncUI()
  controls.update()
  renderer.render(scene, camera)
}
renderer.setAnimationLoop(tick)
document.addEventListener('visibilitychange', () => renderer.setAnimationLoop(document.hidden ? null : tick))
addEventListener('pagehide', () => { renderer.setAnimationLoop(null); envRT.dispose(); renderer.dispose() })
syncUI()
const qs = new URLSearchParams(location.search)
if (qs.has('open')) { openTarget = open = 1; if (qs.has('disc')) outTarget = out = 1; syncUI() }
