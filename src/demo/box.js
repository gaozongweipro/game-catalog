import './box.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const BASE = import.meta.env.BASE_URL
const qs = new URLSearchParams(location.search)
const mobile = matchMedia('(pointer: coarse)').matches
const canvas = document.getElementById('c')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: qs.has('shot') })
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.75 : 2))
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.0
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

const scene = new THREE.Scene()
const pmrem = new THREE.PMREMGenerator(renderer)
const envRT = pmrem.fromScene(new RoomEnvironment(), 0.004)
scene.environment = envRT.texture
scene.environmentIntensity = 0.9
pmrem.dispose()

const camera = new THREE.PerspectiveCamera(35, 1, 0.02, 50)
const HOME = new THREE.Vector3(1.55, 1.05, 3.55)
const TARGET = new THREE.Vector3(0, 0.85, 0)
const DISC_HOME = new THREE.Vector3(0.15, 1.35, 2.35)
const DISC_TARGET = new THREE.Vector3(0.15, 1.15, 0.55)
camera.position.copy(HOME)
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
controls.minDistance = 0.5
controls.maxDistance = 7
controls.target.copy(TARGET)

const key = new THREE.DirectionalLight(0xfff1e0, 2.05)
key.position.set(2.5, 4.5, 3)
key.castShadow = true
key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048)
key.shadow.radius = 5
key.shadow.bias = -0.0004
key.shadow.normalBias = 0.01
Object.assign(key.shadow.camera, { left: -2.4, right: 2.4, top: 2.4, bottom: -1, near: 0.5, far: 12 })
scene.add(key)
const fill = new THREE.DirectionalLight(0xdcecff, 0.55); fill.position.set(-3, 2, -1); scene.add(fill)
const rim = new THREE.DirectionalLight(0xffffff, 0.95); rim.position.set(-1.5, 3, -4); scene.add(rim)

const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.18 }))
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground)
function blobTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(0.5, 'rgba(0,0,0,.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c)
}
const blob = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.5), new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false }))
blob.rotation.x = -Math.PI / 2; blob.position.y = 0.001; scene.add(blob)

// Real Blu-ray / PS5 keep case ≈ 135 × 171.5 × 13–14 mm. 1 unit = 100 mm.
const W = 1.35, H = 1.70, D = 0.135, T = 0.011, RC = 0.038
const INS_W = 1.29, INS_H = 1.62
const HALF = D / 2

const shellMat = new THREE.MeshPhysicalMaterial({
  color: 0x1c46a6, roughness: 0.26, metalness: 0, transmission: 0.62, thickness: 0.012, ior: 1.49,
  attenuationColor: new THREE.Color(0x12358a), attenuationDistance: 0.03, clearcoat: 0.35, clearcoatRoughness: 0.2,
  specularIntensity: 0.8, side: THREE.DoubleSide,
})
const trayMat = shellMat.clone()
trayMat.roughness = 0.38; trayMat.transmission = 0; trayMat.transparent = false; trayMat.color.set(0x1a3f97); trayMat.clearcoat = 0.12
const filmMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, roughness: 0.06, transmission: 1, thickness: 0.0004, ior: 1.49, metalness: 0, specularIntensity: 1, transparent: true, opacity: 1,
})
const paperMat = (map) => new THREE.MeshPhysicalMaterial({ map, roughness: 0.55, sheen: 0.2, sheenRoughness: 0.8 })
const bookletMat = new THREE.MeshPhysicalMaterial({ color: 0xf2efe8, roughness: 0.62, sheen: 0.15, sheenRoughness: 0.85 })

function rrect(w, h, r, x = 0, y = 0) {
  const s = new THREE.Shape(), hw = w / 2, hh = h / 2
  s.moveTo(x - hw + r, y - hh); s.lineTo(x + hw - r, y - hh); s.quadraticCurveTo(x + hw, y - hh, x + hw, y - hh + r)
  s.lineTo(x + hw, y + hh - r); s.quadraticCurveTo(x + hw, y + hh, x + hw - r, y + hh)
  s.lineTo(x - hw + r, y + hh); s.quadraticCurveTo(x - hw, y + hh, x - hw, y + hh - r)
  s.lineTo(x - hw, y - hh + r); s.quadraticCurveTo(x - hw, y - hh, x - hw + r, y - hh); return s
}
function rrPath(w, h, r) { const s = rrect(w, h, r); const p = new THREE.Path(); p.curves = s.curves; return p }
function plate(w, h, r, t, bevel = 0.0025) {
  const g = new THREE.ExtrudeGeometry(rrect(w - 2 * bevel, h - 2 * bevel, Math.max(0.002, r - bevel)), {
    depth: t - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 12 })
  g.translate(0, 0, bevel); return g
}
function ring(w, h, r, wall, t) {
  const s = rrect(w, h, r); s.holes.push(rrPath(w - 2 * wall, h - 2 * wall, Math.max(0.002, r - wall)))
  return new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 12 })
}
function arcSeg(r0, r1, a0, a1, t) {
  const s = new THREE.Shape(); s.absarc(0, 0, r1, a0, a1, false); s.absarc(0, 0, r0, a1, a0, true)
  return new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: true, bevelThickness: 0.0008, bevelSize: 0.0008, bevelSegments: 2, curveSegments: 28 })
}
function mesh(geo, mat, parent, cast = true) {
  const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m
}
/** U-shaped wall: top + bottom + opening (right) edge — spine side is open for the hinge. */
function uWall(w, h, r, wall, depth, openLeft = true) {
  const group = new THREE.Group()
  const top = mesh(new THREE.BoxGeometry(w - (openLeft ? wall : 0), wall, depth), shellMat, group)
  top.position.set(openLeft ? wall / 2 : 0, h / 2 - wall / 2, depth / 2)
  const bot = mesh(new THREE.BoxGeometry(w - (openLeft ? wall : 0), wall, depth), shellMat, group)
  bot.position.set(openLeft ? wall / 2 : 0, -h / 2 + wall / 2, depth / 2)
  // opening edge split around a shallow finger notch (mid-edge), notch face recessed inward
  const NG = 0.26, segH = (h - 2 * wall - NG) / 2
  for (const sy of [-1, 1]) {
    const side = mesh(new THREE.BoxGeometry(wall, segH, depth), shellMat, group)
    side.position.set(w / 2 - wall / 2, sy * (NG / 2 + segH / 2), depth / 2)
  }
  const notch = mesh(new THREE.BoxGeometry(wall, NG, depth), shellMat, group)
  notch.position.set(w / 2 - wall / 2 - 0.006, 0, depth / 2)
  for (const sy of [-1, 1]) { // tapered transitions
    const tp = mesh(new THREE.BoxGeometry(0.0085, 0.02, depth), shellMat, group, false)
    tp.position.set(w / 2 - wall / 2 - 0.003, sy * NG / 2, depth / 2); tp.rotation.z = sy * 0.5
  }
  // rounded corner plugs on the opening edge
  for (const sy of [-1, 1]) {
    const c = mesh(new THREE.CylinderGeometry(wall / 2, wall / 2, depth, 16), shellMat, group, false)
    c.rotation.x = Math.PI / 2
    c.position.set(w / 2 - wall / 2, sy * (h / 2 - wall / 2), depth / 2)
  }
  return group
}

