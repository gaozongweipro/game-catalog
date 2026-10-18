import '../ui/tokens.css'
import './box.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ItemRotator } from './itemRotate.js'
import { Mover, BezierN, SOD3 } from './motion.js'
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
// The camera stays fixed (room/background never moves): drag turns the item, wheel/pinch brings it closer, right/two-finger drag nudges it.
controls.enabled = qs.has('orbit')
const rot = new ItemRotator(canvas, camera); rot.enabled = !qs.has('orbit')

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

import { createCaseModel, loadCaseParts, W, D } from './caseModel.js'
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js'
// Blender shell parts (procedural model if the GLB is missing/slow) + CC0 gallery HDRI reflections
if (!qs.has('procedural')) await Promise.race([loadCaseParts(BASE), new Promise((r) => setTimeout(r, 15000))]).catch((e) => console.warn('[box] case GLB failed, procedural fallback', e))
new HDRLoader().load(BASE + (mobile ? 'cab/gallery_512.hdr' : 'cab/gallery_1k.hdr'), (t) => { t.mapping = THREE.EquirectangularReflectionMapping; scene.environment = pmrem.fromEquirectangular(t).texture; t.dispose() }, undefined, () => {})
import { loadRE4 } from './art.js'
import { buildArt } from '../showcase/gen.js'
const PLAT = ['ns', 'ns2'].includes(qs.get('platform')) ? qs.get('platform') : 'ps5'
const model = createCaseModel({ renderer, scene, mobile, platform: PLAT })
const H = model.H
const { root, base, cover, coverPlate, spineG, coverHinge, hub, btn, btnHit, teeth, disc, discPick, shadowDisc, booklet, sleeve,
  shellMat, trayMat, filmMat, wrapPaper, bookletMat, bkPaper, labelMat, dataMat, updateWrap, seatWorld } = model
