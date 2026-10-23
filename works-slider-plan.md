# Works Slider Plan

Replicate the draggable, warping "Works" slider from https://thibautfoussard.com as a
section on the front page of wstruve.com, and retire the separate projects page.

Written 2026-10-22.

Status: phase 1 done on 2026-10-22 (data file, card strip on the front page,
detail overlay, nav/anchor links, `projects.html` redirect). Phase 2 done on
2026-10-22 (`shared/works-slider.js`: WebGL planes, drag/wheel/keys, inertia, wrap,
projected labels, hover, click). Phases 3–4 not started. Work is on the
`works-slider` branch.

Phase 2 notes: index.html styles every `<canvas>` as fixed with z-index -1, so the
slider canvas sets its own position and z-index. The global `button` rule transitions
`all`, so label elements set `transition: none` or their per-frame transforms animate.
`window.WorksSlider.instance.step(n)` advances frames synchronously for testing.

Implementation note from phase 1: `scroll-behavior: smooth` is deliberately not set
on `html`. Landing on `index.html#projects` from another page should be an instant
native jump; the in-page "Explore my projects" link smooth-scrolls through a click
handler in `shared/works-strip.js`. (In the hidden preview pane smooth scrolling never
ran at all, so test anything animated with the pane visible.)

---

## 1. How the reference does it

Pulled from the site's JS bundle and live DOM.

**Caveat:** the browser used for inspection reported a low GPU tier, and the site gates
the slider on that, so the cards and the warp were never observed rendering live. The
reconstruction below comes from the slider class, the shader source, and the input
handlers. Compare the feel in a real browser once phase 3 lands.

### Stack

- Three.js, GSAP ScrollTrigger, Lenis smooth scroll, pmndrs `postprocessing`, a GPU-tier
  detector, and a custom-cursor web component.
- One fixed full-screen WebGL canvas sits above the whole page (`z-index: 10`). Page
  text is `pointer-events: none` so the canvas receives the drag.
- Three full-height sections: hero, Works, Connect. The Works section is `100vh`, flex,
  with the big "Works" title on the left and a radial dark gradient behind it.

### Slider

- Each project is a rounded-rectangle plane (ShapeGeometry with quadratic corners) with
  its cover texture and a `uZoom` uniform used for hover zoom.
- Two identical groups of planes sit side by side. Whichever group leaves the screen
  jumps to the other end, giving an infinite loop.
- Because the canvas is fixed, a ScrollTrigger (section top at viewport bottom, to
  section bottom at viewport top, scrubbed) moves the whole group vertically to fake the
  section scrolling with the page.
- A second ScrollTrigger (section top at viewport bottom, to section top at viewport
  center) nudges the slider horizontally as you scroll into it, but only when no drag is
  active.

### Drag and inertia

- `pointerdown` on the canvas records `offsetX`; `pointermove` adds the delta to a
  target offset via `moveBy()`; `pointerup` releases.
- Every frame, `update()` lerps each group's x toward its target. The per-frame
  movement (`offsetDelta`) is the velocity.
- Touch uses the same flow with `touchstart` / `touchmove` / `touchend`.

### Warp

A post-processing effect over the entire frame (pmndrs `Effect`, `mainImage` signature).

```glsl
uniform sampler2D uTexture;
uniform float uDisplacementStrength;   // velocity-driven, clamped to [-0.2, 0.2]

float parabola(float x, float k) { return pow(4.0 * x * (1.0 - x), k); }

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 dUv = uv;

    // horizontal bulge, strongest at screen center
    dUv.x += -uDisplacementStrength * parabola(uv.y, 1.) * parabola(uv.x, 1.);

    // vertical pinch at the left/right edges, proportional to |speed|
    float rightAmp = pow(smoothstep(.5, 1., uv.x), 2.);
    float leftAmp  = pow(smoothstep(.5, 1., 1. - uv.x), 2.);
    vec2 n = vec2((-.5 + uv.x) * 2., (-.5 + uv.y) * 2.);
    float bottomAmp = smoothstep(.9, 1., 1. - uv.y);
    dUv.x += bottomAmp * n.x * -.1;
    dUv.y -= abs(uDisplacementStrength * 5.) * rightAmp * n.y * .1;
    dUv.y -= abs(uDisplacementStrength * 5.) * leftAmp  * n.y * .1;

    // RGB split along the bottom edge
    vec4 color   = texture2D(uTexture, dUv);
    vec4 dColor1 = texture2D(uTexture, dUv + .005);
    vec4 dColor2 = texture2D(uTexture, dUv - .005);
    vec4 aberration = vec4(dColor1.r, color.g, dColor2.b, color.a);

    outputColor = mix(color, aberration, bottomAmp);
}
```

