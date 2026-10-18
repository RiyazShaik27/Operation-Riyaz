# Accept Mission and breach audio — v1.8.1

The incoming transmission has a single Accept Mission button that enables sound and accepts the mission in the same trusted click. It synchronously requests AudioContext.resume() inside the click handler, including when sound was previously muted. Scroll, keyboard and swipe acceptance also enable sound and request audio; the button provides a reliable browser activation when wheel input cannot unlock sound.

The user-provided clip is copied unchanged to public/assets/audio/system-breached.mp3. It decodes successfully in Chrome as stereo audio with duration 2.50775 seconds. The app preloads and decodes it during the landing. The supplied clip replaces the synthesized alert at system breach; the scene holds for 2.8 seconds so the complete voice finishes before the profile appears. Muting, leaving the chapter, hiding the tab, or replaying cancels the outgoing cue. Other chapter cues retain the existing sound design.

No new audio library or external runtime request is required. The original supplied filename is recorded in public/assets/audio/SOURCES.md.

## Verification

Seven focused tests passed, covering scroll, keyboard and touch progression; click acceptance under Chrome's strict document-user-activation-required policy at 1366×768, 390×844 and 375×667; enabling previously muted audio; and stopping the voice on mute/replay. Tests probe live audio output after the master bus, verify the supplied buffer starts in a running AudioContext, and check the full clip finishes before the profile appears.

The earlier 27-test report belongs to the preceding scroll revision. The final patch build and asset checks passed. Four additional regressions passed for replay interruption, settings/sound/certificate navigation, and expanded messages on desktop and phone. Production Chrome with strict autoplay policy verified that Accept Mission changes pending audio to SOUND ON, loads the supplied MP3, completes the story, and opens all seven archives without uncaught errors. The public and production MP3 files exactly match the user-supplied bytes. See `accept-audio/verification-summary.json` and `accept-audio/regression-results.json`.
