// The opening uses ordinary document flow. Only the welcome/projects boundary
// gets a transition; everything below projects keeps the browser's scrolling.
(function () {
    'use strict';

    const EDGE = 3;
    const GESTURE_GAP = 180;
    const REVERSAL_DELTA = 8;
    const CONTROL = 'input, textarea, select, [contenteditable="true"], [role="slider"], [role="listbox"]';
    let welcome, projects, enabled = true;
    let animation = null;
    let frame = 0;
    let wheel = { time: -Infinity, direction: 0, consumed: false };
    let touch = null;
    let touchGuard = null;
    let touchGuardTimer = 0;

    function geometry() {
        const y = window.scrollY;
        const a = welcome.getBoundingClientRect();
        const b = projects.getBoundingClientRect();
        return {
            welcomeTop: Math.max(0, a.top + y),
            welcomeEnd: Math.max(0, a.top + y, a.bottom + y - window.innerHeight),
            projectsTop: Math.max(0, b.top + y)
        };
    }

    function jump(y) {
        // Explicitly override any site-wide CSS smooth-scroll setting.
        window.scrollTo({ top: y, behavior: 'instant' });
    }

    function clearTouchGuard() {
        touchGuard = null;
        clearTimeout(touchGuardTimer);
    }

    function cancelTransition(land = false) {
        cancelAnimationFrame(frame);
        if (land && animation) jump(animation.target());
        animation = null;
    }

    function reset() {
        cancelTransition();
        clearTouchGuard();
        touch = null;
        wheel = { time: -Infinity, direction: 0, consumed: false };
    }

    function transition(target, focus = null) {
        cancelTransition();
        clearTouchGuard();
        const finish = () => {
            animation = null;
            if (focus) {
                if (!focus.hasAttribute('tabindex')) focus.setAttribute('tabindex', '-1');
                focus.focus({ preventScroll: true });
            }
        };
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            jump(target());
            finish();
            return;
        }
        const start = window.scrollY;
        const started = performance.now();
        const duration = Math.min(520, Math.max(260, Math.abs(target() - start) * 0.4));
        animation = { target };
        function step(now) {
            const t = Math.min(1, (now - started) / duration);
            // Re-measure the destination each frame, including after a resize.
            jump(start + (target() - start) * (1 - Math.pow(1 - t, 3)));
            if (t < 1) frame = requestAnimationFrame(step);
            else finish();
        }
        frame = requestAnimationFrame(step);
    }

    function eventElement(event) {
        return event.target instanceof Element ? event.target : document.body;
    }

    function ignored(event, keyboard = false) {
        const target = eventElement(event);
        return !enabled || welcome.closest('[hidden]') || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey ||
            document.querySelector('dialog[open]') ||
            target.closest('dialog, [aria-modal="true"], ' + CONTROL) ||
            (keyboard && document.activeElement && document.activeElement.closest(CONTROL)) ||
            (keyboard && target.closest('button, a, [role="button"]'));
    }

    function nestedCanScroll(target, direction) {
        for (let node = target; node && node !== document.body; node = node.parentElement) {
            if (node === welcome || node === projects) break;
            if (node.scrollHeight <= node.clientHeight + EDGE) continue;
            if (!/auto|scroll|overlay/.test(getComputedStyle(node).overflowY)) continue;
            if (direction < 0 ? node.scrollTop > EDGE :
                node.scrollTop + node.clientHeight < node.scrollHeight - EDGE) return true;
        }
        return false;
    }

    // A destination is returned only at a boundary or when a single native
    // delta would cross it. Long scene content stays reachable before transition.
    function destination(y, delta, bounds) {
        const { welcomeTop, welcomeEnd, projectsTop } = bounds;
        if (delta > 0 && y < projectsTop - EDGE) {
            if (y >= welcomeEnd - EDGE) return () => geometry().projectsTop;
            if (y + delta >= welcomeEnd && welcomeEnd > welcomeTop + EDGE) {
                return () => geometry().welcomeEnd;
            }
        }
        if (delta < 0) {
            if (y > projectsTop + EDGE && y + delta <= projectsTop) {
                return () => geometry().projectsTop;
            }
            if (Math.abs(y - projectsTop) <= EDGE) return () => geometry().welcomeEnd;
        }
        return null;
    }

    function onWheel(event) {
        if (ignored(event) || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
        const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
        if (!delta || nestedCanScroll(eventElement(event), Math.sign(delta))) return;
        clearTouchGuard();
        const now = performance.now();
        const direction = Math.sign(delta);
        // No platform exposes a wheel-gesture-end event. An idle gap groups a
        // trackpad's momentum; a substantial reversal also counts as new intent.
        const fresh = now - wheel.time > GESTURE_GAP ||
            (direction !== wheel.direction && Math.abs(delta) >= REVERSAL_DELTA);
        if (fresh) {
            wheel.consumed = false;
            wheel.direction = direction;
            // A fresh gesture may arrive before the visual transition finishes.
            // Land first, then honor it immediately: there is no cooldown gate.
            cancelTransition(true);
        }
        wheel.time = now;
        if (wheel.consumed) {
            event.preventDefault();
            return;
        }
        const target = destination(window.scrollY, delta, geometry());
        if (target) {
            event.preventDefault();
            wheel.consumed = true;
            transition(target);
        }
    }

    function onKey(event) {
        if (ignored(event, true)) return;
        let delta;
        if (event.key === 'PageDown' || (event.key === ' ' && !event.shiftKey)) delta = window.innerHeight * 0.9;
        else if (event.key === 'PageUp' || (event.key === ' ' && event.shiftKey)) delta = -window.innerHeight * 0.9;
        else if (event.key === 'ArrowDown') delta = 40;
        else if (event.key === 'ArrowUp') delta = -40;
        else {
            if (event.key === 'Home' || event.key === 'End') reset();
            return;
        }
        if (nestedCanScroll(eventElement(event), Math.sign(delta))) return;
        wheel = { time: -Infinity, direction: 0, consumed: false };
        clearTouchGuard();
        if (animation && event.repeat) {
            event.preventDefault();
            return;
        }
        cancelTransition(true);
        const target = destination(window.scrollY, delta, geometry());
        if (target) {
            event.preventDefault();
            transition(target);
        }
    }

    function onTouchStart(event) {
        clearTouchGuard();
        touch = null;
        if (event.touches.length !== 1 || ignored(event)) return;
        wheel = { time: -Infinity, direction: 0, consumed: false };
        cancelTransition(true);
        touch = {
            x: event.touches[0].clientX, y: event.touches[0].clientY,
            scrollY: window.scrollY, axis: null, consumed: false, target: eventElement(event)
        };
    }

    function onTouchMove(event) {
        if (!touch) return;
        if (event.touches.length !== 1) {
            touch = null;
            clearTouchGuard();
            return;
        }
        if (touch.consumed) {
            if (event.cancelable) event.preventDefault();
            return;
        }
        const dx = event.touches[0].clientX - touch.x;
        const dy = event.touches[0].clientY - touch.y;
        if (!touch.axis) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) < 10) return;
            touch.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
            if (touch.axis === 'x') return; // CD/gallery horizontal dragging owns it.
            const delta = -dy;
            if (nestedCanScroll(touch.target, Math.sign(delta))) {
                touch.axis = 'nested';
                return;
            }
            const bounds = geometry();
            const target = destination(touch.scrollY, delta, bounds);
            if (target && event.cancelable) {
                event.preventDefault();
                touch.consumed = true;
                transition(target);
                return;
            }
            // Let the browser handle vertical touch scrolling and its inertia.
            // Catch only a crossing of an opening boundary, including inertia
            // after touchend, so a fast flick cannot skip the projects landing.
            if (delta < 0 && touch.scrollY > bounds.projectsTop + EDGE) {
                touchGuard = { direction: -1, boundary: () => geometry().projectsTop };
            } else if (delta > 0 && touch.scrollY < bounds.welcomeEnd - EDGE) {
                touchGuard = { direction: 1, boundary: () => geometry().welcomeEnd };
            }
        }
    }

    function onScroll() {
        if (!enabled || welcome.closest('[hidden]')) { reset(); return; }
        if (!touchGuard || animation) return;
        const boundary = touchGuard.boundary();
        if ((window.scrollY - boundary) * touchGuard.direction > 0) {
            jump(boundary);
            if (touch) touch.consumed = true;
            clearTimeout(touchGuardTimer);
            touchGuardTimer = setTimeout(clearTouchGuard, 700);
        }
    }

    function goToProjects({ focus = false } = {}) {
        if (!enabled) return;
        reset();
        transition(() => geometry().projectsTop, focus ? projects : null);
    }

    function onAnchor(event) {
        if (!enabled || welcome.closest('[hidden]')) return;
        const anchor = eventElement(event).closest('a[href]');
        if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
        const url = new URL(anchor.href, location.href);
        if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
        reset();
        if (url.hash !== '#projects' && url.hash !== '#welcome-scene') return;
        event.preventDefault();
        if (location.hash !== url.hash) history.pushState(null, '', url.hash);
        const element = url.hash === '#projects' ? projects : welcome;
        transition(() => url.hash === '#projects' ? geometry().projectsTop : geometry().welcomeTop, element);
    }

    function init() {
        welcome = document.getElementById('welcome-scene');
        projects = document.getElementById('projects');
        if (!welcome || !projects) return;
        window.addEventListener('wheel', onWheel, { passive: false });
        document.addEventListener('keydown', onKey);
        document.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchcancel', reset);
        document.addEventListener('click', onAnchor);
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('hashchange', reset);
        window.addEventListener('popstate', reset);
        document.addEventListener('portfolio-pagechange', () => setEnabled(!welcome.closest('[hidden]')));
        // A scrollbar drag, unlike wheel momentum, is always direct navigation.
        document.addEventListener('pointerdown', (event) => {
            if (event.pointerType === 'mouse') reset();
        }, { passive: true });
        window.OpeningScroll = { goToProjects, setEnabled };
        setEnabled(!welcome.closest('[hidden]'));
    }

    function setEnabled(value) {
        enabled = !!value;
        reset();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
