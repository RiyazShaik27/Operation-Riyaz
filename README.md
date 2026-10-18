# Operation Riyaz 1.8.1 — Scroll-directed cinematic portfolio

A browser-based portfolio built with React, TypeScript, Three.js / React Three Fiber, GSAP and Zustand.

## Run

Use Node.js 22 or newer:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. The existing Windows launcher also works.

## Deploy to GitHub Pages

The workflow is included at `.github/workflows/deploy.yml`.

1. Create your GitHub repository and upload/push this project's source files to its `main` branch. Include the `.github` folder, `public`, and `package-lock.json` at the repository root alongside `package.json`.
2. In the repository, open **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Open **Actions → Deploy to GitHub Pages → Run workflow**, select `main`, then click **Run workflow**. This also retries an initial run if the upload happened before Pages was enabled.
4. Wait for a successful run. Open **Settings → Pages → Visit site**, or the deployment URL in the completed workflow.

Each later push to `main` rebuilds and publishes automatically. The workflow installs the locked dependencies, checks assets, builds, and uploads only `dist`. It uses GitHub's Pages base path, so the 3D model, audio, scripts and styles resolve under the repository's URL without manually editing `vite.config.ts`. No personal access token or custom secret is required. If your publishing branch has another name, replace `main` in the workflow's branch list.

For GitHub Free, use a public repository. Your source files belong at the repository root, not inside an extra `Operation-Riyaz` directory. Do not upload `node_modules`, `.asset-work`, or generated build folders; `.gitignore` excludes these when using Git.

