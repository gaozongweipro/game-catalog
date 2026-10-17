# Blender 4.2 headless: keep-case shell parts for PS5 / Switch (NS, NS2) authored in the createCaseModel() group frames.
# Exported geometry-only (materials stay runtime: shell PP / tray PP). Authoring in three.js coords; T(): three (x,y,z) -> Blender (x,-z,y).
import bpy, bmesh, math, os
from mathutils import Vector
OUT = '/workspace/proto-assets/cab/'
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
def T(x, y, z): return Vector((x, -z, y))
def link(o): sc.collection.objects.link(o); return o
def obj(name, bm):
    me = bpy.data.meshes.new(name); bm.normal_update(); bm.to_mesh(me); bm.free(); return link(bpy.data.objects.new(name, me))
def apply_mods(o):
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
    o.select_set(False)
def bevel(o, w, seg=3, ang=35):
    m = o.modifiers.new('bev', 'BEVEL'); m.width = w; m.segments = seg; m.limit_method = 'ANGLE'; m.angle_limit = math.radians(ang); m.harden_normals = False; return m
def smooth(o):
    for p in o.data.polygons: p.use_smooth = True
    w = o.modifiers.new('wn', 'WEIGHTED_NORMAL'); w.keep_sharp = True; w.weight = 50
def boolean(o, cutter, op='DIFFERENCE'):
    m = o.modifiers.new('b', 'BOOLEAN'); m.operation = op; m.object = cutter; m.solver = 'EXACT'; apply_mods(o); bpy.data.objects.remove(cutter)
def join(objs, name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]; bpy.ops.object.join(); o = bpy.context.active_object; o.name = name; o.data.name = name; return o
def rr(w, h, r, cx=0.0, cy=0.0, seg=8, square_right=False):
    """rounded-rect outline (CCW) in the x/y plane"""
    pts = []; hw, hh = w / 2, h / 2
    for (qx, qy, a0) in ((hw, -hh, -90), (hw, hh, 0), (-hw, hh, 90), (-hw, -hh, 180)):
        if square_right and qx > 0: pts.append((cx + qx, cy + qy)); continue
        ox, oy = qx - math.copysign(r, qx), qy - math.copysign(r, qy)
        for k in range(seg + 1):
            a = math.radians(a0 + 90 * k / seg); pts.append((cx + ox + r * math.cos(a), cy + oy + r * math.sin(a)))
    return pts
