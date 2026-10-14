// Group catalog entries (platforms × editions) into one entry per game.
const ED_WORDS = "limited|regular|standard|special|deluxe|collector'?s?|premium|ultimate|complete|launch|day ?one|digital deluxe|gold|definitive|anniversary|famitsu dx|dx|first print|first press|super deluxe|black mamba|midnight|console|best price|nintendo switch 2|treasure|premium|collectors"
const EN_TAIL = new RegExp(`\\s*[-–:~]?\\s*(?:(?:${ED_WORDS})\\s*)+(?:edition|box|pack|set|ver\\.?|version)?\\s*$`, 'i')
const EN_TAIL2 = /\s*[-–:]?\s*[\w'’]+(?:\s[\w'’]+)?\s+edition\s*$/i

export function normEn(title) {
  let s = String(title || '')
  s = s.replace(/\[[^\]]*\]|【[^】]*】|\([^)]*\)|（[^）]*）/g, ' ')
  s = s.replace(/\bfor nintendo switch( 2)?\b/i, ' ')
  for (let k = 0; k < 3; k++) {
    const before = s
    s = s.replace(EN_TAIL, '').replace(EN_TAIL2, '').trim()
    if (s === before) break
  }
  return s.toLowerCase().normalize('NFKC').replace(/&/g, ' and ').replace(/[^\p{L}\p{N}]+/gu, '')
}

export function normCn(title) {
  let s = String(title || '')
  s = s.replace(/\[[^\]]*\]|【[^】]*】|（[^）]*）|\([^)]*\)/g, '')
  s = s.replace(/\s*(限定版|豪华版|典藏版|特别版|通常版|普通版|标准版|终极版|完全版|收藏版|珍藏版|首发版|数字豪华版|Complete Edition|Deluxe Edition)\s*$/i, '')
  return s.toLowerCase().normalize('NFKC').replace(/&/g, ' and ').replace(/[^\p{L}\p{N}]+/gu, '')
}

export function buildGroups(games) {
  const parent = games.map((_, i) => i)
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])))
  const union = (a, b) => { parent[find(a)] = find(b) }
  const byEn = new Map(), byCn = new Map()
  games.forEach((g, i) => {
    const en = normEn(g.title_en)
    const cn = normCn(g.title_cn)
    if (en.length >= 2) { if (byEn.has(en)) union(i, byEn.get(en)); else byEn.set(en, i) }
    // Chinese title links only when meaningful (avoid generic short names)
    if (cn.length >= 3) { if (byCn.has(cn)) union(i, byCn.get(cn)); else byCn.set(cn, i) }
  })
  const map = new Map()
  games.forEach((g, i) => {
    const r = find(i)
    if (!map.has(r)) map.set(r, [])
    map.get(r).push(g)
  })
  const PORDER = { PS5: 0, PS4: 1, NS2: 2, NS: 3 }
  return [...map.values()].map((versions) => {
    versions.sort((a, b) =>
      (PORDER[a.platform] ?? 9) - (PORDER[b.platform] ?? 9) ||
      (a.edition === 'standard' ? 0 : 1) - (b.edition === 'standard' ? 0 : 1) ||
      String(a.release_date).localeCompare(String(b.release_date)))
    return { id: 'grp-' + versions[0].id, versions }
  })
}
