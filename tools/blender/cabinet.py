# Blender 4.2 headless: full showcase cabinet (same dims as src/showcase/main.js), Cycles-baked lightmap + AO (OIDN denoised), GLB export.
# Units 1 = 100 mm. Written in three.js coords via T(): three (x, y, z) -> Blender (x, -z, y).
import bpy, bmesh, math, os, json, time
import numpy as np
from mathutils import Vector
A = '/workspace/proto-assets/'; OUT = A + 'cab/'; t0 = time.time()
def log(*a): print('[cab %5.0fs]' % (time.time() - t0), *a, flush=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
RAIL_H = 0.055                                   # front rail height (hides the uplight from normal viewing angles)
FL_Z, FL_UP = 1.9 / 2 - 0.115, float(os.environ.get('FL_UP', '12'))   # uplight depth (three z, just behind the rail) / tilt above horizontal
FL_W = float(os.environ.get('FL_W', '120'))      # W per compartment (Blender area light)
FL_COL = (1.0, 0.76, 0.52)                       # ~3000 K
RES = int(os.environ.get('BAKE_RES', '2048')); SAMPLES = int(os.environ.get('BAKE_SAMPLES', '128')); AO_RES = RES // 2
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = False
sc.cycles.max_bounces = 6; sc.cycles.diffuse_bounces = 4; sc.cycles.glossy_bounces = 2; sc.cycles.transmission_bounces = 4; sc.cycles.caustics_reflective = False; sc.cycles.caustics_refractive = False
sc.cycles.sample_clamp_indirect = 4.0
CW, CD, SP, PLINTH, FT, NSH = 5.7, 1.9, 2.2, 0.42, 0.16, 3
inH = NSH * SP; outW = CW + 2 * FT; outH = inH + PLINTH + FT; DD = CD + FT
def T(x, y, z): return Vector((x, -z, y))
def link(o, coll=None): (coll or sc.collection).objects.link(o); return o
def new_mesh(name, bm):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); return link(bpy.data.objects.new(name, me))
def apply_mods(o):
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
    o.select_set(False)
def finish(o, bev, seg=3):
    if bev > 0:
        m = o.modifiers.new('bevel', 'BEVEL'); m.width = bev; m.segments = seg; m.limit_method = 'ANGLE'; m.angle_limit = math.radians(40); m.harden_normals = True
    for p in o.data.polygons: p.use_smooth = True
    w = o.modifiers.new('wn', 'WEIGHTED_NORMAL'); w.keep_sharp = True
    apply_mods(o); return o
def grain_uv(o, tile):
    """box-mapped UV0 in physical units; v runs along the part's longest axis (grain of the veneer texture is vertical)."""
    me = o.data; bm = bmesh.new(); bm.from_mesh(me); uvl = bm.loops.layers.uv.get('UVMap') or bm.loops.layers.uv.new('UVMap')
    co = [v.co for v in bm.verts]; ext = [max(c[i] for c in co) - min(c[i] for c in co) for i in range(3)]; g = max(range(3), key=lambda i: ext[i])
    for f in bm.faces:
        n = f.normal; ax = max(range(3), key=lambda i: abs(n[i])); others = [i for i in range(3) if i != ax]
        gv = g if g in others else max(others, key=lambda i: ext[i]); gu = [i for i in others if i != gv][0]
        for lp in f.loops: c = lp.vert.co; lp[uvl].uv = (c[gu] / tile, c[gv] / tile)
    bm.to_mesh(me); bm.free()
def tbox(name, w, h, d, x, y, z, mat, bev=0.0, tile=6.0, seg=3):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * w, v.co.y * d, v.co.z * h)) + T(x, y, z)
    o = new_mesh(name, bm); o.data.materials.append(mat); finish(o, bev, seg); grain_uv(o, tile); return o
def tcyl(name, r, h, x, y, z, mat, axis='Y', verts=24, bev=0.0):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=r, radius2=r, depth=h)
    rot = {'Y': (0, 0, 0), 'Z': (math.pi / 2, 0, 0), 'X': (0, math.pi / 2, 0)}[axis]  # Blender Z = three Y
    from mathutils import Euler
    M = Euler(rot).to_matrix()
    for v in bm.verts: v.co = M @ v.co + T(x, y, z)
    o = new_mesh(name, bm); o.data.materials.append(mat); finish(o, bev, 2); grain_uv(o, 1.0); return o
