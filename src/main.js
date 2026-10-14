import './style.css'

const LANG_KEY = 'game-catalog-lang'
const TAB_KEY = 'game-catalog-tab'

/** Reference FX → CNY (display only; not live market rates) */
const FX_TO_CNY = {
  CNY: 1,
  RMB: 1,
  USD: 7.2,
  JPY: 0.048,
  EUR: 7.8,
  GBP: 9.1,
  HKD: 0.92,
  TWD: 0.23,
  KRW: 0.0053,
  AUD: 4.7,
  CAD: 5.3,
}

/** Calendar day for release_status derivation (local date from new Date()). Seed data uses 2026-09-09. */
function todayIso() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Local calendar month key YYYY-MM (default catalog scope). */
function currentMonthKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/**
 * @param {any} game
 * @returns {'released' | 'upcoming'}
 */
function resolveReleaseStatus(game) {
  const explicit = game?.release_status
  if (explicit === 'upcoming' || explicit === 'released') return explicit
  const rd = String(game?.release_date || '')
  if (rd && rd > todayIso()) return 'upcoming'
  return 'released'
}

function isUpcoming(game) {
  return resolveReleaseStatus(game) === 'upcoming'
}

const I18N = {
  zh: {
    htmlLang: 'zh-CN',
    heroBadge: '实体 · 目录 · 2023–2026',
    heroTitle: '实体游戏目录',
    heroSub: 'PS 光盘 / Switch 卡带 · 近三年 · 按发售时间',
    statTotal: (n) => `共 <strong>${n}</strong> 条`,
    statPs: (n) => `PS <strong>${n}</strong>`,
    statNs: (n) => `Switch <strong>${n}</strong>`,
    statNs2: (n) => `Switch 2 <strong>${n}</strong>`,
    statPriced: (n) => `含价格 <strong>${n}</strong>`,
    yearNavAria: '按年份跳转',
    searchPlaceholder: '搜索中/英文标题、版本…',
    allPlatforms: '全部平台',
    allEditions: '全部版本',
    hasPrice: '有价格',
    upcomingOnly: '即将发售',
    upcomingBadge: '即将发售',
    upcomingReleaseDay: (d) => `发售日 ${d}`,
    statUpcoming: (n) => `即将发售 <strong>${n}</strong>`,
    tabMonth: '本月',
    tabUpcoming: '即将发售',
    tabMonthAria: '按发售月浏览',
    tabUpcomingAria: '即将发售列表',
    monthNavAria: '选择月份',
    monthPrev: '上一月',
    monthNext: '下一月',
    monthJump: '跳转到月份',
    emptyMonth: '本月暂无收录，可切换其他月份。',
    emptyUpcoming: '暂无即将发售的游戏。',
    monthLabel: (y, m) => `${y}年${m}月`,
    monthOption: (y, m) => `${y}年${m}月`,
    platformAria: '平台',
    editionAria: '版本',
    resultCount: (n) => `${n} 条结果`,
    clickHint: '点击卡片查看详情',
    emptyFilter: '没有符合条件的条目，试试调整筛选或搜索关键词。',
    loading: '加载目录中…',
    loadError: (msg) => `无法加载 games.json：${msg}`,
    gamesInYear: (n) => `${n} 款`,
    priceTbd: '价格待定',
    noCover: '暂无封面',
    coverFailed: '封面加载失败',
    close: '关闭',
    releaseDate: '发售日',
    platform: '平台',
    labelMedia: '介质',
    labelEdition: '版本',
    msrp: '建议零售价（人民币）',
    regionNote: '区域备注',
    coverSource: '封面来源',
    dataSource: '数据来源',
    id: 'ID',
    notesTitle: '特典 / 版本说明',
    editionContentsTitle: '限定内容',
    editionContentsEmpty: '暂无特典清单',
    extrasHint: '含特典',
    priceMissing: '暂无 / 待核实',
    seeCoverUrl: '见 cover_url',
    priceNote: '价格备注',
    originalPrice: '原始标价',
    titleCnSource: '中文名来源',
    aboutTitle: '简介',
    aboutEmpty: '暂无简介',
    scoresTitle: '媒体评分',
    footerDisclaimer:
      '<strong>免责声明</strong>：本站为库存浏览 / 展示用静态目录。建议零售价仅供参考，非实时售价，亦非购买承诺。',
    footerCovers:
      '封面图若有，来自公开来源（如 Wikimedia Commons）；缺失时显示平台占位图。演示条目中的特典说明与部分价格为示意，请以官方发行为准。',
    footerFx: '价格已按参考汇率换算为人民币（CNY），非实时成交价。',
    footerData: '数据文件：<code>public/data/games.json</code> · Vite 静态站点',
    media: {
      disc: '光盘',
      cartridge: '卡带',
      physical: '实体',
    },
    edition: {
      standard: '标准',
      limited: '限定',
      collector: '典藏',
      deluxe: '豪华',
      ultimate: '终极',
      other: '其他',
    },
    month: ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  },
  en: {
    htmlLang: 'en',
    heroBadge: 'PHYSICAL · CATALOG · 2023–2026',
    heroTitle: 'Physical Game Catalog',
    heroSub: 'PS discs / Switch carts · last ~3 years · by release date',
    statTotal: (n) => `<strong>${n}</strong> titles`,
    statPs: (n) => `PS <strong>${n}</strong>`,
    statNs: (n) => `Switch <strong>${n}</strong>`,
    statNs2: (n) => `Switch 2 <strong>${n}</strong>`,
    statPriced: (n) => `Priced <strong>${n}</strong>`,
    yearNavAria: 'Jump by year',
    searchPlaceholder: 'Search titles, editions…',
    allPlatforms: 'All platforms',
    allEditions: 'All editions',
    hasPrice: 'Has price',
    upcomingOnly: 'Upcoming',
    upcomingBadge: 'Coming soon',
    upcomingReleaseDay: (d) => `Releases ${d}`,
    statUpcoming: (n) => `Upcoming <strong>${n}</strong>`,
    tabMonth: 'This month',
    tabUpcoming: 'Coming soon',
    tabMonthAria: 'Browse by release month',
    tabUpcomingAria: 'Upcoming releases',
    monthNavAria: 'Choose month',
    monthPrev: 'Previous month',
    monthNext: 'Next month',
    monthJump: 'Jump to month',
    emptyMonth: 'No titles this month. Try another month.',
    emptyUpcoming: 'No upcoming releases.',
    monthLabel: (y, m) => {
      const names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${names[m] || m} ${y}`
    },
    monthOption: (y, m) => {
      const names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${names[m] || m} ${y}`
    },
    platformAria: 'Platform',
    editionAria: 'Edition',
    resultCount: (n) => `${n} result${n === 1 ? '' : 's'}`,
    clickHint: 'Click a card for details',
    emptyFilter: 'No matches. Try adjusting filters or search keywords.',
    loading: 'Loading catalog…',
    loadError: (msg) => `Failed to load games.json: ${msg}`,
    gamesInYear: (n) => `${n} title${n === 1 ? '' : 's'}`,
    priceTbd: 'Price TBD',
    noCover: 'No cover',
    coverFailed: 'Cover failed',
    close: 'Close',
    releaseDate: 'Release date',
    platform: 'Platform',
    labelMedia: 'Media',
    labelEdition: 'Edition',
    msrp: 'MSRP (CNY)',
    regionNote: 'Region note',
    coverSource: 'Cover source',
    dataSource: 'Data source',
    id: 'ID',
    notesTitle: 'Edition notes / extras',
    editionContentsTitle: 'Edition contents',
    editionContentsEmpty: 'Contents not listed yet',
    extrasHint: 'Extras',
    priceMissing: 'N/A / unverified',
    seeCoverUrl: 'see cover_url',
    priceNote: 'Price note',
    originalPrice: 'Original list price',
    titleCnSource: 'CN title source',
    aboutTitle: 'About',
    aboutEmpty: 'No synopsis yet',
    scoresTitle: 'Critic scores',
    footerDisclaimer:
      '<strong>Disclaimer</strong>: Static browse/showcase catalog. MSRP is for reference only — not a live price or purchase offer.',
    footerCovers:
      'Covers (when present) come from public sources (e.g. Wikimedia Commons); placeholders show when missing. Sample extras/prices are illustrative — check official releases.',
    footerFx: 'Prices converted to CNY at reference FX rates; not live market quotes.',
    footerData: 'Data: <code>public/data/games.json</code> · Vite static site',
    media: {
      disc: 'Disc',
      cartridge: 'Cartridge',
      physical: 'Physical',
    },
    edition: {
      standard: 'Standard',
      limited: 'Limited',
      collector: 'Collector',
      deluxe: 'Deluxe',
      ultimate: 'Ultimate',
      other: 'Other',
    },
    month: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
}

const PLATFORM_LABEL = {
  PS5: 'PS5',
  PS4: 'PS4',
  NS: 'Switch',
  NS2: 'Switch 2',
}

/** @type {Array<any>} */
let allGames = []

const state = {
  lang: loadLang(),
  q: '',
  platform: '',
  edition: '',
  hasPrice: false,
  tab: loadTab(),
  monthKey: currentMonthKey(),
  stats: null,
}

function loadLang() {
  try {
    const v = localStorage.getItem(LANG_KEY)
    if (v === 'en' || v === 'zh') return v
  } catch {
    /* ignore */
  }
  return 'zh'
}

function saveLang(lang) {
  try {
    localStorage.setItem(LANG_KEY, lang)
  } catch {
    /* ignore */
  }
}

function loadTab() {
  try {
    const v = sessionStorage.getItem(TAB_KEY)
    if (v === 'month' || v === 'upcoming') return v
  } catch {
    /* ignore */
  }
  return 'month'
}

function saveTab(tab) {
  try {
    sessionStorage.setItem(TAB_KEY, tab)
  } catch {
    /* ignore */
  }
}

function t() {
  return I18N[state.lang] || I18N.zh
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function nonEmpty(s) {
  return typeof s === 'string' ? s.trim() : s != null && s !== '' ? String(s).trim() : ''
}

/** Prefer CNY amount; convert legacy currencies via reference FX. */
function resolveCnyAmount(game) {
  // Optional explicit CNY field from data agent
  if (game.msrp_cny != null && game.msrp_cny !== '' && !Number.isNaN(Number(game.msrp_cny))) {
    return Number(game.msrp_cny)
  }

  const msrp = game.msrp
  if (msrp == null || msrp === '' || Number.isNaN(Number(msrp))) return null

  const cur = String(game.currency || 'CNY').toUpperCase()
  if (cur === 'CNY' || cur === 'RMB') return Number(msrp)

  const rate = FX_TO_CNY[cur]
  if (rate != null) return Number(msrp) * rate

  // Unknown currency: treat numeric as already-CNY display amount
  return Number(msrp)
}

function formatCny(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return null
  const n = Number(amount)
  try {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      maximumFractionDigits: n % 1 === 0 ? 0 : 2,
    }).format(n)
  } catch {
    return `¥${n}`
  }
}