const _seat = new THREE.Vector3()
const FLOAT = TARGET.clone().lerp(HOME, 0.22).add(new THREE.Vector3(0, 0.22, 0))
if (PLAT === 'ps5') loadRE4(BASE).then((a) => model.setArt(a))
else { // Switch demo: generated print set from a sample cover (Game-Key Card on NS2 with ?key)
  const im = new Image(); im.onload = () => model.setArt(buildArt({ title: 'Resident Evil 4', platform: PLAT, keyCard: qs.has('key'), band: true, slots: {} }, { front: im })); im.src = BASE + 'demo/re4_front_art.jpg'
}
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
const ui = { bSheet: q('bSheet'), bFlip: q('bFlip'), bOpen: q('bOpen'), bDisc: q('bDisc'), bBrowse: q('bBrowse'), bReset: q('bReset'), lang: q('lang') }
let lang = localStorage.getItem('game-catalog-lang') === 'en' ? 'en' : 'zh'
const T_ = {
  zh: {
    h1: 'PS5 游戏盒', sub: 'Resident Evil 4 Gold Edition · 书脊对开 · 按压卡扣取盘', flip: '翻面',
    open: '打开盒子', close: '合上盒子',
    take: '按压卡扣取盘', put: '放回盒子',
    browse: '查看光盘', exitBrowse: '退出查看',
    reset: '复位', sheetOut: '抽出封面', sheetIn: '放回封面',
    hint: '拖动旋转盒子 · 滚轮/双指缩放 · 右键/双指平移 · 点封面开盒 · 按压中心卡扣取盘',
    hintBrowse: '拖动旋转查看 · 点「翻面」看数据面 · 点「放回盒子」归位',
    back: '← 返回目录', lang: 'EN',
  },
  en: {
    h1: 'PS5 Game Case', sub: 'Resident Evil 4 Gold Edition · book-hinge · press hub to release', flip: 'Flip disc',
    open: 'Open case', close: 'Close case',
    take: 'Press hub to release', put: 'Reseat disc',
    browse: 'Inspect disc', exitBrowse: 'Exit inspect',
    reset: 'Reset', sheetOut: 'Pull out cover', sheetIn: 'Put cover back',
    hint: 'Drag to turn the case · wheel/pinch to zoom · right- or two-finger drag to move · tap cover to open · press hub to release',
    hintBrowse: 'Orbit to inspect · Flip to see the data side · Reseat to return',
    back: '← Back to catalog', lang: '中文',
  },
}
if (PLAT !== 'ps5') { // Switch / Switch 2 copy
  const n = PLAT === 'ns2' ? 'Switch 2' : 'Switch'
  Object.assign(T_.zh, { h1: `${n} 游戏盒`, sub: `Resident Evil 4 · 书脊对开 · 按卡座取卡带${qs.has('key') ? ' · Game-Key Card' : ''}`, take: '取出卡带', put: '放回卡座', browse: '查看卡带', hint: '拖动旋转 · 双指缩放/平移 · 点封面开盒 · 点卡座取卡带', hintBrowse: '拖动旋转查看 · 点「翻面」看触点面 · 点「放回卡座」归位' })
  Object.assign(T_.en, { h1: `${n} Game Case`, sub: `Resident Evil 4 · book-hinge · tap the holder to take the card`, take: 'Take card', put: 'Put card back', browse: 'View card', flip: 'Flip card', hint: 'Drag to rotate · pinch to zoom/pan · tap cover to open · tap holder for the card', hintBrowse: 'Drag to inspect · Flip shows the contacts · Put back to reseat' })
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
  ui.bOpen.disabled = !canOpen()
  ui.bSheet.textContent = sheetT ? t.sheetIn : t.sheetOut; ui.bSheet.disabled = (!sheetT && (sheetK > 0 || pendingSheetOut)) || (sheetT && sheetK < 1)
  ui.bDisc.textContent = (outTarget || discFocus) ? t.put : t.take
  ui.bDisc.disabled = (!(openTarget && open > 0.65) && !discFocus && !(out > 0.5)) || (sheetK > 0 && !sheetDock)
  // Browse toggles disc-focus when disc is already out
  ui.bBrowse.classList.toggle('hidden', !(out > 0.85 || discFocus))
  ui.bBrowse.disabled = out < 0.85 && !discFocus
  ui.bBrowse.textContent = discFocus ? t.exitBrowse : t.browse
  ui.bFlip.textContent = t.flip; ui.bFlip.classList.toggle('hidden', !discFocus)
  document.body.classList.toggle('disc-focus', discFocus)
  // contextual emphasis (same rules as the showcase toolbar): one primary, one accent
  const st = sheetT ? 'sheet' : (outTarget || discFocus || out > 0.02) ? 'disc' : openTarget ? 'open' : 'case'
  ui.bOpen.classList.toggle('pri', st === 'case'); ui.bDisc.classList.toggle('acc', st === 'open'); ui.bDisc.classList.toggle('pri', st === 'disc'); ui.bSheet.classList.toggle('pri', st === 'sheet')
}
function canOpen() { return !(outTarget || out > 0.02 || discFocus || hubPressTarget || (sheetT && sheetK < 1) || (!sheetT && sheetK > 0)) }
let sheetK = 0, sheetT = 0, rotObj = 'case', sheetDock = false, dockK = 0, pendingSheetIn = false, pendingSheetOut = false, discAway = 0
function canSheet() { return !(openTarget || open > 0.01 || outTarget || out > 0.01 || hubPressTarget || discFocus) }
function toggleOpen() {
  if (!canOpen()) return
  if (sheetT) sheetDock = true // sheet out → park it so the case can be used
  openTarget = openTarget ? 0 : 1; rot.reset()
  syncUI()
}
function pressHubRelease() {
  if (discFocus) { reseatDisc(); return }
  if (outTarget || out > 0.5) { reseatDisc(); return }
  if (!openTarget || open < 0.65) return
  // Primary action: depress hub → retract teeth → lift disc → enter focus
  reseating = false; rot.reset()
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
  discFocus = false; userMoved = false; flipT = 0; rot.reset()
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
ui.bReset.onclick = () => { rot.reset(); if (controls.enabled) { resetT = 1; userMoved = false } }
function putSheetBack() { rot.reset(); if (!canSheet()) { pendingSheetIn = true; sheetDock = true; if (discFocus || outTarget) reseatDisc(); openTarget = 0 } else { sheetDock = false; sheetT = 0 } syncUI() }
// case open / disc out: close it (disc reseated) first, then slide the cover out (was: button disabled → "can't pull the cover")
ui.bSheet.onclick = () => { if (sheetT) putSheetBack(); else if (canSheet()) { sheetT = 1; sheetDock = false; rot.reset(); syncUI() } else if (!pendingSheetOut) { pendingSheetOut = true; rot.reset(); if (discFocus || outTarget) reseatDisc(); openTarget = 0; syncUI() } }
let flip = 0, flipT = 0
ui.bFlip.onclick = () => { flipT = flipT ? 0 : 1 }
q('back').href = BASE; q('toShowcase').href = BASE + 'showcase.html'; q('toShowcase').textContent = lang === 'en' ? '3D Showcase' : '3D 陈列柜'

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
  if (sheetDock && sheetK >= 1 && canSheet() && ray.intersectObject(model.sheetG, true).length) { sheetDock = false; rot.reset(); syncUI(); return }
  if (sheetK > 0 && !sheetDock) return
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
// velocity-continuous channels (minimum-jerk quintic from the current value + velocity + acceleration; see motion.js)
const RMb = matchMedia('(prefers-reduced-motion: reduce)')
const MVB = {}
function mvb(k, cur, goal, base, dt) {
  const m = MVB[k] || (MVB[k] = new Mover(cur))
  if (Math.abs(cur - m._out) > 1e-9) m.set(cur)
  if (m.active ? Math.abs(m.goal - goal) > 1e-9 : Math.abs(m.x - goal) > 1e-9) { const d = base * (0.45 + 0.55 * Math.sqrt(Math.min(1, Math.abs(goal - m.x)))); m.to(goal, RMb.matches ? Math.min(0.3, d * 0.4) : d) }
  m.step(dt); m._out = THREE.MathUtils.clamp(m.x, 0, 1); return m._out
}
const _cub = (a, b, c, d, k, out) => { const u = 1 - k; return out.set(0, 0, 0).addScaledVector(a, u * u * u).addScaledVector(b, 3 * u * u * k).addScaledVector(c, 3 * u * k * k).addScaledVector(d, k * k * k) }
// cover pull-out: the case slides DOWN off the sheet (pure slide along its up axis), then curves away underneath it
let casePathB = null
function sheetCasePathB() {
  const S = model.sheetSlide; if (casePathB && casePathB.S === S) return casePathB
  const p = new THREE.CurvePath(), a = new THREE.Vector3(0, -S, 0), e = new THREE.Vector3(-3.2, -S - 0.3, -0.4)
  const b = new BezierN([a, a.clone().add(new THREE.Vector3(0, -0.3, 0)), a.clone().add(new THREE.Vector3(0, -0.6, 0)), e.clone().add(new THREE.Vector3(1.6, 0, 0.12)), e])
  p.add(new THREE.LineCurve3(new THREE.Vector3(), a.clone())); p.add(b); p.S = S; p.kc = S / p.getLength(); return (casePathB = p)
}
const _qA = new THREE.Quaternion(), _qB = new THREE.Quaternion(), _qC = new THREE.Quaternion(), _eA = new THREE.Euler(), _zAx = new THREE.Vector3(0, 0, 1)
const _offB = new THREE.Vector3(), _latB = new THREE.Vector3(), _ancB = new THREE.Matrix4()
const HINGE_MAX = THREE.MathUtils.degToRad(178) // book open — almost flat
const clock = new THREE.Clock()
const _lift = new THREE.Vector3()
// camera fit: one fixed view direction (HOME → TARGET); the distance grows (never below the base) and the aim shifts so the
// item in its REST pose (no user rotation / pan / zoom) fits the visible area between the top bar / title and the button
// panel with FIT_M margin, centred in it. Followed by critically damped second-order dynamics (velocity-continuous).
const FIT_M = 0.06, _fb = new THREE.Box3(), _fb2 = new THREE.Box3(), _fm = new THREE.Matrix4(), _fi = new THREE.Matrix4(), _fcam = new THREE.PerspectiveCamera()
const _fz = new THREE.Vector3(), _fx = new THREE.Vector3(), _fy = new THREE.Vector3(), _fv = new THREE.Vector3(), _ft = new THREE.Vector3(), _fP = new THREE.Vector3(), _fQ = new THREE.Vector3()
const _fqR = new THREE.Quaternion(), _feR = new THREE.Euler(), fitPts = Array.from({ length: 16 }, () => new THREE.Vector3()), fitSodP = new SOD3(1.0, 1, 0, HOME), fitSodT = new SOD3(1.0, 1, 0, TARGET); let framing = 0, fitNoZoom = false
const sheetRestB = { P: new THREE.Vector3(), w: 1, h: 1 }
let _vis = null, _visT = -1
function visibleNdc() {
  const now = performance.now(); if (_vis && now - _visT < 300) return _vis
  const W = innerWidth, H = innerHeight; let top = 0, bot = H
  const tp = document.querySelector('header.top'); if (tp) for (const el of tp.querySelectorAll('a,button')) { const r = el.getBoundingClientRect(); if (r.height) top = Math.max(top, r.bottom) }
  const ti = document.querySelector('.title'); if (ti) { const r = ti.getBoundingClientRect(); if (r.height && r.width > W * 0.5) top = Math.max(top, r.bottom) }
  for (const sel of ['nav.panel', '#hint']) { const el = document.querySelector(sel), r = el && el.getBoundingClientRect(); if (r && r.height && r.width > W * 0.4) bot = Math.min(bot, r.top) }
  top = Math.min(top, H * 0.35); bot = Math.max(bot, H * 0.65); _vis = [-1, 1, 1 - (2 * bot) / H, 1 - (2 * top) / H]; _visT = now; return _vis
}
function fitContent() {
  let n = 0; fitNoZoom = false; const quad = (c, hw, hh) => { for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) fitPts[n++].copy(c).addScaledVector(_fx, a * hw).addScaledVector(_fy, b * hh) }
  const localBox = (o, skip) => { o.updateMatrixWorld(true); _fi.copy(o.matrixWorld).invert(); _fb.makeEmpty()
    o.traverse((m) => { if (!m.isMesh || !m.visible || !m.geometry) return; for (let q = m; q && q !== o; q = q.parent) if (skip && skip.includes(q)) return
      if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); _fb.union(_fb2.copy(m.geometry.boundingBox).applyMatrix4(_fm.multiplyMatrices(_fi, m.matrixWorld))) }); return _fb }
  // the flat sheet scales itself to the camera distance (screen size is distance-independent): centre it, keep the distance
  if (sheetK > 0.5 && !sheetDock) { fitNoZoom = true; quad(sheetRestB.P, sheetRestB.w / 2, sheetRestB.h / 2); return n }
  if (discFocus || out > 0.5) { const b = localBox(disc); if (b.isEmpty()) return 0; b.getSize(_fv); const r = (Math.hypot(_fv.x, _fv.y) / 2) * disc.scale.x; _fqR.setFromEuler(_feR.set(-0.42, 0, 0)) // spin-invariant: the circle it sweeps, in its focus tilt
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; fitPts[n++].copy(_fQ.set(Math.cos(a) * r, Math.sin(a) * r, 0).applyQuaternion(_fqR)).add(FLOAT) } return n }
  const b = localBox(root, [disc]); if (b.isEmpty()) return 0
  const rest = _fP.set(0, H / 2 + 0.0005, 0).add(_fQ.set(0.62 * open, 0, 0))
  for (let i = 0; i < 8; i++) fitPts[n++].set(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).add(rest)
  return n
}
function fitExt(t, D, n) {
  _fcam.position.copy(t).addScaledVector(_fz, D); _fcam.lookAt(t); _fcam.updateMatrixWorld(); _fcam.matrixWorldInverse.copy(_fcam.matrixWorld).invert()
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (let i = 0; i < n; i++) { const v = _fv.copy(fitPts[i]).project(_fcam); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y) }
  return [x0, x1, y0, y1]
}
const _fitOut = { p: new THREE.Vector3(), t: new THREE.Vector3() }
function boxFitPose() {
  const D0 = HOME.distanceTo(TARGET); _fz.copy(HOME).sub(TARGET).normalize(); _fx.crossVectors(camera.up, _fz).normalize(); _fy.crossVectors(_fz, _fx)
  const n = fitContent(); if (!n) { _fitOut.p.copy(HOME); _fitOut.t.copy(TARGET); return _fitOut }
  _fcam.fov = camera.fov; _fcam.aspect = camera.aspect; _fcam.near = camera.near; _fcam.far = camera.far; _fcam.updateProjectionMatrix()
  const [vx0, vx1, vy0, vy1] = visibleNdc(), mw = (vx1 - vx0) * (1 - 2 * FIT_M), mh = (vy1 - vy0) * (1 - 2 * FIT_M), xc = (vx0 + vx1) / 2, yc = (vy0 + vy1) / 2
  const tanY = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2), tanX = tanY * camera.aspect
  const t = _ft.copy(TARGET); let D = D0
  for (let it = 0; it < 3; it++) {
    const fits = (d) => { const e = fitExt(t, d, n); return e[1] - e[0] <= mw && e[3] - e[2] <= mh }
    if (fitNoZoom || fits(D0)) D = D0; else { let lo = D0, hi = D0 * 1.5; while (!fits(hi) && hi < D0 * 8) { lo = hi; hi *= 1.5 } for (let k = 0; k < 22; k++) { const m = (lo + hi) / 2; if (fits(m)) hi = m; else lo = m } D = hi }
    const e = fitExt(t, D, n); t.addScaledVector(_fx, ((e[0] + e[1]) / 2 - xc) * D * tanX).addScaledVector(_fy, ((e[2] + e[3]) / 2 - yc) * D * tanY)
  }
  _fitOut.t.copy(t); _fitOut.p.copy(t).addScaledVector(_fz, D); return _fitOut
}
function followFit(dt) {
  if (!framing) { fitSodP.reset(camera.position); fitSodT.reset(controls.target) } framing = 2
  const g = boxFitPose(); camera.position.copy(fitSodP.update(dt, g.p)); controls.target.copy(fitSodT.update(dt, g.t))
}
const _dock = new THREE.Vector3(), _tmp = new THREE.Vector3(), _ctr = new THREE.Vector3(), _sp = new THREE.Vector3(), _rq = new THREE.Quaternion(), _qI = new THREE.Quaternion(), _sq = new THREE.Quaternion(), _sM = new THREE.Matrix4(), _up = new THREE.Vector3(0, 1, 0), _qY180 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
let releaseArmed = false
let reseating = false
let lastUiKey = ''
let caseAway = 0

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05)
  open = mvb('open', open, openTarget, 0.95, dt)
  hubPress = mvb('hub', hubPress, hubPressTarget, 0.3, dt)

  // After hub fully pressed, release disc
  if (hubPressTarget === 1 && hubPress > 0.92 && !outTarget && !releaseArmed) {
    releaseArmed = true
    focusDismissed = false
    outTarget = 1
  }
  if (hubPressTarget === 0) releaseArmed = false

  out = mvb('out', out, outTarget, 1.1, dt)
  // disc back on the hub → let the sprung teeth re-expand
  if (reseating && out < 0.01) { reseating = false; hubPressTarget = 0 }

  // Auto-enter disc focus once disc has lifted clear (unless user dismissed or screenshot mode)
  if (outTarget === 1 && out > 0.92 && !discFocus && !focusDismissed && !qs.has('shot')) {
    discFocus = true; userMoved = false
    syncUI()
  }

  // Book hinge: cover swings sideways around spine Y
  const oe = open
  spineG.rotation.y = -oe * HINGE_MAX / 2
  coverHinge.rotation.y = -oe * HINGE_MAX / 2
  // ---- item rotation (camera fixed) + cover-sheet pull-out
  sheetK = mvb('sheetK', sheetK, sheetT, 2.5, dt); dockK = mvb('dockK', dockK, sheetDock ? 1 : 0, 0.8, dt)
  if (pendingSheetIn && open < 0.01 && !openTarget && out < 0.01 && !outTarget) { pendingSheetIn = false; sheetDock = false; sheetT = 0; syncUI() }
  if (pendingSheetOut && canSheet() && open < 0.01 && out < 0.01) { pendingSheetOut = false; sheetDock = false; sheetT = 1; rot.reset(); syncUI() }
  rot.update(dt)
  const CP = sheetCasePathB(), act = discFocus ? 'disc' : sheetK > CP.kc && !sheetDock ? 'sheet' : 'case'
  if (act !== rotObj) { rotObj = act; rot.resetNow() }
  rot.quaternion(_rq)
  caseAway = mvb('away', caseAway, discFocus ? 1 : 0, 0.95, dt)
  discAway = mvb('discAway', discAway, discFocus ? 1 : 0, 0.9, dt) // card enlargement follows the CARD focus only
  _offB.set(0, 0, 0); _latB.set(0, 0, 0)
  if (sheetK > 0) { const f = 1 - dockK; _offB.copy(CP.getPoint(Math.min(1, sheetK))).multiplyScalar(f); _latB.copy(_offB).sub(_tmp.set(0, -CP.S * Math.min(1, sheetK / CP.kc) * f, 0)) }
  root.quaternion.copy(act === 'case' ? _rq : _qI)
  _ctr.set(0, H / 2 + 0.0005, 0) // open book stays centred: pivot = centre of the opened spread
  root.position.copy(_ctr).sub(_tmp.set(-0.62 * oe, 0, 0).applyQuaternion(root.quaternion)).add(_tmp.set(-caseAway * 7, 0, 0)).add(_offB)
  if (act === 'case') root.position.add(rot.offset(_ctr, _tmp))
  if (sheetK > 0) {
    const P = _sp.copy(TARGET).add(_tmp.set(0, 0.1, 0)).lerp(_dock.set(-1.15, 1.3, -0.5), dockK); if (act === 'sheet') P.add(rot.offset(P, _tmp))
    const dist = camera.position.distanceTo(P), vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * dist, vw = vh * camera.aspect
    const fit = Math.min(1, (0.86 * vw) / model.sheetSize.w, (0.66 * vh) / model.sheetSize.h) * (1 - 0.6 * dockK)
    sheetRestB.P.copy(TARGET).add(_tmp.set(0, 0.1, 0)).lerp(_dock.set(-1.15, 1.3, -0.5), dockK); sheetRestB.w = model.sheetSize.w * fit; sheetRestB.h = model.sheetSize.h * fit
    _sM.lookAt(camera.position, P, _up); _sq.setFromRotationMatrix(_sM).multiply(_qY180); if (act === 'sheet') _sq.premultiply(_rq)
    _sM.compose(P, _sq, _tmp.setScalar(fit)); root.updateMatrixWorld(true)
    const anc = _latB.lengthSq() > 0 || caseAway > 0 ? _ancB.makeTranslation(_tmp.copy(_latB).negate().add(_lift.set(caseAway * 7, 0, 0))).multiply(root.matrixWorld) : null
    model.setSheet(sheetK, _sM, anc, CP.kc)
  } else model.setSheet(0)
  root.updateMatrixWorld(true)
  updateWrap()

  // Hub teeth retract radially + button sinks when pressed
  const pressE = hubPress
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
  const e = out
  // one continuous cubic Bézier: straight up off the hub, then on to the browse point (no stop between legs)
  _lift.copy(_seat).add(_tmp.set(0.05, 0.12, 0.35)); _cub(_seat, _lift, _dock.copy(FLOAT).add(_tmp.set(0.03, 0.04, -0.3)), FLOAT, e, disc.position)
  flip = mvb('flip', flip, flipT, 0.8, dt)
  {
    // travel pose (identity → tilted) blends into the focus pose (flip + idle spin) by the focus channel: no snap at hand-over
    const k = THREE.MathUtils.smoothstep(e, 0.02, 1)
    if (discFocus && !qs.has('shot') && !rot.dragging) discSpin += dt * 0.35
    _qA.setFromEuler(_eA.set((-0.35 - k * 0.2) * k, (0.55 + k * 0.4) * k, 0.15 * k))
    _qB.setFromEuler(_eA.set(-0.42, flip * Math.PI, 0)).multiply(_qC.setFromAxisAngle(_zAx, discSpin))
    disc.quaternion.slerpQuaternions(_qA, _qB, discAway)
    if (discFocus) { disc.quaternion.premultiply(_rq); disc.position.add(rot.offset(FLOAT, _tmp)) }
  }
  if (out < 0.01) {
    disc.position.copy(_seat)
    root.getWorldQuaternion(disc.quaternion)
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
  root.visible = true // moved aside, never hidden (a docked sheet lives in the case group)
  if (model.kind === 'cart') disc.scale.setScalar(1 + 1.8 * discAway)
  blob.visible = root.visible
  discLights.forEach((l) => (l.visible = discFocus))
  blob.position.x = root.position.x

  // Camera targets
  const camGoal = discFocus ? DISC_HOME : HOME
  const tgtGoal = discFocus ? DISC_TARGET : TARGET
  if (resetT || discFocus || (!discFocus && resetT === 0 && qs.has('shot'))) {
    // when entering/leaving focus, ease camera
  }
  framing = Math.max(0, framing - 1)
  if (!controls.enabled) { if (!qs.has('cam')) followFit(dt) } else if (resetT) {
    const k = 1 - Math.exp(-dt * 6)
    const fp = boxFitPose(), tg = fp.t, cg = fp.p
    camera.position.lerp(cg, k); controls.target.lerp(tg, k)
    if (camera.position.distanceTo(cg) < 0.015) { resetT = 0; framing = 0 }
  } else if (discFocus) {
    const k = 1 - Math.exp(-dt * 2.8)
    if (!userMoved) followFit(dt) // disc fitted + centred like every other state
    controls.minDistance = 0.35
    controls.maxDistance = 3.5
  } else {
    controls.minDistance = 0.5
    controls.maxDistance = 7
    if (qs.has('cam')) {
      // fixed camera for close-up shots
    } else if (userMoved) {
      // keep user's pan/orbit
    } else {
      // keep whatever is being looked at centred on screen (open book, case moving off for the cover, disc out): the target
      // follows the centre of the framed bounds on a critically damped spring and the camera pans with it (same view angle)
      followFit(dt)
    }
  }

  const uiKey = `${sheetK > 0}|${sheetK >= 1}|${sheetT}|${sheetDock}|${open > 0.65}|${openTarget}|${out > 0.02}|${out > 0.5}|${out > 0.85}|${outTarget}|${hubPressTarget}|${discFocus}`
  if (uiKey !== lastUiKey) { lastUiKey = uiKey; syncUI() }

  if (framing) controls.maxDistance = Math.max(controls.maxDistance, _fitOut.p.distanceTo(_fitOut.t) + 1) // OrbitControls clamps the radius even while disabled
  controls.update()
  renderer.render(scene, camera)
}
renderer.setAnimationLoop(tick)
document.addEventListener('visibilitychange', () => renderer.setAnimationLoop(document.hidden ? null : tick))
addEventListener('pagehide', () => { renderer.setAnimationLoop(null); envRT.dispose(); renderer.dispose() })
syncUI()
// screen-space centring probe (NDC x/y of projected bbox centres; 0 = viewport centre)
window.__boxCenter = () => {
  camera.updateMatrixWorld(); const pr = (o) => { // exact silhouette extents: project every (strided) vertex of every visible mesh
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; const v = new THREE.Vector3()
    o.traverseVisible((m) => { if (!m.isMesh || !m.geometry?.attributes.position) return; const a = m.geometry.attributes.position, st = Math.max(1, Math.floor(a.count / 4000))
      for (let i = 0; i < a.count; i += st) { v.fromBufferAttribute(a, i).applyMatrix4(m.matrixWorld).project(camera); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y) } })
    return x0 > x1 ? null : { cx: +((x0 + x1) / 2).toFixed(4), cy: +((y0 + y1) / 2).toFixed(4), w: +(x1 - x0).toFixed(3), e: [x0, x1, y0, y1].map((q) => +q.toFixed(3)) } }
  const what = sheetK > 0.5 ? 'sheet' : out > 0.5 || discFocus ? 'disc' : 'case'
  const lb = new THREE.Box3(); disc.updateMatrixWorld(true); const inv = disc.matrixWorld.clone().invert(); disc.traverse((m) => { if (m.isMesh) { if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); lb.union(m.geometry.boundingBox.clone().applyMatrix4(inv.clone().multiply(m.matrixWorld))) } })
  const dd = { dp: disc.position.toArray().map((v) => +v.toFixed(3)), F: FLOAT.toArray().map((v) => +v.toFixed(3)), lc: lb.getCenter(new THREE.Vector3()).toArray().map((v) => +v.toFixed(3)), ls: lb.getSize(new THREE.Vector3()).toArray().map((v) => +v.toFixed(3)), sc: disc.scale.x, par: disc.parent.type, fitT: _fitOut.t.toArray().map((v) => +v.toFixed(3)) }
  return { dd, vis: visibleNdc().map((v) => +v.toFixed(3)), D: +camera.position.distanceTo(controls.target).toFixed(2), dbg: [controls.enabled, userMoved, resetT, framing, discFocus, +sheetK.toFixed(2), sheetDock, +open.toFixed(2)], what, foc: pr(what === 'sheet' ? model.sheetG : what === 'disc' ? disc : root), cam: camera.position.toArray().map((v) => +v.toFixed(3)), tg: controls.target.toArray().map((v) => +v.toFixed(3)) }
}
window.__box = () => ({ kids: root.children.length, sheetKids: model.sheetG.children.length, dock: sheetDock, discScale: +disc.scale.x.toFixed(2), open: +open.toFixed(2), hubPress: +hubPress.toFixed(2), out: +out.toFixed(2), discFocus, sheet: +sheetK.toFixed(2), yaw: +rot.yaw.toFixed(2), obj: rotObj, cam: camera.position.toArray().map((v) => +v.toFixed(4)) })
window.__boxRot = (y, p) => rot.set(y, p || 0)
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
