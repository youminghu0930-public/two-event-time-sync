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

## Hero banner

The title banner uses the reconstruction template’s face-on video and 3D composition. Configure `page.banner` in `materials/content.json` (`enabled`, `swing`, `label`, and playback `fps`). Club history includes every valid detected frame, skipping missing detections rather than sampling at fixed time intervals. It uses the after reconstruction and the selected swing’s saved sync mapping, loops over the mapped interval, and pauses when offscreen or when the page is hidden.

## Playback recovery and template review

Results uses the template’s existing Play control and message: “Video playback is unavailable. The 3D animation continues; tap Play to retry.” Play reloads failed or stalled video sources and attempts to unlock muted inline playback directly from the user gesture. Decoder waits are bounded so a failed video cannot freeze the 3D timeline. Exact saved frame mappings are retained.

Every snapshot card reserves both labeled, fixed-height panels with a loading placeholder from the start. The active pair keeps live WebGL scenes; background stills are prepared sequentially and remain visible while a selected card initializes. Both panels reveal together once ready. Revisiting restores playback position and shared navigation state. This limits mobile graphics resource use without changing the carousel controls. Base typography, navigation, camera buttons, distance slider, and playback controls follow the 3D reconstruction template. Paired snapshots, crown, synchronized mapping, gesture text, and the walkthrough are intentional additions. Physical iOS/Safari testing is still needed; automated checks and desktop browser tests do not establish real-device compatibility.

Viewer gesture and keyboard instructions now use the template’s info icons beside the Snapshots and Videos headings. Click/tap or use the keyboard to open them; click outside or press Escape to close. The Results player uses the latest compact frame-counter/control row and the bordered, name-only navigator with a video-count badge. Source-video and reconstruction error messages remain visible below the controls.

The Results video section renders its raw 2D joint rings, centers and connections as native SVG circles and paths (`vector-2d-overlay.js`). They are projected from the calibrated video planes on each scene update, retain the side colors, omit the shaft midpoint, and follow pan, zoom, rotation and resizing. Opaque scene geometry is checked for occlusion; the SVG viewport clips offscreen content. The video imagery and reconstructed 3D skeleton remain WebGL-rendered. This is enabled only for the video section; snapshots and banners retain their existing rendering.