(The real shader also contains a noise wipe to white used for the About page transition,
which we don't need.)

### Labels, hover, click

- Each card has a DOM label (`.slider-project`): uppercase title, "YYYY | MM" at 50%
  opacity, projected to the plane's bottom-left each frame.
- A raycast on hover plays a short timeline (texture zoom, cursor change) and reverses
  on leave.
- A press shorter than 200ms (150ms on touch) on the hovered card opens the project
  overlay.

### Mobile

The slider is gone entirely. Phones get a plain vertical list of title + date.

### Tuning values worth keeping

| Parameter | Reference value |
|---|---|
| Position lerp per frame | 0.075 |
| Warp strength | `clamp(velocity * t * scrollProgress, -0.2, 0.2)` |
| `t` (width scaling) | 2 at 320px wide, linearly down to 1 at 800px and wider |
| Slide width / height (fraction of view) | 0.4 / 0.8 when aspect < 1; 0.22 / 0.44 when aspect < 2; 0.15 / 0.3 otherwise |
| Slide gap | 0.05 of view width |
| Corner radius | 0.025 of the slide |
| Label offset | just below the plane, bottom-left |
| Tap vs drag threshold | 200ms (150ms touch) |
| Scroll-in auto nudge | `-scrollDelta * viewportWidth * 0.0025` while the section rises from viewport bottom to viewport center, skipped during a drag |

---

## 2. Architecture for wstruve.com

### The one deliberate divergence

Use a **section-scoped canvas**, not a fixed full-page one.

The reference puts the canvas over the whole page and turns off pointer events on the
text. This site has a navbar, MP3 player, effects panel, and many links; a full-page
canvas would block all of them and force the scroll-faking trick.

Instead: a `position: relative; height: 100vh` section that breaks out of the 800px
`.container` (`width: 100vw; margin-left: calc(50% - 50vw)`), with an absolutely
positioned canvas inside it. Nothing visible is lost, the scroll simulation goes away,
and the warp only touches the cards. Keeping alpha through the post pass lets the
existing grid and particle background show behind the cards.

### Dependencies

- Three.js r128 (UMD) is already loaded by `shared/init.js` before the
  `sharedComponentsReady` event. Reuse it.
- Warp = render the slider scene to a `WebGLRenderTarget`, then draw one full-screen
  quad with our own fragment shader. No EffectComposer, no GSAP, no Lenis.
- The site stays zero-build: plain HTML, CSS, and script files.

### Modules

| File | Role |
|---|---|
| `shared/projects-data.js` (new) | Single source of truth: id, title, date, tagline, tech, cover, screenshots, link, long writeup, category. Feeds the slider, the detail overlay, and the mobile strip. |
| `shared/works-slider.js` (new) | Scene, camera, planes with cover-fit UVs, modulo wrap for the infinite loop, pointer drag with capture, horizontal wheel/trackpad `deltaX`, arrow keys, inertia, velocity, render target + warp quad, DOM label projection, raycast hover, tap detection, resize, visibility gating, fallback detection. |
| `shared/works-slider.css` (new) or `style.css` | Full-bleed section, title, labels, drag hint, the DOM scroll-snap strip. |
| `shared/project-gallery.js` (modify) | Reads from `projects-data.js`; dialog gains description, metrics, tech line, and repo link so it becomes the project detail overlay; exposes `open(projectId)` for the slider. |
| `index.html` (modify) | Section markup after the intro: title, DOM card strip (always present), canvas container; scripts; init on `sharedComponentsReady`; "Explore my projects" becomes `#projects`. |
| `shared/config.js` (modify) | Nav "Projects" points at `index.html#projects`. |
| `projects.html` (modify) | Becomes a redirect (meta refresh + canonical) to `/#projects` so shared links and the canonical URL keep working. |
| `img/projects/covers/` (new) | One ~1024px landscape cover per project. |

### Interaction spec

- **Drag:** pointer events with `setPointerCapture`. Horizontal movement adds to the
  target offset; release lets the lerp finish. `touch-action: pan-y` on the canvas so
  vertical swipes still scroll the page.
- **Wheel:** horizontal `deltaX` (trackpad swipe) moves the slider; vertical wheel is
  never intercepted.
- **Keyboard:** the section is focusable; left/right arrows step one card.
- **Loop:** each card's x is `((base + offset) mod totalWidth) - totalWidth / 2`.
- **Scroll-in nudge:** a scroll listener tracks the section's progress from viewport
  bottom to viewport center and applies the reference nudge when no drag is active.
- **Hover:** raycast each frame while the pointer is over the canvas; the hit plane
  eases `uZoom` 1 → 1.1 and its label brightens; the cursor becomes a grab cursor.
- **Click:** press under 200ms with less than a few px of movement opens the detail
  overlay for professional/academic projects, or navigates to the demo page for personal
  demos.
- **Reduced motion:** warp strength forced to 0, no scroll-in nudge, no title stagger.

### Retro adaptation of the look

- Title "PROJECTS" in Press Start 2P with the existing `.glitch-effect`, letters
  staggered in on first view (CSS animation triggered by IntersectionObserver).
- Cards: sharp or barely-rounded corners, a 2px neon border drawn in the plane's
  fragment shader (cyan, magenta on hover) with a soft glow.
- Warp pass: same bulge and edge pinch, RGB split shifted to the site's magenta/cyan,
  plus scanlines in the same pass.
- Labels under each card: title in Press Start 2P (small), date and tech in VT323.
- A blinking `< DRAG >` hint in VT323 using the existing `blink` keyframes, hidden after
  the first drag.

### Mobile, fallback, and accessibility as one thing

- A DOM scroll-snap strip of cards is **always** in the markup: semantic, indexable,
  keyboard reachable.
- The canvas replaces it visually only when WebGL initialises, the viewport is at least
  768px wide, and `prefers-reduced-motion` is off. Otherwise the strip stays visible with
  native momentum scrolling.

### Performance

- Pause the slider's render loop when the section is offscreen (IntersectionObserver).
- Cap `devicePixelRatio` at 1.5 for the slider renderer.
- Lazy-load textures when the section is within one viewport of the screen.
- Covers at ~1024px wide, ~100–150KB each.
- This runs beside the existing 5000-particle background; measure frame time on a
  laptop and a phone before polishing.

### Covers

| Project | Source today | Plan |
|---|---|---|
| Modulo | 5 screenshots (1800px) | downscale `field-mapper.jpg` or `dashboard.jpg` |
| Vaccine Inventory | 3 screenshots | downscale `desktop.jpg` (not the portrait `mobile.jpg`) |
| Provider Roster Map | 2 screenshots | downscale `map.jpg` |
| Transfer Reporting Dashboard | 1 screenshot | downscale `overview.jpg` |
| Scheduling Capacity Dashboard | 3 screenshots | downscale `grid.jpg` |
| Meta-Scan (academic) | none | generated retro title card until a real image exists |
| Live Chatroom (academic) | none | generated retro title card until a real image exists |
| Game of Life, Melody Maker, Task Manager, Study Tracker, Sorting Visualizer, Pathfinding Visualizer | none | capture the local demo pages |

Cover-fit UVs in the plane shader handle any remaining aspect mismatch.

---

## 3. Phases (each shippable on its own)

1. **Content foundation.** `projects-data.js`; DOM scroll-snap strip on the front page;
   detail overlay extended with writeups, metrics, tech, links; nav and intro link point
   at `#projects`; `projects.html` becomes a redirect.
2. **WebGL slider.** Planes with cover textures, drag, wheel, keys, inertia, infinite
   loop, synced DOM labels, hover zoom, click to open detail or demo.
3. **Warp pass.** Render target + displacement/aberration/scanline shader tied to
   velocity, reduced-motion off switch.
4. **Polish.** Title stagger, drag hint, scroll-in nudge, perf gating, cover captures and
   title cards, remove the old projects page content after review.

---

## 4. Decisions (defaults apply unless changed)

| Decision | Default |
|---|---|
| Fate of `projects.html` | Redirect to `/#projects`; do not delete. |
| Phones | DOM scroll-snap strip with native momentum; no WebGL drag on touch. |
| Missing covers | Capture the six demo pages now; generated retro title cards for the two academic projects. |
