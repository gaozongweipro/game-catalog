// Reusable PS5 keep-case + disc model (living hinge, one-piece wrap under film, push-hub release).
import * as THREE from 'three'
export const PX = 800, BANNER = 118
export const W = 1.35, H = 1.70, D = 0.135
export const FRONT_W = 1.29 * PX, FRONT_H = 1.62 * PX, SPINE_W = Math.round((D - 0.004) * PX)
// Per-platform keep-case specs (1 unit = 100 mm).
// PS5: Blu-ray Elite ≈ 135 × 171.5 × 13.5 mm, translucent cobalt.
// NS / NS2: Walvis 900724 / 900724R ≈ 105 × 170 × 11 mm, insert height 162 mm; NS clear PP, NS2 translucent red PP.
// Game card: 21 × 31 × 3.3 mm (NS dark grey, NS2 red with rear notch, Wikipedia "Nintendo Switch 2 game card").
export const PLATFORMS = {
  ps5: { W: 1.35, H: 1.70, D: 0.135, insW: 1.29, insH: 1.62, kind: 'disc' },
  ns: { W: 1.05, H: 1.70, D: 0.11, insW: 1.0, insH: 1.62, kind: 'cart' },
  ns2: { W: 1.05, H: 1.70, D: 0.11, insW: 1.0, insH: 1.62, kind: 'cart' },
}
export const CART = { w: 0.21, h: 0.31, t: 0.033, labW: 0.184, labH: 0.232 }
export function platformSpec(p) { return PLATFORMS[p] || PLATFORMS.ps5 }
function ctx(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')] }
/** Build one complete case + disc. `scene` receives root (case) and disc (world-space). */
export function createCaseModel({ renderer, scene, mobile = false, maxAniso = 8, platform = 'ps5' }) {
const SPEC = platformSpec(platform), NSW = SPEC.kind === 'cart', IS2 = platform === 'ns2'
const W = SPEC.W, H = SPEC.H, D = SPEC.D, FRONT_H = SPEC.insH * PX
  function tex(c) { const t = (c instanceof HTMLCanvasElement) ? new THREE.CanvasTexture(c) : new THREE.Texture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(maxAniso, renderer.capabilities.getMaxAnisotropy()); t.needsUpdate = true; return t }
// Real Blu-ray / PS5 keep case ≈ 135 × 171.5 × 13–14 mm. 1 unit = 100 mm.
const T = NSW ? 0.010 : 0.011, RC = NSW ? 0.034 : 0.038
const INS_W = SPEC.insW, INS_H = SPEC.insH
const HALF = D / 2

const LITE = mobile
// Translucent blue PP (n≈1.49). Desktop: real transmission; mobile: tuned alpha blend (cheaper, still see-through).
const shellMat = true // v7: alpha-blended tint everywhere — transmission blurred the print seen through the shell
  ? new THREE.MeshPhysicalMaterial({ color: 0x0028c4, roughness: 0.06, metalness: 0, transparent: true, opacity: 0.5, ior: 1.49,
      clearcoat: 0.4, clearcoatRoughness: 0.1, specularIntensity: 0.5, side: THREE.FrontSide, depthWrite: false })
  : new THREE.MeshPhysicalMaterial({ color: 0x5f8cff, roughness: 0.015, metalness: 0, transmission: 1, thickness: 0.011, ior: 1.49,
      attenuationColor: new THREE.Color(0x0a32c8), attenuationDistance: 0.16, clearcoat: 0.5, clearcoatRoughness: 0.12,
      specularIntensity: 1, side: THREE.DoubleSide })
if (NSW) { // NS: water-clear PP; NS2: translucent red PP ("slightly clear")
  shellMat.color.set(IS2 ? 0xd0101e : 0xf2f5f8); shellMat.opacity = IS2 ? 0.58 : 0.2
  shellMat.clearcoat = 0.6; shellMat.specularIntensity = 0.8
}
const trayMat = shellMat.clone()
trayMat.roughness = 0.03
trayMat.opacity = NSW ? (IS2 ? 0.5 : 0.18) : 0.42
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
  if (NSW) { // Switch cases: plain opening edge, no finger scoop
    const ow = mesh(new THREE.BoxGeometry(wall, h - wall, depth), shellMat, group); ow.position.set(w / 2 - wall / 2, 0, depth / 2); ow.name = 'notchWall'
    for (const sy of [-1, 1]) { const c = mesh(new THREE.CylinderGeometry(wall / 2, wall / 2, depth, 16), shellMat, group, false); c.rotation.x = Math.PI / 2; c.position.set(w / 2 - wall / 2, sy * (h / 2 - wall / 2), depth / 2) }
    return group
  }
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
const DISC_Y = NSW ? -0.5 : 0.08, DISC_X = NSW ? 0.1 : 0.03
const tray = new THREE.Group(); tray.position.set(0, 0, TRAY_Z); base.add(tray)
const hub = new THREE.Group(), teeth = [], btn = new THREE.Group(); let btnHit
if (!NSW) {
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
hub.position.set(DISC_X, DISC_Y, 0); tray.add(hub)
function lathe(pts, seg = 64) {
  const g = new THREE.LatheGeometry(pts.map(([r, z]) => new THREE.Vector2(r, z)), seg); g.rotateX(Math.PI / 2); return g
}
mesh(lathe([[0.135, 0], [0.205, 0], [0.205, 0.003], [0.19, 0.0055], [0.15, 0.0055], [0.135, 0.004]]), trayMat, hub) // disc support land
mesh(lathe([[0.086, 0], [0.104, 0], [0.104, 0.010], [0.099, 0.0125], [0.088, 0.0125]]), trayMat, hub)              // collar
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
hub.add(btn); btn.position.z = 0.012; btn.name = 'hubBtn'
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
btnHit = mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 24), new THREE.MeshBasicMaterial({ visible: false }), hub)
btnHit.rotation.x = Math.PI / 2; btnHit.position.z = 0.012; btnHit.name = 'hubBtn'
} else {
  // ---- Switch game-card holder (Walvis 900724/R photos): moulded pocket in the lower tray half, slightly right
  // of centre; card stands upright. Side spring clips + fixed bottom lip; a top latch tab you push to pop the card.
  hub.position.set(DISC_X, DISC_Y, 0); tray.add(hub)
  const cw = CART.w + 0.012, ch = CART.h + 0.012, fw = 0.016, fd = 0.02
  mesh(ring(cw + 2 * fw, ch + 2 * fw, 0.02, fw, fd), trayMat, hub)                        // pocket frame
  mesh(plate(cw, ch, 0.012, 0.003, 0.001), trayMat, hub, false)                          // recessed floor
  for (const sx of [-1, 1]) { // side spring clips with inward lips
    const c = mesh(new THREE.BoxGeometry(0.008, 0.07, fd + 0.012), trayMat, hub, false); c.position.set(sx * (cw / 2 + 0.002), 0.04, (fd + 0.012) / 2)
    const l = mesh(new THREE.BoxGeometry(0.012, 0.06, 0.004), trayMat, hub, false); l.position.set(sx * (cw / 2 - 0.004), 0.04, fd + 0.01)
    const sl = mesh(new THREE.BoxGeometry(0.003, 0.11, fd * 0.8), trayMat, hub, false); sl.position.set(sx * (cw / 2 + fw + 0.004), 0.04, fd * 0.4) // flex slot
  }
  const bl = mesh(new THREE.BoxGeometry(0.09, 0.012, 0.004), trayMat, hub, false); bl.position.set(0, -ch / 2 + 0.004, fd + 0.01)
  mesh(new THREE.BoxGeometry(0.09, 0.008, fd + 0.012), trayMat, hub, false).position.set(0, -ch / 2 - 0.002, (fd + 0.012) / 2)
  // top latch: square finger notch in the frame with a flexible tab + lip
  hub.add(btn); btn.position.set(0, ch / 2 + 0.002, 0)
  mesh(new THREE.BoxGeometry(0.06, 0.03, 0.006), trayMat, btn).position.set(0, 0.008, fd + 0.004)
  mesh(new THREE.BoxGeometry(0.05, 0.012, 0.005), trayMat, btn, false).position.set(0, -0.006, fd + 0.012)
  mesh(new THREE.BoxGeometry(0.008, 0.008, fd), trayMat, btn, false).position.set(0, 0.02, fd / 2)
  btnHit = mesh(new THREE.BoxGeometry(cw, ch + 0.06, 0.05), new THREE.MeshBasicMaterial({ visible: false }), hub)
  btnHit.position.z = 0.02; btnHit.name = 'hubBtn'
  // tray-half corner gussets
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    const cx = sx * (W / 2 - T - 0.025), cy = sy * (H / 2 - T - 0.025)
    mesh(new THREE.BoxGeometry(0.05, 0.01, 0.01), trayMat, tray, false).position.set(cx, cy + sy * 0.01, 0.005)
    mesh(new THREE.BoxGeometry(0.01, 0.05, 0.01), trayMat, tray, false).position.set(cx + sx * 0.01, cy, 0.005)
  }
}

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
grooveMat.color.set(NSW ? (IS2 ? 0x600008 : 0x8a95a5) : 0x001a66)
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
for (const [y, h] of (NSW ? [[0.45, 0.06], [-0.45, 0.06]] : [[-0.3, 0.07], [-0.47, 0.05], [-0.62, 0.08], [0.58, 0.07]])) {
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
if (!NSW) for (const y of [0.62, -0.62]) bookletClip(cover, y)
else for (const y of [0.3, -0.02]) { // NS/NS2: two manual clips on the tray half, spine side (Walvis photo)
  const g = bookletClip(base, y); g.scale.set(-1, 1, -1); g.position.set(-W / 2 + T + 0.002, y, -HALF + T)
}
// thin raised rail along the opening edge on the cover interior (photo C)
mesh(new THREE.BoxGeometry(0.006, H - 0.2, 0.006), trayMat, cover, false).position.set(W / 2 - T - 0.03, 0, HALF - T - 0.003)

// Thin instruction booklet held under the clips
const booklet = new THREE.Group(); cover.add(booklet)
const bkW = NSW ? 0.9 : 1.18, bkH = 1.5, bkT = 0.006
booklet.visible = !NSW // modern Switch releases ship without a manual
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
function wrapTex(art) {
  const { pts, total } = wrapIns.userData
  const sA = pts[4].s, sB = pts[pts.length - 5].s // crease-A start, crease-B end
  const P = PX, Wc = Math.round(total * P), Hc = FRONT_H
  const [c, g] = ctx(Wc, Hc)
  g.fillStyle = '#222'; g.fillRect(0, 0, Wc, Hc)
  if (art.back) g.drawImage(art.back, 0, 0, Math.round(sA * P), Hc)
  if (art.spine) g.drawImage(art.spine, Math.round(sA * P), 0, Math.round((sB - sA) * P), Hc)
  if (art.front) g.drawImage(art.front, Math.round(sB * P), 0, Wc - Math.round(sB * P), Hc)
  return tex(c)
}
// Reverse (inside) print of a double-sided insert: alt art, mirrored so it reads correctly through the shell
function wrapInnerTex(art) {
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
  if (art.innerCover) g.drawImage(art.innerCover, 0, 0, pw, Hc)
  if (art.innerTray) g.drawImage(art.innerTray, Wc - xA, 0, xA, Hc)
  g.fillStyle = '#10141c'; g.fillRect(pw, 0, Wc - xA - pw, Hc)
  g.restore(); return tex(c)
}
updateWrap()

// Disc (PS5) or game card (NS)
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
let labelRing, shadowDisc
if (!NSW) {
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
labelRing = discRing(0.17, R - 0.002, labelMat, DT, false)
discRing(rH, 0.17, clearMat, DT, false)
{ const uv = labelRing.geometry.attributes.uv, p = labelRing.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / (2 * R) + 0.5, p.getY(i) / (2 * R) + 0.5) }
const edgeO = mesh(new THREE.CylinderGeometry(R, R, DT, 128, 1, true), clearMat, disc); edgeO.rotation.x = Math.PI / 2; edgeO.position.z = DT / 2; discPick.push(edgeO)
const edgeI = mesh(new THREE.CylinderGeometry(rH, rH, DT, 64, 1, true), clearMat, disc, false); edgeI.rotation.x = Math.PI / 2; edgeI.position.z = DT / 2
mesh(new THREE.TorusGeometry(0.168, 0.0025, 8, 96), clearMat, disc, false).position.z = DT
// clear stacking ring + clamping area on the data side
mesh(new THREE.TorusGeometry(0.2, 0.0022, 8, 96), clearMat, disc, false).position.z = -0.0008
mesh(new THREE.TorusGeometry(0.115, 0.0018, 8, 96), clearMat, disc, false).position.z = -0.0006
shadowDisc = mesh(new THREE.CircleGeometry(R, 64), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }), disc); shadowDisc.position.z = DT / 2
} else {
  // ---- Game card 21 × 31 × 3.3 mm. Local +z = label face. Top edge carries the grip lip; rear top = contact window.
  const { w: cw, h: ch, t: ct } = CART, r = 0.014
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: IS2 ? 0xa00a16 : 0x151618, roughness: IS2 ? 0.6 : 0.62, specularIntensity: 0.25, clearcoat: 0, envMapIntensity: 0.3 })
  dataMat.color.set(IS2 ? 0xb00c19 : 0x1c1d20) // API compat
  const ext = (shape, d) => new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelThickness: 0.0012, bevelSize: 0.0012, bevelSegments: 3, curveSegments: 10 })
  const front = mesh(ext(rrect(cw - 0.0024, ch - 0.0024, r), ct * 0.5 - 0.0024), bodyMat, disc); front.position.z = ct * 0.5 + 0.0012; discPick.push(front)
  let rear
  if (IS2) { // NS2: small notch at the bottom right as seen from the rear (= -x in label-up coordinates)
    const s = new THREE.Shape(), hw = cw / 2 - 0.0012, hh = ch / 2 - 0.0012, nw = 0.028, nh = 0.022
    s.moveTo(-hw + nw, -hh); s.lineTo(hw - r, -hh); s.quadraticCurveTo(hw, -hh, hw, -hh + r); s.lineTo(hw, hh - r); s.quadraticCurveTo(hw, hh, hw - r, hh)
    s.lineTo(-hw + r, hh); s.quadraticCurveTo(-hw, hh, -hw, hh - r); s.lineTo(-hw, -hh + nh); s.lineTo(-hw + nw - 0.004, -hh + nh); s.quadraticCurveTo(-hw + nw, -hh + nh, -hw + nw, -hh + nh - 0.004); s.closePath()
    rear = mesh(ext(s, ct * 0.5 - 0.0024), bodyMat, disc)
  } else rear = mesh(ext(rrect(cw - 0.0024, ch - 0.0024, r), ct * 0.5 - 0.0024), bodyMat, disc)
  rear.position.z = 0.0012; discPick.push(rear)
  // front: shallow label recess + label, ridged grip lip across the top
  labelRing = mesh(new THREE.PlaneGeometry(CART.labW, CART.labH), labelMat, disc, false); labelRing.position.set(0, -0.022, ct + 0.0004); discPick.push(labelRing)
  const lip = mesh(new THREE.BoxGeometry(cw - 0.03, 0.016, 0.003), bodyMat, disc, false); lip.position.set(0, ch / 2 - 0.022, ct + 0.0008); lip.rotation.x = -0.35
  for (let i = 0; i < 3; i++) mesh(new THREE.BoxGeometry(cw - 0.05, 0.0018, 0.0012), bodyMat, disc, false).position.set(0, ch / 2 - 0.012 - i * 0.004, ct + 0.0016)
  // rear: recessed contact window with 17 gold pads at the top edge
  const win = mesh(new THREE.PlaneGeometry(cw - 0.03, 0.05), new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.7 }), disc, false); win.rotation.y = Math.PI; win.position.set(0, ch / 2 - 0.035, -0.0004)
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xb8862a, metalness: 1, roughness: 0.38, envMapIntensity: 0.55 })
  const pads = new THREE.InstancedMesh(new THREE.BoxGeometry(0.0055, 0.03, 0.0008), gold, 17); disc.add(pads)
  const _m = new THREE.Matrix4(); for (let i = 0; i < 17; i++) { pads.setMatrixAt(i, _m.makeTranslation(-0.072 + i * 0.009, ch / 2 - 0.035, -0.0008)) }
  // rear embossed logo plate (subtle)
  const em = mesh(new THREE.PlaneGeometry(0.07, 0.012), new THREE.MeshStandardMaterial({ color: IS2 ? 0x9a0a15 : 0x17181a, roughness: 0.7 }), disc, false); em.rotation.y = Math.PI; em.position.set(0, -0.06, -0.0004)
  shadowDisc = mesh(new THREE.PlaneGeometry(cw, ch), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }), disc); shadowDisc.position.z = ct / 2
}

