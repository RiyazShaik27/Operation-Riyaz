# Human operator replacement

The incoming-message character was rebuilt using Microsoft Rocketbox Male Adult 07 (m013), replacing the procedural hood, face and disconnected primitive limbs.

Source and license: https://github.com/microsoft/Microsoft-Rocketbox
Full MIT notice and source details ship in public/assets/operator/.

## Implemented

- Connected, skinned human anatomy and modeled facial features, with hair and real skin/clothing texture maps.
- 81-bone skeleton posed into the existing workstation. Chair position adjusted to support the seated pelvis.
- Two-bone arm and leg solving; level palms reach the keys and feet rest near the floor.
- Subtle typing, breathing, blinks, head turns, breach recoil and identity-reveal gesture.
- The transparent message handset, expansion controls, cameras, archive interactions and portfolio content retain their previous behavior.
- A self-contained 3.93 MiB GLB carries all geometry and textures. Body/hair color maps are 1024px, head color is 2048px, and normal maps are 1024px. Only two facial blink targets are retained from the original 175 targets.

## Browser evidence

The real Chrome story sequence is captured in evidence/human/:
- 02-transmission.png: the seated textured human during the incoming message.
- 03-investigation.png: keyboard insert and visible human hands.
- 03b-operator-response.png: the operator's face and upper body.
- 01-establishing.png through 08-dossier.png: continuity across the experience.

The matching pre-replacement frame is evidence/operator-source/before-transmission.png.
Capture completed with no uncaught browser errors. The production build, asset integrity check and production Chrome smoke test passed. The smoke check verifies local human asset delivery, story progression, handset expansion and all seven archives.

All 24 interaction checks are verified across 1920×1080, 1649×928, 1366×768, 1280×720 and 390×844: 23 passed in the full run; one story case was interrupted by a development preview reload and passed on an isolated rerun. No application source changed between those runs. Both raw reports and the original failure trace are retained in evidence/human/. See verification-summary.json for the report links.

The production JavaScript bundle is 352.33 kB gzip. Vite retains its existing large-chunk advisory; the separate 3.93 MiB character asset is additional to that bundle.

This is a textured real-time character asset. Its close-up fidelity is bounded by the source model and scene lighting; it is not a live-action person.

