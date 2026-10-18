import '../ui/tokens.css'
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
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { ItemRotator } from '../demo/itemRotate.js'
import { Mover, Mover3, SOD3, sstep, BezierN } from '../demo/motion.js'
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js'
import { LightProbeGridWebGL } from 'three/examples/jsm/lighting/LightProbeGridWebGL.js'
import { loadBakedCabinet, bakedOnly } from './bakedCabinet.js'
import { loadCaseParts } from '../demo/caseModel.js'

const BASE = import.meta.env.BASE_URL
const qs = new URLSearchParams(location.search)
const $ = (id) => document.getElementById(id)
const mobile = matchMedia('(pointer: coarse)').matches || innerWidth < 700
let lang = localStorage.getItem('game-catalog-lang') === 'en' ? 'en' : 'zh'

// ---------------- i18n ----------------
const S = {
  zh: { brandT: '陈列柜', brandS: '我的电子实体版', vSpine: '书脊', vFront: '正面', makeT: '制作', loadT: '正在布置展柜…', emptyH: '展柜还是空的', emptyP: '上传封面，制作你的第一张电子实体版', emptyBtn: '开始制作',
    mExport: '导出收藏', mImport: '导入收藏', mLang: 'English', iBackT: '返回', iMoreT: '更多', tFilterT: '筛选', tEnvT: '环境', open: '打开', close: '合上', take: '取盘', put: '放回', flip: '翻面', iEditT: '编辑', iLeftT: '前移', iRightT: '后移', iDelT: '删除', envT: '环境与灯光', envResetT: '恢复预设',
    s_exposure: '曝光', s_ambient: '环境光', s_spot: '射灯', s_shelf: '柜内灯', s_temp: '色温', s_bg: '背景亮度', p_gallery: '展厅暖光', p_museum: '美术馆冷白', p_night: '夜间', p_daylight: '自然光', p_studio: '影棚',
    eNew: '制作电子实体版', eEdit: '编辑电子实体版', eCancel: '取消', eSave: '保存', lTitle: '游戏名称', lBand: '平台标识', lKey: 'Game-Key Card（钥匙卡）', platNote: '', pn_ps5: 'PS5 蓝色 Blu-ray 盒 · 135×171×13.5 mm', pn_ns: 'Switch 透明盒 + 深灰卡带 · 105×170×11 mm', pn_ns2: 'Switch 2 半透红盒 + 红色卡带 · 105×170×11 mm', takeC: '取卡带', sheetOut: '抽出封面', sheetIn: '放回封面', resetV: '复位', lkSearching: '正在搜索…', lkNone: '没有找到匹配，可上传封面，或直接保存（会根据名称生成封面）', lkWeb: '联网结果', lkCat: '目录', lkPick: '选一个自动填充封面与信息', lkFilled: '已自动填充：%s', lkFail: '封面下载失败，已保留其他信息', untitled: '未命名', putC: '放回', guideFrame: '红色边框', slotNote: '全部可选：输入游戏名会自动联网查找封面并补全，未填的部分自动生成；点卡片可上传或裁切。',
    cHint: '拖动移动 · 双指或滚轮缩放', cReset: '重置', cReplace: '换图', cRemove: '移除', cDone: '完成', auto: '自动生成', uploaded: '已上传', required: '必填', back: '←',
    sample: '示例 · 我的实体收藏', made: '电子实体版', needTitle: '请填写游戏名称', needFront: '请上传正面封面', saved: '已保存到展柜', deleted: '已删除', delQ: '确定删除「%s」吗？', exported: '已导出', imported: '已导入 %d 项', badFile: '文件无法识别',
    sampleRO: '示例条目不能编辑', processing: '处理中…', guideBand: 'PS5 顶条区域', guideBleed: '出血线', hub: '中心孔', title: '3D 陈列柜 · 我的电子实体版' },
  en: { brandT: 'Showcase', brandS: 'My digital physical editions', vSpine: 'Spines', vFront: 'Fronts', makeT: 'Create', loadT: 'Setting up the cabinet…', emptyH: 'The cabinet is empty', emptyP: 'Upload a cover to make your first digital physical edition', emptyBtn: 'Get started',
    mExport: 'Export collection', mImport: 'Import collection', mLang: '中文', iBackT: 'Back', iMoreT: 'More', tFilterT: 'Filter', tEnvT: 'Lighting', open: 'Open', close: 'Close', take: 'Take disc', put: 'Put back', flip: 'Flip', iEditT: 'Edit', iLeftT: 'Move left', iRightT: 'Move right', iDelT: 'Delete', envT: 'Environment & lighting', envResetT: 'Reset preset',
    s_exposure: 'Exposure', s_ambient: 'Ambient', s_spot: 'Spotlights', s_shelf: 'Shelf lights', s_temp: 'Colour temp', s_bg: 'Background', p_gallery: 'Gallery Warm', p_museum: 'Museum Cool', p_night: 'Night', p_daylight: 'Daylight', p_studio: 'Studio',
    eNew: 'New digital edition', eEdit: 'Edit digital edition', eCancel: 'Cancel', eSave: 'Save', lTitle: 'Game title', lBand: 'Platform logo', lKey: 'Game-Key Card', platNote: '', pn_ps5: 'PS5 blue Blu-ray case · 135×171×13.5 mm', pn_ns: 'Switch clear case + dark-grey card · 105×170×11 mm', pn_ns2: 'Switch 2 translucent red case + red card · 105×170×11 mm', takeC: 'Take card', sheetOut: 'Cover', sheetIn: 'Cover back', resetV: 'Reset', lkSearching: 'Searching…', lkNone: 'No match. Upload a cover or just save (a cover will be generated from the name)', lkWeb: 'Web', lkCat: 'Catalog', lkPick: 'Pick one to auto-fill cover and details', lkFilled: 'Auto-filled: %s', lkFail: 'Cover download failed; other details kept', untitled: 'Untitled', putC: 'Put back', guideFrame: 'Red frame', slotNote: 'Everything is optional: type a game name to look up the cover online; anything left blank is generated. Tap a card to upload or crop.',
    cHint: 'Drag to move · pinch or scroll to zoom', cReset: 'Reset', cReplace: 'Replace', cRemove: 'Remove', cDone: 'Done', auto: 'Auto', uploaded: 'Uploaded', required: 'Required', back: '←',
    sample: 'Sample · my physical copy', made: 'Digital physical edition', needTitle: 'Please enter a title', needFront: 'Please upload a front cover', saved: 'Saved to the cabinet', deleted: 'Deleted', delQ: 'Delete “%s”?', exported: 'Exported', imported: 'Imported %d item(s)', badFile: 'Unrecognised file',
    sampleRO: 'The sample entry is read-only', processing: 'Processing…', guideBand: 'PS5 band', guideBleed: 'Bleed', hub: 'Hub', title: '3D Showcase · digital physical editions' },
}
Object.assign(S.zh, { gPlat: '平台', gArt: '封面与印刷', eSubH: '实时 3D 预览 · 所有字段均可选', dCancel: '取消', delH: '删除这件收藏？', delP: '「%s」会从展柜中移除，此操作无法撤销。', delOk: '删除', rmH: '移除这张图片？', rmP: '该位置会恢复为自动生成的图案。', rmOk: '移除', discH: '放弃未保存的修改？', discP: '关闭后，本次编辑的内容不会保存。', discOk: '放弃', discNo: '继续编辑', stAuto: '自动生成', stUp: '已上传', stWeb: '联网封面' })
Object.assign(S.en, { gPlat: 'Platform', gArt: 'Covers & prints', eSubH: 'Live 3D preview · every field optional', dCancel: 'Cancel', delH: 'Delete this item?', delP: '“%s” will be removed from the cabinet. This can’t be undone.', delOk: 'Delete', rmH: 'Remove this image?', rmP: 'This slot goes back to generated artwork.', rmOk: 'Remove', discH: 'Discard unsaved changes?', discP: 'Closing now won’t save this edit.', discOk: 'Discard', discNo: 'Keep editing', stAuto: 'Generated', stUp: 'Uploaded', stWeb: 'Web cover' })
const t = (k) => S[lang][k] ?? k
function syncLang() {
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN'; document.title = t('title')
  for (const k of ['brandT', 'brandS', 'vSpine', 'vFront', 'makeT', 'loadT', 'emptyH', 'emptyP', 'emptyBtn', 'mExport', 'mImport', 'mLang', 'iBackT', 'iMoreT', 'tFilterT', 'tEnvT', 'iEditT', 'iLeftT', 'iRightT', 'iDelT', 'envT', 'envResetT', 'eCancel', 'eSave', 'lTitle', 'lBand', 'lKey', 'slotNote', 'cHint', 'cReset', 'cReplace', 'cRemove', 'cDone', 'gPlat', 'gArt', 'eSubH']) { const el = $(k); if (el) (el.querySelector(':scope>.lbl') || el).textContent = t(k) }
  $('langBtn').textContent = lang === 'en' ? '中文' : 'EN'; $('back').href = BASE
  if (typeof syncViewBtn === 'function') syncViewBtn(); syncInspectUI(); if (editing) renderSlots(); if (typeof renderEnvUI === 'function') renderEnvUI()
}
function toast(msg) { const el = $('toast'); el.textContent = msg; el.classList.remove('hidden'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.add('hidden'), 2200) }

