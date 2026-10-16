// Title lookup for the maker: 1) our own catalog (games.json, fuzzy), 2) Wikipedia/Wikidata (CORS via origin=*).
// Images: direct CORS fetch first, then the public wsrv.nl image proxy (no key) so covers can be drawn to canvas.
const BASE = import.meta.env.BASE_URL
const PLAT = { PS5: 'ps5', NS: 'ns', NS2: 'ns2' }
const WD_PLAT = { Q63184502: 'ps5', Q19610114: 'ns', Q122761124: 'ns2' }
export const norm = (s) => (s || '').normalize('NFKC').toLowerCase().replace(/[\s:：·・\-–—_'’"!！?？.,，。()（）\[\]【】「」『』~〜™®]/g, '')
function grams(s) { const g = new Set(); for (let i = 0; i < s.length - 1; i++) g.add(s.slice(i, i + 2)); if (s.length === 1) g.add(s); return g }
function dice(a, b) { if (!a || !b) return 0; const A = grams(a), B = grams(b); let n = 0; for (const x of A) if (B.has(x)) n++; return (2 * n) / (A.size + B.size) }
function score(q, t) { if (!t) return 0; if (t === q) return 1; if (t.startsWith(q)) return 0.92 - Math.min(0.2, (t.length - q.length) * 0.006); if (t.includes(q)) return 0.85 - Math.min(0.2, (t.length - q.length) * 0.005); return dice(q, t) * 0.8 }
let catalog = null
export function loadCatalog() {
  return (catalog ||= fetch(BASE + 'data/games.json').then((r) => r.json()).then((g) => g.map((x) => ({ x, keys: [x.title_cn, x.title_en, x.title_ja].filter(Boolean).map(norm) }))).catch(() => []))
}
export const hasCJK = (s) => /[\u3040-\u30ff\u3400-\u9fff]/.test(s || '')
function pickTitle(q, t) { // keep the user's script: CJK query → Chinese/Japanese title, else English
  if (hasCJK(q)) { if (/[\u3040-\u30ff]/.test(q) && t.ja) return t.ja; return t.cn || t.ja || t.en }
  return t.en || t.cn || t.ja
}
export async function searchCatalog(q, limit = 8) {
  const n = norm(q); if (n.length < 1) return []
  const rows = await loadCatalog(), out = []
  for (const r of rows) { const s = Math.max(...r.keys.map((k) => score(n, k)), 0); if (s > 0.45) out.push({ s, x: r.x }) }
  out.sort((a, b) => b.s - a.s || (a.x.edition === 'standard' ? -1 : 1))
  const seen = new Set(), res = []
  for (const { s, x } of out) {
    const key = norm(x.title_en || x.title_cn) + x.platform; if (seen.has(key)) continue; seen.add(key)
    const titles = { cn: x.title_cn, en: x.title_en, ja: x.title_ja }
    res.push({ src: 'catalog', score: s, title: pickTitle(q, titles), titles, platform: PLAT[x.platform] || 'ps5', cover: x.cover_url_large || x.cover_url, coverHost: (x.cover_url || '').split('/')[2] || '', publisher: x.publisher, date: x.release_date, edition: x.edition_name, summary: x.summary_cn || x.synopsis_zh || x.summary_en || '' })
    if (res.length >= limit) break
  }
  return res
}
const j = (u) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null)
export async function searchWiki(q, limit = 5) {
  const langs = hasCJK(q) ? (/[\u3040-\u30ff]/.test(q) ? ['ja', 'zh', 'en'] : ['zh', 'ja', 'en']) : ['en', 'ja']
  const pages = []
  await Promise.all(langs.map(async (L) => {
    const term = L === 'en' ? `${q} video game` : `${q} ゲーム`.replace('ゲーム', L === 'zh' ? '游戏' : 'ゲーム')
    const d = await j(`https://${L}.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrlimit=4&gsrsearch=${encodeURIComponent(term)}&prop=pageprops&ppprop=page_image|wikibase_item`)
    for (const p of Object.values(d?.query?.pages || {})) if (p.pageprops?.wikibase_item) pages.push({ L, idx: p.index, title: p.title, img: p.pageprops.page_image, qid: p.pageprops.wikibase_item })
  }))
  if (!pages.length) return []
  const qids = [...new Set(pages.map((p) => p.qid))].slice(0, 30)
  const wd = await j(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&origin=*&ids=${qids.join('|')}&props=labels|claims&languages=en|ja|zh|zh-hans|zh-cn`)
  const res = [], seen = new Set()
  pages.sort((a, b) => a.idx - b.idx)
  for (const p of pages) {
    if (seen.has(p.qid)) continue; const e = wd?.entities?.[p.qid]; if (!e) continue
    const inst = (e.claims?.P31 || []).map((c) => c.mainsnak?.datavalue?.value?.id)
    if (!inst.includes('Q7889')) continue // video game only
    seen.add(p.qid)
    const lab = (k) => e.labels?.[k]?.value
    const titles = { en: lab('en'), ja: lab('ja'), cn: lab('zh-hans') || lab('zh-cn') || lab('zh') }
    const plats = (e.claims?.P400 || []).map((c) => WD_PLAT[c.mainsnak?.datavalue?.value?.id]).filter(Boolean)
    let cover = null
    if (p.img) { const ii = await j(`https://${p.L}.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=File:${encodeURIComponent(p.img)}&prop=imageinfo&iiprop=url&iiurlwidth=700`); const pg = Object.values(ii?.query?.pages || {})[0]; cover = pg?.imageinfo?.[0]?.thumburl || pg?.imageinfo?.[0]?.url || null }
    if (res.length >= limit * 2) break
    res.push({ src: 'wiki', score: 0.5, title: pickTitle(q, titles) || p.title, titles, platform: plats.includes('ns2') && !plats.includes('ps5') && !plats.includes('ns') ? 'ns2' : plats.includes('ps5') ? 'ps5' : plats.includes('ns') ? 'ns' : plats[0] || null, plats, cover, coverHost: 'wikipedia', wiki: `https://${p.L}.wikipedia.org/wiki/${encodeURIComponent(p.title)}` })
  }
  // rank by closeness to the query, then enrich from our catalog (better cover + exact platform) via the English label
  const nq = norm(q)
  for (const r of res) r.score = 0.5 * Math.max(...Object.values(r.titles).filter(Boolean).map((t) => score(nq, norm(t))), score(nq, norm(r.title)))
  res.sort((a, b) => b.score - a.score)
  for (const r of res) {
    for (const t of [r.titles.en, r.titles.cn].filter(Boolean)) {
      const c = (await searchCatalog(t, 1))[0]
      if (c && c.score >= 0.9) { r.cover = c.cover; r.platform = c.platform; r.src = 'wiki+catalog'; r.date = c.date; r.publisher = c.publisher; r.titles = { ...c.titles, ...Object.fromEntries(Object.entries(r.titles).filter(([, v]) => v)) }; break }
    }
  }
  return res.slice(0, limit)
}
/** Fetch an image as a Blob that canvas can use without tainting. */
export async function fetchImageBlob(url) {
  if (!url) return null
  const ok = (r) => r.ok && /^image\//.test(r.headers.get('content-type') || 'image/') ? r.blob() : null
  try { const r = await fetch(url, { mode: 'cors' }); const b = await ok(r); if (b) return b } catch {}
  try { const r = await fetch(`https://wsrv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//, ''))}&w=1400&output=jpg`, { mode: 'cors' }); const b = await ok(r); if (b) return b } catch {}
  return null
}
/** Proxied thumbnail URL for <img> (display only). */
export const thumbUrl = (u) => (u ? `https://wsrv.nl/?url=${encodeURIComponent(u.replace(/^https?:\/\//, ''))}&w=120&h=160&fit=inside` : '')
