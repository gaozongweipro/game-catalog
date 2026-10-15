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
const envRT = pmrem.fromScene(new RoomEnvironment(), 0.005) // sharp reflections to sell gloss
scene.environment = envRT.texture
scene.environmentIntensity = 0.85
pmrem.dispose()

const camera = new THREE.PerspectiveCamera(35, 1, 0.02, 50)
const HOME = new THREE.Vector3(1.6, 1.15, 3.6)
const TARGET = new THREE.Vector3(0, 0.85, 0)
camera.position.copy(HOME)
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
controls.minDistance = 0.6
controls.maxDistance = 7
controls.target.copy(TARGET)

// Lights: warm key (shadows), cool fill, rim for edge highlights
const key = new THREE.DirectionalLight(0xfff1e0, 2.0)
key.position.set(2.5, 4.5, 3)
key.castShadow = true
key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048)
key.shadow.radius = 5
key.shadow.bias = -0.0004
key.shadow.normalBias = 0.01
Object.assign(key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -1, near: 0.5, far: 12 })
scene.add(key)
const fill = new THREE.DirectionalLight(0xdcecff, 0.6); fill.position.set(-3, 2, -1); scene.add(fill)
const rim = new THREE.DirectionalLight(0xffffff, 0.9); rim.position.set(-1.5, 3, -4); scene.add(rim)

const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.18 }))
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground)
// soft contact shadow blob
function blobTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(0.5, 'rgba(0,0,0,.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c)
}
const blob = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.5), new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false }))
blob.rotation.x = -Math.PI / 2; blob.position.y = 0.001; scene.add(blob)

// ---- Real dimensions (1 unit = 100 mm). PS5 keep case 135 × 170 × 14 mm, PP shell ~1.1 mm.
const W = 1.35, H = 1.70, D = 0.14, T = 0.011, RC = 0.04
const INS_W = 1.29, INS_H = 1.62 // printed insert panel (inside the clear pocket)

// ---- Materials
const shellMat = new THREE.MeshPhysicalMaterial({ // transparent-blue polypropylene
  color: 0x1c46a6, roughness: 0.26, metalness: 0, transmission: 0.62, thickness: 0.012, ior: 1.49,
  attenuationColor: new THREE.Color(0x12358a), attenuationDistance: 0.03, clearcoat: 0.35, clearcoatRoughness: 0.2,
  specularIntensity: 0.8, side: THREE.DoubleSide,
})
const trayMat = shellMat.clone(); trayMat.roughness = 0.4; trayMat.transmission = 0; trayMat.transparent = false; trayMat.color.set(0x1a3f97); trayMat.clearcoat = 0.1 // satin moulded tray
const filmMat = new THREE.MeshPhysicalMaterial({ // clear PP sleeve: almost invisible, only Fresnel reflections
  color: 0xffffff, roughness: 0.06, transmission: 1, thickness: 0.0004, ior: 1.49, metalness: 0, specularIntensity: 1, transparent: true, opacity: 1,
})
const paperMat = (map) => new THREE.MeshPhysicalMaterial({ map, roughness: 0.55, sheen: 0.2, sheenRoughness: 0.8 })

