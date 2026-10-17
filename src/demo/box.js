import './box.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ItemRotator } from './itemRotate.js'
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
  ui.bSheet.textContent = sheetT ? t.sheetIn : t.sheetOut; ui.bSheet.disabled = (!sheetT && (!canSheet() || sheetK > 0)) || (sheetT && sheetK < 1)
  ui.bDisc.textContent = (outTarget || discFocus) ? t.put : t.take
  ui.bDisc.disabled = (!(openTarget && open > 0.65) && !discFocus && !(out > 0.5)) || (sheetK > 0 && !sheetDock)
  // Browse toggles disc-focus when disc is already out
  ui.bBrowse.classList.toggle('hidden', !(out > 0.85 || discFocus))
  ui.bBrowse.disabled = out < 0.85 && !discFocus
  ui.bBrowse.textContent = discFocus ? t.exitBrowse : t.browse
  ui.bFlip.textContent = t.flip; ui.bFlip.classList.toggle('hidden', !discFocus)
  document.body.classList.toggle('disc-focus', discFocus)
}
function canOpen() { return !(outTarget || out > 0.02 || discFocus || hubPressTarget || (sheetT && sheetK < 1) || (!sheetT && sheetK > 0)) }
let sheetK = 0, sheetT = 0, rotObj = 'case', sheetDock = false, dockK = 0, pendingSheetIn = false, discAway = 0
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
ui.bSheet.onclick = () => { if (sheetT) putSheetBack(); else if (canSheet()) { sheetT = 1; sheetDock = false; rot.reset(); syncUI() } }
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
const step = (v, t, dt, dur) => (t > v ? Math.min(t, v + dt / dur) : Math.max(t, v - dt / dur))
const HINGE_MAX = THREE.MathUtils.degToRad(178) // book open — almost flat
const clock = new THREE.Clock()
const _lift = new THREE.Vector3()
const _dock = new THREE.Vector3(), _tmp = new THREE.Vector3(), _ctr = new THREE.Vector3(), _sp = new THREE.Vector3(), _rq = new THREE.Quaternion(), _qI = new THREE.Quaternion(), _sq = new THREE.Quaternion(), _sM = new THREE.Matrix4(), _up = new THREE.Vector3(0, 1, 0), _qY180 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
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
  // ---- item rotation (camera fixed) + cover-sheet pull-out
  sheetK = step(sheetK, sheetT, dt, 2.2); dockK = step(dockK, sheetDock ? 1 : 0, dt, 0.7)
  if (pendingSheetIn && open < 0.01 && !openTarget && out < 0.01 && !outTarget) { pendingSheetIn = false; sheetDock = false; sheetT = 0; syncUI() }
  rot.update(dt)
  const act = discFocus ? 'disc' : sheetK > 0.34 && !sheetDock ? 'sheet' : 'case'
  if (act !== rotObj) { rotObj = act; rot.resetNow() }
  rot.quaternion(_rq)
  caseAway += (Math.max(discFocus ? 1 : 0, sheetDock ? 0 : THREE.MathUtils.smoothstep(sheetK, 0.4, 0.9)) - caseAway) * (1 - Math.exp(-dt * 4))
  discAway += ((discFocus ? 1 : 0) - discAway) * (1 - Math.exp(-dt * 4)) // card enlargement follows the CARD focus only
  root.quaternion.copy(act === 'case' ? _rq : _qI)
  _ctr.set(0, H / 2 + 0.0005, 0) // open book stays centred: pivot = centre of the opened spread
  root.position.copy(_ctr).sub(_tmp.set(-0.62 * oe, 0, 0).applyQuaternion(root.quaternion)).add(_tmp.set(-caseAway * 7, 0, 0))
  if (act === 'case') root.position.add(rot.offset(_ctr, _tmp))
  if (sheetK > 0) {
    const P = _sp.copy(TARGET).add(_tmp.set(0, 0.1, 0)).lerp(_dock.set(-1.15, 1.3, -0.5), easeIO(dockK)); if (act === 'sheet') P.add(rot.offset(P, _tmp))
    const dist = camera.position.distanceTo(P), vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * dist, vw = vh * camera.aspect
    const fit = Math.min(1, (0.86 * vw) / model.sheetSize.w, (0.66 * vh) / model.sheetSize.h) * (1 - 0.6 * easeIO(dockK))
    _sM.lookAt(camera.position, P, _up); _sq.setFromRotationMatrix(_sM).multiply(_qY180); if (act === 'sheet') _sq.premultiply(_rq)
    _sM.compose(P, _sq, _tmp.setScalar(fit)); model.setSheet(sheetK, _sM)
  } else model.setSheet(0)
  root.updateMatrixWorld(true)
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
      if (!qs.has('shot') && !rot.dragging) discSpin += dt * 0.35
      flip = step(flip, flipT, dt, 0.7)
      disc.rotation.set(-0.42, easeIO(flip) * Math.PI, 0)
      disc.rotateZ(discSpin)
      disc.quaternion.premultiply(_rq); disc.position.add(rot.offset(FLOAT, _tmp))
    } else {
      disc.rotation.set(-0.35 - k * 0.2, 0.55 + k * 0.4, 0.15)
    }
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
  if (!controls.enabled) { /* fixed camera */ } else if (resetT) {
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

  const uiKey = `${sheetK > 0}|${sheetK >= 1}|${sheetT}|${sheetDock}|${open > 0.65}|${openTarget}|${out > 0.02}|${out > 0.5}|${out > 0.85}|${outTarget}|${hubPressTarget}|${discFocus}`
  if (uiKey !== lastUiKey) { lastUiKey = uiKey; syncUI() }

  controls.update()
  renderer.render(scene, camera)
}
renderer.setAnimationLoop(tick)
document.addEventListener('visibilitychange', () => renderer.setAnimationLoop(document.hidden ? null : tick))
addEventListener('pagehide', () => { renderer.setAnimationLoop(null); envRT.dispose(); renderer.dispose() })
syncUI()
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