def principled(name, **kw):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    for k, v in kw.items(): b.inputs[k].default_value = v
    return m, b
def textured(name, diff, rough, nor, nstr=0.6, tint=None, **kw):
    m, b = principled(name, **kw); nt = m.node_tree
    def img(p, cs):
        n = nt.nodes.new('ShaderNodeTexImage'); n.image = bpy.data.images.load(p); n.image.colorspace_settings.name = cs; return n
    d = img(diff, 'sRGB'); r = img(rough, 'Non-Color'); n = img(nor, 'Non-Color'); nm = nt.nodes.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = nstr
    if tint:
        mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'; mix.inputs['Factor'].default_value = 1.0
        nt.links.new(d.outputs['Color'], mix.inputs['A']); mix.inputs['B'].default_value = tint; nt.links.new(mix.outputs['Result'], b.inputs['Base Color'])
    else: nt.links.new(d.outputs['Color'], b.inputs['Base Color'])
    nt.links.new(r.outputs['Color'], b.inputs['Roughness']); nt.links.new(n.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])
    return m
oak = textured('Oak', A + 'oak_veneer_01_diff_2k.jpg', A + 'oak_veneer_01_rough_2k.jpg', A + 'oak_veneer_01_nor_gl_2k.jpg', 0.6, **{'Coat Weight': 0.3, 'Coat Roughness': 0.35})
oakDark = textured('OakDark', A + 'oak_veneer_01_diff_2k.jpg', A + 'oak_veneer_01_rough_2k.jpg', A + 'oak_veneer_01_nor_gl_2k.jpg', 0.5, tint=(0.38, 0.3, 0.24, 1))
linen = textured('Linen', OUT + 'linen_diff.jpg', A + 'rough_linen_rough_1k.jpg', A + 'rough_linen_nor_gl_1k.jpg', 0.8)
alu, _ = principled('Alu', **{'Base Color': (0.72, 0.73, 0.75, 1), 'Metallic': 1.0, 'Roughness': 0.42})
brass, _ = principled('Brass', **{'Base Color': (0.78, 0.6, 0.34, 1), 'Metallic': 1.0, 'Roughness': 0.32})
glass, _ = principled('ShelfGlass', **{'Base Color': (0.9, 0.97, 0.94, 1), 'Roughness': 0.01, 'Transmission Weight': 1.0, 'IOR': 1.52})
gedge, _ = principled('GlassEdge', **{'Base Color': (0.45, 0.72, 0.6, 1), 'Roughness': 0.12, 'Transmission Weight': 0.6, 'IOR': 1.52})
led, _ = principled('LED', **{'Base Color': (1, 0.95, 0.88, 1), 'Emission Color': (1, 0.88, 0.72, 1), 'Emission Strength': 8.0})
dedge, _ = principled('DoorEdge', **{'Base Color': (0.55, 0.8, 0.68, 1), 'Roughness': 0.05, 'Transmission Weight': 0.8, 'IOR': 1.52})
dglass, _ = principled('DoorGlass', **{'Base Color': (0.95, 0.99, 0.97, 1), 'Roughness': 0.01, 'Transmission Weight': 1.0, 'IOR': 1.52})
greym, _ = principled('Room', **{'Base Color': (0.32, 0.3, 0.28, 1), 'Roughness': 0.8})

# ---------------- static carcass (one lightmapped mesh) ----------------
P = []
P += [tbox('SideL', FT, outH, DD, -CW / 2 - FT / 2, outH / 2, 0, oak, 0.02), tbox('SideR', FT, outH, DD, CW / 2 + FT / 2, outH / 2, 0, oak, 0.02)]
P += [tbox('Top', outW, FT, DD, 0, outH - FT / 2, 0, oak, 0.02)]
P += [tbox('Crown1', outW + 0.12, 0.06, DD + 0.1, 0, outH + 0.03, 0.05, oak, 0.02), tbox('Crown2', outW + 0.22, 0.07, DD + 0.17, 0, outH + 0.095, 0.085, oak, 0.03),
      tbox('Crown3', outW + 0.16, 0.035, DD + 0.13, 0, outH + 0.15, 0.065, oak, 0.015)]
