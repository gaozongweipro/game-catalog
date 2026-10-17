// Prototype A assets: Blender-built cabinet section (Cycles-baked lightmap + AO) and case rig (GLB, Draco).
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { BASE, GZ, tex } from './common.js'
export async function loadBaked(renderer, scene, { wrap, art }) {
  const draco = new DRACOLoader().setDecoderPath(BASE + 'proto/'), gl = new GLTFLoader().setDRACOLoader(draco), tl = new THREE.TextureLoader()
  const [cab, cs, light, ao] = await Promise.all([gl.loadAsync(BASE + 'proto/cabinet.glb'), gl.loadAsync(BASE + 'proto/case.glb'), tl.loadAsync(BASE + 'proto/cabinet_light.jpg'), tl.loadAsync(BASE + 'proto/cabinet_ao.jpg')])
  for (const t of [light, ao]) { t.flipY = false; t.channel = 1 } light.colorSpace = THREE.SRGBColorSpace
  const maxA = renderer.capabilities.getMaxAnisotropy()
  cab.scene.traverse((o) => {
    if (!o.isMesh) return
    o.receiveShadow = true
    const ms = Array.isArray(o.material) ? o.material : [o.material]
    for (const m of ms) {
      for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap']) if (m[k]) m[k].anisotropy = maxA
      if (o.name.startsWith('Cabinet')) { m.lightMap = light; m.lightMapIntensity = 1.4; m.aoMap = ao; m.aoMapIntensity = 1; m.envMapIntensity = 0.35; if (m.name === 'Oak') { m.color.setRGB(0.82, 0.8, 0.78); for (const k of ['map', 'normalMap', 'roughnessMap']) m[k]?.repeat.set(1.7, 1.7) } } // static: GI from the bake, IBL only for specular
      if (m.name === 'LED') { m.emissiveIntensity = 3; m.toneMapped = true }
      if (m.name === 'ShelfGlass') { m.thickness = 0.1; m.roughness = 0.02; m.attenuationColor = new THREE.Color(0x9fd8c0); m.attenuationDistance = 2.5 }
    }
  })
  scene.add(cab.scene)
  const root = cs.scene.getObjectByName('CaseRoot'), spine = cs.scene.getObjectByName('SpinePivot'), cover = cs.scene.getObjectByName('CoverPivot')
  cs.scene.traverse((o) => {
    if (!o.isMesh) return
    o.castShadow = true; o.receiveShadow = true
    const m = o.material
    if (m.name === 'CoverPrint') { m.map = tex(wrap); m.color.set(0xffffff); m.roughness = 0.62; m.needsUpdate = true } // runtime-replaceable cover
    if (m.name === 'InnerPrint' && art.innerTray) { m.map = tex(art.innerTray); m.color.set(0xffffff); m.needsUpdate = true }
    if (m.name === 'DiscLabel' && art.disc) { m.map = tex(art.disc); m.color.set(0xffffff); m.needsUpdate = true }
    if (m.name === 'Shell' || m.name === 'Hub') { m.color.set(m.name === 'Hub' ? 0x5a7cff : 0xa9bcff); m.transmission = m.name === 'Hub' ? 0.8 : 1; m.thickness = 0.011;  m.roughness = 0.1; m.side = THREE.FrontSide }
    if (m.name === 'DiscData') { m.metalness = 1; m.roughness = 0.12; m.color.set(0xb8b4c8) }
    if (m.name === 'Film') { m.thickness = 0.0005; m.roughness = 0.04 }
    if (m.transmission > 0) o.castShadow = false
  })
  // inside face of the wrap insert: inner-cover print (or plain paper) on a back-side twin of each CoverPrint mesh, so the open case doesn't show the front art mirrored
  const iw = document.createElement('canvas'); iw.width = wrap.width; iw.height = wrap.height; { const g = iw.getContext('2d'), b = Math.round((1.29 + 0.135) * 800); g.fillStyle = '#efece6'; g.fillRect(0, 0, iw.width, iw.height)
    if (art.innerCover) { g.save(); g.translate(iw.width, 0); g.scale(-1, 1); g.drawImage(art.innerCover, 0, 0, iw.width - b, iw.height); g.restore() } }
  const innerMat = new THREE.MeshStandardMaterial({ map: tex(iw), roughness: 0.7, side: THREE.BackSide }), twins = []
  cs.scene.traverse((o) => { if (o.isMesh && o.material.name === 'CoverPrint') { o.material.side = THREE.FrontSide; const t = new THREE.Mesh(o.geometry, innerMat); t.castShadow = t.receiveShadow = true; twins.push([o, t]) } })
  for (const [o, t] of twins) { t.position.copy(o.position); t.quaternion.copy(o.quaternion); t.scale.copy(o.scale); o.parent.add(t) }
  scene.add(cs.scene)
  root.position.set(0, GZ + 0.85 + 0.0005, 0.12); root.rotation.y = -0.38
  // realtime lights matching the bake: warm key spot + LED area light (for the dynamic case)
  RectAreaLightUniformsLib.init()
  const ra = new THREE.RectAreaLight(0xffdcb2, 22, 2.38, 0.035); ra.position.set(0, GZ + 2.7 - 0.04, 0.48); ra.lookAt(0, 0, 0.6); scene.add(ra)
  const sp = new THREE.SpotLight(0xffd6a6, 60, 0, 0.5, 0.8, 2); sp.position.set(0.9, 7.5, 6.5); sp.target.position.set(0, GZ + 0.8, 0); scene.add(sp, sp.target)
  sp.castShadow = true; sp.shadow.mapSize.set(2048, 2048); sp.shadow.radius = 4; sp.shadow.bias = -0.0002; sp.shadow.normalBias = 0.01
  // contact shadow on the glass shelf (transmissive glass can't receive shadows)
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.2), new THREE.ShadowMaterial({ opacity: 0.32 })); catcher.rotation.x = -Math.PI / 2; catcher.position.set(0, GZ + 0.001, -0.02); catcher.receiveShadow = true; scene.add(catcher)
  return { root, spine, cover, lights: [ra, sp], catcher, setCover: (canvas) => { cs.scene.traverse((o) => { if (o.isMesh && o.material.name === 'CoverPrint') { o.material.map?.dispose(); o.material.map = tex(canvas); o.material.needsUpdate = true } }) } }
}
