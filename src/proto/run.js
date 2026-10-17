// Shared render loop: raster while interacting; optional progressive path tracing once the item is at rest.
import * as THREE from 'three'
import { WebGLPathTracer } from 'three-gpu-pathtracer'
import { qs, onResize } from './common.js'
export function run({ renderer, scene, camera, inter, st, pathTrace, catcher, label }) {
  let pt = null, needScene = true, lastMove = performance.now(), dirty = 3, maxS = +(qs.get('spp') || 512)
  if (pathTrace) {
    pt = new WebGLPathTracer(renderer); pt.bounces = 6; pt.transmissiveBounces = 10; pt.filterGlossyFactor = 0.5; pt.minSamples = 1; pt.fadeDuration = 350; pt.renderDelay = 0
    pt.tiles.set(qs.has('shot') ? 1 : 2, qs.has('shot') ? 1 : 2); pt.renderScale = +(qs.get('ptscale') || 1)
    onResize.push(() => { needScene = true })
  }
  onResize.push(() => { dirty = 3 })
  const clock = new THREE.Clock()
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05)
    if (inter.update(dt)) { lastMove = performance.now(); needScene = true; dirty = 2 }
    const idle = performance.now() - lastMove > 400
    if (pt && idle) {
      if (needScene) { if (catcher) catcher.visible = false; scene.updateMatrixWorld(true); pt.setScene(scene, camera); needScene = false; if (catcher) catcher.visible = true }
      if (pt.samples < maxS) { pt.renderSample(); st.samples = Math.floor(pt.samples); st.mode = label + ' · path tracing' }
      st.firstFrame()
    } else if (dirty > 0 || !idle) {
      renderer.render(scene, camera); dirty = Math.max(0, dirty - 1); st.firstFrame(); st.samples = 0; st.mode = label + (pt ? ' · raster (interacting)' : '')
    }
  })
}
