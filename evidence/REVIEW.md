# Cinematic review — scene pass

The subsequent human character replacement and its current verification are documented in [HUMAN-REVIEW.md](./HUMAN-REVIEW.md). This review records the earlier scene and interaction corrections.

## Evidence and status

The supplied checkout identified itself as 1.6.0. Its actual Chrome screenshots are preserved in `before/`. An interim v1.7 render is preserved in `review/`. The latest revision responds to the subsequent request for a front-facing camera and smaller, transparent incoming messages.

The latest revision has been captured through the real Chrome interaction sequence in `after/`. The initial front angle was revised after a monitor back blocked the operator. A second review shortened the arm reach and moved the seated posture toward the keyboard. The final full regression run passed all 24 tests in 6.7 minutes.

## Five largest shortcomings in the captured result

1. **Message obstructs the physical action.** `review/02-transmission.png` shows an opaque panel covering the operator and much of the desk. The latest implementation replaces it with a 330px translucent handset, with an explicit expand/collapse control. The reconstruction terminal defaults to a small two-line live log and can expand.
2. **Camera coverage lacks contrast.** The interim transmission and investigation views are similar rear/side compositions. The latest sequence introduces a front three-quarter shot, a close keyboard insert, a front reaction and a wider breach shot. Cuts cross the workstation axis without moving through the monitor geometry; short lens-axis pushes settle into each shot.
3. **Operator reads as assembled primitives.** The captured silhouette has an egg-shaped torso and hood with smooth cylindrical arms. The latest geometry uses shaped garment cross sections, sleeve folds, jacket closure, drawstrings and a recessed masked face. Existing arm solving and keyboard contact remain. This remains a procedural character, not a scanned or production-quality human asset.
4. **Environment lacks convincing reverse-angle coverage.** Flat wall panels and sparse set details do little to establish an occupied workplace. The latest set adds a rear service wall, window frames, storage drawers and a practical desk lamp. The earlier facility pass added supported monitors, cable routing, server vents, layered desk construction, chair wheels and contact shadows.
5. **Spatial continuity was split across competing layers.** Baseline archive screenshots show duplicate physical and HTML folder representations. The earlier pass consolidated these into one projected, upright interactive orbit, with the actual selected card moving into the dossier layout. Remaining limitation: these HTML cards do not receive physical WebGL occlusion or shadows. The identity reconstruction is a flat portrait in a 3D projection volume, not a volumetric human reconstruction.

## Verification

- Final revision: 24 interaction tests passed, including natural story progression and all seven archive categories at 1920×1080, 1649×928, 1366×768, 1280×720 and 390×844, plus interruption, keyboard, touch, settings, sound, certificate viewer and handset/log expansion.
- Production build and asset check pass. Main JavaScript bundle: 331.71 kB gzip; Vite still reports its large-chunk advisory. Build output is in `build.log`.
- Latest browser screenshots: captured through real buttons and natural story progression; no uncaught browser errors. Production browser smoke check passes: HTTP 200, canvas, real story progression, handset expansion and all seven archives; no uncaught browser errors. See `production-smoke.json`.
- No recorded browser video is available. Existing screenshots are actual Chrome captures, not mockups.

## Changed areas

Scene: Facility, CyberLab, OperatorRig, ShotDirector, SignalBridge, SceneEnhancements, SpatialArchives, archiveLayout.
Interaction/layout: Story, Archive, store, cinematic.css, main stylesheet import.
Validation: Playwright configuration, v17-regression tests, capture-cinematic and smoke-production scripts.

No portfolio content, project destination, certificate image or résumé was replaced. The subsequent character pass adds a locally packaged, MIT-licensed Microsoft Rocketbox human model and embedded textures. Its license and attribution ship with the asset. No new runtime package was added.