// ---- Geometry helpers
function rrect(w, h, r, x = 0, y = 0) {
  const s = new THREE.Shape(), hw = w / 2, hh = h / 2
  s.moveTo(x - hw + r, y - hh); s.lineTo(x + hw - r, y - hh); s.quadraticCurveTo(x + hw, y - hh, x + hw, y - hh + r)
  s.lineTo(x + hw, y + hh - r); s.quadraticCurveTo(x + hw, y + hh, x + hw - r, y + hh)
  s.lineTo(x - hw + r, y + hh); s.quadraticCurveTo(x - hw, y + hh, x - hw, y + hh - r)
  s.lineTo(x - hw, y - hh + r); s.quadraticCurveTo(x - hw, y - hh, x - hw + r, y - hh); return s
}
function rrPath(w, h, r) { const s = rrect(w, h, r); const p = new THREE.Path(); p.curves = s.curves; return p }
function plate(w, h, r, t, bevel = 0.0025) { // filleted slab, z in [0, t]
  const g = new THREE.ExtrudeGeometry(rrect(w - 2 * bevel, h - 2 * bevel, Math.max(0.002, r - bevel)), {
    depth: t - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 10 })
  g.translate(0, 0, bevel); return g
}
function ring(w, h, r, wall, t) { // rounded-rect wall loop
  const s = rrect(w, h, r); s.holes.push(rrPath(w - 2 * wall, h - 2 * wall, Math.max(0.002, r - wall)))
  return new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 10 })
}
function arcSeg(r0, r1, a0, a1, t) {
  const s = new THREE.Shape(); s.absarc(0, 0, r1, a0, a1, false); s.absarc(0, 0, r0, a1, a0, true)
  return new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: true, bevelThickness: 0.0008, bevelSize: 0.0008, bevelSegments: 2, curveSegments: 24 })
}
function mesh(geo, mat, parent, cast = true) { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m }

// ---- Print textures (insert = back | spine | front, like the real wrap sheet)
const PX = 800 // px per unit (8 px/mm)
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
function ps5Logo(g, x, y, size, color = '#000') { // geometric PS5 wordmark approximation
  g.save(); g.fillStyle = color; g.font = `900 ${size}px "Helvetica Neue", Arial, "DejaVu Sans", sans-serif`; g.textBaseline = 'middle'
  try { g.letterSpacing = `${size * 0.06}px` } catch {}
  g.strokeStyle = color; g.lineWidth = size * 0.07; g.lineJoin = 'round'; g.strokeText('PS5', x, y); g.fillText('PS5', x, y); g.restore()
}
const BANNER = 118
function banner(g, w) {
  g.fillStyle = '#fff'; g.fillRect(0, 0, w, BANNER)
  g.fillStyle = '#0070d1'; g.fillRect(0, BANNER, w, 4) // thin blue rule under the white header
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
  banner(g, FRONT_W)
  ratingBox(g, 38, FRONT_H - 190, 120)
  return tex(c)
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
  ratingBox(g, (SPINE_W - 70) / 2, FRONT_H - 140, 70)
  return tex(c)
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
  // three "screenshots" with thin white keylines
  const sw = 290, sh = 164, sy = 905
  ;[[2.6, 0.15, 0.95], [3.2, 0.85, 0.75], [2.4, 0.5, 1.0]].forEach(([z, fx, fy], i) => {
    const sx = 60 + i * (sw + 31); drawCover(g, sx, sy, sw, sh, z, fx, fy); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; g.strokeRect(sx, sy, sw, sh)
  })
  // info panel (players / resolution etc.) & legal strip
  g.fillStyle = '#fff'; g.fillRect(0, 1100, FRONT_W, FRONT_H - 1100)
  g.fillStyle = '#000'; g.font = '600 22px Arial'
  ;['1人', 'HDR', '4K', '3D AUDIO', 'DualSense'].forEach((t, i) => { const x = 60 + i * 132; g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(x, 1122, 118, 44); g.textAlign = 'center'; g.fillText(t, x + 59, 1152) })
  g.textAlign = 'left'; ratingBox(g, 60, 1186, 72)
  g.font = '15px "Noto Sans CJK SC",sans-serif'; g.fillStyle = '#333'
  ;['©2025 Sony Interactive Entertainment LLC. Ghost of Yōtei is a trademark of Sony Interactive Entertainment LLC.',
    '"PS5" and "PlayStation" are registered trademarks or trademarks of Sony Interactive Entertainment Inc.',
    '本游戏需要 PlayStation®5 主机。部分功能需要联网。'].forEach((l, i) => g.fillText(l, 150, 1205 + i * 22))
  barcode(g, FRONT_W - 300, 1180, 240, 60)
  return tex(c)
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
function aoTex() { // baked AO for tray: darker in corners, along walls and around the hub
  const w = 512, h = 640, [c, g] = ctx(w, h)
  g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h)
  const edge = (x0, y0, x1, y1) => { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); return gr }
  const e = 34
  g.fillStyle = edge(0, 0, e, 0); g.fillRect(0, 0, e, h); g.fillStyle = edge(w, 0, w - e, 0); g.fillRect(w - e, 0, e, h)
  g.fillStyle = edge(0, 0, 0, e); g.fillRect(0, 0, w, e); g.fillStyle = edge(0, h, 0, h - e); g.fillRect(0, h - e, w, e)
  const cx = w / 2 + 0.02 / W * w, cy = h / 2 - DISC_Y / H * h, rr = 0.6 * w / W
  let gr = g.createRadialGradient(cx, cy, rr * 0.96, cx, cy, rr * 1.06); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, 'rgba(0,0,0,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = gr; g.fillRect(0, 0, w, h)
  gr = g.createRadialGradient(cx, cy, rr * 0.12, cx, cy, rr * 0.34); gr.addColorStop(0, 'rgba(0,0,0,.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = gr; g.fillRect(0, 0, w, h)
  return new THREE.CanvasTexture(c)
}

