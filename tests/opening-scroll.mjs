// Requirement tests around the real DOM event handlers. Native scrolling is
// simulated only when an event is not cancelled; browser QA covers its physics.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = readFileSync(new URL('../shared/opening-scroll.js', import.meta.url), 'utf8');

function browser({ height = 800, welcomeHeight = height, projectHeight = height, reduced = false, homeHidden = false } = {}) {
    let now = 0, nextId = 0;
    const frames = new Map();
    const timers = new Map();
    const listeners = new Map();
    let modal = false;
    const listen = (name, fn) => listeners.set(name, [...(listeners.get(name) || []), fn]);
    class Element {
        constructor(kind = 'body') { this.kind = kind; this.parentElement = null; this.attrs = new Map(); }
        closest(selector) {
            if (selector === '[hidden]' && this === welcome && homeHidden) return this;
            if (this.kind === 'input' && selector.includes('input')) return this;
            if (this.kind === 'button' && selector.includes('button')) return this;
            if (this.kind === 'anchor' && selector.includes('a[')) return this;
            return null;
        }
        hasAttribute(name) { return this.attrs.has(name); }
        setAttribute(name, value) { this.attrs.set(name, value); }
        focus() { document.activeElement = this; }
    }
    const body = new Element();
    const welcome = new Element('section');
    const projects = new Element('section');
    const window = {
        scrollY: 0, innerHeight: height,
        scrollTo: ({ top }) => { window.scrollY = Math.max(0, top); },
        matchMedia: () => ({ matches: reduced }), addEventListener: listen
    };
    welcome.getBoundingClientRect = () => ({ top: -window.scrollY, bottom: welcomeHeight - window.scrollY });
    projects.getBoundingClientRect = () => ({ top: welcomeHeight - window.scrollY, bottom: welcomeHeight + projectHeight - window.scrollY });
    const document = {
        readyState: 'complete', body, activeElement: body, addEventListener: listen,
        getElementById: (id) => id === 'welcome-scene' ? welcome : projects,
        querySelector: () => modal ? new Element('dialog') : null
    };
    const location = { href: 'http://localhost/', origin: 'http://localhost', pathname: '/', search: '', hash: '' };
    const context = {
        window, document, Element, location, URL,
        history: { pushState: (_, __, hash) => { location.hash = hash; } },
        performance: { now: () => now },
        getComputedStyle: () => ({ overflowY: 'auto' }),
        requestAnimationFrame: (fn) => { frames.set(++nextId, fn); return nextId; },
        cancelAnimationFrame: (id) => frames.delete(id),
        setTimeout: (fn, delay) => { timers.set(++nextId, { fn, time: now + delay }); return nextId; },
        clearTimeout: (id) => timers.delete(id)
    };
    vm.runInNewContext(source, context);
    function emit(name, properties = {}) {
        const event = { target: body, cancelable: true, defaultPrevented: false,
            preventDefault() { this.defaultPrevented = true; }, ...properties };
        for (const fn of listeners.get(name) || []) fn(event);
        return event;
    }
    function advance(ms) {
        now += ms;
        const pending = [...frames.values()]; frames.clear();
        pending.forEach((fn) => fn(now));
        for (const [id, timer] of timers) if (timer.time <= now) { timers.delete(id); timer.fn(); }
    }
    function wheel(deltaY, { wait = 16, ...rest } = {}) {
        advance(wait);
        const event = emit('wheel', { deltaY, deltaX: 0, deltaMode: 0, ...rest });
        if (!event.defaultPrevented && !rest.ctrlKey) window.scrollY = Math.max(0, window.scrollY + deltaY);
        emit('scroll');
        return event;
    }
    return { window, document, Element, emit, advance, wheel, projects, location,
        hideHome: (hidden) => { homeHidden = hidden; },
        modal: (open) => { modal = open; } };
}

test('one continuous wheel burst lands at projects, including its momentum tail', () => {
    const b = browser();
    assert.equal(b.wheel(80).defaultPrevented, true);
    for (let i = 0; i < 40; i++) assert.equal(b.wheel(30).defaultPrevented, true);
    assert.equal(b.window.scrollY, 800);
    assert.equal(b.wheel(10, { wait: 100 }).defaultPrevented, true);
    assert.equal(b.window.scrollY, 800);
});

test('the next intentional downward gesture releases without a dead gesture', () => {
    const b = browser();
    b.wheel(80);
    b.advance(600);
    assert.equal(b.wheel(100, { wait: 200 }).defaultPrevented, false);
    assert.equal(b.window.scrollY, 900);
    b.wheel(1200);
    assert.equal(b.window.scrollY, 2100);
});

