# Two-Event Time Synchronization

A static research portfolio using the typography, six-section layout, left navigation, and interactive 3D renderer from `golf-swing-3d-reconstruction`.

## Run locally

Install Node.js 22+ and FFmpeg (including ffprobe), then run from this repository:

```sh
node scripts/serve.mjs
```

Open http://127.0.0.1:8007. The server prepares browser-compatible H.264 previews and exact frame timestamps on its first run; later runs reuse unchanged previews. Source recordings are preserved. It supports byte-range requests for video seeking. Stop with Ctrl+C.

## Materials

- `materials/content.json`: all page copy, section order, navigation labels, and the Method tool-walkthrough video configuration.
- `materials/data/sync_UI_tool.mp4`: compressed UI walkthrough shown after the Method workflow.
- `materials/data/sync_UI_tool_poster.jpg`: still preview for the UI walkthrough.
- `materials/data/snapshot.json`: snapshot swing selection, shared duration in seconds, and trail joints.
- `materials/data/3d_results/before/<id>.json`: before reconstruction and calibration.
- `materials/data/3d_results/after/<id>.json`: after reconstruction and calibration.
- `materials/data/videos/<id>/{face-on,down-the-line}.mp4`: source videos (extension matching is case insensitive).
- `materials/data/videos/<id>/sync.json`: saved event annotations and synchronized-to-raw frame mappings.
- `materials/data/2d_detections/<id>/{face-on,down-the-line}.json`: raw detection sequences.
- `materials/data/credits.json`: optional source links keyed by swing ID.
- `materials/data/videos.json`: generated catalog; rebuilt from current source folders.
- `materials/data/previews/`: ignored generated H.264 videos and frame timestamps.

Snapshot cards follow the order of swing IDs as written in `snapshot.json`, including numeric IDs such as `12`.

Each snapshot compares the complete before/after sequences using `duration` in seconds:

```json
{
  "03": {
    "duration": 2,
    "stay": 0.5,
    "joints": ["golf_club_head"]
  }
}
```

Both sequences play once over the same two seconds, hold their final frames for `stay` seconds (0.5 seconds here), then restart together, regardless of their frame counts. `stay` defaults to 0 when omitted and must be a nonnegative finite number. No FPS or start/end range is required; full ranges and effective playback rates are derived automatically. Duration must be a positive finite number. Playback pauses when the comparison is hidden. This is a duration-normalized visual comparison, separate from event synchronization.

Both snapshot panels default to their calibrated face-on camera, using one shared crop derived from the face-on 2D body detections. This provides common image-space framing rather than fitting each reconstruction independently. Default framing fits both complete ground squares with shared padding, preserving the original ground heights. The face-on cameras retreat together when needed to keep the squares in front of the cameras. Both panels share rotation, zoom, and pan: drag to rotate, right-drag to pan, and wheel/pinch to zoom; two-finger movement also pans. Snapshot rotation retains the original 0.01 radians-per-pixel sensitivity.

Snapshots use a smooth fading window covering the most recent 80% of each sequence (2.4 seconds at a 3-second duration). Shaft history includes every valid detected frame, skipping missing detections rather than sampling at fixed time intervals. The shared `duration` and final-frame `stay` still control both sequences together.

Saved sync files contain `meta: {view: {E1, E2}}` and `mapping: {view: [rawFrame, ...]}`. View names omit extensions. Both mappings must have equal length, legal nondecreasing integer indices, and aligned event positions. Source video timestamps and raw detections are indexed through these arrays; repeated and skipped frames are preserved.

## Current material validation

All six supplied after reconstructions (00, 03, 04, 05, 06, and 12) match their saved sync timeline lengths. Synchronized playback is available for every swing. The catalog checks mappings against source videos and detections and disables playback with an explanation if a future after reconstruction has a different length. Snapshot comparisons use full independent reconstructions and normalize their playback durations.

## Check and build

```sh
node --test tests/*.test.mjs
node scripts/build-site.mjs
node scripts/serve.mjs --dist
```

The build copies only the assets required by the static page to `dist/`, including mapped previews, detection data, saved sync files, and before/after reconstructions.

## Git workflow

Work on a feature branch, run tests and the static build, then review and commit source changes with the materials needed to reproduce them. Generated previews, `dist/`, and OS files are ignored.

`.github/workflows/pages.yml` (or the retained workflow filename) checks the project and builds a GitHub Pages artifact on pushes to `main`/`master`, with a manual dispatch option. Enable GitHub Pages with **GitHub Actions** as its source in the repository settings. The workflow installs FFmpeg before preparing videos. No remote is configured or pushed by setup.