def prism(name, pts, z0, z1):
    """closed prism: x/y outline extruded along three z"""
    bm = bmesh.new(); lo = [bm.verts.new(T(x, y, z0)) for x, y in pts]; hi = [bm.verts.new(T(x, y, z1)) for x, y in pts]
    bm.faces.new(lo); bm.faces.new(hi[::-1]); n = len(pts)
    for i in range(n): bm.faces.new((lo[i], lo[(i + 1) % n], hi[(i + 1) % n], hi[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); return obj(name, bm)
def prism_x(name, pts_yz, x0, x1):
    bm = bmesh.new(); a = [bm.verts.new(T(x0, y, z)) for y, z in pts_yz]; b = [bm.verts.new(T(x1, y, z)) for y, z in pts_yz]
    bm.faces.new(a); bm.faces.new(b[::-1]); n = len(a)
    for i in range(n): bm.faces.new((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); return obj(name, bm)
def box(name, w, h, d, x, y, z):
    return prism(name, [(x - w / 2, y - h / 2), (x + w / 2, y - h / 2), (x + w / 2, y + h / 2), (x - w / 2, y + h / 2)], z - d / 2, z + d / 2)
def lathe(name, prof, seg=64):
    """closed (r, z) profile spun about the three z axis"""
    bm = bmesh.new(); rings = []
    for s in range(seg):
        f = 2 * math.pi * s / seg; rings.append([bm.verts.new(T(r * math.cos(f), r * math.sin(f), z)) for r, z in prof])
    n = len(prof)
    for s in range(seg):
        A, B = rings[s], rings[(s + 1) % seg]
        for i in range(n):
            j = (i + 1) % n
            if A[i] is A[j]: continue
            try: bm.faces.new((A[i], A[j], B[j], B[i]))
            except ValueError: pass
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); return obj(name, bm)
def sector(name, r0, r1, a0, a1, z0, z1, n=24, inner=None):
    out = [(r1 * math.cos(a0 + (a1 - a0) * k / n), r1 * math.sin(a0 + (a1 - a0) * k / n)) for k in range(n + 1)]
    b0, b1 = inner or (a0, a1)
    inn = [(r0 * math.cos(b1 + (b0 - b1) * k / n), r0 * math.sin(b1 + (b0 - b1) * k / n)) for k in range(n + 1)]
    return prism(name, out + inn, z0, z1)
def cup(name, w, h, r, zf, zr, t, notch=None):
    """moulded half shell: floor at zf, walls to the seam zr, spine-side (-x) wall open, solidified inward by t"""
    pts = rr(w, h, r, seg=10); bm = bmesh.new(); fl = [bm.verts.new(T(x, y, zf)) for x, y in pts]; rm = [bm.verts.new(T(x, y, zr)) for x, y in pts]
    bm.faces.new(fl); n = len(pts)
    for i in range(n):
        j = (i + 1) % n
        if pts[i][0] < -w / 2 + 1e-6 and pts[j][0] < -w / 2 + 1e-6: continue   # open spine side (living hinge strip closes it)
        bm.faces.new((fl[i], fl[j], rm[j], rm[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    f0 = [f for f in bm.faces if len(f.verts) == n][0]; want = T(0, 0, -1 if zf < zr else 1) - T(0, 0, 0)
    if f0.normal.dot(want) < 0: bmesh.ops.reverse_faces(bm, faces=bm.faces)
    o = obj(name, bm); bevel(o, 0.0045, 4, 30); s = o.modifiers.new('sol', 'SOLIDIFY'); s.thickness = t; s.offset = -1; s.use_even_offset = True; s.use_rim = True
    apply_mods(o)
    if notch:  # Elite-style stadium finger scoop straddling the seam, cut through the outer ~55 % of the opening wall
        YC, NW, ND = notch; k = 12; P = []
        for q in range(k + 1): a = -math.pi / 2 + math.pi * q / k; P.append((YC + NW / 2 - ND + ND * math.cos(a), ND * math.sin(a)))
        for q in range(k + 1): a = math.pi / 2 + math.pi * q / k; P.append((YC - NW / 2 + ND + ND * math.cos(a), ND * math.sin(a)))
        boolean(o, prism_x('cut', P, w / 2 - t * 0.55, w / 2 + 0.05))
    smooth(o); apply_mods(o); return o
def clip(name, X, yc):
    """booklet clip: rounded loop tab with window + riser, authored in clip-local coords and mapped by X()"""
    tab = prism(name + 'T', [X(x, y) for x, y in rr(0.15, 0.15, 0.025, -0.075, yc, 6, True)], 0, 1)  # placeholder z, replaced below
    bpy.data.objects.remove(tab)
def build(plat):
    if plat == 'ps5': W, H, D, T_, RC = 1.35, 1.70, 0.135, 0.011, 0.038
    else: W, H, D, T_, RC = 1.05, 1.70, 0.11, 0.010, 0.034
    HALF = D / 2; CR = 0.0045; NSW = plat != 'ps5'
    notch = None if NSW else (0.1, 0.56, min(HALF * 0.95, HALF * 0.42))
    objs = {}
    objs['BaseShell'] = cup(plat + '_BaseShell', W, H, RC, -HALF, -0.0004, T_, notch)
    objs['CoverShell'] = cup(plat + '_CoverShell', W, H, RC, HALF, 0.0004, T_, notch)
    # spine strip with radiused long edges + end blocks (spineG frame = root - (-W/2, 0, -HALF))
    st = box('st', T_, H - 0.004, D - 2 * CR, -W / 2 - T_ / 2, 0, 0); bevel(st, T_ * 0.42, 4, 30); apply_mods(st)
    parts = [st]
    for sy in (-1, 1):
        b = box('blk', T_ * 1.6, 0.05, D - 2 * CR - 0.012, -W / 2 + T_ * 0.8, sy * (H / 2 - 0.004 - 0.025), 0); bevel(b, 0.002, 2); apply_mods(b); parts.append(b)
    sp = join(parts, plat + '_Spine'); sp.location = T(W / 2, 0, HALF); bpy.ops.object.select_all(action='DESELECT'); sp.select_set(True); bpy.context.view_layer.objects.active = sp
    bpy.ops.object.transform_apply(location=True); smooth(sp); apply_mods(sp); objs['Spine'] = sp
    # booklet clips
    cl = []
    def mk_clip(X, Z, yc):
        tab = prism('tab', [X(x, y) for x, y in rr(0.15, 0.15, 0.025, -0.075, yc, 6, True)], *sorted((Z(-0.0245), Z(-0.0245 + 0.0028))))
        hole = prism('hole', [X(x, y) for x, y in rr(0.085, 0.09, 0.02, -0.08, yc, 6)], min(Z(-0.03), Z(0.01)), max(Z(-0.03), Z(0.01)))
        boolean(tab, hole); bevel(tab, 0.0007, 2, 30); apply_mods(tab)
        xr, _ = X(0.001, 0); ri = box('ris', 0.006, 0.15, 0.023, xr, yc, Z(-0.0115)); bevel(ri, 0.0012, 2); apply_mods(ri); cl.extend([tab, ri])
    if not NSW:
        X = lambda x, y: (W / 2 - T_ - 0.002 + x, y); Z = lambda z: HALF - T_ + z
        for yc in (0.62, -0.62): mk_clip(X, Z, yc)
    else:  # mirrored clips on the tray half, spine side
        X = lambda x, y: (-W / 2 + T_ + 0.002 - x, y); Z = lambda z: -HALF + T_ - z
        for yc in (0.3, -0.02): mk_clip(X, Z, yc)
    c = join(cl, plat + '_Clips'); smooth(c); apply_mods(c); objs['Clips'] = c
    if not NSW:  # hub frame: (DISC_X, DISC_Y, TRAY_Z)
        hp = [lathe('land', [(0.135, 0), (0.205, 0), (0.205, 0.003), (0.19, 0.0055), (0.15, 0.0055), (0.135, 0.004)]),
              lathe('collar', [(0.086, 0), (0.104, 0), (0.104, 0.010), (0.099, 0.0125), (0.088, 0.0125)])]
        for a0, a1 in ((0.32, math.pi - 0.32), (math.pi + 0.32, 2 * math.pi - 0.32)):
            s1 = sector('well', 0.606, 0.626, a0, a1, 0, 0.014, 48); bevel(s1, 0.0008, 2); apply_mods(s1)
            s2 = sector('step', 0.626, 0.648, a0 - 0.05, a1 + 0.05, 0, 0.006, 48); bevel(s2, 0.0008, 2); apply_mods(s2); hp += [s1, s2]
        hb = join(hp, plat + '_HubBase'); smooth(hb); apply_mods(hb); objs['HubBase'] = hb
        N, gap = 12, 0.055; a0, a1 = gap, 2 * math.pi / N - gap; mid = (a0 + a1) / 2
        p1 = sector('pet', 0.047, 0.0745, a0, a1, 0, 0.019, 10, (mid - (mid - a0) * 0.55, mid + (a1 - mid) * 0.55)); bevel(p1, 0.0012, 3, 30); apply_mods(p1)
        p2 = sector('lip', 0.066, 0.0795, a0 + 0.03, a1 - 0.03, 0.0165, 0.02, 10); bevel(p2, 0.0011, 2, 30); apply_mods(p2)
        tt = join([p1, p2], plat + '_Tooth'); smooth(tt); apply_mods(tt); objs['Tooth'] = tt
    else:
        cw, ch, fw, fd = 0.222, 0.322, 0.016, 0.02
        fr = prism('fr', rr(cw + 2 * fw, ch + 2 * fw, 0.02, seg=8), 0, fd); inn = prism('in', rr(cw, ch, 0.006, seg=6), -0.01, fd + 0.01); boolean(fr, inn); bevel(fr, 0.0015, 2, 30); apply_mods(fr)
        fl = prism('fl', rr(cw, ch, 0.012, seg=6), 0, 0.003); hp = [fr, fl]
        for sx in (-1, 1):
            hp.append(box('c', 0.008, 0.07, fd + 0.012, sx * (cw / 2 + 0.002), 0.04, (fd + 0.012) / 2)); hp.append(box('l', 0.012, 0.06, 0.004, sx * (cw / 2 - 0.004), 0.04, fd + 0.01))
        hp.append(box('bl', 0.09, 0.012, 0.004, 0, -ch / 2 + 0.004, fd + 0.01)); hp.append(box('bb', 0.09, 0.008, fd + 0.012, 0, -ch / 2 - 0.002, (fd + 0.012) / 2))
        for o in hp[2:]: bevel(o, 0.0008, 2); apply_mods(o)
        h = join(hp, plat + '_CardHolder'); smooth(h); apply_mods(h); objs['CardHolder'] = h
    return objs
allo = []
for p in ('ps5', 'ns'): allo += list(build(p).values())
for o in allo: print('PART', o.name, len(o.data.vertices))
bpy.ops.object.select_all(action='DESELECT')
for o in allo: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=OUT + 'case_parts_raw.glb', use_selection=True, export_format='GLB', export_apply=True, export_materials='NONE', export_texcoords=False, export_normals=True)
print('DONE')
