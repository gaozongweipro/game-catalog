import './showcase.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { createCaseModel, platformSpec, W, H, D } from '../demo/caseModel.js'
import { loadRE4 } from '../demo/art.js'
import { db, uid, exportCollection, importCollection } from './db.js'
import { searchCatalog, searchWiki, fetchImageBlob, loadCatalog, norm } from './lookup.js'
import { resample, bitmapSize, prepareRetail } from './gen.js'
import { TEMPLATES, templatesFor, NS_BAND, NS2_BAND, NS2_FRAME, BLEED, canvas, downscale, blobToImage, drawCropped, buildArt } from './gen.js'
import { BANNER } from '../demo/caseModel.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

const BASE = import.meta.env.BASE_URL
const qs = new URLSearchParams(location.search)
const $ = (id) => document.getElementById(id)
const mobile = matchMedia('(pointer: coarse)').matches || innerWidth < 700
let lang = localStorage.getItem('game-catalog-lang') === 'en' ? 'en' : 'zh'

// ---------------- i18n ----------------
const S = {
  zh: { brandT: '陈列柜', brandS: '我的电子实体版', vSpine: '书脊', vFront: '正面', makeT: '制作', loadT: '正在布置展柜…', emptyH: '展柜还是空的', emptyP: '上传封面，制作你的第一张电子实体版', emptyBtn: '开始制作',
    mExport: '导出收藏', mImport: '导入收藏', iBackT: '放回展柜', open: '打开', close: '合上', take: '取盘', put: '放回光盘', flip: '翻面', iEdit: '编辑', iLeft: '前移', iRight: '后移', iDel: '删除',
    eNew: '制作电子实体版', eEdit: '编辑电子实体版', eCancel: '取消', eSave: '保存', lTitle: '游戏名称', lBand: '平台标识', lKey: 'Game-Key Card（钥匙卡）', platNote: '', pn_ps5: 'PS5 蓝色 Blu-ray 盒 · 135×171×13.5 mm', pn_ns: 'Switch 透明盒 + 深灰卡带 · 105×170×11 mm', pn_ns2: 'Switch 2 半透红盒 + 红色卡带 · 105×170×11 mm', takeC: '取卡带', lkSearching: '正在搜索…', lkNone: '没有找到匹配，可上传封面，或直接保存（会根据名称生成封面）', lkWeb: '联网结果', lkCat: '目录', lkPick: '选一个自动填充封面与信息', lkFilled: '已自动填充：%s', lkFail: '封面下载失败，已保留其他信息', untitled: '未命名', putC: '放回卡带', guideFrame: '红色边框', slotNote: '全部可选：输入游戏名会自动联网查找封面并补全，未填的部分自动生成；点卡片可上传或裁切。',
    cHint: '拖动移动 · 双指或滚轮缩放', cReset: '重置', cReplace: '换图', cRemove: '移除', cDone: '完成', auto: '自动生成', uploaded: '已上传', required: '必填', back: '←',
    sample: '示例 · 我的实体收藏', made: '电子实体版', needTitle: '请填写游戏名称', needFront: '请上传正面封面', saved: '已保存到展柜', deleted: '已删除', delQ: '确定删除「%s」吗？', exported: '已导出', imported: '已导入 %d 项', badFile: '文件无法识别',
    sampleRO: '示例条目不能编辑', processing: '处理中…', guideBand: 'PS5 顶条区域', guideBleed: '出血线', hub: '中心孔', title: '3D 陈列柜 · 我的电子实体版' },
  en: { brandT: 'Showcase', brandS: 'My digital physical editions', vSpine: 'Spines', vFront: 'Fronts', makeT: 'Create', loadT: 'Setting up the cabinet…', emptyH: 'The cabinet is empty', emptyP: 'Upload a cover to make your first digital physical edition', emptyBtn: 'Get started',
    mExport: 'Export collection', mImport: 'Import collection', iBackT: 'Back to shelf', open: 'Open', close: 'Close', take: 'Take disc', put: 'Put disc back', flip: 'Flip', iEdit: 'Edit', iLeft: 'Move left', iRight: 'Move right', iDel: 'Delete',
    eNew: 'New digital edition', eEdit: 'Edit digital edition', eCancel: 'Cancel', eSave: 'Save', lTitle: 'Game title', lBand: 'Platform logo', lKey: 'Game-Key Card', platNote: '', pn_ps5: 'PS5 blue Blu-ray case · 135×171×13.5 mm', pn_ns: 'Switch clear case + dark-grey card · 105×170×11 mm', pn_ns2: 'Switch 2 translucent red case + red card · 105×170×11 mm', takeC: 'Take card', lkSearching: 'Searching…', lkNone: 'No match. Upload a cover or just save (a cover will be generated from the name)', lkWeb: 'Web', lkCat: 'Catalog', lkPick: 'Pick one to auto-fill cover and details', lkFilled: 'Auto-filled: %s', lkFail: 'Cover download failed; other details kept', untitled: 'Untitled', putC: 'Put card back', guideFrame: 'Red frame', slotNote: 'Everything is optional: type a game name to look up the cover online; anything left blank is generated. Tap a card to upload or crop.',
    cHint: 'Drag to move · pinch or scroll to zoom', cReset: 'Reset', cReplace: 'Replace', cRemove: 'Remove', cDone: 'Done', auto: 'Auto', uploaded: 'Uploaded', required: 'Required', back: '←',
    sample: 'Sample · my physical copy', made: 'Digital physical edition', needTitle: 'Please enter a title', needFront: 'Please upload a front cover', saved: 'Saved to the cabinet', deleted: 'Deleted', delQ: 'Delete “%s”?', exported: 'Exported', imported: 'Imported %d item(s)', badFile: 'Unrecognised file',
    sampleRO: 'The sample entry is read-only', processing: 'Processing…', guideBand: 'PS5 band', guideBleed: 'Bleed', hub: 'Hub', title: '3D Showcase · digital physical editions' },
}
const t = (k) => S[lang][k] ?? k
function syncLang() {
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN'; document.title = t('title')
  for (const k of ['brandT', 'brandS', 'vSpine', 'vFront', 'makeT', 'loadT', 'emptyH', 'emptyP', 'emptyBtn', 'mExport', 'mImport', 'iBackT', 'iEdit', 'iLeft', 'iRight', 'iDel', 'eCancel', 'eSave', 'lTitle', 'lBand', 'lKey', 'slotNote', 'cHint', 'cReset', 'cReplace', 'cRemove', 'cDone']) { const el = $(k); if (el) el.textContent = t(k) }
  $('langBtn').textContent = lang === 'en' ? '中文' : 'EN'; $('back').href = BASE
  syncInspectUI(); if (editing) renderSlots()
}
function toast(msg) { const el = $('toast'); el.textContent = msg; el.classList.remove('hidden'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.add('hidden'), 2200) }

// ---------------- renderer / scene ----------------
const cv = $('c')
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: qs.has('shot') })
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2))
renderer.outputColorSpace = THREE.SRGBColorSpace
// Khronos PBR Neutral keeps print colours (covers) hue-accurate while still rolling off highlights
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap
RectAreaLightUniformsLib.init()
const scene = new THREE.Scene()
const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.32
scene.background = new THREE.Color(0x1b1916)
const camera = new THREE.PerspectiveCamera(mobile ? 46 : 36, 1, 0.05, 80)
const controls = new OrbitControls(camera, cv)
controls.enableDamping = true; controls.dampingFactor = 0.08; controls.screenSpacePanning = true
controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }
let auto = true
controls.addEventListener('start', () => { auto = false; dirty = 3 })
controls.addEventListener('change', () => { dirty = 2; clampPan() })
// Cabinet view is a framed shot, not a free orbit: ±15° azimuth, ±11° polar, short dolly range, pan clamped to the cabinet.
let snapTimer = 0
controls.addEventListener('end', () => { clearTimeout(snapTimer); if (mode === 'shelf') snapTimer = setTimeout(() => { if (mode === 'shelf') goCam(camShelfGoal()) }, 2600) })
function applyLimits() {
  if (mode === 'shelf') {
    const g = camShelfGoal(), sph = new THREE.Spherical().setFromVector3(g.p.clone().sub(g.t)), A = THREE.MathUtils.degToRad(15), P = THREE.MathUtils.degToRad(11)
    Object.assign(controls, { minAzimuthAngle: sph.theta - A, maxAzimuthAngle: sph.theta + A, minPolarAngle: sph.phi - P, maxPolarAngle: Math.min(Math.PI / 2 - 0.05, sph.phi + P), minDistance: sph.radius * 0.5, maxDistance: sph.radius * 1.12, enablePan: true, rotateSpeed: 0.5 })
  } else Object.assign(controls, { minAzimuthAngle: -Infinity, maxAzimuthAngle: Infinity, minPolarAngle: 0.25, maxPolarAngle: Math.PI / 2 + 0.3, minDistance: 0.9, maxDistance: 9, enablePan: true, rotateSpeed: 1 })
}
const _pc = new THREE.Vector3()
function clampPan() {
  if (mode !== 'shelf') return
  const c = cabinetCenter(), t = controls.target
  _pc.set(THREE.MathUtils.clamp(t.x, c.x - CW / 2, c.x + CW / 2), THREE.MathUtils.clamp(t.y, PLINTH + 0.3, PLINTH + NSH * SP - 0.3), THREE.MathUtils.clamp(t.z, -0.6, 0.6))
  if (!_pc.equals(t)) { const d = _pc.clone().sub(t); t.add(d); camera.position.add(d) }
}
const par = new THREE.Vector2()
addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') par.set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5) })

