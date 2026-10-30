# Portfolio jukebox: agent handoff

This is part of the root **static HTML/CSS/JavaScript portfolio**, not the nested `ai-scheduler/` app. The homepage, blog listing and blog posts share one continuous music player. The standalone player uses the same disc scene, track catalogue and audio controller with its original looping behavior. No build, package install, backend, or API key is required to run the site.

## Run locally

From the portfolio root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

- Homepage: <http://127.0.0.1:8765/index.html#welcome-scene>
- Blog: <http://127.0.0.1:8765/blog.html>
- Standalone player: <http://127.0.0.1:8765/projects/jukebox.html>
- Scroll tests: `node --test tests/opening-scroll.mjs`
- Browser navigation regression: `PORTFOLIO_URL=http://127.0.0.1:8765 node tests/continuous-player.cjs`
- Disc input and animation regression: `PORTFOLIO_URL=http://127.0.0.1:8765 node tests/disc-interactions.cjs`
- Genre browser regression: `PORTFOLIO_URL=http://127.0.0.1:8765 node tests/genre-browser.cjs`
- First-load regression: `PORTFOLIO_URL=http://127.0.0.1:8765 node tests/cold-start.cjs`

The browser regression requires Playwright available through Node module resolution, or an explicit `PLAYWRIGHT_MODULE` path. `CHROME_PATH` optionally selects a Chrome executable. Without `PORTFOLIO_URL`, the test targets `http://127.0.0.1:8766`; the example above uses the local server's port 8765. Browser testing dependencies are separate from running the static site.

Serve over HTTP; ES modules and audio fetching do not work reliably through `file://`. The jukebox's Three.js build and assets are local. The portfolio's animated background and project gallery use local Three.js r128 in `shared/vendor/`; the jukebox uses vendored 0.180.0. A multiple-Three.js warning is expected while those independent renderers coexist.

## Current design decisions

- Keep the real purple banner, portrait, pixel name, navigation, original animated background, and cyan/magenta/yellow palette. The homepage serves `img/header.webp` and `img/portrait.webp`; their full-resolution originals remain in `img/`.
- Center the welcome copy and jukebox in a single column. Desktop banner, portrait and name scale together: banner `clamp(230px, 16vw, 440px)`, portrait `clamp(150px, 10.5vw, 288px)`, name `clamp(24px, 1.9vw, 48px)`. Mobile has a 200px banner and 130px portrait. The image keeps `object-fit: cover`.
- The bottom instructions, “Silent until…” message, optional-music sentence and “Browse projects” link were removed visually at the user's request. The nav's **Projects** link still skips directly to the gallery. Keep `#gallery-instructions` and the live `#status` region visually hidden for accessibility; the controller requires those IDs.
- Welcome → projects → remaining portfolio is normal document flow with bounded transitions at the first two section boundaries. Tall content must remain reachable; do not force a fixed-height clipping container or lock the whole page.
- Audio is silent on arrival/reload. Music is optional. No deployment was requested.
- Once music starts, navigating between Home, Blog, individual posts and series parts preserves the same audio element and playback position. Reading uses the compact controls; returning home restores the full jukebox.

## Music and artwork

`tracks.js` is the single jukebox catalogue. Each record has a stable `id`, `title`, `subtitle`, `color`, `artwork`, `src`, and fallback `duration` in seconds. URLs resolve against `import.meta.url`, so the homepage, blog and standalone page consume the same files correctly.

The eleven MP3s in root `audio/` keep the original six in order, followed by the five October 30 additions:

| Disc | Existing audio | New cover |
| --- | --- | --- |
| Analog Bass | `audio/analogBass.mp3` | `assets/covers/analog-bass.webp` |
| Artificial Glass | `audio/artificialGlass.mp3` | `assets/covers/artificial-glass.webp` |
| Frostbitten Feet | `audio/frostbittenFeet.mp3` | `assets/covers/frostbitten-feet.webp` |
| Minecraft Deathcore | `audio/minecraftDeathcore.mp3` | `assets/covers/minecraft-deathcore.webp` |
| Slofi | `audio/slofi.mp3` | `assets/covers/slofi.webp` |
| Wave Mobbin | `audio/waveMobbin.mp3` | `assets/covers/wave-mobbin.webp` |
| Among Us | `audio/amongusd2.1.mp3` | `assets/covers/among-us-d2-1.svg` |
| Jazz House | `audio/goodhoused2.2.mp3` | `assets/covers/good-house-d2-2.svg` |
| Bass Chamber | `audio/pew pew thirds.mp3` | `assets/covers/pew-pew-thirds.svg` |
| Shoe 2 | `audio/shoegaze d2.mp3` | `assets/covers/shoegaze-d2.svg` |
| Shoe 4 | `audio/shoe 4.mp3` | `assets/covers/shoe-4.svg` |