test('a new gesture during animation lands and releases immediately', () => {
    const b = browser();
    b.wheel(80);
    assert.equal(b.wheel(120, { wait: 200 }).defaultPrevented, false);
    assert.equal(b.window.scrollY, 920);
});

test('a substantial reversed gesture returns to welcome without a cooldown', () => {
    const b = browser();
    b.wheel(80);
    assert.equal(b.wheel(-60, { wait: 50 }).defaultPrevented, true);
    b.advance(600);
    assert.equal(b.window.scrollY, 0);
});

test('tall welcome content is reachable before advancing; tall projects scroll freely', () => {
    const b = browser({ welcomeHeight: 1400, projectHeight: 1400 });
    assert.equal(b.wheel(200).defaultPrevented, false);
    assert.equal(b.window.scrollY, 200);
    assert.equal(b.wheel(600).defaultPrevented, true);
    b.advance(600);
    assert.equal(b.window.scrollY, 600);
    b.wheel(100, { wait: 200 }); b.advance(600);
    assert.equal(b.window.scrollY, 1400);
    assert.equal(b.wheel(500, { wait: 200 }).defaultPrevented, false);
    assert.equal(b.window.scrollY, 1900);
    assert.equal(b.wheel(500).defaultPrevented, false);
    assert.equal(b.window.scrollY, 2400);
});

test('upward return from regular content stops at projects, then welcome on next gesture', () => {
    const b = browser({ reduced: true });
    b.window.scrollY = 1300;
    assert.equal(b.wheel(-600).defaultPrevented, true);
    assert.equal(b.window.scrollY, 800);
    b.wheel(-200);
    assert.equal(b.window.scrollY, 800);
    b.wheel(-100, { wait: 200 });
    assert.equal(b.window.scrollY, 0);
});

test('reduced motion lands synchronously, but preserves momentum protection', () => {
    const b = browser({ reduced: true });
    b.wheel(40);
    assert.equal(b.window.scrollY, 800);
    b.wheel(40);
    assert.equal(b.window.scrollY, 800);
    b.wheel(40, { wait: 200 });
    assert.equal(b.window.scrollY, 840);
});

test('horizontal wheel, forms, dialogs, and gallery keyboard controls are untouched', () => {
    const b = browser();
    assert.equal(b.emit('wheel', { deltaX: 100, deltaY: 5, deltaMode: 0 }).defaultPrevented, false);
    assert.equal(b.emit('wheel', { deltaX: 0, deltaY: 100, target: new b.Element('input') }).defaultPrevented, false);
    assert.equal(b.emit('keydown', { key: 'ArrowRight' }).defaultPrevented, false);
    assert.equal(b.emit('keydown', { key: ' ', target: new b.Element('button') }).defaultPrevented, false);
    b.modal(true);
    assert.equal(b.emit('wheel', { deltaX: 0, deltaY: 100 }).defaultPrevented, false);
});

test('a previously focused volume input does not disable wheel or touch navigation elsewhere', () => {
    const b = browser({ reduced: true });
    const volume = new b.Element('input');
    b.document.activeElement = volume;
    assert.equal(b.emit('wheel', { target: volume, deltaX: 0, deltaY: 100, deltaMode: 0 }).defaultPrevented, false);
    assert.equal(b.emit('keydown', { key: 'ArrowUp' }).defaultPrevented, false);
    assert.equal(b.wheel(80).defaultPrevented, true);
    assert.equal(b.window.scrollY, 800);
    b.emit('touchstart', { touches: [{ clientX: 100, clientY: 200 }] });
    assert.equal(b.emit('touchmove', { touches: [{ clientX: 100, clientY: 250 }] }).defaultPrevented, true);
    assert.equal(b.window.scrollY, 0);
});

test('PageDown/Space navigate the opening then release to native page navigation', () => {
    const b = browser({ reduced: true });
    assert.equal(b.emit('keydown', { key: 'PageDown' }).defaultPrevented, true);
    assert.equal(b.window.scrollY, 800);
    assert.equal(b.emit('keydown', { key: ' ' }).defaultPrevented, false);
    assert.equal(b.emit('keydown', { key: 'PageUp' }).defaultPrevented, true);
    assert.equal(b.window.scrollY, 0);
});