// ---- Build case
const root = new THREE.Group(); scene.add(root)
root.position.y = H / 2 + 0.0005
const base = new THREE.Group(); root.add(base)
// back plate + perimeter wall (top/bottom/opening edge/spine)
mesh(plate(W, H, RC, T), shellMat, base).position.z = -D / 2
const wall = mesh(ring(W, H, RC, T, D - 2 * T), shellMat, base); wall.position.z = -D / 2 + T
// spine: two shallow moulded ridges along the hinge side (outside, under the sleeve)
for (const zz of [-D * 0.28, D * 0.28]) mesh(new THREE.CylinderGeometry(0.0022, 0.0022, H - 0.12, 8), shellMat, base).position.set(-W / 2 - 0.0005, 0, zz)
// sleeve pocket lip: thin raised border on back where the clear film is welded
const lipB = mesh(ring(W - 0.004, H - 0.004, RC - 0.002, 0.012, 0.0015), shellMat, base, false); lipB.rotation.y = Math.PI; lipB.position.z = -D / 2

// Tray (on inner face of back plate)
const TRAY_Z = -D / 2 + T
const DISC_Y = 0.1, DISC_X = 0.02
const tray = new THREE.Group(); tray.position.set(0, 0, TRAY_Z); base.add(tray)
const ao = new THREE.Mesh(new THREE.PlaneGeometry(W - 2 * T, H - 2 * T), new THREE.MeshBasicMaterial({ map: aoTex(), transparent: true, depthWrite: false, color: 0x000000, alphaMap: null }))
ao.material.map = null; ao.material.alphaMap = aoTex(); ao.position.z = 0.0006; tray.add(ao)
// disc well: four raised arc segments just outside the 120 mm disc
for (let i = 0; i < 4; i++) {
  const a = i * Math.PI / 2 + 0.28
  mesh(arcSeg(0.608, 0.622, a, a + Math.PI / 2 - 0.56, 0.009), trayMat, tray).position.set(DISC_X, DISC_Y, 0)
}
// hub: support ring, 12 sprung teeth, centre push button
const hub = new THREE.Group(); hub.position.set(DISC_X, DISC_Y, 0); tray.add(hub)
mesh(arcSeg(0.15, 0.2, 0, Math.PI * 2, 0.005), trayMat, hub)
mesh(arcSeg(0.098, 0.112, 0, Math.PI * 2, 0.012), trayMat, hub)
const N = 12, gap = 0.09
for (let i = 0; i < N; i++) {
  const a0 = (i / N) * Math.PI * 2 + gap, a1 = ((i + 1) / N) * Math.PI * 2 - gap
  const s = new THREE.Shape(); s.absarc(0, 0, 0.0755, a0, a1, false); s.absarc(0, 0, 0.05, a1, a0, true)
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.024, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.0015, bevelSegments: 3, curveSegments: 8 })
  mesh(g, trayMat, hub)
  // gripping lip that overhangs the disc hole
  mesh(new THREE.ExtrudeGeometry((() => { const q = new THREE.Shape(); q.absarc(0, 0, 0.079, a0 + 0.04, a1 - 0.04, false); q.absarc(0, 0, 0.068, a1 - 0.04, a0 + 0.04, true); return q })(), { depth: 0.003, bevelEnabled: false, curveSegments: 8 }), trayMat, hub).position.z = 0.019
}
const btn = mesh(new THREE.CylinderGeometry(0.042, 0.045, 0.02, 40), trayMat, hub); btn.rotation.x = Math.PI / 2; btn.position.z = 0.012
// moulded ribs in the corners and below the disc
const rib = new THREE.BoxGeometry(0.004, 0.16, 0.005)
for (const [x, y, n] of [[-0.56, 0.72, 4], [0.5, 0.72, 4], [-0.56, -0.66, 4], [0.5, -0.66, 4]]) for (let i = 0; i < n; i++) mesh(rib, trayMat, tray, false).position.set(x + i * 0.018, y, 0.0025)
// booklet tabs on the back tray (left side, near spine)
for (const y of [0.45, -0.45]) mesh(plate(0.03, 0.1, 0.008, 0.016, 0.002), trayMat, tray).position.set(-W / 2 + T + 0.02, y, 0)