References: [Vite's GitHub Pages guide](https://vite.dev/guide/static-deploy.html#github-pages) and [GitHub Pages setup](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Scroll-driven story

Scroll down, swipe up, or press Arrow Down / Page Down to advance. Enter, Skip Intro and Unlock Archives buttons remain removed. The incoming transmission includes an **Accept Mission** button that explicitly enables sound and begins the investigation in one click. Scroll/swipe acceptance remains available.

1. Landing → incoming transmission.
2. Incoming transmission → click Accept Mission to enable sound and show MISSION ACCEPTED, investigation and timed identity reveal. Scrolling/swiping also accepts and requests audio.
3. Profile → archive overview. Scroll the overview to orbit the seven files; click or press Enter on a file to read it.

Momentum is consumed once per gesture. Native scrolling inside expanded messages and dossiers is preserved. Swiping horizontally still rotates the mobile archive.

Neon Nocturne is the single atmosphere. Audio is enabled by default and starts automatically whenever browser autoplay policy permits. When blocked, a genuine tap, click or keypress unlocks it; wheel scrolling alone may not qualify. The footer shows this state, and the mute control remains available. The supplied system-hacked MP3 plays once at the system-breach stage. It is preloaded locally and the breach scene holds for 2.8 seconds so its approximately 2.508-second voice finishes. Other chapter cues retain layered pulses, noise sweeps, bass impacts, a soft ambient bed and reveal chords. Acceptance explicitly turns sound on, including when previously muted. Alerts fade on skip/mute; the master bus uses a compressor and a high-pass filter. Reduced motion disables the brief message vibration and camera impact.

## Earlier scene corrections

The supplied checkout was **1.6.0**, despite the request referring to an existing 1.7. The unmodified 1.6 browser captures are retained in `evidence/before/`. Version 1.7 was implemented against that baseline.

- **Physical facility:** one coherent set replaces overlapping legacy set dressing. Rounded desk edges, supported monitors, a five-leg chair, keyboard keys, server drawers/vents, cable routing and floor joints establish scale and contact. Neutral overhead light, restrained colored practical lights and cast shadows make materials readable.
- **Human operator:** a locally packaged Microsoft Rocketbox character replaces the procedural mannequin. A connected skinned body, textured face, hair, jacket, jeans, hands and 81-bone skeleton support seated keyboard reach, typing, breathing, blinks, recoil and projection gestures. Model and texture attribution are in `public/assets/operator/SOURCES.md` and the MIT notice ships alongside the asset.
- **Camera:** establishing composition reserves room for the title; transmission now cuts to a front three-quarter view; investigation cuts between a keyboard insert and operator reaction. Compact translucent message/log panels can expand for reading. A monotonic shot clock prevents choreography from falling behind story timers at low frame rates. Reduced motion holds a single composition per stage.
- **Identity reconstruction:** the main monitor shows the supplied photograph; the projected identity rises from the mounted projector with a wireframe-to-photo reveal. The portrait moves into the archive identity panel.
- **Archives:** seven upright React buttons are projected from a single world-space orbit. The duplicate WebGL wheel has been removed. Existing hover, keyboard and touch behavior remains; default orbit duration is still 2.15 seconds. GSAP Flip moves the actual selected card, remaining files and portrait toward the document layout. Navigation revisions invalidate interrupted transitions.
- **Rendering:** repeated server parts and keycaps use instancing; software rendering and smaller displays use DPR 1.
- **Compatibility:** the two pre-existing unused TypeScript declarations were corrected. All personal content, certificate images, project URLs and the résumé remain unchanged.

## Verification and evidence

```powershell
npm run check:assets
npm run build
npm run test:e2e
node scripts/capture-cinematic.mjs after
```

Browser tests use installed Chrome by default. For another installed Playwright channel, set `PLAYWRIGHT_CHANNEL` (for example, `msedge`). The capture script uses Chrome.

- `evidence/index.html`: before/after browser evidence gallery. With Vite running, open `http://localhost:5173/evidence/index.html` (use the port printed by Vite).
- `evidence/REVIEW.md`: critical review, limitations and changed-file inventory.
- `evidence/scroll/`: current scroll-driven story captures, rendered alert WAV and audio verification metrics.
- `evidence/ACCEPT-AUDIO-REVIEW.md`: current Accept Mission and supplied-clip audio behavior; 11 focused checks passed.
- `evidence/accept-audio/verification-summary.json`: patch verification, production results and supplied-clip integrity.
- `evidence/SCROLL-REVIEW.md`: current interaction, autoplay behavior and final verification (27 tests passed).
- `evidence/scroll/verification-summary.json`: current production, viewport, interaction and audio results.
- `evidence/human/verification-summary.json`: historical human replacement verification.
- `evidence/regression-results.json`: latest full interaction regression report.
- `evidence/build.log`: production build output.
- `evidence/production-smoke.json`: successful production Chrome check of the real story, handset expansion and all archives.
- `evidence/after/`: previous scene revision and current viewport regression screenshots.
- `evidence/human/`: current human replacement, full story sequence, and browser error log.
- `evidence/operator-source/before-transmission.png`: the cartoon operator before replacement.
- `tests/v17-regression.spec.ts`: five requested viewport sizes, every folder opened independently, repeat navigation, interrupted opening, settings, keyboard, certificate viewer and touch swipe.

Final visual captures and interaction tests both drive the natural flow through visible buttons and automatic story progression. Earlier baseline captures selected short-lived stages directly.

## Scope

### Expanded archive records

Every record in Identity, Education, Credentials, Projects, Skills, Experience and Achievements opens a large, scrollable detail dialog. Click the card or its explicit detail button. Project dialogs separate the overview, tools and repository links, including the supplied ASRA repository at https://github.com/RiyazShaik27/ASRA. Credentials include the original image and a link to open the document.

The dialog keeps focus inside, supports Escape/backdrop/Close dismissal, and restores the previous archive scroll position and focused control. Its close button remains visible while reading on phones. Screenshots are in `evidence/archive-popups/`; `tests/archive-details.spec.ts` covers all 24 records at desktop and phone sizes, independent wheel/touch scrolling, focus containment and source links.

This is a stylized procedural facility, not a photorealistic scanned environment. The operator now uses an externally authored rigged human model with physically based materials. Archive cards use an accessible HTML interaction layer projected from 3D coordinates; they do not receive WebGL shadows or physical occlusion. Mobile keeps the compact CSS orbit and opens documents directly. Audio combines synthesized Web Audio with the user-supplied recorded system-breach alert.

The human model is 3.93 MiB and contains its geometry, skin, clothing and hair textures locally. No additional runtime package or remote asset request is required. The Microsoft MIT license and source attribution are included with the asset. Personal portfolio assets remain the existing files.








