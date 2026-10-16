// Tiny IndexedDB wrapper — everything stays on the device.
const DB = 'game-showcase', STORE = 'entries'
let _db
function open() {
  if (_db) return _db
  _db = new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1)
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id' })
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error)
  })
  return _db
}
async function tx(mode, fn) {
  const db = await open()
  return new Promise((res, rej) => {
    const t = db.transaction(STORE, mode), st = t.objectStore(STORE); let out
    Promise.resolve(fn(st)).then((v) => (out = v))
    t.oncomplete = () => res(out); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error)
  })
}
const req = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error) })
export const db = {
  all: () => tx('readonly', (st) => req(st.getAll())).then((a) => a.sort((x, y) => (x.order ?? 0) - (y.order ?? 0))),
  put: (e) => tx('readwrite', (st) => req(st.put(e))),
  del: (id) => tx('readwrite', (st) => req(st.delete(id))),
  putMany: (list) => tx('readwrite', (st) => Promise.all(list.map((e) => req(st.put(e))))),
}
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

const toDataURL = (b) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(b) })
const fromDataURL = async (u) => (await fetch(u)).blob()
export async function exportCollection(entries) {
  const out = []
  for (const e of entries) {
    const slots = {}
    for (const [k, v] of Object.entries(e.slots || {})) slots[k] = v && v.blob ? { ...v, blob: await toDataURL(v.blob) } : v
    out.push({ ...e, slots })
  }
  return new Blob([JSON.stringify({ app: 'game-showcase', version: 1, exportedAt: new Date().toISOString(), entries: out })], { type: 'application/json' })
}
export async function importCollection(file, existing) {
  const data = JSON.parse(await file.text())
  if (!data || data.app !== 'game-showcase' || !Array.isArray(data.entries)) throw new Error('bad file')
  const ids = new Set(existing.map((e) => e.id)); let order = existing.length
  const list = []
  for (const e of data.entries) {
    if (e.sample && ids.has(e.id)) continue
    const slots = {}
    for (const [k, v] of Object.entries(e.slots || {})) slots[k] = v && typeof v.blob === 'string' ? { ...v, blob: await fromDataURL(v.blob) } : v
    list.push({ ...e, id: ids.has(e.id) ? uid() : e.id, order: order++, slots })
  }
  await db.putMany(list); return list.length
}
