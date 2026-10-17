import * as THREE from 'three'
import { makeRenderer, loadEnv, re4Art, interaction, stats } from './common.js'
import { loadBaked } from './bakedScene.js'
import { run } from './run.js'
document.getElementById('ttl').textContent = 'A · Baked (Blender + Cycles lightmap/AO → GLB)'; document.getElementById('sub').textContent = '拖动旋转 · 滚轮缩放 · 实时光栅化 + 烘焙全局光照'
const st = stats(); const { renderer, camera, canvas } = makeRenderer(); const scene = new THREE.Scene()
const [, a] = await Promise.all([loadEnv(renderer, scene, 0.75), re4Art()])
const rig = await loadBaked(renderer, scene, a)
run({ renderer, scene, camera, inter: interaction(canvas, camera, rig, () => {}), st, pathTrace: false, label: 'raster + baked GI' })