test('vertical touch transitions, horizontal dragging stays native, upward inertia catches projects', () => {
    const b = browser({ reduced: true });
    b.emit('touchstart', { touches: [{ clientX: 100, clientY: 200 }] });
    assert.equal(b.emit('touchmove', { touches: [{ clientX: 30, clientY: 205 }] }).defaultPrevented, false);
    assert.equal(b.window.scrollY, 0);
    b.emit('touchstart', { touches: [{ clientX: 100, clientY: 200 }] });
    assert.equal(b.emit('touchmove', { touches: [{ clientX: 100, clientY: 150 }] }).defaultPrevented, true);
    assert.equal(b.window.scrollY, 800);
    b.window.scrollY = 1300;
    b.emit('touchstart', { touches: [{ clientX: 100, clientY: 200 }] });
    assert.equal(b.emit('touchmove', { touches: [{ clientX: 100, clientY: 250 }] }).defaultPrevented, false);
    b.window.scrollY = 700; b.emit('scroll');
    assert.equal(b.window.scrollY, 800);
});

test('direct projects API and real anchors remain usable after back navigation', () => {
    const b = browser({ reduced: true });
    b.window.OpeningScroll.goToProjects();
    assert.equal(b.window.scrollY, 800);
    b.emit('popstate'); b.window.scrollY = 0;
    const anchor = new b.Element('anchor'); anchor.href = 'http://localhost/#projects';
    assert.equal(b.emit('click', { target: anchor, button: 0 }).defaultPrevented, true);
    assert.equal(b.window.scrollY, 800);
    assert.equal(b.location.hash, '#projects');
    assert.equal(b.document.activeElement, b.projects);
});

test('the cached hidden homepage leaves blog wheel, PageDown, and touch scrolling native', () => {
    const b = browser({ homeHidden: true });
    assert.equal(b.wheel(80).defaultPrevented, false);
    assert.equal(b.window.scrollY, 80);

    // Exercise the opening boundary, where these inputs would otherwise be caught.
    b.window.scrollY = 0;
    assert.equal(b.emit('keydown', { key: 'PageDown' }).defaultPrevented, false);
    assert.equal(b.emit('touchstart', { touches: [{ clientX: 100, clientY: 200 }] }).defaultPrevented, false);
    assert.equal(b.emit('touchmove', { touches: [{ clientX: 100, clientY: 150 }] }).defaultPrevented, false);
    b.advance(600);
    assert.equal(b.window.scrollY, 0);
});

test('explicit route suspension releases scrolling before the homepage is hidden, then resumes', () => {
    const b = browser({ reduced: true });
    b.window.OpeningScroll.setEnabled(false);

    // The retained homepage still has ordinary geometry: route state must own
    // scrolling even before a hidden attribute or stylesheet has taken effect.
    b.window.scrollY = 800;
    assert.equal(b.wheel(-80).defaultPrevented, false);
    assert.equal(b.window.scrollY, 720);
    b.window.scrollY = 800;
    assert.equal(b.emit('keydown', { key: 'ArrowUp' }).defaultPrevented, false);
    assert.equal(b.emit('keydown', { key: 'PageUp' }).defaultPrevented, false);
    b.emit('touchstart', { touches: [{ clientX: 100, clientY: 200 }] });
    assert.equal(b.emit('touchmove', { touches: [{ clientX: 100, clientY: 250 }] }).defaultPrevented, false);
    assert.equal(b.window.scrollY, 800);

    b.window.scrollY = 0;
    assert.equal(b.wheel(80).defaultPrevented, false);
    assert.equal(b.window.scrollY, 80);
    b.window.OpeningScroll.goToProjects();
    assert.equal(b.window.scrollY, 80);

    b.window.OpeningScroll.setEnabled(true);
    b.window.scrollY = 0;
    assert.equal(b.wheel(80).defaultPrevented, true);
    assert.equal(b.window.scrollY, 800);
    assert.equal(b.wheel(-80, { wait: 200 }).defaultPrevented, true);
    assert.equal(b.window.scrollY, 0);
});

test('explicit route suspension cancels an outstanding transition without hidden markup', () => {
    const b = browser();
    assert.equal(b.wheel(80).defaultPrevented, true);
    b.advance(100);
    assert.ok(b.window.scrollY > 0 && b.window.scrollY < 800);

    b.window.OpeningScroll.setEnabled(false);
    b.window.scrollY = 450;
    b.advance(600);
    assert.equal(b.window.scrollY, 450);
    assert.equal(b.wheel(-80).defaultPrevented, false);
    assert.equal(b.window.scrollY, 370);
});

test('changing to a blog page cancels an outstanding homepage boundary animation', () => {
    const b = browser();
    assert.equal(b.wheel(80).defaultPrevented, true);
    b.advance(100);
    assert.ok(b.window.scrollY > 0 && b.window.scrollY < 800);

    b.hideHome(true);
    b.emit('portfolio-pagechange');
    b.window.scrollY = 450;
    b.advance(600);
    assert.equal(b.window.scrollY, 450);
});
