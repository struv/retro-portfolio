// Project detail overlay: screenshots (when a project has them) plus the
// writeup, tech list, and links. Reads projects from shared/projects-data.js
// and is opened by the front-page strip via window.ProjectGallery.open(id).
(function() {
    'use strict';

    const EASE_OUT = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
    const SWIPE_THRESHOLD = 50;
    // Fraction of the stage at each edge that already counts as "all the way over",
    // so the image's edges can be reached without pinning the cursor to the border
    const PAN_EDGE = 0.1;

    let dialog, stage, image, loader, caption, counter, filmstrip, prevBtn, nextBtn, note, details, titleEl;
    let slides = [];
    let index = 0;
    let navToken = 0;
    let opener = null;
    let panFrame = 0;
    const preloaded = new Map();

    const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const thumbFor = (src) => src.replace(/\.jpg$/, '-thumb.jpg');
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

    // Load and decode an image once; later requests reuse the same promise
    function preload(src) {
        if (!preloaded.has(src)) {
            const img = new Image();
            img.src = src;
            preloaded.set(src, img.decode().catch(() => {}));
        }
        return preloaded.get(src);
    }

    function buildDialog() {
        dialog = document.createElement('dialog');
        dialog.className = 'gallery-dialog';
        dialog.setAttribute('aria-labelledby', 'gallery-title');
        dialog.innerHTML = `
            <div class="gallery-header">
                <h3 id="gallery-title" class="gallery-title"></h3>
                <button type="button" class="gallery-close" aria-label="Close project details">X</button>
            </div>
            <div class="gallery-stage">
                <img class="gallery-image" alt="" draggable="false">
                <div class="gallery-loader" aria-hidden="true"></div>
                <button type="button" class="gallery-nav gallery-prev" aria-label="Previous screenshot">&lt;</button>
                <button type="button" class="gallery-nav gallery-next" aria-label="Next screenshot">&gt;</button>
            </div>
            <p class="gallery-caption" aria-live="polite"></p>
            <div class="gallery-filmstrip" role="group" aria-label="Screenshots"></div>
            <div class="gallery-footer">
                <span class="gallery-counter"></span>
                <span class="gallery-hint">Click image to zoom</span>
            </div>
            <p class="gallery-note"></p>
            <div class="gallery-details"></div>
        `;
        document.body.appendChild(dialog);

        titleEl = dialog.querySelector('.gallery-title');
        stage = dialog.querySelector('.gallery-stage');
        image = dialog.querySelector('.gallery-image');
        loader = dialog.querySelector('.gallery-loader');
        caption = dialog.querySelector('.gallery-caption');
        counter = dialog.querySelector('.gallery-counter');
        filmstrip = dialog.querySelector('.gallery-filmstrip');
        prevBtn = dialog.querySelector('.gallery-prev');
        nextBtn = dialog.querySelector('.gallery-next');
        note = dialog.querySelector('.gallery-note');
        details = dialog.querySelector('.gallery-details');

        dialog.querySelector('.gallery-close').addEventListener('click', close);
        prevBtn.addEventListener('click', () => go(index - 1, -1));
        nextBtn.addEventListener('click', () => go(index + 1, 1));
        image.addEventListener('click', toggleZoom);

        // While zoomed, a mouse looks around the image by moving; touch keeps native scrolling
        stage.addEventListener('pointermove', (e) => {
            if (e.pointerType !== 'mouse' || !stage.classList.contains('zoomed')) return;
            const { clientX, clientY } = e;
            cancelAnimationFrame(panFrame);
            panFrame = requestAnimationFrame(() => panTo(clientX, clientY));
        });

        // Clicking the backdrop (outside the dialog box) closes it
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) close();
        });

        // Esc fires "cancel"; route it through the animated close
        dialog.addEventListener('cancel', (e) => {
            e.preventDefault();
            close();
        });

        dialog.addEventListener('keydown', (e) => {
            if (!slides.length) return;
            if (e.key === 'ArrowLeft') go(index - 1, -1);
            if (e.key === 'ArrowRight') go(index + 1, 1);
        });

        // Horizontal swipe on touch screens
        let startX = null;
        let startY = null;
        stage.addEventListener('touchstart', (e) => {
            if (stage.classList.contains('zoomed') || e.touches.length > 1) return;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        stage.addEventListener('touchend', (e) => {
            if (startX === null) return;
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            startX = null;
            if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
                dx < 0 ? go(index + 1, 1) : go(index - 1, -1);
            }
        });
    }

    function buildFilmstrip() {
        filmstrip.innerHTML = '';
        slides.forEach((slide, i) => {
            const thumb = document.createElement('button');
            thumb.type = 'button';
            thumb.className = 'gallery-thumb';
            thumb.setAttribute('aria-label', `Screenshot ${i + 1}: ${slide.caption}`);
            thumb.innerHTML = `<img src="${esc(thumbFor(slide.src))}" alt="" loading="lazy">`;
            thumb.addEventListener('click', () => go(i, i > index ? 1 : -1));
            filmstrip.appendChild(thumb);
        });
        filmstrip.hidden = slides.length < 2;
    }

    function updateChrome() {
        const slide = slides[index];
        counter.textContent = `${index + 1} / ${slides.length}`;
        const single = slides.length < 2;
        prevBtn.hidden = single;
        nextBtn.hidden = single;

        filmstrip.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
            thumb.setAttribute('aria-current', i === index ? 'true' : 'false');
        });
        const active = filmstrip.children[index];
        if (active) {
            filmstrip.scrollTo({
                left: active.offsetLeft - (filmstrip.clientWidth - active.offsetWidth) / 2,
                behavior: reducedMotion() ? 'auto' : 'smooth'
            });
        }

        caption.textContent = slide.caption;
        if (!reducedMotion()) {
            caption.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
        }
    }

    // Slide out the current image, swap in the next once decoded, slide it in
    async function go(i, dir) {
        if (!slides.length) return;
        const target = (i + slides.length) % slides.length;
        if (target === index && image.getAttribute('src')) return;

        const token = ++navToken;
        const slide = slides[target];
        const motion = !reducedMotion();
        const shift = 32 * dir;

        index = target;
        setZoom(false);
        updateChrome();

        // Only show the spinner if decoding is actually slow
        const spinnerTimer = setTimeout(() => loader.classList.add('visible'), 150);

        const leaving = motion && image.getAttribute('src')
            ? image.animate(
                [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-shift}px)` }],
                { duration: 150, easing: 'ease-in', fill: 'forwards' }
            ).finished.catch(() => {})
            : Promise.resolve();

        await Promise.all([leaving, preload(slide.src)]);
        clearTimeout(spinnerTimer);
        if (token !== navToken) return; // A newer navigation took over

        loader.classList.remove('visible');
        image.getAnimations().forEach((a) => a.cancel());
        image.src = slide.src;
        image.alt = slide.caption;

        if (motion) {
            image.animate(
                [{ opacity: 0, transform: `translateX(${shift}px)` }, { opacity: 1, transform: 'none' }],
                { duration: 260, easing: EASE_OUT }
            );
        }

        // Warm up the neighbours so the next step is instant
        preload(slides[(index + 1) % slides.length].src);
        preload(slides[(index - 1 + slides.length) % slides.length].src);
    }

    function setZoom(on) {
        stage.classList.toggle('zoomed', on);
        image.setAttribute('aria-label', on ? 'Zoom out' : 'Zoom in');
    }

    // Map the cursor's position in the stage to the same relative spot in the zoomed image
    function panTo(clientX, clientY) {
        const rect = stage.getBoundingClientRect();
        const along = (pos, start, size) =>
            Math.min(1, Math.max(0, ((pos - start) / size - PAN_EDGE) / (1 - 2 * PAN_EDGE)));
        stage.scrollLeft = along(clientX, rect.left, rect.width) * (stage.scrollWidth - stage.clientWidth);
        stage.scrollTop = along(clientY, rect.top, rect.height) * (stage.scrollHeight - stage.clientHeight);
    }

    // Toggle between fit-to-stage and the image's full resolution. A mouse pans
    // with the cursor from the start; touch centres the tapped point
    function toggleZoom(e) {
        if (stage.classList.contains('zoomed')) {
            setZoom(false);
            return;
        }
        // Older Safari fires click as a plain MouseEvent with no pointerType
        const mouse = e.pointerType ? e.pointerType === 'mouse' : window.matchMedia('(hover: hover)').matches;
        if (mouse) {
            setZoom(true);
            panTo(e.clientX, e.clientY);
            return;
        }
        const rect = image.getBoundingClientRect();
        const fx = (e.clientX - rect.left) / rect.width;
        const fy = (e.clientY - rect.top) / rect.height;
        setZoom(true);
        stage.scrollLeft = fx * image.offsetWidth - stage.clientWidth / 2;
        stage.scrollTop = fy * image.offsetHeight - stage.clientHeight / 2;
    }

    // The writeup block under the screenshots (or on its own for projects without any)
    function renderDetails(project) {
        const label = (window.ProjectsData.categoryLabel || {})[project.category] || '';
        const meta = [project.org, project.date, label].filter(Boolean).join(' · ');
        const paragraphs = (project.description || [])
            .map((p) => `<p class="project-description">${esc(p)}</p>`).join('');
        const noteHTML = project.note ? `<p class="project-note">${esc(project.note)}</p>` : '';
        const tech = project.tech && project.tech.length
            ? `<p class="project-tech">${project.tech.map(esc).join(' • ')}</p>` : '';
        const links = (project.links || [])
            .map((l) => `<p class="project-link"><a href="${esc(l.href)}">${esc(l.label)}</a></p>`).join('');
        details.innerHTML = `${meta ? `<p class="gallery-meta">${esc(meta)}</p>` : ''}${paragraphs}${noteHTML}${tech}${links}`;
    }

    // options.from: the card cover's viewport rect; when given (and the project has a
    // cover and screenshots), the cover grows out of the card into the gallery image
    function open(project, openerEl, options = {}) {
        if (!dialog) buildDialog();
        slides = project.screenshots || [];
        opener = openerEl || null;
        index = 0;
        navToken++;
        titleEl.textContent = project.title;
        image.removeAttribute('src');
        image.alt = '';
        dialog.classList.toggle('no-media', !slides.length);
        dialog.classList.remove('expanding');
        note.textContent = project.screenshotNote || '';
        note.hidden = !project.screenshotNote;
        renderDetails(project);
        buildFilmstrip();
        dialog.classList.remove('closing');
        document.documentElement.classList.add('gallery-locked');

        const canExpand = options.from && options.from.width > 0 && project.cover && slides.length && !reducedMotion();
        if (canExpand) {
            expandOpen(project, options.from, options.focus || [0.5, 0]);
            return;
        }
        dialog.showModal();
        dialog.scrollTop = 0;
        if (slides.length) go(0, 1);
    }

    // Opens on the slide that matches the cover, with a copy of the cover flying from
    // the card's box to where the gallery image lands. The real image is hidden by the
    // .expanding class until the copy arrives, then takes over in place.
    async function expandOpen(project, from, focus) {
        const token = navToken;
        const coverIndex = slides.findIndex((s) => s.src === project.cover);
        index = Math.max(0, coverIndex);
        const slide = slides[index];

        dialog.classList.add('expanding');
        dialog.showModal();
        dialog.scrollTop = 0;
        setZoom(false);
        updateChrome();

        // Put the slide in place (invisible) so its final box can be measured
        await preload(slide.src);
        if (token !== navToken) return;
        image.src = slide.src;
        image.alt = slide.caption;
        try { await image.decode(); } catch (e) { /* measure anyway */ }
        if (token !== navToken) return;
        const to = image.getBoundingClientRect();

        const ghost = document.createElement('img');
        ghost.className = 'gallery-ghost';
        ghost.src = project.cover;
        ghost.alt = '';
        ghost.style.objectPosition = `${focus[0] * 100}% ${focus[1] * 100}%`;
        dialog.appendChild(ghost);
        const box = (r) => ({ left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
        const flight = ghost.animate([box(from), box(to)], { duration: 420, easing: EASE_OUT, fill: 'forwards' });
        try { await flight.finished; } catch (e) { /* cancelled by a close */ }
        ghost.remove();
        if (token !== navToken) return;
        dialog.classList.remove('expanding');

        preload(slides[(index + 1) % slides.length].src);
        preload(slides[(index - 1 + slides.length) % slides.length].src);
    }

    function close() {
        if (!dialog || !dialog.open || dialog.classList.contains('closing')) return;
        let done = false;
        // Ignore animations bubbling up from children; fall back if the event never fires
        const onEnd = (e) => {
            if (e.target === dialog) finish();
        };
        const finish = () => {
            if (done) return;
            done = true;
            dialog.removeEventListener('animationend', onEnd);
            dialog.classList.remove('closing', 'expanding');
            dialog.querySelectorAll('.gallery-ghost').forEach((g) => g.remove());
            dialog.close();
            setZoom(false);
            document.documentElement.classList.remove('gallery-locked');
            if (opener) opener.focus();
        };
        if (reducedMotion()) {
            finish();
            return;
        }
        dialog.classList.add('closing');
        dialog.addEventListener('animationend', onEnd);
        setTimeout(finish, 400);
    }

    function openById(id, openerEl, options) {
        const project = window.ProjectsData && window.ProjectsData.byId(id);
        if (project) open(project, openerEl, options);
    }

    function preloadById(id) {
        const project = window.ProjectsData && window.ProjectsData.byId(id);
        if (project && project.screenshots && project.screenshots.length) preload(project.screenshots[0].src);
    }

    window.ProjectGallery = { open: openById, preload: preloadById, close };
})();