Display titles and genre assignments follow the user's October 30 corrections. Duration metadata was measured from the actual MP3s. Original filenames and stable IDs remain unchanged; draft suffixes do not appear in the player.

The six square covers were generated with built-in ImageGen for this site and inspected before integration. They are full-bleed, text-free artwork designed to remain recognizable when clipped onto a circular CD with a hole. Exact prompts and provenance are in [prompts-a.md](assets/covers/prompts-a.md) and [prompts-b.md](assets/covers/prompts-b.md). The 1254×1254 PNG originals are retained as source artwork. Runtime uses 768×768 WebP copies (quality 85), totaling about 857 KB. The old SVG/WAV demo assets remain unreferenced for reference, not as active playlist items.

The five October 30 additions were copied unchanged from the user's `Downloads/new songs` folder. Each has an original, lightweight geometric SVG cover as temporary artwork for testing the expanded collection. The legacy floating player retains its original playlist.

To add or replace music:

1. Add the audio under root `audio/` and a square cover under `assets/covers/`. Keep original raster artwork and generate a 768×768 WebP for runtime use; small vector covers can use SVG directly.
2. Update `tracks.js`. Keep existing IDs stable when only changing the file/title: the last explicit choice is remembered by ID.
3. Measure the real duration, e.g. `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 audio/song.mp3`. Runtime media metadata takes precedence over this fallback.
4. The scene, chooser and compact controls derive from the array. Update the few initial static counts/copy in `index.html` and `projects/jukebox.html` when the collection size changes.
5. Reload and check the checklist below. The old player on other pages has its separate playlist in `shared/config.js`; changes there do not automatically change the jukebox, or vice versa.

## File map

| File | Responsibility |
| --- | --- |
| `../../index.html` | Homepage markup, purple banner, player controls and section order. Required player IDs match standalone markup. |
| `../../shared/home-jukebox.css` | Scoped homepage layout and retro styling; does not restyle the standalone page. |
| `../../shared/opening-scroll.js` | Welcome/projects boundary navigation and native-scroll handoff. |
| `../../shared/portfolio-navigation.js` | Home/blog routing, retained page DOM and styles, browser history, scroll restoration and the shared player entrypoint. |
| `../../shared/blog.js` | Repeatable blog listing/post rendering from shared metadata and inert article content; resolves article links and assets against their own page URLs. |
| `../../blog.html`, `../../blog/*.html` | Directly addressable blog listing and post documents, including their article content. |
| `tracks.js` | The eleven tracks and their artwork/audio URLs. |
| `scene.js` | Alpha WebGL renderer, individual disc meshes, artwork/foil shaders, arc layout, picking and insertion/ejection. |
| `app.js` | Single audio element, state, media loading, full controls, local chooser, compact controls, persistence and advancement. |
| `compact-player.css` | Shared home/blog bottom-left desktop player, mobile bottom bar, and chooser in the portfolio palette. |
| `../jukebox.html`, `jukebox.css` | Standalone page and its independent original presentation. |
| `vendor/` | Pinned Three.js 0.180.0 and MIT license. |
| `../../shared/config.js` | Disables the legacy floating MP3 player on the homepage so only one audio engine plays. |
| `../../tests/opening-scroll.mjs` | Deterministic tests of actual scroll handlers. |
| `../../tests/continuous-player.cjs` | Playwright browser regression for continuous playback and portfolio navigation. |

## Interaction and rendering

Each disc is an extruded annular mesh with separate artwork and reflective foil faces, a transparent hub and thin rims. A transparent 1024px CanvasTexture decal sits directly over the front artwork: curved uppercase track title, dark contrast backing, small W. STRUVE signature and disc number. It belongs to the disc group, so text spins and inserts with the art; the physical center hole and foil back stay clear. Titles are measured to fit the arc, including Minecraft Deathcore. Font loading waits briefly for the site fonts, then uses a monospace fallback. Artwork PNGs remain unchanged. Label textures, art textures and scene resources are disposed with the scene. The shader approximates iridescence using viewing angle, colored lobes and radial grooves. This is a new mesh implementation inspired by the inspected Unicorn Studio reference, not an embedded Unicorn scene or a claim about its source implementation.

