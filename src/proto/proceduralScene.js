// Prototype B assets: the CURRENT procedural three.js case model + a procedural oak shelf section (Poly Haven oak PBR)
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { createCaseModel } from '../demo/caseModel.js'
import { BASE, GZ } from './common.js'
export async function loadProcedural(renderer, scene, { art }) {
  const tl = new THREE.TextureLoader(), maxA = renderer.capabilities.getMaxAnisotropy()
  const [d, n, r] = await Promise.all(['diff', 'nor_gl', 'rough'].map((k) => tl.loadAsync(`${BASE}proto/oak_veneer_01_${k}_1k.jpg`)))
  d.colorSpace = THREE.SRGBColorSpace; for (const t of [d, n, r]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = maxA }
  const oak = (rx, ry, rot = 0) => { const m = new THREE.MeshPhysicalMaterial({ roughness: 1, clearcoat: 0.25, clearcoatRoughness: 0.35, normalScale: new THREE.Vector2(0.6, 0.6) })
    for (const [k, t] of [['map', d], ['normalMap', n], ['roughnessMap', r]]) { const c = t.clone(); c.repeat.set(rx, ry); c.rotation = rot; c.needsUpdate = true; m[k] = c } return m }
  const IW = 2.7, IH = 2.7, ID = 1.3, FT = 0.16, G = new THREE.Group(); scene.add(G)
  const box = (w, h, dd, m, x, y, z, rad = 0.012) => { const o = new THREE.Mesh(new RoundedBoxGeometry(w, h, dd, 3, rad), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; G.add(o); return o }
  const H2 = IH + GZ + FT
  box(FT, H2, ID + 0.1, oak(0.6, 1.6, Math.PI / 2), -(IW / 2 + FT / 2), H2 / 2, 0); box(FT, H2, ID + 0.1, oak(0.6, 1.6, Math.PI / 2), IW / 2 + FT / 2, H2 / 2, 0)
  box(IW + 2 * FT + 0.08, FT, ID + 0.18, oak(1.4, 0.6), 0, GZ + IH + FT / 2, 0.04); box(IW, 0.18, ID, oak(1.4, 0.6), 0, GZ - 0.32, 0)
  box(IW, 0.12, 0.12, oak(1.4, 0.1), 0, GZ + IH - 0.06, ID / 2 - 0.06)
  box(IW, IH + GZ, 0.05, new THREE.MeshStandardMaterial({ color: 0x9e9485, roughness: 0.9 }), 0, (IH + GZ) / 2, -ID / 2 + 0.025, 0.004)
  const glass = new THREE.Mesh(new RoundedBoxGeometry(IW - 0.02, 0.1, ID - 0.06, 2, 0.006), new THREE.MeshPhysicalMaterial({ color: 0xdcf2e8, roughness: 0.02, transmission: 1, ior: 1.52, thickness: 0.1, attenuationColor: new THREE.Color(0x9fd8c0), attenuationDistance: 2.5 }))
  glass.position.set(0, GZ - 0.05, 0.02); G.add(glass)
  box(IW - 0.3, 0.025, 0.05, new THREE.MeshPhysicalMaterial({ color: 0xc0c2c6, metalness: 1, roughness: 0.4 }), 0, GZ + IH - 0.0125, ID / 2 - 0.17, 0.004)
  const led = new THREE.Mesh(new THREE.BoxGeometry(IW - 0.32, 0.012, 0.035), new THREE.MeshStandardMaterial({ color: 0xfff0dd, emissive: 0xffdcb0, emissiveIntensity: 3 })); led.position.set(0, GZ + IH - 0.031, ID / 2 - 0.17); G.add(led)
  // the current case model (procedural), RE4 art
  const model = createCaseModel({ renderer, scene, mobile: false, maxAniso: maxA, platform: 'ps5' })
  model.setArt(art); model.root.position.set(0, GZ + model.H / 2 + 0.0005, 0.12); model.root.rotation.y = -0.38
  model.root.traverse((o) => { if (o.isMesh) o.castShadow = true; if (o.material?.isShaderMaterial) o.visible = false })
  model.disc.traverse((o) => { if (o.material?.isShaderMaterial) o.visible = false })
  RectAreaLightUniformsLib.init()
  const ra = new THREE.RectAreaLight(0xffdcb2, 22, 2.38, 0.035); ra.position.set(0, GZ + IH - 0.04, ID / 2 - 0.17); ra.lookAt(0, 0, ID / 2 - 0.1); scene.add(ra)
  const sp = new THREE.SpotLight(0xffd6a6, 60, 0, 0.5, 0.8, 2); sp.position.set(0.9, 7.5, 6.5); sp.target.position.set(0, GZ + 0.8, 0); scene.add(sp, sp.target)
  sp.castShadow = true; sp.shadow.mapSize.set(2048, 2048); sp.shadow.radius = 4; sp.shadow.bias = -0.0002; sp.shadow.normalBias = 0.01
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.2), new THREE.ShadowMaterial({ opacity: 0.32 })); catcher.rotation.x = -Math.PI / 2; catcher.position.set(0, GZ + 0.001, -0.02); catcher.receiveShadow = true; scene.add(catcher)
  const _s = new THREE.Vector3()
  return { root: model.root, spine: model.spineG, cover: model.coverHinge, onPose: () => { model.updateWrap(); model.root.updateMatrixWorld(true); model.seatWorld(_s); model.disc.position.copy(_s); model.root.getWorldQuaternion(model.disc.quaternion) }, catcher, model }
}