// ---- Front cover, hinged on spine edge
const hinge = new THREE.Group(); hinge.position.set(-W / 2, 0, D / 2 - T / 2); root.add(hinge)
const cover = new THREE.Group(); cover.position.set(W / 2, 0, 0); hinge.add(cover)
const coverPlate = mesh(plate(W, H, RC, T), shellMat, cover); coverPlate.position.z = -T / 2
// inner locating lip that seats inside the wall when closed
const lip = mesh(ring(W - 2 * T - 0.004, H - 2 * T - 0.004, RC - T, 0.006, 0.006), trayMat, cover); lip.position.z = -T / 2 - 0.006
// inner booklet clips (pair of small hooks)
for (const y of [0.55, -0.55]) { const c = mesh(plate(0.05, 0.03, 0.006, 0.01, 0.0015), trayMat, cover); c.position.set(-W / 2 + 0.1, y, -T / 2 - 0.01) }
// closing latch nub on opening edge
mesh(plate(0.012, 0.18, 0.005, 0.02, 0.002), trayMat, cover).position.set(W / 2 - T - 0.012, 0, -T / 2 - 0.02)

// hinge knuckles alternating cover / base around the pin axis
const knuckleGeo = new THREE.CylinderGeometry(0.0085, 0.0085, 0.16, 20)
for (let i = 0; i < 7; i++) {
  const y = -H / 2 + 0.16 + i * ((H - 0.32) / 6)
  const k = mesh(knuckleGeo, shellMat, i % 2 ? hinge : root); k.position.set(i % 2 ? 0.006 : -W / 2 + 0.006, y, i % 2 ? -0.004 : D / 2 - T / 2 - 0.004)
}

// ---- Printed insert + clear sleeve film
const frontPaper = paperMat(null), backPaper = paperMat(null), spinePaper = paperMat(null)
const insF = mesh(new THREE.PlaneGeometry(INS_W, INS_H), frontPaper, cover, false); insF.position.z = T / 2 + 0.0012
const filmF = mesh(plate(W - 0.002, H - 0.002, RC, 0.0012, 0.0005), filmMat, cover, false); filmF.position.z = T / 2 + 0.0016
const insB = mesh(new THREE.PlaneGeometry(INS_W, INS_H), backPaper, base, false); insB.rotation.y = Math.PI; insB.position.z = -D / 2 - 0.0012
const filmB = mesh(plate(W - 0.002, H - 0.002, RC, 0.0012, 0.0005), filmMat, base, false); filmB.position.z = -D / 2 - 0.0028
const insS = mesh(new THREE.PlaneGeometry(D - 0.004, INS_H), spinePaper, base, false); insS.rotation.y = -Math.PI / 2; insS.position.set(-W / 2 - 0.0012, 0, 0)
const filmS = mesh(new THREE.PlaneGeometry(D, H - 0.01), filmMat, base, false); filmS.rotation.y = -Math.PI / 2; filmS.position.set(-W / 2 - 0.003, 0, 0)

