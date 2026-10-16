// Turns an entry (uploaded images + crop params) into print canvases for the PS5 template.
import { FRONT_W, FRONT_H, SPINE_W, BANNER } from '../demo/caseModel.js'
import { ps5Logo, banner, wrapText } from '../demo/art.js'

export const TEMPLATES = {
  front: { w: FRONT_W, h: FRONT_H, band: true, label: ['正面封面', 'Front cover'] },
  spine: { w: SPINE_W, h: FRONT_H, band: true, label: ['书脊', 'Spine'] },
  back: { w: FRONT_W, h: FRONT_H, band: true, label: ['背面', 'Back cover'] },
  inner: { w: FRONT_W, h: FRONT_H, band: false, label: ['内侧印刷', 'Inner print'] },
  disc: { w: 1024, h: 1024, circle: true, label: ['光盘盘面', 'Disc label'] },
}
export const BLEED = 18 // px of the template that hides under the case lip
export function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c }

/** Downscale an uploaded File to a JPEG blob (max edge `max`). */
export async function downscale(file, max = 1600) {
  const bmp = await createImageBitmap(file).catch(() => null)
  let src = bmp
  if (!src) src = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file) })
  const s = Math.min(1, max / Math.max(src.width, src.height))
  const c = canvas(Math.round(src.width * s), Math.round(src.height * s))
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height)
  return new Promise((res) => c.toBlob(res, 'image/jpeg', 0.88))
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

export function genFront(img, crop, title, band = true) {
  const c = canvas(FRONT_W, FRONT_H), g = c.getContext('2d')
  g.fillStyle = '#1b1d22'; g.fillRect(0, 0, c.width, c.height)
  if (img) drawCropped(g, img, c.width, c.height, crop)
  else { g.fillStyle = '#e9eef0'; g.font = '700 54px sans-serif'; g.textAlign = 'center'; g.fillStyle = '#7b8a87'; g.fillText(title || '封面', c.width / 2, c.height / 2) }
  if (band) banner(g, c.width)
  return c
}
export function genSpine(img, crop, title, color, band = true) {
  const c = canvas(SPINE_W, FRONT_H), g = c.getContext('2d')
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
export function genBack(img, crop, cover, title, color, band = true) {
  const c = canvas(FRONT_W, FRONT_H), g = c.getContext('2d')
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
export function genInner(img, crop, cover, color) {
  const c = canvas(FRONT_W, FRONT_H), g = c.getContext('2d')
  if (img) { drawCropped(g, img, c.width, c.height, crop); return c }
  const col = color || [20, 24, 30]; g.fillStyle = rgb(col.map((v) => v * 0.45)); g.fillRect(0, 0, c.width, c.height)
  if (cover) { g.save(); g.filter = 'blur(40px)'; g.globalAlpha = 0.35; drawCropped(g, cover, c.width, c.height, { s: 1.6 }); g.restore() }
  return c
}
export function genDisc(img, crop, cover, title, band = true) {
  const s = 1024, c = canvas(s, s), g = c.getContext('2d')
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
  const inner = genInner(imgs.inner, sl.inner?.crop, cov, color)
  return {
    front: genFront(cov, sl.front?.crop, entry.title, band),
    spine: genSpine(imgs.spine, sl.spine?.crop, entry.title, color, band),
    back: genBack(imgs.back, sl.back?.crop, cov, entry.title, color, band),
    innerCover: inner, innerTray: inner,
    disc: genDisc(imgs.disc, sl.disc?.crop, cov, entry.title, band),
    booklet: genBooklet(cov, entry.title),
  }
}