function formatPrice(game) {
  return formatCny(resolveCnyAmount(game))
}

function formatOriginalPrice(game) {
  const orig = game.msrp_original
  const cur = String(game.currency_original || '').toUpperCase()
  if (orig == null || orig === '' || Number.isNaN(Number(orig))) {
    // If current currency is not CNY, show legacy raw as original
    const curNow = String(game.currency || '').toUpperCase()
    if (game.msrp != null && game.msrp !== '' && curNow && curNow !== 'CNY' && curNow !== 'RMB') {
      try {
        return new Intl.NumberFormat('zh-CN', {
          style: 'currency',
          currency: curNow,
          maximumFractionDigits: curNow === 'JPY' ? 0 : 2,
        }).format(Number(game.msrp))
      } catch {
        return `${curNow} ${game.msrp}`
      }
    }
    return null
  }
  if (!cur) return String(orig)
  try {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: cur,
      maximumFractionDigits: cur === 'JPY' || cur === 'CNY' ? 0 : 2,
    }).format(Number(orig))
  } catch {
    return `${cur} ${orig}`
  }
}

function displayTitles(game) {
  const cn = nonEmpty(game.title_cn)
  const en = nonEmpty(game.title_en)
  if (state.lang === 'zh') {
    return {
      primary: cn || en || '—',
      secondary: cn && en && cn !== en ? en : '',
    }
  }
  return {
    primary: en || cn || '—',
    secondary: en && cn ? cn : '',
  }
}

function editionLabel(edition, editionName) {
  const map = t().edition
  return map[edition] || editionName || edition || ''
}

