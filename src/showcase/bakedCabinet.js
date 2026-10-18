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
// Split lightmaps: lightMap = spot group, lmShelf = concealed uplights, lmWorld = HDRI fill. Each was encoded with its own
// scale; lmK[i] = scale·π·weight·(runtime intensity × tint) is shared by every baked material, so presets / sliders
// re-light the static cabinet without a recompile.
export const LMU = { lmShelf: { value: null }, lmWorld: { value: null }, lmK: { value: [new THREE.Vector3(1, 1, 1), new THREE.Vector3(1, 1, 1), new THREE.Vector3()] } }
const MIX_MAPS = BAKED_MAPS.replace('vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;',
  'vec3 lightMapIrradiance = lightMapTexel.rgb * lmK[ 0 ] + texture2D( lmShelf, vLightMapUv ).rgb * lmK[ 1 ] + texture2D( lmWorld, vLightMapUv ).rgb * lmK[ 2 ];')
function bakedMix(m) {
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, LMU)
    s.fragmentShader = s.fragmentShader.replace('#include <lightmap_pars_fragment>', '#include <lightmap_pars_fragment>\nuniform sampler2D lmShelf; uniform sampler2D lmWorld; uniform vec3 lmK[ 3 ];')
      .replace('#include <lights_fragment_begin>', BAKED_BEGIN).replace('#include <lights_fragment_maps>', MIX_MAPS)
  }
  m.customProgramCacheKey = () => 'baked-lm-mix'
  return m
}
export async function loadBakedCabinet({ renderer, base, mobile, mats, lmGain = 1 }) {
  const B = base + 'cab/', tl = new THREE.TextureLoader(), aniso = renderer.capabilities.getMaxAnisotropy()
  const T = (f, srgb, ch = 0) => tl.loadAsync(B + f).then((t) => { t.flipY = false; t.channel = ch; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = ch ? 1 : aniso; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t })
  const big = mobile ? '1k' : '2k'
  const gl = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
  const meta = await fetch(B + 'meta.json').then((r) => r.json()), comp = meta.components, sz = mobile ? '1k' : '2k'
  const [gltf, oakD, oakN, oakR, linD, linN, linR, light, ao, lShelf, lWorld] = await Promise.all([
    gl.loadAsync(B + 'cabinet.glb'),
    T(`oak_diff_${big}.webp`, true), T(`oak_nor_gl_${big}.webp`), T('oak_rough_1k.webp'), T('linen_diff.webp', true), T('linen_nor.webp'), T('linen_rough.webp'),
    T(comp ? `light_spot_${sz}.webp` : `light_${sz}.webp`, true, 1), T(mobile ? 'ao_512.webp' : 'ao_1k.webp', false, 1),
    comp ? T(`light_shelf_${sz}.webp`, true, 1) : null, comp ? T(`light_world_${sz}.webp`, true, 1) : null])
  for (const t of [light, ao, lShelf, lWorld]) if (t) { t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.generateMipmaps = true }
  const BO = comp ? bakedMix : bakedOnly
  if (comp) { LMU.lmShelf.value = lShelf; LMU.lmWorld.value = lWorld }
  // per-group base factor (encode scale · π · authored weight · gain); setMix multiplies in the runtime intensity × tint
  const lmBase = comp ? ['spot', 'shelf', 'world'].map((k) => comp[k].scale * Math.PI * comp[k].weight * lmGain) : null
  const setMix = (k) => { if (!lmBase) return; k.forEach((v, i) => LMU.lmK.value[i].set(v[0], v[1], v[2]).multiplyScalar(lmBase[i])) }
  if (lmBase) setMix([[1, 1, 1], [1, 1, 1], [1, 1, 1]])
  if (new URLSearchParams(location.search).has('shot')) window.__lmu = LMU
  // Blender's diffuse light pass is E/π; three's lightmap expects irradiance E → ×π, × the encode scale of the 8-bit file
  const LMI = meta.lightScale * Math.PI * lmGain
  const lm = { lightMap: light, lightMapIntensity: LMI, aoMap: ao, aoMapIntensity: 0.55 }
  const oakBase = { map: oakD, normalMap: oakN, normalScale: new THREE.Vector2(0.7, 0.7), roughnessMap: oakR, roughness: 1, clearcoat: 0.32, clearcoatRoughness: 0.32, envMapIntensity: 0.7 }
  const M = {
    Oak: BO(new THREE.MeshPhysicalMaterial({ ...oakBase, ...lm })),
    OakDark: BO(new THREE.MeshPhysicalMaterial({ ...oakBase, ...lm, color: new THREE.Color(0.38, 0.3, 0.24), clearcoat: 0.1 })),
    Linen: BO(new THREE.MeshStandardMaterial({ map: linD, normalMap: linN, normalScale: new THREE.Vector2(0.9, 0.9), roughnessMap: linR, roughness: 1, envMapIntensity: 0.25, ...lm })),
    Alu: BO(new THREE.MeshStandardMaterial({ color: 0xb8bcc2, metalness: 1, roughness: 0.42, envMapIntensity: 0.9, ...lm })),
    Brass: BO(new THREE.MeshPhysicalMaterial({ color: 0xc9a46a, metalness: 1, roughness: 0.32, envMapIntensity: 1, ...lm })),
  }
  const doorOak = new THREE.MeshPhysicalMaterial({ ...oakBase })
  const byName = (m, door) => {
    switch (m.name) {
      case 'Oak': case 'OakDark': case 'Linen': case 'Alu': case 'Brass':
        if (door) return m.name === 'Brass' ? mats.brass : doorOak
        return M[m.name]
      case 'ShelfGlass': return mats.glassMat
      case 'GlassEdge': return mats.glassEdge
      case 'DoorGlass': return mats.doorGlass
      case 'DoorEdge': return mats.doorEdge
      default: return m
    }
  }
  const proto = gltf.scene
  proto.traverse((o) => {
    if (!o.isMesh) return
    let door = false; for (let p = o; p && p !== proto; p = p.parent) if (p.name.startsWith('Door')) door = true
    o.material = byName(o.material, door); const isStatic = !door
    if (o.material === mats.glassMat || o.material === mats.glassEdge) { o.renderOrder = o.material === mats.glassEdge ? 2 : 1; o.castShadow = false; o.receiveShadow = false }
    else if (o.material === mats.doorEdge) { o.renderOrder = 3; o.castShadow = o.receiveShadow = false }
    else if (o.material === mats.doorGlass) {
      o.renderOrder = 3; o.castShadow = o.receiveShadow = false; o.geometry.computeBoundingBox(); const bb = o.geometry.boundingBox
      // frameless pane: a hairline glint just inside all four polished edges of the front face
      const w = 0.004, z = bb.max.z + 0.001, x0 = bb.min.x + 0.006, x1 = bb.max.x - 0.006, y0 = bb.min.y + 0.006, y1 = bb.max.y - 0.006
      const line = (cx, cy, lw, lh) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(lw, lh), mats.glassLine); m.position.set(cx, cy, z); m.renderOrder = 4; m.castShadow = false; o.add(m) }
      line((x0 + x1) / 2, y0, x1 - x0, w); line((x0 + x1) / 2, y1, x1 - x0, w); line(x0, (y0 + y1) / 2, w, y1 - y0); line(x1, (y0 + y1) / 2, w, y1 - y0)
    }
    else { o.castShadow = true; o.receiveShadow = !isStatic }
  })
  return {
    lmi: LMI, materials: M, setMix, split: !!comp,
    make(ci, x) {
      const g = proto.clone(true); g.position.x = x
      const doors = []
      for (const [nm, sx] of [['DoorL', -1], ['DoorR', 1]]) { const p = g.getObjectByName(nm); if (p) { p.userData = { sx, ci }; doors.push(p) } }
      return { group: g, doors }
    },
  }
}
