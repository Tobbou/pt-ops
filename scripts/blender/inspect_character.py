"""
Report what a Mixamo FBX actually contains, before anything is built on it.

    blender --background --python scripts/blender/inspect_character.py -- <path.fbx>

Prints the armature's bone hierarchy and names, mesh and material counts, texture sizes,
and the rest pose, which are the things that decide whether the conversion can drive the
rig and how much the web build will weigh.
"""

import sys
from pathlib import Path

import bpy


def arg_after_dashes() -> Path:
    argv = sys.argv
    if "--" not in argv:
        raise SystemExit(__doc__)
    return Path(argv[argv.index("--") + 1])


def clear_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)


def main() -> None:
    path = arg_after_dashes()
    clear_scene()
    bpy.ops.import_scene.fbx(filepath=str(path))

    armatures = [o for o in bpy.data.objects if o.type == "ARMATURE"]
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]

    print("\n===== CHARACTER REPORT =====")
    print(f"file            {path.name}  ({path.stat().st_size / 1e6:.1f} MB)")
    print(f"objects         {len(bpy.data.objects)}")
    print(f"armatures       {len(armatures)}")
    print(f"meshes          {len(meshes)}")

    total_verts = sum(len(m.data.vertices) for m in meshes)
    total_tris = sum(len(m.data.loop_triangles) for m in meshes)
    for m in meshes:
        m.data.calc_loop_triangles()
    total_tris = sum(len(m.data.loop_triangles) for m in meshes)
    print(f"vertices        {total_verts}")
    print(f"triangles       {total_tris}")

    print(f"\nmaterials       {len(bpy.data.materials)}")
    for mat in bpy.data.materials:
        print(f"  - {mat.name}")

    print(f"\nimages          {len(bpy.data.images)}")
    for img in bpy.data.images:
        if img.size[0]:
            print(f"  - {img.name:40} {img.size[0]}x{img.size[1]}  packed={bool(img.packed_file)}")

    for arm in armatures:
        bones = arm.data.bones
        print(f"\narmature '{arm.name}': {len(bones)} bones")
        roots = [b for b in bones if b.parent is None]

        def walk(bone, depth=0):
            print(f"  {'  ' * depth}{bone.name}")
            for child in bone.children:
                walk(child, depth + 1)

        for r in roots:
            walk(r)

    print("\n===== END REPORT =====")


if __name__ == "__main__":
    main()
