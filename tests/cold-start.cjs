// Serve the root site, then run with the same browser options as continuous-player.cjs.
// Budgets cover a fresh homepage and deferred blog/music resources, not timing
// thresholds that vary with the machine running the test.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:8765';

(async () => {
    const browser = await chromium.launch({
        headless: true,
        ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
    });
    try {
        for (const width of [1440, 390]) {
            const context = await browser.newContext({ viewport: { width, height: 1100 } });
            const page = await context.newPage();
            page.setDefaultTimeout(15000);
            const requests = [], errors = [];
            page.on('request', request => requests.push(request.url()));
            page.on('pageerror', error => errors.push(error.message));
            await page.goto(base);
            await page.waitForFunction(() => document.getElementById('scene-message')?.hidden);
            await page.waitForFunction(() => window.WorksSlider?.instance || innerWidth < 600);
            await page.locator('#bg').waitFor({ state: 'visible' });
            const home = await page.evaluate(() => ({
                bytes: performance.getEntriesByType('resource').reduce((sum, entry) => sum + entry.transferSize, 0),
                imagesReady: [...document.querySelectorAll('.banner-bg, .profile-pic')]
                    .every(image => image.complete && image.naturalWidth > 0),
                audioCount: document.querySelectorAll('audio').length,
                silent: document.getElementById('jukebox-audio').paused && !document.getElementById('jukebox-audio').src,
                overflow: document.documentElement.scrollWidth > innerWidth
            }));
            // Includes the local Three.js runtime and optimized portrait.
            assert(home.bytes < 4_500_000, `Homepage exceeded 4.5 MB: ${home.bytes}`);
            assert(home.imagesReady && home.silent && !home.overflow);
            assert.equal(home.audioCount, 1);
            assert.equal(await page.locator('#bg').count(), 1);
            assert.equal(await page.locator('#track-list .track-button').count(), 11);
            assert(!requests.some(url => /\.mp3|assets\/covers\/[^/?]+\.png|img\/(header\.jpg|wstruve-retardio\.png)|marked\.esm|\/blog\.js|fonts\.(googleapis|gstatic)\.com/.test(url)),
                'Startup requested original artwork, audio, blog rendering, or third-party fonts');
            assert(!requests.some(url => /cdnjs\.cloudflare\.com/.test(url)), 'Background should not depend on the external CDN');

            // The below-fold WebGL gallery must still initialize after the
            // shared dependencies finish, including under the parallel loader.
            await page.locator('.welcome-nav-links a').filter({ hasText: /^Projects$/ }).click();
            await page.waitForFunction(() => document.getElementById('projects').getBoundingClientRect().top < innerHeight);
            assert(await page.locator('#projects .works-card').count() > 0);
            assert.deepEqual(errors, []);
            console.log(`Fresh ${width}px homepage: ${(home.bytes / 1e6).toFixed(2)} MB, silent, eleven discs, working projects.`);
            await context.close();
        }

        const context = await browser.newContext();
        const page = await context.newPage();
        const requests = [], errors = [];
        page.on('request', request => requests.push(request.url()));
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`${base}/blog.html`);
        await page.waitForSelector('#jukebox-music-button');
        assert(!requests.some(url => /assets\/covers|\/scene\.js|three\.|\.mp3/.test(url)),
            'Direct blog entry should not download the hidden music artwork or 3D renderer');
        await page.locator('#jukebox-music-button').click();
        await page.waitForFunction(() => [...document.querySelectorAll('#jukebox-chooser-list li:not([hidden]) img')]
            .every(image => image.complete && image.naturalWidth > 0));
        assert.equal(await page.locator('#jukebox-chooser img').count(), 11);
        assert(!requests.some(url => /\.mp3/.test(url)), 'Opening the chooser must remain silent');
        assert.deepEqual(errors, []);
        await context.close();

        // A failed artwork request must settle the parallel loader and leave
        // the real music controls usable without a partially mounted renderer.
        const fallback = await browser.newContext({ reducedMotion: 'reduce' });
        const fallbackPage = await fallback.newPage();
        await fallbackPage.route('**/frostbitten-feet.webp', route => route.abort());
        await fallbackPage.goto(base);
        await fallbackPage.getByText('The 3D preview is unavailable.', { exact: false }).waitFor();
        assert.equal(await fallbackPage.locator('#scene canvas').count(), 0);
        await fallbackPage.locator('#insert').click();
        await fallbackPage.waitForFunction(() => document.body.dataset.phase === 'playing' &&
            document.getElementById('jukebox-audio').currentTime > .1);
        await fallback.close();
        console.log('Passed: startup budgets, deferred chooser artwork, and playback after an artwork failure.');
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