function mediaLabel(media) {
  const map = t().media
  if (!media) return map.physical
  const key = String(media).toLowerCase()
  if (key.includes('cart')) return map.cartridge
  if (key.includes('disc') || key.includes('blu')) return map.disc
  return map[key] || media
}

function placeholderCover(game, hint) {
  const plat = (game.platform || '').toLowerCase()
  const h = hint ?? t().noCover
  return `<div class="cover-placeholder ${escapeHtml(plat)}">
    <span class="plat-mark">${escapeHtml(PLATFORM_LABEL[game.platform] || game.platform)}</span>
    <span class="hint">${escapeHtml(mediaLabel(game.media))} · ${escapeHtml(h)}</span>
  </div>`
}

function isSpecialEdition(game) {
  const ed = String(game?.edition || '').toLowerCase()
  if (['limited', 'collector', 'deluxe', 'ultimate', 'other-special'].includes(ed)) return true
  const name = String(game?.edition_name || '')
  return /limited|collector|deluxe|ultimate|special|限定|典藏|豪华|终极|特别|コレクター|限定版|collector'?s?/i.test(name)
}

function hasEditionExtras(game) {
  const arr = game?.edition_contents
  if (Array.isArray(arr) && arr.some((x) => nonEmpty(x))) return true
  return !!nonEmpty(game?.edition_notes)
}

