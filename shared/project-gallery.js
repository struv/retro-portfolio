// Screenshot gallery dialog for professional project cards
(function() {
    'use strict';

    // Screenshots are captured from local builds seeded with mock data only.
    // Cards whose list is empty stay as plain, non-clickable cards.
    const PROJECT_GALLERIES = {
        modulo: [
            { src: 'img/projects/modulo/dashboard.jpg', caption: "Daily appointments with each patient's form progress" },
            { src: 'img/projects/modulo/form-fill.jpg', caption: 'Mobile form fill with pre-filled demographics and e-signature' },
            { src: 'img/projects/modulo/messages.jpg', caption: 'Two-way SMS inbox for patient families' },
            { src: 'img/projects/modulo/kiosk-es.jpg', caption: 'Bilingual kiosk check-in (Spanish shown)' },
            { src: 'img/projects/modulo/form-packets.jpg', caption: 'Form packets mapped to visit types' }
        ],
        'vaccine-inventory': [
            { src: 'img/projects/vaccine-inventory/desktop.jpg', caption: 'Weekly stock entry by clinic, VFC and private lots' },
            { src: 'img/projects/vaccine-inventory/mobile.jpg', caption: 'Collapsible rows for entry on a phone' },
            { src: 'img/projects/vaccine-inventory/new-location.jpg', caption: 'Onboarding a new clinic location' }
        ],
        'transfer-dashboard': [
            { src: 'img/projects/transfer-dashboard/overview.jpg', caption: 'Transfers by group with period, segment, and % filters' },
            { src: 'img/projects/transfer-dashboard/peds.jpg', caption: 'Pediatric segment view' }
        ],
        'scheduling-dashboard': []
    };

    let dialog, image, caption, counter, prevBtn, nextBtn;
    let slides = [];
    let index = 0;

    function buildDialog() {
        dialog = document.createElement('dialog');
        dialog.className = 'gallery-dialog';
        dialog.setAttribute('aria-labelledby', 'gallery-title');
        dialog.innerHTML = `
            <div class="gallery-header">
                <h3 id="gallery-title" class="gallery-title"></h3>
                <button type="button" class="gallery-close" aria-label="Close screenshots">X</button>
            </div>
            <figure class="gallery-figure">
                <img class="gallery-image" alt="">
                <figcaption class="gallery-caption"></figcaption>
            </figure>
            <div class="gallery-controls">
                <button type="button" class="gallery-prev" aria-label="Previous screenshot">&lt;</button>
                <span class="gallery-counter" aria-live="polite"></span>
                <button type="button" class="gallery-next" aria-label="Next screenshot">&gt;</button>
            </div>
            <p class="gallery-note">Screens shown with mock data. No patient information.</p>
        `;
        document.body.appendChild(dialog);

        image = dialog.querySelector('.gallery-image');
        caption = dialog.querySelector('.gallery-caption');
        counter = dialog.querySelector('.gallery-counter');
        prevBtn = dialog.querySelector('.gallery-prev');
        nextBtn = dialog.querySelector('.gallery-next');

        dialog.querySelector('.gallery-close').addEventListener('click', () => dialog.close());
        prevBtn.addEventListener('click', () => show(index - 1));
        nextBtn.addEventListener('click', () => show(index + 1));

        // Clicking the backdrop (outside the dialog box) closes it
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) dialog.close();
        });

        dialog.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') show(index - 1);
            if (e.key === 'ArrowRight') show(index + 1);
        });
    }

    function show(i) {
        index = (i + slides.length) % slides.length;
        const slide = slides[index];
        image.src = slide.src;
        image.alt = slide.caption;
        caption.textContent = slide.caption;
        counter.textContent = `${index + 1} / ${slides.length}`;
        const single = slides.length < 2;
        prevBtn.hidden = single;
        nextBtn.hidden = single;
    }

    function open(title, projectSlides, opener) {
        if (!dialog) buildDialog();
        slides = projectSlides;
        dialog.querySelector('.gallery-title').textContent = title;
        show(0);
        dialog.showModal();
        dialog.addEventListener('close', () => opener.focus(), { once: true });
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
