// Exercise real catalogue browsing, random entry, and uninterrupted playback.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:8765';
const shelves = {
    House: ['Analog Bass', 'Artificial Glass', 'Among Us', 'Jazz House'],
    Downtempo: ['Frostbitten Feet', 'Minecraft Deathcore', 'Slofi', 'Wave Mobbin', 'Bass Chamber'],
    Live: ['Shoe 2', 'Shoe 4']
};

(async () => {
    const browser = await chromium.launch({ headless: true,
        ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
    try {
        // Exercise each random outcome, including with a saved song in another genre.
        for (const [genre, random] of [['House', .1], ['Downtempo', .5], ['Live', .9]]) {
            const context = await browser.newContext({ reducedMotion: 'reduce' });
            await context.addInitScript(value => {
                Math.random = () => value;
                localStorage.setItem('jukebox-last-selection', 'analog-bass');
            }, random);
            const page = await context.newPage();
            await page.goto(base);
            await page.locator('#jukebox-genres button[aria-pressed="true"]').waitFor();
            assert.equal(await page.locator('#jukebox-genres button[aria-pressed="true"]').getAttribute('data-genre'), genre);
            assert(await page.locator('#jukebox-audio').evaluate(audio => audio.paused && !audio.getAttribute('src')));
            await context.close();
        }

        for (const width of [1440, 320]) {
            const context = await browser.newContext({ viewport: { width, height: 1100 }, reducedMotion: 'reduce' });
            const page = await context.newPage();
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            await page.goto(`${base}/projects/jukebox.html`);
            await page.waitForFunction(() => document.getElementById('scene-message').hidden);
            for (const [genre, titles] of Object.entries(shelves)) {
                await page.locator(`#jukebox-genres button[data-genre="${genre}"]`).click();
                assert.deepEqual(await page.locator('#track-list li:not([hidden]) .track-title').allTextContents(), titles);
                await page.locator('#stage').press('Home');
                for (let i = 0; i < titles.length; i++) {
                    assert.equal(await page.locator('#selection-title').textContent(), titles[i]);
                    assert.equal(await page.locator('#selection-number').textContent(), `${String(i + 1).padStart(2, '0')} / ${String(titles.length).padStart(2, '0')}`);
                    if (i + 1 < titles.length) await page.locator('#browse-next').click();
                }
                assert(await page.locator('#browse-next').isDisabled());
                await page.locator('#stage').press('Home');
                assert(await page.locator('#browse-prev').isDisabled());
                await page.locator('#stage').press('End');
                assert.equal(await page.locator('#selection-title').textContent(), titles.at(-1));
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            }
            // A shelf change changes browsing only, never the audio source or position.
            await page.locator('#insert').click();
            await page.waitForFunction(() => document.body.dataset.phase === 'playing' && document.getElementById('jukebox-audio').currentTime > .1);
            const before = await page.locator('#jukebox-audio').evaluate(audio => ({ src: audio.src, time: audio.currentTime }));
            await page.locator('#jukebox-genres button[data-genre="House"]').click();
            const after = await page.locator('#jukebox-audio').evaluate(audio => ({ src: audio.src, time: audio.currentTime, paused: audio.paused }));
            assert.equal(after.src, before.src); assert(after.time >= before.time && !after.paused);
            await page.locator('#stage').press('End');
            await page.locator('#insert').click();
            await page.waitForFunction(() => document.body.dataset.phase === 'playing' && document.getElementById('now-title').textContent === 'Jazz House');
            await page.locator('#play-pause').click();
            assert(await page.locator('#jukebox-audio').evaluate(audio => audio.loop && audio.paused && !audio.error));
            assert.deepEqual(errors, []);
            await context.close();
        }

        const context = await browser.newContext({ viewport: { width: 320, height: 740 } });
        const page = await context.newPage();
        await page.goto(`${base}/blog.html`);
        await page.locator('#jukebox-music-button').click();
        for (const [genre, titles] of Object.entries(shelves)) {
            await page.locator(`#jukebox-chooser-genres button[data-genre="${genre}"]`).click();
            assert.deepEqual(await page.locator('#jukebox-chooser-list li:not([hidden]) strong').allTextContents(), titles);
        }
        await page.locator('#jukebox-chooser-list li:not([hidden]) button').first().focus();
        await page.keyboard.press('ArrowDown');
        assert.equal(await page.evaluate(() => document.activeElement.querySelector('strong').textContent), 'Shoe 4');
        await page.keyboard.press('ArrowDown');
        assert.equal(await page.evaluate(() => document.activeElement.querySelector('strong').textContent), 'Shoe 2');
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await context.close();
        console.log('Passed: all random starting genres, exact track groups and titles, arrow/key browsing, mobile layout, cross-genre playback continuity, and compact chooser keyboard navigation.');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
