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
const DISC_HOME = new THREE.Vector3(0, 1.45, 3.0)
const DISC_TARGET = new THREE.Vector3(0, 1.1, 0)
camera.position.copy(HOME)
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = true
controls.screenSpacePanning = true
controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }
let userMoved = false
controls.addEventListener('start', () => { userMoved = true })
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

const discLights = [new THREE.DirectionalLight(0xffffff, 0.5), new THREE.DirectionalLight(0xbfd8ff, 0.45), new THREE.DirectionalLight(0xffe2c4, 0.35)]
discLights[0].position.set(1.5, 2.5, 2.5); discLights[1].position.set(-2, 1.5, -2); discLights[2].position.set(2, 0.6, -1)
discLights.forEach((l) => { l.visible = false; scene.add(l) })
const shadowGround = new THREE.ShadowMaterial({ opacity: 0.18 })
function woodTex() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 1024; const g = c.getContext('2d')
  g.fillStyle = '#c9a77f'; g.fillRect(0, 0, 1024, 1024)
  for (let i = 0; i < 260; i++) { const y = Math.random() * 1024, a = 0.03 + Math.random() * 0.07; g.strokeStyle = `rgba(${90 + Math.random() * 40},${60 + Math.random() * 20},30,${a})`; g.lineWidth = 1 + Math.random() * 4
    g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= 1024; x += 64) g.lineTo(x, y + Math.sin(x * 0.006 + i) * 6); g.stroke() }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.anisotropy = 8; return t
}
let _wood = null
const deskMat = () => new THREE.MeshPhysicalMaterial({ map: (_wood ||= woodTex()), roughness: 0.55, clearcoat: 0.3, clearcoatRoughness: 0.35 })
const linenMat = new THREE.MeshStandardMaterial({ color: 0xeceae4, roughness: 0.95 })
const ENVS = {
  studio: { css: 'linear-gradient(180deg,#f3f6f8 0%,#e6ebee 60%,#d9dee2 100%)', ground: () => shadowGround, env: 1.0, key: 0xfff6ec, fill: 0xe4eeff, label: ['影棚', 'Studio'] },
  desk: { css: 'radial-gradient(120% 90% at 50% 20%,#f6efe6 0%,#e7dccd 70%,#d8c9b4 100%)', ground: deskMat, env: 0.85, key: 0xffe9cf, fill: 0xd9e6ff, label: ['桌面', 'Desk'] },
  linen: { css: 'linear-gradient(180deg,#f7f4ee,#efece5)', ground: () => linenMat, env: 0.95, key: 0xffffff, fill: 0xdcecff, label: ['布面', 'Linen'] },
}
const ENV_KEYS = Object.keys(ENVS)
let envName = qs.get('env') || localStorage.getItem('box-env') || 'studio'
if (!ENVS[envName]) envName = 'studio'
const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), shadowGround)
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground)
let envBase = 0.9
function applyEnv() {
  const e = ENVS[envName]; document.body.style.background = e.css; ground.material = e.ground(); envBase = e.env
  key.color.setHex(e.key); fill.color.setHex(e.fill); try { localStorage.setItem('box-env', envName) } catch {}
  const b = document.getElementById('bEnv'); if (b) b.textContent = (lang === 'en' ? 'Scene: ' : '环境：') + e.label[lang === 'en' ? 1 : 0]
}
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

const LITE = mobile || qs.has('lite')
// Translucent blue PP (n≈1.49). Desktop: real transmission; mobile: tuned alpha blend (cheaper, still see-through).
const shellMat = true // v7: alpha-blended tint everywhere — transmission blurred the print seen through the shell
  ? new THREE.MeshPhysicalMaterial({ color: 0x0028c4, roughness: 0.06, metalness: 0, transparent: true, opacity: 0.5, ior: 1.49,
      clearcoat: 0.4, clearcoatRoughness: 0.1, specularIntensity: 0.5, side: THREE.FrontSide, depthWrite: false })
  : new THREE.MeshPhysicalMaterial({ color: 0x5f8cff, roughness: 0.015, metalness: 0, transmission: 1, thickness: 0.011, ior: 1.49,
      attenuationColor: new THREE.Color(0x0a32c8), attenuationDistance: 0.16, clearcoat: 0.5, clearcoatRoughness: 0.12,
      specularIntensity: 1, side: THREE.DoubleSide })
