// Turns an entry (uploaded images + crop params) into print canvases for the PS5 template.
import { FRONT_W, FRONT_H, SPINE_W, BANNER, PX, PLATFORMS, CART } from '../demo/caseModel.js'
import { ps5Logo, banner, wrapText } from '../demo/art.js'

export const TEMPLATES = {
  front: { w: FRONT_W, h: FRONT_H, band: true, label: ['正面封面', 'Front cover'] },
  spine: { w: SPINE_W, h: FRONT_H, band: true, label: ['书脊', 'Spine'] },
  back: { w: FRONT_W, h: FRONT_H, band: true, label: ['背面', 'Back cover'] },
  inner: { w: FRONT_W, h: FRONT_H, band: false, label: ['内侧印刷', 'Inner print'] },
  disc: { w: 1024, h: 1024, circle: true, label: ['光盘盘面', 'Disc label'] },
}
// Switch / Switch 2 print sizes: insert 100 × 162 mm, spine 10.6 mm, card label 18.4 × 23.2 mm
const NFW = Math.round(PLATFORMS.ns.insW * PX), NFH = Math.round(PLATFORMS.ns.insH * PX), NSW_ = Math.round((PLATFORMS.ns.D - 0.004) * PX)
const LBW = Math.round(CART.labW * 2000), LBH = Math.round(CART.labH * 2000)
const NS_TPL = {
  front: { w: NFW, h: NFH, band: true, label: ['正面封面', 'Front cover'] },
  spine: { w: NSW_, h: NFH, band: true, label: ['书脊', 'Spine'] },
  back: { w: NFW, h: NFH, band: true, label: ['背面', 'Back cover'] },
  inner: { w: NFW, h: NFH, band: false, label: ['内侧印刷', 'Inner print'] },
  disc: { w: LBW, h: LBH, rect: true, label: ['卡带贴纸', 'Card label'] },
}
export function templatesFor(platform) { return platform === 'ns' || platform === 'ns2' ? NS_TPL : TEMPLATES }
export const NS_RED = '#e60012'
export const NS_BAND = 176 // NS1: no band — 22 × 22 mm red logo badge flush with the top-left corner (logo 16 mm); kept as guide size
export const NS_BADGE = 176
export const NS2_FRAME = 16, NS2_BAND = 128
/** Nintendo Switch mark: two Joy-Con halves (left outline + dot, right solid + hole). Draw at x,y (top-left), height h. */
export function nsIcon(g, x, y, h, col = '#fff') {
  const w = h * 0.44, r = h * 0.3, lw = h * 0.1
  g.save(); g.fillStyle = col; g.strokeStyle = col; g.lineWidth = lw
  g.beginPath(); g.moveTo(x + w, y + lw / 2); g.lineTo(x + r, y + lw / 2); g.arcTo(x + lw / 2, y + lw / 2, x + lw / 2, y + r, r - lw / 2); g.lineTo(x + lw / 2, y + h - r); g.arcTo(x + lw / 2, y + h - lw / 2, x + r, y + h - lw / 2, r - lw / 2); g.lineTo(x + w, y + h - lw / 2); g.closePath(); g.stroke()
  g.beginPath(); g.arc(x + w * 0.5, y + h * 0.3, h * 0.1, 0, 7); g.fill()
  const x2 = x + w + h * 0.06
  g.beginPath(); g.moveTo(x2, y); g.lineTo(x2 + w - r, y); g.arcTo(x2 + w, y, x2 + w, y + r, r); g.lineTo(x2 + w, y + h - r); g.arcTo(x2 + w, y + h, x2 + w - r, y + h, r); g.lineTo(x2, y + h); g.closePath(); g.fill()
  g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(x2 + w * 0.5, y + h * 0.62, h * 0.11, 0, 7); g.fill()
  g.restore(); return h * 0.94
}
export function nsLogo(g, x, y, h, two = false, col = '#fff') {
  let cx = x + nsIcon(g, x, y, h, col) + h * 0.22
  g.save(); g.fillStyle = col; g.textBaseline = 'middle'
  if (two) { g.font = `900 ${h * 1.12}px Arial Black,Arial,sans-serif`; g.fillText('2', cx - h * 0.08, y + h * 0.54); cx += g.measureText('2').width + h * 0.18 }
  g.font = `700 ${h * 0.36}px Arial,sans-serif`; g.fillText('NINTENDO', cx, y + h * 0.3); g.font = `900 ${h * 0.5}px Arial Black,Arial,sans-serif`; g.fillText('SWITCH', cx, y + h * 0.74)
  const wd = cx + g.measureText('SWITCH').width - x; g.restore(); return wd
}
/** Switch 2 mark as printed on NS2 boxes (Mario Kart World ref): [icon][2] on one line, small "NINTENDO SWITCH" centred below. cx = centre. */
export function ns2Logo(g, cx, y, h, col = '#fff') {
  g.save(); g.font = `900 ${h * 1.18}px Arial Black,Arial,sans-serif`; const w2 = g.measureText('2').width, iw = h * 0.94, gap = h * 0.12, tw = iw + gap + w2
  nsIcon(g, cx - tw / 2, y, h, col); g.fillStyle = col; g.textBaseline = 'alphabetic'; g.fillText('2', cx - tw / 2 + iw + gap, y + h * 0.99)
  g.font = `700 ${h * 0.3}px Arial,sans-serif`; g.textAlign = 'center'; g.fillText('NINTENDO', cx, y + h * 1.36); g.fillText('SWITCH', cx, y + h * 1.68); g.restore()
}
/** NS1 front badge (real covers, e.g. Bendy: Lone Wolf JP): red #e60012 square at the top-left corner, white Joy-Con icon over NINTENDO / SWITCH. */
export function nsBadge(g, x, y, s) {
  g.save(); g.fillStyle = NS_RED; g.fillRect(x, y, s, s)
  const ih = s * 0.42; nsIcon(g, x + (s - ih * 0.94) / 2, y + s * 0.13, ih)
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = `700 ${s * 0.1}px Arial,sans-serif`; g.fillText('NINTENDO', x + s / 2, y + s * 0.71)
  g.font = `900 ${s * 0.155}px Arial Black,Arial,sans-serif`; g.fillText('SWITCH', x + s / 2, y + s * 0.87)
  g.font = `400 ${s * 0.05}px Arial`; g.fillText('™', x + s * 0.88, y + s * 0.8); g.restore()
}
/** Placeholder cover when nothing is uploaded or found: hue from the title, big typographic title. */
export function placeholderArt(g, w, h, title) {
  let hsh = 0; for (const ch of title || '?') hsh = (hsh * 31 + ch.codePointAt(0)) >>> 0
  const hue = hsh % 360, gr = g.createLinearGradient(0, 0, w * 0.4, h)
  gr.addColorStop(0, `hsl(${hue},45%,34%)`); gr.addColorStop(1, `hsl(${(hue + 40) % 360},55%,14%)`); g.fillStyle = gr; g.fillRect(0, 0, w, h)
  g.save(); g.globalAlpha = 0.14; g.strokeStyle = '#fff'; g.lineWidth = 2
  for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(w * 0.78, h * 0.3, w * (0.12 + i * 0.09), 0, 7); g.stroke() } g.restore()
  const t = title || 'Untitled', M = w * 0.09; g.fillStyle = '#fff'; g.textBaseline = 'alphabetic'
  const size = fitFont(g, t, w - 2 * M, Math.round(w * 0.13), 900); const lines = []
  if (size < w * 0.07 && t.length > 6) { const mid = Math.ceil(t.length / 2); lines.push(t.slice(0, mid), t.slice(mid)); fitFont(g, lines[0], w - 2 * M, Math.round(w * 0.11), 900) } else lines.push(t)
  lines.forEach((l, i) => g.fillText(l, M, h * 0.62 + i * w * 0.12))
  g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(M, h * 0.66 + (lines.length - 1) * w * 0.12, w * 0.18, 4)
}
function keyIcon(g, x, y, s, fg = '#fff', bg = NS_RED) {
  g.save(); g.fillStyle = bg; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); g.strokeStyle = fg; g.fillStyle = fg; g.lineWidth = s * 0.18
  g.beginPath(); g.arc(x - s * 0.28, y, s * 0.28, 0, 7); g.stroke(); g.fillRect(x - s * 0.02, y - s * 0.09, s * 0.62, s * 0.18); g.fillRect(x + s * 0.32, y, s * 0.12, s * 0.3); g.fillRect(x + s * 0.48, y, s * 0.1, s * 0.22); g.restore()
}
function ratingBox(g, x, y, s) { g.save(); g.fillStyle = '#fff'; g.fillRect(x, y, s * 0.78, s); g.strokeStyle = '#111'; g.lineWidth = 3; g.strokeRect(x + 4, y + 4, s * 0.78 - 8, s - 8); g.fillStyle = '#111'; g.font = `900 ${s * 0.42}px Arial`; g.textAlign = 'center'; g.fillText('12+', x + s * 0.39, y + s * 0.6); g.restore() }
function keyNotice(g, x, y, w, h) {
  g.save(); g.fillStyle = '#fff'; g.fillRect(x, y, w, h); keyIcon(g, x + h * 0.55, y + h / 2, h * 0.36)
  g.fillStyle = '#111'; g.textBaseline = 'middle'; g.font = `800 ${h * 0.3}px Arial,sans-serif`; g.fillText('Game-Key Card', x + h * 1.1, y + h * 0.34)
  g.font = `500 ${h * 0.19}px "Noto Sans SC",Arial,sans-serif`; g.fillText('卡带不含完整游戏数据，首次游玩需联网下载 · Download required', x + h * 1.1, y + h * 0.7); g.restore()
}
function nsFrontDeco(g, w, h, platform, keyCard) {
  if (platform === 'ns') {
    nsBadge(g, 0, 0, NS_BADGE); ratingBox(g, 30, h - 150, 120)
  } else {
    const F = NS2_FRAME; g.fillStyle = NS_RED; g.fillRect(0, 0, w, NS2_BAND); g.fillRect(0, 0, F, h); g.fillRect(w - F, 0, F, h); g.fillRect(0, h - F, w, F)
    ns2Logo(g, w / 2, NS2_BAND * 0.12, NS2_BAND * 0.46)
    if (keyCard) keyNotice(g, F, h - F - 92, w - 2 * F, 92)
    ratingBox(g, F + 20, h - F - (keyCard ? 92 : 0) - 140, 116)
  }
}
export const BLEED = 18 // px of the template that hides under the case lip
export function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c }
// Print canvases are rendered at PRINT_SCALE× their template size; width/height stay in template units so all
// layout code (and consumers that read .width/.height for aspect) is unchanged while the bitmap is sharper.
const lowGPU = typeof navigator !== 'undefined' && (/Mobi|Android|iPhone|iPad/.test(navigator.userAgent) || (navigator.hardwareConcurrency || 8) <= 4)
export const PRINT_SCALE = lowGPU ? 1.5 : 2
export function hcanvas(w, h, S = PRINT_SCALE) {
  const c = canvas(Math.round(w * S), Math.round(h * S)), g = c.getContext('2d')
  g.scale(S, S); g.imageSmoothingQuality = 'high'
  Object.defineProperty(c, 'width', { value: w, configurable: true }); Object.defineProperty(c, 'height', { value: h, configurable: true })
  return c
}
/** Real bitmap size of a (possibly hi-res) print canvas. */
export const bitmapSize = (c) => { const d = Object.getPrototypeOf(c); const gw = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'width').get; return [gw.call(c), Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'height').get.call(c)] }

