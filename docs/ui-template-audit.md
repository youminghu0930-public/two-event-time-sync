# Template and mobile review

Reference: sibling `golf-swing-3d-reconstruction` checkout.

Base fonts, colors, navigation, section layout, camera selector, distance slider, and playback controls retain the template styles. Intentional differences are paired before/after snapshots, the centered shared title and crown, linked snapshot gestures, the 80% detection-based shaft history, saved sync mapping, outcome metrics, and the tool walkthrough.

## Corrections

- Results uses the template's exact failure text: “Video playback is unavailable. The 3D animation continues; tap Play to retry.” No separate load button was introduced.
- The existing control presents Play when retry is needed, even if the independent 3D timeline is still running. One tap retries video loading/unlocking.
- Play reloads failed or metadata-only stalled sources and attempts muted inline playback directly within the gesture. Source-frame selection still follows sync.json.
- Decoder waits have a bounded timeout. A missing seek completion cannot freeze the 3D animation; stale playback loops cannot resume after pause or a swing change.
- Inactive snapshots release their WebGL contexts. Every card reserves full-size labeled placeholders, including unvisited rear cards. Background stills are prepared sequentially; existing stills remain until both new scenes are ready. Returning restores playback position and shared navigation state.
- Mobile carousel arrows retain their visible styling with expanded invisible hit areas; dot targets are at least 44px.

## Validation and limits

27 Node regression tests cover synchronization, seeking, frame keys, camera transitions, banner mapping, source retry, decoder timeout/cancellation, and snapshot ordering. Static build passes.

Desktop in-app browser checks exercised the retry presentation, continued 3D playback during video unavailability, frame stepping, carousel switching and remounting, two live snapshot canvases, and no horizontal document overflow at 1265px.

Mobile review covered responsive CSS, inline/muted media attributes, touch gestures, touch targets, and graphics-resource lifetime. A phone viewport and physical iOS Safari were not available through the current browser controls. Successful decoder recovery and touch behavior on a real iPhone remain unverified; the tested fallback continues 3D playback and exposes Play to retry when sources remain unavailable.

Carousel loading follow-up: all five cards measured 573px high with 460px preview windows in the desktop browser. Rear cards displayed cached stills, rapid selection preserved full card geometry, and only the active pair retained live snapshot canvases.
