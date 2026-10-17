import * as THREE from 'three'
import { makeRenderer, loadEnv, re4Art, interaction, stats } from './common.js'
import { loadBaked } from './bakedScene.js'
import { run } from './run.js'
document.getElementById('ttl').textContent = 'C · Hybrid (A assets · path trace when idle)'; document.getElementById('sub').textContent = '交互：烘焙光照光栅化 · 静止：路径追踪收敛'
const st = stats(); const { renderer, camera, canvas } = makeRenderer(); const scene = new THREE.Scene()
const [, a] = await Promise.all([loadEnv(renderer, scene, 0.75), re4Art()])
const rig = await loadBaked(renderer, scene, a)
run({ renderer, scene, camera, inter: interaction(canvas, camera, rig, () => {}), st, pathTrace: true, catcher: rig.catcher, label: 'baked assets' })
