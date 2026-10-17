// Shared 2D print-art kit (PS5 template) + the bundled RE4 Gold Edition sample artwork.
import { PX, FRONT_W, FRONT_H, SPINE_W, BANNER } from './caseModel.js'
let img = new Image()
const RE = {}
export function ctx(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')] }

export function drawCover(g, x, y, w, h, zoom = 1, fx = 0.5, fy = 0.5) {
  if (!img.width) { g.fillStyle = '#2b2b2b'; g.fillRect(x, y, w, h); return }
  const ar = w / h; let sw = img.width / zoom, sh = sw / ar
  if (sh > img.height / zoom) { sh = img.height / zoom; sw = sh * ar }
  g.drawImage(img, (img.width - sw) * fx, (img.height - sh) * fy, sw, sh, x, y, w, h)
}
export function ps5Logo(g, x, y, size, color = '#000') {
  g.save(); g.fillStyle = color; g.font = `900 ${size}px "Helvetica Neue", Arial, "DejaVu Sans", sans-serif`; g.textBaseline = 'middle'
  try { g.letterSpacing = `${size * 0.06}px` } catch {}
  g.strokeStyle = color; g.lineWidth = size * 0.07; g.lineJoin = 'round'; g.strokeText('PS5', x, y); g.fillText('PS5', x, y); g.restore()
}
export function banner(g, w) {
  g.fillStyle = '#fff'; g.fillRect(0, 0, w, BANNER)
  g.fillStyle = '#0070d1'; g.fillRect(0, BANNER, w, 4)
  ps5Logo(g, 42, BANNER / 2 + 2, 66)
}
export function ratingBox(g, x, y, s) {
  g.fillStyle = '#fff'; g.fillRect(x, y, s, s * 1.32); g.strokeStyle = '#000'; g.lineWidth = 4; g.strokeRect(x + 6, y + 6, s - 12, s * 1.32 - 12)
  g.fillStyle = '#000'; g.font = `800 ${s * 0.36}px Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText('CERO', x + s / 2, y + s * 0.34); g.font = `700 ${s * 0.2}px Arial`; g.fillText('RATING', x + s / 2, y + s * 0.82)
  g.textAlign = 'left'
}
// ---- Clean rebuilds of the HK/Asia ELAS 10653 spine + back (content transcribed from the user's photos C/E) ----
export function ean13(g, code, x, y, mw, h) {
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
export function capcomLogo(g, x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.font = `900 italic ${s}px "Arial Black", Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.lineWidth = s * 0.16; g.strokeStyle = '#1d4fa8'; g.strokeText('CAPCOM', 0, 0); g.fillStyle = '#ffc61a'; g.fillText('CAPCOM', 0, 0); g.restore()
}
export function wrapText(g, text, x, y, w, lh) {
  const words = text.split(' '); let line = ''
  for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (g.measureText(t).width > w && line) { g.fillText(line, x, y); y += lh; line = wd } else line = t }
  if (line) g.fillText(line, x, y); return y + lh
}
export function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h) }
export function re4Spine(c, g) {
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
export function re4Back(c, g) {
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
export function frontTex() {
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
export function spineTex() {
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
export function barcode(g, x, y, w, h) {
  g.fillStyle = '#fff'; g.fillRect(x - 10, y - 10, w + 20, h + 46); g.fillStyle = '#000'
  let px = x, seed = 7
  while (px < x + w) { seed = (seed * 9301 + 49297) % 233280; const bw = 2 + (seed % 4) * 1.6; if (seed % 3) g.fillRect(px, y, bw, h); px += bw + 2 }
  g.font = '24px monospace'; g.fillText('4 948872 01633 0', x + 10, y + h + 26)
}
export function backTex() {
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
export function discLabelTex() {
  const s = 1024, [c, g] = ctx(s, s)
  g.save(); g.beginPath(); g.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2); g.clip()
  drawCover(g, 0, 0, s, s)
  g.fillStyle = '#fff'; g.fillRect(0, 0, s, s * 0.2); g.fillStyle = '#0070d1'; g.fillRect(0, s * 0.2, s, 5)
  g.textAlign = 'center'; ps5Logo(g, s / 2, s * 0.13, 70)
  g.fillStyle = 'rgba(255,255,255,.9)'; g.font = '600 24px Arial'; g.fillText('PlayStation®5 · Blu-ray Disc™', s / 2, s * 0.86)
  g.font = '18px Arial'; g.fillText('CUSA-XXXXX  ©2025 Sony Interactive Entertainment LLC', s / 2, s * 0.9)
  g.restore(); return c
}
export function bookletCoverTex() {
  const [c, g] = ctx(512, 720)
  g.fillStyle = '#1a1218'; g.fillRect(0, 0, 512, 720)
  drawCover(g, 0, 0, 512, 420, 1.6, 0.5, 0.2)
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 360, 512, 80)
  g.fillStyle = '#fff'; g.font = '900 44px Impact, "DejaVu Sans Condensed", sans-serif'; g.fillText('BIOHAZARD RE:4', 28, 520)
  g.fillStyle = '#c9a76a'; g.font = '500 18px "Times New Roman",serif'; g.fillText('INSTRUCTION MANUAL', 30, 555)
  g.fillStyle = '#aaa'; g.font = '14px Arial'; g.fillText('PlayStation®5', 30, 680)
  return c
}

function loadImg(src) { return new Promise((res) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = () => res(null); i.src = src }) }
/** RE4 Gold Edition (HK/Asia ELAS 10653). Front = official PS Store key art; inner/disc = user's photos; spine/back = clean rebuilds. */
export async function loadRE4(base) {
  const names = ['front_art', 'inner_cover_print', 'inner_tray_print', 'disc', 'ss1', 'ss2', 'ss3'] // *_print: insert print only (disc, clips, shell tint removed from photos B/C)
  const ims = await Promise.all(names.map((n) => loadImg(`${base}demo/re4_${n}.jpg`)))
  img = ims[0] || new Image(); names.slice(1).forEach((n, i) => (RE[n] = ims[i + 1]))
  return { front: frontTex(), spine: spineTex(), back: backTex(), innerCover: RE.inner_cover_print, innerTray: RE.inner_tray_print, disc: RE.disc, booklet: bookletCoverTex() }
}