P += [tbox('ToeKick', outW - 0.1, PLINTH - 0.08, DD - 0.12, 0, (PLINTH - 0.08) / 2, -0.04, oakDark, 0.01), tbox('BaseBoard', outW + 0.04, 0.09, DD + 0.04, 0, PLINTH - 0.048, 0.01, oak, 0.02)]
P += [tbox('Back', CW, inH, 0.05, 0, PLINTH + inH / 2, -CD / 2 + 0.025, linen, 0.0, 1.6)]
P += [tbox('BaseShelf', CW, 0.05, CD, 0, PLINTH - 0.025, 0, oak, 0.008)]
G, L = [], []
for i in range(NSH):
    y = PLINTH + i * SP; top = y + SP
    if i > 0:
        G.append(tbox('Glass%d' % i, CW - 0.02, 0.03, CD - 0.1, 0, y + 0.015, -0.01, glass, 0.004, 1, 2))
        G.append(tbox('GEdge%d' % i, CW - 0.02, 0.03, 0.012, 0, y + 0.015, CD / 2 - 0.066, gedge, 0.003, 1, 2))
        for sx in (-1, 1):
            for sz in (-1, 1): P.append(tcyl('Pin', 0.007, 0.05, sx * (CW / 2 - 0.02), y - 0.006, sz * (CD / 2 - 0.25), brass, 'X', 16))
    # concealed uplight: oak front rail on each compartment floor hides a floor-level light that washes the back panel
    fy = PLINTH if i == 0 else y + 0.03
    P.append(tbox('Rail%d' % i, CW, RAIL_H, 0.03, 0, fy + RAIL_H / 2, CD / 2 - 0.075, oak, 0.006))
def join(objs, name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]; bpy.ops.object.join(); o = bpy.context.active_object; o.name = name; o.data.name = name; return o
cab = join(P, 'CabStatic'); glassO = join(G, 'ShelfGlass')
# drop faces nobody can see (rear faces against the wall, undersides on the floor) so the lightmap atlas
# spends its texels on visible surfaces only
bm = bmesh.new(); bm.from_mesh(cab.data)
dead = [f for f in bm.faces if (f.normal.y > 0.9 and f.calc_center_median().y > CD / 2 - 0.01) or (f.normal.z < -0.9 and f.calc_center_median().z < 0.005)]
bmesh.ops.delete(bm, geom=dead, context='FACES'); bm.to_mesh(cab.data); bm.free(); log('culled faces', len(dead))
lm = cab.data.uv_layers.new(name='Lightmap'); cab.data.uv_layers.active = lm
bpy.context.view_layer.objects.active = cab; cab.select_set(True)
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.003, area_weight=0.0)
bpy.ops.uv.pack_islands(margin=0.003, rotate=True); bpy.ops.object.mode_set(mode='OBJECT'); cab.select_set(False)
cab.data.uv_layers.active = cab.data.uv_layers['UVMap']; cab.data.uv_layers['UVMap'].active_render = True
log('carcass', len(cab.data.vertices), 'verts')

# ---------------- doors (dynamic: own pivots, not lightmapped) ----------------
doors = []
dw = CW / 2 + FT * 0.5
for sx, nm in ((-1, 'DoorL'), (1, 'DoorR')):
    px, py, pz = sx * (CW / 2 + FT * 0.5), PLINTH, CD / 2 + FT / 2 + 0.03
    piv = link(bpy.data.objects.new(nm, None)); piv.location = T(px, py, pz); doors.append(piv)
    def at(x, y, z): return (px + x, py + y, pz + z)
    # frameless low-iron tempered pane, 8 mm, overlays half the side frame, 3 mm gap at the centre (no stile)
    PT, x_out, x_in = 0.08, sx * 0.06, -sx * (dw - 0.015)
    pane = tbox(nm + 'Pane', abs(x_out - x_in), inH - 0.02, PT, *at((x_out + x_in) / 2, inH / 2, 0), dglass, 0.006, 1, 1)
    pane.data.materials.append(dedge)   # polished edges (+ bevels) get the faint green edge material
    for f in pane.data.polygons:
        if abs(f.normal.y) < 0.9: f.material_index = 1
    br = []
    for hy, sy in ((0.07, -1), (inH - 0.07, 1)):  # glass clamp pivot hinges at the outer corners + pivot pin into base / top
        br.append(tbox('Clamp', 0.15, 0.11, PT + 0.05, *at(-sx * 0.035, hy, 0), brass, 0.012))
        br.append(tcyl('Pin', 0.016, 0.07, *at(0, hy + sy * 0.09, 0), brass, 'Y', 20, 0.003))
    kx = -sx * (dw - 0.1)    # slim brass knob on the glass near the centre edge
    br.append(tcyl('Rose', 0.03, 0.008, *at(kx, inH / 2, PT / 2 + 0.004), brass, 'Z', 24, 0.002))
    br.append(tcyl('Stem', 0.011, 0.04, *at(kx, inH / 2, PT / 2 + 0.028), brass, 'Z', 16, 0.002))
    br.append(tcyl('Knob', 0.026, 0.03, *at(kx, inH / 2, PT / 2 + 0.062), brass, 'Z', 24, 0.009))
    for parts, suf in (([pane], 'Pane'), (br, 'Brass')):
        o = join(parts, nm + suf) if len(parts) > 1 else parts[0]; o.name = nm + suf
        mw = o.matrix_world.copy(); o.parent = piv; o.matrix_parent_inverse = piv.matrix_world.inverted(); o.matrix_world = mw
