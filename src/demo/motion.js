// Velocity-continuous motion primitives (shared by the showcase and box-demo).
// Every animated quantity carries its own state (value, velocity, acceleration). A new goal never restarts from rest:
// the next segment is a quintic that starts from the CURRENT value, velocity and acceleration and lands with zero
// velocity and zero acceleration (minimum-jerk), so position, velocity and acceleration stay continuous through
// re-targets, interruptions and hand-overs. SecondOrderDynamics (critically damped spring) follows free targets.
import * as THREE from 'three'

/** quintic from (p0, v0, a0) to (p1, 0, 0) over T seconds → evaluator (t) → [x, v, a] */
export function quintic(p0, v0, a0, p1, T) {
  const D = p1 - p0, V = v0 * T, A = a0 * T * T
  const c3 = 10 * D - 6 * V - 1.5 * A, c4 = -15 * D + 8 * V + 1.5 * A, c5 = 6 * D - 3 * V - 0.5 * A
  return (t) => {
    const s = Math.min(1, Math.max(0, t / T)), s2 = s * s, s3 = s2 * s
    if (s >= 1) return [p1, 0, 0]
    const x = p0 + V * s + 0.5 * A * s2 + c3 * s3 + c4 * s3 * s + c5 * s3 * s2
    const v = (V + A * s + 3 * c3 * s2 + 4 * c4 * s3 + 5 * c5 * s3 * s) / T
    const a = (A + 6 * c3 * s + 12 * c4 * s2 + 20 * c5 * s3) / (T * T)
    return [x, v, a]
  }
}
/** smootherstep: C2 0→1 ramp */
export const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * t * (t * (t * 6 - 15) + 10) }

/** One scalar channel. `to(goal, dur, delay)` plans a quintic from the current (x, v, a). While delayed it holds still
 *  (only used for channels at rest). `step(dt)` advances; returns true while moving. */
export class Mover {
  constructor(x = 0) { this.x = x; this.v = 0; this.a = 0; this.goal = x; this.f = null; this.t = 0; this.delay = 0; this.T = 0; this.tag = null }
  get active() { return !!this.f }
  set(x) { this.x = this.goal = this._out = x; this.v = this.a = 0; this.f = null }
  to(goal, dur, delay = 0, tag = null) {
    if (!this.f && Math.abs(goal - this.x) < 1e-6 && Math.abs(this.v) < 1e-6) { this.set(goal); return this }
    this.goal = goal; this.T = Math.max(0.04, dur); this.delay = Math.abs(this.v) > 1e-4 ? 0 : delay; this.t = 0; this.tag = tag
    this.f = quintic(this.x, this.v, this.a, goal, this.T); return this
  }
  step(dt) {
    if (!this.f) return false
    if (this.delay > 0) { this.delay -= dt; if (this.delay > 0) return true; dt = -this.delay; this.delay = 0 }
    this.t += dt; const [x, v, a] = this.f(this.t); this.x = x; this.v = v; this.a = a
    if (this.t >= this.T) { this.x = this.goal; this.v = this.a = 0; this.f = null }
    return true
  }
}
/** vector version (camera position / target): per-component quintic, continuous velocity vector */
export class Mover3 {
  constructor(v = new THREE.Vector3()) { this.m = [new Mover(v.x), new Mover(v.y), new Mover(v.z)] }
  get active() { return this.m.some((m) => m.active) }
  set(p, vel = null) { this.m.forEach((m, i) => { m.set(p.getComponent(i)); if (vel) m.v = vel.getComponent(i) }) }
  to(p, dur, delay = 0) { this.m.forEach((m, i) => m.to(p.getComponent(i), dur, delay)) }
  step(dt) { let a = false; for (const m of this.m) a = m.step(dt) || a; return a }
  get(out) { return out.set(this.m[0].x, this.m[1].x, this.m[2].x) }
  vel(out) { return out.set(this.m[0].v, this.m[1].v, this.m[2].v) }
}
/** Second-order dynamics (f: natural frequency Hz, z: damping ratio, r: initial response) on a Vector3 */
export class SOD3 {
  constructor(f, z, r, x0) { this.setK(f, z, r); this.xp = x0.clone(); this.y = x0.clone(); this.yd = new THREE.Vector3(); this._xd = new THREE.Vector3(); this._t = new THREE.Vector3() }
  setK(f, z, r) { this.k1 = z / (Math.PI * f); this.k2 = 1 / ((2 * Math.PI * f) ** 2); this.k3 = (r * z) / (2 * Math.PI * f) }
  reset(x, v = null) { this.xp.copy(x); this.y.copy(x); if (v) this.yd.copy(v); else this.yd.set(0, 0, 0) }
  update(T, x) {
    if (T <= 0) return this.y
    const xd = this._xd.copy(x).sub(this.xp).divideScalar(T); this.xp.copy(x)
    const k2 = Math.max(this.k2, (T * T) / 2 + (T * this.k1) / 2, T * this.k1)
    this.y.addScaledVector(this.yd, T)
    this._t.copy(x).addScaledVector(xd, this.k3).sub(this.y).addScaledVector(this.yd, -this.k1).multiplyScalar(T / k2)
    this.yd.add(this._t); return this.y
  }
}
/** Bézier curve of any degree (de Casteljau). Three colinear control points at an end = zero curvature there, which is
 *  how paths join a straight slide without an acceleration (curvature) jump. */
export class BezierN extends THREE.Curve {
  constructor(pts) { super(); this.pts = pts.map((p) => p.clone()); this._w = pts.map((p) => p.clone()); this.arcLengthDivisions = 400 }
  getPoint(t, out = new THREE.Vector3()) {
    const w = this._w; for (let i = 0; i < w.length; i++) w[i].copy(this.pts[i])
    for (let n = w.length - 1; n > 0; n--) for (let i = 0; i < n; i++) w[i].lerp(w[i + 1], t)
    return out.copy(w[0])
  }
}