const trayMat = shellMat.clone()
trayMat.roughness = 0.03
trayMat.opacity = 0.42
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
function uWall(w, h, r, wall, depth, openLeft = true, YC = 0.1) {
  const group = new THREE.Group()
  const top = mesh(new THREE.BoxGeometry(w - wall / 2, wall, depth), shellMat, group)
  top.position.set(-wall / 4, h / 2 - wall / 2, depth / 2)
  const bot = mesh(new THREE.BoxGeometry(w - wall / 2, wall, depth), shellMat, group)
  bot.position.set(-wall / 4, -h / 2 + wall / 2, depth / 2)
  // short spine-side wall stubs that end square at the fold (photo D: each half's wall stops at its crease)
  for (const sy of [-1, 1]) {
    const st = mesh(new THREE.BoxGeometry(wall, 0.09, depth * 0.85), shellMat, group, false)
    st.position.set(-w / 2 + wall / 2, sy * (h / 2 - wall - 0.045), depth * 0.425)
  }
  // Opening edge: one wall whose MATING edge has a shallow semicircular thumb scoop at mid-height.
  // Both halves carry the same scoop, so a closed case shows an oval finger recess (Amaray/Elite style).
  // Photo A: long stadium-shaped finger slot, ~1/3 of case height, slightly above centre, straddling the
  // seam so each half carries half of it (total width ≈ 40 % of case thickness), with a moulded floor.
  const NW = 0.56, ND = Math.min(depth * 0.95, HALF * 0.42), hh = h / 2 - wall / 2
  const prof = new THREE.Shape()
  prof.moveTo(-hh, 0); prof.lineTo(hh, 0); prof.lineTo(hh, depth); prof.lineTo(YC + NW / 2, depth)
  prof.absarc(YC + NW / 2 - ND, depth, ND, 0, -Math.PI / 2, true)
  prof.lineTo(YC - NW / 2 + ND, depth - ND)
  prof.absarc(YC - NW / 2 + ND, depth, ND, -Math.PI / 2, -Math.PI, true)
  prof.lineTo(-hh, depth); prof.closePath()
  const og = new THREE.ExtrudeGeometry(prof, { depth: wall, bevelEnabled: false, curveSegments: 24 })
  og.applyMatrix4(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0)))
  const ow = mesh(og, shellMat, group); ow.position.x = w / 2 - wall; ow.name = 'notchWall'
  { // recess floor: thin stadium half-plate set ~3.5 mm in from the outer face
    const fs = new THREE.Shape(); fs.moveTo(YC - NW / 2, depth); fs.lineTo(YC + NW / 2, depth)
    fs.absarc(YC + NW / 2 - ND, depth, ND, 0, -Math.PI / 2, true); fs.lineTo(YC - NW / 2 + ND, depth - ND)
    fs.absarc(YC - NW / 2 + ND, depth, ND, -Math.PI / 2, -Math.PI, true)
    const fg = new THREE.ExtrudeGeometry(fs, { depth: wall * 0.45, bevelEnabled: false, curveSegments: 20 })
    fg.applyMatrix4(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0)))
    const fl = mesh(fg, shellMat, group, false); fl.position.x = w / 2 - wall * 1.2
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
function loadImg(n) { const i = new Image(); const p = new Promise((res) => { i.onload = res; i.onerror = res }); i.src = `${BASE}demo/${n}`; return [i, p] }
// RE4 Gold Edition (HK/Asia, ELAS 10653): front art = official PS Store key art; spine/back/inner/disc = user's own photos (warped + colour-corrected)
const [img, p0] = loadImg('re4_front_art.jpg')
const RE = {}; const ps = [p0]
for (const n of ['inner_cover', 'inner_tray', 'disc', 'ss1', 'ss2', 'ss3']) { const [i, p] = loadImg(`re4_${n}.jpg`); RE[n] = i; ps.push(p) }
const loaded = Promise.all(ps)
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
// ---- Clean rebuilds of the HK/Asia ELAS 10653 spine + back (content transcribed from the user's photos C/E) ----
function ean13(g, code, x, y, mw, h) {
  const L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011']
  const G = L.map((p) => [...p].map((b) => (b === '0' ? '1' : '0')).reverse().join('')), R = L.map((p) => [...p].map((b) => (b === '0' ? '1' : '0')).join(''))
  const P = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL']
  const d = [...code].map(Number); let bits = '101'
  for (let i = 1; i <= 6; i++) bits += (P[d[0]][i - 1] === 'L' ? L : G)[d[i]]
  bits += '01010'; for (let i = 7; i <= 12; i++) bits += R[d[i]]; bits += '101'
  g.fillStyle = '#fff'; g.fillRect(x - 14 * mw, y - 8, (bits.length + 22) * mw, h + 40); g.fillStyle = '#000'
  ;[...bits].forEach((b, i) => { if (b === '1') { const guard = i < 3 || (i > 44 && i < 50) || i > 91; g.fillRect(x + i * mw, y, mw, h + (guard ? 10 : 0)) } })
  g.font = `${mw * 9}px "DejaVu Sans Mono", monospace`; g.textBaseline = 'top'
  g.fillText(code[0], x - 10 * mw, y + h + 2); g.fillText(code.slice(1, 7), x + 5 * mw, y + h + 2); g.fillText(code.slice(7), x + 51 * mw, y + h + 2); g.textBaseline = 'alphabetic'
}
function capcomLogo(g, x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.font = `900 italic ${s}px "Arial Black", Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.lineWidth = s * 0.16; g.strokeStyle = '#1d4fa8'; g.strokeText('CAPCOM', 0, 0); g.fillStyle = '#ffc61a'; g.fillText('CAPCOM', 0, 0); g.restore()
}
function wrapText(g, text, x, y, w, lh) {
  const words = text.split(' '); let line = ''
  for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (g.measureText(t).width > w && line) { g.fillText(line, x, y); y += lh; line = wd } else line = t }
  if (line) g.fillText(line, x, y); return y + lh
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h) }
function re4Spine(c, g) {
  const w = SPINE_W, h = FRONT_H
  g.fillStyle = '#0d0c10'; g.fillRect(0, 0, w, h)
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(70,40,30,.0)'); gr.addColorStop(0.6, 'rgba(90,30,20,.35)'); gr.addColorStop(1, 'rgba(20,10,10,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h)
  // white PS5 band (same height as the front band) + blue rule
  g.fillStyle = '#fff'; g.fillRect(0, 0, w, BANNER); g.fillStyle = '#0070d1'; g.fillRect(0, BANNER, w, 3)
  g.save(); g.translate(w / 2, BANNER / 2); g.rotate(Math.PI / 2); g.textAlign = 'center'; ps5Logo(g, 0, 0, 34); g.restore()
  // vertical title, reads top→bottom
  g.save(); g.translate(w / 2, 170); g.rotate(Math.PI / 2); g.textBaseline = 'middle'
  g.fillStyle = '#f1f1f1'; g.font = '900 54px "Arial Narrow", Impact, "DejaVu Sans Condensed", sans-serif'; g.fillText('BIOHAZARD', 0, 2)
  let x = g.measureText('BIOHAZARD').width + 18
  g.fillStyle = '#c4161c'; g.font = '900 60px Impact, "DejaVu Sans Condensed", sans-serif'; g.fillText('RE:4', x, 2); x += g.measureText('RE:4').width + 26
  const gw = 222; const gg = g.createLinearGradient(0, -22, 0, 22); gg.addColorStop(0, '#f3dc94'); gg.addColorStop(1, '#a8823a')
  g.fillStyle = gg; g.fillRect(x, -22, gw, 44); g.fillStyle = '#1a1206'; g.font = '800 26px "Arial Narrow", Arial, sans-serif'; g.fillText('GOLD EDITION', x + 14, 2)
  g.restore()
  capcomLogo(g, w / 2, h - 300, 24, Math.PI / 2)
  g.fillStyle = '#e8e8e8'; g.font = '600 19px Arial'; g.textAlign = 'center'; g.fillText('ELAS', w / 2, h - 170); g.fillText('10653', w / 2, h - 148)
  ratingBox(g, (w - 64) / 2, h - 120, 64); g.textAlign = 'left'
  return c
}
function re4Back(c, g) {
  const W2 = FRONT_W, H2 = FRONT_H, M = 50
  g.fillStyle = '#0b0d14'; g.fillRect(0, 0, W2, H2)
  const bgS = RE.ss3 && RE.ss3.width ? RE.ss3 : null
  if (bgS) { g.globalAlpha = 0.28; g.drawImage(bgS, 0, BANNER, W2, 760); g.globalAlpha = 1 }
  const vg = g.createLinearGradient(0, BANNER, 0, 880); vg.addColorStop(0, 'rgba(11,13,20,.55)'); vg.addColorStop(1, 'rgba(11,13,20,.95)'); g.fillStyle = vg; g.fillRect(0, BANNER, W2, 760)
  banner(g, W2)
  g.fillStyle = '#fff'; g.font = '700 23px "Times New Roman", serif'
  let y = wrapText(g, 'Resident Evil 4 Gold Edition includes Resident Evil 4 and the Separate Ways DLC, where you play as Ada Wong and experience the events of Resident Evil 4 from her perspective. It also includes the Extra DLC Pack containing a variety of additional content.', M, BANNER + 48, W2 - 2 * M, 29)
  const shots = [RE.ss1, RE.ss2, RE.ss3]; const sw = 300, sh = 169
  shots.forEach((im, i) => { const sx = M + i * (sw + 16), sy = y + 6; if (im?.width) g.drawImage(im, sx, sy, sw, sh); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2; g.strokeRect(sx, sy, sw, sh) })
  y += sh + 44
  g.font = 'italic 600 21px "Times New Roman", serif'; g.fillStyle = '#e9e4da'
  y = wrapText(g, '6 years have passed since the biological disaster in Raccoon City. Leon S. Kennedy is tasked with rescuing the US President\u2019s kidnapped daughter. Will he be able to overcome the madness that awaits him?', M, y, W2 / 2 - M, 26) + 10
  let y2 = y - 26 * 5 - 10
  g.font = '600 19px Arial'; g.fillStyle = '#f2efe8'
  wrapText(g, 'Play as Ada Wong in this additional scenario, and experience the events of Resident Evil 4 from her perspective, filling in unanswered questions posed in the main story. With her mission to retrieve the Amber looming over her, which path will she choose?', W2 / 2 + 10, Math.max(y2, y - 140), W2 / 2 - M - 10, 24)
  // Extra DLC Pack box
  const by = 690; g.strokeStyle = '#fff'; g.lineWidth = 2; rr(g, M, by, W2 - 2 * M, 84, 14); g.stroke()
  g.fillStyle = '#fff'; g.fillRect(M, by, 150, 84); g.fillStyle = '#111'; g.font = '800 24px Arial'; g.fillText('Extra DLC', M + 18, by + 36); g.fillText('Pack', M + 18, by + 64)
  g.fillStyle = '#fff'; g.font = '17px Arial'
  wrapText(g, 'Includes: Leon & Ashley costumes, Deluxe Weapons \u201cSentinel Nine\u201d and \u201cSkull Shaker\u201d, \u201cTreasure Map: Expansion\u201d, Leon Accessory and Soundtrack Swap.', M + 170, by + 32, W2 - 2 * M - 190, 22)
  // feature icons row
  const feats = ['1 Player', 'Vibration Function & Trigger Effect Supported', '60 GB Minimum', 'In-game Purchases']
  feats.forEach((t, i) => { const fx = M + i * 236, fy = 800; g.fillStyle = '#fff'; rr(g, fx, fy, 222, 52, 8); g.fill(); g.fillStyle = '#111'; g.font = '700 15px Arial'; wrapText(g, t, fx + 12, fy + 22, 200, 17) })
  g.fillStyle = '#ddd'; g.font = '15px Arial'; g.fillText('f  /CAPCOMasia     \u25b6  /capcomasia', W2 - 360, 880)
  // white legal panel
  const wy = 900; g.fillStyle = '#fff'; g.fillRect(0, wy, W2, H2 - wy)
  g.fillStyle = '#222'; g.font = '13px Arial'
  ;['\u00a9CAPCOM. Dolby, Dolby Audio, and the double-D symbol are trademarks of Dolby Laboratories Licensing Corporation.',
    '\u201c\u2660\u201d, \u201cPlayStation\u201d, \u201cPS5\u201d, \u201cPS5 logo\u201d and \u201cDualSense\u201d are registered trademarks or trademarks of Sony Interactive Entertainment Inc.',
    'This software is PlayStation\u00ae5 format software. \u6b64\u70baPlayStation\u00ae5\u683c\u5f0f\u8edf\u4ef6\u3002 Library programs \u00a9Sony Interactive Entertainment Inc.',
    '\u201cBlu-ray Disc\u2122\u201d, \u201cBlu-ray\u2122\u201d and \u201cUltra HD Blu-ray\u2122\u201d are trademarks of the Blu-ray Disc Association.',
    'Some services may require an account with PSN. Use of PSN is subject to the Terms of Service. For additional information about PSN, visit www.playstation.com/playstation-network',
    '\u5c64\u8a9e\u8a00\uff1a\u7e41\u9ad4\u4e2d\u6587 / \u7c21\u9ad4\u4e2d\u6587 / English / \u65e5\u672c\u8a9e / \ud55c\uad6d\uc5b4     Audio: English / Japanese     1080p \u00b7 2160p']
    .forEach((l, i) => { g.fillText(l, M, wy + 30 + i * 20) })
  // logos
  g.fillStyle = '#1b58b8'; rr(g, M, wy + 170, 130, 46, 6); g.fill(); g.fillStyle = '#fff'; g.font = '800 16px Arial'; g.fillText('ULTRA HD', M + 14, wy + 190); g.font = 'italic 13px Arial'; g.fillText('Blu-ray\u2122', M + 14, wy + 208)
  g.fillStyle = '#111'; g.font = '800 22px Arial'; g.fillText('\u25ae\u25ae Dolby Audio', M + 150, wy + 202)
  ratingBox(g, M + 340, wy + 160, 70)
  ean13(g, '4897077991142', W2 - 330, wy + 165, 2.6, 92)
  g.fillStyle = '#111'; g.fillRect(W2 - 360, H2 - 76, 310, 34); g.fillStyle = '#fff'; g.font = '800 17px Arial'; g.textAlign = 'center'; g.fillText('FOR HOME USE ONLY', W2 - 205, H2 - 53); g.textAlign = 'left'
  g.fillStyle = '#555'; g.font = '12px Arial'; g.fillText('ELAS-10653   MADE IN JAPAN   Published by CAPCOM ASIA CO., LTD.', M, H2 - 30)
  return c
}
function frontTex() {
  const [c, g] = ctx(FRONT_W, FRONT_H)
  drawCover(g, 0, BANNER + 4, FRONT_W, FRONT_H - BANNER - 4)
  banner(g, FRONT_W)
  // HK/Asia retail front: BIOHAZARD RE:4 logo + GOLD EDITION plate (as on user's photo E)
  g.save(); g.textAlign = 'center'; g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 18
  g.fillStyle = '#f2f2f2'; g.font = '900 118px "Arial Narrow", Impact, "DejaVu Sans Condensed", sans-serif'
  try { g.letterSpacing = '4px' } catch {}
  g.fillText('BIOHAZARD', FRONT_W / 2, FRONT_H * 0.56)
  g.fillStyle = '#c4161c'; g.font = '900 150px Impact, "DejaVu Sans Condensed", sans-serif'; g.fillText('RE:4', FRONT_W / 2, FRONT_H * 0.56 + 150)
  g.shadowBlur = 0; const gw = 330, gy = FRONT_H * 0.56 + 190
  const gr = g.createLinearGradient(0, gy, 0, gy + 60); gr.addColorStop(0, '#f3dc94'); gr.addColorStop(1, '#a8823a')
  g.fillStyle = gr; g.fillRect(FRONT_W / 2 - gw / 2, gy, gw, 60); g.fillStyle = '#1a1206'; g.font = '800 40px "Arial Narrow", Arial, sans-serif'
  g.fillText('GOLD EDITION', FRONT_W / 2, gy + 45); g.restore()
  ratingBox(g, 38, FRONT_H - 190, 120)
  g.fillStyle = '#fff'; g.font = '700 34px Arial'; g.textAlign = 'right'; g.fillText('CAPCOM', FRONT_W - 40, FRONT_H - 50); g.textAlign = 'left'
  return c
}
function spineTex() {
  const [c, g] = ctx(SPINE_W, FRONT_H)
  return re4Spine(c, g)
  const gr = g.createLinearGradient(0, 0, 0, FRONT_H); gr.addColorStop(0, '#1c1a1d'); gr.addColorStop(1, '#3a1013')
  g.fillStyle = gr; g.fillRect(0, 0, SPINE_W, FRONT_H)
  g.fillStyle = '#fff'; g.fillRect(0, 0, SPINE_W, BANNER + 40); g.fillStyle = '#0070d1'; g.fillRect(0, BANNER + 40, SPINE_W, 4)
  g.save(); g.translate(SPINE_W / 2, (BANNER + 40) / 2); g.textAlign = 'center'; ps5Logo(g, 0, 0, 38); g.restore()
  g.save(); g.translate(SPINE_W / 2 + 2, 230); g.rotate(Math.PI / 2); g.fillStyle = '#f3ede4'; g.textBaseline = 'middle'
  g.font = '600 46px "Noto Serif CJK SC","Songti SC",serif'; g.fillText('羊蹄山之魂', 0, 0)
  g.font = '500 30px "Times New Roman",serif'; g.fillText('GHOST OF YŌTEI', 270, 2); g.restore()
  ratingBox(g, (SPINE_W - 70) / 2, FRONT_H - 140, 70); return c
}
function barcode(g, x, y, w, h) {
  g.fillStyle = '#fff'; g.fillRect(x - 10, y - 10, w + 20, h + 46); g.fillStyle = '#000'
  let px = x, seed = 7
  while (px < x + w) { seed = (seed * 9301 + 49297) % 233280; const bw = 2 + (seed % 4) * 1.6; if (seed % 3) g.fillRect(px, y, bw, h); px += bw + 2 }
  g.font = '24px monospace'; g.fillText('4 948872 01633 0', x + 10, y + h + 26)
}
function backTex() {
  const [c, g] = ctx(FRONT_W, FRONT_H)
  return re4Back(c, g)
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
  barcode(g, FRONT_W - 300, 1180, 240, 60); return c
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
  g.fillStyle = '#fff'; g.font = '900 44px Impact, "DejaVu Sans Condensed", sans-serif'; g.fillText('BIOHAZARD RE:4', 28, 520)
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
for (const [a0, a1] of [[0.32, Math.PI - 0.32], [Math.PI + 0.32, 2 * Math.PI - 0.32]]) {
  mesh(arcSeg(0.606, 0.626, a0, a1, 0.014), trayMat, tray).position.set(DISC_X, DISC_Y, 0)
  // shallow outer step like the moulded well in photo B
  mesh(arcSeg(0.626, 0.648, a0 - 0.05, a1 + 0.05, 0.006), trayMat, tray, false).position.set(DISC_X, DISC_Y, 0)
}
const rib = new THREE.BoxGeometry(0.004, 0.16, 0.005)
for (const [x, y, n] of [[-0.56, 0.72, 4], [0.5, 0.72, 4], [-0.56, -0.66, 4], [0.5, -0.66, 4]]) {
  for (let i = 0; i < n; i++) mesh(rib, trayMat, tray, false).position.set(x + i * 0.018, y, 0.0025)
}

// shallow moulded corner tabs (photo B): small L-gussets in each inner corner of the tray half
for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
  const cx = sx * (W / 2 - T - 0.03), cy = sy * (H / 2 - T - 0.03)
  mesh(new THREE.BoxGeometry(0.06, 0.012, 0.012), trayMat, tray, false).position.set(cx, cy + sy * 0.012, 0.006)
  mesh(new THREE.BoxGeometry(0.012, 0.06, 0.012), trayMat, tray, false).position.set(cx + sx * 0.012, cy, 0.006)
}
// Push-to-release "snowflake" hub (Amaray/Elite PS5 style):
// low concentric support ring → raised collar → 12 flexible petals with outward lips → domed push button with △ motif
const hub = new THREE.Group(); hub.position.set(DISC_X, DISC_Y, 0); tray.add(hub)
function lathe(pts, seg = 64) {
  const g = new THREE.LatheGeometry(pts.map(([r, z]) => new THREE.Vector2(r, z)), seg); g.rotateX(Math.PI / 2); return g
}
mesh(lathe([[0.135, 0], [0.205, 0], [0.205, 0.003], [0.19, 0.0055], [0.15, 0.0055], [0.135, 0.004]]), trayMat, hub) // disc support land
mesh(lathe([[0.086, 0], [0.104, 0], [0.104, 0.010], [0.099, 0.0125], [0.088, 0.0125]]), trayMat, hub)              // collar
const teeth = []
const N = 12, gap = 0.055
for (let i = 0; i < N; i++) {
  const a0 = (i / N) * Math.PI * 2 + gap, a1 = ((i + 1) / N) * Math.PI * 2 - gap
  const mid = (a0 + a1) / 2
  const tooth = new THREE.Group(); hub.add(tooth); tooth.userData.angle = mid; teeth.push(tooth)
  // tapered petal: wider at the rim, narrowing toward the centre slot
  const s = new THREE.Shape(); s.absarc(0, 0, 0.0745, a0, a1, false)
  s.absarc(0, 0, 0.047, mid + (a1 - mid) * 0.55, mid - (mid - a0) * 0.55, true)
  mesh(new THREE.ExtrudeGeometry(s, { depth: 0.019, bevelEnabled: true, bevelThickness: 0.0015, bevelSize: 0.001, bevelSegments: 3, curveSegments: 8 }), trayMat, tooth)
  // overhanging lip that snaps over the disc's centre hole (chamfered on top)
  const lipS = new THREE.Shape(); lipS.absarc(0, 0, 0.0795, a0 + 0.03, a1 - 0.03, false); lipS.absarc(0, 0, 0.066, a1 - 0.03, a0 + 0.03, true)
  mesh(new THREE.ExtrudeGeometry(lipS, { depth: 0.0035, bevelEnabled: true, bevelThickness: 0.0012, bevelSize: 0.0012, bevelSegments: 2, curveSegments: 8 }), trayMat, tooth).position.z = 0.0165
}
const btn = new THREE.Group(); hub.add(btn); btn.position.z = 0.012; btn.name = 'hubBtn'
mesh(lathe([[0, 0.0105], [0.02, 0.0098], [0.034, 0.0082], [0.041, 0.006], [0.043, 0], [0.04, -0.012], [0, -0.012]]), trayMat, btn)
{ // embossed triangle motif + three radial flex slots
  const tri = new THREE.Shape(), r1 = 0.03, r2 = 0.0225
  for (let k = 0; k < 3; k++) { const a = Math.PI / 2 + k * 2 * Math.PI / 3; k ? tri.lineTo(Math.cos(a) * r1, Math.sin(a) * r1) : tri.moveTo(Math.cos(a) * r1, Math.sin(a) * r1) }
  tri.closePath(); const hole = new THREE.Path()
  for (let k = 0; k < 3; k++) { const a = Math.PI / 2 - k * 2 * Math.PI / 3; k ? hole.lineTo(Math.cos(a) * r2, Math.sin(a) * r2) : hole.moveTo(Math.cos(a) * r2, Math.sin(a) * r2) }
  hole.closePath(); tri.holes.push(hole)
  mesh(new THREE.ExtrudeGeometry(tri, { depth: 0.0026, bevelEnabled: true, bevelThickness: 0.0006, bevelSize: 0.0005, bevelSegments: 2 }), trayMat, btn, false).position.z = 0.0092
  const slotMat = new THREE.MeshStandardMaterial({ color: 0x0b2a78, roughness: 0.5, transparent: true, opacity: 0.55, depthWrite: false })
  for (let k = 0; k < 3; k++) { const sl = mesh(new THREE.BoxGeometry(0.003, 0.012, 0.002), slotMat, btn, false); const a = -Math.PI / 2 + k * 2 * Math.PI / 3; sl.position.set(Math.cos(a) * 0.033, Math.sin(a) * 0.033, 0.0085); sl.rotation.z = a + Math.PI / 2 }
}
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
  const web = mesh(new THREE.BoxGeometry(T * 0.38, H - 0.004, CR), shellMat, spineG, false); web.visible = false
  web.position.set(-T * 0.19, 0, zc)
}
// rounded spine edges: the strip's long edges are radiused into the creases (photo D)
for (const zc of [CR, D - CR]) {
  const ed = mesh(new THREE.CylinderGeometry(T * 0.5, T * 0.5, H - 0.012, 16), shellMat, spineG, false)
  ed.position.set(-T / 2, 0, zc)
}
// fine crease grooves visible on the outside of the spine
const grooveMat = new THREE.MeshBasicMaterial({ color: 0x001a66, transparent: true, opacity: 0.35, depthWrite: false })
for (const zc of [CR * 0.5, D - CR * 0.5]) { const gl = mesh(new THREE.BoxGeometry(0.0008, H - 0.02, 0.0012), grooveMat, spineG, false); gl.position.set(-T - 0.0004, 0, zc) }
// mould gate dots on spine interior (two, upper/lower)
for (const y of [0.24, -0.24]) {
  const dot = mesh(new THREE.CylinderGeometry(0.0085, 0.0085, 0.0016, 24), trayMat, spineG, false)
  dot.rotation.z = Math.PI / 2; dot.position.set(0.0006, y, D / 2)
}
// thin top/bottom lips on the strip (sleeve is open top & bottom → blue plastic shows)
for (const sy of [-1, 1]) {
  const l = mesh(new THREE.BoxGeometry(T * 0.9, 0.006, D - 2 * CR), shellMat, spineG, false)
  l.position.set(-T * 0.45, sy * (H / 2 - 0.006), D / 2)
  // photo D: the strip carries its own small rectangular block at each end, standing inward between the folds
  const blk = mesh(new THREE.BoxGeometry(T * 1.6, 0.05, D - 2 * CR - 0.012), shellMat, spineG, false)
  blk.position.set(T * 0.8, sy * (H / 2 - 0.004 - 0.025), D / 2)
}
const coverHinge = new THREE.Group(); coverHinge.position.set(0, 0, D); spineG.add(coverHinge)
const cover = new THREE.Group()
cover.position.set(W / 2, 0, -HALF) // keeps legacy cover-content z coordinates (centre-plane based)
coverHinge.add(cover)

const coverPlate = mesh(plate(W, H, RC, T), shellMat, cover)
coverPlate.position.z = HALF - T // outer front face when closed
const coverWalls = uWall(W - 0.004, H - 0.004, RC, T, HALF - T * 0.5, true, -0.1)
coverWalls.rotation.x = Math.PI // keep notch/side on opening edge (+x), mirror into −z
coverWalls.position.z = HALF - T
cover.add(coverWalls)
// Inner locating lip that nests into back walls when closed
const lip = mesh(ring(W - 2 * T - 0.008, H - 2 * T - 0.008, RC - T, 0.005, 0.005), trayMat, cover)
lip.position.z = HALF - T - 0.006

// Opening-edge latch (right side when closed): recess + nub
// Small snap tabs either side of the notch (functional, ~4 mm) + matching catch bumps on tray half
// Photo A (zoomed, user-refs/A-latch.png): below the slot, rectangular snap blocks moulded behind the
// opening wall show through the plastic — a hook block on the cover half meeting a catch pocket on the tray half.
for (const [y, h] of [[-0.3, 0.07], [-0.47, 0.05], [-0.62, 0.08], [0.58, 0.07]]) {
  const hook = mesh(new THREE.BoxGeometry(0.012, h, 0.03), shellMat, cover, false)
  hook.position.set(W / 2 - T - 0.007, y, -0.012)
  const lipH = mesh(new THREE.BoxGeometry(0.006, h * 0.6, 0.008), shellMat, cover, false)
  lipH.position.set(W / 2 - T - 0.016, y, -0.03)
  const pocket = mesh(new THREE.BoxGeometry(0.012, h + 0.02, 0.026), shellMat, base, false)
  pocket.position.set(W / 2 - T - 0.007, y, -HALF + T + 0.022)
}

// Booklet retainers — real keep-case style: moulded finger clips on INSIDE of front cover (left when open)
// Two pairs: upper/lower, each an L-shaped tab with inward lip that grips booklet edge
function bookletClip(parent, y) {
  // Real PS5/Elite case: a thin clear tab moulded off the opening-edge wall, lying parallel to the cover,
  // shaped like a rounded rectangular loop (window in the middle) — the booklet edge slides under it.
  const g = new THREE.Group(); parent.add(g)
  const L = 0.15, Wt = 0.15, r = 0.025
  const s = new THREE.Shape()
  s.moveTo(0, -Wt / 2); s.lineTo(-L + r, -Wt / 2); s.quadraticCurveTo(-L, -Wt / 2, -L, -Wt / 2 + r)
  s.lineTo(-L, Wt / 2 - r); s.quadraticCurveTo(-L, Wt / 2, -L + r, Wt / 2); s.lineTo(0, Wt / 2); s.closePath()
  { const hp = new THREE.Path(); hp.curves = rrect(0.085, 0.09, 0.02, -0.08, 0).curves; s.holes.push(hp) }
  const tab = mesh(new THREE.ExtrudeGeometry(s, { depth: 0.0028, bevelEnabled: true, bevelThickness: 0.0008, bevelSize: 0.0008, bevelSegments: 2, curveSegments: 12 }), trayMat, g, false)
  tab.position.z = -0.0245; tab.rotation.y = -0.06 // slight downward lean toward the booklet
  const riser = mesh(new THREE.BoxGeometry(0.006, Wt, 0.023), trayMat, g, false); riser.position.set(0.001, 0, -0.0115)
  g.position.set(W / 2 - T - 0.002, y, HALF - T)
  return g
}
for (const y of [0.62, -0.62]) bookletClip(cover, y)
// thin raised rail along the opening edge on the cover interior (photo C)
mesh(new THREE.BoxGeometry(0.006, H - 0.2, 0.006), trayMat, cover, false).position.set(W / 2 - T - 0.03, 0, HALF - T - 0.003)

// Thin instruction booklet held under the clips
const booklet = new THREE.Group(); cover.add(booklet)
const bkW = 1.18, bkH = 1.5, bkT = 0.006
const bkFront = mesh(new THREE.BoxGeometry(bkW, bkH, bkT), bookletMat, booklet)
booklet.position.set(0.035, 0, HALF - T - 0.018)
// page-edge sheen
mesh(new THREE.BoxGeometry(bkW * 0.98, bkH * 0.98, bkT * 0.35), new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.75 }), booklet, false).position.z = -bkT * 0.15
const bkPaper = paperMat(null)
// Plane faces +Z by default; flip so art faces into the case (−Z when closed = toward tray when open)
const bkFace = mesh(new THREE.PlaneGeometry(bkW - 0.02, bkH - 0.02), bkPaper, booklet, false)
bkFace.rotation.y = Math.PI
bkFace.position.z = -bkT / 2 - 0.0005

// ---- ONE printed wrap insert (back | spine | front) slid under ONE clear sleeve ----
// Both are single ribbon meshes whose cross-section follows back panel → crease A → spine strip →
// crease B → front panel. Vertices are linearly blended between the part frames each frame, so the
// sheet bends around the living-hinge creases as the case opens (like real paper under the film).
const wrapPaper = paperMat(null); wrapPaper.side = THREE.DoubleSide
const wrapInnerPaper = paperMat(null); wrapInnerPaper.side = THREE.DoubleSide
const EDGE = 0.016 // insert stops ~1.6 mm short of the opening edge
function wrapPath(o, xsBack, xsFront) {
  const pts = [] // {x,z,i,j,f}  frames: 0 base, 1 spine strip, 2 cover hinge
  const xs = xsBack || [W / 2 - EDGE, 0.2, -0.3, -W / 2 + 0.03, -W / 2]
  for (const x of xs) pts.push({ x, z: -HALF - o, i: 0, j: 0, f: 0 })
  const N = 16
  for (let k = 1; k <= N; k++) { const t = (k / N) * Math.PI / 2; pts.push({ x: -W / 2 - (T + o) * Math.sin(t), z: -HALF - o * Math.cos(t), i: 0, j: 1, f: k / N }) }
  pts.push({ x: -W / 2 - T - o, z: HALF, i: 1, j: 1, f: 0 })
  for (let k = 1; k <= N; k++) { const t = (k / N) * Math.PI / 2; pts.push({ x: -W / 2 - (T + o) * Math.cos(t), z: HALF + o * Math.sin(t), i: 1, j: 2, f: k / N }) }
  for (const x of (xsFront || [-W / 2 + 0.03, -0.3, 0.2, W / 2 - EDGE])) pts.push({ x, z: HALF + o, i: 2, j: 2, f: 0 })
  let s = 0; pts.forEach((p, k) => { if (k) s += Math.hypot(p.x - pts[k - 1].x, p.z - pts[k - 1].z); p.s = s })
  return pts
}
const REST = [new THREE.Matrix4(), new THREE.Matrix4().makeTranslation(-W / 2, 0, -HALF), new THREE.Matrix4().makeTranslation(-W / 2, 0, HALF)]
const REST_INV = REST.map((m) => m.clone().invert())
function ribbon(o, h, mat, xb, xf) {
  const pts = wrapPath(o, xb, xf), total = pts[pts.length - 1].s
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(pts.length * 2 * 3), uv = new Float32Array(pts.length * 2 * 2), idx = []
  pts.forEach((p, k) => {
    p.la = new THREE.Vector3(p.x, 0, p.z).applyMatrix4(REST_INV[p.i]); p.lb = new THREE.Vector3(p.x, 0, p.z).applyMatrix4(REST_INV[p.j])
    uv.set([p.s / total, 0, p.s / total, 1], k * 4)
    if (k) { const a = (k - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3) }
  })
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx)
  const m = mesh(geo, mat, root, false); m.frustumCulled = false
  m.userData = { pts, h, total }
  return m
}
const wrapIns = ribbon(0.0018, INS_H, wrapPaper)
const wrapInner = ribbon(0.0011, INS_H, wrapInnerPaper)
const sleeve = ribbon(0.0034, INS_H + 0.028, filmMat); sleeve.renderOrder = 2
// Living-hinge plastic skins (outer face + thinned inner face of the flex band) — bend as smooth arcs
const HX = [-W / 2 + 0.012, -W / 2], HXF = [-W / 2 + 0.012]
const hingeSkins = [ribbon(0, H - 0.004, shellMat, HX, HXF), ribbon(-T * 0.62, H - 0.004, shellMat, HX, HXF)]
const _fm = [new THREE.Matrix4(), new THREE.Matrix4(), new THREE.Matrix4()], _va = new THREE.Vector3(), _vb = new THREE.Vector3()
function updateRibbon(m) {
  const { pts, h } = m.userData, pos = m.geometry.attributes.position
  pts.forEach((p, k) => {
    _va.copy(p.la).applyMatrix4(_fm[p.i]); _vb.copy(p.lb).applyMatrix4(_fm[p.j]); _va.lerp(_vb, p.f)
    pos.setXYZ(k * 2, _va.x, -h / 2, _va.z); pos.setXYZ(k * 2 + 1, _va.x, h / 2, _va.z)
  })
  pos.needsUpdate = true; m.geometry.computeVertexNormals()
}
function updateWrap() {
  spineG.updateMatrix(); coverHinge.updateMatrix()
  _fm[1].copy(spineG.matrix); _fm[2].multiplyMatrices(spineG.matrix, coverHinge.matrix)
  updateRibbon(wrapIns); updateRibbon(wrapInner); updateRibbon(sleeve); hingeSkins.forEach(updateRibbon)
}
function wrapTex() {
  const { pts, total } = wrapIns.userData
  const sA = pts[4].s, sB = pts[pts.length - 5].s // crease-A start, crease-B end
  const P = PX, Wc = Math.round(total * P), Hc = FRONT_H
  const [c, g] = ctx(Wc, Hc)
  g.drawImage(backTex(), 0, 0, Math.round(sA * P), Hc)
  g.drawImage(spineTex(), Math.round(sA * P), 0, Math.round((sB - sA) * P), Hc)
  g.drawImage(frontTex(), Math.round(sB * P), 0, Wc - Math.round(sB * P), Hc)
  return tex(c)
}
// Reverse (inside) print of a double-sided insert: alt art, mirrored so it reads correctly through the shell
function wrapInnerTex() {
  const { pts, total } = wrapIns.userData
  const sA = pts[4].s, sB = pts[pts.length - 5].s
  const P = PX, Wc = Math.round(total * P), Hc = FRONT_H
  const [c, g] = ctx(Wc, Hc)
  g.fillStyle = '#16100f'; g.fillRect(0, 0, Wc, Hc)
  const xA = Math.round(sA * P), xB = Math.round(sB * P)
  g.save(); g.translate(Wc, 0); g.scale(-1, 1) // mirror whole sheet: seen from inside the case
  // tray-side panel (behind disc) = left of sheet once mirrored
  const pw = Wc - xB
  // cover interior: back-cover style layout (photo C); tray side: dim key art behind the disc (photo B)
  // real double-sided insert of the user's copy: photo C (cover side) + photo B (tray side)
  g.drawImage(RE.inner_cover, 0, 0, pw, Hc)
  g.drawImage(RE.inner_tray, Wc - xA, 0, xA, Hc)
  g.fillStyle = '#10141c'; g.fillRect(pw, 0, Wc - xA - pw, Hc)
  g.restore(); return tex(c)
}
updateWrap()

// Disc
const R = 0.6, rH = 0.075, DT = 0.012
const disc = new THREE.Group(); scene.add(disc) // world-space so browse mode is independent of case
const dataMat = new THREE.MeshPhysicalMaterial({ color: 0x7d7396, metalness: 1, roughness: 0.14, anisotropy: 0.9, envMapIntensity: 0.9, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [250, 950], side: THREE.DoubleSide })
const mirrorMat = new THREE.MeshPhysicalMaterial({ color: 0xe8eaf2, metalness: 1, roughness: 0.04, side: THREE.DoubleSide })
const clearMat = new THREE.MeshPhysicalMaterial({ color: 0xdfe6f0, roughness: 0.06, transparent: true, opacity: 0.22, ior: 1.58, specularIntensity: 1, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false })
const labelMat = new THREE.MeshPhysicalMaterial({ roughness: 0.62, metalness: 0, envMapIntensity: 0.4, sheen: 0.25, sheenRoughness: 0.5, clearcoat: 0.12, clearcoatRoughness: 0.6 })
const discPick = []
function discRing(r0, r1, mat, z, flip) {
  const m = mesh(new THREE.RingGeometry(r0, r1, 128, 1), mat, disc, false); m.position.z = z; if (flip) m.rotation.y = Math.PI; discPick.push(m); return m
}
discRing(0.23, R - 0.002, dataMat, 0, true)
// Diffraction overlay: BD pits act like a circular grating → rainbow arcs whose hue shifts with view angle
const diffMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  uniforms: { uStr: { value: 0.75 } },
  vertexShader: `varying vec3 vP; varying vec3 vV; void main(){ vP = position; vec4 wp = modelMatrix*vec4(position,1.); vec3 camO = (inverse(modelMatrix)*vec4(cameraPosition,1.)).xyz; vV = normalize(camO-position); gl_Position = projectionMatrix*viewMatrix*wp; }`,
  fragmentShader: `uniform float uStr; varying vec3 vP; varying vec3 vV;
    vec3 hue(float h){ return clamp(abs(mod(h*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.); }
    void main(){ float r = length(vP.xy); vec2 t = normalize(vec2(-vP.y, vP.x)); vec3 L = normalize(vec3(0.5,0.8,0.6));
      vec3 H = normalize(vV + L); float g = dot(t, H.xy); float band = abs(g);
      float h = fract(g*2.6 + r*1.4);
      float a = pow(smoothstep(0.0,0.5,band),1.6) * (0.82+0.18*sin(r*55.)) * uStr * (1.-smoothstep(0.585,0.6,r));
      gl_FragColor = vec4(hue(h)*a, a); }`,
})
discRing(0.235, R - 0.004, diffMat, -0.0006, true)
discRing(0.17, 0.23, mirrorMat, 0, true)
discRing(rH, 0.17, clearMat, 0, true)
const labelRing = discRing(0.17, R - 0.002, labelMat, DT, false)
discRing(rH, 0.17, clearMat, DT, false)
{ const uv = labelRing.geometry.attributes.uv, p = labelRing.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / (2 * R) + 0.5, p.getY(i) / (2 * R) + 0.5) }
const edgeO = mesh(new THREE.CylinderGeometry(R, R, DT, 128, 1, true), clearMat, disc); edgeO.rotation.x = Math.PI / 2; edgeO.position.z = DT / 2; discPick.push(edgeO)
const edgeI = mesh(new THREE.CylinderGeometry(rH, rH, DT, 64, 1, true), clearMat, disc, false); edgeI.rotation.x = Math.PI / 2; edgeI.position.z = DT / 2
mesh(new THREE.TorusGeometry(0.168, 0.0025, 8, 96), clearMat, disc, false).position.z = DT
// clear stacking ring + clamping area on the data side
mesh(new THREE.TorusGeometry(0.2, 0.0022, 8, 96), clearMat, disc, false).position.z = -0.0008
mesh(new THREE.TorusGeometry(0.115, 0.0018, 8, 96), clearMat, disc, false).position.z = -0.0006
const shadowDisc = mesh(new THREE.CircleGeometry(R, 64), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }), disc); shadowDisc.position.z = DT / 2

// Seat position: on hub, just above tray (in root/base local → world via root)
function seatWorld(out = new THREE.Vector3()) {
  return out.set(DISC_X, DISC_Y, TRAY_Z + 0.005).applyMatrix4(root.matrixWorld)
}
const _seat = new THREE.Vector3()
const FLOAT = new THREE.Vector3(0, 1.1, 0) // disc-focus hover point (world)
disc.position.copy(seatWorld(_seat))

loaded.then(() => {
  wrapPaper.map = wrapTex(); wrapInnerPaper.map = wrapInnerTex(); wrapInnerPaper.needsUpdate = true
  labelMat.map = (() => { const t = new THREE.Texture(RE.disc); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true; return t })(); bkPaper.map = bookletCoverTex()
  ;[wrapPaper, labelMat, bkPaper].forEach((m) => (m.needsUpdate = true))
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
const caseMats = [shellMat, trayMat, filmMat, wrapPaper, bookletMat, bkPaper]

function q(id) { return document.getElementById(id) }
const ui = { bFlip: q('bFlip'), bOpen: q('bOpen'), bDisc: q('bDisc'), bBrowse: q('bBrowse'), bReset: q('bReset'), lang: q('lang') }
let lang = localStorage.getItem('game-catalog-lang') === 'en' ? 'en' : 'zh'
const T_ = {
  zh: {
    h1: 'PS5 游戏盒', sub: 'Resident Evil 4 Gold Edition · 书脊对开 · 按压卡扣取盘', flip: '翻面',
    open: '打开盒子', close: '合上盒子',
    take: '按压卡扣取盘', put: '放回盒子',
    browse: '查看光盘', exitBrowse: '退出查看',
    reset: '复位视角',
    hint: '拖动旋转 · 双指缩放/平移 · 点封面开盒 · 按压中心卡扣取盘',
    hintBrowse: '拖动旋转查看 · 点「翻面」看数据面 · 点「放回盒子」归位',
    back: '← 返回目录', lang: 'EN',
  },
  en: {
    h1: 'PS5 Game Case', sub: 'Resident Evil 4 Gold Edition · book-hinge · press hub to release', flip: 'Flip disc',
    open: 'Open case', close: 'Close case',
    take: 'Press hub to release', put: 'Reseat disc',
    browse: 'Inspect disc', exitBrowse: 'Exit inspect',
    reset: 'Reset view',
    hint: 'Drag to orbit · pinch zoom / two-finger pan (right- or shift-drag on desktop) · tap cover to open · press hub to release',
    hintBrowse: 'Orbit to inspect · Flip to see the data side · Reseat to return',
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
  ui.lang.textContent = t.lang; applyEnv()
  ui.bReset.textContent = t.reset
  ui.bOpen.textContent = openTarget ? t.close : t.open
  ui.bOpen.disabled = !!(outTarget || out > 0.02 || discFocus || hubPressTarget)
  ui.bDisc.textContent = (outTarget || discFocus) ? t.put : t.take
  ui.bDisc.disabled = !(openTarget && open > 0.65) && !discFocus && !(out > 0.5)
  // Browse toggles disc-focus when disc is already out
  ui.bBrowse.classList.toggle('hidden', !(out > 0.85 || discFocus))
  ui.bBrowse.disabled = out < 0.85 && !discFocus
  ui.bBrowse.textContent = discFocus ? t.exitBrowse : t.browse
  ui.bFlip.textContent = t.flip; ui.bFlip.classList.toggle('hidden', !discFocus)
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
  reseating = false
  releaseArmed = false
  hubPressTarget = 1
  syncUI()
}
function enterDiscFocus() {
  if (out < 0.85) return
  discFocus = true; userMoved = false
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
  discFocus = false; userMoved = false; flipT = 0
  focusDismissed = false
  outTarget = 0
  reseating = true
  syncUI()
}
ui.bOpen.onclick = toggleOpen
ui.bDisc.onclick = pressHubRelease
ui.bBrowse.onclick = () => { if (discFocus) exitDiscFocus(); else enterDiscFocus() }
ui.lang.onclick = () => { lang = lang === 'en' ? 'zh' : 'en'; try { localStorage.setItem('game-catalog-lang', lang) } catch {}; syncUI() }
q('bEnv').onclick = () => { envName = ENV_KEYS[(ENV_KEYS.indexOf(envName) + 1) % ENV_KEYS.length]; applyEnv() }
ui.bReset.onclick = () => { resetT = 1; userMoved = false }
let flip = 0, flipT = 0
ui.bFlip.onclick = () => { flipT = flipT ? 0 : 1 }
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
let reseating = false
let lastUiKey = ''
let caseAway = 0

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
  // disc back on the hub → let the sprung teeth re-expand
  if (reseating && out < 0.01) { reseating = false; hubPressTarget = 0 }

  // Auto-enter disc focus once disc has lifted clear (unless user dismissed or screenshot mode)
  if (outTarget === 1 && out > 0.92 && !discFocus && !focusDismissed && !qs.has('shot')) {
    discFocus = true; userMoved = false
    syncUI()
  }

  // Book hinge: cover swings sideways around spine Y
  const oe = easeIO(open)
  spineG.rotation.y = -oe * HINGE_MAX / 2
  coverHinge.rotation.y = -oe * HINGE_MAX / 2
  updateWrap()

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
      // subtle turntable idle spin about the disc's own axis + smooth flip between label and data side
      if (!qs.has('shot')) discSpin += dt * 0.35
      flip = step(flip, flipT, dt, 0.7)
      disc.rotation.set(-0.42, easeIO(flip) * Math.PI, 0)
      disc.rotateZ(discSpin)
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
  }

  // Dim case while browsing disc
  const dim = discFocus ? 0.35 : 1
  // (v7) shell opacity left as configured
  scene.environmentIntensity = discFocus ? 0.75 : envBase
  key.intensity = discFocus ? 0.7 : 2.05
  root.traverse((o) => {
    if (o.isMesh && o.material && o.material.color && o.parent !== disc) {
      // soft dim via material emissive trick — skip; instead scale env
    }
  })
  // Slightly push case back visually when focusing disc
  // case slides away + hides so the disc is inspected standalone
  const away = THREE.MathUtils.clamp((e - 0.35) / 0.65, 0, 1) * (discFocus || outTarget ? 1 : 0)
  caseAway += ((discFocus ? 1 : 0) - caseAway) * (1 - Math.exp(-dt * 4))
  root.position.x = -caseAway * 3.2
  root.visible = caseAway < 0.97
  blob.visible = root.visible
  discLights.forEach((l) => (l.visible = discFocus))
  root.position.y = H / 2 + 0.0005

  // Camera targets
  const camGoal = discFocus ? DISC_HOME : HOME
  const tgtGoal = discFocus ? DISC_TARGET : TARGET
  if (resetT || discFocus || (!discFocus && resetT === 0 && qs.has('shot'))) {
    // when entering/leaving focus, ease camera
  }
  if (resetT) {
    const k = 1 - Math.exp(-dt * 6)
    const cg = discFocus ? DISC_HOME : HOME, tg = discFocus ? DISC_TARGET : TARGET
    camera.position.lerp(cg, k); controls.target.lerp(tg, k)
    if (camera.position.distanceTo(cg) < 0.015) resetT = 0
  } else if (discFocus) {
    const k = 1 - Math.exp(-dt * 2.8)
    if (!userMoved) { controls.target.lerp(DISC_TARGET, k); camera.position.lerp(DISC_HOME, k * 0.6) }
    controls.minDistance = 0.35
    controls.maxDistance = 3.5
  } else {
    controls.minDistance = 0.5
    controls.maxDistance = 7
    if (qs.has('cam')) {
      // fixed camera for close-up shots
    } else if (userMoved) {
      // keep user's pan/orbit
    } else if (open > 0.3 && out < 0.1) {
      // nudge target slightly left so open book is framed
      _tmp.set(-0.35 * open, 0.85, 0)
      controls.target.lerp(_tmp, 1 - Math.exp(-dt * 1.5))
    } else {
      controls.target.lerp(TARGET, 1 - Math.exp(-dt * 1.2))
    }
  }

  const uiKey = `${open > 0.65}|${openTarget}|${out > 0.02}|${out > 0.5}|${out > 0.85}|${outTarget}|${hubPressTarget}|${discFocus}`
  if (uiKey !== lastUiKey) { lastUiKey = uiKey; syncUI() }

  controls.update()
  renderer.render(scene, camera)
}
renderer.setAnimationLoop(tick)
document.addEventListener('visibilitychange', () => renderer.setAnimationLoop(document.hidden ? null : tick))
addEventListener('pagehide', () => { renderer.setAnimationLoop(null); envRT.dispose(); renderer.dispose() })
syncUI()
window.__box = () => ({ open: +open.toFixed(2), hubPress: +hubPress.toFixed(2), out: +out.toFixed(2), discFocus })
window.__hubScreen = () => { const v = new THREE.Vector3(); btn.getWorldPosition(v); v.project(camera); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight] }

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
if (qs.has('ajar')) { openTarget = open = Number(qs.get('ajar')) || 0.35 }
if (qs.has('nobk')) booklet.visible = false
if (qs.has('nofilm')) sleeve.visible = false
if (qs.has('noshell')) { shellMat.visible = false; trayMat.visible = false }
if (qs.has('flip')) { flipT = flip = 1 }
