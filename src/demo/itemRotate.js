import * as THREE from 'three'
/**
 * Object-centred inspection: the camera and the room stay put, the user turns the ITEM.
 * 1 finger / left drag → yaw (unbounded, around world up) + pitch (around the camera's horizontal axis, clamped),
 * with inertia. Wheel / pinch → move item toward/away from the camera. Two-finger drag, right- or shift-drag → pan.
 * Call update(dt) every frame; read quaternion() / offset() and apply them to the active object.
 */
export class ItemRotator {
  constructor(dom, camera, o = {}) {
    Object.assign(this, { dom, camera, enabled: false, yaw: 0, pitch: 0, yawT: 0, pitchT: 0, vy: 0, vp: 0, zoom: 0, zoomT: 0, pan: new THREE.Vector2(), panT: new THREE.Vector2(),
      pitchMax: o.pitchMax ?? 1.35, zoomMin: o.zoomMin ?? -0.45, zoomMax: o.zoomMax ?? 0.55, panMax: o.panMax ?? 0.35, speed: o.speed ?? 0.0085, resetting: false, dragging: false, onInput: o.onInput || (() => {}) })
    this.ptrs = new Map(); this._last = 0
    const opt = { passive: false }
    dom.addEventListener('pointerdown', (e) => this._down(e)); addEventListener('pointermove', (e) => this._move(e), opt)
    addEventListener('pointerup', (e) => this._up(e)); addEventListener('pointercancel', (e) => this._up(e))
    dom.addEventListener('wheel', (e) => { if (!this.enabled) return; e.preventDefault(); this.resetting = false; this.zoomT = THREE.MathUtils.clamp(this.zoomT - e.deltaY * 0.0011, this.zoomMin, this.zoomMax); this.onInput() }, opt)
    dom.addEventListener('contextmenu', (e) => { if (this.enabled) e.preventDefault() })
    dom.style.touchAction = 'none'
  }
  _down(e) { if (!this.enabled) return; try { this.dom.setPointerCapture(e.pointerId) } catch {} this.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, b: e.button, sh: e.shiftKey }); this.dragging = true; this.resetting = false; this.vy = this.vp = 0; this._last = performance.now(); this._pinch = null }
  _move(e) {
    const p = this.ptrs.get(e.pointerId); if (!p || !this.enabled) return
    const dx = e.clientX - p.x, dy = e.clientY - p.y, now = performance.now(), dts = Math.max(8, now - this._last) / 1000
    p.x = e.clientX; p.y = e.clientY; this._last = now
    const h = this.dom.clientHeight || innerHeight
    if (this.ptrs.size >= 2) { // pinch zoom + two-finger pan
      const [a, b] = [...this.ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y), m = [(a.x + b.x) / 2, (a.y + b.y) / 2]
      if (this._pinch) { this.zoomT = THREE.MathUtils.clamp(this.zoomT + (d - this._pinch.d) / h * 1.2, this.zoomMin, this.zoomMax); this._panBy((m[0] - this._pinch.m[0]) / h, (m[1] - this._pinch.m[1]) / h) }
      this._pinch = { d, m }; this.onInput(); return
    }
    if (p.b === 2 || p.sh) { this._panBy(dx / h, dy / h); this.onInput(); return }
    const ay = dx * this.speed, ap = dy * this.speed
    // pointer events only move the TARGET; the rendered pose follows it in rAF with frame-time damping (smooth on uneven event rates)
    this.yawT += ay; this.pitchT = THREE.MathUtils.clamp(this.pitchT + ap, -this.pitchMax, this.pitchMax)
    this.vy = THREE.MathUtils.lerp(this.vy, ay / dts, 0.5); this.vp = THREE.MathUtils.lerp(this.vp, ap / dts, 0.5); this.onInput()
  }
  _panBy(x, y) { this.panT.x = THREE.MathUtils.clamp(this.panT.x + x * 1.4, -this.panMax, this.panMax); this.panT.y = THREE.MathUtils.clamp(this.panT.y - y * 1.4, -this.panMax * 0.7, this.panMax * 0.7) }
  _up(e) { if (!this.ptrs.delete(e.pointerId)) return; this._pinch = null; if (!this.ptrs.size) { this.dragging = false; if (performance.now() - this._last > 90) this.vy = this.vp = 0 } }
  /** animated return to the default pose */
  reset() { this.resetting = true; this.vy = this.vp = 0; const w = Math.atan2(Math.sin(this.yawT), Math.cos(this.yawT)); this.yaw += w - this.yawT; this.yawT = w }
  /** set pose directly (tests / deep links) */
  set(y, p = 0) { this.yaw = this.yawT = y; this.pitch = this.pitchT = p; this.vy = this.vp = 0; this.resetting = false }
  resetNow() { this.yaw = this.pitch = this.yawT = this.pitchT = this.vy = this.vp = this.zoom = this.zoomT = 0; this.pan.set(0, 0); this.panT.set(0, 0); this.resetting = false }
  get idle() { return Math.abs(this.yaw) + Math.abs(this.pitch) + Math.abs(this.yawT) + Math.abs(this.pitchT) + Math.abs(this.zoom) + this.pan.length() < 0.002 }
  /** user is interacting or the item is still settling (inertia / damping / reset) */
  get active() { return this.dragging || this.resetting || this.vy !== 0 || this.vp !== 0 || Math.abs(this.yawT - this.yaw) + Math.abs(this.pitchT - this.pitch) > 1e-4 }
  /** advance inertia / damping; returns true while anything is still moving */
  update(dt) {
    const y0 = this.yaw, p0 = this.pitch, z0 = this.zoom, px0 = this.pan.x, py0 = this.pan.y
    if (this.resetting) {
      const k = 1 - Math.exp(-dt * 7); this.yawT *= 1 - k; this.pitchT *= 1 - k; this.zoomT = 0; this.panT.set(0, 0)
      if (Math.abs(this.yawT) + Math.abs(this.pitchT) + Math.abs(this.yaw) + Math.abs(this.pitch) < 1e-3) { this.yaw = this.pitch = this.yawT = this.pitchT = 0; this.resetting = false }
    } else if (!this.dragging) {
      this.yawT += this.vy * dt; this.pitchT += this.vp * dt
      if (Math.abs(this.pitchT) > this.pitchMax) { this.pitchT = Math.sign(this.pitchT) * this.pitchMax; this.vp = 0 }
      const d = Math.exp(-dt * 4.5); this.vy *= d; this.vp *= d; if (Math.abs(this.vy) + Math.abs(this.vp) < 0.01) this.vy = this.vp = 0
    }
    const f = 1 - Math.exp(-dt * 22); this.yaw += (this.yawT - this.yaw) * f; this.pitch += (this.pitchT - this.pitch) * f
    if (Math.abs(this.yawT - this.yaw) + Math.abs(this.pitchT - this.pitch) < 1e-5) { this.yaw = this.yawT; this.pitch = this.pitchT }
    const k = 1 - Math.exp(-dt * 10); this.zoom += (this.zoomT - this.zoom) * k; this.pan.lerp(this.panT, k)
    return Math.abs(this.yaw - y0) + Math.abs(this.pitch - p0) + Math.abs(this.zoom - z0) + Math.abs(this.pan.x - px0) + Math.abs(this.pan.y - py0) > 1e-5
  }
  /** world-space rotation to pre-multiply onto the item's base orientation */
  quaternion(out = new THREE.Quaternion()) {
    const right = _r.set(1, 0, 0).applyQuaternion(this.camera.quaternion); right.y = 0; if (right.lengthSq() < 1e-6) right.set(1, 0, 0); right.normalize()
    return out.setFromAxisAngle(right, this.pitch).multiply(_qy.setFromAxisAngle(_up, this.yaw))
  }
  /** world-space translation for an item whose resting centre is `center` */
  offset(center, out = new THREE.Vector3()) {
    const toCam = _t.copy(this.camera.position).sub(center), dist = toCam.length(); toCam.normalize()
    _r.set(1, 0, 0).applyQuaternion(this.camera.quaternion); _u.set(0, 1, 0).applyQuaternion(this.camera.quaternion)
    return out.copy(toCam).multiplyScalar(this.zoom * dist).addScaledVector(_r, this.pan.x * dist * 0.6).addScaledVector(_u, this.pan.y * dist * 0.6)
  }
}
const _r = new THREE.Vector3(), _u = new THREE.Vector3(), _t = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0), _qy = new THREE.Quaternion()
