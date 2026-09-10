"""
Extract per-frame 3D pose landmarks from an exercise video.

Runs MediaPipe's pose landmarker over every frame and writes the result to an .npz for
the conversion step. Kept separate from the conversion because this is the slow part and
because the raw landmarks are worth keeping: retuning the mapping should not mean
re-running the model.

    python mocap/extract.py mocap/source/pushup-4945123.mp4 mocap/data/push-up.npz

Outputs, per frame:
    image  (N, 33, 3)  normalised image coordinates, x/y in 0..1, z relative depth
    world  (N, 33, 3)  metric coordinates in metres, origin at the hip midpoint
    vis    (N, 33)     visibility, 0..1
Frames where no person is detected are recorded as NaN and dropped downstream.
"""

import sys
from pathlib import Path

import cv2
import numpy as np
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision
import mediapipe as mp

MODEL = Path(__file__).parent / "models" / "pose_landmarker_heavy.task"


def extract(video_path: Path, out_path: Path) -> None:
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise SystemExit(f"cannot open {video_path}")
    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    # The model is handed over as bytes, not as a path. MediaPipe's C layer cannot open a
    # path containing non-ASCII characters, and this repository lives under "Træning PWA".
    options = vision.PoseLandmarkerOptions(
        base_options=mp_python.BaseOptions(model_asset_buffer=MODEL.read_bytes()),
        running_mode=vision.RunningMode.VIDEO,
        num_poses=1,
        # The defaults reject too much on a dim gym floor; the tracker recovers fine.
        min_pose_detection_confidence=0.4,
        min_pose_presence_confidence=0.4,
        min_tracking_confidence=0.4,
        output_segmentation_masks=False,
    )

    image_pts, world_pts, vis_pts = [], [], []
    detected = 0
    with vision.PoseLandmarker.create_from_options(options) as landmarker:
        index = 0
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
            timestamp_ms = int(index * 1000 / fps)
            result = landmarker.detect_for_video(mp_image, timestamp_ms)

            if result.pose_landmarks:
                lm = result.pose_landmarks[0]
                wl = result.pose_world_landmarks[0]
                image_pts.append([[p.x, p.y, p.z] for p in lm])
                world_pts.append([[p.x, p.y, p.z] for p in wl])
                vis_pts.append([p.visibility for p in lm])
                detected += 1
            else:
                image_pts.append(np.full((33, 3), np.nan))
                world_pts.append(np.full((33, 3), np.nan))
                vis_pts.append(np.zeros(33))
            index += 1
            if index % 60 == 0:
                print(f"  {index}/{total} frames", flush=True)

    cap.release()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(
        out_path,
        image=np.asarray(image_pts, dtype=np.float32),
        world=np.asarray(world_pts, dtype=np.float32),
        vis=np.asarray(vis_pts, dtype=np.float32),
        fps=np.float32(fps),
        source=str(video_path),
    )
    print(f"{detected}/{index} frames with a detected pose -> {out_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    extract(Path(sys.argv[1]), Path(sys.argv[2]))