House (4), Downtempo (5), and Live (2) buttons filter both the 3D carousel and the compact chooser. The carousel renders at most three discs around the current selection, including any moving disc. Horizontal mouse movement, dragging, and Previous/Next buttons browse within the selected genre. Hover movement is relative to the entry point, avoiding a jump when re-entering the canvas. A pointer press freezes carousel travel and selects the disc hit at press time, so it cannot slip away before release. Clicking a rendered disc uses Three.js raycasting. Keyboard users can focus `#stage` and use arrows, Home/End, Enter or Space. Vertical touch movement remains page navigation. Genre changes sweep the whole CD arc 180 degrees around the vertical axis over 1.1 seconds: the outgoing shelf turns 90 degrees into depth while fading out, then the incoming shelf fades in through the remaining 90 degrees from the opposite side. This is Y in Three.js and Z in the user's floor-plane coordinate convention. The shelves exchange at zero opacity, and the settled canvas is fully opaque. Rapid genre changes settle to the latest selection. Insertion settles an active genre orbit before moving to the deck. Reduced motion skips the genre orbit, removes idle spin, and shortens disc animations.

The hardware deck is HTML/CSS above the canvas. `slotPosition()` projects its actual `#disc-slot` rectangle into the scene, so insertion follows the slot after responsive resizing. Keep the scene transparent to reveal the portfolio background. If changing the stage geometry, verify neighboring CDs remain visible above/beside the deck and that the raycast/slot animation still aligns.

## Audio lifecycle and persistence

`app.js` creates one hidden `#jukebox-audio`. The full player, dock and chooser all control that element; they must never create competing audio. `body[data-jukebox-portfolio]` enables shared compact presentation and playlist advancement on the homepage, blog listing and posts. `body[data-jukebox-home]` identifies the currently visible home view; navigation adds or removes it together with the `home-jukebox` class.

`shared/portfolio-navigation.js` intercepts ordinary internal home/blog links, fetches a page on its first visit and retains its main DOM for later visits. The home main stays mounted but hidden while reading; inactive blog mains are detached and cached so article IDs stay unique in the document. Navigation switches page styles, updates the URL/title/navigation, and dispatches the document's `portfolio-pagechange` event after activation. Neither the audio nor its source is recreated. Browser Back/Forward and article/series links use the same route handling; external links, other demos and opening links in another tab keep normal browser behavior. A failed page load falls back to ordinary navigation.

The compact player stylesheet is persistent and excluded from page stylesheet switching. `OpeningScroll.setEnabled()` explicitly suspends homepage input handling while reading, in addition to checking hidden markup. Versioned navigation, controller, styles and opening-scroll entrypoints must advance together so older preview assets are replaced on reload.

A direct blog/post load starts with compact controls only and does not import the 3D scene. The controller binds the full deck once when home markup first becomes available. Navigating away during disc insertion settles its visual movement and unmutes the existing playback without restarting the song. Homepage boundary scrolling is inactive while a blog view is shown.

A deliberate selection starts loading/playback and inserts the disc when the deck is visible. After insertion, sound is unmuted from the beginning. Hidden/offscreen track changes settle without waiting on a visible animation. A transition token prevents an older selection or asynchronous operation from overriding the latest user choice. Pausing/ejecting can cancel an in-progress transition.

Track endings and the compact Next button advance and wrap within the playing track's genre while browsing the homepage or reading any blog page. Switching the browsing genre leaves the playing audio untouched. Standalone playback loops the selected track. Switching or advancing tracks preserves volume and must not change scroll position or reopen the full jukebox.

The dock is shown on blog pages and after the home machine leaves view. With no loaded track it offers a small Music control; with a track it shows play/pause, next and Choose disc. The chooser opens near the current viewport and must not navigate back to the opening. Returning to the deck reveals the same audio position and paused/playing state.

Local storage keys:

- `jukebox-demo-volume`: retained for backward compatibility despite the old name.
- `jukebox-last-selection`: last deliberate home/blog selection by stable track ID. Automatic advancement does not replace it. Unknown/old demo IDs fall back safely.

Each fresh document entry randomly selects House, Downtempo, or Live with equal probability. A saved selection is restored only if it belongs to the chosen genre; otherwise browsing starts at that genre's first track. In-page Home/Blog navigation keeps the current genre. Refreshes, directly opened links and new tabs start silently, including on blog posts. Saved state never authorizes autoplay after a reload. Continuous playback applies to navigation within the existing home/blog document; leaving that document pauses the audio. Storage failures must not prevent playback.

### Loading and seeking