// ---- Disc: 120 mm Ø, 15 mm hole, 1.2 mm thick; clear clamp zone, stacking ring, mirror band, data area
const R = 0.6, rH = 0.075, DT = 0.012
const disc = new THREE.Group(); base.add(disc)
const dataMat = new THREE.MeshPhysicalMaterial({ color: 0xc4c8e4, metalness: 1, roughness: 0.07, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [250, 950], side: THREE.DoubleSide })
const mirrorMat = new THREE.MeshPhysicalMaterial({ color: 0xe8eaf2, metalness: 1, roughness: 0.04, side: THREE.DoubleSide })
const clearMat = new THREE.MeshPhysicalMaterial({ color: 0xdfe6f0, roughness: 0.06, transparent: true, opacity: 0.22, ior: 1.58, specularIntensity: 1, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false })
const labelMat = new THREE.MeshPhysicalMaterial({ roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.3 })
const pickable = []
function discRing(r0, r1, mat, z, flip) { const m = mesh(new THREE.RingGeometry(r0, r1, 128, 1), mat, disc, false); m.position.z = z; if (flip) m.rotation.y = Math.PI; pickable.push(m); return m }
discRing(0.23, R - 0.002, dataMat, 0, true)
discRing(0.17, 0.23, mirrorMat, 0, true)
discRing(rH, 0.17, clearMat, 0, true)
const labelRing = discRing(0.17, R - 0.002, labelMat, DT, false)
discRing(rH, 0.17, clearMat, DT, false)
// label UVs: RingGeometry maps uv by position over outer radius, rescale to full disc
{ const uv = labelRing.geometry.attributes.uv, p = labelRing.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / (2 * R) + 0.5, p.getY(i) / (2 * R) + 0.5) }
const edgeO = mesh(new THREE.CylinderGeometry(R, R, DT, 128, 1, true), clearMat, disc); edgeO.rotation.x = Math.PI / 2; edgeO.position.z = DT / 2; pickable.push(edgeO)
const edgeI = mesh(new THREE.CylinderGeometry(rH, rH, DT, 64, 1, true), clearMat, disc, false); edgeI.rotation.x = Math.PI / 2; edgeI.position.z = DT / 2
const stack = mesh(new THREE.TorusGeometry(0.168, 0.0025, 8, 96), clearMat, disc, false); stack.position.z = DT
const shadowDisc = mesh(new THREE.CircleGeometry(R, 64), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }), disc); shadowDisc.position.z = DT / 2
const SEAT = new THREE.Vector3(DISC_X, DISC_Y, TRAY_Z + 0.005)
const OUT = new THREE.Vector3(0.75, DISC_Y + 0.35, D / 2 + 0.75)
disc.position.copy(SEAT)

loaded.then(() => {
  frontPaper.map = frontTex(); backPaper.map = backTex(); spinePaper.map = spineTex(); labelMat.map = discLabelTex()
  ;[frontPaper, backPaper, spinePaper, labelMat].forEach((m) => (m.needsUpdate = true))
})

