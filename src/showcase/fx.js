// Delete / restore particle burst: soft additive sparkles that scatter from (delete) or gather into (undo) an item's footprint.
// One pre-built Points object (no shader recompiles, no allocation per use); driven by the caller with a 0→1 progress.
import * as THREE from 'three'
const N = 110
export function createBurst(scene) {
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(N * 3), al = new Float32Array(N), sz = new Float32Array(N)
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aA', new THREE.BufferAttribute(al, 1)); geo.setAttribute('aS', new THREE.BufferAttribute(sz, 1))
  const mat = new THREE.ShaderMaterial({
    uniforms: { uC: { value: new THREE.Color(1, 1, 1) }, uPR: { value: 1 } },
    vertexShader: 'attribute float aA; attribute float aS; uniform float uPR; varying float vA; void main(){ vA = aA; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = aS * uPR * 90.0 / max(0.5, -mv.z); }',
    fragmentShader: 'uniform vec3 uC; varying float vA; void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = smoothstep(1.0, 0.0, d); a *= a; gl_FragColor = vec4(uC * a * vA, a * vA); }',
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  })
  mat.userData.noAO = true
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.visible = false; pts.renderOrder = 50; scene.add(pts)
  const dir = [], r0 = [], delay = new Float32Array(N), spd = new Float32Array(N), seed = new Float32Array(N)
  for (let i = 0; i < N; i++) { dir.push(new THREE.Vector3()); r0.push(new THREE.Vector3()) }
  const c = new THREE.Vector3(), sz3 = new THREE.Vector3()
  let k = 0, rev = false
  const fx = {
    points: pts, active: false,
    /** centre / footprint (w,h,d) / colour; reverse = gather instead of scatter */
    start(center, size, color, reverse = false) {
      c.copy(center); sz3.copy(size); rev = reverse; mat.uniforms.uC.value.set(color)
      for (let i = 0; i < N; i++) {
        r0[i].set((Math.random() - 0.5) * size.x, (Math.random() - 0.5) * size.y, (Math.random() - 0.5) * size.z * 0.6)
        dir[i].set(r0[i].x / Math.max(1e-3, size.x) * 1.6 + (Math.random() - 0.5) * 0.5, r0[i].y / Math.max(1e-3, size.y) * 1.2 + 0.45 + Math.random() * 0.5, (Math.random() - 0.2) * 0.9)
        delay[i] = Math.random() * 0.35; spd[i] = 0.35 + Math.random() * 0.55; sz[i] = 0.5 + Math.random() * 1.1
      }
      fx.active = true; fx.set(0); pts.visible = true
    },
    set(p) { // p: 0 → 1 overall progress
      k = p
      for (let i = 0; i < N; i++) {
        let t = THREE.MathUtils.clamp((p - delay[i]) / (1 - delay[i]), 0, 1), u = rev ? 1 - t : t
        const e = 1 - (1 - u) * (1 - u) * (1 - u) // ease-out travel, velocity → 0 at the end of a scatter
        pos[i * 3] = c.x + r0[i].x + dir[i].x * spd[i] * e * sz3.x * 0.9
        pos[i * 3 + 1] = c.y + r0[i].y + dir[i].y * spd[i] * e * sz3.y * 0.75
        pos[i * 3 + 2] = c.z + r0[i].z + dir[i].z * spd[i] * e * 0.4
        al[i] = Math.sin(Math.PI * t) * 0.85
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.aA.needsUpdate = true; geo.attributes.aS.needsUpdate = true
    },
    stop() { fx.active = false; pts.visible = false },
    setPR(v) { mat.uniforms.uPR.value = v },
  }
  return fx
}