const PX = 800
const img = new Image()
const loaded = new Promise((res) => { img.onload = res; img.onerror = res })
img.src = `${BASE}demo/cover.jpg`
function ctx(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')] }
function tex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t }
function drawCover(g, x, y, w, h, zoom = 1, fx = 0.5, fy = 0.5) {
  if (!img.width) { g.fillStyle = '#2b2b2b'; g.fillRect(x, y, w, h); return }
  const ar = w / h; let sw = img.width / zoom, sh = sw / ar
  if (sh > img.height / zoom) { sh = img.height / zoom; sw = sh * ar }
  g.drawImage(img, (img.width - sw) * fx, (img.height - sh) * fy, sw, sh, x, y, w, h)
}
function ps5Logo(g, x, y, size, color = '#000') {
  g.save(); g.fillStyle = color; g.font = `900 ${size}px "Helvetica Neue", Arial, "DejaVu Sans", sans-serif`; g.textBaseline = 'middle'
  try { g.letterSpacing = `${size * 0.06}px` } catch {}
  g.strokeStyle = color; g.lineWidth = size * 0.07; g.lineJoin = 'round'; g.strokeText('PS5', x, y); g.fillText('PS5', x, y); g.restore()
}
const BANNER = 118
function banner(g, w) {
  g.fillStyle = '#fff'; g.fillRect(0, 0, w, BANNER)
  g.fillStyle = '#0070d1'; g.fillRect(0, BANNER, w, 4)
  ps5Logo(g, 42, BANNER / 2 + 2, 66)
}
function ratingBox(g, x, y, s) {
  g.fillStyle = '#fff'; g.fillRect(x, y, s, s * 1.32); g.strokeStyle = '#000'; g.lineWidth = 4; g.strokeRect(x + 6, y + 6, s - 12, s * 1.32 - 12)
  g.fillStyle = '#000'; g.font = `800 ${s * 0.36}px Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText('CERO', x + s / 2, y + s * 0.34); g.font = `700 ${s * 0.2}px Arial`; g.fillText('RATING', x + s / 2, y + s * 0.82)
  g.textAlign = 'left'
}
const FRONT_W = INS_W * PX, FRONT_H = INS_H * PX, SPINE_W = Math.round((D - 0.004) * PX)
function frontTex() {
  const [c, g] = ctx(FRONT_W, FRONT_H)
  drawCover(g, 0, BANNER + 4, FRONT_W, FRONT_H - BANNER - 4)
  banner(g, FRONT_W); ratingBox(g, 38, FRONT_H - 190, 120); return tex(c)
}
function spineTex() {
  const [c, g] = ctx(SPINE_W, FRONT_H)
  const gr = g.createLinearGradient(0, 0, 0, FRONT_H); gr.addColorStop(0, '#1c1a1d'); gr.addColorStop(1, '#3a1013')
  g.fillStyle = gr; g.fillRect(0, 0, SPINE_W, FRONT_H)
  g.fillStyle = '#fff'; g.fillRect(0, 0, SPINE_W, BANNER + 40); g.fillStyle = '#0070d1'; g.fillRect(0, BANNER + 40, SPINE_W, 4)
  g.save(); g.translate(SPINE_W / 2, (BANNER + 40) / 2); g.textAlign = 'center'; ps5Logo(g, 0, 0, 38); g.restore()
  g.save(); g.translate(SPINE_W / 2 + 2, 230); g.rotate(Math.PI / 2); g.fillStyle = '#f3ede4'; g.textBaseline = 'middle'
  g.font = '600 46px "Noto Serif CJK SC","Songti SC",serif'; g.fillText('羊蹄山之魂', 0, 0)
  g.font = '500 30px "Times New Roman",serif'; g.fillText('GHOST OF YŌTEI', 270, 2); g.restore()
  ratingBox(g, (SPINE_W - 70) / 2, FRONT_H - 140, 70); return tex(c)
}
function barcode(g, x, y, w, h) {
  g.fillStyle = '#fff'; g.fillRect(x - 10, y - 10, w + 20, h + 46); g.fillStyle = '#000'
  let px = x, seed = 7
  while (px < x + w) { seed = (seed * 9301 + 49297) % 233280; const bw = 2 + (seed % 4) * 1.6; if (seed % 3) g.fillRect(px, y, bw, h); px += bw + 2 }
  g.font = '24px monospace'; g.fillText('4 948872 01633 0', x + 10, y + h + 26)
}
function backTex() {
  const [c, g] = ctx(FRONT_W, FRONT_H)
  g.fillStyle = '#121014'; g.fillRect(0, 0, FRONT_W, FRONT_H)
  drawCover(g, 0, BANNER, FRONT_W, 520, 2.2, 0.5, 0.12)
  const fade = g.createLinearGradient(0, BANNER + 300, 0, BANNER + 520); fade.addColorStop(0, 'rgba(18,16,20,0)'); fade.addColorStop(1, '#121014')
  g.fillStyle = fade; g.fillRect(0, BANNER, FRONT_W, 520)
  banner(g, FRONT_W)
  g.fillStyle = '#f4ece0'; g.font = '700 70px "Noto Serif CJK SC",serif'; g.fillText('羊蹄山之魂', 60, 600)
  g.fillStyle = '#c9a76a'; g.font = '500 28px "Times New Roman",serif'; g.fillText('GHOST OF YŌTEI', 64, 645)
  const lines = ['武者笃孤行于世，家仇未雪的她，誓报昔年灭门之恨。', '她将踏遍虾夷山川，追索仇寇六人。', '在幕府辖外的日本北境，纵横于刀锋之间。', '不止快意厮杀，在羊蹄山麓拼凑出笃不循常轨的命途。']
  g.fillStyle = '#ddd5c8'; g.font = '30px "Noto Sans CJK SC",sans-serif'; lines.forEach((l, i) => g.fillText(l, 60, 710 + i * 46))
  const sw = 290, sh = 164, sy = 905
  ;[[2.6, 0.15, 0.95], [3.2, 0.85, 0.75], [2.4, 0.5, 1.0]].forEach(([z, fx, fy], i) => {
    const sx = 60 + i * (sw + 31); drawCover(g, sx, sy, sw, sh, z, fx, fy); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; g.strokeRect(sx, sy, sw, sh)
  })
  g.fillStyle = '#fff'; g.fillRect(0, 1100, FRONT_W, FRONT_H - 1100)
  g.fillStyle = '#000'; g.font = '600 22px Arial'
  ;['1人', 'HDR', '4K', '3D AUDIO', 'DualSense'].forEach((t, i) => { const x = 60 + i * 132; g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(x, 1122, 118, 44); g.textAlign = 'center'; g.fillText(t, x + 59, 1152) })
  g.textAlign = 'left'; ratingBox(g, 60, 1186, 72)
  g.font = '15px "Noto Sans CJK SC",sans-serif'; g.fillStyle = '#333'
  ;['©2025 Sony Interactive Entertainment LLC. Ghost of Yōtei is a trademark of Sony Interactive Entertainment LLC.',
    '"PS5" and "PlayStation" are registered trademarks or trademarks of Sony Interactive Entertainment Inc.',
    '本游戏需要 PlayStation®5 主机。部分功能需要联网。'].forEach((l, i) => g.fillText(l, 150, 1205 + i * 22))
  barcode(g, FRONT_W - 300, 1180, 240, 60); return tex(c)
}
function discLabelTex() {
  const s = 1024, [c, g] = ctx(s, s)
  g.save(); g.beginPath(); g.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2); g.clip()
  drawCover(g, 0, 0, s, s)
  g.fillStyle = '#fff'; g.fillRect(0, 0, s, s * 0.2); g.fillStyle = '#0070d1'; g.fillRect(0, s * 0.2, s, 5)
  g.textAlign = 'center'; ps5Logo(g, s / 2, s * 0.13, 70)
  g.fillStyle = 'rgba(255,255,255,.9)'; g.font = '600 24px Arial'; g.fillText('PlayStation®5 · Blu-ray Disc™', s / 2, s * 0.86)
  g.font = '18px Arial'; g.fillText('CUSA-XXXXX  ©2025 Sony Interactive Entertainment LLC', s / 2, s * 0.9)
  g.restore(); return tex(c)
}
function bookletCoverTex() {
  const [c, g] = ctx(512, 720)
  g.fillStyle = '#1a1218'; g.fillRect(0, 0, 512, 720)
  drawCover(g, 0, 0, 512, 420, 1.6, 0.5, 0.2)
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 360, 512, 80)
  g.fillStyle = '#fff'; g.font = '700 36px "Noto Serif CJK SC",serif'; g.fillText('羊蹄山之魂', 28, 520)
  g.fillStyle = '#c9a76a'; g.font = '500 18px "Times New Roman",serif'; g.fillText('INSTRUCTION MANUAL', 30, 555)
  g.fillStyle = '#aaa'; g.font = '14px Arial'; g.fillText('PlayStation®5', 30, 680)
  return tex(c)
}

// ---- Build case: book hinge along SPINE (left), mid-thickness axis ----
const root = new THREE.Group(); scene.add(root)
root.position.y = H / 2 + 0.0005

// Back half (tray side) — fixed
const base = new THREE.Group(); root.add(base)
const backPlate = mesh(plate(W, H, RC, T), shellMat, base)
backPlate.position.z = -HALF
// Back walls only on the +Z side of the back plate (half depth toward midplane)
const backWalls = uWall(W - 0.004, H - 0.004, RC, T, HALF - T * 0.4, true)
backWalls.position.z = -HALF + T
base.add(backWalls)
// Sleeve weld lip on back outer face
const lipB = mesh(ring(W - 0.004, H - 0.004, RC - 0.002, 0.012, 0.0015), shellMat, base, false)
lipB.rotation.y = Math.PI; lipB.position.z = -HALF

// Tray on inner face of back
const TRAY_Z = -HALF + T
const DISC_Y = 0.08, DISC_X = 0.03
const tray = new THREE.Group(); tray.position.set(0, 0, TRAY_Z); base.add(tray)
for (let i = 0; i < 4; i++) {
  const a = i * Math.PI / 2 + 0.28
  mesh(arcSeg(0.608, 0.622, a, a + Math.PI / 2 - 0.56, 0.009), trayMat, tray).position.set(DISC_X, DISC_Y, 0)
}
const rib = new THREE.BoxGeometry(0.004, 0.16, 0.005)
for (const [x, y, n] of [[-0.56, 0.72, 4], [0.5, 0.72, 4], [-0.56, -0.66, 4], [0.5, -0.66, 4]]) {
  for (let i = 0; i < n; i++) mesh(rib, trayMat, tray, false).position.set(x + i * 0.018, y, 0.0025)
}

// Push-to-release hub: support ring + sprung teeth + centre button
const hub = new THREE.Group(); hub.position.set(DISC_X, DISC_Y, 0); tray.add(hub)
mesh(arcSeg(0.15, 0.2, 0, Math.PI * 2, 0.005), trayMat, hub)
mesh(arcSeg(0.098, 0.112, 0, Math.PI * 2, 0.012), trayMat, hub)
const teeth = []
const N = 12, gap = 0.09
for (let i = 0; i < N; i++) {
  const a0 = (i / N) * Math.PI * 2 + gap, a1 = ((i + 1) / N) * Math.PI * 2 - gap
  const mid = (a0 + a1) / 2
  const tooth = new THREE.Group(); hub.add(tooth); tooth.userData.angle = mid; teeth.push(tooth)
  const s = new THREE.Shape(); s.absarc(0, 0, 0.0755, a0, a1, false); s.absarc(0, 0, 0.05, a1, a0, true)
  mesh(new THREE.ExtrudeGeometry(s, { depth: 0.024, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.0015, bevelSegments: 3, curveSegments: 8 }), trayMat, tooth)
  const lipS = new THREE.Shape(); lipS.absarc(0, 0, 0.079, a0 + 0.04, a1 - 0.04, false); lipS.absarc(0, 0, 0.068, a1 - 0.04, a0 + 0.04, true)
  mesh(new THREE.ExtrudeGeometry(lipS, { depth: 0.003, bevelEnabled: false, curveSegments: 8 }), trayMat, tooth).position.z = 0.019
}
const btn = mesh(new THREE.CylinderGeometry(0.042, 0.045, 0.02, 40), trayMat, hub)
btn.rotation.x = Math.PI / 2; btn.position.z = 0.012; btn.name = 'hubBtn'
const btnHit = mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 24), new THREE.MeshBasicMaterial({ visible: false }), hub)
btnHit.rotation.x = Math.PI / 2; btnHit.position.z = 0.012; btnHit.name = 'hubBtn'

// ---- Living hinge: one-piece PP shell. Spine = flat strip between TWO parallel creases.
// crease A (back↔spine) at x=-W/2,z=-HALF ; crease B (spine↔cover) at x=-W/2,z=+HALF.
// Opening = strip folds 90° on crease A, cover folds another 90° on crease B → lies flat (book).
const spineG = new THREE.Group(); spineG.position.set(-W / 2, 0, -HALF); root.add(spineG)
const hinge = spineG
const CR = 0.0045 // crease width (thinned flex band)
// strip: local x∈[-T,0] (outer face at -T), z∈[CR, D-CR]
const strip = mesh(new THREE.BoxGeometry(T, H - 0.004, D - 2 * CR), shellMat, spineG)
strip.position.set(-T / 2, 0, D / 2)
// crease bands: thin flex webs (≈1/3 wall) sitting on the inner side, leaving visible grooves outside
for (const zc of [CR / 2, D - CR / 2]) {
  const web = mesh(new THREE.BoxGeometry(T * 0.38, H - 0.004, CR), shellMat, spineG, false)
  web.position.set(-T * 0.19, 0, zc)
}
// mould gate dots on spine interior (two, upper/lower)
for (const y of [0.24, -0.24]) {
  const dot = mesh(new THREE.CylinderGeometry(0.0085, 0.0085, 0.0016, 24), trayMat, spineG, false)
  dot.rotation.z = Math.PI / 2; dot.position.set(0.0006, y, D / 2)
}
// thin top/bottom lips on the strip (sleeve is open top & bottom → blue plastic shows)
for (const sy of [-1, 1]) {
  const l = mesh(new THREE.BoxGeometry(T * 0.9, 0.006, D - 2 * CR), shellMat, spineG, false)
  l.position.set(-T * 0.45, sy * (H / 2 - 0.006), D / 2)
}
const coverHinge = new THREE.Group(); coverHinge.position.set(0, 0, D); spineG.add(coverHinge)
const cover = new THREE.Group()
cover.position.set(W / 2, 0, -HALF) // keeps legacy cover-content z coordinates (centre-plane based)
coverHinge.add(cover)

const coverPlate = mesh(plate(W, H, RC, T), shellMat, cover)
coverPlate.position.z = HALF - T // outer front face when closed
const coverWalls = uWall(W - 0.004, H - 0.004, RC, T, HALF - T * 0.5, true)
coverWalls.rotation.x = Math.PI // keep notch/side on opening edge (+x), mirror into −z
coverWalls.position.z = HALF - T
cover.add(coverWalls)
// Inner locating lip that nests into back walls when closed
const lip = mesh(ring(W - 2 * T - 0.008, H - 2 * T - 0.008, RC - T, 0.005, 0.005), trayMat, cover)
lip.position.z = HALF - T - 0.006

// Opening-edge latch (right side when closed): recess + nub
// Small snap tabs either side of the notch (functional, ~4 mm) + matching catch bumps on tray half
for (const sy of [-1, 1]) {
  const nub = mesh(new THREE.BoxGeometry(0.004, 0.04, 0.012), shellMat, cover, false)
  nub.position.set(W / 2 - T - 0.004, sy * 0.2, HALF - T - 0.014)
  const cb = mesh(new THREE.BoxGeometry(0.004, 0.04, 0.008), shellMat, base, false)
  cb.position.set(W / 2 - T - 0.004, sy * 0.25, -HALF + T + 0.03)
}

// Booklet retainers — real keep-case style: moulded finger clips on INSIDE of front cover (left when open)
// Two pairs: upper/lower, each an L-shaped tab with inward lip that grips booklet edge
function bookletClip(parent, y) {
  // real case: raised square frame (≈19 mm) on cover interior near opening edge, with a U-shaped
  // cut-out tongue whose tip is raised to trap the booklet edge
  const g = new THREE.Group(); parent.add(g)
  const fr = mesh(ring(0.16, 0.17, 0.018, 0.012, 0.006), trayMat, g); fr.rotation.x = Math.PI
  const s = new THREE.Shape()
  s.moveTo(-0.05, -0.028); s.lineTo(0.035, -0.028); s.absarc(0.035, 0, 0.028, -Math.PI / 2, Math.PI / 2, false); s.lineTo(-0.05, 0.028); s.lineTo(-0.05, 0.014)
  s.lineTo(0.03, 0.014); s.absarc(0.03, 0, 0.014, Math.PI / 2, -Math.PI / 2, true); s.lineTo(-0.05, -0.014); s.closePath()
  const u = mesh(new THREE.ExtrudeGeometry(s, { depth: 0.004, bevelEnabled: false, curveSegments: 16 }), new THREE.MeshPhysicalMaterial({ color: 0xdfe8ff, roughness: 0.3, transmission: 0.3 }), g, false)
  u.rotation.x = Math.PI; u.position.set(0.01, 0, -0.002)
  const tongue = mesh(new THREE.BoxGeometry(0.07, 0.024, 0.003), trayMat, g, false); tongue.position.set(-0.01, 0, -0.008); tongue.rotation.y = 0.12
  g.position.set(W / 2 - T - 0.12, y, HALF - T)
  return g
}
for (const y of [0.6, -0.6]) bookletClip(cover, y)

// Thin instruction booklet held under the clips
const booklet = new THREE.Group(); cover.add(booklet)
const bkW = 1.05, bkH = 1.48, bkT = 0.012
const bkFront = mesh(new THREE.BoxGeometry(bkW, bkH, bkT), bookletMat, booklet)
booklet.position.set(0.02, 0, HALF - T - 0.022)
// page-edge sheen
mesh(new THREE.BoxGeometry(bkW * 0.98, bkH * 0.98, bkT * 0.35), new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.75 }), booklet, false).position.z = -bkT * 0.15
const bkPaper = paperMat(null)
// Plane faces +Z by default; flip so art faces into the case (−Z when closed = toward tray when open)
const bkFace = mesh(new THREE.PlaneGeometry(bkW - 0.02, bkH - 0.02), bkPaper, booklet, false)
bkFace.rotation.y = Math.PI
bkFace.position.z = -bkT / 2 - 0.0005

// Printed insert + clear sleeve
const frontPaper = paperMat(null), backPaper = paperMat(null), spinePaper = paperMat(null)
const insF = mesh(new THREE.PlaneGeometry(INS_W, INS_H), frontPaper, cover, false)
insF.position.z = HALF + 0.0008
const filmF = mesh(plate(W - 0.002, H - 0.002, RC, 0.0012, 0.0005), filmMat, cover, false)
filmF.position.z = HALF + 0.0014
const insB = mesh(new THREE.PlaneGeometry(INS_W, INS_H), backPaper, base, false)
insB.rotation.y = Math.PI; insB.position.z = -HALF - 0.0012
const filmB = mesh(plate(W - 0.002, H - 0.002, RC, 0.0012, 0.0005), filmMat, base, false)
filmB.position.z = -HALF - 0.0028
// spine print rides on the strip; clear sleeve is ONE wrap: front + spine + back, with rounded
// film bends over both creases, open at top & bottom (insert slides in from there)
const insS = mesh(new THREE.PlaneGeometry(D - 0.004, INS_H), spinePaper, spineG, false)
insS.rotation.y = -Math.PI / 2; insS.position.set(-T - 0.0012, 0, D / 2)
const filmS = mesh(new THREE.PlaneGeometry(D - 0.006, INS_H + 0.03), filmMat, spineG, false)
filmS.rotation.y = -Math.PI / 2; filmS.position.set(-T - 0.0028, 0, D / 2)
const bendGeo = new THREE.CylinderGeometry(0.0055, 0.0055, INS_H + 0.03, 10, 1, true, 0, Math.PI / 2)
const bendA = mesh(bendGeo, filmMat, spineG, false); bendA.position.set(-T + 0.0027, 0, 0.0027); bendA.rotation.y = Math.PI
const bendB = mesh(bendGeo, filmMat, spineG, false); bendB.position.set(-T + 0.0027, 0, D - 0.0027); bendB.rotation.y = -Math.PI / 2

// Disc
const R = 0.6, rH = 0.075, DT = 0.012
const disc = new THREE.Group(); scene.add(disc) // world-space so browse mode is independent of case
const dataMat = new THREE.MeshPhysicalMaterial({ color: 0xc4c8e4, metalness: 1, roughness: 0.07, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [250, 950], side: THREE.DoubleSide })
const mirrorMat = new THREE.MeshPhysicalMaterial({ color: 0xe8eaf2, metalness: 1, roughness: 0.04, side: THREE.DoubleSide })
const clearMat = new THREE.MeshPhysicalMaterial({ color: 0xdfe6f0, roughness: 0.06, transparent: true, opacity: 0.22, ior: 1.58, specularIntensity: 1, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false })
const labelMat = new THREE.MeshPhysicalMaterial({ roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.3 })
const discPick = []
function discRing(r0, r1, mat, z, flip) {
  const m = mesh(new THREE.RingGeometry(r0, r1, 128, 1), mat, disc, false); m.position.z = z; if (flip) m.rotation.y = Math.PI; discPick.push(m); return m
}
discRing(0.23, R - 0.002, dataMat, 0, true)
discRing(0.17, 0.23, mirrorMat, 0, true)
discRing(rH, 0.17, clearMat, 0, true)
const labelRing = discRing(0.17, R - 0.002, labelMat, DT, false)
discRing(rH, 0.17, clearMat, DT, false)
{ const uv = labelRing.geometry.attributes.uv, p = labelRing.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / (2 * R) + 0.5, p.getY(i) / (2 * R) + 0.5) }
const edgeO = mesh(new THREE.CylinderGeometry(R, R, DT, 128, 1, true), clearMat, disc); edgeO.rotation.x = Math.PI / 2; edgeO.position.z = DT / 2; discPick.push(edgeO)
const edgeI = mesh(new THREE.CylinderGeometry(rH, rH, DT, 64, 1, true), clearMat, disc, false); edgeI.rotation.x = Math.PI / 2; edgeI.position.z = DT / 2
mesh(new THREE.TorusGeometry(0.168, 0.0025, 8, 96), clearMat, disc, false).position.z = DT
const shadowDisc = mesh(new THREE.CircleGeometry(R, 64), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }), disc); shadowDisc.position.z = DT / 2

// Seat position: on hub, just above tray (in root/base local → world via root)
function seatWorld(out = new THREE.Vector3()) {
  return out.set(DISC_X, DISC_Y, TRAY_Z + 0.005).applyMatrix4(root.matrixWorld)
}
const _seat = new THREE.Vector3()
const FLOAT = new THREE.Vector3(0.15, 1.15, 0.55) // disc-focus hover point (world)
disc.position.copy(seatWorld(_seat))

loaded.then(() => {
  frontPaper.map = frontTex(); backPaper.map = backTex(); spinePaper.map = spineTex()
  labelMat.map = discLabelTex(); bkPaper.map = bookletCoverTex()
  ;[frontPaper, backPaper, spinePaper, labelMat, bkPaper].forEach((m) => (m.needsUpdate = true))
})

// ---- State machine ----
// open: 0 closed … 1 book-open (~170° around spine Y)
// hubPress: 0 idle … 1 fully depressed (teeth retracted)
// out: 0 seated … 1 released/lifted (then discFocus)
let open = 0, openTarget = 0
let hubPress = 0, hubPressTarget = 0
let out = 0, outTarget = 0
let discFocus = false
let focusDismissed = false
let discSpin = 0 // user-driven extra rotation while browsing
let resetT = 0
const caseMats = [shellMat, trayMat, filmMat, frontPaper, backPaper, spinePaper, bookletMat, bkPaper]

function q(id) { return document.getElementById(id) }
const ui = { bOpen: q('bOpen'), bDisc: q('bDisc'), bBrowse: q('bBrowse'), bReset: q('bReset'), lang: q('lang') }
let lang = localStorage.getItem('game-catalog-lang') === 'en' ? 'en' : 'zh'
const T_ = {
  zh: {
    h1: 'PS5 游戏盒', sub: '羊蹄山之魂 · 书脊对开 · 按压卡扣取盘',
    open: '打开盒子', close: '合上盒子',
    take: '按压卡扣取盘', put: '放回盒子',
    browse: '查看光盘', exitBrowse: '退出查看',
    reset: '复位视角',
    hint: '拖动旋转 · 双指缩放 · 点封面开盒 · 按压中心卡扣取盘',
    hintBrowse: '拖动旋转查看光盘正反面 · 点「放回盒子」归位',
    back: '← 返回目录', lang: 'EN',
  },
  en: {
    h1: 'PS5 Game Case', sub: 'Ghost of Yōtei · book-hinge · press hub to release',
    open: 'Open case', close: 'Close case',
    take: 'Press hub to release', put: 'Reseat disc',
    browse: 'Inspect disc', exitBrowse: 'Exit inspect',
    reset: 'Reset view',
    hint: 'Drag to orbit · pinch zoom · tap cover to open · press centre hub to release',
    hintBrowse: 'Orbit to inspect both sides · tap Reseat to return',
    back: '← Back to catalog', lang: '中文',
  },
}
function syncUI() {
  const t = T_[lang]
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN'
  q('h1').textContent = t.h1
  q('sub').textContent = discFocus ? (lang === 'zh' ? '单独浏览光盘 · 可看正反面' : 'Disc focus · inspect both sides') : t.sub
  q('hint').textContent = discFocus ? t.hintBrowse : t.hint
  q('back').textContent = t.back
  ui.lang.textContent = t.lang
  ui.bReset.textContent = t.reset
  ui.bOpen.textContent = openTarget ? t.close : t.open
  ui.bOpen.disabled = !!(outTarget || out > 0.02 || discFocus || hubPressTarget)
  ui.bDisc.textContent = (outTarget || discFocus) ? t.put : t.take
  ui.bDisc.disabled = !(openTarget && open > 0.65) && !discFocus && !(out > 0.5)
  // Browse toggles disc-focus when disc is already out
  ui.bBrowse.classList.toggle('hidden', !(out > 0.85 || discFocus))
  ui.bBrowse.disabled = out < 0.85 && !discFocus
  ui.bBrowse.textContent = discFocus ? t.exitBrowse : t.browse
  document.body.classList.toggle('disc-focus', discFocus)
}
function canOpen() { return !(outTarget || out > 0.02 || discFocus || hubPressTarget) }
function toggleOpen() {
  if (!canOpen()) return
  openTarget = openTarget ? 0 : 1
  syncUI()
}
function pressHubRelease() {
  if (discFocus) { reseatDisc(); return }
  if (outTarget || out > 0.5) { reseatDisc(); return }
  if (!openTarget || open < 0.65) return
  // Primary action: depress hub → retract teeth → lift disc → enter focus
  hubPressTarget = 1
  syncUI()
}
function enterDiscFocus() {
  if (out < 0.85) return
  discFocus = true
  focusDismissed = false
  resetT = 0
  syncUI()
}
function exitDiscFocus() {
  discFocus = false
  focusDismissed = true
  syncUI()
}
function reseatDisc() {
  discFocus = false
  focusDismissed = false
  outTarget = 0
  hubPressTarget = 0
  syncUI()
}
ui.bOpen.onclick = toggleOpen
ui.bDisc.onclick = pressHubRelease
ui.bBrowse.onclick = () => { if (discFocus) exitDiscFocus(); else enterDiscFocus() }
ui.lang.onclick = () => { lang = lang === 'en' ? 'zh' : 'en'; try { localStorage.setItem('game-catalog-lang', lang) } catch {}; syncUI() }
ui.bReset.onclick = () => { resetT = 1 }
q('back').href = BASE

const ray = new THREE.Raycaster(), ptr = new THREE.Vector2()
let downAt = null
function isHub(o) {
  let p = o
  while (p) { if (p === hub || p.name === 'hubBtn') return true; p = p.parent }
  return false
}
function isCover(o) {
  let p = o
  while (p) { if (p === cover || p === spineG) return true; p = p.parent }
  return false
}
function isDisc(o) {
  let p = o
  while (p) { if (p === disc) return true; p = p.parent }
  return false
}
canvas.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY] })
canvas.addEventListener('pointerup', (e) => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 8) return
  ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1)
  ray.setFromCamera(ptr, camera)
  const hits = ray.intersectObjects([btnHit, btn, ...teeth.flatMap((t) => t.children), ...discPick, shadowDisc, coverPlate, ...cover.children, ...base.children, ...spineG.children], true)
  if (!hits.length) return
  const o = hits[0].object
  if (discFocus) {
    if (isHub(o)) reseatDisc()
    return
  }
  if (isHub(o) && open > 0.65) { pressHubRelease(); return }
  if (isDisc(o) && open > 0.65 && !outTarget) {
    // Secondary only: tapping disc face also triggers hub press (not primary path)
    pressHubRelease(); return
  }
  if (isCover(o) && canOpen()) { toggleOpen(); return }
  if (!openTarget && canOpen()) toggleOpen()
})

function resize() {
  const w = innerWidth, h = innerHeight
  renderer.setSize(w, h, false); camera.aspect = w / h
  camera.fov = w / h < 0.8 ? 48 : 35
  camera.updateProjectionMatrix()
}
addEventListener('resize', resize); resize()

const easeIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const step = (v, t, dt, dur) => (t > v ? Math.min(t, v + dt / dur) : Math.max(t, v - dt / dur))
const HINGE_MAX = THREE.MathUtils.degToRad(178) // book open — almost flat
const clock = new THREE.Clock()
const _lift = new THREE.Vector3()
const _tmp = new THREE.Vector3()
let releaseArmed = false

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05)
  open = step(open, openTarget, dt, 0.95)
  hubPress = step(hubPress, hubPressTarget, dt, 0.28)

  // After hub fully pressed, release disc
  if (hubPressTarget === 1 && hubPress > 0.92 && !outTarget && !releaseArmed) {
    releaseArmed = true
    focusDismissed = false
    outTarget = 1
  }
  if (hubPressTarget === 0) releaseArmed = false

  out = step(out, outTarget, dt, 1.05)

  // Auto-enter disc focus once disc has lifted clear (unless user dismissed or screenshot mode)
  if (outTarget === 1 && out > 0.92 && !discFocus && !focusDismissed && !qs.has('shot')) {
    discFocus = true
    syncUI()
  }

  // Book hinge: cover swings sideways around spine Y
  const oe = easeIO(open)
  spineG.rotation.y = -oe * HINGE_MAX / 2
  coverHinge.rotation.y = -oe * HINGE_MAX / 2

  // Hub teeth retract radially + button sinks when pressed
  const pressE = easeIO(hubPress)
  btn.position.z = 0.012 - pressE * 0.014
  btnHit.position.z = btn.position.z
  for (const tooth of teeth) {
    const a = tooth.userData.angle
    const retract = pressE * 0.028
    tooth.position.set(-Math.cos(a) * retract, -Math.sin(a) * retract, 0)
    tooth.scale.setScalar(1 - pressE * 0.14)
  }

  // Disc placement
  root.updateMatrixWorld(true)
  seatWorld(_seat)
  const e = easeIO(out)
  // Path: seat → lift above hub → float to browse point
  _lift.copy(_seat).add(new THREE.Vector3(0.05, 0.12, 0.35))
  if (e < 0.35) {
    // pop off hub
    const k = e / 0.35
    disc.position.lerpVectors(_seat, _lift, easeIO(k))
    disc.rotation.set(-k * 0.15, k * 0.1, 0)
  } else {
    const k = (e - 0.35) / 0.65
    disc.position.lerpVectors(_lift, FLOAT, easeIO(k))
    if (discFocus) {
      // gentle idle tumble so both label and data side can be inspected while orbiting
      discSpin += dt * 0.25
      const baseY = qs.has('spin') ? Number(qs.get('spin')) || Math.PI : 0.55
      disc.rotation.set(0.55 + Math.sin(discSpin) * 0.12, baseY + discSpin * 0.35, Math.sin(discSpin * 0.55) * 0.18)
    } else {
      disc.rotation.set(-0.35 - k * 0.2, 0.55 + k * 0.4, 0.15)
    }
  }
  if (out < 0.01) {
    disc.position.copy(_seat)
    disc.rotation.set(0, 0, 0)
    discSpin = 0
    if (hubPressTarget === 0 && hubPress > 0 && outTarget === 0) {
      // teeth already expanding via hubPress step
    }
    if (outTarget === 0 && hubPressTarget !== 0 && out < 0.02) hubPressTarget = 0
  }

  // Dim case while browsing disc
  const dim = discFocus ? 0.35 : 1
  shellMat.opacity = 1 // physical mats use color intensity via env
  scene.environmentIntensity = discFocus ? 0.55 : 0.9
  key.intensity = discFocus ? 1.2 : 2.05
  root.visible = true
  root.traverse((o) => {
    if (o.isMesh && o.material && o.material.color && o.parent !== disc) {
      // soft dim via material emissive trick — skip; instead scale env
    }
  })
  // Slightly push case back visually when focusing disc
  root.position.x = discFocus ? -0.35 : 0
  root.position.y = H / 2 + 0.0005

  // Camera targets
  const camGoal = discFocus ? DISC_HOME : HOME
  const tgtGoal = discFocus ? DISC_TARGET : TARGET
  if (resetT || discFocus || (!discFocus && resetT === 0 && qs.has('shot'))) {
    // when entering/leaving focus, ease camera
  }
  if (resetT) {
    const k = 1 - Math.exp(-dt * 6)
    camera.position.lerp(HOME, k); controls.target.lerp(TARGET, k)
    if (camera.position.distanceTo(HOME) < 0.015) resetT = 0
  } else if (discFocus) {
    const k = 1 - Math.exp(-dt * 2.8)
    controls.target.lerp(DISC_TARGET, k)
    // gentle pull toward a good inspect angle without fighting the user hard
    if (camera.position.distanceTo(DISC_HOME) > 1.2) camera.position.lerp(DISC_HOME, k * 0.25)
    controls.minDistance = 0.35
    controls.maxDistance = 3.5
  } else {
    controls.minDistance = 0.5
    controls.maxDistance = 7
    if (open > 0.3 && out < 0.1) {
      // nudge target slightly left so open book is framed
      _tmp.set(-0.35 * open, 0.85, 0)
      controls.target.lerp(_tmp, 1 - Math.exp(-dt * 1.5))
    } else {
      controls.target.lerp(TARGET, 1 - Math.exp(-dt * 1.2))
    }
  }

  const uiDirty = (open !== openTarget) || (out !== outTarget) || (hubPress !== hubPressTarget)
  if (uiDirty || (outTarget === 1 && out > 0.9)) syncUI()

  controls.update()
  renderer.render(scene, camera)
}
renderer.setAnimationLoop(tick)
document.addEventListener('visibilitychange', () => renderer.setAnimationLoop(document.hidden ? null : tick))
addEventListener('pagehide', () => { renderer.setAnimationLoop(null); envRT.dispose(); renderer.dispose() })
syncUI()

// Query helpers for screenshots / deep links
if (qs.has('open')) { openTarget = open = 1 }
if (qs.has('hub')) { openTarget = open = 1; hubPressTarget = hubPress = Number(qs.get('hub')) || 0.55 }
if (qs.has('disc')) {
  openTarget = open = 1; hubPressTarget = hubPress = 1; outTarget = out = 1; releaseArmed = true
  if (qs.get('disc') !== 'lift') discFocus = true
}
if (qs.has('cam')) {
  const [x, y, z, tx, ty, tz] = qs.get('cam').split(',').map(Number)
  camera.position.set(x, y, z)
  if (!isNaN(tx)) controls.target.set(tx, ty, tz)
}
if (qs.has('spin')) {
  const s = Number(qs.get('spin')) || Math.PI
  discSpin = s
  disc.rotation.set(0.2, s, 0.1)
}
syncUI()