Silent startup makes no MP3 requests. Only a selected song is prepared. A `Range: bytes=0-0` probe detects hosts that support partial responses: a 206 response keeps normal streaming. Python's simple static server returns the whole file with 200, so the selected file becomes a Blob URL to support reliable seeking. The cache keeps at most two tracks and 20 MiB, revokes evicted URLs, and aborts superseded requests. Files exceeding the limit or failed preparation fall back to their original URL.

Playback starts inside the user gesture, before asynchronous preparation, to preserve browser permission. If a Blob is ready after insertion, it replaces the muted stream before sound begins. Offscreen playback continues streaming; its first seek switches to the prepared source and restores the intended time and play/pause state. Transition tokens also guard seeks. A visible PLAYBACK ERROR label offers Play to retry even though the verbose status is visually hidden.

Static ES modules may remain cached in a local preview. After catalogue changes, update the version on the `tracks.js` import in `app.js`; after renderer changes, update the `scene.js` import query. After controller changes, update the `app.js` query in `shared/portfolio-navigation.js` and `projects/jukebox.html`; keep home/blog navigation entrypoints current when changing their imports. Never mistake a cached preview for the current eleven-disc catalogue.

## Scroll behavior

The first two sections have viewport **minimum** heights. Wheel/touch/keyboard interception occurs only at their boundaries. A tall opening scrolls to its bottom before transitioning. At projects, another downward gesture releases into native scrolling. Returning upward first lands at projects, then at the welcome's bottom. Real anchors and browser history remain supported.

Wheel momentum is grouped using a 180ms gap or a clear direction reversal; browsers do not expose a reliable gesture-end event. A new gesture during an animation lands it and honors the new input rather than adding a cooldown. Horizontal gallery controls, inputs, dialogs and ordinary content scrolling are exempt. Reduced-motion transitions are immediate.

## Verification checklist for future changes

- Reload silently; confirm eleven covers/track choices, correct titles and exactly one audio element.
- Play every MP3, check actual duration, pause/resume, seek, swap during loading, eject and retry.
- Seek near a genre's last track ending to verify last→first advancement within that genre and constant volume, including while browsing projects.
- Start music on home, navigate through Blog, an article and series parts, then return home; confirm one unchanged audio element/source, an advancing playback time, and matching controls. Repeat while paused and during disc insertion.
- Open the blog and a post directly; confirm silent startup, working chooser and no 3D scene until visiting Home. Check Back/Forward, card-body clicks, series links and scroll restoration.
- Skip music with the nav Projects link; verify the modest Music shortcut, chooser without scrolling, and compact controls.
- Scroll down/up through both boundaries, including a tall opening. Verify project dragging/details and keyboard navigation remain functional.
- Check desktop proportions against the reference, 390px and 320px layouts, long titles, and no horizontal page overflow.
- Verify reload randomizes the genre, restores a selection only within that genre, remembers volume, and remains silent; check console errors and `git diff --check`.

The 16 scroll tests cover momentum, new gestures during transitions, tall scenes, focused inputs, keyboard, touch/inertia, reduced-motion paths, native blog scrolling while the homepage is hidden, and explicit route suspension/resumption. They do not replace hands-on checks of physical trackpads/touchscreens or OS audio interruptions. Keep an honest distinction between those deterministic tests and device verification.

## First-load performance — 2026-10-27

The banner, portrait, and six covers total 1.72 MB instead of 23.63 MB (92.7% smaller). Originals are preserved. The banner keeps its original dimensions; the portrait is 600×602. Both use WebP quality 87. The homepage prioritizes its banner, preloads the two local WOFF2 fonts, and preloads the player module. Font licenses are in `shared/fonts/`.

Hidden track lists and the compact chooser load images only when shown. Disc textures load concurrently with font/geometry setup; failed artwork releases the partial renderer and keeps playback controls usable. Blog rendering and its Markdown parser load only on blog entry. Shared component dependencies load in parallel, and project textures wait until their section is within 150px of the viewport. The project card for the jukebox uses the same optimized cover as the player.

Initial optimization measurements, before the local Three.js follow-up: median of three local cold runs in Chrome at 1440×1100, 10 Mbps download, 100ms latency, 4× CPU slowdown, reduced motion, fresh browser contexts, and disabled cache:

| Measurement | Before | After |
| --- | ---: | ---: |
| First contentful paint | 0.62s | 0.44s |
| Largest contentful paint | 15.37s | 2.28s |
| Full disc scene ready | 35.37s | 3.40s |

