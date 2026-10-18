// Screenshot gallery dialog for professional project cards
(function() {
    'use strict';

    // Screenshots are captured from local builds seeded with mock data only.
    // Cards whose list is empty stay as plain, non-clickable cards.
    // Each image has a matching "-thumb.jpg" used in the filmstrip.
    const PROJECT_GALLERIES = {
        modulo: [
            { src: 'img/projects/modulo/field-mapper.jpg', caption: 'Field mapper: place fields on any clinic PDF and auto-fill them from patient demographics' },
            { src: 'img/projects/modulo/dashboard.jpg', caption: "Daily appointments across clinics with each family's form progress" },
            { src: 'img/projects/modulo/messages.jpg', caption: 'Two-way SMS inbox: form links go out, families reply, staff answer' },
            { src: 'img/projects/modulo/kiosk-tablet.jpg', caption: "Check-in kiosk: a tablet at each clinic's front desk lets families find their appointment in English or Spanish" },
            { src: 'img/projects/modulo/form-packets.jpg', caption: 'Form packets for each visit type: new patient, newborn, well-child, sports, ADHD, Spanish' }
        ],
        'vaccine-inventory': [
            { src: 'img/projects/vaccine-inventory/desktop.jpg', caption: 'Weekly stock entry by clinic, VFC and private lots' },
            { src: 'img/projects/vaccine-inventory/mobile.jpg', caption: 'Collapsible rows for entry on a phone' },
            { src: 'img/projects/vaccine-inventory/new-location.jpg', caption: 'Onboarding a new clinic location' }
        ],
        'sp-router': [
            { src: 'img/projects/sp-router/map.jpg', caption: 'Map view: providers sharing an address grouped into one pin, with specialty breakdown' },
            { src: 'img/projects/sp-router/table.jpg', caption: 'Searchable roster with contract, class, specialty, and city filters' }
        ],
        'transfer-dashboard': [
            { src: 'img/projects/transfer-dashboard/overview.jpg', caption: 'Transfers by group with period, segment, and % filters' }
        ],
        'scheduling-dashboard': [
            { src: 'img/projects/scheduling-dashboard/grid.jpg', caption: 'Forward schedule by office and day, with booking-curve and target controls' },
            { src: 'img/projects/scheduling-dashboard/week.jpg', caption: 'Each chip is a provider\'s booked vs. expected visits; cells tint amber when under-booked, green on target' },
            { src: 'img/projects/scheduling-dashboard/decisions.jpg', caption: 'Decisions drawer ranking Move, Fill, Shorten, and Gap recommendations against historical baselines' }
        ]
    };

    const EASE_OUT = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
    const SWIPE_THRESHOLD = 50;
    // Fraction of the stage at each edge that already counts as "all the way over",
    // so the image's edges can be reached without pinning the cursor to the border
    const PAN_EDGE = 0.1;

    let dialog, stage, image, loader, caption, counter, filmstrip, prevBtn, nextBtn;
    let slides = [];
    let index = 0;
    let navToken = 0;
    let opener = null;
    let panFrame = 0;
    const preloaded = new Map();

    const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const thumbFor = (src) => src.replace(/\.jpg$/, '-thumb.jpg');

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
                <button type="button" class="gallery-close" aria-label="Close screenshots">X</button>
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
            <p class="gallery-note">Screens shown with mock data. No patient information.</p>
        `;
        document.body.appendChild(dialog);

        stage = dialog.querySelector('.gallery-stage');
        image = dialog.querySelector('.gallery-image');
        loader = dialog.querySelector('.gallery-loader');
        caption = dialog.querySelector('.gallery-caption');
        counter = dialog.querySelector('.gallery-counter');
        filmstrip = dialog.querySelector('.gallery-filmstrip');
        prevBtn = dialog.querySelector('.gallery-prev');
        nextBtn = dialog.querySelector('.gallery-next');

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
            thumb.innerHTML = `<img src="${thumbFor(slide.src)}" alt="" loading="lazy">`;
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

    function open(title, projectSlides, openerEl) {
        if (!dialog) buildDialog();
        slides = projectSlides;
        opener = openerEl;
        index = 0;
        navToken++;
        dialog.querySelector('.gallery-title').textContent = title;
        image.removeAttribute('src');
        buildFilmstrip();
        dialog.classList.remove('closing');
        document.documentElement.classList.add('gallery-locked');
        dialog.showModal();
        go(0, 1);
    }

    function close() {
        if (!dialog.open || dialog.classList.contains('closing')) return;
        let done = false;
        // Ignore animations bubbling up from children; fall back if the event never fires
        const onEnd = (e) => {
            if (e.target === dialog) finish();
        };
        const finish = () => {
            if (done) return;
            done = true;
            dialog.removeEventListener('animationend', onEnd);
            dialog.classList.remove('closing');
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

    function initializeProjectGallery() {
        document.querySelectorAll('[data-gallery]').forEach((card) => {
            const projectSlides = PROJECT_GALLERIES[card.dataset.gallery] || [];
            if (!projectSlides.length) return;

            const title = card.querySelector('.project-title').textContent;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'gallery-open';
            button.textContent = `View screenshots (${projectSlides.length})`;
            button.addEventListener('click', () => open(title, projectSlides, button));
            // Start fetching the first screenshot as soon as the visitor shows interest
            button.addEventListener('pointerenter', () => preload(projectSlides[0].src), { once: true });
            card.appendChild(button);
            card.classList.add('has-gallery');

            // Let the whole card open the gallery, but not when selecting text or using a link
            card.addEventListener('click', (e) => {
                if (e.target.closest('a, button') || window.getSelection().toString()) return;
                open(title, projectSlides, button);
            });
        });
    }

    document.addEventListener('DOMContentLoaded', initializeProjectGallery);
})();