// ---- State, UI, animation
let open = 0, openTarget = 0, out = 0, outTarget = 0
function q(id) { return document.getElementById(id) }
const ui = { bOpen: q('bOpen'), bDisc: q('bDisc'), bReset: q('bReset'), lang: q('lang') }
let lang = localStorage.getItem('game-catalog-lang') === 'en' ? 'en' : 'zh'
const T_ = {
  zh: { h1: 'PS5 游戏盒', sub: '羊蹄山之魂 · 可拖动旋转查看', open: '打开盒子', close: '合上盒子', take: '取出光盘', put: '放回光盘', reset: '复位视角', hint: '拖动旋转 · 双指缩放 · 点击盒盖或光盘交互', back: '← 返回目录', lang: 'EN' },
  en: { h1: 'PS5 Game Case', sub: 'Ghost of Yōtei · drag to rotate', open: 'Open case', close: 'Close case', take: 'Take out disc', put: 'Put disc back', reset: 'Reset view', hint: 'Drag to rotate · pinch to zoom · tap cover or disc', back: '← Back to catalog', lang: '中文' },
}
function syncUI() {
  const t = T_[lang]
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN'
  q('h1').textContent = t.h1; q('sub').textContent = t.sub; q('hint').textContent = t.hint; q('back').textContent = t.back
  ui.lang.textContent = t.lang; ui.bReset.textContent = t.reset
  ui.bOpen.textContent = openTarget ? t.close : t.open
  ui.bOpen.disabled = outTarget === 1 || out > 0.01
  ui.bDisc.textContent = outTarget ? t.put : t.take
  ui.bDisc.disabled = !(openTarget && open > 0.7)
}
function toggleOpen() { if (outTarget || out > 0.01) return; openTarget = openTarget ? 0 : 1; syncUI() }
function toggleDisc() { if (!openTarget || open < 0.7) return; outTarget = outTarget ? 0 : 1; syncUI() }
ui.bOpen.onclick = toggleOpen
ui.bDisc.onclick = toggleDisc
ui.lang.onclick = () => { lang = lang === 'en' ? 'zh' : 'en'; try { localStorage.setItem('game-catalog-lang', lang) } catch {} ; syncUI() }
let resetT = 0
ui.bReset.onclick = () => { resetT = 1 }
q('back').href = BASE

const ray = new THREE.Raycaster(), ptr = new THREE.Vector2()
let downAt = null
canvas.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY] })
canvas.addEventListener('pointerup', (e) => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return
  ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1)
  ray.setFromCamera(ptr, camera)
  const hit = ray.intersectObjects([...pickable, shadowDisc, ...cover.children, ...base.children.filter((m) => m.isMesh), ...tray.children, ...hub.children], false)[0]
  if (!hit) return
  const o = hit.object
  if (pickable.includes(o) || o === shadowDisc) toggleDisc()
  else if (cover.children.includes(o)) toggleOpen()
  else if (outTarget) toggleDisc()
  else if (!openTarget) toggleOpen()
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
const P1 = SEAT.clone().add(new THREE.Vector3(0, 0, 0.4)), P2 = OUT.clone().add(new THREE.Vector3(-0.35, -0.1, -0.15))
const bez = new THREE.CubicBezierCurve3(SEAT, P1, P2, OUT)
const clock = new THREE.Clock()
const HINGE_MAX = THREE.MathUtils.degToRad(172)
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05)
  open = step(open, openTarget, dt, 0.9)
  out = step(out, outTarget, dt, 1.2)
  hinge.rotation.y = -easeIO(open) * HINGE_MAX
  // disc: tiny press on hub (0–8%), pop off the teeth, then arc out toward the viewer while tilting
  const e = easeIO(out)
  const press = out < 0.08 ? Math.sin((out / 0.08) * Math.PI) * -0.003 : 0
  disc.position.copy(bez.getPoint(e)); disc.position.z += press
  disc.rotation.set(-e * 0.55, e * 0.75, e * 0.4)
  if (resetT) {
    const k = 1 - Math.exp(-dt * 6)
    camera.position.lerp(HOME, k); controls.target.lerp(TARGET, k)
    if (camera.position.distanceTo(HOME) < 0.01) resetT = 0
  }
  if (open !== openTarget || out !== outTarget) syncUI()
  controls.update()
  renderer.render(scene, camera)
}
renderer.setAnimationLoop(tick)
document.addEventListener('visibilitychange', () => renderer.setAnimationLoop(document.hidden ? null : tick))
addEventListener('pagehide', () => { renderer.setAnimationLoop(null); envRT.dispose(); renderer.dispose() })
syncUI()
if (qs.has('open')) { openTarget = open = 1; if (qs.has('disc')) outTarget = out = 1; syncUI() }
if (qs.has('cam')) { const [x, y, z, tx, ty, tz] = qs.get('cam').split(',').map(Number); camera.position.set(x, y, z); if (!isNaN(tx)) controls.target.set(tx, ty, tz) }