// ---------------- gallery lighting ----------------
// Dim warm room fill; the exhibit is lit by 2900K track spots + per-shelf LED grazers (lightRig below).
const hemi = new THREE.HemisphereLight(0xfff3e4, 0x5a5048, 0.12); scene.add(hemi)
const key = new THREE.DirectionalLight(0xffe9d2, 0.32); key.position.set(4, 9, 8); key.castShadow = false
key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048); key.shadow.radius = 6; key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02
Object.assign(key.shadow.camera, { left: -6, right: 6, top: 9, bottom: -1, near: 1, far: 30 }); scene.add(key); scene.add(key.target)
// polished micro-terrazzo / concrete floor: low roughness + clearcoat gives soft reflections of the spot pools
function concreteTex() {
  const n = 1024, c = canvas(n, n), g = c.getContext('2d'); g.fillStyle = '#8e8780'; g.fillRect(0, 0, n, n)
  for (let i = 0; i < 26; i++) { const x = Math.random() * n, y = Math.random() * n, r = 80 + Math.random() * 260, gr = g.createRadialGradient(x, y, 0, x, y, r); const v = Math.random() < 0.5 ? '255,250,240' : '60,55,50'; gr.addColorStop(0, `rgba(${v},0.07)`); gr.addColorStop(1, `rgba(${v},0)`); g.fillStyle = gr; g.fillRect(0, 0, n, n) }
  for (let i = 0; i < 26000; i++) { const v = Math.random(); g.fillStyle = v < 0.5 ? `rgba(40,36,32,${Math.random() * 0.25})` : `rgba(235,230,222,${Math.random() * 0.22})`; g.fillRect(Math.random() * n, Math.random() * n, 1 + Math.random() * 2, 1 + Math.random() * 2) }
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(8, 8); tx.anisotropy = 8; return tx
}
const floorMat = new THREE.MeshPhysicalMaterial({ map: concreteTex(), color: 0x9a938b, roughness: 0.42, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.16, envMapIntensity: 0.6 })
const floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 60), floorMat); floor.rotation.x = -Math.PI / 2; floor.position.set(40, 0, 10); floor.receiveShadow = true; scene.add(floor)
// back wall: warm gallery grey with a vertical gradient (lighter at eye level, darker toward ceiling + skirting)
function wallTex() {
  const c = canvas(16, 512), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 512)
  gr.addColorStop(0, '#2c2824'); gr.addColorStop(0.4, '#6d655c'); gr.addColorStop(0.8, '#7d7469'); gr.addColorStop(0.97, '#6f675e'); gr.addColorStop(1, '#3a3530')
  g.fillStyle = gr; g.fillRect(0, 0, 16, 512); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx
}
const wall = new THREE.Mesh(new THREE.PlaneGeometry(160, 16), new THREE.MeshStandardMaterial({ map: wallTex(), roughness: 0.95 })); wall.position.set(40, 8, -2.2); wall.receiveShadow = true; scene.add(wall)
const skirting = new THREE.Mesh(new THREE.BoxGeometry(160, 0.14, 0.04), new THREE.MeshStandardMaterial({ color: 0x2c2825, roughness: 0.6 })); skirting.position.set(40, 0.07, -2.18); scene.add(skirting)

