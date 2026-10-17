// Baked gallery cabinet: Blender-built carcass + doors (GLB, meshopt), Cycles lightmap + AO (OIDN denoised, WebP),
// CC0 Poly Haven oak / linen PBR. Static meshes get their diffuse light ONLY from the lightmap (realtime direct lights,
// hemisphere light and light probes are stripped from their shader so nothing is lit twice); speculars come from the
// gallery HDRI. Dynamic objects (cases, doors) stay realtime-lit, plus probe-grid irradiance captured from this cabinet.
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

const BAKED_BEGIN = THREE.ShaderChunk.lights_fragment_begin
  .replace(/defined\( RE_Direct \)/g, 'defined( RE_Direct_BAKED_OFF )')
  .replace('defined( RE_Direct_RectArea )', 'defined( RE_Direct_RectArea_BAKED_OFF )')
  .replace('#if defined( USE_LIGHT_PROBES )', '#if defined( USE_LIGHT_PROBES_BAKED_OFF )')
  .replace('#if ( NUM_HEMI_LIGHTS > 0 )', '#if 0')
  .replace('#ifdef USE_LIGHT_PROBES_GRID', '#ifdef USE_LIGHT_PROBES_GRID_BAKED_OFF')
  .replace('vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );', 'vec3 irradiance = vec3( 0.0 );')
// the HDRI's diffuse irradiance is already in the bake (world light) → keep only its specular reflections
const BAKED_MAPS = THREE.ShaderChunk.lights_fragment_maps.replace('iblIrradiance += getIBLIrradiance( geometryNormal );', '')
export function bakedOnly(m) {
  m.onBeforeCompile = (s) => { s.fragmentShader = s.fragmentShader.replace('#include <lights_fragment_begin>', BAKED_BEGIN).replace('#include <lights_fragment_maps>', BAKED_MAPS) }
  m.customProgramCacheKey = () => 'baked-lm'
  return m
}
export async function loadBakedCabinet({ renderer, base, mobile, mats, lmGain = 1 }) {
  const B = base + 'cab/', tl = new THREE.TextureLoader(), aniso = renderer.capabilities.getMaxAnisotropy()
  const T = (f, srgb, ch = 0) => tl.loadAsync(B + f).then((t) => { t.flipY = false; t.channel = ch; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = ch ? 1 : aniso; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t })
  const big = mobile ? '1k' : '2k'
  const gl = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
  const [gltf, meta, oakD, oakN, oakR, linD, linN, linR, light, ao] = await Promise.all([
    gl.loadAsync(B + 'cabinet.glb'), fetch(B + 'meta.json').then((r) => r.json()),
    T(`oak_diff_${big}.webp`, true), T(`oak_nor_gl_${big}.webp`), T('oak_rough_1k.webp'), T('linen_diff.webp', true), T('linen_nor.webp'), T('linen_rough.webp'),
    T(mobile ? 'light_1k.webp' : 'light_2k.webp', true, 1), T(mobile ? 'ao_512.webp' : 'ao_1k.webp', false, 1)])
  for (const t of [light, ao]) { t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.generateMipmaps = true }
  // Blender's diffuse light pass is E/π; three's lightmap expects irradiance E → ×π, × the encode scale of the 8-bit file
  const LMI = meta.lightScale * Math.PI * lmGain
  const lm = { lightMap: light, lightMapIntensity: LMI, aoMap: ao, aoMapIntensity: 0.55 }
  const oakBase = { map: oakD, normalMap: oakN, normalScale: new THREE.Vector2(0.7, 0.7), roughnessMap: oakR, roughness: 1, clearcoat: 0.32, clearcoatRoughness: 0.32, envMapIntensity: 0.7 }
  const M = {
    Oak: bakedOnly(new THREE.MeshPhysicalMaterial({ ...oakBase, ...lm })),
    OakDark: bakedOnly(new THREE.MeshPhysicalMaterial({ ...oakBase, ...lm, color: new THREE.Color(0.38, 0.3, 0.24), clearcoat: 0.1 })),
    Linen: bakedOnly(new THREE.MeshStandardMaterial({ map: linD, normalMap: linN, normalScale: new THREE.Vector2(0.9, 0.9), roughnessMap: linR, roughness: 1, envMapIntensity: 0.25, ...lm })),
    Alu: bakedOnly(new THREE.MeshStandardMaterial({ color: 0xb8bcc2, metalness: 1, roughness: 0.42, envMapIntensity: 0.9, ...lm })),
    Brass: bakedOnly(new THREE.MeshPhysicalMaterial({ color: 0xc9a46a, metalness: 1, roughness: 0.32, envMapIntensity: 1, ...lm })),
  }
  const doorOak = new THREE.MeshPhysicalMaterial({ ...oakBase })
  const byName = (m, door) => {
    switch (m.name) {
      case 'Oak': case 'OakDark': case 'Linen': case 'Alu': case 'Brass':
        if (door) return m.name === 'Brass' ? mats.brass : doorOak
        return M[m.name]
      case 'ShelfGlass': return mats.glassMat
      case 'GlassEdge': return mats.glassEdge
      case 'LED': return mats.ledMat
      case 'DoorGlass': return mats.doorGlass
      default: return m
    }
  }
  const proto = gltf.scene
  proto.traverse((o) => {
    if (!o.isMesh) return
    let door = false; for (let p = o; p && p !== proto; p = p.parent) if (p.name.startsWith('Door')) door = true
    o.material = byName(o.material, door); const isStatic = !door
    if (o.material === mats.glassMat || o.material === mats.glassEdge) { o.renderOrder = 1; o.castShadow = false; o.receiveShadow = false }
    else if (o.material === mats.doorGlass) { o.renderOrder = 3; o.castShadow = false; o.geometry.computeBoundingBox(); const bb = o.geometry.boundingBox, c = bb.getCenter(new THREE.Vector3()), sz = bb.getSize(new THREE.Vector3())
      const st = new THREE.Mesh(new THREE.PlaneGeometry(sz.x, sz.y), mats.streakMat); st.renderOrder = 4; st.position.set(c.x, c.y, bb.max.z + 0.002); o.add(st) }
    else if (o.material === mats.ledMat) { o.castShadow = false }
    else { o.castShadow = true; o.receiveShadow = !isStatic }
  })
  return {
    lmi: LMI, materials: M,
    make(ci, x) {
      const g = proto.clone(true); g.position.x = x
      const doors = []
      for (const [nm, sx] of [['DoorL', -1], ['DoorR', 1]]) { const p = g.getObjectByName(nm); if (p) { p.userData = { sx, ci }; doors.push(p) } }
      return { group: g, doors }
    },
  }
}