/** Split notes into bullet lines by ; ； or newlines. */
function splitEditionNotes(notes) {
  const raw = nonEmpty(notes)
  if (!raw) return []
  return raw
    .split(/[;；\n\r]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function editionContentsList(game) {
  const arr = game?.edition_contents
  if (Array.isArray(arr)) {
    const items = arr.map((x) => nonEmpty(x)).filter(Boolean)
    if (items.length) return items
  }
  return splitEditionNotes(game?.edition_notes)
}

/**
 * @param {any} game
 * @param {{ large?: boolean }} [opts]
 */
function coverHtml(game, opts = {}) {
  const { large = false } = opts
  const { primary } = displayTitles(game)
  const cardUrl = nonEmpty(game.cover_url)
  const largeUrl = nonEmpty(game.cover_url_large)
  // Prefer sharp/large art on cards and modal (not only on 2x DPR)
  const src = largeUrl || cardUrl
  if (!src) return placeholderCover(game)

  let srcsetAttr = ''
  if (cardUrl && largeUrl && cardUrl !== largeUrl) {
    srcsetAttr = ` srcset="${escapeHtml(cardUrl)} 400w, ${escapeHtml(largeUrl)} 900w"`
  }
  const sizesAttr = large
    ? ` sizes="(min-width: 700px) 360px, 90vw"`
    : ` sizes="(min-width: 640px) 180px, 40vw"`

  return `<img src="${escapeHtml(src)}"${srcsetAttr}${sizesAttr} alt="${escapeHtml(primary)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-fallback-platform="${escapeHtml(game.platform || '')}" data-fallback-media="${escapeHtml(game.media || '')}" />`
}

function bindCoverFallbacks(root) {
  root.querySelectorAll('img[data-fallback-platform]').forEach((img) => {
    img.addEventListener(
      'error',
      () => {
        const fake = { platform: img.dataset.fallbackPlatform, media: img.dataset.fallbackMedia }
        const wrap = document.createElement('div')
        wrap.innerHTML = placeholderCover(fake, t().coverFailed)
        img.replaceWith(wrap.firstElementChild)
      },
      { once: true },
    )
  })
}

function editionBadgeClass(edition) {
  return `badge badge-edition ${escapeHtml(edition || 'standard')}`
}

function platformBadgeClass(platform) {
  return `badge badge-platform ${escapeHtml((platform || '').toLowerCase())}`
}

function hasDisplayPrice(g) {
  return resolveCnyAmount(g) != null
}

function availableMonthKeys() {
  const set = new Set()
  for (const g of allGames) {
    const ym = (g.release_date || '').slice(0, 7)
    if (/^\d{4}-\d{2}$/.test(ym)) set.add(ym)
  }
  return [...set].sort()
}

function parseMonthKey(key) {
  const [ys, ms] = String(key || '').split('-')
  const y = Number(ys)
  const m = Number(ms)
  if (!y || !m) return null
  return { y, m }
}

function formatMonthKeyLabel(key) {
  const p = parseMonthKey(key)
  if (!p) return key || '—'
  return t().monthLabel(p.y, p.m)
}

function shiftMonthKey(key, delta) {
  const p = parseMonthKey(key)
  if (!p) return currentMonthKey()
  const d = new Date(p.y, p.m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthKeysForYear(year) {
  const prefix = `${year}-`
  return availableMonthKeys().filter((k) => k.startsWith(prefix))
}

function pickMonthForYear(year) {
  const months = monthKeysForYear(year)
  if (!months.length) return null
  const cur = currentMonthKey()
  if (cur.startsWith(`${year}-`) && months.includes(cur)) return cur
  // Prefer latest month in that year
  return months[months.length - 1]
}

function filterGames() {
  const q = state.q.trim().toLowerCase()
  let list = allGames.filter((g) => {
    if (state.tab === 'month') {
      if (!(g.release_date || '').startsWith(state.monthKey)) return false
    } else if (state.tab === 'upcoming') {
      if (!isUpcoming(g)) return false
    }
    if (state.platform && g.platform !== state.platform) return false
    if (state.edition && g.edition !== state.edition) return false
    if (state.hasPrice && !hasDisplayPrice(g)) return false
    if (q) {
      const hay = `${g.title_cn} ${g.title_en} ${g.edition_name} ${g.edition_notes}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
  if (state.tab === 'upcoming') {
    list = [...list].sort((a, b) => String(a.release_date || '').localeCompare(String(b.release_date || '')))
  }
  return list
}

function hasActiveFilters() {
  return !!(state.q.trim() || state.platform || state.edition || state.hasPrice)
}

function groupByYearMonth(games) {
  /** @type {Map<string, Map<string, any[]>>} */
  const years = new Map()
  for (const g of games) {
    const y = (g.release_date || '0000').slice(0, 4)
    const ym = (g.release_date || '').slice(0, 7)
    if (!years.has(y)) years.set(y, new Map())
    const months = years.get(y)
    if (!months.has(ym)) months.set(ym, [])
    months.get(ym).push(g)
  }
  return years
}

function cardHtml(g) {
  const i = t()
  const price = formatPrice(g)
  const edLabel = editionLabel(g.edition, g.edition_name)
  const titles = displayTitles(g)
  const upcoming = isUpcoming(g)
  const secondary = titles.secondary
    ? `<p class="card-title-en">${escapeHtml(titles.secondary)}</p>`
    : ''
  const upcomingBadge = upcoming
    ? `<span class="badge badge-upcoming">${escapeHtml(i.upcomingBadge)}</span>`
    : ''
  const extrasHint =
    isSpecialEdition(g) && hasEditionExtras(g)
      ? `<span class="badge badge-extras" title="${escapeHtml(i.extrasHint)}">${escapeHtml(i.extrasHint)}</span>`
      : ''
  const dateLabel = upcoming && g.release_date
    ? i.upcomingReleaseDay(g.release_date)
    : g.release_date || '—'
  return `<button type="button" class="game-card${upcoming ? ' is-upcoming' : ''}" data-id="${escapeHtml(g.id)}" aria-label="${escapeHtml(titles.primary)}">
    <div class="cover-wrap">
      ${coverHtml(g)}
      <div class="badge-row">
        ${upcomingBadge}
        <span class="${platformBadgeClass(g.platform)}">${escapeHtml(PLATFORM_LABEL[g.platform] || g.platform)}</span>
        <span class="${editionBadgeClass(g.edition)}">${escapeHtml(edLabel)}</span>
        ${extrasHint}
      </div>
    </div>
    <div class="card-body">
      <h3 class="card-title">${escapeHtml(titles.primary)}</h3>
      ${secondary}
      <div class="card-meta">
        <span class="${upcoming ? 'card-date-upcoming' : ''}">${escapeHtml(dateLabel)}</span>
        <div class="card-meta-right">
          ${cardScoreHint(g)}
          <span class="card-price ${price ? '' : 'empty'}">${price ? escapeHtml(price) : escapeHtml(i.priceTbd)}</span>
        </div>
      </div>
    </div>
  </button>`
}

function emptyStateMessage() {
  const i = t()
  if (hasActiveFilters()) return i.emptyFilter
  return state.tab === 'upcoming' ? i.emptyUpcoming : i.emptyMonth
}

function renderList(games) {
  const i = t()
  const root = document.getElementById('catalog')
  root.classList.toggle('catalog-upcoming', state.tab === 'upcoming')
  root.classList.toggle('catalog-month', state.tab === 'month')

  if (!games.length) {
    const emptyClass = state.tab === 'upcoming' ? 'state-panel state-upcoming' : 'state-panel'
    root.innerHTML = `<div class="${emptyClass}">${escapeHtml(emptyStateMessage())}</div>`
    document.getElementById('result-count').textContent = i.resultCount(0)
    return
  }
  document.getElementById('result-count').textContent = i.resultCount(games.length)

  if (state.tab === 'month') {
    const p = parseMonthKey(state.monthKey)
    const monthName = p ? i.month[p.m] || '' : ''
    const html = `<section class="month-view" id="year-${escapeHtml((state.monthKey || '').slice(0, 4))}">
      <div class="month-view-header">
        <h2>${escapeHtml(formatMonthKeyLabel(state.monthKey))}</h2>
        <span>${escapeHtml(i.gamesInYear(games.length))}${monthName ? ` · ${escapeHtml(monthName)}` : ''}</span>
      </div>
      <div class="card-grid">${games.map(cardHtml).join('')}</div>
    </section>`
    root.innerHTML = html
    bindCoverFallbacks(root)
    return
  }

  // Upcoming: ascending by date, group by year ascending
  const grouped = groupByYearMonth(games)
  const yearKeys = [...grouped.keys()].sort((a, b) => a.localeCompare(b))

  let html = `<div class="upcoming-banner" aria-hidden="true"><span class="upcoming-banner-dot"></span>${escapeHtml(i.tabUpcoming)}</div>`
  for (const year of yearKeys) {
    const months = grouped.get(year)
    const monthKeys = [...months.keys()].sort((a, b) => a.localeCompare(b))
    const count = monthKeys.reduce((n, k) => n + months.get(k).length, 0)
    html += `<section class="year-group year-group-upcoming" id="year-${escapeHtml(year)}">
      <div class="year-header">
        <h2>${escapeHtml(year)}</h2>
        <span>${escapeHtml(i.gamesInYear(count))}</span>
      </div>`
    for (const ym of monthKeys) {
      const list = months.get(ym)
      const monthNum = Number((ym || '').slice(5, 7)) || 0
      html += `<div class="month-label month-label-upcoming">${escapeHtml(ym)} · ${escapeHtml(i.month[monthNum] || '')}</div>
        <div class="card-grid">${list.map(cardHtml).join('')}</div>`
    }
    html += `</section>`
  }
  root.innerHTML = html
  bindCoverFallbacks(root)
}


/** Normalize scores array (may be missing / arrive async). */
function getScores(game) {
  const arr = game?.scores
  if (!Array.isArray(arr)) return []
  return arr.filter((s) => s && (s.score != null || nonEmpty(s.score_text) || nonEmpty(s.source)))
}

/**
 * Synopsis follows UI language:
 * ZH → summary_cn then summary_en; EN → summary_en then summary_cn.
 * Empty → caller shows 「暂无简介」 / aboutEmpty.
 */
function pickSynopsis(game) {
  const cn = nonEmpty(game?.summary_cn)
  const en = nonEmpty(game?.summary_en)
  if (state.lang === 'zh') return cn || en || ''
  return en || cn || ''
}

/**
 * Map numeric score to tier for 0–100 scales (or scaled from max).
 * @returns {'high'|'mid'|'low'|'na'}
 */
function scoreTier(score, max) {
  if (score == null || score === '' || Number.isNaN(Number(score))) return 'na'
  const n = Number(score)
  const m = max != null && !Number.isNaN(Number(max)) && Number(max) > 0 ? Number(max) : 100
  const pct = m === 100 ? n : (n / m) * 100
  if (pct >= 75) return 'high'
  if (pct >= 50) return 'mid'
  return 'low'
}

function formatScoreDisplay(entry) {
  const text = nonEmpty(entry?.score_text)
  if (text) return text
  if (entry?.score == null || entry.score === '' || Number.isNaN(Number(entry.score))) return '—'
  const n = Number(entry.score)
  const max = entry.max != null && !Number.isNaN(Number(entry.max)) ? Number(entry.max) : null
  if (max != null && max !== 100) return `${n}/${max}`
  // Prefer integer look when whole number
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10)
}

function preferredOutletLabel(source) {
  const s = String(source || '').trim()
  if (!s) return 'Score'
  // Keep authoritative outlet names readable
  const lower = s.toLowerCase()
  if (lower.includes('metacritic')) return 'Metacritic'
  if (lower.includes('opencritic')) return 'OpenCritic'
  if (lower.includes('ign')) return 'IGN'
  return s
}

function scoresRowHtml(game) {
  const scores = getScores(game)
  if (!scores.length) return ''
  const pills = scores
    .map((entry) => {
      const label = preferredOutletLabel(entry.source)
      const display = formatScoreDisplay(entry)
      const tier = scoreTier(entry.score, entry.max)
      const note = nonEmpty(entry.platform_note)
        ? `<span class="score-note">${escapeHtml(entry.platform_note)}</span>`
        : ''
      const inner = `<span class="score-source">${escapeHtml(label)}</span>
        <span class="score-value">${escapeHtml(display)}</span>
        ${note}`
      const url = nonEmpty(entry.url)
      if (url) {
        return `<a class="score-pill score-${tier}" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`
      }
      return `<div class="score-pill score-${tier}">${inner}</div>`
    })
    .join('')
  return `<div class="scores-row" aria-label="${escapeHtml(t().scoresTitle)}">${pills}</div>`
}

function synopsisHtml(game) {
  const i = t()
  const text = pickSynopsis(game)
  if (text) {
    return `<section class="synopsis-box">
      <h3>${escapeHtml(i.aboutTitle)}</h3>
      <p class="synopsis-text">${escapeHtml(text)}</p>
    </section>`
  }
  return `<section class="synopsis-box synopsis-empty">
    <h3>${escapeHtml(i.aboutTitle)}</h3>
    <p class="synopsis-muted">${escapeHtml(i.aboutEmpty)}</p>
  </section>`
}

function cardScoreHint(game) {
  const scores = getScores(game)
  if (!scores.length) return ''
  // Prefer Metacritic when present, else first entry
  const mc = scores.find((s) => String(s.source || '').toLowerCase().includes('metacritic'))
  const entry = mc || scores[0]
  if (entry.score == null || entry.score === '' || Number.isNaN(Number(entry.score))) return ''
  const tier = scoreTier(entry.score, entry.max)
  const display = formatScoreDisplay(entry)
  return `<span class="card-score score-${tier}" title="${escapeHtml(preferredOutletLabel(entry.source))}">${escapeHtml(display)}</span>`
}

function openModal(game) {
  const i = t()
  const backdrop = document.getElementById('modal-backdrop')
  const price = formatPrice(game)
  const edLabel = editionLabel(game.edition, game.edition_name)
  const titles = displayTitles(game)
  const original = formatOriginalPrice(game)
  const special = isSpecialEdition(game)
  let notes = ''
  let editionContentsBlock = ''
  if (special) {
    const items = editionContentsList(game)
    const listHtml = items.length
      ? `<ul class="edition-contents-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
      : `<p class="edition-contents-empty">${escapeHtml(i.editionContentsEmpty)}</p>`
    editionContentsBlock = `<div class="edition-contents-box">
          <h3>${escapeHtml(i.editionContentsTitle)}</h3>
          ${listHtml}
        </div>`
  } else if (game.edition_notes) {
    notes = `<div class="notes-box"><h3>${escapeHtml(i.notesTitle)}</h3><p>${escapeHtml(game.edition_notes)}</p></div>`
  }

  const priceNoteRow = nonEmpty(game.price_note)
    ? `<dt>${escapeHtml(i.priceNote)}</dt><dd>${escapeHtml(game.price_note)}</dd>`
    : ''
  const originalRow = original
    ? `<dt>${escapeHtml(i.originalPrice)}</dt><dd>${escapeHtml(original)}</dd>`
    : ''
  const secondary = titles.secondary
    ? `<p class="modal-en">${escapeHtml(titles.secondary)}</p>`
    : ''

  document.getElementById('modal-body').innerHTML = `
    <div class="modal-inner">
      <div class="modal-cover">${coverHtml(game, { large: true })}</div>
      <div class="modal-content">
        <button type="button" class="modal-close" id="modal-close" aria-label="${escapeHtml(i.close)}">✕</button>
        <div class="modal-badges">
          ${isUpcoming(game) ? `<span class="badge badge-upcoming">${escapeHtml(i.upcomingBadge)}</span>` : ''}
          <span class="${platformBadgeClass(game.platform)}">${escapeHtml(PLATFORM_LABEL[game.platform] || game.platform)}</span>
          <span class="${editionBadgeClass(game.edition)}">${escapeHtml(edLabel)}${game.edition_name ? ` · ${escapeHtml(game.edition_name)}` : ''}</span>
          <span class="badge badge-edition standard">${escapeHtml(mediaLabel(game.media))}</span>
        </div>
        <h2>${escapeHtml(titles.primary)}</h2>
        ${secondary}
        ${scoresRowHtml(game)}
        ${synopsisHtml(game)}
        <dl class="detail-grid">
          <dt>${escapeHtml(i.releaseDate)}</dt><dd class="${isUpcoming(game) ? 'detail-upcoming-date' : ''}">${escapeHtml(isUpcoming(game) && game.release_date ? i.upcomingReleaseDay(game.release_date) : (game.release_date || '—'))}</dd>
          <dt>${escapeHtml(i.platform)}</dt><dd>${escapeHtml(PLATFORM_LABEL[game.platform] || game.platform)}</dd>
          <dt>${escapeHtml(i.labelMedia)}</dt><dd>${escapeHtml(mediaLabel(game.media) || '—')}</dd>
          <dt>${escapeHtml(i.labelEdition)}</dt><dd>${escapeHtml(game.edition_name || edLabel)}（${escapeHtml(game.edition || '—')}）</dd>
          <dt>${escapeHtml(i.msrp)}</dt><dd>${price ? escapeHtml(price) : escapeHtml(i.priceMissing)}</dd>
          ${originalRow}
          ${priceNoteRow}
          <dt>${escapeHtml(i.regionNote)}</dt><dd>${escapeHtml(game.region_note || '—')}</dd>
        </dl>
        ${editionContentsBlock}
        ${notes}
      </div>
    </div>`
  bindCoverFallbacks(document.getElementById('modal-body'))

  backdrop.classList.add('open')
  backdrop.setAttribute('aria-hidden', 'false')
  document.body.style.overflow = 'hidden'
  document.getElementById('modal-close').focus()
}

function closeModal() {
  const backdrop = document.getElementById('modal-backdrop')
  if (!backdrop) return
  backdrop.classList.remove('open')
  backdrop.setAttribute('aria-hidden', 'true')
  document.body.style.overflow = ''
}

function applyAndRender() {
  renderList(filterGames())
}

function yearsFromGames(games, ascending = false) {
  const years = [...new Set(games.map((g) => (g.release_date || '').slice(0, 4)).filter(Boolean))]
  years.sort((a, b) => (ascending ? a.localeCompare(b) : b.localeCompare(a)))
  return years
}

function buildYearNav() {
  if (state.tab === 'upcoming') {
    const upcoming = allGames.filter((g) => isUpcoming(g))
    const years = yearsFromGames(upcoming, true)
    return years
      .map((y) => `<a href="#year-${escapeHtml(y)}" data-year-nav="${escapeHtml(y)}">${escapeHtml(y)}</a>`)
      .join('')
  }
  const years = yearsFromGames(allGames, false)
  return years
    .map((y) => {
      const active = state.monthKey.startsWith(`${y}-`)
      return `<button type="button" class="year-pill${active ? ' active' : ''}" data-year-jump="${escapeHtml(y)}">${escapeHtml(y)}</button>`
    })
    .join('')
}

function updateYearNav() {
  const yearNav = document.getElementById('year-nav')
  if (!yearNav) return
  const i = t()
  yearNav.setAttribute('aria-label', i.yearNavAria)
  yearNav.innerHTML = buildYearNav()
  yearNav.hidden = state.tab === 'upcoming' && !yearNav.innerHTML.trim()
}

function updateCatalogTabs() {
  const i = t()
  const tabs = document.getElementById('catalog-tabs')
  if (!tabs) return
  const upcomingCount = state.stats?.upcoming ?? allGames.filter((g) => isUpcoming(g)).length
  tabs.querySelectorAll('[data-tab]').forEach((btn) => {
    const on = btn.dataset.tab === state.tab
    btn.classList.toggle('active', on)
    btn.setAttribute('aria-selected', String(on))
  })
  const monthBtn = tabs.querySelector('[data-tab="month"]')
  const upBtn = tabs.querySelector('[data-tab="upcoming"]')
  if (monthBtn) {
    monthBtn.setAttribute('aria-label', i.tabMonthAria)
    const label = monthBtn.querySelector('.tab-label')
    if (label) label.textContent = i.tabMonth
  }
  if (upBtn) {
    upBtn.setAttribute('aria-label', i.tabUpcomingAria)
    const label = upBtn.querySelector('.tab-label')
    if (label) label.textContent = i.tabUpcoming
    const badge = upBtn.querySelector('.tab-badge')
    if (badge) badge.textContent = String(upcomingCount)
  }
  document.getElementById('app')?.classList.toggle('tab-upcoming', state.tab === 'upcoming')
  document.getElementById('app')?.classList.toggle('tab-month', state.tab === 'month')
}

function updateMonthNav() {
  const wrap = document.getElementById('month-nav')
  if (!wrap) return
  const i = t()
  const show = state.tab === 'month'
  wrap.hidden = !show
  if (!show) return

  const months = availableMonthKeys()
  // Clamp prev/next to months present in catalog data
  const prevDisabled = months.length ? state.monthKey <= months[0] : false
  const nextDisabled = months.length ? state.monthKey >= months[months.length - 1] : false

  wrap.setAttribute('aria-label', i.monthNavAria)
  const labelEl = document.getElementById('month-nav-label')
  if (labelEl) labelEl.textContent = formatMonthKeyLabel(state.monthKey)

  const prevBtn = document.getElementById('month-prev')
  const nextBtn = document.getElementById('month-next')
  if (prevBtn) {
    prevBtn.disabled = prevDisabled
    prevBtn.setAttribute('aria-label', i.monthPrev)
    prevBtn.title = i.monthPrev
  }
  if (nextBtn) {
    nextBtn.disabled = nextDisabled
    nextBtn.setAttribute('aria-label', i.monthNext)
    nextBtn.title = i.monthNext
  }

  const select = document.getElementById('month-select')
  if (select) {
    select.setAttribute('aria-label', i.monthJump)
    const opts = months.length ? months : [state.monthKey]
    select.innerHTML = opts
      .map((k) => {
        const p = parseMonthKey(k)
        const label = p ? i.monthOption(p.y, p.m) : k
        return `<option value="${escapeHtml(k)}"${k === state.monthKey ? ' selected' : ''}>${escapeHtml(label)}</option>`
      })
      .join('')
    if (!months.includes(state.monthKey) && state.monthKey) {
      // ensure current key selectable even if no games that month
      select.insertAdjacentHTML(
        'afterbegin',
        `<option value="${escapeHtml(state.monthKey)}" selected>${escapeHtml(formatMonthKeyLabel(state.monthKey))}</option>`,
      )
    }
    select.value = state.monthKey
  }
}

function setTab(tab) {
  if (tab !== 'month' && tab !== 'upcoming') return
  state.tab = tab
  saveTab(tab)
  updateCatalogTabs()
  updateMonthNav()
  updateYearNav()
  applyAndRender()
}

function setMonthKey(key) {
  if (!/^\d{4}-\d{2}$/.test(key)) return
  state.monthKey = key
  if (state.tab !== 'month') {
    state.tab = 'month'
    saveTab('month')
  }
  updateCatalogTabs()
  updateMonthNav()
  updateYearNav()
  applyAndRender()
}

function syncLangToggle() {
  const root = document.getElementById('lang-toggle')
  if (!root) return
  root.querySelectorAll('[data-lang]').forEach((btn) => {
    const on = btn.dataset.lang === state.lang
    btn.classList.toggle('active', on)
    btn.setAttribute('aria-pressed', String(on))
  })
}

function refreshChrome() {
  const i = t()
  document.documentElement.lang = i.htmlLang

  const badge = document.getElementById('hero-badge')
  const title = document.getElementById('hero-title')
  const sub = document.getElementById('hero-sub')
  const stats = document.getElementById('hero-stats')
  const yearNav = document.getElementById('year-nav')
  const search = document.getElementById('search')
  const plat = document.getElementById('filter-platform')
  const ed = document.getElementById('filter-edition')
  const priceBtn = document.getElementById('filter-price')
  const clickHint = document.getElementById('click-hint')
  const footer = document.getElementById('site-footer')

  if (badge) badge.textContent = i.heroBadge
  if (title) title.textContent = i.heroTitle
  if (sub) sub.textContent = i.heroSub
  if (stats && state.stats) {
    const s = state.stats
    stats.innerHTML = `
      <span>${i.statTotal(s.total)}</span>
      <span>${i.statPs(s.ps)}</span>
      <span>${i.statNs(s.ns)}</span>
      <span>${i.statNs2(s.ns2)}</span>
      <span>${i.statPriced(s.priced)}</span>
      <span>${i.statUpcoming(s.upcoming)}</span>`
  }
  if (yearNav) yearNav.setAttribute('aria-label', i.yearNavAria)
  if (search) {
    search.placeholder = i.searchPlaceholder
  }
  if (plat) {
    const v = plat.value
    plat.setAttribute('aria-label', i.platformAria)
    plat.innerHTML = `
      <option value="">${escapeHtml(i.allPlatforms)}</option>
      <option value="PS5">PS5</option>
      <option value="PS4">PS4</option>
      <option value="NS">Switch</option>
      <option value="NS2">Switch 2</option>`
    plat.value = v
  }
  if (ed) {
    const v = ed.value
    ed.setAttribute('aria-label', i.editionAria)
    ed.innerHTML = `
      <option value="">${escapeHtml(i.allEditions)}</option>
      <option value="standard">${escapeHtml(i.edition.standard)}</option>
      <option value="limited">${escapeHtml(i.edition.limited)}</option>
      <option value="collector">${escapeHtml(i.edition.collector)}</option>
      <option value="deluxe">${escapeHtml(i.edition.deluxe)}</option>
      <option value="ultimate">${escapeHtml(i.edition.ultimate)}</option>
      <option value="other">${escapeHtml(i.edition.other)}</option>`
    ed.value = v
  }
  if (priceBtn) {
    priceBtn.textContent = i.hasPrice
    priceBtn.classList.toggle('active', state.hasPrice)
    priceBtn.setAttribute('aria-pressed', String(state.hasPrice))
  }
  if (clickHint) clickHint.textContent = i.clickHint
  updateCatalogTabs()
  updateMonthNav()
  updateYearNav()
  if (footer) {
    footer.innerHTML = `
      <p>${i.footerDisclaimer}</p>
      <p>${i.footerCovers}</p>
      <p class="footer-fx">${escapeHtml(i.footerFx)}</p>
      <p>${i.footerData}</p>`
  }

  syncLangToggle()
  applyAndRender()

  // Re-open modal content in new language if still open
  const backdrop = document.getElementById('modal-backdrop')
  if (backdrop?.classList.contains('open')) {
    const id = backdrop.dataset.openId
    const game = allGames.find((g) => g.id === id)
    if (game) openModal(game)
  }
}

function setLang(lang) {
  if (lang !== 'zh' && lang !== 'en') return
  state.lang = lang
  saveLang(lang)
  refreshChrome()
}

function mountShell(stats) {
  state.stats = stats
  const i = t()
  document.documentElement.lang = i.htmlLang

  document.getElementById('app').innerHTML = `
    <div class="topbar">
      <div class="topbar-inner">
        <span class="topbar-brand">PHYSICAL CATALOG</span>
        <div class="lang-toggle" id="lang-toggle" role="group" aria-label="Language">
          <button type="button" data-lang="zh" aria-pressed="${state.lang === 'zh'}">ZH</button>
          <button type="button" data-lang="en" aria-pressed="${state.lang === 'en'}">EN</button>
        </div>
      </div>
    </div>

    <header class="hero">
      <div class="hero-badge" id="hero-badge">${escapeHtml(i.heroBadge)}</div>
      <h1 id="hero-title">${escapeHtml(i.heroTitle)}</h1>
      <p class="hero-sub" id="hero-sub">${escapeHtml(i.heroSub)}</p>
      <div class="hero-stats" id="hero-stats">
        <span>${i.statTotal(stats.total)}</span>
        <span>${i.statPs(stats.ps)}</span>
        <span>${i.statNs(stats.ns)}</span>
        <span>${i.statNs2(stats.ns2)}</span>
        <span>${i.statPriced(stats.priced)}</span>
        <span>${i.statUpcoming(stats.upcoming)}</span>
      </div>
      <nav class="year-nav" id="year-nav" aria-label="${escapeHtml(i.yearNavAria)}"></nav>
    </header>

    <div class="view-controls">
      <div class="view-controls-inner">
        <div class="catalog-tabs" id="catalog-tabs" role="tablist" aria-label="Catalog views">
          <button type="button" class="catalog-tab${state.tab === 'month' ? ' active' : ''}" role="tab" data-tab="month" aria-selected="${state.tab === 'month'}" aria-label="${escapeHtml(i.tabMonthAria)}">
            <span class="tab-label">${escapeHtml(i.tabMonth)}</span>
          </button>
          <button type="button" class="catalog-tab catalog-tab-upcoming${state.tab === 'upcoming' ? ' active' : ''}" role="tab" data-tab="upcoming" aria-selected="${state.tab === 'upcoming'}" aria-label="${escapeHtml(i.tabUpcomingAria)}">
            <span class="tab-label">${escapeHtml(i.tabUpcoming)}</span>
            <span class="tab-badge">${stats.upcoming}</span>
          </button>
        </div>
        <div class="month-nav" id="month-nav" role="group" aria-label="${escapeHtml(i.monthNavAria)}" ${state.tab !== 'month' ? 'hidden' : ''}>
          <button type="button" class="month-nav-btn" id="month-prev" aria-label="${escapeHtml(i.monthPrev)}">◀</button>
          <div class="month-nav-current">
            <span class="month-nav-label" id="month-nav-label">${escapeHtml(formatMonthKeyLabel(state.monthKey))}</span>
            <select id="month-select" class="month-select" aria-label="${escapeHtml(i.monthJump)}"></select>
          </div>
          <button type="button" class="month-nav-btn" id="month-next" aria-label="${escapeHtml(i.monthNext)}">▶</button>
        </div>
      </div>
    </div>

    <div class="toolbar-wrap">
      <div class="toolbar">
        <div class="search-box">
          <span class="icon" aria-hidden="true">⌕</span>
          <input type="search" id="search" placeholder="${escapeHtml(i.searchPlaceholder)}" autocomplete="off" />
        </div>
        <div class="filter-group">
          <select id="filter-platform" aria-label="${escapeHtml(i.platformAria)}">
            <option value="">${escapeHtml(i.allPlatforms)}</option>
            <option value="PS5">PS5</option>
            <option value="PS4">PS4</option>
            <option value="NS">Switch</option>
            <option value="NS2">Switch 2</option>
          </select>
          <select id="filter-edition" aria-label="${escapeHtml(i.editionAria)}">
            <option value="">${escapeHtml(i.allEditions)}</option>
            <option value="standard">${escapeHtml(i.edition.standard)}</option>
            <option value="limited">${escapeHtml(i.edition.limited)}</option>
            <option value="collector">${escapeHtml(i.edition.collector)}</option>
            <option value="deluxe">${escapeHtml(i.edition.deluxe)}</option>
            <option value="ultimate">${escapeHtml(i.edition.ultimate)}</option>
            <option value="other">${escapeHtml(i.edition.other)}</option>
          </select>
          <button type="button" class="chip" id="filter-price" aria-pressed="false">${escapeHtml(i.hasPrice)}</button>
        </div>
      </div>
    </div>

    <div class="result-meta">
      <span id="result-count"></span>
      <span id="click-hint">${escapeHtml(i.clickHint)}</span>
    </div>

    <main id="catalog"></main>

    <footer id="site-footer">
      <p>${i.footerDisclaimer}</p>
      <p>${i.footerCovers}</p>
      <p class="footer-fx">${escapeHtml(i.footerFx)}</p>
      <p>${i.footerData}</p>
    </footer>

    <div class="modal-backdrop" id="modal-backdrop" aria-hidden="true" role="dialog" aria-modal="true">
      <div class="modal" id="modal-body"></div>
    </div>
  `

  syncLangToggle()
  updateCatalogTabs()
  updateMonthNav()
  updateYearNav()

  document.getElementById('lang-toggle').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang]')
    if (!btn) return
    setLang(btn.dataset.lang)
  })

  document.getElementById('catalog-tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]')
    if (!btn) return
    setTab(btn.dataset.tab)
  })

  document.getElementById('month-prev').addEventListener('click', () => {
    const months = availableMonthKeys()
    const idx = months.indexOf(state.monthKey)
    if (idx > 0) {
      setMonthKey(months[idx - 1])
      return
    }
    // Free-step when key not in list but still before first
    const prev = shiftMonthKey(state.monthKey, -1)
    if (!months.length || prev >= months[0] || months.includes(prev)) setMonthKey(prev)
    else if (months.length) setMonthKey(months[0])
  })
  document.getElementById('month-next').addEventListener('click', () => {
    const months = availableMonthKeys()
    const idx = months.indexOf(state.monthKey)
    if (idx >= 0 && idx < months.length - 1) {
      setMonthKey(months[idx + 1])
      return
    }
    const next = shiftMonthKey(state.monthKey, 1)
    if (!months.length || next <= months[months.length - 1] || months.includes(next)) setMonthKey(next)
    else if (months.length) setMonthKey(months[months.length - 1])
  })
  document.getElementById('month-select').addEventListener('change', (e) => {
    setMonthKey(e.target.value)
  })

  document.getElementById('year-nav').addEventListener('click', (e) => {
    const jump = e.target.closest('[data-year-jump]')
    if (jump) {
      e.preventDefault()
      const ym = pickMonthForYear(jump.dataset.yearJump)
      if (ym) setMonthKey(ym)
      return
    }
    // upcoming year anchors: let default hash scroll work
  })

  document.getElementById('search').addEventListener('input', (e) => {
    state.q = e.target.value
    applyAndRender()
  })
  document.getElementById('filter-platform').addEventListener('change', (e) => {
    state.platform = e.target.value
    applyAndRender()
  })
  document.getElementById('filter-edition').addEventListener('change', (e) => {
    state.edition = e.target.value
    applyAndRender()
  })
  const priceBtn = document.getElementById('filter-price')
  priceBtn.addEventListener('click', () => {
    state.hasPrice = !state.hasPrice
    priceBtn.classList.toggle('active', state.hasPrice)
    priceBtn.setAttribute('aria-pressed', String(state.hasPrice))
    applyAndRender()
  })

  document.getElementById('catalog').addEventListener('click', (e) => {
    const card = e.target.closest('.game-card')
    if (!card) return
    const game = allGames.find((g) => g.id === card.dataset.id)
    if (game) {
      document.getElementById('modal-backdrop').dataset.openId = game.id
      openModal(game)
    }
  })

  const backdrop = document.getElementById('modal-backdrop')
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop || e.target.id === 'modal-close' || e.target.closest('#modal-close')) {
      closeModal()
    }
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal()
  })
}

async function boot() {
  document.getElementById('app').innerHTML = `<div class="state-panel">${escapeHtml(t().loading)}</div>`
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/games.json`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    allGames = await res.json()
    if (!Array.isArray(allGames)) throw new Error('games.json must be an array')
    allGames.sort((a, b) => String(b.release_date).localeCompare(String(a.release_date)))

    const stats = {
      total: allGames.length,
      ps: allGames.filter((g) => g.platform === 'PS5' || g.platform === 'PS4').length,
      ns: allGames.filter((g) => g.platform === 'NS').length,
      ns2: allGames.filter((g) => g.platform === 'NS2').length,
      priced: allGames.filter((g) => hasDisplayPrice(g)).length,
      upcoming: allGames.filter((g) => isUpcoming(g)).length,
    }
    mountShell(stats)
    applyAndRender()
  } catch (err) {
    document.getElementById('app').innerHTML = `<div class="state-panel error">${escapeHtml(t().loadError(err.message))}</div>`
  }
}

boot()