// ---------------- cabinets (solid oak, paged side by side) ----------------
const CW = 5.7, CD = 1.9, SP = 2.2, PLINTH = 0.42, FT = 0.16 // inner width, depth, shelf pitch, plinth, frame thickness
const NSH = 3, ROWS_PER_CAB = NSH, CAB_GAP = 0.9, CAB_PITCH = CW + 2 * FT + CAB_GAP
let page = 0, nCab = 1
const cabinet = new THREE.Group(); scene.add(cabinet)
function grainCanvas(w, h, seed = 1) { // procedural oak: base colour + height (for normal) + roughness
  const col = canvas(w, h), g = col.getContext('2d'), hc = canvas(w, h), hg = hc.getContext('2d'), rc = canvas(w, h), rg = rc.getContext('2d')
  g.fillStyle = '#b48858'; g.fillRect(0, 0, w, h); hg.fillStyle = '#808080'; hg.fillRect(0, 0, w, h); rg.fillStyle = '#9a9a9a'; rg.fillRect(0, 0, w, h)
  let r = seed * 9301; const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280)
  for (let i = 0; i < 220; i++) {
    const y = rnd() * h, a = 0.04 + rnd() * 0.12, lw = 0.5 + rnd() * 3.2, ph = rnd() * 9, amp = 2 + rnd() * 6
    const path = () => { g.beginPath(); for (let x = 0; x <= w; x += 16) { const yy = y + Math.sin(x * 0.003 + ph) * amp + Math.sin(x * 0.019 + i) * 1.1; x ? g.lineTo(x, yy) : g.moveTo(x, yy) } }
    g.strokeStyle = `rgba(${95 + rnd() * 40},${62 + rnd() * 20},${32},${a})`; g.lineWidth = lw; path(); g.stroke()
    hg.strokeStyle = `rgba(40,40,40,${a * 1.6})`; hg.lineWidth = lw; hg.beginPath(); for (let x = 0; x <= w; x += 16) { const yy = y + Math.sin(x * 0.003 + ph) * amp + Math.sin(x * 0.019 + i) * 1.1; x ? hg.lineTo(x, yy) : hg.moveTo(x, yy) } hg.stroke()
    rg.strokeStyle = `rgba(230,230,230,${a})`; rg.lineWidth = lw; rg.beginPath(); for (let x = 0; x <= w; x += 16) { const yy = y + Math.sin(x * 0.003 + ph) * amp; x ? rg.lineTo(x, yy) : rg.moveTo(x, yy) } rg.stroke()
  }
  for (let i = 0; i < 18; i++) { const x = rnd() * w, y = rnd() * h; g.fillStyle = 'rgba(110,70,35,.10)'; g.beginPath(); g.ellipse(x, y, 10 + rnd() * 20, 3 + rnd() * 4, 0, 0, 7); g.fill() } // pores / knots
  // height → normal map
  const hd = hg.getImageData(0, 0, w, h).data, nc = canvas(w, h), ng = nc.getContext('2d'), nd = ng.createImageData(w, h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4, hx = hd[(y * w + ((x + 1) % w)) * 4] - hd[i], hy = hd[(((y + 1) % h) * w + x) * 4] - hd[i]
    const nx = -hx / 255 * 3, ny = -hy / 255 * 3, l = Math.hypot(nx, ny, 1); nd.data[i] = (nx / l * 0.5 + 0.5) * 255; nd.data[i + 1] = (ny / l * 0.5 + 0.5) * 255; nd.data[i + 2] = (1 / l * 0.5 + 0.5) * 255; nd.data[i + 3] = 255
  }
  ng.putImageData(nd, 0, 0)
  const T = (c, srgb) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t }
  return { map: T(col, true), normalMap: T(nc), roughnessMap: T(rc) }
}
const WOOD = grainCanvas(1024, 256, 3)
function woodMat(rot = 0, rep = [1, 1]) {
  const m = new THREE.MeshPhysicalMaterial({ roughness: 0.62, clearcoat: 0.35, clearcoatRoughness: 0.4, normalScale: new THREE.Vector2(0.6, 0.6), sheen: 0.15 })
  for (const k of ['map', 'normalMap', 'roughnessMap']) { const t = WOOD[k].clone(); t.rotation = rot; t.repeat.set(...rep); t.needsUpdate = true; m[k] = t }
  return m
}
const frameMat = woodMat(0, [1.5, 1]), frameMatV = woodMat(Math.PI / 2, [1.5, 1]), shelfWood = woodMat(0, [2, 0.5])
function washTex() {
  const c = canvas(256, 256), g = c.getContext('2d'), gr = g.createRadialGradient(128, 0, 0, 128, 0, 230)
  gr.addColorStop(0, 'rgba(255,236,205,.85)'); gr.addColorStop(0.45, 'rgba(255,236,205,.28)'); gr.addColorStop(1, 'rgba(255,236,205,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256)
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx
}
const washMat = new THREE.MeshBasicMaterial({ map: washTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.3 })
function aoTex() { // soft contact shadow / AO blob
  const c = canvas(256, 256), g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 20, 128, 128, 128)
  gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(0.6, 'rgba(0,0,0,.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c)
}
const aoMat = new THREE.MeshBasicMaterial({ map: aoTex(), transparent: true, depthWrite: false })
const cornerAO = new THREE.MeshBasicMaterial({ map: (() => { const c = canvas(64, 256), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 64, 0); gr.addColorStop(0, 'rgba(40,25,10,.35)'); gr.addColorStop(1, 'rgba(40,25,10,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 256); return new THREE.CanvasTexture(c) })(), transparent: true, depthWrite: false })
function streakTex() {
  const c = canvas(256, 512), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 256, 512)
  gr.addColorStop(0.0, 'rgba(255,255,255,0)'); gr.addColorStop(0.38, 'rgba(255,255,255,0)'); gr.addColorStop(0.45, 'rgba(255,255,255,.22)'); gr.addColorStop(0.5, 'rgba(255,255,255,.05)'); gr.addColorStop(0.56, 'rgba(255,255,255,.14)'); gr.addColorStop(0.62, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = gr; g.fillRect(0, 0, 256, 512); return new THREE.CanvasTexture(c)
}
const streakMat = new THREE.MeshBasicMaterial({ map: streakTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.35, side: THREE.DoubleSide })
function linenTex() {
  const c = canvas(512, 512), g = c.getContext('2d'); g.fillStyle = '#ece7df'; g.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '120,105,85'},${Math.random() * 0.05})`; g.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 3, 1) }
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(3, 3); return tx
}
const backMat = new THREE.MeshStandardMaterial({ map: linenTex(), color: 0xb3aa9d, roughness: 0.92 })
// 10 mm float glass: faint green body, strong clearcoat reflections of the room env, green edges
const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xeaf6f0, roughness: 0.03, metalness: 0, transparent: true, opacity: 0.22, clearcoat: 1, clearcoatRoughness: 0.02, specularIntensity: 1, envMapIntensity: 1.4, depthWrite: false })
const glassEdge = new THREE.MeshPhysicalMaterial({ color: 0x6fb89a, roughness: 0.08, transparent: true, opacity: 0.85, clearcoat: 1, envMapIntensity: 1.2 })
const doorGlass = new THREE.MeshPhysicalMaterial({ color: 0xf4fbf8, roughness: 0.02, transparent: true, opacity: 0.06, clearcoat: 1, clearcoatRoughness: 0.02, specularIntensity: 1, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide })
const brass = new THREE.MeshPhysicalMaterial({ color: 0xc9a46a, metalness: 1, roughness: 0.28, clearcoat: 0.3 })
const alu = new THREE.MeshPhysicalMaterial({ color: 0xb8bcc0, metalness: 1, roughness: 0.35 })
const ledMat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(5.2, 4.3, 3.2) }) // HDR → picked up by bloom
const doors = []
let shelfY = []
const RB = {}
function rbox(w, h, d, r = 0.012) { const k = [w, h, d, r].map((v) => v.toFixed(3)).join(); return (RB[k] ||= new RoundedBoxGeometry(w, h, d, 3, r)) }
function box(w, h, d, mat, parent, x, y, z, cast = true, r = 0) {
  const m = new THREE.Mesh(r ? rbox(w, h, d, r) : new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m
}
function plane(w, h, mat, parent, x, y, z, rx = 0, ry = 0) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); parent.add(m); return m }
for (let i = 0; i < NSH; i++) shelfY.push(PLINTH + i * SP + (i === 0 ? 0 : 0.04))
function buildOne(ci) {
  const G = new THREE.Group(); G.position.x = ci * CAB_PITCH; cabinet.add(G)
  const inH = NSH * SP, outW = CW + 2 * FT, outH = inH + PLINTH + FT, DD = CD + FT
  // carcass: thick bevelled oak sides, top and back
  box(FT, outH, DD, frameMatV, G, -CW / 2 - FT / 2, outH / 2, 0, true, 0.02)
  box(FT, outH, DD, frameMatV, G, CW / 2 + FT / 2, outH / 2, 0, true, 0.02)
  box(outW, FT, DD, frameMat, G, 0, outH - FT / 2, 0, true, 0.02)
  // crown moulding: stepped, overhanging profile
  box(outW + 0.12, 0.06, DD + 0.1, frameMat, G, 0, outH + 0.03, 0.05, true, 0.02)
  box(outW + 0.22, 0.07, DD + 0.17, frameMat, G, 0, outH + 0.095, 0.085, true, 0.03)
  box(outW + 0.16, 0.035, DD + 0.13, frameMat, G, 0, outH + 0.15, 0.065, true, 0.015)
  // plinth: recessed toe-kick + overhanging base board
  box(outW - 0.1, PLINTH - 0.08, DD - 0.12, new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 0.8 }), G, 0, (PLINTH - 0.08) / 2, -0.04)
  box(outW + 0.04, 0.09, DD + 0.04, frameMat, G, 0, PLINTH - 0.045, 0.01, true, 0.02)
  box(CW, inH, 0.05, backMat, G, 0, PLINTH + inH / 2, -CD / 2 + 0.025, false)
  // inner corner AO strips
  for (const sx of [-1, 1]) { const a = plane(0.25, inH, cornerAO, G, sx * (CW / 2 - 0.125), PLINTH + inH / 2, -CD / 2 + 0.052); a.scale.x = -sx }
  for (let i = 0; i < NSH; i++) {
    const y = PLINTH + i * SP
    if (i > 0) { // 10 mm glass shelf on brass pins, green polished edge
      const g = box(CW - 0.02, 0.03, CD - 0.1, glassMat, G, 0, y + 0.015, -0.01, false); g.renderOrder = 1
      box(CW - 0.02, 0.03, 0.012, glassEdge, G, 0, y + 0.015, CD / 2 - 0.066, false)
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.03, 0.012, 0.012, brass, G, sx * (CW / 2 - 0.02), y - 0.006, sz * (CD / 2 - 0.25), false)
    } else box(CW, 0.05, CD, shelfWood, G, 0, y - 0.025, 0, false, 0.008) // solid base shelf
    // LED housing: aluminium channel with diffuser under the shelf above
    const top = y + SP
    box(CW - 0.3, 0.035, 0.06, alu, G, 0, top - 0.035, CD / 2 - 0.13, false, 0.006)
    box(CW - 0.34, 0.01, 0.04, ledMat, G, 0, top - 0.055, CD / 2 - 0.13, false)
    plane(CW, SP * 0.95, washMat, G, 0, top - SP * 0.475, -CD / 2 + 0.055)
    if (!i) plane(CW - 0.1, 0.5, aoMat, G, 0, y + 0.004, -0.2, -Math.PI / 2).scale.y = 2.4 // soft contact shadow on the solid base
  }
  // floor contact shadow under the cabinet
  plane(outW + 0.9, DD + 0.9, aoMat, G, 0, 0.003, 0, -Math.PI / 2)
  // framed glass doors on brass barrel hinges with bar pulls
  for (const sx of [-1, 1]) {
    const pivot = new THREE.Group(); pivot.position.set(sx * (CW / 2 + FT * 0.5), PLINTH, CD / 2 + FT / 2 + 0.03); G.add(pivot)
    const dw = CW / 2 + FT * 0.5, door = new THREE.Group(); pivot.add(door)
    const pane = plane(dw - 0.12, inH - 0.12, doorGlass, door, -sx * dw / 2, inH / 2, 0); pane.renderOrder = 3
    const st = plane(dw - 0.12, inH - 0.12, streakMat, door, -sx * dw / 2, inH / 2, 0.003); st.renderOrder = 4
    box(dw, 0.075, 0.045, frameMat, door, -sx * dw / 2, 0.0375, 0, false, 0.01); box(dw, 0.075, 0.045, frameMat, door, -sx * dw / 2, inH - 0.0375, 0, false, 0.01)
    box(0.075, inH, 0.045, frameMatV, door, -sx * 0.0375, inH / 2, 0, false, 0.01); box(0.05, inH, 0.045, frameMatV, door, -sx * (dw - 0.025), inH / 2, 0, false, 0.01)
    for (const hy of [0.25, inH / 2, inH - 0.25]) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.12, 16), brass); h.position.set(0, hy, 0.0); door.add(h) }
    const pull = new THREE.Group(); door.add(pull); pull.position.set(-sx * (dw - 0.11), inH / 2, 0.05)
    box(0.022, 0.6, 0.022, brass, pull, 0, 0, 0.03, false, 0.008); box(0.02, 0.02, 0.05, brass, pull, 0, 0.27, 0.005, false); box(0.02, 0.02, 0.05, brass, pull, 0, -0.27, 0.005, false)
    pivot.userData = { sx, ci }; doors.push(pivot)
  }
  return G
}
function buildCabinets(n) {
  if (n === nCab && cabinet.children.length) return
  cabinet.traverse((o) => { if (o.isMesh && o.geometry && !Object.values(RB).includes(o.geometry)) o.geometry.dispose() })
  cabinet.clear(); doors.length = 0; nCab = n
  for (let i = 0; i < n; i++) buildOne(i)
  page = Math.min(page, n - 1); buildFixtures(); placeLights()
}
// one set of area lights follows the current page (RectAreaLights are expensive per fragment)
const lightRig = new THREE.Group(); scene.add(lightRig)
for (let i = 0; i < NSH; i++) {
  const top = PLINTH + i * SP + SP
  const ra = new THREE.RectAreaLight(0xfff0d6, mobile ? 2.2 : 2.6, CW - 0.3, 0.12); ra.position.set(0, top - 0.06, CD / 2 - 0.2); ra.lookAt(0, top - SP, CD / 2 - 0.4); lightRig.add(ra)
}
// track spots (≈2900K) on a ceiling rail: two wash the cabinet face with soft-edged cones, one pools light on the aisle floor
const TRACK_Y = PLINTH + NSH * SP + FT + 3.4, TRACK_Z = 4.2, SPOT = 0xffd3a3
const spots = []
// [x, y, z, target x, y, z, intensity, angle, castShadow] — 2 cabinet washers + 2 wall scallops flanking the cabinet
for (const [x, y, z, tx, ty, tz, I, ang, cast] of [[-2.3, TRACK_Y, TRACK_Z, -0.6, 4.6, 0.6, 150, 0.4, true], [2.3, TRACK_Y, TRACK_Z, 0.6, 4.6, 0.6, 150, 0.4, false], [-3.65, TRACK_Y, -0.7, -3.65, 1.2, -2.2, 120, 0.5, false], [3.65, TRACK_Y, -0.7, 3.65, 1.2, -2.2, 120, 0.5, false]]) {
  const sp = new THREE.SpotLight(SPOT, I, 0, ang, 0.9, 2); sp.position.set(x, y, z); sp.target.position.set(tx, ty, tz)
  if (cast) { sp.castShadow = true; sp.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048); sp.shadow.radius = 5; sp.shadow.bias = -0.0004; sp.shadow.normalBias = 0.03; sp.shadow.camera.near = 2; sp.shadow.camera.far = 30 }
  lightRig.add(sp, sp.target); spots.push(sp)
}
const railMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.6 })
const rail = new THREE.Mesh(new THREE.BoxGeometry(160, 0.06, 0.08), railMat); rail.position.set(40, TRACK_Y + 0.25, TRACK_Z); scene.add(rail); const rail2 = rail.clone(); rail2.position.z = -0.7; scene.add(rail2)
const canGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.42, 20, 1, true), canMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.35, metalness: 0.7, side: THREE.DoubleSide })
const fixtures = new THREE.Group(); scene.add(fixtures)
function buildFixtures() {
  fixtures.clear()
  for (let i = 0; i < nCab; i++) for (const sp of spots) {
    if (sp.position.z < 0 && i > 0 && sp.position.x < 0) continue // shared scallop between neighbours
    const can = new THREE.Mesh(canGeo, canMat), p = new THREE.Vector3(sp.position.x + i * CAB_PITCH, TRACK_Y, sp.position.z); can.position.copy(p)
    can.lookAt(new THREE.Vector3(sp.target.position.x + i * CAB_PITCH, sp.target.position.y, sp.target.position.z)); can.rotateX(Math.PI / 2); fixtures.add(can)
    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.25, 0.03), railMat); stem.position.set(p.x, TRACK_Y + 0.13, p.z); fixtures.add(stem)
  }
}
function placeLights() { lightRig.position.x = page * CAB_PITCH; key.position.x = 4 + page * CAB_PITCH; key.target.position.x = page * CAB_PITCH; key.target.updateMatrixWorld() }
let doorOpen = 0, doorTarget = 0
function cabinetCenter() { return new THREE.Vector3(page * CAB_PITCH, PLINTH + (NSH * SP) / 2, 0) }

// ---------------- proxies on the shelf ----------------
const tintMat = new THREE.MeshPhysicalMaterial({ color: 0x1846d0, roughness: 0.18, transparent: true, opacity: 0.88, clearcoat: 0.8, clearcoatRoughness: 0.1 })
const tintMats = { ps5: tintMat,
  ns: new THREE.MeshPhysicalMaterial({ color: 0xeef3f6, roughness: 0.12, transparent: true, opacity: 0.55, clearcoat: 0.9, clearcoatRoughness: 0.08 }),
  ns2: new THREE.MeshPhysicalMaterial({ color: 0xc8101e, roughness: 0.16, transparent: true, opacity: 0.88, clearcoat: 0.8, clearcoatRoughness: 0.1 }) }
const proxyGeos = {}
const specOf = (e) => platformSpec(e?.platform)
// 4 draw groups instead of 6: [tint (+x,+y,−y), spine (−x), front (+z), back (−z)]
function proxyGeo(p) {
  const s = platformSpec(p), k = s.W + ':' + s.D; if (proxyGeos[k]) return proxyGeos[k]
  const g = new THREE.BoxGeometry(s.W, s.H, s.D), idx = g.index.array, gr = g.groups, out = [], ng = []
  const take = (faces, m) => { const st = out.length; for (const f of faces) for (let i = gr[f].start; i < gr[f].start + gr[f].count; i++) out.push(idx[i]); ng.push({ start: st, count: out.length - st, materialIndex: m }) }
  take([0, 2, 3], 0); take([1], 1); take([4], 2); take([5], 3)
  g.setIndex(out); g.clearGroups(); ng.forEach((x) => g.addGroup(x.start, x.count, x.materialIndex)); return (proxyGeos[k] = g)
}
let entries = [], proxies = new Map(), artCache = new Map(), viewMode = localStorage.getItem('showcase-view') || 'spine'
const TEXMAX = mobile ? (devicePixelRatio > 2 && (navigator.hardwareConcurrency || 4) > 4 ? 1024 : 512) : 1024
function shrink(src, max) {
  const [bw, bh] = src instanceof HTMLCanvasElement ? bitmapSize(src) : [src.width, src.height]
  const c = resample(src, Math.min(1, max / Math.max(bw, bh)))
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = renderer.capabilities.getMaxAnisotropy(); return tx
}
function proxyMats(art, p = 'ps5') {
  const tintMat = tintMats[p] || tintMats.ps5
  const film = (map) => new THREE.MeshPhysicalMaterial({ map, roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.12 })
  return [tintMat, film(shrink(art.spine, TEXMAX)), film(shrink(art.front, TEXMAX)), film(shrink(art.back, TEXMAX))]
}
let re4Promise = null
async function getArt(e) {
  if (artCache.has(e.id)) return artCache.get(e.id)
  let art
  if (e.sample) art = await (re4Promise ||= loadRE4(BASE))
  else { const imgs = {}; for (const k of Object.keys(TEMPLATES)) imgs[k] = await blobToImage(e.slots?.[k]?.blob); art = buildArt(e, imgs) }
  artCache.set(e.id, art); return art
}
// ---------- view list: search / platform filter / sort ----------
let fQuery = '', fPlat = 'all', fSort = localStorage.getItem('showcase-sort') || 'custom', view = []
function computeView() {
  const q = norm(fQuery)
  view = entries.filter((e) => (fPlat === 'all' || (e.platform || 'ps5') === fPlat) && (!q || norm(e.title).includes(q) || Object.values(e.lookup?.titles || {}).some((x) => norm(x).includes(q))))
  const by = { name: (a, b) => (a.title || '').localeCompare(b.title || '', lang === 'en' ? 'en' : 'zh'), date: (a, b) => (b.lookup?.date || b.createdAt || 0) > (a.lookup?.date || a.createdAt || 0) ? 1 : -1, platform: (a, b) => (a.platform || 'ps5').localeCompare(b.platform || 'ps5') || (a.order - b.order), custom: (a, b) => a.order - b.order }
  view.sort(by[fSort] || by.custom)
}
// Mixed shelves: every case keeps its real footprint (PS5 13.5 mm spine, Switch 11 mm), packed row by row; 3 rows per cabinet.
let LAY = new Map()
function computeLayout() {
  computeView()
  const avail = viewMode === 'spine' ? CW - 0.3 : CW - 0.2, rows = [[]]; let used = 0
  for (const e of view) { const s = specOf(e), w = viewMode === 'spine' ? s.D + 0.045 : s.W + 0.16; if (used + w > avail && rows[rows.length - 1].length) { rows.push([]); used = 0 } rows[rows.length - 1].push({ e, w, s }); used += w }
  LAY = new Map(); rows.forEach((r, ri) => { const tot = r.reduce((a, b) => a + b.w, 0); let x = -tot / 2; for (const it of r) { LAY.set(it.e.id, { row: ri, cab: Math.floor(ri / ROWS_PER_CAB), x: x + it.w / 2, s: it.s }); x += it.w } })
  return Math.max(1, Math.ceil(rows.filter((r) => r.length).length / ROWS_PER_CAB))
}
function layoutTarget(id) {
  const L = LAY.get(id); if (!L) return null
  const shelf = NSH - 1 - (L.row % ROWS_PER_CAB), y = shelfY[shelf] + 0.024 + L.s.H / 2, x = L.cab * CAB_PITCH + L.x
  if (viewMode === 'spine') return { p: new THREE.Vector3(x, y, -0.05), r: new THREE.Euler(0, Math.PI / 2, 0), cab: L.cab }
  return { p: new THREE.Vector3(x, y + 0.01, -0.35), r: new THREE.Euler(-0.07, 0, 0), cab: L.cab }
}
// placeholder material per platform until the art is near the current page (lazy texture streaming)
const phMats = {}
// single material → one draw call per not-yet-streamed proxy
function placeholderMats(p) { return (phMats[p] ||= new THREE.MeshStandardMaterial({ color: p === 'ns' ? 0xc4101e : p === 'ns2' ? 0x6a1820 : 0x1d2433, roughness: 0.55 })) }
const isPh = (m) => Object.values(phMats).includes(m.material)
function freeMats(m) { if (!isPh(m) && Array.isArray(m.material)) m.material.forEach((x) => { if (x.map) { x.map.dispose(); x.dispose() } }) }
let streamQ = [], streaming = false
async function streamTick() { // one proxy texture per frame-ish; keeps 200+ items smooth
  if (streaming || !streamQ.length) return; streaming = true
  const id = streamQ.shift(), e = entries.find((x) => x.id === id), m = proxies.get(id)
  if (e && m && isPh(m) && Math.abs((m.userData.cab ?? 0) - page) <= 1) {
    const art = await getArt(e); if (proxies.get(id) === m && isPh(m)) { m.material = proxyMats(art, e.platform || 'ps5'); dirty = 2 }
    if (!(sel && sel.id === id) && !(editing && editing.id === id)) artCache.delete(id) // keep only GPU textures; regenerate on inspect
  }
  streaming = false
}
function updateStreaming() {
  streamQ = []
  for (const [id, m] of proxies) {
    const d = Math.abs((m.userData.cab ?? 0) - page), shown = LAY.has(id)
    m.visible = shown && d <= 1 && !(sel && sel.id === id && (mode === 'inspect' || mode === 'editor'))
    if (!shown || d > 1) { if (!isPh(m)) { freeMats(m); m.material = placeholderMats(m.userData.plat) } }
    else if (isPh(m)) streamQ.push(id)
  }
  streamQ.sort((a, b) => Math.abs(proxies.get(a).userData.cab - page) - Math.abs(proxies.get(b).userData.cab - page))
}
async function syncShelf(animate = true) {
  buildCabinets(computeLayout())
  const ids = new Set(entries.map((e) => e.id))
  for (const [id, m] of proxies) if (!ids.has(id)) { scene.remove(m); freeMats(m); proxies.delete(id) }
  for (const e of entries) {
    let m = proxies.get(e.id)
    if (!m) { m = new THREE.Mesh(proxyGeo(e.platform), placeholderMats(e.platform || 'ps5')); m.castShadow = true; m.receiveShadow = true; m.userData.id = e.id; m.userData.plat = e.platform || 'ps5'; scene.add(m); proxies.set(e.id, m); m.userData.fresh = true }
    const L = layoutTarget(e.id); if (!L) { m.visible = false; continue }
    m.userData.home = L; m.userData.cab = L.cab
    if (!animate || m.userData.fresh || Math.abs(L.cab - page) > 1) { m.position.copy(L.p); m.rotation.copy(L.r); if (m.userData.fresh && animate && Math.abs(L.cab - page) <= 1) { m.scale.setScalar(0.001); m.userData.pop = 0 } m.userData.fresh = false }
    else m.userData.glide = { from: m.position.clone(), q0: m.quaternion.clone(), t: 0 }
  }
  updateStreaming(); syncPager()
  $('empty').classList.toggle('hidden', entries.length > 0 || mode !== 'shelf')
  dirty = 3
}
async function refreshProxy(e) {
  artCache.delete(e.id); const m = proxies.get(e.id); if (!m) return
  const art = await getArt(e); freeMats(m); m.geometry = proxyGeo(e.platform); m.userData.plat = e.platform || 'ps5'; m.material = proxyMats(art, e.platform || 'ps5'); dirty = 3
}
function goPage(p, cam = true) {
  p = THREE.MathUtils.clamp(p, 0, nCab - 1); if (p === page && cam) { goCam(camShelfGoal()); return }
  page = p; placeLights(); updateStreaming(); syncPager(); if (cam && mode === 'shelf') { goCam(camShelfGoal()); applyLimits() } dirty = 3
}
function syncPager() {
  const el = $('pager'); if (!el) return; el.classList.toggle('hidden', nCab <= 1)
  $('pgLbl').textContent = `${page + 1} / ${nCab}`; $('pgPrev').disabled = page <= 0; $('pgNext').disabled = page >= nCab - 1
  const j = $('pgJump'); if (j.options.length !== nCab) { j.innerHTML = ''; for (let i = 0; i < nCab; i++) { const first = view.find((e) => LAY.get(e.id)?.cab === i); const o = document.createElement('option'); o.value = i; o.textContent = `${i + 1} · ${first ? first.title.slice(0, 14) : ''}`; j.appendChild(o) } }
  j.value = page
}

// ---------------- inspect model (one shared full case) ----------------
const holder = new THREE.Group(); scene.add(holder); holder.visible = false
const models = {}
let model = null
function useModel(p) {
  p = ['ns', 'ns2'].includes(p) ? p : 'ps5'
  if (!models[p]) {
    const m = createCaseModel({ renderer, scene, mobile, maxAniso: renderer.capabilities.getMaxAnisotropy(), platform: p })
    holder.add(m.root); m.disc.visible = false; m.root.traverse((o) => { if (o.isMesh) o.castShadow = true }); models[p] = m
  }
  const wasVis = model ? model.disc.visible : false
  for (const [k, m] of Object.entries(models)) { m.root.visible = k === p; if (k !== p) m.disc.visible = false }
  model = models[p]; model.disc.visible = wasVis; return model
}
useModel('ps5')
const Hm = () => model.H
const INS = new THREE.Vector3() // world centre of inspected case
function inspectPose() { const c = cabinetCenter(); INS.set(0, Math.min(c.y, 2.4), CD / 2 + 2.3); return INS }

// ---------------- state ----------------
let mode = 'shelf' // shelf | fly | inspect | back | editor
let sel = null, flyT = 0, flyFrom = null
let open = 0, openT = 0, hubP = 0, hubT = 0, out = 0, outT = 0, discFocus = false, flip = 0, flipT = 0, spin = 0, releaseArmed = false, reseating = false
let dirty = 3, pending = null
function setMode(m) { mode = m; applyLimits(); if (typeof updateStreaming === 'function' && entries.length) updateStreaming(); document.body.className = 'mode-' + m; $('inspect').classList.toggle('hidden', !(m === 'inspect')); $('empty').classList.toggle('hidden', entries.length > 0 || m !== 'shelf'); syncInspectUI(); dirty = 3 }
function camShelfGoal() {
  const c = cabinetCenter(), h = NSH * SP + PLINTH, aspect = innerWidth / innerHeight
  const fov = THREE.MathUtils.degToRad(camera.fov), distH = (h * 0.54) / Math.tan(fov / 2), distW = ((CW + 0.6) * 0.55) / (Math.tan(fov / 2) * aspect)
  const d = Math.max(distH, distW) + CD / 2
  return { p: new THREE.Vector3(c.x + d * 0.12, c.y + 0.35, d), t: new THREE.Vector3(c.x, c.y - 0.05, 0) }
}
function camInspectGoal() {
  const d = mobile && innerWidth < innerHeight ? 5.2 : 4.0
  if (discFocus) { const f = floatPoint(), k = model.kind === 'cart' ? 0.56 : 0.62; return { p: f.clone().add(new THREE.Vector3(0, 0.35 * k / 0.62, d * k)), t: f.clone() } }
  const x = open > 0.4 ? -0.62 : 0
  return { p: INS.clone().add(new THREE.Vector3(1.1 + x, 0.45, d)), t: INS.clone().add(new THREE.Vector3(x, 0, 0)) }
}
const floatPoint = () => INS.clone().add(new THREE.Vector3(0, 0.1, 1.0))
let camGoal = null
function goCam(g) { camGoal = g; auto = true }

async function selectEntry(id) {
  if (mode !== 'shelf') return
  const m = proxies.get(id); if (!m) return
  sel = entries.find((e) => e.id === id); inspectPose()
  flyFrom = { p: m.position.clone(), q: m.quaternion.clone() }; flyT = 0; mode = 'fly'; document.body.className = 'mode-inspect'; doorTarget = 1
  $('empty').classList.add('hidden'); useModel(sel.platform); pending = getArt(sel).then((art) => model.setArt(art))
  goCam(camInspectGoal())
}
async function finishFly() {
  await pending; const m = proxies.get(sel.id)
  holder.position.copy(INS).sub(new THREE.Vector3(0, Hm() / 2, 0)); holder.rotation.set(0, 0, 0); holder.visible = true; model.disc.visible = true
  open = openT = hubP = hubT = out = outT = 0; discFocus = false; flip = flipT = 0
  model.pose(0, 0); m.visible = false; setMode('inspect'); goCam(camInspectGoal())
}
function backToShelf() {
  if (mode !== 'inspect') return
  if (outT || out > 0.01) { reseat(); return void (pendingBack = true) }
  if (openT || open > 0.01) { openT = 0; pendingBack = true; syncInspectUI(); return }
  const m = proxies.get(sel.id); holder.visible = false; model.disc.visible = false; m.visible = true
  m.position.copy(INS); m.rotation.set(0, 0, 0); flyFrom = { p: m.position.clone(), q: m.quaternion.clone() }; flyT = 0
  mode = 'back'; document.body.className = 'mode-shelf'; $('inspect').classList.add('hidden'); goCam(camShelfGoal()); pendingBack = false
}
let pendingBack = false
function pressHub() { if (mode !== 'inspect' || open < 0.65 || outT) return; reseating = false; releaseArmed = false; hubT = 1; syncInspectUI() }
function reseat() { discFocus = false; flipT = 0; outT = 0; reseating = true; syncInspectUI(); goCam(camInspectGoal()) }
function syncInspectUI() {
  if (!sel) return
  $('iTitle').textContent = sel.title || ''; $('iSub').textContent = sel.sample ? t('sample') : `${{ ps5: 'PS5', ns: 'Nintendo Switch', ns2: 'Nintendo Switch 2' }[sel.platform || 'ps5']}${sel.keyCard && sel.platform === 'ns2' ? ' · Game-Key Card' : ''} · ${t('made')}`
  $('iOpen').textContent = openT ? t('close') : t('open'); $('iOpen').disabled = !!(outT || out > 0.02 || hubT)
  const cart = model.kind === 'cart'; $('iDisc').textContent = (outT || discFocus) ? t(cart ? 'putC' : 'put') : t(cart ? 'takeC' : 'take'); $('iDisc').disabled = !(open > 0.65) && !outT
  $('iFlip').textContent = t('flip'); $('iFlip').classList.toggle('hidden', !discFocus)
  $('iEdit').disabled = !!sel.sample
}

// ---------------- picking ----------------
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let downAt = null
cv.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY, performance.now()]; closeMenus() })
cv.addEventListener('pointerup', (e) => {
  if (downAt && mode === 'shelf') { const dx = e.clientX - downAt[0], dy = e.clientY - downAt[1]; if (Math.abs(dx) > 90 && Math.abs(dx) > 2 * Math.abs(dy)) { goPage(page + (dx < 0 ? 1 : -1)); return } }
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 8 || performance.now() - downAt[2] > 600) return
  ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ptr, camera)
  if (mode === 'shelf') { const hit = ray.intersectObjects([...proxies.values()])[0]; if (hit) selectEntry(hit.object.userData.id); return }
  if (mode === 'inspect') {
    const hits = ray.intersectObjects([model.btnHit, ...model.discPick, model.root], true); if (!hits.length) return
    let o = hits[0].object, isHub = false, isDisc = false
    for (let p = o; p; p = p.parent) { if (p === model.hub || p.name === 'hubBtn') isHub = true; if (p === model.disc) isDisc = true }
    if (discFocus) return
    if ((isHub || isDisc) && open > 0.65) pressHub()
    else if (!openT && !outT) { openT = 1; syncInspectUI() }
  }
})

// ---------------- main loop ----------------
const clock = new THREE.Clock()
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const step = (v, tg, dt, dur) => (tg > v ? Math.min(tg, v + dt / dur) : Math.max(tg, v - dt / dur))
const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _seat = new THREE.Vector3(), _lift = new THREE.Vector3(), qFront = new THREE.Quaternion()
function bez(a, b, c, k, out) { const u = 1 - k; return out.set(0, 0, 0).addScaledVector(a, u * u).addScaledVector(b, 2 * u * k).addScaledVector(c, k * k) }
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05); let busy = false
  // doors
  const d0 = doorOpen; doorOpen = step(doorOpen, doorTarget, dt, 0.8); if (d0 !== doorOpen) busy = true
  doors.forEach((p) => (p.rotation.y = p.userData.ci === page ? p.userData.sx * ease(doorOpen) * THREE.MathUtils.degToRad(105) : 0))
  streamTick()
  // shelf glides / pops
  for (const m of proxies.values()) {
    if (m.userData.glide) { const g = m.userData.glide; g.t = Math.min(1, g.t + dt / 0.6); const k = ease(g.t); m.position.lerpVectors(g.from, m.userData.home.p, k); _q.setFromEuler(m.userData.home.r); m.quaternion.slerpQuaternions(g.q0, _q, k); if (g.t >= 1) delete m.userData.glide; busy = true }
    if (m.userData.pop != null) { m.userData.pop = Math.min(1, m.userData.pop + dt / 0.55); const k = m.userData.pop; m.scale.setScalar(Math.max(0.001, 1 + Math.sin(k * Math.PI) * 0.06 - (1 - ease(k)) * 1)); if (k >= 1) { m.scale.setScalar(1); delete m.userData.pop } busy = true }
  }
  // fly out / back
  if (mode === 'fly' || mode === 'back') {
    busy = true; flyT = Math.min(1, flyT + dt / 1.15); const m = proxies.get(sel.id), k = ease(flyT)
    const home = m.userData.home, slideOut = home.p.clone().add(new THREE.Vector3(0, 0.05, viewMode === 'spine' ? 1.0 : 0.9))
    if (mode === 'fly') { bez(flyFrom.p, slideOut.clone().add(new THREE.Vector3(0, 0, 0.6)), INS, k, m.position); m.quaternion.slerpQuaternions(flyFrom.q, qFront, Math.min(1, k * 1.2)); if (flyT >= 1) finishFly() }
    else { _q.setFromEuler(home.r); bez(INS, slideOut.clone().add(new THREE.Vector3(0, 0, 0.6)), home.p, k, m.position); m.quaternion.slerpQuaternions(qFront, _q, k); if (flyT >= 1) { setMode('shelf'); doorTarget = 0; sel = null } }
  }
  // inspect state machine
  if (mode === 'inspect' || mode === 'editor') {
    const o0 = open, h0 = hubP, u0 = out
    open = step(open, openT, dt, 0.9); hubP = step(hubP, hubT, dt, 0.28)
    if (hubT === 1 && hubP > 0.92 && !outT && !releaseArmed) { releaseArmed = true; outT = 1 }
    out = step(out, outT, dt, 1.0)
    if (reseating && out < 0.01) { reseating = false; hubT = 0 }
    if (outT === 1 && out > 0.92 && !discFocus) { discFocus = true; syncInspectUI(); goCam(camInspectGoal()) }
    if (pendingBack && out < 0.01 && !outT && open > 0.99 && hubP < 0.01) { openT = 0 }
    if (pendingBack && open < 0.01 && !outT && out < 0.01) backToShelf()
    if (o0 !== open || h0 !== hubP || u0 !== out || discFocus) busy = true
    if ((o0 > 0.4) !== (open > 0.4) && auto) goCam(camInspectGoal())
    model.pose(open, hubP)
    holder.updateMatrixWorld(true); model.seatWorld(_seat)
    const e = ease(out), F = floatPoint()
    _lift.copy(_seat).add(new THREE.Vector3(0.05, 0.12, 0.35))
    const isCart = model.kind === 'cart'; model.disc.scale.setScalar(isCart ? 1 + 1.8 * THREE.MathUtils.smoothstep(e, 0.3, 1) : 1)
    if (out < 0.01) { model.disc.position.copy(_seat); model.disc.quaternion.copy(holder.quaternion); spin = 0 }
    else if (isCart && e < 0.35) { const k = e / 0.35; model.disc.position.lerpVectors(_seat, _lift, ease(k)); model.disc.rotation.set(-k * 0.25, 0, 0) }
    else if (e < 0.35) { const k = e / 0.35; model.disc.position.lerpVectors(_seat, _lift, ease(k)); model.disc.rotation.set(-k * 0.15, k * 0.1, 0) }
    else {
      const k = (e - 0.35) / 0.65; model.disc.position.lerpVectors(_lift, F, ease(k))
      if (discFocus && isCart) { if (!qs.has('shot')) spin += dt * 0.6; flip = step(flip, flipT, dt, 0.7); model.disc.rotation.set(-0.18, ease(flip) * Math.PI + Math.sin(spin) * 0.3, 0) }
      else if (discFocus) { if (!qs.has('shot')) spin += dt * 0.35; flip = step(flip, flipT, dt, 0.7); model.disc.rotation.set(-0.3, ease(flip) * Math.PI, 0); model.disc.rotateZ(spin) }
      else model.disc.rotation.set(-0.3 * k, 0.2 * k, 0)
    }
    holder.visible = !(discFocus && out > 0.97)
    const ui = `${open > 0.65}|${openT}|${outT}|${hubT}|${discFocus}`; if (ui !== tick._ui) { tick._ui = ui; syncInspectUI() }
  }
  // camera
  if (auto && camGoal) {
    const k = 1 - Math.exp(-dt * 3.2)
    if (mode === 'shelf' && !qs.has('shot')) { _v.copy(camGoal.p).add(new THREE.Vector3(par.x * 0.5, -par.y * 0.3, 0)); camera.position.lerp(_v, k) } else camera.position.lerp(camGoal.p, k); controls.target.lerp(camGoal.t, k)
    if (camera.position.distanceTo(camGoal.p) > 0.004) busy = true
  }
  const changed = controls.update()
  if (busy || changed || dirty > 0) { const t0 = performance.now(); draw(); perfSample(performance.now() - t0, dt); dirty = Math.max(0, dirty - 1) }
}
renderer.setAnimationLoop(tick)
document.addEventListener('visibilitychange', () => renderer.setAnimationLoop(document.hidden ? null : tick))

// ---------------- post-processing tiers ----------------
// high: GTAO + bloom + vignette @ full DPR · mid: bloom + vignette @ ≤1.5 DPR · low: direct render @ 1 DPR, no shadows on cabinets' spot 2.
const VignetteShader = {
  uniforms: { tDiffuse: { value: null }, uAmt: { value: 0.32 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: 'uniform sampler2D tDiffuse; uniform float uAmt; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 d = vUv - 0.5; float v = smoothstep(0.85, 0.2, length(d * vec2(1.0, 0.85))); c.rgb *= mix(1.0 - uAmt, 1.0, v); gl_FragColor = c; }',
}
const TIERS = ['low', 'mid', 'high']
const gpuName = (() => { try { const gl = renderer.getContext(), e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : '' } catch { return '' } })()
const weakGPU = /SwiftShader|llvmpipe|Mali-[GT][0-7]\d|Adreno \(TM\) [3-5]\d\d|PowerVR|Intel\(R\) (HD|UHD) Graphics [1-6]/i.test(gpuName)
let tier = qs.get('tier') || (qs.has('shot') ? 'high' : mobile ? (weakGPU ? 'low' : 'mid') : weakGPU ? 'mid' : 'high')
let composer = null, gtao = null, bloom = null, pinned = qs.has('tier') || qs.has('shot')
function setupTier() {
  composer?.dispose(); composer = null; gtao?.dispose?.(); gtao = null
  renderer.setPixelRatio(Math.min(devicePixelRatio, tier === 'high' ? 2 : tier === 'mid' ? 1.5 : 1))
  spots[0].castShadow = tier !== 'low'; renderer.shadowMap.needsUpdate = true
  if (tier !== 'low') {
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: tier === 'high' ? 4 : 0 })
    composer = new EffectComposer(renderer, rt); composer.addPass(new RenderPass(scene, camera))
    if (tier === 'high') { gtao = new GTAOPass(scene, camera, innerWidth, innerHeight); gtao.blendIntensity = 0.75; gtao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.6, thickness: 1, scale: 1 }); composer.addPass(gtao) }
    bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.32, 0.55, 1.6); composer.addPass(bloom)
    composer.addPass(new ShaderPass(VignetteShader)); composer.addPass(new OutputPass())
  }
  sizeComposer(); dirty = 3
}
function sizeComposer() { renderer.setSize(innerWidth, innerHeight, false); if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(innerWidth, innerHeight) } }
function draw() { if (composer) composer.render(); else renderer.render(scene, camera) }
// auto-downgrade: if active frames stay slow, drop one tier (never upgrades back automatically)
const perf = []
function perfSample(ms, dt) {
  if (pinned || document.hidden) return
  perf.push(Math.max(ms, Math.min(dt * 1000, 200))); if (perf.length < 45) return
  const m = perf.sort((a, b) => a - b)[22]; perf.length = 0
  if (m > 40 && tier !== 'low') { tier = TIERS[TIERS.indexOf(tier) - 1]; setupTier() }
}
setupTier()
function resize() {
  sizeComposer(); camera.aspect = innerWidth / innerHeight
  camera.fov = innerWidth / innerHeight < 0.8 ? 46 : 36
  applyViewOffset(); camera.updateProjectionMatrix(); if (mode === 'shelf' && auto) goCam(camShelfGoal()); dirty = 3
}
function applyViewOffset() {
  const ed = mode === 'editor' ? $('editor') : null
  if (!ed) { camera.clearViewOffset(); return }
  const r = ed.getBoundingClientRect(), w = innerWidth, h = innerHeight
  if (innerWidth >= 900) camera.setViewOffset(w, h, r.width / 2, 0, w, h)
  else camera.setViewOffset(w, h, 0, r.height / 2, w, h)
  camera.updateProjectionMatrix()
}
addEventListener('resize', resize)

// ---------------- toolbar ----------------
function closeMenus() { $('menu').classList.add('hidden'); $('imore').classList.add('hidden') }
$('langBtn').onclick = () => { lang = lang === 'en' ? 'zh' : 'en'; try { localStorage.setItem('game-catalog-lang', lang) } catch {}; syncLang() }
$('menuBtn').onclick = (e) => { e.stopPropagation(); $('menu').classList.toggle('hidden') }
$('iMore').onclick = (e) => { e.stopPropagation(); $('imore').classList.toggle('hidden') }
function setView(v) {
  viewMode = v; localStorage.setItem('showcase-view', v)
  for (const b of $('viewSeg').children) b.setAttribute('aria-pressed', String(b.dataset.v === v))
  syncShelf(true).then(() => { if (mode === 'shelf') goCam(camShelfGoal()) })
}
$('viewSeg').onclick = (e) => { const v = e.target.dataset?.v; if (v && v !== viewMode && mode === 'shelf') setView(v) }
$('mExport').onclick = async () => {
  closeMenus(); const blob = await exportCollection(entries.filter((e) => !e.sample))
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `showcase-${new Date().toISOString().slice(0, 10)}.json`; a.click(); toast(t('exported'))
}
$('mImport').onclick = () => { closeMenus(); $('importFile').click() }
$('importFile').onchange = async (e) => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return
  try { const n = await importCollection(f, entries); entries = await db.all(); await syncShelf(); goCam(camShelfGoal()); toast(t('imported').replace('%d', n)) } catch { toast(t('badFile')) }
}
$('iOpen').onclick = () => { if (outT || hubT) return; openT = openT ? 0 : 1; syncInspectUI() }
$('iDisc').onclick = () => { if (outT || discFocus) reseat(); else pressHub() }
$('iFlip').onclick = () => { flipT = flipT ? 0 : 1 }
$('iBack').onclick = () => backToShelf()
$('iDel').onclick = async () => {
  closeMenus(); if (!confirm(t('delQ').replace('%s', sel.title))) return
  const id = sel.id; await db.del(id); artCache.delete(id); holder.visible = false; model.disc.visible = false; outT = out = 0; openT = open = 0; hubT = hubP = 0; discFocus = false
  entries = entries.filter((e) => e.id !== id); await renumber(); sel = null; doorTarget = 0; setMode('shelf'); await syncShelf(); goCam(camShelfGoal()); toast(t('deleted'))
}
async function renumber() { entries.forEach((e, i) => (e.order = i)); await db.putMany(entries) }
async function move(dir) {
  closeMenus(); if (fSort !== 'custom') { fSort = 'custom'; $('sort').value = 'custom' } const i = entries.findIndex((e) => e.id === sel.id), j = i + dir; if (j < 0 || j >= entries.length) return
  ;[entries[i], entries[j]] = [entries[j], entries[i]]; await renumber(); await syncShelf(true); proxies.get(sel.id).userData.glide = null; const m = proxies.get(sel.id); m.position.copy(INS); m.quaternion.copy(qFront)
}
$('iLeft').onclick = () => move(-1); $('iRight').onclick = () => move(1)
$('iEdit').onclick = () => { closeMenus(); if (sel.sample) return toast(t('sampleRO')); openEditor(sel) }
$('makeBtn').onclick = () => openEditor(null); $('emptyBtn').onclick = () => openEditor(null)
addEventListener('keydown', (e) => { if (mode === 'shelf' && document.activeElement?.tagName !== 'INPUT') { if (e.key === 'ArrowRight') goPage(page + 1); if (e.key === 'ArrowLeft') goPage(page - 1) } if (e.key === 'Escape') { if (mode === 'editor') closeEditor(false); else if (mode === 'inspect') { if (discFocus) reseat(); else backToShelf() } } })

// ---------------- editor ----------------
let editing = null, draft = null, draftImgs = {}, draftArt = null, cropKey = null, artTimer = 0, prevSel = null, prevMode = null
const SLOT_KEYS = ['front', 'spine', 'back', 'inner', 'disc']
const TPL = () => templatesFor(draft?.platform)
function syncPlat() {
  const p = draft.platform || 'ps5'
  for (const b of $('platSeg').children) b.setAttribute('aria-pressed', String(b.dataset.p === p))
  $('keyWrap').classList.toggle('hidden', p !== 'ns2'); $('fKey').checked = !!draft.keyCard
  $('platNote').textContent = t('pn_' + p)
}
$('platSeg').onclick = (e) => { const p = e.target.dataset?.p; if (!p || !draft || p === draft.platform) return; draft.platUser = true; setPlatform(p) }
function setPlatform(p) {
  draft.platform = p; if (p !== 'ns2') draft.keyCard = false
  for (const k of SLOT_KEYS) if (draft.slots[k]?.crop) draft.slots[k].crop = { x: 0, y: 0, s: 1 } // aspect changed → reset framing
  const vis = model.disc.visible; useModel(p); model.disc.visible = vis
  holder.position.copy(INS).sub(new THREE.Vector3(0, Hm() / 2, 0)); open = openT = hubP = hubT = out = outT = 0; discFocus = false; model.pose(0, 0)
  syncPlat(); rebuildDraft(); renderSlots(); $('crop').classList.add('hidden')
}
$('fKey').onchange = () => { draft.keyCard = $('fKey').checked; scheduleArt() }
function openEditor(entry) {
  closeMenus(); prevMode = mode; prevSel = sel
  editing = entry || { id: null }
  draft = entry ? JSON.parse(JSON.stringify({ ...entry, slots: Object.fromEntries(Object.entries(entry.slots || {}).map(([k, v]) => [k, { crop: v.crop }])) })) : { title: '', platform: 'ps5', band: true, slots: {} }
  if (entry) for (const k of SLOT_KEYS) if (entry.slots?.[k]?.blob) draft.slots[k].blob = entry.slots[k].blob
  lkResults = []; lkRender(null); loadCatalog()
  draftImgs = {}; draft.platform ||= 'ps5'; useModel(draft.platform); syncPlat()
  $('fTitle').value = draft.title || ''; $('fBand').checked = draft.band !== false
  $('eTitleH').textContent = entry ? t('eEdit') : t('eNew')
  $('editor').classList.remove('hidden'); $('crop').classList.add('hidden')
  // stage the full model for live preview
  if (mode !== 'inspect') { model.disc.visible = true; inspectPose(); holder.position.copy(INS).sub(new THREE.Vector3(0, Hm() / 2, 0)); holder.visible = true; model.disc.visible = true; open = openT = hubP = hubT = out = outT = 0; discFocus = false; model.pose(0, 0); doorTarget = 1 }
  else if (sel) { proxies.get(sel.id).visible = false }
  if (outT) { outT = out = 0; hubT = hubP = 0; discFocus = false }
  mode = 'editor'; document.body.className = 'mode-editor'; $('inspect').classList.add('hidden'); $('empty').classList.add('hidden')
  Promise.all(SLOT_KEYS.map(async (k) => (draftImgs[k] = await blobToImage(draft.slots[k]?.blob)))).then(() => { rebuildDraft(); renderSlots() })
  renderSlots(); requestAnimationFrame(() => { applyViewOffset(); goCam(editorCam()) })
}
function editorCam() { inspectPose(); const d = innerWidth >= 900 ? 4.4 : 5.6; return { p: INS.clone().add(new THREE.Vector3(1.6, 0.5, d)), t: INS.clone() } }
function rebuildDraft() {
  draft.title = $('fTitle').value.trim(); draft.band = $('fBand').checked
  draftArt = buildArt(draft, draftImgs); model.setArt(draftArt); dirty = 3
}
function scheduleArt() { if (artTimer) return; artTimer = setTimeout(() => { artTimer = 0; rebuildDraft(); renderSlotThumbs() }, mobile ? 90 : 50) }
function renderSlots() {
  const box = $('slots'); box.innerHTML = ''
  for (const k of SLOT_KEYS) {
    const has = !!draft.slots[k]?.blob, el = document.createElement('button'); el.className = 'slot' + (has ? ' up' : ''); el.dataset.k = k
    el.innerHTML = `<div class="th">${has || draftArt ? '' : '＋'}</div><b>${TPL()[k].label[lang === 'en' ? 1 : 0]}</b><i>${has ? (draft.slots[k].auto ? t('lkWeb') : t('uploaded')) : t('auto')}</i>`
    el.onclick = () => { if (!has) pickFile(k); else openCrop(k) }
    box.appendChild(el)
  }
  renderSlotThumbs()
}
function renderSlotThumbs() {
  if (!draftArt) return
  const map = { front: draftArt.front, spine: draftArt.spine, back: draftArt.back, inner: draftArt.innerCover, disc: draftArt.disc }
  for (const el of $('slots').children) {
    const src = map[el.dataset.k], th = el.querySelector('.th'); if (!src) continue
    let c = th.querySelector('canvas'); if (!c) { th.textContent = ''; c = document.createElement('canvas'); th.appendChild(c) }
    const s = 160 / Math.max(src.width, src.height); c.width = Math.max(1, Math.round(src.width * s)); c.height = Math.max(1, Math.round(src.height * s)); c.getContext('2d').drawImage(src, 0, 0, c.width, c.height)
  }
}
function pickFile(k) { cropKey = k; $('fileIn').click() }
$('fileIn').onchange = async (e) => {
  const f = e.target.files[0]; e.target.value = ''; if (!f || !cropKey) return
  toast(t('processing')); const blob = await downscale(f, cropKey === 'disc' ? 2048 : 2560)
  draft.slots[cropKey] = { blob, crop: { x: 0, y: 0, s: 1 } }; draftImgs[cropKey] = await blobToImage(blob)
  rebuildDraft(); renderSlots(); openCrop(cropKey)
}
// ---- name lookup: catalog first, then Wikipedia/Wikidata ----
let lkSeq = 0, lkTimer = 0, lkResults = []
function lkRender(state) {
  const box = $('sugg'); box.classList.toggle('hidden', !state); if (!state) return
  if (state === 'loading' && !lkResults.length) { box.innerHTML = `<div class="sg-msg">${t('lkSearching')}</div>`; return }
  if (state === 'none') { box.innerHTML = `<div class="sg-msg">${t('lkNone')}</div>`; return }
  box.innerHTML = `<div class="sg-msg">${t('lkPick')}${state === 'loading' ? ' · ' + t('lkSearching') : ''}</div>`
  lkResults.forEach((r, i) => {
    const b = document.createElement('button'); b.className = 'sg'; b.dataset.i = i
    const pl = { ps5: 'PS5', ns: 'Switch', ns2: 'Switch 2' }[r.platform] || '—'
    const sub = [r.src === 'catalog' ? t('lkCat') : t('lkWeb'), pl, r.date?.slice(0, 4), r.publisher].filter(Boolean).join(' · ')
    b.innerHTML = `<span class="sg-th">${r.cover ? `<img alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}</span><span class="sg-t"><b></b><i></i></span>`
    b.querySelector('b').textContent = r.title; b.querySelector('i').textContent = sub
    const im = b.querySelector('img'); if (im) { im.src = r.cover; im.onerror = () => { im.onerror = null; im.src = `https://wsrv.nl/?url=${encodeURIComponent(r.cover.replace(/^https?:\/\//, ''))}&w=120` } }
    b.onclick = () => applyLookup(r, true); box.appendChild(b)
  })
}
async function runLookup(q) {
  const seq = ++lkSeq; q = q.trim(); if (norm(q).length < 2) { lkResults = []; lkRender(null); return }
  lkRender('loading')
  const cat = await searchCatalog(q, 6); if (seq !== lkSeq) return
  lkResults = cat; lkRender(cat.length ? 'loading' : 'loading')
  const web = (cat[0]?.score || 0) >= 0.92 && cat.length >= 3 ? [] : await Promise.race([searchWiki(q, 4).catch(() => []), new Promise((r) => setTimeout(() => r([]), 12000))])
  if (seq !== lkSeq) return
  const seen = new Set(cat.map((r) => norm(r.titles.en || r.title)))
  lkResults = [...cat, ...web.filter((r) => !seen.has(norm(r.titles.en || r.title)))].slice(0, 8)
  lkRender(lkResults.length ? 'done' : 'none')
}
/** Fill whatever the user left blank from a lookup result. */
async function applyLookup(r, picked) {
  lkRender(null); const filled = []
  if (picked || !$('fTitle').value.trim()) { $('fTitle').value = r.title; filled.push('title') }
  if (r.platform && r.platform !== draft.platform && (picked || !draft.platUser)) { setPlatform(r.platform); filled.push('platform') }
  draft.lookup = { src: r.src, titles: r.titles, wiki: r.wiki || null, cover: r.cover || null, date: r.date || null, publisher: r.publisher || null }
  if (r.cover && !draft.slots.front?.blob) {
    toast(t('processing')); const raw = await fetchImageBlob(r.cover)
    if (raw) {
      const blob = (await prepareRetail(raw)) || (await downscale(raw, 2560)), img = await blobToImage(blob)
      // package scans (portrait, already carry platform branding) → no generated band/badge, trim the scan border
      const scan = img && img.height / img.width > 1.2 && /cdjapan/.test(r.cover || '')
      draft.slots.front = { blob, crop: { x: 0, y: 0, s: 1 }, auto: true }; draftImgs.front = img
      // retail art already carries its platform band/logo → generated overlay off by default (user can re-enable)
      if (!draft.bandUser) { draft.band = false; $('fBand').checked = false }
      filled.push('cover')
    } else toast(t('lkFail'))
  }
  rebuildDraft(); renderSlots(); if (filled.length) toast(t('lkFilled').replace('%s', filled.join(' / ')))
  return filled
}
$('fTitle').addEventListener('input', () => { clearTimeout(lkTimer); lkTimer = setTimeout(() => runLookup($('fTitle').value), 350) })
$('fTitle').addEventListener('keydown', (e) => { if (e.key === 'Enter' && lkResults[0]) { e.preventDefault(); applyLookup(lkResults[0], true) } })
$('fTitle').oninput = scheduleArt; $('fBand').onchange = () => { draft.bandUser = true; scheduleArt() }
$('eCancel').onclick = () => closeEditor(false)
$('eSave').onclick = async () => {
  draft.title = $('fTitle').value.trim()
  // everything is optional: name-only → use the best catalog match if it is confident; otherwise a generated cover
  if (draft.title && !draft.slots.front?.blob && !draft.lookup) {
    const best = (await searchCatalog(draft.title, 1))[0]
    if (best && best.score >= 0.85) await applyLookup(best, false)
    draft.title = $('fTitle').value.trim()
  }
  if (!draft.title) draft.title = t('untitled')
  draft.band = $('fBand').checked
  const isNew = !editing.id
  const e = { id: editing.id || uid(), title: draft.title, platform: draft.platform || 'ps5', keyCard: draft.platform === 'ns2' && !!draft.keyCard, lookup: draft.lookup || null, bandUser: !!draft.bandUser, band: draft.band, slots: draft.slots, createdAt: editing.createdAt || Date.now(), updatedAt: Date.now(), order: isNew ? entries.length : editing.order }
  await db.put(e)
  if (isNew) entries.push(e); else entries[entries.findIndex((x) => x.id === e.id)] = e
  artCache.set(e.id, draftArt); if (!isNew) await refreshProxy(e); else artCache.set(e.id, draftArt)
  closeEditor(true, e, isNew); toast(t('saved'))
}
async function closeEditor(saved, entry, isNew) {
  $('editor').classList.add('hidden'); editing = null; mode = 'shelf'; applyViewOffset()
  if (prevMode === 'inspect' && prevSel && !(saved && isNew)) {
    sel = saved ? entry : prevSel; mode = 'inspect'; useModel(sel.platform); model.disc.visible = true; holder.position.copy(INS).sub(new THREE.Vector3(0, Hm() / 2, 0)); const art = await getArt(sel); model.setArt(art)
    setMode('inspect'); goCam(camInspectGoal()); return
  }
  holder.visible = false; model.disc.visible = false
  if (prevSel && proxies.get(prevSel.id)) proxies.get(prevSel.id).visible = true
  sel = null; doorTarget = 0; setMode('shelf'); await syncShelf(true); goCam(camShelfGoal())
}

// crop tool
let cropImg = null, cropState = null
const cc = $('cc'), cg = cc.getContext('2d')
function openCrop(k) {
  cropKey = k; cropImg = draftImgs[k]; if (!cropImg) return pickFile(k)
  cropState = draft.slots[k].crop ||= { x: 0, y: 0, s: 1 }
  $('crop').classList.remove('hidden'); $('cTitle').textContent = TPL()[k].label[lang === 'en' ? 1 : 0]
  $('cZoom').value = cropState.s; $('cRemove').disabled = false
  requestAnimationFrame(drawCrop)
}
function drawCrop() {
  if (!cropKey || !cropImg) return
  const T = TPL()[cropKey], rot = cropKey === 'spine', wrap = $('cwrap').getBoundingClientRect()
  const tw = rot ? T.h : T.w, th = rot ? T.w : T.h
  const sc = Math.min((wrap.width - 32) / tw, (wrap.height - 12) / th, 1)
  const dpr = Math.min(devicePixelRatio, 2)
  cc.width = Math.round(tw * sc * dpr); cc.height = Math.round(th * sc * dpr); cc.style.width = `${tw * sc}px`; cc.style.height = `${th * sc}px`
  const tmp = canvas(T.w, T.h), g = tmp.getContext('2d'); g.fillStyle = '#ccc'; g.fillRect(0, 0, T.w, T.h); drawCropped(g, cropImg, T.w, T.h, cropState)
  cg.save(); cg.scale(cc.width / tw, cc.height / th)
  if (rot) { cg.translate(0, T.w); cg.rotate(-Math.PI / 2) }
  cg.drawImage(tmp, 0, 0)
  // guides
  const lw = 2 / sc
  if (T.circle) {
    const r = T.w / 2
    cg.fillStyle = 'rgba(246,244,239,.86)'; cg.beginPath(); cg.rect(0, 0, T.w, T.h); cg.arc(r, r, r, 0, Math.PI * 2, true); cg.fill()
    cg.fillStyle = 'rgba(246,244,239,.92)'; cg.beginPath(); cg.arc(r, r, r * 0.125, 0, Math.PI * 2); cg.fill() // centre hole
    cg.strokeStyle = 'rgba(47,111,99,.9)'; cg.lineWidth = lw; cg.setLineDash([10 / sc, 8 / sc]); cg.beginPath(); cg.arc(r, r, r * 0.283, 0, Math.PI * 2); cg.stroke()
    cg.beginPath(); cg.arc(r, r, r - 3, 0, Math.PI * 2); cg.stroke(); cg.setLineDash([])
    cg.fillStyle = 'rgba(47,111,99,.95)'; cg.font = `600 ${14 / sc}px sans-serif`; cg.textAlign = 'center'; cg.fillText(t('hub'), r, r + r * 0.34)
  } else if (T.rect) { // game-card label: rounded label shape (18.4 × 23.2 mm)
    const r = T.w * 0.06; cg.fillStyle = 'rgba(246,244,239,.86)'; cg.beginPath(); cg.rect(0, 0, T.w, T.h); cg.roundRect(6, 6, T.w - 12, T.h - 12, r); cg.fill('evenodd')
    cg.strokeStyle = 'rgba(217,137,63,.95)'; cg.lineWidth = lw; cg.setLineDash([12 / sc, 9 / sc]); cg.beginPath(); cg.roundRect(6, 6, T.w - 12, T.h - 12, r); cg.stroke(); cg.setLineDash([])
    if (draft.keyCard) { cg.fillStyle = 'rgba(230,0,18,.8)'; cg.beginPath(); cg.arc(T.w - 34, 34, 22, 0, 7); cg.fill() }
  } else if (draft.platform === 'ns' || draft.platform === 'ns2') {
    const two = draft.platform === 'ns2', bh = two ? NS2_BAND : NS_BAND, gc = 'rgba(230,0,18,.55)'
    if (T.band && $('fBand').checked) {
      if (!two) { if (cropKey === 'front') { cg.fillStyle = gc; cg.fillRect(0, 0, bh, bh); cg.fillStyle = '#fff'; cg.font = `600 ${Math.min(26, 13 / sc)}px sans-serif`; cg.fillText('LOGO', 10, bh / 2 + 6) } }
      else { cg.fillStyle = gc; cg.fillRect(0, 0, T.w, bh); cg.fillStyle = '#fff'; cg.font = `600 ${Math.min(30, 14 / sc)}px sans-serif`; cg.fillText(cropKey === 'spine' ? 'NS2' : t('guideBand'), 12, bh / 2 + 6) }
      if (two && cropKey !== 'spine') { const F = NS2_FRAME; cg.fillStyle = gc; cg.fillRect(0, bh, F, T.h - bh); cg.fillRect(T.w - F, bh, F, T.h - bh); cg.fillRect(0, T.h - F, T.w, F); if (cropKey === 'front' && draft.keyCard) { cg.fillStyle = 'rgba(255,255,255,.8)'; cg.fillRect(F, T.h - F - 92, T.w - 2 * F, 92) } }
    }
    cg.strokeStyle = 'rgba(217,137,63,.95)'; cg.lineWidth = lw; cg.setLineDash([12 / sc, 9 / sc]); cg.strokeRect(BLEED, BLEED, T.w - 2 * BLEED, T.h - 2 * BLEED); cg.setLineDash([])
  } else {
    if (T.band && $('fBand').checked) { cg.fillStyle = 'rgba(255,255,255,.82)'; cg.fillRect(0, 0, T.w, BANNER); cg.fillStyle = 'rgba(47,111,99,.95)'; cg.font = `600 ${Math.min(30, 14 / sc)}px sans-serif`; cg.fillText(cropKey === 'spine' ? 'PS5' : t('guideBand'), 12, BANNER / 2 + 6) }
    cg.strokeStyle = 'rgba(217,137,63,.95)'; cg.lineWidth = lw; cg.setLineDash([12 / sc, 9 / sc]); cg.strokeRect(BLEED, BLEED, T.w - 2 * BLEED, T.h - 2 * BLEED); cg.setLineDash([])
  }
  cg.restore()
}
const cptr = new Map(); let pinch0 = null
cc.addEventListener('pointerdown', (e) => { cc.setPointerCapture(e.pointerId); cptr.set(e.pointerId, [e.clientX, e.clientY]); if (cptr.size === 2) { const [a, b] = [...cptr.values()]; pinch0 = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: cropState.s } } })
cc.addEventListener('pointermove', (e) => {
  if (!cptr.has(e.pointerId)) return
  const prev = cptr.get(e.pointerId); cptr.set(e.pointerId, [e.clientX, e.clientY])
  if (cptr.size === 2 && pinch0) { const [a, b] = [...cptr.values()]; setZoom(pinch0.s * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch0.d); return }
  const r = cc.getBoundingClientRect(); let dx = (e.clientX - prev[0]) / r.width, dy = (e.clientY - prev[1]) / r.height
  if (cropKey === 'spine') [dx, dy] = [-dy, dx]
  cropState.x = THREE.MathUtils.clamp(cropState.x + dx * 2, -2, 2); cropState.y = THREE.MathUtils.clamp(cropState.y + dy * 2, -2, 2); drawCrop(); scheduleArt()
})
const endP = (e) => { cptr.delete(e.pointerId); if (cptr.size < 2) pinch0 = null }
cc.addEventListener('pointerup', endP); cc.addEventListener('pointercancel', endP)
cc.addEventListener('wheel', (e) => { e.preventDefault(); setZoom(cropState.s * Math.exp(-e.deltaY * 0.0015)) }, { passive: false })
function setZoom(s) { cropState.s = THREE.MathUtils.clamp(s, 1, 4); $('cZoom').value = cropState.s; drawCrop(); scheduleArt() }
$('cZoom').oninput = (e) => setZoom(+e.target.value)
$('cReset').onclick = () => { Object.assign(cropState, { x: 0, y: 0, s: 1 }); $('cZoom').value = 1; drawCrop(); scheduleArt() }
$('cReplace').onclick = () => pickFile(cropKey)
$('cRemove').onclick = () => { delete draft.slots[cropKey]; draftImgs[cropKey] = null; $('crop').classList.add('hidden'); rebuildDraft(); renderSlots() }
$('cDone').onclick = () => { $('crop').classList.add('hidden'); rebuildDraft(); renderSlots() }
addEventListener('resize', () => { if (!$('crop').classList.contains('hidden')) drawCrop() })

$('pgPrev').onclick = () => goPage(page - 1); $('pgNext').onclick = () => goPage(page + 1); $('pgJump').onchange = (e) => goPage(+e.target.value)
let qTimer = 0
$('q').oninput = () => { clearTimeout(qTimer); qTimer = setTimeout(() => { fQuery = $('q').value; page = 0; syncShelf(true).then(() => goPage(0)) }, 250) }
$('pf').onclick = (e) => { const v = e.target.dataset?.p; if (!v) return; fPlat = v; for (const b of $('pf').children) b.setAttribute('aria-pressed', String(b.dataset.p === v)); page = 0; syncShelf(true).then(() => goPage(0)) }
$('sort').value = fSort; $('sort').onchange = (e) => { fSort = e.target.value; localStorage.setItem('showcase-sort', fSort); syncShelf(true) }
// ---------------- boot ----------------
async function boot() {
  syncLang()
  for (const b of $('viewSeg').children) b.setAttribute('aria-pressed', String(b.dataset.v === viewMode))
  try {
    entries = await db.all()
    // migrate: auto-filled (catalog/lookup) covers default to no generated band unless the user chose otherwise
    const fix = entries.filter((e) => e.slots?.front?.auto && !e.bandUser && e.band !== false)
    if (fix.length) { fix.forEach((e) => (e.band = false)); await db.putMany(fix) }
    if (!localStorage.getItem('showcase-seeded')) {
      const s = { id: 'sample-re4', sample: true, title: 'Resident Evil 4 Gold Edition', platform: 'ps5', order: 0, createdAt: Date.now(), slots: {} }
      await db.put(s); entries = await db.all(); localStorage.setItem('showcase-seeded', '1')
    }
  } catch (err) { console.warn('IndexedDB unavailable', err) }
  await syncShelf(false)
  const g = camShelfGoal(); camera.position.copy(g.p).add(new THREE.Vector3(0.8, 0.6, 2.2)); controls.target.copy(g.t); goCam(g)
  controls.minDistance = 1.2; controls.maxDistance = 22
  resize(); dirty = 5
  setTimeout(() => $('loading').classList.add('fade'), 250)
  setMode('shelf')
  window.__sc = { tier: (t) => { if (t) { tier = t; pinned = true; setupTier() } return tier + ' ' + gpuName }, bulk: async (n) => { const P = ['ps5', 'ns', 'ns2']; for (let i = 0; i < n; i++) entries.push({ id: 'bulk' + i, title: `Test Game ${String(i + 1).padStart(3, '0')}`, platform: P[i % 3], order: entries.length, createdAt: Date.now() - i * 1e6, slots: {} }); await syncShelf(false); goCam(camShelfGoal()); return nCab }, page: () => [page, nCab], goPage: (p) => goPage(p), fps: () => renderer.info.render.calls, entries: () => entries.map((e) => e.title), info: () => entries.map((e) => ({ t: e.title, p: e.platform, front: !!e.slots?.front?.blob, auto: !!e.slots?.front?.auto, band: e.band, src: e.lookup?.src })), sugg: () => lkResults.map((r) => r.src + ':' + r.title + ':' + r.platform), plats: () => entries.map((e) => e.platform), kind: () => model.kind, editor: () => draft, mode: () => mode, state: () => ({ open: +open.toFixed(2), out: +out.toFixed(2), discFocus }), select: (i) => selectEntry(entries[i].id), screen: (i) => { const v = proxies.get(entries[i].id).position.clone().project(camera); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight] } }
  if (qs.has('inspect')) setTimeout(() => selectEntry(entries[Math.min(+qs.get('inspect') || 0, entries.length - 1)].id), 300)
}
boot()