These are local lab measurements, not production analytics or physical-device results. The final release checks transferred about 4.13 MB on desktop and 3.94 MB at 390px on a fresh homepage. `tests/cold-start.cjs` enforces a 4.5 MB initial transfer budget, checks the visible background and project gallery, silent startup, deferred blog/chooser resources, and playback after artwork failure. The 16 scroll tests and the continuous-player browser suite also passed. Published to `www.wstruve.com` on October 27, 2026. Vercel production deployment `dpl_DywV2Eq8L2cV84aJVKvVi1A4dztU` reached READY with both `www.wstruve.com` and `wstruve.com` assigned. The exact 107-file release package passed the cold-start and continuous-player browser checks before deployment; production readiness and domain assignment were checked through Vercel.

### Background and portrait follow-up

`shared/init.js` resolves dependencies against its own script URL. Counting page path segments incorrectly pointed local-file previews one directory above the site. The original r128 runtime is now vendored with its MIT license, removing the background's external CDN dependency. Four loader regressions cover root, nested, prefixed, and file URLs, including page navigation during loading. Serve the full jukebox over HTTP because native ES modules still require it.

The user preferred the efficient portrait and original glow after reviewing the follow-up. The 72 KB `portrait.webp`, original clipped wrapper, and original glow styling are restored; the 540 KB lossless replacement is removed. The background path fix and local Three.js remain.

## Previous verification — 2026-10-23

The user's actual Opera GX preview reproduced unstyled music controls and swallowed upward scrolling. After the persistent-style and explicit scroll-suspension fixes, the refreshed preview was checked through Home → Blog → post: dock placement, disc chooser, pause/resume, next track, and scrolling down/up all worked. The browser regression script now also asserts player placement and native upward wheel scrolling; these added browser assertions were syntax-checked but not rerun as an automated suite in this follow-up.

A Chromium pass of the continuous player confirmed home → blog → posts/series navigation, browser Back/Forward, paused-state persistence, direct mobile blog/post entry, first home mounting after entering through the blog, repeated navigation requests, and real last-track → first-track advancement while reading. The same audio element and source continued across page navigation. Desktop and 320px layouts were inspected. This is browser verification, not physical-device testing. Use `tests/continuous-player.cjs` for the repeatable navigation regression.

Browser pass with the real assets: all six MP3s played with their measured durations; all six covers loaded; one audio element; silent startup/reload; remembered volume and explicit selection; paused seeking; automatic Analog Bass→Artificial Glass and Wave Mobbin→Analog Bass endings; rapid selection during insertion; compact selection of four different songs without moving the projects scene. Desktop reference size (2048×980), 390px and 320px layouts were inspected, with no horizontal page overflow. The footer copy is visually hidden/removed, and the original header image and portrait remain intact.

Standalone playback was also checked with the real Frostbitten Feet MP3 and its looping behavior retained.

Printed CD titles were visually checked, including Minecraft Deathcore; clicking its labeled artwork inserted and played the correct MP3. A deterministic delayed-seek regression also confirms that the latest slider position wins while playback is buffering.

All 16 scroll tests, JavaScript syntax checks and whitespace check pass. The earlier continuous-player browser regression passed before its follow-up expansion described above. A focused temporary check exercised the actual cache code against the local server plus range-response/cancellation fixtures. Physical touch/trackpad hardware, OS interruptions and slow-network behavior still need device testing before treating this as production QA.

## Genre browsing verification — 2026-10-30

Browser checks passed for all three random entry outcomes (including an existing saved selection), exact user-specified titles and grouping, arrow/Home/End navigation, 320px layout, changing genre without interrupting playback, switching playback across genres, compact chooser keyboard navigation, and Live wrapping from its last track to its first. Continuous home/blog playback and first-load checks also passed. Fresh homepage transfer remains about 4.14 MB at 1440px and 3.95 MB at 390px. The three-disc carousel was visually inspected in the local preview.

## Disc input and genre orbit — 2026-10-30

Restored the familiar hover-to-browse interaction after the user reported the discs felt unresponsive. Direct clicks were reproduced successfully before the fix; presses now additionally freeze travel and retain the pressed disc until release. Normal-motion browser tests passed at 1440px and 390px for real pointer browsing, direct face clicks in all three genres, held presses, genre orbit completion, continuous audio during genre changes, and rapid switching. The original screen-plane orbit was visually inspected in the local preview before the axis clarification below.

The genre orbit was corrected to the user's vertical-axis convention and then shortened to a 180-degree sweep with a fade out/in. The CD arc turns through depth in the horizontal floor plane.

Live is ordered Shoe 2, then Shoe 4 in the carousel, compact chooser, and automatic playback sequence. Playback failures during local review coincided with a stopped preview server; after restarting it, all eleven MP3 responses matched their source files and the user confirmed playback worked again. No playback-code change was needed for that report.
