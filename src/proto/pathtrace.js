import * as THREE from 'three'
import { makeRenderer, loadEnv, re4Art, interaction, stats } from './common.js'
import { loadProcedural } from './proceduralScene.js'
import { run } from './run.js'
document.getElementById('ttl').textContent = 'B · Path traced (current procedural assets)'; document.getElementById('sub').textContent = '交互时光栅化 · 静止后渐进式路径追踪（three-gpu-pathtracer）'
const st = stats(); const { renderer, camera, canvas } = makeRenderer(); const scene = new THREE.Scene()
const [, a] = await Promise.all([loadEnv(renderer, scene, 0.75), re4Art()])
const rig = await loadProcedural(renderer, scene, a)
run({ renderer, scene, camera, inter: interaction(canvas, camera, rig, () => {}), st, pathTrace: true, catcher: rig.catcher, label: 'procedural' })