// ---------------- icons (inline SVG, stroke = currentColor) ----------------
const gearPath = (() => { let d = ''; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 7.2 : 9.4, a2 = a + Math.PI / 16 * 0.55; d += `${i ? 'L' : 'M'}${(12 + r * Math.cos(a - Math.PI / 16 * 0.55)).toFixed(2)} ${(12 + r * Math.sin(a - Math.PI / 16 * 0.55)).toFixed(2)}L${(12 + r * Math.cos(a2)).toFixed(2)} ${(12 + r * Math.sin(a2)).toFixed(2)}` } return d + 'Z' })()
const IC = { back: '<path d="M15 18l-6-6 6-6"/>', open: '<path d="M3 5.5h6.5A2.5 2.5 0 0 1 12 8v11a2 2 0 0 0-2-2H3zM21 5.5h-6.5A2.5 2.5 0 0 0 12 8v11a2 2 0 0 1 2-2h7z"/>', close: '<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M9 3.5v17"/>',
  disc: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.4"/><path d="M12 6.2a5.8 5.8 0 0 1 5.4 3.7"/>', cart: '<rect x="7" y="3.5" width="10" height="17" rx="2"/><path d="M9.5 6.5h5M9.5 9h5"/>',
  sheetOut: '<path d="M5 11v8.5h14V11"/><path d="M12 15V3.5M8 7.5l4-4 4 4"/>', sheetIn: '<path d="M5 11v8.5h14V11"/><path d="M12 3.5V15M8 11l4 4 4-4"/>',
  flip: '<path d="M4 10a8 8 0 0 1 14.3-3.7L20 8M20 3.5V8h-4.5"/><path d="M20 14a8 8 0 0 1-14.3 3.7L4 16M4 20.5V16h4.5"/>', reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 3.5v5h5"/>',
  more: '<circle cx="5.5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18.5" cy="12" r="1.3" fill="currentColor"/>', filter: '<path d="M4 6.5h16M7 12h10M10 17.5h4"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', chevL: '<path d="M14.5 6l-6 6 6 6"/>', chevR: '<path d="M9.5 6l6 6-6 6"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>', trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>', upload: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5"/><path d="M4.5 14.5v4a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-4"/>', crop: '<path d="M6.5 2.5v15h15"/><path d="M2.5 6.5h15v15"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', minus: '<path d="M5 12h14"/>', alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4.5M12 17.6v.1"/>', spines: '<path d="M5 4.5v15M9 4.5v15M13 4.5v15"/><path d="M16.5 5.2l3.4 14"/>', fronts: '<rect x="3.5" y="5" width="7" height="14" rx="1.2"/><rect x="13.5" y="5" width="7" height="14" rx="1.2"/>', gear: `<path d="${gearPath}"/><circle cx="12" cy="12" r="3"/>` }
const svg = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k] || ''}</svg>`
function setIcon(el, k) { if (!el || el.dataset.icNow === k) return; el.dataset.icNow = k; el.querySelector('svg')?.remove(); el.insertAdjacentHTML('afterbegin', svg(k)) }
document.querySelectorAll('[data-ic]').forEach((el) => setIcon(el, el.dataset.ic))
/** contextual toolbar button: label, icon, emphasis ('pri' | 'acc' | ''), visibility, disabled */
function tbSet(id, { label, ic, kind = '', show = true, dis = false }) {
  const el = $(id); if (!el) return; el.classList.toggle('hidden', !show); if (!show) return
  if (label != null) { const sp = el.querySelector('span'); if (sp && sp.textContent !== label) sp.textContent = label; el.title = label }
  if (ic) setIcon(el, ic); el.classList.toggle('pri', kind === 'pri'); el.classList.toggle('acc', kind === 'acc'); el.disabled = !!dis
}

// ---------------- renderer / scene ----------------
const cv = $('c')
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: qs.has('shot') })
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2))
renderer.outputColorSpace = THREE.SRGBColorSpace
// Khronos PBR Neutral keeps print colours (covers) hue-accurate while still rolling off highlights
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap // r186: PCF honours shadow.radius (PCFSoft was removed)
RectAreaLightUniformsLib.init()
const scene = new THREE.Scene()
const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.32
// CC0 gallery HDRI (Poly Haven "sculpture_exhibition") for reflections; RoomEnvironment stays as the fallback
// (HDRI is loaded per environment preset: applyEnv / loadHdri below)
// strip probe-grid irradiance from big realtime surfaces outside the cabinet (floor/wall are lit by the spots already)
const noProbe = (m) => { m.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <lights_fragment_begin>', THREE.ShaderChunk.lights_fragment_begin.replace('#ifdef USE_LIGHT_PROBES_GRID', '#ifdef USE_LIGHT_PROBES_GRID_OFF')) }; m.customProgramCacheKey = () => 'noprobe'; return m }
scene.background = new THREE.Color(0x1b1916)
const camera = new THREE.PerspectiveCamera(mobile ? 46 : 36, 1, 0.05, 80)
const controls = new OrbitControls(camera, cv)
// inspect: camera + room stay fixed, the item itself is turned / zoomed / nudged
const rot = new ItemRotator(cv, camera, { onInput: () => { dirty = 3 } })
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
    Object.assign(controls, shelfLimits(), { enablePan: true, rotateSpeed: 0.5 })
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
// parallax rests centred: pointer leaving the window / tab blur / touch input → back to the centre (no stale edge offset)
const parCentre = () => par.set(0, 0)
document.documentElement.addEventListener('pointerleave', parCentre); addEventListener('blur', parCentre)
addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') parCentre() })

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
const floorMat = noProbe(new THREE.MeshPhysicalMaterial({ map: concreteTex(), color: 0x9a938b, roughness: 0.42, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.16, envMapIntensity: 0.6 }))
const floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 60), floorMat); floor.rotation.x = -Math.PI / 2; floor.position.set(40, 0, 10); floor.receiveShadow = true; scene.add(floor)
// back wall: warm gallery grey with a vertical gradient (lighter at eye level, darker toward ceiling + skirting)
function wallTex() {
  const c = canvas(16, 512), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 512)
  gr.addColorStop(0, '#2c2824'); gr.addColorStop(0.4, '#6d655c'); gr.addColorStop(0.8, '#7d7469'); gr.addColorStop(0.97, '#6f675e'); gr.addColorStop(1, '#3a3530')
  g.fillStyle = gr; g.fillRect(0, 0, 16, 512); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx
}
const wall = new THREE.Mesh(new THREE.PlaneGeometry(160, 16), noProbe(new THREE.MeshStandardMaterial({ map: wallTex(), roughness: 0.95 }))); wall.position.set(40, 8, -2.2); wall.receiveShadow = true; scene.add(wall)
const skirting = new THREE.Mesh(new THREE.BoxGeometry(160, 0.14, 0.04), new THREE.MeshStandardMaterial({ color: 0x2c2825, roughness: 0.6 })); skirting.position.set(40, 0.07, -2.18); scene.add(skirting)

// ---------------- cabinets (solid oak, paged side by side) ----------------
const CW = 5.7, CD = 1.9, SP = 2.2, PLINTH = 0.42, FT = 0.16 // inner width, depth, shelf pitch, plinth, frame thickness
const NSH = 3, ROWS_PER_CAB = NSH, CAB_GAP = 0.9, CAB_PITCH = CW + 2 * FT + CAB_GAP
// concealed compartment uplights (must match tools/blender/cabinet.py): front rail height, light depth/tilt, power
// FL_CASE: the cases stand ~0.2 in front of the strip, so at full bake power their spines blow out at the bottom → realtime
// share for the dynamic cases is reduced (the static cabinet only ever sees the baked value)
const RAIL_H = 0.055, FL_Z = CD / 2 - 0.115, FL_UP = 12, FL_W = 120, FL_CASE = +(qs.get('flc') || 0.35), FL_PROC = 0.6
const floorY = (i) => (i === 0 ? PLINTH : PLINTH + i * SP + 0.03) // top of the compartment floor (base board / glass shelf)
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
  const m = new THREE.MeshPhysicalMaterial({ roughness: 0.66, clearcoat: 0.3, clearcoatRoughness: 0.45, normalScale: new THREE.Vector2(0.45, 0.45), sheen: 0.15 })
  for (const k of ['map', 'normalMap', 'roughnessMap']) { const t = WOOD[k].clone(); t.anisotropy = renderer.capabilities.getMaxAnisotropy(); t.rotation = rot; t.repeat.set(...rep); t.needsUpdate = true; m[k] = t }
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
// Low-iron museum glass. Diffuse is black (no lit milky veil) and the blend is ONE / ONE_MINUS_SRC_ALPHA, so the
// shader's specular (GGX + Fresnel on the gallery HDRI, F0≈4% → strong only at grazing angles) is ADDED unscaled while
// what's behind is only dimmed by `opacity` (absorption). Single-sided (the GLB panes are closed boxes), no depth write,
// never casts or receives shadows, never lightmapped → cases behind stay crisp and colour-accurate.
function clearGlass(absorb, envI) {
  // direct lights stripped (bakedOnly): the LED area lights' LTC specular otherwise lays a broad veil over the pane;
  // the glass then shows only HDRI reflections, which is what museum glass in a dim room looks like
  return bakedOnly(new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0, metalness: 0, ior: 1.52, specularIntensity: 1, envMapIntensity: envI,
    transparent: true, opacity: absorb, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendEquation: THREE.AddEquation }))
}
// envMapIntensity < 1: the daylit gallery HDRI is far brighter than this dim room, so its 4 % normal-incidence
// reflection would veil the cases; Fresnel still brings the reflection up strongly at grazing angles
const glassMat = clearGlass(0.05, +(qs.get('ge') || 0.5))   // 10 mm shelves: a little more absorption
// polished front edge of the shelf: the only place low-iron glass shows its faint aqua-green
const glassEdge = new THREE.MeshPhysicalMaterial({ color: 0x8cc6ae, roughness: 0.04, transparent: true, opacity: 0.5, envMapIntensity: 1.2, depthWrite: false })
const doorGlass = clearGlass(0.03, +(qs.get('de') || 0.25))  // 4 mm door panes
if (qs.has('nopane')) doorGlass.visible = false // debug: reference view without door glass
const doorGlassDS = doorGlass.clone(); doorGlassDS.side = THREE.DoubleSide // procedural fallback panes are single planes
// polished edges of the frameless 8 mm door panes: the only place the low-iron glass shows its faint green
const doorEdge = new THREE.MeshPhysicalMaterial({ color: 0xb4ddcb, roughness: 0.05, transparent: true, opacity: 0.4, envMapIntensity: 1.2, depthWrite: false })
// thin edge highlight along the pane edges (light caught by the polished glass edge)
const glassLine = new THREE.MeshBasicMaterial({ color: 0xcfeee0, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending })
// glass must be invisible to GTAO: its normal/depth prepass ignores transparency, so a pane in front erased the
// ambient occlusion of every case behind it (flat, washed-out look through closed doors)
for (const m of [glassMat, glassEdge, doorGlass, doorGlassDS, doorEdge, glassLine, streakMat]) m.userData.noAO = true
const brass = new THREE.MeshPhysicalMaterial({ color: 0xc9a46a, metalness: 1, roughness: 0.36, clearcoat: 0.2, clearcoatRoughness: 0.2 })
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
    // concealed uplight: oak front rail on the compartment floor hides the light (no visible fixture); fake wall-wash
    // on the back panel brightest at the bottom, fading upward (the realtime area light adds the rest)
    const top = y + SP, fy = floorY(i)
    box(CW, RAIL_H, 0.03, frameMat, G, 0, fy + RAIL_H / 2, CD / 2 - 0.075, false, 0.006)
    plane(CW, SP * 0.95, washMat, G, 0, fy + SP * 0.475, -CD / 2 + 0.055).rotation.z = Math.PI
    if (!i) plane(CW - 0.1, 0.5, aoMat, G, 0, y + 0.004, -0.2, -Math.PI / 2).scale.y = 2.4 // soft contact shadow on the solid base
  }
  // floor contact shadow under the cabinet
  plane(outW + 0.9, DD + 0.9, aoMat, G, 0, 0.003, 0, -Math.PI / 2)
  // framed glass doors on brass barrel hinges with bar pulls
  for (const sx of [-1, 1]) {
    const pivot = new THREE.Group(); pivot.position.set(sx * (CW / 2 + FT * 0.5), PLINTH, CD / 2 + FT / 2 + 0.03); G.add(pivot)
    const dw = CW / 2 + FT * 0.5, door = new THREE.Group(); pivot.add(door)
    // frameless 8 mm low-iron pane (no stiles/rails), 3 mm centre gap, clamp pivot hinges + slim knob (same as cabinet.py)
    const PT = 0.08, xo = sx * 0.06, xi = -sx * (dw - 0.015), pw = Math.abs(xo - xi)
    const pane = new THREE.Mesh(new THREE.BoxGeometry(pw, inH - 0.02, PT), [doorEdge, doorEdge, doorEdge, doorEdge, doorGlass, doorGlass]); pane.position.set((xo + xi) / 2, inH / 2, 0); pane.renderOrder = 3; door.add(pane)
    for (const [lx, ly, lw, lh] of [[0, -1, 1, 0], [0, 1, 1, 0], [-1, 0, 0, 1], [1, 0, 0, 1]]) { const l = new THREE.Mesh(new THREE.PlaneGeometry(lw ? pw - 0.012 : 0.004, lh ? inH - 0.032 : 0.004), glassLine); l.position.set((xo + xi) / 2 + lx * (pw / 2 - 0.006), inH / 2 + ly * ((inH - 0.02) / 2 - 0.006), PT / 2 + 0.001); l.renderOrder = 4; door.add(l) }
    for (const [hy, sy] of [[0.07, -1], [inH - 0.07, 1]]) { box(0.15, 0.11, PT + 0.05, brass, door, -sx * 0.035, hy, 0, false, 0.012); const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.07, 16), brass); pin.position.set(0, hy + sy * 0.09, 0); door.add(pin) }
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.03, 24), brass); knob.rotation.x = Math.PI / 2; knob.position.set(-sx * (dw - 0.1), inH / 2, PT / 2 + 0.062); door.add(knob)
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.05, 12), brass); stem.rotation.x = Math.PI / 2; stem.position.set(-sx * (dw - 0.1), inH / 2, PT / 2 + 0.025); door.add(stem)
    pivot.userData = { sx, ci }; doors.push(pivot)
  }
  return G
}
// Baked cabinet (Blender GLB + Cycles lightmap) when available; the procedural build above is the fallback.
let BAKED = null
const cabSlots = []
function buildBaked(ci) {
  const { group, doors: d } = BAKED.make(ci, ci * CAB_PITCH); cabinet.add(group); doors.push(...d)
  plane(CW + 2 * FT + 0.9, CD + FT + 0.9, aoMat, group, 0, 0.003, 0, -Math.PI / 2) // floor contact shadow
  return group
}
// lazy: only the current page and its neighbours are instantiated (clones share geometry, materials and the lightmap)
function ensureCabs() {
  let made = false
  for (let i = 0; i < nCab; i++) {
    const near = Math.abs(i - page) <= 1
    if (near && !cabSlots[i]) { cabSlots[i] = BAKED ? buildBaked(i) : buildOne(i); made = true }
    if (cabSlots[i]) cabSlots[i].visible = near
  }
  if (made) { renderer.shadowMap.needsUpdate = true; dirty = 3 }
}
function buildCabinets(n, force = false) {
  if (n === nCab && cabinet.children.length && !force) { ensureCabs(); return }
  if (!BAKED) cabinet.traverse((o) => { if (o.isMesh && o.geometry && !Object.values(RB).includes(o.geometry)) o.geometry.dispose() })
  cabinet.clear(); doors.length = 0; cabSlots.length = 0; nCab = n
  page = Math.min(page, n - 1); ensureCabs(); buildFixtures(); placeLights()
}
// one set of area lights follows the current page (RectAreaLights are expensive per fragment)
const lightRig = new THREE.Group(); scene.add(lightRig)
// Concealed floor uplights (same as cabinet.py): one area light per compartment at the FRONT edge of its floor, just
// behind the oak rail, tilted FL_UP above horizontal toward the back panel → wall-wash brightest low, cases lit
// softly from the front-bottom. No geometry, no emissive, nothing for bloom to catch.
const leds = []
function aimLed(ra, W) {
  const t = THREE.MathUtils.degToRad(FL_UP), y = ra.userData.floor + 0.028
  ra.color.set(0xffc58a); ra.width = CW - 0.8; ra.height = 0.025; ra.intensity = W / (Math.PI * ra.width * ra.height) * (mobile ? 0.85 : 1)
  ra.position.set(0, y, FL_Z); ra.lookAt(0, y + Math.sin(t), FL_Z - Math.cos(t))
}
// realtime lights matched to the Cycles bake (cabinet.py: washers 350 W, down 490 W → W/4π cd; uplights FL_W each)
function useBakedLights() {
  leds.forEach((ra) => aimLed(ra, FL_W * FL_CASE))
  spots[0].intensity = spots[1].intensity = 70; // static meshes ignore direct light, so washers only light the dynamic cases: a little above the bake (28 cd) to keep spines readable
  spots[0].angle = spots[1].angle = 0.32; spots[0].penumbra = spots[1].penumbra = 0.8; spots[2].intensity = 39
}
for (let i = 0; i < NSH; i++) { const ra = new THREE.RectAreaLight(0xffc58a, 1, 1, 1); ra.userData.floor = floorY(i); aimLed(ra, FL_W * FL_PROC); lightRig.add(ra); leds.push(ra) }
// track spots (≈2900K) on a ceiling rail: two wash the cabinet face with soft-edged cones, one pools light on the aisle floor
const TRACK_Y = PLINTH + NSH * SP + FT + 3.4, TRACK_Z = 6.5, SPOT = 0xffd3a3
const spots = []
// [x, y, z, target x, y, z, intensity, angle, castShadow] — 2 cabinet washers + 2 wall scallops flanking the cabinet
// same positions / cones / powers as the Cycles bake (Blender W / 4π ≈ three cd): 2 washers + overhead down-light + 2 wall scallops
for (const [x, y, z, tx, ty, tz, I, ang, cast] of [[-2.3, TRACK_Y, TRACK_Z, -0.6, 4.6, 0.6, 150, 0.4, true], [2.3, TRACK_Y, TRACK_Z, 0.6, 4.6, 0.6, 150, 0.4, false], [0, TRACK_Y, TRACK_Z, 0, PLINTH, 0.2, 0, 0.3, false], [-3.65, TRACK_Y, -0.7, -3.65, 1.2, -2.2, 120, 0.5, false], [3.65, TRACK_Y, -0.7, 3.65, 1.2, -2.2, 120, 0.5, false]]) {
  const sp = new THREE.SpotLight(SPOT, I, 0, ang, 0.9, 2); sp.position.set(x, y, z); sp.target.position.set(tx, ty, tz)
  if (cast) { sp.castShadow = true; sp.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048); sp.shadow.radius = 4; sp.shadow.blurSamples = 12; sp.shadow.bias = -0.00015; sp.shadow.normalBias = 0.012; sp.shadow.camera.near = 4; sp.shadow.camera.far = 16 }
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
function placeLights() { ensureCabs(); lightRig.position.x = page * CAB_PITCH; key.position.x = 4 + page * CAB_PITCH; key.target.position.x = page * CAB_PITCH; key.target.updateMatrixWorld() }
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
  const shelf = NSH - 1 - (L.row % ROWS_PER_CAB), surf = shelf === 0 ? PLINTH : PLINTH + shelf * SP + 0.03, y = surf + 0.0015 + L.s.H / 2, x = L.cab * CAB_PITCH + L.x
  if (viewMode === 'spine') return { p: new THREE.Vector3(x, y, -0.05), r: new THREE.Euler(0, Math.PI / 2, 0), cab: L.cab, glass: shelf > 0, shelf }
  return { p: new THREE.Vector3(x, y + 0.006, -0.35), r: new THREE.Euler(-0.07, 0, 0), cab: L.cab, glass: shelf > 0, shelf }
}
// cheap contact shadow under every shelf case (cases are dynamic, so they can't be in the lightmap)
const decalGeo = new THREE.PlaneGeometry(1, 1)
const decalWood = new THREE.MeshBasicMaterial({ map: aoMat.map, transparent: true, depthWrite: false, opacity: 0.9, polygonOffset: true, polygonOffsetFactor: -2 })
const decalGlass = decalWood.clone(); decalGlass.opacity = 0.45
function fitDecal(m, p) {
  let d = m.userData.decal; if (!d) { d = new THREE.Mesh(decalGeo, decalWood); d.rotation.x = -Math.PI / 2; d.renderOrder = 2; m.add(d); m.userData.decal = d }
  const s = platformSpec(p); d.position.y = -s.H / 2 - 0.001; d.scale.set(s.W * 1.1 + 0.06, s.D * 2.4 + 0.08, 1)
}
// Soft shadow each case throws onto the back panel from the concealed floor uplight in front of it. The light sits low at
// the front, so a case blocks it from the floor up; the light is a strip along x, so the shadow is wide and very soft
// sideways (neighbours overlap and deepen, gaps leak light). The back panel is lightmapped (no realtime shadows), so this
// is a darkening card on the panel — a child of the proxy, so visibility / removal / glides follow the case.
const caseWallTex = (() => { const c = canvas(128, 128), g = c.getContext('2d'), id = g.createImageData(128, 128)
  for (let j = 0; j < 128; j++) for (let i = 0; i < 128; i++) { const u = (i / 127 - 0.5) * 2, v = j / 127, a = Math.exp(-u * u * 3.2) * (1 - Math.max(0, v - 0.0) ** 2.2 * 0.55) * Math.min(1, (1 - v) * 40); const k = (j * 128 + i) * 4; id.data[k] = id.data[k + 1] = id.data[k + 2] = 255 * a; id.data[k + 3] = 255 }
  g.putImageData(id, 0, 0); return new THREE.CanvasTexture(c) })()
caseWallTex.flipY = false // canvas row 0 = bottom of the card (darkest at the floor, easing off toward the shelf above)
const wallMat = new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: caseWallTex, transparent: true, opacity: 0.3, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })
const _wq = new THREE.Quaternion(), _wv = new THREE.Vector3()
function fitWall(m, L) {
  if (!L) return
  let w = m.userData.wall; if (!w) { w = new THREE.Mesh(decalGeo, wallMat); w.renderOrder = 2; w.castShadow = false; m.add(w); m.userData.wall = w }
  const s = platformSpec(m.userData.plat), xExt = viewMode === 'spine' ? s.D : s.W, fy = floorY(L.shelf), h = (L.shelf === NSH - 1 ? NSH * SP : (L.shelf + 1) * SP) + PLINTH - fy
  _wq.setFromEuler(L.r).invert()
  _wv.set(L.p.x, fy + h / 2, -CD / 2 + 0.053).sub(L.p).applyQuaternion(_wq); w.position.copy(_wv); w.quaternion.copy(_wq)
  w.scale.set(Math.max(0.3, xExt * 2.2) + 0.2, h, 1)
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
    if (!m) { m = new THREE.Mesh(proxyGeo(e.platform), placeholderMats(e.platform || 'ps5')); m.castShadow = true; m.receiveShadow = true; m.userData.id = e.id; m.userData.plat = e.platform || 'ps5'; scene.add(m); proxies.set(e.id, m); m.userData.fresh = true; fitDecal(m, e.platform) }
    const L = layoutTarget(e.id); if (!L) { m.visible = false; continue }
    m.userData.decal.material = L.glass ? decalGlass : decalWood; fitWall(m, L)
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
  const art = await getArt(e); freeMats(m); m.geometry = proxyGeo(e.platform); fitDecal(m, e.platform); m.userData.plat = e.platform || 'ps5'; fitWall(m, m.userData.home); m.material = proxyMats(art, e.platform || 'ps5'); dirty = 3
}
function goPage(p, cam = true) {
  p = THREE.MathUtils.clamp(p, 0, nCab - 1); if (p === page && cam) { goCam(camShelfGoal()); return }
  page = p; placeLights(); updateStreaming(); syncPager(); scheduleProbes(); if (cam && mode === 'shelf') { goCam(camShelfGoal()); applyLimits() } dirty = 3
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
let sel = null
let open = 0, openT = 0, hubP = 0, hubT = 0, out = 0, outT = 0, discFocus = false, flip = 0, flipT = 0, spin = 0, releaseArmed = false, reseating = false
let pendingSheetOut = false, sFlip = 0, sFlipT = 0
let dirty = 3, pending = null, sheetK = 0, sheetT = 0, rotObj = 'case', caseAway = 0, sheetDock = false, dockK = 0, pendingSheetIn = false
// ---------------- motion (velocity-continuous) ----------------
// Every animated quantity is a Mover: it carries value, velocity and acceleration, and every new goal is planned as a
// minimum-jerk quintic that STARTS from the current value / velocity / acceleration (so re-targets, interruptions and
// overlapping choreography never jump or stall) and lands with zero velocity and zero acceleration. Mechanism values
// (lid, disc, sheet, doors…) are used raw — no second easing curve on top — so the speed profile is one smooth bell.
// Flights (shelf ↔ inspect) follow ONE arc-length-parameterised Bézier from the current pose to the destination
// (tangent = current velocity, no back-and-forth), the camera follows a vector quintic in the same window and, when
// free, a critically damped second-order system. The user's arbitrary rotation is folded into per-object "carry"
// quaternions whose weights glide to 0 concurrently (no reset-first stage).
const RM = matchMedia('(prefers-reduced-motion: reduce)')
const DUR = (d) => (RM.matches ? Math.min(0.32, d * 0.4) : d)
const mkCarry = () => ({ q: new THREE.Quaternion(), off: new THREE.Vector3(), w: 0 })
const carry = { cCase: mkCarry(), cDisc: mkCarry(), cSheet: mkCarry() }, CARRY_OF = { case: 'cCase', disc: 'cDisc', sheet: 'cSheet' }
let flight = null, camTo = null, group = null, camScripted = false
const VARS = {
  open: [() => open, (v) => (open = v)], out: [() => out, (v) => (out = v)], hubP: [() => hubP, (v) => (hubP = v)], sheetK: [() => sheetK, (v) => (sheetK = v)],
  dockK: [() => dockK, (v) => (dockK = v)], sFlip: [() => sFlip, (v) => (sFlip = v)], flip: [() => flip, (v) => (flip = v)], caseAway: [() => caseAway, (v) => (caseAway = v)],
  door: [() => doorOpen, (v) => (doorOpen = v)], fly: [() => (flight ? flight.u : 0), (v) => { if (flight) flight.u = v }],
  cCase: [() => carry.cCase.w, (v) => (carry.cCase.w = v)], cDisc: [() => carry.cDisc.w, (v) => (carry.cDisc.w = v)], cSheet: [() => carry.cSheet.w, (v) => (carry.cSheet.w = v)],
}
// free channels follow their flag; durations scale with the distance still to travel
const GOALS = { open: () => openT, hubP: () => hubT, out: () => outT, sheetK: () => sheetT, sFlip: () => sFlipT, dockK: () => (sheetDock ? 1 : 0), flip: () => flipT,
  caseAway: () => (discFocus ? 1 : 0), door: () => doorTarget, cCase: () => 0, cDisc: () => 0, cSheet: () => 0 }
const BASE_D = { open: 0.95, hubP: 0.3, out: 1.1, sheetK: 2.5, sFlip: 0.85, dockK: 0.8, flip: 0.8, caseAway: 0.95, door: 0.95, cCase: 0.65, cDisc: 0.65, cSheet: 0.65 }
const durFor = (k, d) => DUR(BASE_D[k] * (0.45 + 0.55 * Math.sqrt(Math.min(1, Math.abs(d)))))
const MV = Object.fromEntries(Object.keys(VARS).map((k) => [k, new Mover(VARS[k][0]())]))
const CLAMP01 = new Set(['open', 'out', 'hubP', 'sheetK', 'dockK', 'sFlip', 'flip', 'caseAway', 'door', 'fly', 'cCase', 'cDisc', 'cSheet'])
const owns = (k) => MV[k].active
function drive(dt) {
  let moving = false
  for (const k in MV) {
    const m = MV[k], [get, set] = VARS[k], cur = get()
    if (Math.abs(cur - (m._out ?? m.x)) > 1e-9) m.set(cur) // written from outside (reset, editor…) → adopt, at rest
    const g = GOALS[k] && GOALS[k]()
    if (g != null && (m.active ? Math.abs(m.goal - g) > 1e-9 : Math.abs(m.x - g) > 1e-9)) m.to(g, durFor(k, g - m.x))
    if (m.step(dt)) moving = true
    const v = CLAMP01.has(k) ? THREE.MathUtils.clamp(m.x, 0, 1) : m.x; m._out = v; set(v)
  }
  if (group && group.keys.every((k) => !MV[k].active) && !camScripted) { const d = group.done; group = null; d?.() }
  return moving
}
/** user took over: the running channels keep gliding to their (already updated) goals; only the completion hook is dropped */
function interrupt() { if (group && mode === 'inspect') group = null }
const carrySlerp = (c, out) => out.identity().slerp(c.q, c.w)
const _cq = new THREE.Quaternion(), _cq2 = new THREE.Quaternion(), _cq3 = new THREE.Quaternion(), _co = new THREE.Vector3()
/** fold the rotator's current rotation / zoom / pan into the active object's carry, then zero the rotator (no visual change) */
function captureCarry() {
  if (rot.idle) return
  const c = carry[CARRY_OF[rotObj]], q = rot.quaternion(_cq), o = rot.offset(rotObj === 'disc' ? floatPoint() : INS, _co)
  carrySlerp(c, _cq2); c.q.copy(q).multiply(_cq2); c.off.multiplyScalar(c.w).add(o); c.w = 1
  rot.resetNow()
}
function relax() { captureCarry() } // "reset view": the rotation glides out on its own
function cubic(a, b, c, d, k, out) { const u = 1 - k; return out.set(0, 0, 0).addScaledVector(a, u * u * u).addScaledVector(b, 3 * u * u * k).addScaledVector(c, 3 * u * k * k).addScaledVector(d, k * k * k) }
const _fp = new THREE.Vector3(), _fq = new THREE.Quaternion()
/** pose of the case centre along the current flight (u = normalised arc length) */
function flyPose(u, p, q) { const c = flight.path.getPoint(THREE.MathUtils.clamp(u, 0, 1)); p.copy(c); q.slerpQuaternions(flight.q0, flight.q1, sstep(0.02, 0.88, u)); return p }
/** Plan one flight. segs: 'in' = Bézier from p0 (leaving along its current velocity v0, or `dir` from rest) to the slot
 *  mouth `mouth`, then a straight slide into the slot `slot`; 'out' = straight slide out of the slot to `mouth`, then a
 *  Bézier on to `p3` arriving along `arrive`. Tangent-continuous at the junction, arc-length parameterised. */
function planFlight({ kind, p0, v0 = new THREE.Vector3(), dir, mouth, slot, p3, arrive, q0, q1, T, delay = 0 }) {
  const path = new THREE.CurvePath(), sp = v0.length()
  if (kind === 'in') {
    const d0 = sp > 0.05 ? v0.clone().divideScalar(sp) : dir.clone().normalize(), inDir = mouth.clone().sub(slot).normalize()
    const span = p0.distanceTo(mouth), h0 = Math.max(0.3 * span, sp * T / 4)
    // last three control points on the slot axis → zero curvature where the arc meets the straight slide (no accel jump)
    const b = new BezierN([p0, p0.clone().addScaledVector(d0, h0), mouth.clone().addScaledVector(inDir, 0.5 * span), mouth.clone().addScaledVector(inDir, 0.22 * span), mouth])
    path.add(b); path.add(new THREE.LineCurve3(mouth.clone(), slot.clone()))
  } else {
    const outDir = mouth.clone().sub(p0).normalize(), span = mouth.distanceTo(p3)
    const b = new BezierN([mouth, mouth.clone().addScaledVector(outDir, 0.2 * span), mouth.clone().addScaledVector(outDir, 0.45 * span), p3.clone().addScaledVector(arrive, -0.38 * span), p3])
    path.add(new THREE.LineCurve3(p0.clone(), mouth.clone())); path.add(b)
  }
  const L = Math.max(1e-3, path.getLength())
  flight = { path, q0: q0.clone(), q1: q1.clone(), u: 0, L, T }
  const m = MV.fly; m.set(0); m.v = sp / L; m.to(1, T, delay)
}
/** scripted camera: vector quintic from the current camera position / target / velocity to `g` */
const camMv = { p: new Mover3(), t: new Mover3() }, camVel = new THREE.Vector3(), tgtVel = new THREE.Vector3(), _camPrev = new THREE.Vector3(), _tgtPrev = new THREE.Vector3()
function scriptCam(g, T, delay = 0) { camMv.p.set(camera.position, camVel); camMv.t.set(controls.target, tgtVel); camMv.p.to(g.p, T, delay); camMv.t.to(g.t, T, delay); camScripted = true; camGoal = g; auto = true }
/** kind: 'disc' (put disc / card back) · 'close' (reseat + close lid) · 'sheet' (cover back; closes first if needed) · 'shelf' (everything + fly home) */
function choreo(kind) {
  captureCarry()
  const keys = [], P = (k, to, at, dur) => { MV[k].to(to, DUR(dur), DUR(at)); keys.push(k) }
  for (const k of ['cCase', 'cDisc', 'cSheet']) if (carry[k].w > 0) P(k, 0, 0, 0.7)
  const discOut = out > 0.001 || !!outT || discFocus, isOpen = open > 0.001 || !!openT, shelf = kind === 'shelf'
  let tDisc = 0, tLid = 0
  if (discOut) { const d = 0.75 + 0.25 * out; P('out', 0, 0, d); P('flip', 0, 0, 0.7); if (!shelf) P('caseAway', 0, 0, 0.85); P('hubP', 0, d * 0.72, 0.32); tDisc = d }
  else if (hubP > 0) P('hubP', 0, 0, 0.3)
  const sheetBack = (kind === 'sheet' || shelf) && (sheetK > 0 || !!sheetT)
  const close = isOpen && (kind === 'close' || shelf || (kind === 'sheet' && sheetK > 0))
  if (close) { const a = discOut ? tDisc * 0.55 : 0, d = 0.62 + 0.3 * open; P('open', 0, a, d); tLid = a + d }
  if (sheetBack) { const a = close ? Math.max(0, tLid - 0.4) : 0, d = 0.95 + 0.85 * sheetK; P('sFlip', 0, 0, 0.7); P('sheetK', 0, a, d); if (dockK > 0) P('dockK', 0, a, 0.8) }
  // flags describe the destination right away, so an interruption simply re-targets the channels it touches
  discFocus = false; outT = 0; flipT = 0; reseating = false; releaseArmed = false; hubT = 0; sFlipT = 0; pendingSheetIn = false
  if (close) openT = 0
  if (sheetBack) { sheetT = 0; sheetDock = false }
  if (shelf) {
    const m = proxies.get(sel.id), home = m.userData.home
    // ONE path from where the case is NOW (incl. its step-aside) to the slot: the step-aside offset is folded into the start
    const p0 = INS.clone().add(caseOffset(_v)), v0 = caseVelW.clone()
    MV.caseAway.set(0); caseAway = 0; flightAway = true
    const mouth = home.p.clone().add(new THREE.Vector3(0, 0.05, viewMode === 'spine' ? 1.05 : 0.95))
    const dir = mouth.clone().sub(p0).normalize().add(new THREE.Vector3(0, 0.55, 0)) // up and on toward the slot: no recoil toward the viewer
    const T = DUR(THREE.MathUtils.clamp(1.4 + 0.05 * p0.distanceTo(home.p), 1.55, 1.95)), a = DUR(discOut ? 0.32 : sheetBack ? 0.4 : close ? 0.12 : 0)
    planFlight({ kind: 'in', p0, v0, dir, mouth, slot: home.p, q0: holder.quaternion, q1: _q.setFromEuler(home.r), T, delay: a }); keys.push('fly')
    camTo = shelfCamPose(camShelfGoal()); scriptCam(camTo, T + DUR(0.12), a * 0.6)
    MV.door.to(0, DUR(0.95), a + T - DUR(0.5)); keys.push('door')
    doorTarget = 0; pendingSheetOut = false
    mode = 'return'; document.body.className = 'mode-shelf'; $('inspect').classList.add('hidden'); closeMenus()
    group = { keys, done: finishReturn }
  } else group = { keys, done: () => { syncInspectUI(); dirty = 3 } }
  syncInspectUI(); dirty = 3
}
let flightAway = false
const caseVelW = new THREE.Vector3(), _cw = new THREE.Vector3(), _cwPrev = new THREE.Vector3()
const _anc = new THREE.Matrix4(), _ancV = new THREE.Vector3()
/** the case frame without its step-aside offset: the travelling sheet's path is anchored here, so the case moving out of
 *  the way never drags the sheet (null = no offset, use the live frame) */
function sheetAnchor(R) { sheetOffsets(_lat, _ancV); if (_ancV.lengthSq() === 0 && caseAway <= 0) return null; R.updateWorldMatrix(true, false); return _anc.makeTranslation(_ancV.negate().sub(awayVec(caseAway, _v2))).multiply(R.matrixWorld) }
const awayVec = (a, out) => out.set(-3.6 * a, 0, -0.25 * a)
// Cover pull-out: the CASE slides down off the sheet (relative motion = pure slide along the case's up axis, the sheet
// stays where it is, in view) and, once the sheet's bottom edge has cleared the case top, curves away sideways / back
// underneath it — one arc-length path keyed to the sheet's progress: straight drop, tangent-continuous Bézier turn.
// The sheet unfolds only after the clear point (kc = drop length / path length), so the two can never meet.
const _lat = new THREE.Vector3(), _ancV2 = new THREE.Vector3(), _dropP = new THREE.Vector3()
let casePath = null
function sheetCasePath() {
  const S = model.sheetSlide
  if (casePath && casePath.S === S) return casePath
  const p = new THREE.CurvePath(), a = new THREE.Vector3(0, -S, 0), e = new THREE.Vector3(-2.7, -S - 0.3, -0.35)
  const b = new BezierN([a, a.clone().add(new THREE.Vector3(0, -0.3, 0)), a.clone().add(new THREE.Vector3(0, -0.6, 0)), e.clone().add(new THREE.Vector3(1.5, 0, 0.12)), e])
  p.add(new THREE.LineCurve3(new THREE.Vector3(), a.clone())); p.add(b); p.S = S; p.kc = S / p.getLength(); casePath = p; return p
}
/** [world offset of the case, its post-clear (lateral) part] for the current sheet progress */
function sheetOffsets(off, lat) {
  off.set(0, 0, 0); lat.set(0, 0, 0); if (flightAway || sheetK <= 0) return
  const P = sheetCasePath(), f = 1 - dockK; off.copy(P.getPoint(Math.min(1, sheetK))).multiplyScalar(f)
  lat.copy(off).sub(_dropP.set(0, -P.S * Math.min(1, sheetK / P.kc) * f, 0))
}
/** full world offset of the case from its inspect pose (disc step-aside + cover slide-off) */
function caseOffset(out) { sheetOffsets(_lat, _ancV2); return awayVec(caseAway, out).add(_lat) }
const awayNow = () => (sheetK > 0 && !flightAway ? Math.max(caseAway, 1 - dockK) : caseAway)
// decal / wall shadow of the flying proxy fade in during the last stretch instead of popping on
const _fadeMats = new Map()
function shelfShadows(m, f) {
  for (const key of ['decal', 'wall']) {
    const d = m.userData[key]; if (!d) continue
    if (f >= 1) { const o = _fadeMats.get(d); if (o) { d.material = o.base; _fadeMats.delete(d) } d.visible = true; continue }
    let o = _fadeMats.get(d); if (!o || o.base !== d.material && o.mat !== d.material) { o = { base: d.material, mat: d.material.clone() }; _fadeMats.set(d, o) }
    d.material = o.mat; o.mat.opacity = o.base.opacity * f; d.visible = f > 0.001
  }
}
function swapToProxy() { // exactly one case: the shelf proxy takes over in the same frame, at the same pose
  const m = proxies.get(sel.id); flyPose(flight.u, _fp, _fq); m.position.copy(_fp); m.quaternion.copy(_fq); m.scale.setScalar(1)
  holder.visible = false; model.disc.visible = false; m.visible = true; mode = 'back'
}
function finishReturn() {
  if (mode === 'return') swapToProxy()
  const m = proxies.get(sel.id); m.position.copy(m.userData.home.p); m.quaternion.setFromEuler(m.userData.home.r); shelfShadows(m, 1)
  flight = null; flightAway = false; setMode('shelf'); doorTarget = 0; sel = null; camGoal = camShelfGoal(); auto = true; camSod.reset(camera.position, controls.target)
}
const DOCK_OFF = new THREE.Vector3(-1.55, 0.62, -0.7), _dockP = new THREE.Vector3(), _cp = new THREE.Vector3(), _F = new THREE.Vector3()
function inspCam(out) { const d = mobile && innerWidth < innerHeight ? 5.2 : 4.0; return out.copy(INS).add(_v2.set(0.75, 0.42, d)) }
const _v2 = new THREE.Vector3()
function setMode(m) { mode = m; applyLimits(); if (typeof updateStreaming === 'function' && entries.length) updateStreaming(); document.body.className = 'mode-' + m; $('inspect').classList.toggle('hidden', !(m === 'inspect')); $('empty').classList.toggle('hidden', entries.length > 0 || m !== 'shelf'); syncInspectUI(); dirty = 3 }
function camShelfGoal() {
  const c = cabinetCenter(), h = NSH * SP + PLINTH, aspect = innerWidth / innerHeight
  const fov = THREE.MathUtils.degToRad(camera.fov), distH = (h * 0.54) / Math.tan(fov / 2), distW = ((CW + 0.6) * 0.55) / (Math.tan(fov / 2) * aspect)
  const d = Math.max(distH, distW) + CD / 2
  return { p: new THREE.Vector3(c.x + d * 0.12, c.y + 0.35, d), t: new THREE.Vector3(c.x, c.y - 0.05, 0) }
}
// inspect camera: one fixed view direction (the items move, not the view); only its distance and a lateral/vertical shift
// adapt so the item in its REST pose (user rotation/zoom excluded) fits the visible area between the top bar / title card
// and the toolbar with a FIT_M margin, centred in that area. Never closer than the base distance.
const FIT_M = 0.06
function camInspectGoal() { return inspectFitPose() }
const floatPoint = () => INS.clone().lerp(inspCam(new THREE.Vector3()), model.kind === 'cart' ? 0.5 : 0.4)
let _insets = null, _insetsT = -1
function visibleNdc() { // visible rect of the canvas in NDC: [x0, x1, y0, y1]
  const now = performance.now(); if (_insets && now - _insetsT < 300) return _insets
  const W = innerWidth, H = innerHeight; let top = 0, bot = H
  const bar = document.querySelector('header.bar'), hd = $('ihead'), tb = $('ibar')
  const rb = bar && bar.getBoundingClientRect(); if (rb && rb.height) { const b = [...bar.children].reduce((m, el) => { const r = el.getBoundingClientRect(); return r.height ? Math.max(m, r.bottom) : m }, 0); top = Math.max(top, b || rb.bottom) }
  const rh = hd && hd.getBoundingClientRect(); if (rh && rh.height && rh.width > W * 0.5) top = Math.max(top, rh.bottom)
  const rt = tb && tb.getBoundingClientRect(); if (rt && rt.height) bot = Math.min(bot, rt.top); else if (_insets) return _insets
  top = Math.min(top, H * 0.35); bot = Math.max(bot, H * 0.65)
  _insets = [-1, 1, 1 - (2 * bot) / H, 1 - (2 * top) / H]; _insetsT = now; return _insets
}
const _fitCam = new THREE.PerspectiveCamera(), _fitPts = Array.from({ length: 8 }, () => new THREE.Vector3()), _fitB = new THREE.Box3(), _fitB2 = new THREE.Box3(), _fitM = new THREE.Matrix4(), _fitInv = new THREE.Matrix4()
const _fz = new THREE.Vector3(), _fx = new THREE.Vector3(), _fy = new THREE.Vector3(), _fc = new THREE.Vector3(), _ft = new THREE.Vector3(), _fv = new THREE.Vector3()
const _sp2 = new THREE.Vector3(); let sheetRest = null // { P, w, h } written by tick: flat sheet rest centre + size (no user offset)
/** rest-pose points of what the inspect view is about: flat cover sheet / lifted disc / the (opening) case */
function inspectContent() {
  let n = 0; const quad = (c, hw, hh) => { for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) _fitPts[n++].copy(c).addScaledVector(_fx, a * hw).addScaledVector(_fy, b * hh) }
  if (sheetK > 0.5 && !sheetDock && sheetRest) quad(sheetRest.P, sheetRest.w / 2, sheetRest.h / 2)
  else if (holder.visible && (discFocus || out > 0.5)) {
    const d = model.disc; if (!d.geometry?.boundingBox && d.geometry) d.geometry.computeBoundingBox()
    let r = 0.6 // world-space half extent (local bounds × scale), independent of the current spin
    if (d.geometry?.boundingBox) { const b = d.geometry.boundingBox; r = (Math.max(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z) / 2) * d.scale.x }
    else { d.updateMatrixWorld(true); _fitInv.copy(d.matrixWorld).invert(); _fitB.makeEmpty(); d.traverse((o) => { if (o.isMesh && o.geometry) { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); _fitB.union(_fitB2.copy(o.geometry.boundingBox).applyMatrix4(_fitM.multiplyMatrices(_fitInv, o.matrixWorld))) } })
      if (!_fitB.isEmpty()) { _fitB.getSize(_fv); r = (Math.max(_fv.x, _fv.y, _fv.z) / 2) * d.scale.x } }
    const F = floatPoint(); quad(F, r, r)
  } else {
    const R = model.root, rest = _fc.copy(INS).add(_fv.set(0.62 * open, 0, 0))
    if (!holder.visible || open < 0.02) { _fitB.set(_fv.set(-model.W / 2, -model.H / 2, -model.D / 2), _ft.set(model.W / 2, model.H / 2, model.D / 2)) }
    else {
      R.updateMatrixWorld(true); _fitInv.copy(R.matrixWorld).invert(); _fitB.makeEmpty()
      R.traverse((o) => { if (!o.isMesh || !o.visible || !o.geometry) return; for (let q = o; q && q !== R; q = q.parent) if (q === model.sheetG || q === model.disc) return
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); _fitB.union(_fitB2.copy(o.geometry.boundingBox).applyMatrix4(_fitM.multiplyMatrices(_fitInv, o.matrixWorld))) })
      if (_fitB.isEmpty()) _fitB.set(_fv.set(-model.W / 2, -model.H / 2, -model.D / 2), _ft.set(model.W / 2, model.H / 2, model.D / 2))
    }
    for (let i = 0; i < 8; i++) _fitPts[n++].set(i & 1 ? _fitB.max.x : _fitB.min.x, i & 2 ? _fitB.max.y : _fitB.min.y, i & 4 ? _fitB.max.z : _fitB.min.z).add(rest)
  }
  return n
}
function _fitExt(t, D, n) { // projected NDC extents of the content with the camera at t + z·D looking at t
  _fitCam.position.copy(t).addScaledVector(_fz, D); _fitCam.lookAt(t); _fitCam.updateMatrixWorld(); _fitCam.matrixWorldInverse.copy(_fitCam.matrixWorld).invert()
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9
  for (let i = 0; i < n; i++) { const v = _fv.copy(_fitPts[i]).project(_fitCam); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y) }
  return [x0, x1, y0, y1]
}
function inspectFitPose() {
  const base = inspCam(new THREE.Vector3()), D0 = base.distanceTo(INS); _fz.copy(base).sub(INS).normalize()
  _fx.crossVectors(camera.up, _fz).normalize(); _fy.crossVectors(_fz, _fx)
  _fitCam.fov = camera.fov; _fitCam.aspect = camera.aspect; _fitCam.near = camera.near; _fitCam.far = camera.far; _fitCam.updateProjectionMatrix()
  const n = inspectContent(), [vx0, vx1, vy0, vy1] = visibleNdc(), mw = (vx1 - vx0) * (1 - 2 * FIT_M), mh = (vy1 - vy0) * (1 - 2 * FIT_M), xc = (vx0 + vx1) / 2, yc = (vy0 + vy1) / 2
  const t = _ft.set(0, 0, 0); for (let i = 0; i < n; i++) t.add(_fitPts[i]); t.divideScalar(n)
  const tanY = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2), tanX = tanY * camera.aspect; let D = D0
  for (let it = 0; it < 3; it++) {
    const fits = (d) => { const e = _fitExt(t, d, n); return e[1] - e[0] <= mw && e[3] - e[2] <= mh }
    if (fits(D0)) D = D0; else { let lo = D0, hi = D0 * 1.5; while (!fits(hi) && hi < D0 * 8) { lo = hi; hi *= 1.5 } for (let k = 0; k < 22; k++) { const m = (lo + hi) / 2; if (fits(m)) hi = m; else lo = m } D = hi }
    const e = _fitExt(t, D, n), ex = (e[0] + e[1]) / 2 - xc, ey = (e[2] + e[3]) / 2 - yc
    t.addScaledVector(_fx, ex * D * tanX).addScaledVector(_fy, ey * D * tanY)
  }
  return { p: t.clone().addScaledVector(_fz, D), t: t.clone() }
}
let camGoal = null
function goCam(g) { if (!auto || !camSod.live) camSod.reset(camera.position, controls.target, camVel, tgtVel); camGoal = g; auto = true }
// free-camera follower: critically damped second-order dynamics on position and target (velocity carries over)
const camSod = {
  live: false, p: null, t: null,
  reset(p, t, vp = null, vt = null) { if (!this.p) { this.p = new SOD3(1.15, 1, 0, p); this.t = new SOD3(1.15, 1, 0, t) } this.p.reset(p, vp); this.t.reset(t, vt); this.live = true },
  follow(dt, g) {
    if (!this.live) this.reset(camera.position, controls.target)
    camera.position.copy(this.p.update(dt, g.p)); controls.target.copy(this.t.update(dt, g.t))
    if (camera.position.distanceToSquared(g.p) < 4e-8 && controls.target.distanceToSquared(g.t) < 4e-8 && this.p.yd.lengthSq() < 1e-6 && this.t.yd.lengthSq() < 1e-6) {
      camera.position.copy(g.p); controls.target.copy(g.t); this.p.reset(g.p); this.t.reset(g.t); return false }
    return true
  },
}
function shelfLimits() {
  const g = camShelfGoal(), sph = new THREE.Spherical().setFromVector3(g.p.clone().sub(g.t)), A = THREE.MathUtils.degToRad(15), P = THREE.MathUtils.degToRad(11)
  return { minAzimuthAngle: sph.theta - A, maxAzimuthAngle: sph.theta + A, minPolarAngle: sph.phi - P, maxPolarAngle: Math.min(Math.PI / 2 - 0.05, sph.phi + P), minDistance: sph.radius * 0.5, maxDistance: sph.radius * 1.12 }
}
const _par = new THREE.Vector3(), _sph = new THREE.Spherical()
/** where the shelf camera actually rests: goal + pointer parallax, already inside the shelf OrbitControls limits */
function shelfCamPose(g) {
  const L = shelfLimits(), p = _par.copy(g.p); if (!qs.has('shot')) p.add(_v2.set(par.x * 0.5, -par.y * 0.3, 0))
  _sph.setFromVector3(p.sub(g.t)); _sph.phi = THREE.MathUtils.clamp(_sph.phi, L.minPolarAngle, L.maxPolarAngle); _sph.theta = THREE.MathUtils.clamp(_sph.theta, L.minAzimuthAngle, L.maxAzimuthAngle); _sph.radius = THREE.MathUtils.clamp(_sph.radius, L.minDistance, L.maxDistance)
  return { p: new THREE.Vector3().setFromSpherical(_sph).add(g.t), t: g.t.clone() }
}

async function selectEntry(id) {
  if (mode !== 'shelf') return
  const m = proxies.get(id); if (!m) return
  sel = entries.find((e) => e.id === id); inspectPose()
  mode = 'fly'; document.body.className = 'mode-inspect'; doorTarget = 1
  $('empty').classList.add('hidden'); useModel(sel.platform); pending = getArt(sel).then((art) => model.setArt(art))
  // one arc: straight out of the slot toward the viewer, on to the inspect point, arriving from slightly behind / above
  const home = m.userData.home, slideOut = home.p.clone().add(new THREE.Vector3(0, 0.05, viewMode === 'spine' ? 1.0 : 0.9))
  const T = DUR(THREE.MathUtils.clamp(1.35 + 0.05 * home.p.distanceTo(INS), 1.5, 1.85))
  planFlight({ kind: 'out', p0: m.position, mouth: slideOut, p3: INS, arrive: new THREE.Vector3(0, -0.15, 1).normalize(), q0: m.quaternion, q1: qFront, T })
  scriptCam(camInspectGoal(), T + DUR(0.1))
}
async function finishFly() {
  await pending; const m = proxies.get(sel.id)
  holder.position.copy(INS).sub(new THREE.Vector3(0, Hm() / 2, 0)); holder.rotation.set(0, 0, 0); holder.visible = true; model.disc.visible = true
  open = openT = hubP = hubT = out = outT = 0; discFocus = false; flip = flipT = 0
  model.pose(0, 0); m.visible = false; flight = null; setMode('inspect'); goCam(camInspectGoal())
}
function backToShelf() { if (mode === 'inspect' && sel) choreo('shelf') }
function pressHub() { if (mode !== 'inspect' || open < 0.65 || outT || (sheetK > 0 && !sheetDock)) return; relax(); reseating = false; releaseArmed = false; hubT = 1; syncInspectUI() }
function reseat() { choreo('disc') }
// contextual inspect toolbar: case → open | case open → take disc | disc out → put back / flip | cover out → put back / flip
function inspectState() { if (sheetK > 0 && !sheetDock) return 'cover'; if (outT || discFocus || out > 0.02) return 'disc'; if (openT || open > 0.5) return 'open'; return 'case' }
function syncInspectUI() {
  if (!sel) return
  $('iTitle').textContent = sel.title || ''
  { const pl = sel.platform || 'ps5', sub = $('iSub'); sub.textContent = ''; const bd = document.createElement('span'); bd.className = 'badge ' + pl; bd.textContent = { ps5: 'PS5', ns: 'Switch', ns2: 'Switch 2' }[pl]; const tx = document.createElement('span'); tx.textContent = sel.sample ? t('sample') : `${sel.keyCard && pl === 'ns2' ? 'Game-Key Card · ' : ''}${t('made')}`; sub.append(bd, tx) }
  const st = inspectState(), cart = model.kind === 'cart', sheetBusy = (sheetT && sheetK < 1) || (!sheetT && sheetK > 0) || pendingSheetOut
  const openBusy = !!(outT || out > 0.02 || hubT || (sheetT && sheetK < 1 && !sheetDock) || (!sheetT && sheetK > 0))
  tbSet('iOpen', { label: openT ? t('close') : t('open'), ic: openT ? 'close' : 'open', kind: st === 'case' ? 'pri' : '', show: st === 'case' || st === 'open', dis: openBusy })
  tbSet('iDisc', { label: (outT || discFocus) ? t(cart ? 'putC' : 'put') : t(cart ? 'takeC' : 'take'), ic: cart ? 'cart' : 'disc', kind: st === 'open' ? 'acc' : st === 'disc' ? 'pri' : '', show: st === 'open' || st === 'disc', dis: (!(open > 0.65) && !outT) || (sheetK > 0 && !sheetDock) || (outT && !discFocus) })
  tbSet('iSheet', { label: sheetT ? t('sheetIn') : t('sheetOut'), ic: sheetT ? 'sheetIn' : 'sheetOut', kind: st === 'cover' ? 'pri' : '', show: st !== 'disc', dis: sheetBusy || (sheetT && sheetDock) })
  tbSet('iFlip', { label: t('flip'), show: (st === 'disc' && discFocus) || (st === 'cover' && sheetK >= 1) })
  tbSet('iReset', { label: t('resetV'), show: !rot.idle })
  $('iEdit').disabled = !!sel.sample
}

// ---------------- picking ----------------
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let downAt = null
cv.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY, performance.now()]; closeMenus(); if (mode === 'inspect') interrupt() })
cv.addEventListener('pointerup', (e) => {
  if (downAt && mode === 'shelf') { const dx = e.clientX - downAt[0], dy = e.clientY - downAt[1]; if (Math.abs(dx) > 90 && Math.abs(dx) > 2 * Math.abs(dy)) { goPage(page + (dx < 0 ? 1 : -1)); return } }
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 8 || performance.now() - downAt[2] > 600) return
  ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ptr, camera)
  if (mode === 'shelf') { const hit = ray.intersectObjects([...proxies.values()])[0]; if (hit) selectEntry(hit.object.userData.id); return }
  if (mode === 'inspect') {
    if (sheetDock && sheetK >= 1 && !caseBusy() && ray.intersectObject(model.sheetG, true).length) { interrupt(); sheetDock = false; relax(); syncInspectUI(); dirty = 3; return } // tap docked sheet → present it again
    const hits = ray.intersectObjects([model.btnHit, ...model.discPick, model.root], true); if (!hits.length) return
    let o = hits[0].object, isHub = false, isDisc = false
    for (let p = o; p; p = p.parent) { if (p === model.hub || p.name === 'hubBtn') isHub = true; if (p === model.disc) isDisc = true }
    if (discFocus) return
    if ((isHub || isDisc) && open > 0.65) pressHub()
    else if (!openT && !outT && !group && (sheetK <= 0 || (sheetDock && sheetK >= 1))) { relax(); openT = 1; syncInspectUI() }
  }
})

// ---------------- main loop ----------------
const clock = new THREE.Clock()
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const step = (v, tg, dt, dur) => (tg > v ? Math.min(tg, v + dt / dur) : Math.max(tg, v - dt / dur))
const _q2 = new THREE.Quaternion(), _rq = new THREE.Quaternion(), _sp = new THREE.Vector3(), _sM = new THREE.Matrix4(), _up = new THREE.Vector3(0, 1, 0), _qY180 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
const _b2 = new THREE.Vector3(), _qs = new THREE.Quaternion(), _qp = new THREE.Quaternion(), _eu = new THREE.Euler(), _Z = new THREE.Vector3(0, 0, 1)
const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _seat = new THREE.Vector3(), _lift = new THREE.Vector3(), qFront = new THREE.Quaternion()
function bez(a, b, c, k, out) { const u = 1 - k; return out.set(0, 0, 0).addScaledVector(a, u * u).addScaledVector(b, 2 * u * k).addScaledVector(c, k * k) }
let simT = 0, forceDt = 0
function tick() {
  const dt = forceDt || Math.min(clock.getDelta(), 0.05); simT += dt; let busy = drive(dt)
  // doors
  if (owns('door')) busy = true
  doors.forEach((p) => (p.rotation.y = p.userData.ci === page ? p.userData.sx * doorOpen * THREE.MathUtils.degToRad(105) : 0))
  streamTick()
  // shelf glides / pops
  for (const m of proxies.values()) {
    if (m.userData.glide) { const g = m.userData.glide; g.t = Math.min(1, g.t + dt / 0.6); const k = ease(g.t); m.position.lerpVectors(g.from, m.userData.home.p, k); _q.setFromEuler(m.userData.home.r); m.quaternion.slerpQuaternions(g.q0, _q, k); if (g.t >= 1) delete m.userData.glide; busy = true }
    if (m.userData.pop != null) { m.userData.pop = Math.min(1, m.userData.pop + dt / 0.55); const k = m.userData.pop; m.scale.setScalar(Math.max(0.001, 1 + Math.sin(k * Math.PI) * 0.06 - (1 - ease(k)) * 1)); if (k >= 1) { m.scale.setScalar(1); delete m.userData.pop } busy = true }
  }
  // fly out / back
  if (mode === 'back' && flight && sel) { // second half of the return: the shelf proxy continues on the same arc
    busy = true; const m = proxies.get(sel.id); flyPose(flight.u, _fp, _fq); m.position.copy(_fp); m.quaternion.copy(_fq)
    shelfShadows(m, sstep(0.86, 1, flight.u))
  } else if (mode === 'fly' && flight) {
    busy = true; const m = proxies.get(sel.id)
    shelfShadows(m, 1 - sstep(0, 0.1, flight.u)) // the contact shadow only exists while the case sits on the shelf
    flyPose(flight.u, m.position, m.quaternion); if (!owns('fly') && !tick._ff) { tick._ff = true; finishFly().finally(() => (tick._ff = false)) }
  }
  // inspect state machine
  if (mode === 'inspect' || mode === 'editor' || mode === 'return') {
    const o0 = open, h0 = hubP, u0 = out
    if (hubT === 1 && hubP > 0.92 && !outT && !releaseArmed) { releaseArmed = true; outT = 1 }
    if (reseating && out < 0.01) { reseating = false; hubT = 0 }
    if (outT === 1 && out > 0.92 && !discFocus) { discFocus = true; syncInspectUI(); goCam(camInspectGoal()) }
    if (sheetK !== tick._sk) { tick._sk = sheetK; busy = true; if (sheetK === 0 || sheetK === 1) syncInspectUI() }
    if (!group && sheetDock && sheetK <= 0 && !sheetT) sheetDock = false
    // cover requested while the case was open / disc out: the case closes (disc reseated) first, then the sheet slides out
    // starts while the lid is still finishing its close (the sleeve-bound sheet follows the hinge), so there is no stop between the two
    if (pendingSheetOut && open < 0.25 && !openT && out < 0.01 && !outT && !hubT && hubP < 0.05) { pendingSheetOut = false; sheetDock = false; sheetT = 1; sFlipT = 0; rot.reset(); syncInspectUI() }
    if (o0 !== open || h0 !== hubP || u0 !== out || discFocus) busy = true
    if ((o0 > 0.4) !== (open > 0.4) && auto && mode !== 'return') goCam(camInspectGoal())
    // ---- item transforms (camera fixed): active object gets the user's rotation / zoom / pan
    if (mode === 'inspect') { if (rot.update(dt)) busy = true } else rot.resetNow()
    const act = discFocus ? 'disc' : sheetK > sheetCasePath().kc && !sheetDock ? 'sheet' : 'case'
    if (act !== rotObj) { captureCarry(); rotObj = act } // the old object's rotation eases out instead of snapping
    rot.quaternion(_rq)
    // the case steps aside while the flat sheet (undocked) or the disc is presented
    // (disc focus: caseAway channel; sheet: keyed to the sheet's own progress so the case only starts to move once the
    // sheet's bottom edge has cleared the case top, and is back home before the sheet re-enters the sleeve)
    const away = awayNow(); if (away > 0) busy = true
    const R = model.root, oe = open
    if ((mode === 'return' || mode === 'back') && flight) { flyPose(flight.u, _fp, _fq); holder.quaternion.copy(_fq); holder.position.copy(_fp).sub(_v.set(0, Hm() / 2, 0).applyQuaternion(_fq)) }
    else { holder.position.copy(INS).sub(_v.set(0, Hm() / 2, 0)); holder.rotation.set(0, 0, 0) }
    const cC = carry.cCase
    R.quaternion.copy(act === 'case' ? _rq : _q.identity()); if (cC.w > 0) R.quaternion.multiply(carrySlerp(cC, _cq3))
    R.position.set(0, Hm() / 2, 0).add(act === 'case' ? rot.offset(INS, _v) : _v.set(0, 0, 0)).addScaledVector(cC.off, cC.w).sub(_v.set(-0.62 * oe, 0, 0).applyQuaternion(R.quaternion)).add(caseOffset(_v))
    if (sheetK > 0) { // flat sheet presented square to the camera, scaled to fit the view
      const cp = inspCam(_cp), P = _sp.copy(INS).lerp(_dockP.copy(INS).add(DOCK_OFF), dockK); if (act === 'sheet') P.add(rot.offset(INS, _v)); P.addScaledVector(carry.cSheet.off, carry.cSheet.w)
      const dist = cp.distanceTo(P), vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * dist, vw = vh * camera.aspect
      const fit = Math.min(1, (0.86 * vw) / model.sheetSize.w, (0.7 * vh) / model.sheetSize.h) * (1 - 0.62 * dockK) // docked: small, upper-left, out of the way
      sheetRest = { P: _sp2.copy(INS).lerp(_dockP, dockK), w: model.sheetSize.w * fit, h: model.sheetSize.h * fit }
      _sM.lookAt(cp, P, _up); _q.setFromRotationMatrix(_sM).multiply(_qY180); if (sFlip > 0) _q.multiply(_q2.setFromAxisAngle(_up, sFlip * Math.PI)); if (act === 'sheet') _q.premultiply(_rq); if (carry.cSheet.w > 0) _q.premultiply(carrySlerp(carry.cSheet, _cq3))
      _sM.compose(P, _q, _v.setScalar(fit)); model.setSheet(sheetK, _sM, sheetAnchor(R), sheetCasePath().kc)
    } else model.setSheet(0)
    holder.updateMatrixWorld(true); model.pose(open, hubP, true)
    { R.getWorldPosition(_cw); if (dt > 0 && tick._cwOk) caseVelW.copy(_cw).sub(_cwPrev).divideScalar(dt); _cwPrev.copy(_cw); tick._cwOk = true }
    holder.updateMatrixWorld(true); model.seatWorld(_seat)
    const e = out, F = _F.copy(INS).lerp(inspCam(_cp), model.kind === 'cart' ? 0.5 : 0.4)
    const isCart = model.kind === 'cart'; model.disc.scale.setScalar(isCart ? 1 + 1.8 * THREE.MathUtils.smoothstep(e, 0.3, 1) : 1)
    if (discFocus) { if (!qs.has('shot') && (isCart || !rot.dragging)) spin += dt * (isCart ? 0.6 : 0.35) }
    if (out < 0.001) { model.disc.position.copy(_seat); R.getWorldQuaternion(model.disc.quaternion); spin = 0 }
    else {
      // one continuous cubic Bézier: straight up / out of the tray, then on to the presentation point (was two eased legs with a stop between)
      _lift.copy(_seat).add(_v.set(0.04, 0.11, 0.4)); _b2.copy(F).add(_v.set(0.03, 0.04, -0.3)); cubic(_seat, _lift, _b2, F, e, model.disc.position)
      R.getWorldQuaternion(_qs); _qp.setFromEuler(_eu.set(isCart ? -0.18 : -0.3, flip * Math.PI + (isCart ? Math.sin(spin) * 0.3 : 0), 0)); if (!isCart) _qp.multiply(_q2.setFromAxisAngle(_Z, spin))
      model.disc.quaternion.slerpQuaternions(_qs, _qp, THREE.MathUtils.smoothstep(e, 0.04, 0.8))
      const cD = carry.cDisc; if (cD.w > 0) { model.disc.quaternion.premultiply(carrySlerp(cD, _cq3)); model.disc.position.addScaledVector(cD.off, cD.w) }
      if (act === 'disc') { model.disc.quaternion.premultiply(_rq); model.disc.position.add(rot.offset(F, _v)) }
    }
    if (mode !== 'back') holder.visible = true // the case is moved aside (caseAway) instead of hidden, so a docked sheet stays visible
    const ui = `${open > 0.65}|${open > 0.5}|${openT}|${outT}|${hubT}|${discFocus}|${sheetDock}|${sheetK > 0}|${rot.idle}|${pendingSheetOut}`; if (ui !== tick._ui) { tick._ui = ui; syncInspectUI() }
    // hand-over to the shelf proxy is decided last so nothing later in this frame can re-show the inspect model (duplicate-case guard)
    if (mode === 'return' && open === 0 && out === 0 && sheetK <= 0 && hubP < 1e-3 && !carry.cCase.w && !carry.cDisc.w && !carry.cSheet.w) swapToProxy()
  }
  // camera
  if (camScripted) {
    camMv.p.step(dt); camMv.t.step(dt); camMv.p.get(camera.position); camMv.t.get(controls.target); busy = true
    if (!camMv.p.active && !camMv.t.active) { camScripted = false; camSod.reset(camera.position, controls.target) }
  } else if (auto && camGoal) { // free camera: critically damped second-order follow (velocity-continuous, no exponential snap)
    const g = mode === 'shelf' ? shelfCamPose(camGoal) : mode === 'inspect' ? inspectFitPose() : camGoal
    if (camSod.follow(dt, g)) busy = true
  }
  if (dt > 0) { camVel.copy(camera.position).sub(_camPrev).divideScalar(dt); tgtVel.copy(controls.target).sub(_tgtPrev).divideScalar(dt) } _camPrev.copy(camera.position); _tgtPrev.copy(controls.target)
  controls.enabled = mode === 'shelf'; rot.enabled = mode === 'inspect'
  if (vignette) { const vt = mode === 'inspect' ? 0.52 : 0.32, u = vignette.uniforms.uAmt; if (Math.abs(u.value - vt) > 0.002) { u.value += (vt - u.value) * (1 - Math.exp(-dt * 5)); busy = true } }
  // scripted / auto camera: OrbitControls must not damp or clamp it — but it was also the only thing aiming the camera, so aim it here
  // (without this the view kept the orientation of the last manual frame and every animated pose rendered off-centre)
  const scriptedCam = camScripted || (auto && camGoal)
  if (scriptedCam) camera.lookAt(controls.target)
  const changed = scriptedCam ? false : controls.update()
  interactionLOD(mode === 'inspect' && (rot.active || busy), dt)
  if (window.__rec) window.__rec.push(window.__sc.probe())
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
let composer = null, gtao = null, bloom = null, vignette = null, pinned = qs.has('tier') || qs.has('shot')
function setupTier() {
  composer?.dispose(); composer = null; gtao?.dispose?.(); gtao = null
  renderer.setPixelRatio(Math.min(devicePixelRatio, tier === 'high' ? 2 : tier === 'mid' ? 1.5 : 1))
  spots[0].castShadow = tier !== 'low'; renderer.shadowMap.needsUpdate = true
  if (tier !== 'low') {
    // EffectComposer bypasses the canvas MSAA → render into a 4× multisampled HDR target (WebGL2) instead
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: renderer.capabilities.isWebGL2 === false ? 0 : 4 })
    composer = new EffectComposer(renderer, rt); composer.addPass(new RenderPass(scene, camera))
    if (tier === 'high') { gtao = new GTAOPass(scene, camera, innerWidth, innerHeight); const ov = gtao._overrideVisibility.bind(gtao); gtao._overrideVisibility = function () { ov(); const c = this._visibilityCache; this.scene.traverse((o) => { if (o.isMesh && o.visible && o.material?.userData?.noAO) { o.visible = false; c.push(o) } }) }; gtao.blendIntensity = 0.6; gtao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.6, thickness: 1, scale: 1 }); composer.addPass(gtao) }
    bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.32, 0.55, 1.6); composer.addPass(bloom)
    vignette = new ShaderPass(VignetteShader); composer.addPass(vignette); composer.addPass(new OutputPass())
    if (tier === 'high') composer.addPass(new SMAAPass()) // after tone mapping: cleans AO / specular edges MSAA can't see
  }
  sizeComposer(); dirty = 3
}
function sizeComposer() { renderer.setSize(innerWidth, innerHeight, false); if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(innerWidth, innerHeight) } }
function draw() { if (composer) composer.render(); else renderer.render(scene, camera); sampleTone() }
// ---- adaptive title chips: read the rendered pixels behind each chip (same frame, before the buffer is presented),
// composite the chip surface over them and pick the tone (dark text on light chip / light text on dark chip) with the
// higher WCAG contrast. Throttled; a trailing sample runs once motion stops.
const TONES = { light: { c: [250, 248, 244], a: 0.78, ink: [31, 42, 40], mut: [70, 82, 79], mix: 0.84 }, dark: { c: [27, 25, 23], a: 0.8, ink: [247, 243, 236], mut: [221, 214, 203], mix: 0.82 } }
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
const relL = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])
const wcag = (a, b) => { const x = relL(a), y = relL(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
let toneAt = 0, toneForce = true, toneTimer = 0, tonePx = null
function sampleTone() {
  const now = performance.now(); if (!toneForce && now - toneAt < 450) { clearTimeout(toneTimer); toneTimer = setTimeout(() => { toneForce = true; dirty = Math.max(dirty, 1) }, 500); return }
  toneAt = now; toneForce = false; const gl = renderer.getContext(), pr = renderer.getPixelRatio(), W = gl.drawingBufferWidth, H = gl.drawingBufferHeight
  const tint = new THREE.Color(PRESETS[env.preset].tint), tc = [tint.r * 255, tint.g * 255, tint.b * 255], out = {}
  for (const el of [$('ihead'), $('brand')]) {
    if (el.id === 'ihead' && mode !== 'inspect') continue
    const r = el.getBoundingClientRect(); if (r.width < 4) continue
    const x = Math.max(0, Math.floor(r.left * pr)), y = Math.max(0, Math.floor(H - r.bottom * pr)), w = Math.min(Math.ceil(r.width * pr), W - x), h = Math.min(Math.ceil(r.height * pr), H - y); if (w < 1 || h < 1) continue
    const n = w * h * 4; if (!tonePx || tonePx.length < n) tonePx = new Uint8Array(n)
    gl.readPixels(x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, tonePx)
    let R = 0, G = 0, B = 0, c = 0, lo = 1, hi = 0; const st = Math.max(1, Math.floor((w * h) / 4000))
    for (let i = 0; i < w * h; i += st) { const o = i * 4, l = relL([tonePx[o], tonePx[o + 1], tonePx[o + 2]]); R += tonePx[o]; G += tonePx[o + 1]; B += tonePx[o + 2]; c++; if (l < lo) lo = l; if (l > hi) hi = l }
    const bg = [R / c, G / c, B / c], res = {}
    for (const [k, T] of Object.entries(TONES)) { const chip = T.c.map((v, i) => v * T.mix + tc[i] * (1 - T.mix)), comp = chip.map((v, i) => v * T.a + bg[i] * (1 - T.a)); res[k] = { title: +wcag(T.ink, comp).toFixed(2), sub: +wcag(T.mut, comp).toFixed(2) } }
    out[el.id] = { bgL: +relL(bg).toFixed(3), ...res }
  }
  // one tone for both chips (consistent look): maximise the worst-case subtitle contrast, with hysteresis
  const ks = Object.keys(out); if (!ks.length) return
  const worst = (k) => Math.min(...ks.map((id) => out[id][k].sub)), cur = $('brand').dataset.tone || 'light', alt = cur === 'light' ? 'dark' : 'light'
  const pick = worst(alt) > worst(cur) * 1.08 ? alt : cur; $('brand').dataset.tone = $('ihead').dataset.tone = pick; out.tone = pick
  window.__tone = out
}
// While the user turns an item (and while it settles): skip GTAO, freeze the shadow map, and if frames are still slow
// drop the composer to 1× resolution. Everything is restored ~0.25 s after the item comes to rest.
let lodOn = false, lodIdle = 0, lodSlow = 0, lodDpr = false
function interactionLOD(active, dt) {
  if (active) {
    lodIdle = 0
    if (!lodOn) { lodOn = true; if (gtao) gtao.enabled = false; renderer.shadowMap.autoUpdate = false }
    if (dt > 0.024) { if (++lodSlow > 20 && !lodDpr && composer && renderer.getPixelRatio() > 1) { lodDpr = true; composer.setPixelRatio(1) } } else lodSlow = Math.max(0, lodSlow - 1)
  } else if (lodOn && (lodIdle += dt) > 0.25) {
    lodOn = false; lodSlow = 0; if (gtao) gtao.enabled = true; renderer.shadowMap.autoUpdate = true; renderer.shadowMap.needsUpdate = true
    if (lodDpr) { lodDpr = false; composer?.setPixelRatio(renderer.getPixelRatio()) }
    dirty = 3
  }
}
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
  if (innerWidth >= 900) camera.setViewOffset(w, h, (w - r.left) / 2, 0, w, h)
  else camera.setViewOffset(w, h, 0, r.height / 2, w, h)
  camera.updateProjectionMatrix()
}
addEventListener('resize', resize)

// ---------------- toolbar ----------------
function closeMenus() { $('menu').classList.add('hidden'); $('imore').classList.add('hidden'); $('fsheet').classList.add('hidden') }
$('mLang').onclick = () => { closeMenus(); $('langBtn').onclick() }
$('langBtn').onclick = () => { lang = lang === 'en' ? 'zh' : 'en'; try { localStorage.setItem('game-catalog-lang', lang) } catch {}; syncLang() }
$('menuBtn').onclick = (e) => { e.stopPropagation(); $('menu').classList.toggle('hidden') }
$('iMore').onclick = (e) => { e.stopPropagation(); $('imore').classList.toggle('hidden') }
// mobile: search / platform / sort live in a sheet above the toolbar (same nodes, moved), desktop: inline in the bar
const narrowMQ = matchMedia('(max-width:600px)')
function placeShelfInline() { const el = $('shelfInline'), host = narrowMQ.matches ? $('fsBody') : $('tbShelf'); if (el.parentNode !== host) { if (host === $('tbShelf')) host.insertBefore(el, $('pager')); else host.appendChild(el) } }
narrowMQ.addEventListener('change', () => { placeShelfInline(); closeMenus() }); placeShelfInline()
$('tFilter').onclick = (e) => { e.stopPropagation(); const h = $('fsheet').classList.contains('hidden'); closeMenus(); $('fsheet').classList.toggle('hidden', !h) }
$('fsheet').addEventListener('click', (e) => e.stopPropagation())
addEventListener('click', (e) => { if (!e.target.closest?.('#fsheet,#tFilter,#imore,#iMore,#menu,#menuBtn,#envp,#envBtn,#tEnv')) { closeMenus(); closeEnv() } })
function syncFilterDot() { $('tFilterDot').classList.toggle('hidden', !(fQuery || fPlat !== 'all' || fSort !== 'custom')) }
function syncViewBtn() { tbSet('tView', { label: t(viewMode === 'spine' ? 'vSpine' : 'vFront'), ic: viewMode === 'spine' ? 'spines' : 'fronts' }) }
function setView(v) {
  viewMode = v; localStorage.setItem('showcase-view', v); syncViewBtn()
  for (const b of $('viewSeg').children) b.setAttribute('aria-pressed', String(b.dataset.v === v))
  syncShelf(true).then(() => { if (mode === 'shelf') goCam(camShelfGoal()) })
}
$('tView').onclick = () => { if (mode === 'shelf') setView(viewMode === 'spine' ? 'front' : 'spine') }
$('tView').classList.remove('hidden')
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
$('iOpen').onclick = () => { interrupt(); if (outT || hubT) return; if (sheetT) sheetDock = true; relax(); openT = openT ? 0 : 1; syncInspectUI() }
$('iDisc').onclick = () => { if (outT || discFocus) reseat(); else { interrupt(); pressHub() } }
$('iFlip').onclick = () => { interrupt(); if (sheetK > 0 && !sheetDock) { sFlipT = sFlipT ? 0 : 1; relax(); dirty = 3 } else flipT = flipT ? 0 : 1 }
function caseBusy() { return !!(openT || open > 0.01 || outT || out > 0.01 || hubT) }
// put the sheet back: it can only slide into a CLOSED case with the disc seated → close / reseat first, then slide in
function putSheetBack() { pendingSheetOut = false; if (caseBusy()) sheetDock = true; choreo('sheet') }
$('iSheet').onclick = () => {
  if (sheetT) putSheetBack()
  else if (!caseBusy()) { interrupt(); sheetT = 1; sheetDock = false; sFlipT = 0; relax(); syncInspectUI(); dirty = 3 }
  else if (!pendingSheetOut) { pendingSheetOut = true; choreo('close') } // was: disabled while open → "can't pull the cover out"
}
$('iReset').onclick = () => { relax(); dirty = 3 }
$('iBack').onclick = () => backToShelf()
/** Styled confirm dialog (replaces window.confirm). Resolves true / false. */
function ask({ h, p, ok, no = t('dCancel'), danger = false, ic = danger ? 'trash' : 'alert' }) {
  const d = $('dlg'), box = d.firstElementChild; $('dlgH').textContent = h; $('dlgP').textContent = p; $('dlgYes').textContent = ok; $('dlgNo').textContent = no
  box.classList.toggle('is-danger', danger); $('dlgYes').classList.toggle('del', danger); const ici = $('dlgIc'); delete ici.dataset.icNow; setIcon(ici, ic)
  d.classList.remove('hidden'); const prev = document.activeElement; setTimeout(() => $('dlgNo').focus(), 30)
  return new Promise((res) => {
    const done = (v) => { d.classList.add('hidden'); d.onclick = $('dlgYes').onclick = $('dlgNo').onclick = null; removeEventListener('keydown', key, true); prev?.focus?.(); res(v) }
    const key = (e) => { if (e.key === 'Escape') { e.stopPropagation(); done(false) } }
    addEventListener('keydown', key, true)
    $('dlgYes').onclick = () => done(true); $('dlgNo').onclick = () => done(false); d.onclick = (e) => { if (e.target === d) done(false) }
  })
}
$('iDel').onclick = async () => {
  closeMenus(); if (!(await ask({ h: t('delH'), p: t('delP').replace('%s', sel.title || t('untitled')), ok: t('delOk'), danger: true }))) return
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
addEventListener('keydown', (e) => { if (mode === 'shelf' && document.activeElement?.tagName !== 'INPUT') { if (e.key === 'ArrowRight') goPage(page + 1); if (e.key === 'ArrowLeft') goPage(page - 1) } if (e.key === 'Escape' && $('dlg').classList.contains('hidden')) { if (mode === 'editor') { if (!$('crop').classList.contains('hidden')) $('cDone').onclick(); else cancelEditor() } else if (mode === 'inspect') { if (discFocus) reseat(); else backToShelf() } } })

// ---------------- editor ----------------
let draftDirty = false, editing = null, draft = null, draftImgs = {}, draftArt = null, cropKey = null, artTimer = 0, prevSel = null, prevMode = null
const SLOT_KEYS = ['front', 'spine', 'back', 'inner', 'disc']
const TPL = () => templatesFor(draft?.platform)
function syncPlat() {
  const p = draft.platform || 'ps5'
  for (const b of $('platSeg').children) b.setAttribute('aria-pressed', String(b.dataset.p === p))
  $('keyWrap').classList.toggle('hidden', p !== 'ns2'); $('fKey').checked = !!draft.keyCard
  $('platNote').textContent = t('pn_' + p)
}
$('platSeg').onclick = (e) => { const p = e.target.dataset?.p; if (!p || !draft || p === draft.platform) return; draftDirty = true; draft.platUser = true; setPlatform(p) }
function setPlatform(p) {
  draft.platform = p; if (p !== 'ns2') draft.keyCard = false
  for (const k of SLOT_KEYS) if (draft.slots[k]?.crop) draft.slots[k].crop = { x: 0, y: 0, s: 1 } // aspect changed → reset framing
  const vis = model.disc.visible; useModel(p); model.disc.visible = vis
  holder.position.copy(INS).sub(new THREE.Vector3(0, Hm() / 2, 0)); open = openT = hubP = hubT = out = outT = 0; discFocus = false; model.pose(0, 0)
  syncPlat(); rebuildDraft(); renderSlots(); $('crop').classList.add('hidden'); if (mode === 'editor') goCam(editorCam())
}
$('fKey').onchange = () => { draft.keyCard = $('fKey').checked; scheduleArt() }
function openEditor(entry) {
  if (mode === 'return' || mode === 'back' || mode === 'fly') return
  group = null; flight = null; for (const c of Object.values(carry)) c.w = 0
  closeMenus(); draftDirty = false; prevMode = mode; prevSel = sel
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
// live preview: fit the case to ~64 % of the visible area (left of the side panel / above the sheet) at a 3/4 angle
function editorCam() {
  inspectPose(); const r = $('editor').getBoundingClientRect(), desk = innerWidth >= 900
  const visH = desk ? innerHeight : Math.max(160, r.top), visW = desk ? innerWidth - (innerWidth - r.left) : innerWidth
  const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2), fH = (visH / innerHeight) * 0.64, fW = (visW / innerWidth) * 0.5
  const dH = Hm() / (2 * tan * fH), dW = 1.35 / (2 * tan * camera.aspect * fW), d = THREE.MathUtils.clamp(Math.max(dH, dW), 2.6, 9)
  const dir = new THREE.Vector3(0.3, 0.08, 1).normalize(); return { p: INS.clone().addScaledVector(dir, d), t: INS.clone() }
}
function rebuildDraft() {
  draft.title = $('fTitle').value.trim(); draft.band = $('fBand').checked
  draftArt = buildArt(draft, draftImgs); model.setArt(draftArt); dirty = 3
}
function scheduleArt() { if (artTimer) return; artTimer = setTimeout(() => { artTimer = 0; rebuildDraft(); renderSlotThumbs() }, mobile ? 90 : 50) }
function renderSlots() {
  const box = $('slots'); box.innerHTML = ''
  for (const k of SLOT_KEYS) {
    const has = !!draft.slots[k]?.blob, web = has && draft.slots[k].auto, el = document.createElement('button'); el.className = 'slot' + (has ? ' up' : '') + (web ? ' web' : '') + (TPL()[k].rect ? ' rect' : ''); el.dataset.k = k
    const lb = TPL()[k].label[lang === 'en' ? 1 : 0]; el.setAttribute('aria-label', lb)
    el.innerHTML = `<div class="th"><span class="up">${svg(has ? 'crop' : 'upload')}</span></div><b>${lb}</b><i>${has ? (web ? t('stWeb') : t('stUp')) : t('stAuto')}</i>`
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
    let c = th.querySelector('canvas'); if (!c) { c = document.createElement('canvas'); th.prepend(c) }
    const s = 160 / Math.max(src.width, src.height); c.width = Math.max(1, Math.round(src.width * s)); c.height = Math.max(1, Math.round(src.height * s)); c.getContext('2d').drawImage(src, 0, 0, c.width, c.height)
  }
}
function pickFile(k) { cropKey = k; $('fileIn').click() }
$('fileIn').onchange = async (e) => {
  const f = e.target.files[0]; e.target.value = ''; if (!f || !cropKey) return
  toast(t('processing')); const blob = await downscale(f, cropKey === 'disc' ? 2048 : 2560)
  draftDirty = true; draft.slots[cropKey] = { blob, crop: { x: 0, y: 0, s: 1 } }; draftImgs[cropKey] = await blobToImage(blob)
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
    b.innerHTML = `<span class="sg-th">${r.cover ? `<img alt="" loading="lazy" referrerpolicy="no-referrer">` : svg(r.platform === 'ps5' ? 'disc' : 'cart')}</span><span class="sg-t"><b></b><i></i></span>`
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
async function cancelEditor() { if (draftDirty && !(await ask({ h: t('discH'), p: t('discP'), ok: t('discOk'), no: t('discNo'), danger: true, ic: 'alert' }))) return; closeEditor(false) }
$('eCancel').onclick = () => cancelEditor(); $('eClose').onclick = () => cancelEditor()
$('ebody').addEventListener('input', () => { draftDirty = true }); $('ebody').addEventListener('change', () => { draftDirty = true })
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
  $('cZoom').value = cropState.s; zoomFill(); $('cRemove').disabled = false
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
function zoomFill() { const z = $('cZoom'); z.style.setProperty('--p', `${((z.value - 1) / 3) * 100}%`) }
function setZoom(s) { cropState.s = THREE.MathUtils.clamp(s, 1, 4); $('cZoom').value = cropState.s; zoomFill(); draftDirty = true; drawCrop(); scheduleArt() }
$('cZoom').oninput = (e) => setZoom(+e.target.value)
$('cReset').onclick = () => { Object.assign(cropState, { x: 0, y: 0, s: 1 }); $('cZoom').value = 1; zoomFill(); drawCrop(); scheduleArt() }
$('cReplace').onclick = () => pickFile(cropKey)
$('cRemove').onclick = async () => { if (!(await ask({ h: t('rmH'), p: t('rmP'), ok: t('rmOk'), danger: true }))) return; draftDirty = true; delete draft.slots[cropKey]; draftImgs[cropKey] = null; $('crop').classList.add('hidden'); rebuildDraft(); renderSlots() }
$('cBack').onclick = () => $('cDone').onclick()
$('cZoomIn').onclick = () => setZoom(cropState.s * 1.15); $('cZoomOut').onclick = () => setZoom(cropState.s / 1.15)
$('cDone').onclick = () => { $('crop').classList.add('hidden'); rebuildDraft(); renderSlots() }
addEventListener('resize', () => { if (!$('crop').classList.contains('hidden')) drawCrop() })

$('pgPrev').onclick = () => goPage(page - 1); $('pgNext').onclick = () => goPage(page + 1); $('pgJump').onchange = (e) => goPage(+e.target.value)
let qTimer = 0
$('q').oninput = () => { clearTimeout(qTimer); qTimer = setTimeout(() => { fQuery = $('q').value; page = 0; syncFilterDot(); syncShelf(true).then(() => goPage(0)) }, 250) }
$('pf').onclick = (e) => { const v = e.target.dataset?.p; if (!v) return; fPlat = v; syncFilterDot(); for (const b of $('pf').children) b.setAttribute('aria-pressed', String(b.dataset.p === v)); page = 0; syncShelf(true).then(() => goPage(0)) }
$('sort').value = fSort; $('sort').onchange = (e) => { fSort = e.target.value; syncFilterDot(); localStorage.setItem('showcase-sort', fSort); syncShelf(true) }
// ---------------- environment & lighting presets ----------------
// Each preset sets the room (wall / floor / backdrop), HDRI + exposure, track-spot colour temperature / power and the
// concealed shelf lights. The static cabinet follows through the split lightmaps (spot / shelf / world groups mixed in
// the shader, see bakedCabinet.js LMU); dynamic objects through the matching realtime lights. Sliders are multipliers on
// the preset (exposure, colour temperature: absolute). Persisted in localStorage.
const HDRI = { gallery: 'gallery', studio: 'studio', loft: 'loft' }
const PRESETS = {
  gallery: { ui: 'dark', tint: '#d79f5c', sw: ['#2c2620', '#d79f5c'], hdri: 'gallery', env: 0.4, exposure: 1, ambient: 1, spot: 0.9, shelf: 0.85, temp: 2900, shelfTemp: 3000, wall: '#6d655c', floor: ['#9a938b', 0.42, 0.7], back: '#1b1916' },
  museum: { ui: 'light', tint: '#dfe6ec', sw: ['#9ea3a6', '#f1f4f6'], hdri: 'gallery', env: 0.6, exposure: 1.05, ambient: 3, spot: 1.1, shelf: 0.8, temp: 4000, shelfTemp: 3500, wall: '#a9acab', floor: ['#c2bfb8', 0.5, 0.45], back: '#2b2d2e' },
  night: { ui: 'dark', tint: '#b8732f', sw: ['#0c0b0a', '#b8732f'], hdri: 'gallery', env: 0.1, exposure: 1, ambient: 0.2, spot: 0.08, shelf: 1.25, temp: 2700, shelfTemp: 2700, wall: '#4b443d', floor: ['#5a534c', 0.22, 0.9], back: '#0a0908' },
  daylight: { ui: 'light', tint: '#efe4cf', sw: ['#e8e2d6', '#a9c8e4'], hdri: 'loft', env: 1, exposure: 1, ambient: 16, spot: 0.3, shelf: 0.45, temp: 5600, shelfTemp: 4200, wall: '#c9c2b6', floor: ['#bdb4a6', 0.5, 0.35], back: '#5e5b56' },
  studio: { ui: 'light', tint: '#cfcfcf', sw: ['#5c5c5c', '#c4c4c4'], hdri: 'studio', env: 0.85, exposure: 1, ambient: 6, spot: 0.7, shelf: 0.6, temp: 4600, shelfTemp: 3700, wall: '#7b7b7b', floor: ['#7b7b7b', 0.85, 0], back: '#474747', flat: true },
}
const SLIDERS = [['exposure', 0.4, 2, 0.01, (v) => v.toFixed(2)], ['ambient', 0, 3, 0.01], ['spot', 0, 3, 0.01], ['shelf', 0, 3, 0.01], ['temp', 2200, 6500, 50, (v) => `${v} K`], ['bg', 0.2, 2.5, 0.01]]
const envDefaults = (k) => ({ preset: k, exposure: PRESETS[k].exposure, ambient: 1, spot: 1, shelf: 1, temp: PRESETS[k].temp, bg: 1 })
let env = (() => { try { const v = JSON.parse(localStorage.getItem('showcase-env')); if (v && PRESETS[v.preset]) return { ...envDefaults(v.preset), ...v } } catch {} return envDefaults('gallery') })()
if (PRESETS[qs.get('preset')]) env = envDefaults(qs.get('preset'))
// colour temperature → linear RGB (Tanner Helland fit, sRGB-encoded → linear), normalised to unit luminance
function kelvin(K) {
  const t = K / 100; let r, g, b
  r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592)
  g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492)
  b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307
  const c = new THREE.Color().setRGB(...[r, g, b].map((x) => THREE.MathUtils.clamp(x, 0, 255) / 255), THREE.SRGBColorSpace)
  const l = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b; return c.multiplyScalar(1 / l)
}
const K_SPOT = kelvin(2900), K_SHELF = kelvin(3000) // what the bake was lit with
const tintVs = (K, ref) => { const k = kelvin(K); return [k.r / ref.r, k.g / ref.g, k.b / ref.b] }
const lightCol = (K) => { const k = kelvin(K); return k.multiplyScalar(1 / Math.max(k.r, k.g, k.b)) }
function wallTexFor(hex, flat) {
  const c = canvas(16, 512), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 512), b = new THREE.Color(hex), st = (k) => '#' + b.clone().multiplyScalar(k).getHexString()
  if (flat) { gr.addColorStop(0, st(0.78)); gr.addColorStop(0.55, st(1)); gr.addColorStop(1, st(1.02)) } // seamless studio sweep
  else { gr.addColorStop(0, st(0.4)); gr.addColorStop(0.4, st(1)); gr.addColorStop(0.8, st(1.15)); gr.addColorStop(0.97, st(1.02)); gr.addColorStop(1, st(0.53)) }
  g.fillStyle = gr; g.fillRect(0, 0, 16, 512); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx
}
const hdrCache = {}
function loadHdri(k) {
  if (hdrCache[k]) return hdrCache[k]
  const f = k === 'gallery' ? (mobile ? 'cab/gallery_512.hdr' : 'cab/gallery_1k.hdr') : `cab/${k}_${mobile ? '512' : '1k'}.hdr`
  return (hdrCache[k] = new HDRLoader().loadAsync(BASE + f).then((t) => { t.mapping = THREE.EquirectangularReflectionMapping; const e = pmrem.fromEquirectangular(t).texture; t.dispose(); return e }).catch(() => null))
}
let envRoom = null, envSeq = 0
function applyEnv(persist = true) {
  const P = PRESETS[env.preset], amb = P.ambient * env.ambient, sp = P.spot * env.spot, sh = P.shelf * env.shelf, bg = env.bg
  const tS = env.temp, tF = env.temp + (P.shelfTemp - P.temp)
  renderer.toneMappingExposure = env.exposure
  document.body.dataset.ui = P.ui; document.documentElement.style.setProperty('--chip-tint', P.tint); toneForce = true
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', P.ui === 'dark' ? '#1b1916' : '#f3f1ec')
  BAKED?.setMix?.([tintVs(tS, K_SPOT).map((v) => v * sp), tintVs(tF, K_SHELF).map((v) => v * sh), [amb, amb, amb]])
  const base = BAKED ? [70, 70, 39, 120, 120] : [150, 150, 0, 120, 120], cS = lightCol(tS), cF = lightCol(tF)
  spots.forEach((l, i) => { l.intensity = base[i] * sp; l.color.copy(cS) })
  leds.forEach((ra) => { aimLed(ra, FL_W * (BAKED ? FL_CASE : FL_PROC) * sh); ra.color.copy(cF) })
  hemi.intensity = 0.12 * Math.pow(amb, 0.6); key.intensity = 0.32 * Math.sqrt(Math.max(sp, amb / 16)); key.color.copy(cS)
  if (envRoom !== P.wall + P.flat) { envRoom = P.wall + P.flat; wall.material.map?.dispose(); wall.material.map = wallTexFor(P.wall, P.flat); wall.material.needsUpdate = true }
  wall.material.color.setScalar(bg); floorMat.color.set(P.floor[0]).multiplyScalar(bg); floorMat.roughness = P.floor[1]; floorMat.clearcoat = P.floor[2]
  scene.background.set(P.back).multiplyScalar(Math.min(bg, 2)); skirting.material.color.set(P.flat ? P.wall : 0x2c2825).multiplyScalar(P.flat ? bg * 0.9 : 1)
  const seq = ++envSeq; loadHdri(HDRI[P.hdri] || 'gallery').then((e) => { if (seq !== envSeq || !e) return; scene.environment = e; scene.environmentIntensity = P.env * Math.sqrt(Math.max(env.ambient, 0.05)) * (+(qs.get('env') || 1)); dirty = 3 })
  if (persist) try { localStorage.setItem('showcase-env', JSON.stringify(env)) } catch {}
  renderer.shadowMap.needsUpdate = true; if (typeof scheduleProbes === 'function' && BAKED) scheduleProbes(); dirty = 3
}
function renderEnvUI() {
  const pr = $('presets'); if (!pr) return
  if (!pr.children.length) for (const k of Object.keys(PRESETS)) { const b = document.createElement('button'); b.className = 'pr'; b.dataset.k = k; b.innerHTML = `<i style="background:linear-gradient(150deg,${PRESETS[k].sw[1]} 0%,${PRESETS[k].sw[1]} 22%,${PRESETS[k].sw[0]} 78%)"></i><span></span>`; b.onclick = () => { env = envDefaults(k); applyEnv(); renderEnvUI() }; pr.appendChild(b) }
  for (const b of pr.children) { b.setAttribute('aria-pressed', String(b.dataset.k === env.preset)); b.querySelector('span').textContent = t('p_' + b.dataset.k) }
  const box = $('sliders')
  if (!box.children.length) for (const [k, mn, mx, st] of SLIDERS) { const d = document.createElement('div'); d.className = 'sl' + (k === 'temp' ? ' temp' : ''); d.innerHTML = `<label for="sl_${k}"></label><output></output><input type="range" id="sl_${k}" min="${mn}" max="${mx}" step="${st}">`; d.querySelector('input').oninput = (e) => { env[k] = +e.target.value; applyEnv(); renderEnvUI() }; box.appendChild(d) }
  SLIDERS.forEach(([k, , , , fmt], i) => { const d = box.children[i], v = env[k]; d.querySelector('label').textContent = t('s_' + k); d.querySelector('output').textContent = fmt ? fmt(v) : `${Math.round(v * 100)}%`; const inp = d.querySelector('input'); if (+inp.value !== v) inp.value = v; inp.style.setProperty('--p', `${((v - inp.min) / (inp.max - inp.min)) * 100}%`) })
}
function closeEnv() { $('envp').classList.add('hidden'); document.body.classList.remove('env-open'); $('envBtn').setAttribute('aria-pressed', 'false') }
$('envBtn').onclick = (e) => { e.stopPropagation(); const h = $('envp').classList.contains('hidden'); closeMenus(); if (h) { renderEnvUI(); $('envp').classList.remove('hidden'); document.body.classList.add('env-open'); $('envBtn').setAttribute('aria-pressed', 'true') } else closeEnv() }
$('envClose').onclick = () => closeEnv()
$('tEnv').onclick = (e) => $('envBtn').onclick(e)
$('envReset').onclick = () => { env = envDefaults(env.preset); applyEnv(); renderEnvUI() }
$('envp').addEventListener('click', (e) => e.stopPropagation())
applyEnv(false)
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
  await bakedReady
  await syncShelf(false)
  const g = camShelfGoal(); camera.position.copy(g.p).add(new THREE.Vector3(0.8, 0.6, 2.2)); controls.target.copy(g.t); goCam(g)
  controls.minDistance = 1.2; controls.maxDistance = 22
  resize(); dirty = 5
  setTimeout(() => $('loading').classList.add('fade'), 250)
  setMode('shelf')
  window.__sc = { stepFrame: (d = 1 / 30) => { renderer.setAnimationLoop(null); forceDt = d; tick(); forceDt = 0; return mode }, resume: () => { clock.getDelta(); renderer.setAnimationLoop(tick) }, cg: () => ({ goal: camShelfGoal().p.toArray(), cam: camera.position.toArray(), tgt: controls.target.toArray(), gt: camShelfGoal().t.toArray(), to: camTo && camTo.p.toArray() }), probe: () => { const p = sel && proxies.get(sel.id), c = new THREE.Vector3(), q = new THREE.Quaternion(); if (holder.visible) { model.root.getWorldPosition(c); model.root.getWorldQuaternion(q) } else if (p) { c.copy(p.position); q.copy(p.quaternion) } const d = model.disc.getWorldPosition(new THREE.Vector3()); return { t: +simT.toFixed(4), mode, hv: holder.visible, pv: p ? p.visible : null, c: c.toArray(), q: q.toArray(), d: d.toArray(), cam: camera.position.toArray(), tg: controls.target.toArray(), ps: p ? p.scale.x : null, dec: p ? p.userData.decal.visible : null, ao: gtao ? gtao.enabled : null, sau: renderer.shadowMap.autoUpdate, lod: lodOn, lodDpr, tier, open, out, sk: sheetK, door: doorOpen, hub: hubP } }, vis: () => { const p = sel && proxies.get(sel.id); let shelf = 0; for (const m of proxies.values()) if (m.visible) shelf++; return { holder: holder.visible && model.root.visible, disc: model.disc.visible, selProxy: p ? p.visible : null, shelf, mode, mem: { ...renderer.info.memory }, kids: model.root.children.length, sheetKids: model.sheetG.children.length, sheetParent: model.sheetG.parent === model.root, dock: sheetDock, open: +open.toFixed(2), out: +out.toFixed(2), discFocus } }, back: () => backToShelf(), click: (id) => $(id).click(), cam: () => camera.position.toArray().map((v) => +v.toFixed(4)), sheet: (v) => { if (v != null) $('iSheet').click(); return +sheetK.toFixed(2) }, rot: (y, p) => { if (y != null) { rot.set(y, p || 0); dirty = 3 } return { yaw: +rot.yaw.toFixed(2), pitch: +rot.pitch.toFixed(2), obj: rotObj, zoom: +rot.zoom.toFixed(2) } }, tier: (t) => { if (t) { tier = t; pinned = true; setupTier() } return tier + ' ' + gpuName }, bulk: async (n) => { const P = ['ps5', 'ns', 'ns2']; for (let i = 0; i < n; i++) entries.push({ id: 'bulk' + i, title: `Test Game ${String(i + 1).padStart(3, '0')}`, platform: P[i % 3], order: entries.length, createdAt: Date.now() - i * 1e6, slots: {} }); await syncShelf(false); goCam(camShelfGoal()); return nCab }, page: () => [page, nCab], goPage: (p) => goPage(p), fps: () => renderer.info.render.calls, entries: () => entries.map((e) => e.title), info: () => entries.map((e) => ({ t: e.title, p: e.platform, front: !!e.slots?.front?.blob, auto: !!e.slots?.front?.auto, band: e.band, src: e.lookup?.src })), sugg: () => lkResults.map((r) => r.src + ':' + r.title + ':' + r.platform), plats: () => entries.map((e) => e.platform), kind: () => model.kind, glb: () => model.glbParts,
    // debug: visible meshes (outside the disc group) whose world bounds come within r of the presented disc
    near: (r = 0.9) => { const c = model.disc.getWorldPosition(new THREE.Vector3()), out = [], bs = new THREE.Sphere(); scene.traverseVisible((o) => { if (!o.isMesh) return; for (let p = o; p; p = p.parent) if (p === model.disc) return; if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); bs.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld); const d = bs.center.distanceTo(c) - bs.radius; if (d < r) { let path = o.name || o.type; for (let p = o.parent; p && p !== scene; p = p.parent) path = (p.name || 'g') + '/' + path; out.push([+d.toFixed(2), path, o.material?.name || o.material?.type]) } }); return out.sort((a, b) => a[0] - b[0]).slice(0, 30) }, door: (v) => { doorTarget = v; dirty = 3 }, env: (p) => { if (p && PRESETS[p]) { env = envDefaults(p); applyEnv(false); renderEnvUI() } return { ...env, split: !!BAKED?.split } }, editor: () => draft, mode: () => mode, state: () => ({ open: +open.toFixed(2), out: +out.toFixed(2), discFocus }), select: (i) => selectEntry(entries[i].id), screen: (i) => { const v = proxies.get(entries[i].id).position.clone().project(camera); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight] } }
  // debug: sheet ⟂ shell intersection test. Sheet print faces are sampled on a grid; every grid edge is ray-cast against the
  // shell meshes (crossing = the paper passes through plastic), and every sample casts along ±normal: if the first plastic
  // face it meets is a back face, the sample sits INSIDE the plastic wall.
  const _dbl = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), _rc = new THREE.Raycaster()
  // screen-space centring probe: NDC x/y of the projected bbox centre of the visible cabinet and of the focused item (−1..1, 0 = viewport centre)
  window.__sc.center = () => {
    camera.updateMatrixWorld(); const pr = (b) => { if (b.isEmpty()) return null; let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (let i = 0; i < 8; i++) { const v = new THREE.Vector3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).project(camera); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y) } return { cx: +((x0 + x1) / 2).toFixed(4), cy: +((y0 + y1) / 2).toFixed(4), w: +(x1 - x0).toFixed(3), e: [x0, x1, y0, y1].map((v) => +v.toFixed(3)) } }
    const c = cabinetCenter(), cab = new THREE.Box3(new THREE.Vector3(c.x - CW / 2 - FT, 0, -CD / 2), new THREE.Vector3(c.x + CW / 2 + FT, PLINTH + NSH * SP + FT, CD / 2))
    const f = new THREE.Box3(); const p = sel && proxies.get(sel.id)
    const what = !holder.visible ? 'proxy' : sheetK > 0.5 ? 'sheet' : out > 0.5 || discFocus ? 'disc' : 'case'
    if (holder.visible) { f.expandByObject(what === 'sheet' ? model.sheetG : what === 'disc' ? model.disc : model.root, true) } else if (p && p.visible && mode !== 'shelf') f.expandByObject(p, true)
    const fc = holder.visible ? model.root.getWorldPosition(new THREE.Vector3()).project(camera) : null
    const vo = camera.view && camera.view.enabled ? [camera.view.offsetX, camera.view.offsetY] : null, r = renderer.domElement.getBoundingClientRect()
    return { mode, what, vis: mode === 'inspect' ? visibleNdc().map((v) => +v.toFixed(3)) : null, cam3: camera.position.distanceTo(controls.target).toFixed(2), cab: pr(cab), foc: pr(f), focPivot: fc && [+fc.x.toFixed(4), +fc.y.toFixed(4)], vo, canvas: [r.left, r.width, innerWidth, renderer.domElement.width], par: par.toArray(), cam: camera.position.toArray().map((v) => +v.toFixed(3)), tg: controls.target.toArray().map((v) => +v.toFixed(3)) }
  }
  window.__sc.dims = () => { model.root.updateMatrixWorld(true); const inv = model.root.matrixWorld.clone().invert(), out = {}; model.root.traverse((o) => { if (o.isMesh && o.material === model.shellMat && o.visible) { const b = new THREE.Box3().setFromObject(o, true).applyMatrix4(inv); out[o.name || o.geometry.type + o.id] = [b.min.toArray().map((v) => +v.toFixed(4)), b.max.toArray().map((v) => +v.toFixed(4))] } }); return { W: model.W, H: model.H, D: model.D, HALF: model.HALF, out } }
  window.__sc.clip = (rows = 9) => {
    scene.updateMatrixWorld(true)
    const shells = []; model.root.traverse((o) => { if (o.isMesh && o.material === model.shellMat && o.visible) { let v = true; for (let p = o; p; p = p.parent) if (!p.visible) v = false; if (v) { const m = new THREE.Mesh(o.geometry, _dbl); m.matrixWorld.copy(o.matrixWorld); m.matrixAutoUpdate = false; shells.push(m) } } })
    let cross = 0, inside = 0, n = 0, minClear = 1e9; const hits = []
    for (const sm of model.sheetMeshes) {
      const pos = sm.geometry.attributes.position, nor = sm.geometry.attributes.normal, cols = pos.count / 2, G = []
      for (let i = 0; i < cols; i++) { const a = new THREE.Vector3().fromBufferAttribute(pos, i * 2).applyMatrix4(sm.matrixWorld), b = new THREE.Vector3().fromBufferAttribute(pos, i * 2 + 1).applyMatrix4(sm.matrixWorld), nn = new THREE.Vector3().fromBufferAttribute(nor, i * 2).transformDirection(sm.matrixWorld); G.push([]); for (let r = 0; r < rows; r++) G[i].push([a.clone().lerp(b, r / (rows - 1)), nn]) }
      const seg = (p, q) => { const d = q.clone().sub(p), L = d.length(); if (L < 1e-6) return; _rc.set(p, d.divideScalar(L)); _rc.far = L; for (const m of shells) { const h = _rc.intersectObject(m, false); if (h.length) { cross++; if (hits.length < 6) hits.push([m.geometry.type, h[0].point.toArray().map((v) => +v.toFixed(3))]); return } } }
      for (let i = 0; i < cols; i++) for (let r = 0; r < rows; r++) {
        const [p, nn] = G[i][r]; n++
        if (r + 1 < rows) seg(p, G[i][r + 1][0]); if (i + 1 < cols) seg(p, G[i + 1][r][0])
        for (const sg of [1, -1]) { const d = nn.clone().multiplyScalar(sg); _rc.set(p, d); _rc.far = 0.4; let best = null; for (const m of shells) { const h = _rc.intersectObject(m, false)[0]; if (h && (!best || h.distance < best.distance)) { best = h; best.m = m } } if (best) { minClear = Math.min(minClear, best.distance); const fn = best.face.normal.clone().transformDirection(best.m.matrixWorld); if (fn.dot(d) > 0) { inside++; if (hits.length < 6) hits.push(['in', p.toArray().map((v) => +v.toFixed(3)), +best.distance.toFixed(4)]) } } }
      }
    }
    const bb = new THREE.Box3(); for (const sm of model.sheetMeshes) bb.expandByObject(sm, true); const cb = new THREE.Box3(); for (const m of shells) cb.expandByObject(m, true)
    return { k: +sheetK.toFixed(4), away: +awayNow().toFixed(3), uc: +model.sheetClear().toFixed(3), sb: bb.min.toArray().concat(bb.max.toArray()).map((v) => +v.toFixed(3)), cb: cb.min.toArray().concat(cb.max.toArray()).map((v) => +v.toFixed(3)), n, cross, inside, minClear: +minClear.toFixed(4), shells: shells.length, hits }
  }
  if (qs.has('inspect')) setTimeout(() => selectEntry(entries[Math.min(+qs.get('inspect') || 0, entries.length - 1)].id), 300)
}
// ---------------- baked assets (GLB + lightmaps), procedural fallback ----------------
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))])
const bakedReady = qs.has('procedural') ? Promise.resolve() : Promise.allSettled([
  withTimeout(loadBakedCabinet({ renderer, base: BASE, mobile, lmGain: +(qs.get('lm') || 1), mats: { doorGlass, streakMat, glassMat, glassEdge, glassLine, doorEdge, brass } }), 20000)
    .then((b) => { BAKED = b; useBakedLights(); applyEnv(false); if (nCab) buildCabinets(nCab, true); console.info('[showcase] baked cabinet ready') })
    .catch((err) => console.warn('[showcase] baked cabinet failed, using procedural', err)),
  withTimeout(loadCaseParts(BASE), 20000).then(() => { for (const k of Object.keys(models)) { models[k].dispose(); delete models[k] } useModel(sel?.platform || 'ps5') })
    .catch((err) => console.warn('[showcase] case GLB failed, using procedural case', err)),
])
// light probe grid: captures the baked cabinet's light so dynamic cases on its shelves pick up the same bounce/tint
let probes = null, probeTimer = 0
function scheduleProbes() { clearTimeout(probeTimer); probeTimer = setTimeout(bakeProbes, 400) }
function bakeProbes() {
  if (!BAKED || mobile || tier === 'low' || qs.has('noprobe')) return
  const inH = NSH * SP
  if (!probes) { probes = new LightProbeGridWebGL(CW, inH, CD, 6, 6, 3); scene.add(probes) }
  probes.position.set(page * CAB_PITCH, PLINTH + inH / 2, -0.05)
  const hid = []; for (const o of [...proxies.values(), holder, model.disc]) if (o.visible) { o.visible = false; hid.push(o) }
  const t0 = performance.now(); probes.bake(renderer, scene, { cubemapSize: 16, near: 0.02, far: 40 }); hid.forEach((o) => (o.visible = true))
  console.info('[showcase] probe grid baked', Math.round(performance.now() - t0), 'ms'); dirty = 3
}
boot().then(scheduleProbes)