log('doors')

# ---------------- gallery lighting for the bake ----------------
world = bpy.data.worlds.new('W'); sc.world = world; world.use_nodes = True; wn = world.node_tree
env = wn.nodes.new('ShaderNodeTexEnvironment'); env.image = bpy.data.images.load(A + 'sculpture_exhibition_1k.hdr')
wn.links.new(env.outputs['Color'], wn.nodes['Background'].inputs['Color']); wn.nodes['Background'].inputs['Strength'].default_value = float(os.environ.get('WORLD', '0.02'))
world.light_settings.distance = 0.6
TRACK_Y, TRACK_Z = PLINTH + NSH * SP + FT + 3.4, float(os.environ.get('TRACK_Z', '6.5'))
def spot(name, pos, tgt, W, ang, blend, soft=0.25, col=(1.0, 0.8, 0.6)):
    l = bpy.data.lights.new(name, 'SPOT'); l.energy = W; l.spot_size = 2 * ang; l.spot_blend = blend; l.color = col; l.shadow_soft_size = soft
    o = link(bpy.data.objects.new(name, l)); o.location = T(*pos); d = T(*tgt) - T(*pos); o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler(); return o
SPW = float(os.environ.get('SPOT_W', '350'))
SPA, SPB = float(os.environ.get('SPOT_ANG', '0.32')), float(os.environ.get('SPOT_BLEND', '0.8'))
spot('WashL', (-2.3, TRACK_Y, TRACK_Z), (-0.6, 4.6, 0.6), SPW, SPA, SPB)
spot('WashR', (2.3, TRACK_Y, TRACK_Z), (0.6, 4.6, 0.6), SPW, SPA, SPB)
spot('Down', (0, TRACK_Y, TRACK_Z), (0, PLINTH, 0.2), SPW * float(os.environ.get('DOWN_K', '1.4')), 0.3, 0.8, 0.15)   # warm overhead pool into the cabinet
for i in range(NSH):   # floor uplights: front edge of each compartment floor, aimed back/up at the back panel
    fy = PLINTH if i == 0 else PLINTH + i * SP + 0.03
    l = bpy.data.lights.new('FL%d' % i, 'AREA'); l.shape = 'RECTANGLE'; l.size = CW - 0.8; l.size_y = 0.025; l.energy = FL_W; l.color = FL_COL
    o = link(bpy.data.objects.new('FLA%d' % i, l)); o.location = T(0, fy + 0.028, FL_Z)
    u = math.radians(FL_UP); d = T(0, math.sin(u), -math.cos(u)); o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
fl = tbox('Floor', 30, 0.02, 12, 0, -0.01, 2, greym); wall = tbox('Wall', 30, 14, 0.02, 0, 7, -2.2, greym)
for o in [glassO] + [c for d in doors for c in d.children]: o.hide_render = True   # doors/glass/LED mesh excluded from the bake (LED light = area lights)
for o in doors: o.hide_render = True

