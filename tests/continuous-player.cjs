// Browser regression: serve the root portfolio, then run this with Playwright.
// Optional: PLAYWRIGHT_MODULE, CHROME_PATH, PORTFOLIO_URL, PORTFOLIO_SCREENSHOTS.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:8766';

async function check() {
    const browser = await chromium.launch({
        headless: true,
        ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
    });
    try {
        const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce' });
        const page = await context.newPage();
        page.setDefaultTimeout(15000);
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const at = async path => {
            await page.waitForFunction(path => location.pathname === path, path);
            await page.waitForFunction(() => document.querySelectorAll('main:not([hidden])').length === 1);
        };
        const state = () => page.evaluate(() => ({
            same: window.keptAudio === document.getElementById('jukebox-audio'),
            src: keptAudio.src, time: keptAudio.currentTime, paused: keptAudio.paused,
            dock: !document.getElementById('jukebox-dock').hidden,
            legacy: !!document.getElementById('mp3-player')
        }));
        const continuous = async before => {
            const after = await state();
            assert(after.same && !after.paused && !after.legacy);
            assert.equal(after.src, before.src);
            assert(after.time >= before.time);
            return after;
        };

        await page.goto(`${base}/index.html`);
        await page.locator('#insert').click();
        await page.waitForFunction(() => document.body.dataset.phase === 'playing' && document.getElementById('jukebox-audio').currentTime > .2);
        await page.evaluate(() => {
            window.keptAudio = document.getElementById('jukebox-audio');
            window.pauses = [];
            keptAudio.addEventListener('pause', () => pauses.push(keptAudio.currentTime));
        });
        let before = await state();
        await page.locator('.portfolio-footer a').filter({ hasText: /^Blog$/ }).click();
        await at('/blog.html');
        assert.equal(await page.locator('main:not([hidden]) .article-card').count(), 4);
        assert((await continuous(before)).dock);
        assert(await page.locator('#bg-controls').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).display === 'none')));

        // Home styles are disabled after navigation. The persistent player must
        // retain its own layout instead of becoming ordinary top-of-page text.
        const dockLayout = await page.locator('#jukebox-dock').evaluate(dock => {
            const style = getComputedStyle(dock), rect = dock.getBoundingClientRect();
            return { position: style.position, bottom: Number.parseFloat(style.bottom),
                top: rect.top, left: rect.left, right: rect.right, edge: rect.bottom,
                viewportWidth: innerWidth, viewportHeight: innerHeight };
        });
        assert.equal(dockLayout.position, 'fixed');
        assert.equal(dockLayout.bottom, 20);
        assert(dockLayout.top > dockLayout.viewportHeight / 2);
        assert(dockLayout.left >= 0 && dockLayout.right <= dockLayout.viewportWidth);
        assert.equal(dockLayout.edge, dockLayout.viewportHeight - dockLayout.bottom);

        // Use real wheel input over the article area; the hidden Home opening
        // previously swallowed every upward wheel gesture after this route.
        await page.mouse.move(1100, 700);
        await page.mouse.wheel(0, 600);
        await page.waitForFunction(() => scrollY > 300);
        const blogScroll = await page.evaluate(() => scrollY);
        await page.mouse.wheel(0, -400);
        await page.waitForFunction(previous => scrollY < previous - 200, blogScroll);
        await page.mouse.wheel(0, -2000);
        await page.waitForFunction(() => scrollY <= 3);
        await continuous(before);

        // Every compact control must remain usable after leaving Home.
        await page.locator('#jukebox-dock-choose').click();
        assert(await page.locator('#jukebox-chooser').isVisible());
        assert.equal(await page.locator('#jukebox-chooser').evaluate(chooser => getComputedStyle(chooser).position), 'fixed');
        await page.locator('#jukebox-chooser-genres button[data-genre="House"]').click();
        await page.locator('#jukebox-chooser-list button').nth(1).click();
        await page.waitForFunction(() => document.body.dataset.phase === 'playing' &&
            document.getElementById('jukebox-dock-title').textContent === 'Artificial Glass');
        assert((await state()).same && !(await state()).paused);
        assert(await page.locator('#jukebox-chooser').isHidden());
        await page.locator('#jukebox-dock-toggle').click();
        await page.waitForFunction(() => keptAudio.paused);
        await page.locator('#jukebox-dock-toggle').click();
        await page.waitForFunction(() => !keptAudio.paused && document.body.dataset.phase === 'playing');
        await page.locator('#jukebox-dock-next').click();
        await page.waitForFunction(() => document.body.dataset.phase === 'playing' &&
            document.getElementById('jukebox-dock-title').textContent === 'Among Us' && keptAudio.currentTime > .2);
        assert((await state()).same && !(await state()).paused);
        // The remaining continuity checks start after these intentional changes.
        before = await state();
        await page.evaluate(() => { pauses.length = 0; });
        if (process.env.PORTFOLIO_SCREENSHOTS) await page.screenshot({ path: `${process.env.PORTFOLIO_SCREENSHOTS}/blog-desktop.png` });

        // The entire card is a real link, including its image and excerpt.
        await page.locator('main:not([hidden]) .article-card a').first().click();
        await at('/blog/vibe-coding-security.html');
        assert((await page.locator('#article-content').innerText()).length > 1000);
        await continuous(before);
        await page.goBack(); await at('/blog.html');
        await page.locator('.article-card a').nth(1).click(); await at('/blog/lions-of-paradise-1.html');
        assert(await page.locator('#article-content p').count() > 10);
        await page.locator('.nav-button.next').click(); await at('/blog/lions-of-paradise-2.html');
        assert((await page.locator('#article-content').innerText()).length > 50);
        await continuous(before);
        assert.equal(await page.locator('#article-content').count(), 1);

        await page.locator('#jukebox-dock-toggle').click();
        assert((await state()).paused);
        await page.locator('.navbar .nav-link').filter({ hasText: /^Home$/ }).click(); await at('/index.html');
        assert((await state()).same && (await state()).paused);
        await page.locator('#play-pause').click();
        await page.waitForFunction(() => document.body.dataset.phase === 'playing');
        await page.goBack(); await at('/blog/lions-of-paradise-2.html');
        assert(!(await state()).paused);
        assert.equal(await page.evaluate(() => pauses.length), 1);
        await page.goForward(); await at('/index.html');
        assert.equal(await page.locator('#track-list button').count(), 11);
        await page.locator('#play-pause').click();
        assert.deepEqual(errors, []);

        // Start directly on a post at phone width, then mount the home deck later.
        const phone = await context.newPage();
        phone.setDefaultTimeout(15000);
        await phone.setViewportSize({ width: 320, height: 740 });
        const phoneErrors = [];
        phone.on('pageerror', error => phoneErrors.push(error.message));
        await phone.goto(`${base}/blog/lions-of-paradise-1.html`);
        await phone.locator('#jukebox-music-button').waitFor();
        assert(await phone.locator('#jukebox-audio').evaluate(audio => audio.paused && !audio.getAttribute('src')));
        await phone.locator('#jukebox-music-button').click();
        await phone.locator('#jukebox-chooser-genres button[data-genre="Live"]').click();
        await phone.locator('#jukebox-chooser-list button').last().click();
        await phone.waitForFunction(() => document.body.dataset.phase === 'playing');
        await phone.evaluate(() => window.keptAudio = document.getElementById('jukebox-audio'));
        await phone.locator('.back-link').click();
        await phone.waitForFunction(() => location.pathname === '/blog.html');
        assert(await phone.evaluate(() => keptAudio === document.getElementById('jukebox-audio') && !keptAudio.paused));
        assert(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        if (process.env.PORTFOLIO_SCREENSHOTS) await phone.screenshot({ path: `${process.env.PORTFOLIO_SCREENSHOTS}/blog-mobile.png` });

        // Repeated requests for uncached Home must mount exactly one deck.
        await phone.route('**/index.html', async route => {
            if (route.request().isNavigationRequest()) return route.continue();
            await new Promise(resolve => setTimeout(resolve, 120));
            return route.continue();
        });
        await phone.locator('.mobile-toggle').click();
        await phone.locator('.navbar .nav-link').filter({ hasText: /^Home$/ }).evaluate(link => { link.click(); link.click(); });
        await phone.waitForFunction(() => location.pathname === '/index.html');
        await phone.locator('#track-list button').last().waitFor({ state: 'attached' });
        assert.equal(await phone.locator('#portfolio-main').count(), 1);
        assert(await phone.evaluate(() => keptAudio === document.getElementById('jukebox-audio') && !keptAudio.paused));
        // Use the real seek control so non-range local servers can buffer first.
        await phone.locator('#seek').evaluate(slider => {
            slider.value = '995'; slider.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await phone.waitForFunction(() => document.body.dataset.phase === 'playing' && keptAudio.currentTime > keptAudio.duration * .99);
        await phone.locator('.portfolio-footer a').filter({ hasText: /^Blog$/ }).click();
        await phone.waitForFunction(() => location.pathname === '/blog.html');

        // Finish the last Live track with real media; wrap within the same genre.
        await phone.waitForFunction(() => document.getElementById('jukebox-dock-title').textContent === 'Shoe 2' && document.body.dataset.phase === 'playing');
        assert(await phone.locator('#jukebox-audio').evaluate(audio => !audio.loop && !audio.paused));
        assert.equal(await phone.locator('#jukebox-audio').count(), 1);
        assert.deepEqual(phoneErrors, []);
        await phone.locator('#jukebox-dock-toggle').click();
        console.log('Passed: persistent player styling and controls, bidirectional blog scrolling, continuous playback, posts and series, history, direct entry, mobile, repeated navigation, and playlist wrap.');
    } finally {
        await browser.close();
    }
}

check().catch(error => { console.error(error); process.exitCode = 1; });
