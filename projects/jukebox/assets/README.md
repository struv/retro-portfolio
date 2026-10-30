# Jukebox assets

The active collection uses eleven root `audio/*.mp3` files. The original six generated covers use WebP at runtime, with their PNG sources retained in `covers/`. The five October 30 additions use original geometric SVG covers as temporary artwork while the expanded collection is reviewed. These SVGs were authored directly and contain no external assets. See `../tracks.js` for exact mappings and `../README.md` for the agent handoff. Exact ImageGen prompts and provenance for the original six covers are in `covers/prompts-a.md` and `covers/prompts-b.md`.

## Archived prototype assets

The following describes the older SVG/WAV placeholders retained here for reference. None are referenced by the active track catalogue.

All five cover illustrations are original SVG geometry created for this prototype.
All five audio files are original synthesized instrumental loops: no recordings,
external samples, licensed tracks, services, or network requests are used.

Regenerate audio with `python3 generate_audio.py` from this folder. It requires
only the Python standard library. WAV files are 22,050 Hz, mono, signed 16-bit PCM.
Each contains eight bars (about 20–22 seconds); overlapping tails wrap into the
start of the loop. An 8 ms boundary fade suppresses audio clicks. Peaks are limited
to 80% of full scale. These are replaceable demo compositions, not album releases.

Update `../tracks.js` to supply your own titles, colors, cover art, and audio.