# ---------------- bake → EXR → OIDN denoise → encoded 8-bit ----------------
def bake(kind, name, res, **kw):
    img = bpy.data.images.new(name, res, res, float_buffer=True, alpha=False)
    for m in cab.data.materials:
        nt = m.node_tree; nn = nt.nodes.new('ShaderNodeTexImage'); nn.image = img; nn.name = 'BAKE'
        uvn = nt.nodes.new('ShaderNodeUVMap'); uvn.uv_map = 'Lightmap'; uvn.name = 'BAKEUV'; nt.links.new(uvn.outputs['UV'], nn.inputs['Vector']); nt.nodes.active = nn
    bpy.ops.object.select_all(action='DESELECT'); cab.select_set(True); bpy.context.view_layer.objects.active = cab
    sc.render.bake.margin = 12; sc.render.bake.margin_type = 'EXTEND'; bpy.ops.object.bake(type=kind, uv_layer='Lightmap', **kw)
    img.filepath_raw = OUT + name + '_raw.exr'; img.file_format = 'OPEN_EXR'; img.save()
    for m in cab.data.materials:
        for nn in [x for x in m.node_tree.nodes if x.name.startswith('BAKE')]: m.node_tree.nodes.remove(nn)
    log('baked', name); return OUT + name + '_raw.exr'
def denoise(src, dst, res):
    s2 = bpy.data.scenes.new('DN'); s2.render.engine = 'BLENDER_WORKBENCH'; s2.render.resolution_x = s2.render.resolution_y = res; s2.render.resolution_percentage = 100
    cam = bpy.data.objects.new('DNCam', bpy.data.cameras.new('DNCam')); s2.collection.objects.link(cam); s2.camera = cam
    s2.use_nodes = True; nt = s2.node_tree; nt.nodes.clear()
    im = nt.nodes.new('CompositorNodeImage'); im.image = bpy.data.images.load(src)
    dn = nt.nodes.new('CompositorNodeDenoise'); dn.use_hdr = True; dn.prefilter = 'ACCURATE'
    co = nt.nodes.new('CompositorNodeComposite'); nt.links.new(im.outputs['Image'], dn.inputs['Image']); nt.links.new(dn.outputs['Image'], co.inputs['Image'])
    s2.view_settings.view_transform = 'Standard'; s2.render.image_settings.file_format = 'OPEN_EXR'; s2.render.image_settings.color_depth = '32'; s2.render.filepath = dst
    bpy.ops.render.render(write_still=True, scene=s2.name); log('denoised', dst)
def pixels(path):
    im = bpy.data.images.load(path); a = np.empty(im.size[0] * im.size[1] * 4, np.float32); im.pixels.foreach_get(a); return a.reshape(im.size[1], im.size[0], 4), im.size
def srgb(x): x = np.clip(x, 0, 1); return np.where(x <= 0.0031308, 12.92 * x, 1.055 * np.power(x, 1 / 2.4) - 0.055)
def save8(arr, size, path):
    im = bpy.data.images.new(os.path.basename(path), size[0], size[1], alpha=True, float_buffer=False); im.colorspace_settings.name = 'Non-Color'
    im.pixels.foreach_set(arr.astype(np.float32).ravel()); im.filepath_raw = path; im.file_format = 'PNG'; im.save()
meta = {}
sc.render.bake.use_pass_color = False
raw = bake('DIFFUSE', 'light', RES, pass_filter={'DIRECT', 'INDIRECT'}); denoise(raw, OUT + 'light_dn.exr', RES)
px, size = pixels(OUT + 'light_dn.exr'); rgb = np.maximum(px[..., :3], 0); lum = rgb.max(-1)
scale = float(np.percentile(lum[lum > 1e-4], 99.6)); meta['lightScale'] = scale
out = np.dstack([srgb(rgb / scale), np.ones(lum.shape)]); save8(out, size, OUT + 'light.png'); log('light scale', scale, 'p50', float(np.percentile(lum[lum > 1e-4], 50)))
sc.cycles.samples = max(16, SAMPLES // 4)
raw = bake('AO', 'ao', AO_RES); denoise(raw, OUT + 'ao_dn.exr', AO_RES)
px, size = pixels(OUT + 'ao_dn.exr'); ao = np.clip(px[..., 0], 0, 1); save8(np.dstack([ao, ao, ao, np.ones(ao.shape)]), size, OUT + 'ao.png')
json.dump(meta, open(OUT + 'meta.json', 'w')); fl.hide_render = wall.hide_render = True

# ---------------- export (geometry only; textures ship separately) ----------------
bpy.ops.object.select_all(action='DESELECT')
for o in [cab, glassO] + doors + [c for d in doors for c in d.children]: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=OUT + 'cabinet_raw.glb', use_selection=True, export_format='GLB', export_apply=True, export_image_format='NONE',
    export_texcoords=True, export_normals=True, export_lights=False, export_cameras=False, export_materials='EXPORT')
log('DONE')