// Seat position: on hub, just above tray (in root/base local → world via root)
function seatWorld(out = new THREE.Vector3()) {
  return out.set(DISC_X, DISC_Y, TRAY_Z + (NSW ? 0.004 : 0.005)).applyMatrix4(root.matrixWorld)
}
const _seat = new THREE.Vector3()
const FLOAT = new THREE.Vector3(0, 1.1, 0) // disc-focus hover point (world)
disc.position.copy(seatWorld(_seat))

  function setArt(art) {
    const old = [wrapPaper.map, wrapInnerPaper.map, labelMat.map, bkPaper.map]
    wrapPaper.map = wrapTex(art); wrapInnerPaper.map = wrapInnerTex(art)
    labelMat.map = art.disc ? tex(art.disc) : null; bkPaper.map = art.booklet ? tex(art.booklet) : null
    ;[wrapPaper, wrapInnerPaper, labelMat, bkPaper].forEach((m) => (m.needsUpdate = true))
    old.forEach((t) => t && t.dispose())
  }
  const HINGE_MAX = THREE.MathUtils.degToRad(178)
  const easeIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
  /** Apply hinge opening (0..1) and hub press (0..1) to the rig. */
  function pose(open, hubPress) {
    const oe = easeIO(open)
    spineG.rotation.y = -oe * HINGE_MAX / 2; coverHinge.rotation.y = -oe * HINGE_MAX / 2; updateWrap()
    const pe = easeIO(hubPress)
    if (NSW) { btn.position.z = -pe * 0.006; btn.rotation.x = pe * 0.25; return }
    btn.position.z = 0.012 - pe * 0.014; btnHit.position.z = btn.position.z
    for (const t of teeth) { const a = t.userData.angle, r = pe * 0.028; t.position.set(-Math.cos(a) * r, -Math.sin(a) * r, 0); t.scale.setScalar(1 - pe * 0.14) }
  }
  function dispose() {
    for (const o of [root, disc]) { scene.remove(o); o.traverse((m) => { if (m.isMesh) { m.geometry.dispose(); const ms = Array.isArray(m.material) ? m.material : [m.material]; ms.forEach((x) => { x.map && x.map.dispose() }) } }) }
  }
  return { root, base, cover, coverPlate, spineG, coverHinge, hub, btn, btnHit, teeth, disc, discPick, shadowDisc, booklet, sleeve,
    shellMat, trayMat, filmMat, wrapPaper, bookletMat, bkPaper, labelMat, dataMat, updateWrap, seatWorld, setArt, pose, dispose,
    W, H, D, HALF, TRAY_Z, DISC_X, DISC_Y, platform, kind: SPEC.kind, INS_W, INS_H }
}