/** Downscale an uploaded File to a JPEG blob (max edge `max`). */
export async function downscale(file, max = 2560) {
  const bmp = await createImageBitmap(file).catch(() => null)
  let src = bmp
  if (!src) src = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file) })
  const c = resample(src, Math.min(1, max / Math.max(src.width, src.height)))
  return new Promise((res) => c.toBlob(res, 'image/jpeg', 0.93))
}
/** High-quality resample: halve step by step when shrinking (no aliasing), smooth 'high' when enlarging. */
export function resample(src, s) {
  let cur = src, w = src.width, h = src.height
  const tw = Math.max(1, Math.round(w * s)), th = Math.max(1, Math.round(h * s))
  while (w / 2 >= tw) { const c = canvas(Math.round(w / 2), Math.round(h / 2)), g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, c.width, c.height); cur = c; w = c.width; h = c.height }
  const c = canvas(tw, th), g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, tw, th); return c
}
/** Unsharp mask (amount 0..1) for upscaled low-res retail photos. */
export function sharpen(c, amount = 0.45) {
  const g = c.getContext('2d'), { width: w, height: h } = c, src = g.getImageData(0, 0, w, h), d = src.data, o = new Uint8ClampedArray(d)
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = (y * w + x) * 4
    for (let k = 0; k < 3; k++) { const b = (d[i - 4 + k] + d[i + 4 + k] + d[i - w * 4 + k] + d[i + w * 4 + k]) / 4; o[i + k] = d[i + k] + (d[i + k] - b) * amount * 2 } }
  src.data.set(o); g.putImageData(src, 0, 0); return c
}
/** Retail photo cleanup: strip uniform light background, then the plastic case rim (blue/red/clear band). */
export function trimRetail(img) {
  const w = img.width, h = img.height, c0 = canvas(w, h), g0 = c0.getContext('2d'); g0.drawImage(img, 0, 0)
  const d = g0.getImageData(0, 0, w, h).data
  const line = (axis, k) => { // stats over the central 60% of a row (axis 0) or column (axis 1)
    const n = axis ? h : w, a = Math.floor(n * 0.2), b = Math.ceil(n * 0.8); let sr = 0, sg = 0, sb = 0, s2 = 0, m = 0
    for (let t = a; t < b; t++) { const i = (axis ? t * w + k : k * w + t) * 4, L = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11; sr += d[i]; sg += d[i + 1]; sb += d[i + 2]; s2 += L * L; m++ }
    const r = sr / m, gg = sg / m, bb = sb / m, L = r * 0.3 + gg * 0.59 + bb * 0.11; return { c: [r, gg, bb], L, sd: Math.sqrt(Math.max(0, s2 / m - L * L)) }
  }
  const edge = (axis, from, dir, n) => {
    let k = from, steps = 0; const lim = Math.floor(n * 0.08)
    while (steps < lim) { const s = line(axis, k); if (!(s.L > 228 && s.sd < 14)) break; k += dir; steps++ } // background
    const first = line(axis, k); let rim = 0
    while (rim < Math.floor(n * 0.035)) { const s = line(axis, k); const dc = Math.hypot(s.c[0] - first.c[0], s.c[1] - first.c[1], s.c[2] - first.c[2]); if (s.sd > 22 || dc > 45) break; k += dir; rim++ } // case rim
    if (rim < 2) k -= dir * rim // no rim found → keep content
    return k + dir * Math.round(n * 0.004)
  }
  const top = edge(0, 0, 1, h), bot = edge(0, h - 1, -1, h), left = edge(1, 0, 1, w), right = edge(1, w - 1, -1, w)
  const cw = right - left + 1, ch = bot - top + 1
  if (cw < w * 0.6 || ch < h * 0.6) return c0
  const c = canvas(cw, ch); c.getContext('2d').drawImage(c0, left, top, cw, ch, 0, 0, cw, ch); return c
}
/** Retail/lookup image → clean, sharp working image (trim, upscale small sources to ≥1800 px with sharpening). */
export async function prepareRetail(blob) {
  const img = await blobToImage(blob); if (!img) return null
  let c = trimRetail(img); const long = Math.max(c.width, c.height)
  if (long < 1800) { c = resample(c, Math.min(4, 1800 / long)); sharpen(c, long < 700 ? 0.55 : 0.35) }
  return new Promise((res) => c.toBlob(res, 'image/jpeg', 0.94))
}
export function blobToImage(blob) {
  return new Promise((res) => { if (!blob) return res(null); const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = URL.createObjectURL(blob) })
}
/** Draw `img` into a w×h frame with crop {x,y,s}: s = zoom (1 = cover-fit), x/y = offset in frame units (-1..1). */
export function drawCropped(g, img, w, h, crop = {}) {
  const s = crop.s || 1, base = Math.max(w / img.width, h / img.height) * s
  const dw = img.width * base, dh = img.height * base
  const x = (w - dw) / 2 + (crop.x || 0) * w / 2, y = (h - dh) / 2 + (crop.y || 0) * h / 2
  g.drawImage(img, x, y, dw, dh)
}
export function dominantColor(img) {
  const c = canvas(24, 24), g = c.getContext('2d'); g.drawImage(img, 0, 0, 24, 24)
  const d = g.getImageData(0, 0, 24, 24).data; let best = null, bs = -1, avg = [0, 0, 0]
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], gg = d[i + 1], b = d[i + 2]; avg[0] += r; avg[1] += gg; avg[2] += b
    const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), sat = mx ? (mx - mn) / mx : 0, l = mx / 255
    const score = sat * (1 - Math.abs(l - 0.45))
    if (score > bs) { bs = score; best = [r, gg, b] }
  }
  const n = d.length / 4; avg = avg.map((v) => v / n)
  const mix = best ? best.map((v, i) => v * 0.55 + avg[i] * 0.45) : avg
  return mix.map((v) => Math.round(v * 0.62)) // deepen so white type reads well
}
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`
function fitFont(g, text, maxW, size, weight = 800, fam = '"Noto Sans SC","PingFang SC",Arial,sans-serif') {
  let s = size; do { g.font = `${weight} ${s}px ${fam}`; s -= 2 } while (g.measureText(text).width > maxW && s > 12); return s + 2
}

export function genFront(img, crop, title, band = true, platform = 'ps5', keyCard = false) {
  const T = templatesFor(platform).front
  const c = hcanvas(T.w, T.h), g = c.getContext('2d')
  g.fillStyle = '#1b1d22'; g.fillRect(0, 0, c.width, c.height)
  if (img) drawCropped(g, img, c.width, c.height, crop)
  else placeholderArt(g, c.width, c.height, title)
  if (band) platform === 'ps5' ? banner(g, c.width) : nsFrontDeco(g, c.width, c.height, platform, keyCard)
  return c
}
function nsSpine(img, crop, title, color, band, platform) {
  const T = NS_TPL.spine, c = hcanvas(T.w, T.h), g = c.getContext('2d'), two = platform === 'ns2'
  if (img) drawCropped(g, img, c.width, c.height, crop)
  else {
    if (two) { const col = color || [40, 46, 56]; const gr = g.createLinearGradient(0, 0, 0, c.height); gr.addColorStop(0, rgb(col)); gr.addColorStop(1, rgb(col.map((v) => v * 0.55))); g.fillStyle = gr } else g.fillStyle = NS_RED
    g.fillRect(0, 0, c.width, c.height)
    g.save(); g.translate(c.width / 2, two ? NS2_BAND + 40 : 130); g.rotate(Math.PI / 2); g.fillStyle = '#fff'; g.textBaseline = 'middle'
    fitFont(g, title || 'Untitled', c.height - 300, 40, two ? 800 : 700); g.fillText(title || 'Untitled', 0, 2); g.restore()
    if (two) { g.fillStyle = 'rgba(255,255,255,.8)'; g.font = '700 14px Arial'; g.textAlign = 'center'; g.fillText('DIGITAL', c.width / 2, c.height - 70); g.fillText('PHYSICAL', c.width / 2, c.height - 52) }
  }
  if (band) {
    const bh = two ? NS2_BAND : 0; if (two) { g.fillStyle = NS_RED; g.fillRect(0, 0, c.width, bh) }
    nsIcon(g, c.width / 2 - 21, two ? bh * 0.22 : 40, 44)
    if (two) { g.fillStyle = '#fff'; g.font = '900 30px Arial Black,Arial'; g.textAlign = 'center'; g.fillText('2', c.width / 2, bh * 0.9) ; g.fillStyle = NS_RED; g.fillRect(0, c.height - NS2_FRAME, c.width, NS2_FRAME) }
  }
  return c
}
export function genSpine(img, crop, title, color, band = true, platform = 'ps5') {
  if (platform !== 'ps5') return nsSpine(img, crop, title, color, band, platform)
  const c = hcanvas(SPINE_W, FRONT_H), g = c.getContext('2d')
  if (img) { drawCropped(g, img, c.width, c.height, crop) }
  else {
    const col = color || [40, 46, 56]
    const gr = g.createLinearGradient(0, 0, 0, c.height); gr.addColorStop(0, rgb(col)); gr.addColorStop(1, rgb(col.map((v) => v * 0.6))); g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height)
    g.save(); g.translate(c.width / 2, BANNER + 46); g.rotate(Math.PI / 2); g.fillStyle = '#fff'; g.textBaseline = 'middle'
    fitFont(g, title || 'Untitled', c.height - BANNER - 260, 52); g.fillText(title || 'Untitled', 0, 2); g.restore()
    g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '600 17px Arial'; g.textAlign = 'center'; g.fillText('DIGITAL', c.width / 2, c.height - 110); g.fillText('PHYSICAL', c.width / 2, c.height - 88)
  }
  if (band) { g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, BANNER); g.fillStyle = '#0070d1'; g.fillRect(0, BANNER, c.width, 3); g.save(); g.translate(c.width / 2, BANNER / 2); g.rotate(Math.PI / 2); g.textAlign = 'center'; ps5Logo(g, 0, 0, 34); g.restore() }
  return c
}
export function genBack(img, crop, cover, title, color, band = true, platform = 'ps5') {
  if (platform !== 'ps5') return nsBack(img, crop, cover, title, color, band, platform)
  const c = hcanvas(FRONT_W, FRONT_H), g = c.getContext('2d')
  if (img) { drawCropped(g, img, c.width, c.height, crop); if (band) banner(g, c.width); return c }
  const col = color || [30, 34, 40]
  g.fillStyle = rgb(col.map((v) => v * 0.5)); g.fillRect(0, 0, c.width, c.height)
  if (cover) { g.save(); g.filter = 'blur(28px) saturate(1.1)'; g.globalAlpha = 0.55; drawCropped(g, cover, c.width, c.height, { s: 1.25 }); g.restore() }
  const vg = g.createLinearGradient(0, 0, 0, c.height); vg.addColorStop(0, 'rgba(10,12,16,.15)'); vg.addColorStop(1, 'rgba(10,12,16,.75)'); g.fillStyle = vg; g.fillRect(0, 0, c.width, c.height)
  if (band) banner(g, c.width)
  const M = 64; g.fillStyle = '#fff'; fitFont(g, title || 'Untitled', c.width - 2 * M, 64, 800); g.fillText(title || 'Untitled', M, BANNER + 110)
  g.fillStyle = 'rgba(255,255,255,.8)'; g.font = '400 24px "Noto Sans SC",Arial,sans-serif'
  wrapText(g, '电子实体版 · Digital Physical Edition', M, BANNER + 160, c.width - 2 * M, 32)
  if (cover) { // three framed crops of the cover as "screenshots"
    const sw = (c.width - 2 * M - 32) / 3, sh = sw * 0.5625
    ;[[1.8, -0.4, -0.3], [2.2, 0.5, 0.1], [1.6, 0, 0.5]].forEach(([s, x, y], i) => {
      const t = canvas(Math.round(sw), Math.round(sh)); drawCropped(t.getContext('2d'), cover, t.width, t.height, { s, x, y })
      const px = M + i * (sw + 16), py = BANNER + 230; g.drawImage(t, px, py); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 2; g.strokeRect(px, py, sw, sh)
    })
  }
  const wy = c.height - 220; g.fillStyle = '#fff'; g.fillRect(0, wy, c.width, 220)
  g.fillStyle = '#333'; g.font = '16px Arial'; g.fillText('This is a personal display piece made with 3D Showcase. Not for sale.', M, wy + 48)
  g.fillText('个人收藏展示用电子实体版，非商业用途。', M, wy + 76)
  g.fillStyle = '#111'; g.fillRect(c.width - 330, wy + 120, 270, 34); g.fillStyle = '#fff'; g.font = '800 16px Arial'; g.textAlign = 'center'; g.fillText('PS5 · DIGITAL PHYSICAL', c.width - 195, wy + 143); g.textAlign = 'left'
  return c
}
function nsBack(img, crop, cover, title, color, band, platform) {
  const T = NS_TPL.back, c = hcanvas(T.w, T.h), g = c.getContext('2d'), two = platform === 'ns2'
  const bh = band && two ? NS2_BAND : 0, F = two && band ? NS2_FRAME : 0
  const deco = () => { if (!band) return; g.fillStyle = NS_RED; g.fillRect(0, 0, c.width, bh); if (two) { g.fillRect(0, 0, F, c.height); g.fillRect(c.width - F, 0, F, c.height); g.fillRect(0, c.height - F, c.width, F) } const lh = bh * 0.5; if (two) ns2Logo(g, c.width / 2, bh * 0.12, bh * 0.46); else nsLogo(g, c.width - 290, 40, 56, false, NS_RED) }
  if (img) { drawCropped(g, img, c.width, c.height, crop); deco(); return c }
  g.fillStyle = two ? '#16181d' : '#f4f4f4'; g.fillRect(0, 0, c.width, c.height)
  const M = 48 + F, ink = two ? '#fff' : '#111'
  if (cover && two) { g.save(); g.filter = 'blur(26px)'; g.globalAlpha = 0.45; drawCropped(g, cover, c.width, c.height, { s: 1.3 }); g.restore() }
  g.fillStyle = ink; fitFont(g, title || 'Untitled', c.width - 2 * M, 54, 800); g.fillText(title || 'Untitled', M, Math.max(bh, 110) + 90)
  g.fillStyle = two ? 'rgba(255,255,255,.8)' : '#444'; g.font = '400 22px "Noto Sans SC",Arial,sans-serif'; wrapText(g, '电子实体版 · Digital Physical Edition', M, Math.max(bh, 110) + 132, c.width - 2 * M, 30)
  if (cover) {
    const sw = (c.width - 2 * M - 16) / 2, sh = sw * 0.5625
    ;[[1.8, -0.4, -0.3], [2.2, 0.5, 0.1], [1.6, 0, 0.5], [2.0, -0.3, 0.4]].forEach(([s2, x, y], i) => {
      const t = canvas(Math.round(sw), Math.round(sh)); drawCropped(t.getContext('2d'), cover, t.width, t.height, { s: s2, x, y })
      const px = M + (i % 2) * (sw + 16), py = Math.max(bh, 110) + 190 + Math.floor(i / 2) * (sh + 16); g.drawImage(t, px, py)
    })
  }
  const wy = c.height - F - 200; g.fillStyle = '#fff'; g.fillRect(F, wy, c.width - 2 * F, 200 - (two ? 0 : 0))
  g.fillStyle = '#333'; g.font = '15px Arial'; g.fillText('Personal display piece made with 3D Showcase. Not for sale.', M, wy + 44); g.fillText('个人收藏展示用电子实体版，非商业用途。', M, wy + 70)
  g.fillStyle = NS_RED; g.fillRect(c.width - M - 250, wy + 110, 250, 34); g.fillStyle = '#fff'; g.font = '800 15px Arial'; g.textAlign = 'center'; g.fillText((two ? 'NINTENDO SWITCH 2' : 'NINTENDO SWITCH') + ' · DIGITAL', c.width - M - 125, wy + 133); g.textAlign = 'left'
  deco(); return c
}
function nsLabel(img, crop, cover, title, platform, keyCard) {
  const c = hcanvas(LBW, LBH), g = c.getContext('2d')
  g.fillStyle = '#222'; g.fillRect(0, 0, LBW, LBH)
  if (img) drawCropped(g, img, LBW, LBH, crop)
  else if (cover) drawCropped(g, cover, LBW, LBH, { s: 1.0, y: 0.1 })
  if (!img) { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, LBH - 70, LBW, 70); g.fillStyle = '#fff'; fitFont(g, title || '', LBW - 40, 26, 800); g.textAlign = 'center'; g.fillText(title || '', LBW / 2, LBH - 28); g.textAlign = 'left' }
  if (keyCard) keyIcon(g, LBW - 34, 34, 22, '#fff', NS_RED)
  return c
}
export function genInner(img, crop, cover, color, platform = 'ps5') {
  const T = templatesFor(platform).inner
  const c = hcanvas(T.w, T.h), g = c.getContext('2d')
  if (img) { drawCropped(g, img, c.width, c.height, crop); return c }
  const col = color || [20, 24, 30]; g.fillStyle = rgb(col.map((v) => v * 0.45)); g.fillRect(0, 0, c.width, c.height)
  if (cover) { g.save(); g.filter = 'blur(40px)'; g.globalAlpha = 0.35; drawCropped(g, cover, c.width, c.height, { s: 1.6 }); g.restore() }
  return c
}
export function genDisc(img, crop, cover, title, band = true, platform = 'ps5', keyCard = false) {
  if (platform !== 'ps5') return nsLabel(img, crop, cover, title, platform, keyCard)
  const s = 1024, c = hcanvas(s, s), g = c.getContext('2d')
  g.fillStyle = '#ddd'; g.fillRect(0, 0, s, s)
  if (img) drawCropped(g, img, s, s, crop)
  else if (cover) { drawCropped(g, cover, s, s, { s: 1.15, y: -0.1 }); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 0, s, s) }
  if (!img && band) {
    g.fillStyle = '#fff'; g.fillRect(0, s * 0.74, s, s * 0.26); g.fillStyle = '#0070d1'; g.fillRect(0, s * 0.74 - 5, s, 5)
    g.textAlign = 'center'; ps5Logo(g, s / 2 - 50, s * 0.82, 64)
    g.fillStyle = '#333'; g.font = '600 22px Arial'; g.fillText(title || '', s / 2, s * 0.9)
  }
  return c
}
export function genBooklet(cover, title) {
  const c = canvas(512, 720), g = c.getContext('2d'); g.fillStyle = '#1c1d22'; g.fillRect(0, 0, 512, 720)
  if (cover) drawCropped(g, cover, 512, 470, { s: 1.1 })
  g.fillStyle = '#fff'; fitFont(g, title || 'Untitled', 460, 40, 800); g.fillText(title || 'Untitled', 26, 540)
  g.fillStyle = '#c9b48a'; g.font = '500 18px Arial'; g.fillText('MANUAL · 说明书', 28, 575); return c
}
/** Full art set for the case model from entry + decoded images. */
export function buildArt(entry, imgs) {
  const sl = entry.slots || {}, cov = imgs.front, band = entry.band !== false
  const color = cov ? dominantColor(cov) : null
  const P = entry.platform || 'ps5', K = P === 'ns2' && !!entry.keyCard
  const inner = genInner(imgs.inner, sl.inner?.crop, cov, color, P)
  return {
    front: genFront(cov, sl.front?.crop, entry.title, band, P, K),
    spine: genSpine(imgs.spine, sl.spine?.crop, entry.title, color, band, P),
    back: genBack(imgs.back, sl.back?.crop, cov, entry.title, color, band, P),
    innerCover: inner, innerTray: inner,
    disc: genDisc(imgs.disc, sl.disc?.crop, cov, entry.title, band, P, K),
    booklet: genBooklet(cov, entry.title),
  }
}
