// WebGL project slider for the front page (phase 2 of works-slider-plan.md).
//
// One textured plane per project sits in a horizontal strip that wraps around
// forever. The visitor drags it (mouse, touch, trackpad swipe, arrow keys) and
// it eases to a stop. DOM labels ride under each plane and are the keyboard
// path: focusing one centres its card, Enter opens it.
//
// Mounts on `sharedComponentsReady` (init.js has loaded Three.js by then) and
// hands off to the DOM strip in works-strip.js when WebGL fails, the visitor
// prefers reduced motion, or the viewport is narrow.
//
// Debug handle: window.WorksSlider.instance exposes offset, target, velocity,
// frames, and step(n) to advance n frames synchronously.
(function () {
    'use strict';

    // Motion (the lerp and tap values come from the reference site)
    const LERP = 0.075;        // fraction of the remaining distance covered per 60Hz frame
    const HOVER_LERP = 0.15;   // same, for the hover zoom/border
    const FRAME_MS = 1000 / 60; // the frame the constants above are written for
    const FLING = 160;         // ms of pointer velocity added to the target on release
    const MAX_VX = 3;          // px/ms cap on that velocity, so a jumpy pointer can't launch the strip
    const TAP_MS = 200;        // a press shorter than this that barely moved is a tap
    const TAP_PX = 6;

    // Layout, in CSS pixels
    const GAP = 40;            // between cards
    const PAD = 28;            // extra mesh size around each card for the hover glow
    const RADIUS = 6;          // card corner radius
    const BORDER = 2;          // card border width
    const LABEL_GAP = 12;      // card bottom to label top
    const LABEL_HEIGHT = 72;   // reserved under the cards for labels
    const MIN_WIDTH = 768;     // narrower viewports keep the DOM strip
    const DPR_CAP = 1.5;

    // Warp pass (phase 3): strength = velocity / stage width * gain * t, clamped
    const WARP_GAIN = 10;      // how hard a drag bends the picture (0.2 at ~30px per 60Hz frame on a 1500px stage)
    const WARP_MAX = 0.2;      // reference clamp
    const WARP_SMOOTH = 0.25;  // per-frame easing of the bend, so pointer jitter doesn't flicker it
    const CHROMA = 1;          // chromatic aberration amount (0 = off, 2 = double)
    const SCANLINE = 0.08;     // depth of the 2px scanlines over the cards
    const NUDGE = 0.5;         // fraction of the stage width the strip slides while scrolling into view
    const REWIND = 0.3;        // how far back up (in scroll progress) before the next entry nudges again

    const CYAN = [0, 1, 1];
    const MAGENTA = [1, 0, 1];

    const VERTEX = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    // Draws the card as a rounded rectangle inside a padded mesh: cover-fit
    // texture anchored to the top, a zoom about the centre on hover, a neon
    // border, and a soft glow outside the card that fades in on hover.
    const FRAGMENT = `
        precision highp float;
        uniform sampler2D uTexture;
        uniform float uHasTexture;
        uniform vec2 uMeshSize;
        uniform vec2 uCardSize;
        uniform vec2 uImageSize;
        uniform vec2 uFocus;
        uniform float uHover;
        uniform float uRadius;
        uniform float uBorder;
        uniform vec3 uBorderColor;
        uniform vec3 uGlowColor;
        varying vec2 vUv;

        float roundedRect(vec2 p, vec2 halfSize, float r) {
            vec2 q = abs(p) - halfSize + vec2(r);
            return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
        }

        // Like CSS object-fit: cover with object-position at uFocus (0,0 = top left;
        // texture v runs bottom-up, hence the flip on y)
        vec2 coverUv(vec2 uv, vec2 frame, vec2 img, vec2 focus) {
            float fr = frame.x / frame.y;
            float ir = img.x / img.y;
            vec2 s = fr > ir ? vec2(1.0, ir / fr) : vec2(fr / ir, 1.0);
            vec2 o = (1.0 - s) * vec2(focus.x, 1.0 - focus.y);
            return o + uv * s;
        }

        void main() {
            vec2 p = (vUv - 0.5) * uMeshSize;
            float d = roundedRect(p, uCardSize * 0.5, uRadius);

            vec2 cardUv = p / uCardSize + 0.5;
            float zoom = 1.0 + uHover * 0.08;
            vec2 zoomed = (cardUv - 0.5) / zoom + 0.5;
            vec3 tex = texture2D(uTexture, coverUv(zoomed, uCardSize, uImageSize, uFocus)).rgb;
            vec3 fill = mix(vec3(0.0, 0.0, 0.2), tex, uHasTexture);

            float inner = 1.0 - smoothstep(-uBorder - 0.5, -uBorder + 0.5, d);
            vec3 color = mix(uBorderColor, fill, inner);
            float shape = 1.0 - smoothstep(-0.5, 0.5, d);
            float glow = uHover * exp(-max(d, 0.0) / 9.0) * 0.55;

            gl_FragColor = vec4(mix(uGlowColor, color, shape), max(shape, glow));
        }
    `;

    const POST_VERTEX = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
        }
    `;

    // Full-stage pass over the rendered cards, adapted from the reference site:
    // a horizontal bulge strongest at the centre, a vertical pinch at the left and
    // right edges, both scaled by drag speed, plus a magenta/cyan split along the
    // drag axis and faint scanlines. Everything off the cards is transparent, so
    // the page background is untouched.
    const WARP_FRAGMENT = `
        precision highp float;
        uniform sampler2D uTexture;
        uniform float uStrength;
        uniform float uScanline;
        uniform float uChroma;
        varying vec2 vUv;

        float parabola(float x, float k) {
            return pow(4.0 * x * (1.0 - x), k);
        }

        void main() {
            vec2 uv = vUv;
            vec2 d = uv;
            d.x += -uStrength * parabola(uv.y, 1.0) * parabola(uv.x, 1.0);

            float rightAmp = pow(smoothstep(0.5, 1.0, uv.x), 2.0);
            float leftAmp = pow(smoothstep(0.5, 1.0, 1.0 - uv.x), 2.0);
            vec2 n = (uv - 0.5) * 2.0;
            d.y -= abs(uStrength) * 0.5 * (rightAmp + leftAmp) * n.y;

            // Chromatic aberration: red and blue pull apart along the drag axis, plus a
            // lens-like radial fringe that grows toward the stage edges; both with speed
            vec2 radial = n * abs(uStrength) * 0.03;
            vec2 shift = (vec2(uStrength * 0.05, 0.0) + radial) * uChroma;
            vec4 c = texture2D(uTexture, d);
            vec4 cr = texture2D(uTexture, d + shift);
            vec4 cb = texture2D(uTexture, d - shift);
            vec4 color = vec4(cr.r, c.g, cb.b, max(c.a, max(cr.a, cb.a)));

            float scan = 1.0 - uScanline * (0.5 + 0.5 * sin(gl_FragCoord.y * 3.14159265));
            color.rgb *= scan;
            gl_FragColor = color;
        }
    `;

    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

    const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Stand-in texture for projects without a cover: matches .works-card-titlecard
    function makeTitleCard(project, aspect) {
        const W = 600;
        const H = Math.round(W / aspect);
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        const texture = new THREE.CanvasTexture(canvas);

        const draw = () => {
            const bg = ctx.createLinearGradient(0, 0, W, H);
            bg.addColorStop(0, '#0a0a4a');
            bg.addColorStop(0.6, '#3d0a6b');
            bg.addColorStop(1, '#0a0a4a');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
            for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2);

            ctx.font = '32px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const lines = [];
            let line = '';
            project.title.split(' ').forEach((word) => {
                const trial = line ? `${line} ${word}` : word;
                if (ctx.measureText(trial).width > W - 100 && line) {
                    lines.push(line);
                    line = word;
                } else {
                    line = trial;
                }
            });
            lines.push(line);
            const lineHeight = 58;
            const top = H / 2 - ((lines.length - 1) * lineHeight) / 2;
            lines.forEach((text, i) => {
                // Neon: a blurred magenta halo, a hard magenta offset, then the yellow face
                ctx.shadowColor = '#ff00ff';
                ctx.shadowBlur = 24;
                ctx.fillStyle = '#ff00ff';
                ctx.fillText(text, W / 2 + 4, top + i * lineHeight + 4);
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#FFCC00';
                ctx.fillText(text, W / 2, top + i * lineHeight);
            });
            ctx.shadowColor = 'transparent';
            texture.needsUpdate = true;
        };

        draw();
        // Redraw once the pixel font is in, otherwise the fallback font gets baked in
        if (document.fonts && document.fonts.load) {
            document.fonts.load('28px "Press Start 2P"').then(draw).catch(() => {});
        }
        return { texture, width: W, height: H };
    }

    class Slider {
        constructor(section, projects) {
            this.section = section;
            this.projects = projects;
            this.strip = section.querySelector('.works-strip');
            this.hint = section.querySelector('.works-hint');

            this.offset = 0;
            this.target = 0;
            this.velocity = 0;
            this.warp = 0;
            this.warpOverride = null;   // set to a number to hold the warp for a screenshot
            this.lastTick = 0;
            this.scrollProgress = null;
            this.frames = 0;
            this.rafId = 0;
            this.visible = false;
            this.narrow = false;
            this.texturesRequested = false;
            this.pointer = null;
            this.hovered = null;
            this.items = [];
        }

        // Returns false (leaving the DOM strip in place) when WebGL is unavailable
        mount() {
            this.stage = document.createElement('div');
            this.stage.className = 'works-stage';
            this.stage.tabIndex = -1;
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'works-canvas';
            this.labels = document.createElement('div');
            this.labels.className = 'works-labels';
            this.stage.append(this.canvas, this.labels);

            try {
                this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
            } catch (err) {
                console.warn('Works slider: WebGL unavailable, keeping the DOM strip.', err);
                return false;
            }
            this.renderer.setClearColor(0x000000, 0);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));

            this.scene = new THREE.Scene();
            this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
            this.camera.position.z = 10;
            this.geometry = new THREE.PlaneGeometry(1, 1);

            this.readCardSize();
            this.projects.forEach((project, index) => this.items.push(this.createItem(project, index)));
            this.createPost();

            this.strip.before(this.stage);
            this.strip.hidden = true;
            this.section.classList.add('works-section--gl');

            this.bindInput();
            this.bindLifecycle();
            this.layout();
            this.resetOffset();
            this.update();
            this.render();
            return true;
        }

        createItem(project, index) {
            const material = new THREE.ShaderMaterial({
                vertexShader: VERTEX,
                fragmentShader: FRAGMENT,
                transparent: true,
                depthWrite: false,
                uniforms: {
                    uTexture: { value: null },
                    uHasTexture: { value: 0 },
                    uMeshSize: { value: new THREE.Vector2(1, 1) },
                    uCardSize: { value: new THREE.Vector2(1, 1) },
                    uImageSize: { value: new THREE.Vector2(4, 3) },
                    uFocus: { value: new THREE.Vector2(...(project.focus || [0.5, 0])) },
                    uHover: { value: 0 },
                    uRadius: { value: RADIUS },
                    uBorder: { value: BORDER },
                    uBorderColor: { value: new THREE.Vector3(...CYAN) },
                    uGlowColor: { value: new THREE.Vector3(...MAGENTA) }
                }
            });
            const mesh = new THREE.Mesh(this.geometry, material);
            mesh.frustumCulled = false;
            this.scene.add(mesh);

            const data = window.ProjectsData;
            const meta = [project.org, project.date].filter(Boolean).join(' · ')
                || data.categoryLabel[project.category] || '';
            const label = document.createElement(project.href ? 'a' : 'button');
            label.className = 'works-label';
            label.dataset.project = project.id;
            if (project.href) {
                label.href = project.href;
            } else {
                label.type = 'button';
                label.setAttribute('aria-haspopup', 'dialog');
            }
            label.innerHTML = `
                <span class="works-label-title">${esc(project.title)}</span>
                ${meta ? `<span class="works-label-meta">${esc(meta)}</span>` : ''}
            `;
            this.labels.appendChild(label);

            const item = { project, index, mesh, material, label, hover: 0, hoverTarget: 0, x: 0 };

            if (!project.cover) {
                const card = makeTitleCard(project, this.aspect);
                this.applyTexture(item, card.texture, card.width, card.height);
            }
            return item;
        }

        applyTexture(item, texture, width, height) {
            texture.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
            // The card window shows the image close to 1:1, so mipmaps add nothing, and
            // skipping them spares WebGL1 a power-of-two resize of every cover
            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
            item.material.uniforms.uTexture.value = texture;
            item.material.uniforms.uImageSize.value.set(width, height);
            item.material.uniforms.uHasTexture.value = 1;
            // Draw it now rather than waiting on the idle loop
            this.render();
            this.wake();
        }

        // Covers are fetched once the section comes near the viewport
        loadTextures() {
            if (this.texturesRequested) return;
            this.texturesRequested = true;
            const loader = new THREE.TextureLoader();
            this.items.forEach((item) => {
                if (!item.project.cover) return;
                loader.load(item.project.cover, (texture) => {
                    this.applyTexture(item, texture, texture.image.width, texture.image.height);
                });
            });
        }

        // Sizes come from the stage box and the CSS custom properties the strip uses
        layout() {
            const rect = this.stage.getBoundingClientRect();
            this.width = Math.max(1, Math.round(rect.width));
            this.height = Math.max(1, Math.round(rect.height));

            this.readCardSize();
            const aspect = this.aspect;
            // Mirrors --works-inset in projects.css: the content column's left edge
            const pageWidth = document.documentElement.clientWidth;
            this.inset = Math.max(32, pageWidth / 2 - 368);

            const maxByHeight = (this.height - LABEL_HEIGHT - 2 * PAD) * aspect;
            this.cardW = Math.max(120, Math.min(this.cssCardWidth, this.width * 0.8, maxByHeight));
            this.cardH = this.cardW / aspect;
            this.slot = this.cardW + GAP;
            // World y of the card centre: cards sit centred in the space above the labels
            this.cardY = LABEL_HEIGHT / 2;
            this.cardBottomCss = (this.height - LABEL_HEIGHT) / 2 + this.cardH / 2;

            // Enough copies of the set that the wrap seam is always off screen
            const setWidth = this.slot * this.items.length;
            this.copies = Math.max(1, Math.ceil((this.width + 2 * this.slot) / setWidth));
            this.loopW = setWidth * this.copies;
            this.syncCopies();

            this.renderer.setSize(this.width, this.height, false);
            this.resizePost();
            this.camera.left = -this.width / 2;
            this.camera.right = this.width / 2;
            this.camera.top = this.height / 2;
            this.camera.bottom = -this.height / 2;
            this.camera.updateProjectionMatrix();

            this.items.forEach((item) => {
                item.mesh.scale.set(this.cardW + 2 * PAD, this.cardH + 2 * PAD, 1);
                item.mesh.position.y = this.cardY;
                item.material.uniforms.uMeshSize.value.set(this.cardW + 2 * PAD, this.cardH + 2 * PAD);
                item.material.uniforms.uCardSize.value.set(this.cardW, this.cardH);
            });
            this.update();
            this.render();
            this.wake();
        }

        // The same two custom properties the DOM strip uses, so both agree
        readCardSize() {
            const style = getComputedStyle(this.section);
            this.cssCardWidth = parseFloat(style.getPropertyValue('--works-card-width')) || 460;
            const parts = style.getPropertyValue('--works-cover-aspect').split('/').map(Number);
            this.aspect = parts.length === 2 && parts[1] ? parts[0] / parts[1] : 2 / 3;
        }

        // Render target plus a full-stage quad that applies the warp shader
        createPost() {
            try {
                this.rt = new THREE.WebGLRenderTarget(2, 2, {
                    minFilter: THREE.LinearFilter,
                    magFilter: THREE.LinearFilter,
                    depthBuffer: false,
                    stencilBuffer: false
                });
            } catch (err) {
                console.warn('Works slider: no render target, drawing without the warp.', err);
                this.rt = null;
                return;
            }
            this.postMaterial = new THREE.ShaderMaterial({
                vertexShader: POST_VERTEX,
                fragmentShader: WARP_FRAGMENT,
                uniforms: {
                    uTexture: { value: this.rt.texture },
                    uStrength: { value: 0 },
                    uScanline: { value: SCANLINE },
                    uChroma: { value: CHROMA }
                },
                transparent: true,
                depthTest: false,
                depthWrite: false,
                // The target holds premultiplied colour, so composite it as such
                blending: THREE.CustomBlending,
                blendSrc: THREE.OneFactor,
                blendDst: THREE.OneMinusSrcAlphaFactor,
                blendSrcAlpha: THREE.OneFactor,
                blendDstAlpha: THREE.OneMinusSrcAlphaFactor
            });
            this.postScene = new THREE.Scene();
            this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            this.postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.postMaterial));
        }

        resizePost() {
            if (!this.rt) return;
            const size = new THREE.Vector2();
            this.renderer.getDrawingBufferSize(size);
            this.rt.setSize(Math.max(1, size.x), Math.max(1, size.y));
        }

        // Extra copies only exist on very wide screens; they share the project's material
        syncCopies() {
            const base = this.projects.length;
            const wanted = base * this.copies;
            while (this.items.length > wanted) {
                const item = this.items.pop();
                this.scene.remove(item.mesh);
                item.label.remove();
            }
            while (this.items.length < wanted) {
                const source = this.items[this.items.length % base];
                const mesh = new THREE.Mesh(this.geometry, source.material);
                mesh.frustumCulled = false;
                this.scene.add(mesh);
                const label = source.label.cloneNode(true);
                this.labels.appendChild(label);
                this.items.push({ project: source.project, index: this.items.length, mesh, material: source.material, label, hover: 0, hoverTarget: 0, x: 0 });
            }
        }

        // First card starts at the content column's left edge
        resetOffset() {
            this.offset = this.target = -this.width / 2 + this.inset + this.cardW / 2;
        }

        wrap(x) {
            const half = this.loopW / 2;
            return ((((x + half) % this.loopW) + this.loopW) % this.loopW) - half;
        }

        // Pointer position (client coords) to the card under it, if any
        hitTest(clientX, clientY) {
            const rect = this.stage.getBoundingClientRect();
            const x = clientX - rect.left - this.width / 2;
            const y = this.height / 2 - (clientY - rect.top);
            return this.items.find((item) =>
                Math.abs(x - item.x) <= this.cardW / 2 && Math.abs(y - this.cardY) <= this.cardH / 2
            ) || null;
        }

        setHovered(item) {
            if (this.hovered === item) return;
            if (this.hovered) {
                this.hovered.hoverTarget = 0;
                this.hovered.label.classList.remove('is-hover');
            }
            this.hovered = item;
            if (item) {
                item.hoverTarget = 1;
                item.label.classList.add('is-hover');
            }
            this.stage.classList.toggle('is-over-card', !!item);
            this.wake();
        }

        openProject(item, openerEl) {
            const { project } = item;
            if (project.href) {
                window.location.href = project.href;
            } else if (window.ProjectGallery) {
                const rect = this.stage.getBoundingClientRect();
                const from = {
                    left: rect.left + this.width / 2 + item.x - this.cardW / 2,
                    top: rect.top + this.cardBottomCss - this.cardH,
                    width: this.cardW,
                    height: this.cardH
                };
                window.ProjectGallery.open(project.id, openerEl, { from, focus: project.focus });
            }
        }

        hideHint() {
            if (this.hint) this.hint.classList.add('is-hidden');
        }

        bindInput() {
            const stage = this.stage;

            stage.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                this.pointer = {
                    id: e.pointerId, startX: e.clientX, lastX: e.clientX,
                    lastT: performance.now(), downT: performance.now(), vx: 0, dragged: false
                };
                stage.setPointerCapture(e.pointerId);
                if (e.pointerType === 'mouse') stage.focus({ preventScroll: true });
            });

            stage.addEventListener('pointermove', (e) => {
                const p = this.pointer;
                if (!p || e.pointerId !== p.id) {
                    if (e.pointerType === 'mouse') this.setHovered(this.hitTest(e.clientX, e.clientY));
                    return;
                }
                const now = performance.now();
                const dx = e.clientX - p.lastX;
                if (!p.dragged && Math.abs(e.clientX - p.startX) > TAP_PX) {
                    p.dragged = true;
                    stage.classList.add('is-dragging');
                    this.setHovered(null);
                    this.hideHint();
                }
                if (p.dragged) {
                    this.target += dx;
                    const dt = Math.max(1, now - p.lastT);
                    const vx = Math.max(-MAX_VX, Math.min(MAX_VX, dx / dt));
                    p.vx = p.vx * 0.6 + vx * 0.4;
                    this.wake();
                }
                p.lastX = e.clientX;
                p.lastT = now;
            });

            const release = (e) => {
                const p = this.pointer;
                if (!p || e.pointerId !== p.id) return;
                this.pointer = null;
                stage.classList.remove('is-dragging');
                if (p.dragged) {
                    // A quick release keeps some of its speed
                    if (performance.now() - p.lastT < 80) this.target += p.vx * FLING;
                    this.wake();
                    return;
                }
                if (e.type === 'pointerup' && performance.now() - p.downT < TAP_MS) {
                    const item = this.hitTest(e.clientX, e.clientY);
                    // Label clicks are handled by the label itself
                    if (item && !e.target.closest('.works-label')) this.openProject(item, item.label);
                }
            };
            stage.addEventListener('pointerup', release);
            stage.addEventListener('pointercancel', release);
            stage.addEventListener('pointerleave', (e) => {
                if (!this.pointer && e.pointerType === 'mouse') this.setHovered(null);
            });

            // A click that ends a drag must not open anything
            let lastDragEnd = 0;
            stage.addEventListener('pointerup', (e) => {
                if (this.pointer === null && e.isPrimary) lastDragEnd = stage.classList.contains('is-dragging') ? performance.now() : lastDragEnd;
            }, true);
            stage.addEventListener('click', (e) => {
                const label = e.target.closest('.works-label');
                if (!label) return;
                if (performance.now() - lastDragEnd < 50) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                const item = this.items.find((it) => it.label === label);
                if (!item) return;
                if (!item.project.href) {
                    e.preventDefault();
                    this.openProject(item, label);
                }
            });

            // Trackpad swipes: only claim the event when it is mostly horizontal
            stage.addEventListener('wheel', (e) => {
                if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
                e.preventDefault();
                this.target -= e.deltaX;
                this.hideHint();
                this.wake();
            }, { passive: false });

            stage.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.target += e.key === 'ArrowRight' ? -this.slot : this.slot;
                    this.hideHint();
                    this.wake();
                }
            });

            // Tabbing to a label brings its card to the centre
            this.labels.addEventListener('focusin', (e) => {
                const label = e.target.closest('.works-label');
                const item = label && this.items.find((it) => it.label === label);
                if (!item) return;
                // An overflow: hidden fallback may have scrolled the stage to reveal the label
                this.stage.scrollLeft = 0;
                this.stage.scrollTop = 0;
                this.target -= item.x;
                this.wake();
            });
        }

        bindLifecycle() {
            if ('ResizeObserver' in window) {
                new ResizeObserver(() => this.layout()).observe(this.stage);
            } else {
                window.addEventListener('resize', () => this.layout());
            }

            if ('IntersectionObserver' in window) {
                new IntersectionObserver((entries) => {
                    const entry = entries[0];
                    if (entry.isIntersecting) this.loadTextures();
                }, { rootMargin: '600px 0px' }).observe(this.stage);
                new IntersectionObserver((entries) => {
                    this.visible = entries[0].isIntersecting;
                    if (this.visible) this.wake(); else this.sleep();
                }).observe(this.stage);
            } else {
                this.visible = true;
                this.loadTextures();
            }

            document.addEventListener('visibilitychange', () => {
                if (document.hidden) this.sleep(); else this.wake();
            });

            this.scrollProgress = this.readScrollProgress();
            window.addEventListener('scroll', () => this.onScroll(), { passive: true });

            // Narrow viewports swap back to the DOM strip
            const narrow = window.matchMedia(`(max-width: ${MIN_WIDTH - 1}px)`);
            const applyNarrow = () => {
                this.narrow = narrow.matches;
                this.stage.hidden = this.narrow;
                this.strip.hidden = !this.narrow;
                this.section.classList.toggle('works-section--gl', !this.narrow);
                if (this.narrow) this.sleep(); else { this.layout(); this.wake(); }
            };
            narrow.addEventListener('change', applyNarrow);
            applyNarrow();
        }

        // 0 when the stage's top reaches the bottom of the viewport, 1 when it reaches the centre
        readScrollProgress() {
            const top = this.stage.getBoundingClientRect().top;
            const vh = window.innerHeight || 1;
            return Math.min(1, Math.max(0, (vh - top) / (vh / 2)));
        }

        // Scrolling the section into view also slides the strip a little, as on the
        // reference site. scrollProgress is a high-water mark: only new ground nudges,
        // so small bounces near the section don't keep pushing, and the mark only
        // lowers once the visitor has scrolled well back up. During a drag the mark
        // still follows the scroll but the strip is left alone.
        onScroll() {
            const progress = this.readScrollProgress();
            const mark = this.scrollProgress;
            if (mark === null) {
                this.scrollProgress = progress;
                return;
            }
            if (progress > mark) {
                this.scrollProgress = progress;
                if (this.pointer || this.narrow) return;
                this.target -= (progress - mark) * this.width * NUDGE;
                this.wake();
            } else if (progress < mark - REWIND) {
                this.scrollProgress = progress + REWIND;
            }
        }

        // The loop runs only while something is moving and the stage is on screen
        wake() {
            if (this.rafId || !this.visible || this.narrow || document.hidden) return;
            this.rafId = requestAnimationFrame(() => this.tick());
        }

        sleep() {
            if (this.rafId) cancelAnimationFrame(this.rafId);
            this.rafId = 0;
        }

        tick() {
            this.rafId = 0;
            const now = performance.now();
            // After an idle stretch the gap is meaningless, so treat it as one frame
            const dt = this.lastTick ? now - this.lastTick : FRAME_MS;
            this.lastTick = now;
            const busy = this.update(dt);
            this.render();
            if (busy) this.wake(); else this.lastTick = 0;
        }

        // Advances the motion by dt milliseconds; returns whether anything is still
        // animating. The easing constants are per 60Hz frame, so a 120Hz display runs
        // the same curve in twice the steps and velocity is reported per 60Hz frame.
        update(dt = FRAME_MS) {
            const k = Math.min(3, Math.max(0.25, dt / FRAME_MS));
            const ease = (perFrame) => 1 - Math.pow(1 - perFrame, k);

            const prev = this.offset;
            this.offset += (this.target - this.offset) * ease(LERP);
            if (Math.abs(this.target - this.offset) < 0.02) this.offset = this.target;
            this.velocity = (this.offset - prev) / k;
            this.frames += 1;

            // Narrow stages get more bend per pixel, as on the reference site
            const t = Math.min(2, Math.max(1, 2 - (this.width - 320) / 480));
            const warpTarget = Math.max(-WARP_MAX, Math.min(WARP_MAX, (this.velocity / this.width) * WARP_GAIN * t));
            this.warp += (warpTarget - this.warp) * ease(WARP_SMOOTH);
            if (Math.abs(this.warp) < 0.001 && warpTarget === 0) this.warp = 0;

            let animating = this.offset !== this.target || this.warp !== 0;
            this.items.forEach((item) => {
                item.x = this.wrap(item.index * this.slot + this.offset);
                item.mesh.position.x = item.x;

                if (item.hover !== item.hoverTarget) {
                    item.hover += (item.hoverTarget - item.hover) * ease(HOVER_LERP);
                    if (Math.abs(item.hoverTarget - item.hover) < 0.005) item.hover = item.hoverTarget;
                    animating = true;
                }
                const u = item.material.uniforms;
                u.uHover.value = item.hover;
                u.uBorderColor.value.set(
                    CYAN[0] + (MAGENTA[0] - CYAN[0]) * item.hover,
                    CYAN[1] + (MAGENTA[1] - CYAN[1]) * item.hover,
                    CYAN[2] + (MAGENTA[2] - CYAN[2]) * item.hover
                );
                item.mesh.renderOrder = item.hover > 0 ? 1 : 0;

                const left = this.width / 2 + item.x - this.cardW / 2;
                item.label.style.transform = `translate3d(${left}px, ${this.cardBottomCss + LABEL_GAP}px, 0)`;
            });
            return animating;
        }

        // Cards go to the render target, then the warp quad draws them to the canvas
        render() {
            if (!this.renderer || this.narrow) return;
            if (!this.rt) {
                this.renderer.render(this.scene, this.camera);
                return;
            }
            this.postMaterial.uniforms.uStrength.value = this.warpOverride === null ? this.warp : this.warpOverride;
            this.renderer.setRenderTarget(this.rt);
            this.renderer.render(this.scene, this.camera);
            this.renderer.setRenderTarget(null);
            this.renderer.render(this.postScene, this.postCamera);
        }

        // Synchronous 60Hz frames for testing without requestAnimationFrame
        step(n = 1) {
            for (let i = 0; i < n; i++) this.update(FRAME_MS);
            this.render();
            return { offset: this.offset, target: this.target, velocity: this.velocity, warp: this.warp };
        }
    }

    function init() {
        const section = document.getElementById('projects');
        const data = window.ProjectsData;
        if (!section || !data || !window.THREE || !section.querySelector('.works-strip')) return;
        if (reducedMotion()) return;

        const slider = new Slider(section, data.list);
        if (slider.mount()) window.WorksSlider.instance = slider;
    }

    window.WorksSlider = { init, instance: null };
    document.addEventListener('sharedComponentsReady', init);
})();
