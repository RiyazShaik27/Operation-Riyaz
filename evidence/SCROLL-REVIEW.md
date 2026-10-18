# Scroll-directed experience — v1.8

## Behavior

The landing, transmission and profile screens use scroll, vertical touch swipes, Arrow Down or Page Down instead of intro action buttons. One deliberate scroll reveals the incoming message. The next accepts the mission and shows MISSION ACCEPTED before the timed investigation, breach and profile reveal. Scrolling the profile after the reveal settles opens the archive overview. Scrolling the overview or using arrows rotates the seven archives; clicking or pressing Enter opens a dossier.

Enter Cyberlab, Skip Intro, Accept Mission and Unlock Archives buttons are removed. The header Archives shortcut, Replay, Mute and accessibility settings remain usable. Neon Nocturne is fixed; legacy saved themes cannot override it and the theme selector is removed.

Wheel bursts are consumed once per chapter, with short transition locks. Scrollable message contents and dossier documents keep native scrolling. The mobile archive keeps horizontal swipe behavior. Upward scrolling can return from the transmission to the landing, or from the profile to the transmission. Replay cancels pending timers and archive transitions.

## Sound

Audio is enabled by default. The app attempts playback automatically and resumes at the first permitted click, keypress or touch gesture if the browser initially suspends AudioContext. Wheel events alone are not activation events in strict browsers. The footer reports pending sound rather than pretending playback succeeded. Mute remains available and stays muted across chapter changes within the current session.

The sound is generated locally: layered alternating alert tones, sub-bass impact, filtered noise sweeps, stereo placement, an ambient bed and reveal chords. Cues are bounded and canceled on skip/mute. The master uses filtering and dynamics compression. A short incoming-device vibration and brief breach impact accompany the alert; reduced motion removes these movements.

Primary browser references:
- https://developer.mozilla.org/en-US/docs/Glossary/Sticky_activation
- https://developer.chrome.com/blog/web-audio-autoplay

## Evidence and checks

Actual Chrome captures: evidence/scroll/01-establishing.png through 08-dossier.png.
Audio sample: evidence/scroll/cinematic-alert.wav.
Offline audio metrics: evidence/scroll/audio-verification.json (non-silent output and no clipping).
All 27 interaction tests passed in the final full run (9.1 minutes), including all seven archives at five viewport sizes, wheel momentum guards, keyboard navigation, default audio activation/muting, vertical touch chapters, horizontal archive swipes, replay, reduced motion and certificate viewing. The production build, asset integrity and production browser smoke check passed without uncaught errors. Audio rendering passed with peak 0.165, RMS 0.0187 and no clipping. See `scroll/verification-summary.json` and `regression-results.json`.

Main JavaScript bundle: 353.80 kB gzip; the existing Vite large-chunk advisory remains. The separately served human asset is 3.93 MiB.

