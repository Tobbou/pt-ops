"""
Turn the Mixamo character FBX into a web-sized GLB.

    blender --background --python scripts/blender/build_character.py -- \
        --in assets/mixamo/character/character.fbx \
        --out public/character.glb \
        --texture 512

Mixamo ships studio-sized textures: the reference character is 52 MB, of which almost all
is four 4096-square maps and four 2048s. The figure is drawn about 300 pixels tall on a
phone, so those are three orders of magnitude more than the screen can show. Resizing
them and letting the glTF exporter write WebP is the whole job; the mesh itself is 48k
triangles, which mobile handles without complaint.

The finger bones stay. glTF only writes animation tracks for bones that actually move, so
forty unanimated finger bones cost nothing per clip, and deleting them would mean
transferring their vertex weights first.
"""

import argparse
import sys
from pathlib import Path

import bpy


def parse_args() -> argparse.Namespace:
    argv = sys.argv
    if "--" not in argv:
        raise SystemExit(__doc__)
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="src", required=True, type=Path)
    ap.add_argument("--out", dest="dst", required=True, type=Path)
    ap.add_argument("--texture", type=int, default=512, help="max texture dimension")
    ap.add_argument("--quality", type=int, default=80, help="WebP quality, 0-100")
    ap.add_argument("--decimate", type=float, default=1.0, help="triangle ratio to keep, 0-1")
    ap.add_argument("--preview", type=Path, help="also render a PNG of the result")
    ap.add_argument(
        "--drop",
        default="",
        help="comma-separated mesh name fragments to delete, e.g. Shirt,Shoes,Socks",
    )
    return ap.parse_args(argv[argv.index("--") + 1:])


def resize_images(limit: int) -> None:
    for img in bpy.data.images:
        w, h = img.size
        if not w or not h:
            continue
        biggest = max(w, h)
        if biggest <= limit:
            continue
        scale = limit / biggest
        new = (max(1, int(w * scale)), max(1, int(h * scale)))
        img.scale(*new)
        print(f"  resized {img.name}: {w}x{h} -> {new[0]}x{new[1]}")


def drop_meshes(fragments: list[str]) -> None:
    """
    Delete whole garment meshes by name.

    Mixamo characters keep each garment as its own mesh, so undressing the figure is a
    delete rather than a modelling job. Whether the body underneath is complete is the
    thing to check: some characters cut the torso away where a shirt covers it, and that
    only shows once the shirt is gone.
    """
    doomed = [
        o
        for o in bpy.data.objects
        if o.type == "MESH" and any(f.lower() in o.name.lower() for f in fragments)
    ]
    for obj in doomed:
        print(f"  dropped {obj.name} ({len(obj.data.polygons)} faces)")
        bpy.data.objects.remove(obj, do_unlink=True)
    kept = [o.name for o in bpy.data.objects if o.type == "MESH"]
    print(f"  kept: {', '.join(kept)}")


def decimate(ratio: float) -> None:
    """
    Collapse triangles down to `ratio` of the original.

    Collapse rather than un-subdivide, because it keeps the vertex groups the skinning
    depends on. The figure is drawn a few hundred pixels tall, so most of a 48k-triangle
    film asset is detail the screen cannot resolve.
    """
    if ratio >= 1.0:
        return
    for obj in [o for o in bpy.data.objects if o.type == "MESH"]:
        before = len(obj.data.polygons)
        mod = obj.modifiers.new(name="decimate", type="DECIMATE")
        mod.decimate_type = "COLLAPSE"
        mod.ratio = ratio
        mod.use_collapse_triangulate = True
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=mod.name)
        print(f"  {obj.name}: {before} -> {len(obj.data.polygons)} faces")


def render_preview(path: Path) -> None:
    """Front three-quarter view, so the build can be eyeballed without opening Blender."""
    scene = bpy.context.scene
    # Cycles, not Eevee: Eevee needs a GL context and silently writes nothing under
    # --background on a headless machine. A few samples at this size costs seconds.
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 24
    scene.cycles.use_denoising = True
    prefs = bpy.context.preferences.addons.get("cycles")
    if prefs:
        try:
            prefs.preferences.compute_device_type = "OPTIX"
            prefs.preferences.get_devices()
            for d in prefs.preferences.devices:
                d.use = d.type != "CPU"
            scene.cycles.device = "GPU"
        except Exception as err:  # no CUDA/OptiX build, fall back to the CPU
            print(f"  GPU unavailable ({err}), rendering on CPU")
    scene.render.resolution_x = 480
    scene.render.resolution_y = 720
    scene.render.film_transparent = False
    scene.world = bpy.data.worlds.new("w")
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs[0].default_value = (0.06, 0.08, 0.11, 1)
    scene.world.node_tree.nodes["Background"].inputs[1].default_value = 1.2

    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    zs = [(o.matrix_world @ v.co).z for o in meshes for v in o.data.vertices]
    height = max(zs) - min(zs)
    mid = (max(zs) + min(zs)) / 2

    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 60
    cam = bpy.data.objects.new("cam", cam_data)
    scene.collection.objects.link(cam)
    dist = height * 1.9
    cam.location = (dist * 0.55, -dist * 0.85, mid + height * 0.08)
    cam.rotation_euler = (1.5708, 0, 0.573)
    scene.camera = cam

    key = bpy.data.objects.new("key", bpy.data.lights.new("key", type="AREA"))
    key.data.energy = height * height * 90
    key.data.size = height * 0.8
    key.location = (dist * 0.7, -dist * 0.8, mid + height)
    key.rotation_euler = (0.9, 0, 0.7)
    scene.collection.objects.link(key)

    path.parent.mkdir(parents=True, exist_ok=True)
    # Absolute: Blender resolves a relative render path against the .blend file, and with
    # no .blend open that lands at the drive root rather than the working directory.
    scene.render.filepath = str(path.resolve())
    bpy.ops.render.render(write_still=True)
    print(f"  preview -> {path}")


def main() -> None:
    args = parse_args()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=str(args.src))

    if args.drop:
        print("dropping meshes")
        drop_meshes([f.strip() for f in args.drop.split(",") if f.strip()])

    print("resizing textures")
    resize_images(args.texture)

    if args.decimate < 1.0:
        print("decimating")
        decimate(args.decimate)

    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    for m in meshes:
        m.data.calc_loop_triangles()
    tris = sum(len(m.data.loop_triangles) for m in meshes)

    args.dst.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(args.dst),
        export_format="GLB",
        export_image_format="WEBP",
        export_image_quality=args.quality,
        # Nothing is animated yet: this is the character on its own, and the clips are
        # added by the animation build.
        export_animations=False,
        export_skins=True,
        export_morph=False,
        export_apply=False,
        export_yup=True,
        export_cameras=False,
        export_lights=False,
    )

    size = args.dst.stat().st_size
    print(f"\n{args.dst}  {size / 1e6:.2f} MB  ({tris} triangles, texture cap {args.texture})")

    if args.preview:
        render_preview(args.preview)


if __name__ == "__main__":
    main()
