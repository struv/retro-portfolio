// Front-page project strip. Renders one card per project from
// shared/projects-data.js into a horizontal scroll-snap list, lets a mouse
// drag the strip sideways (touch keeps native momentum scrolling), and opens
// the detail overlay or the demo page when a card is clicked.
//
// Phase 2 will layer the WebGL slider over this strip; the strip stays in the
// DOM as the accessible, indexable, and small-screen version of the section.
(function () {
    'use strict';

    // Pixels of pointer travel before a press counts as a drag, not a click
    const DRAG_THRESHOLD = 6;

    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

    function cardHTML(project) {
        const data = window.ProjectsData;
        const tag = data.categoryLabel[project.category] || '';
        const meta = [project.org, project.date].filter(Boolean).join(' · ');
        const media = project.cover
            ? `<img class="works-card-cover" src="${esc(project.cover)}" alt="" loading="lazy" decoding="async" draggable="false">`
            : `<div class="works-card-cover works-card-titlecard" aria-hidden="true"><span>${esc(project.title)}</span></div>`;
        const inner = `
            <span class="works-card-media">
                ${media}
                ${tag ? `<span class="works-card-tag">${esc(tag)}</span>` : ''}
            </span>
            <span class="works-card-body">
                <span class="works-card-title">${esc(project.title)}</span>
                ${meta ? `<span class="works-card-meta">${esc(meta)}</span>` : ''}
                <span class="works-card-tagline">${esc(project.tagline)}</span>
                ${project.tech && project.tech.length ? `<span class="works-card-tech">${project.tech.map(esc).join(' • ')}</span>` : ''}
            </span>`;

        // Demos are plain links to their pages; everything else opens the overlay
        const card = project.href
            ? `<a class="works-card" href="${esc(project.href)}" data-project="${esc(project.id)}">${inner}</a>`
            : `<button type="button" class="works-card" data-project="${esc(project.id)}" aria-haspopup="dialog">${inner}</button>`;
        return `<li class="works-item">${card}</li>`;
    }

    // Mouse users can't drag a scroll container natively, so emulate it.
    // Snapping is suspended while dragging and the browser re-snaps on release.
    function enableDragScroll(strip) {
        let pointerId = null;
        let startX = 0;
        let startLeft = 0;
        let dragged = false;

        strip.addEventListener('pointerdown', (e) => {
            if (e.pointerType !== 'mouse' || e.button !== 0) return;
            pointerId = e.pointerId;
            startX = e.clientX;
            startLeft = strip.scrollLeft;
            dragged = false;
        });

        strip.addEventListener('pointermove', (e) => {
            if (e.pointerId !== pointerId) return;
            const dx = e.clientX - startX;
            if (!dragged && Math.abs(dx) > DRAG_THRESHOLD) {
                dragged = true;
                strip.classList.add('dragging');
                strip.setPointerCapture(pointerId);
            }
            if (dragged) strip.scrollLeft = startLeft - dx;
        });

        const release = (e) => {
            if (e.pointerId !== pointerId) return;
            pointerId = null;
            strip.classList.remove('dragging');
        };
        strip.addEventListener('pointerup', release);
        strip.addEventListener('pointercancel', release);

        // A click that ends a drag must not open anything
        strip.addEventListener('click', (e) => {
            if (!dragged) return;
            dragged = false;
            e.preventDefault();
            e.stopPropagation();
        }, true);
    }

    // The section breaks out of the page container with 100vw, which counts a
    // visible scrollbar; expose the scrollbar's width so CSS can subtract it
    function setScrollbarWidth() {
        const width = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.setProperty('--scrollbar-width', `${Math.max(0, width)}px`);
    }

    function initializeWorksStrip() {
        setScrollbarWidth();
        window.addEventListener('resize', setScrollbarWidth);

        const strip = document.getElementById('worksStrip');
        const data = window.ProjectsData;
        if (!strip || !data) return;

        strip.innerHTML = data.list.map(cardHTML).join('');
        enableDragScroll(strip);

        // Overlay cards; demo links navigate on their own
        strip.addEventListener('click', (e) => {
            const card = e.target.closest('button.works-card[data-project]');
            if (!card || !window.ProjectGallery) return;
            window.ProjectGallery.open(card.dataset.project, card);
        });

        // Start fetching the first screenshot as soon as the visitor shows interest
        strip.addEventListener('pointerover', (e) => {
            const card = e.target.closest('button.works-card[data-project]');
            if (card && window.ProjectGallery) window.ProjectGallery.preload(card.dataset.project);
        });

        // Same-page links to the section glide instead of jumping. This is done
        // here rather than with scroll-behavior: smooth on <html> so that landing
        // on index.html#projects from another page stays a plain, instant jump
        // that doesn't depend on an animation running during load.
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href="#projects"]');
            if (!link) return;
            const section = document.getElementById('projects');
            if (!section) return;
            e.preventDefault();
            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            section.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
            history.pushState(null, '', '#projects');
        });

        // The drag hint has done its job once the strip moves
        const hint = document.querySelector('.works-hint');
        if (hint) strip.addEventListener('scroll', () => hint.classList.add('is-hidden'), { once: true, passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWorksStrip);
    } else {
        initializeWorksStrip();
    }
})();
