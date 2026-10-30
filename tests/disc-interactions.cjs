// Real pointer input against rendered discs, with normal animation enabled.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:8765';

(async () => {
    const browser = await chromium.launch({ headless: true,
        ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
    try {
        for (const width of [1440, 390]) {
            const context = await browser.newContext({ viewport: { width, height: 1100 }, reducedMotion: 'no-preference' });
            const page = await context.newPage();
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            await page.goto(base);
            await page.waitForFunction(() => document.getElementById('scene-message').hidden);
            const genre = name => page.locator(`#jukebox-genres button[data-genre="${name}"]`);
            const settled = async () => {
                await page.waitForFunction(() => document.getElementById('scene').dataset.genreTransition === 'idle');
                assert.equal(await page.locator('#scene canvas').evaluate(canvas => getComputedStyle(canvas).opacity), '1',
                    'CDs must be fully visible when a genre transition settles');
            };
            await genre('House').click();
            await settled();
            await page.locator('#stage').scrollIntoViewIfNeeded();
            let box = await page.locator('#scene canvas').boundingBox();
            // Hover (no button held) must browse again, including non-adjacent catalogue IDs.
            await page.mouse.move(box.x + 10, box.y + 20);
            await page.mouse.move(box.x + box.width - 10, box.y + 20, { steps: 12 });
            const hovered = await page.locator('#selection-title').textContent();
            assert.notEqual(hovered, 'Analog Bass', 'Horizontal mouse movement must browse the shelf');

            for (const name of ['Downtempo', 'Live', 'House']) {
                const before = await page.locator('#jukebox-audio').evaluate(audio => ({ src: audio.src, paused: audio.paused, time: audio.currentTime }));
                await genre(name).click();
                assert.equal(await page.locator('#scene').getAttribute('data-genre-transition'), 'rotating');
                await settled();
                const after = await page.locator('#jukebox-audio').evaluate(audio => ({ src: audio.src, paused: audio.paused, time: audio.currentTime }));
                assert.equal(after.src, before.src); assert.equal(after.paused, before.paused);
                assert(after.time >= before.time);
                await page.locator('#stage').scrollIntoViewIfNeeded();
                box = await page.locator('#scene canvas').boundingBox();
                // Move onto the face of the centered disc, away from its physical hole.
                const cameraDistance = box.width < box.height ? 7.3 : 5.7;
                const scale = box.height / (2 * Math.tan(21 * Math.PI / 180) * cameraDistance);
                const x = box.x + box.width / 2 + .35 * scale;
                const y = box.y + box.height / 2 - 1.05 * scale;
                await page.mouse.move(x, y);
                // Allow the spring to settle before pressing; then hold to exercise target stability.
                await page.waitForTimeout(900);
                const expected = await page.locator('#selection-title').textContent();
                await page.mouse.down();
                await page.waitForTimeout(180);
                await page.mouse.up();
                await page.waitForFunction(title => document.getElementById('now-title').textContent === title && document.body.dataset.phase === 'playing', expected);
                assert(await page.locator('#jukebox-audio').evaluate(audio => !audio.paused && !audio.error));
            }
            // New requests during an orbit must settle to the latest shelf.
            await genre('Live').click();
            await genre('Downtempo').click();
            await genre('House').click();
            await settled();
            assert.equal(await page.locator('#jukebox-genres button[aria-pressed="true"]').getAttribute('data-genre'), 'House');
            await page.locator('#play-pause').click();
            assert.deepEqual(errors, []);
            await context.close();
        }
        console.log('Passed: mouse browsing, direct CD face clicks in all genres, held presses, vertical-axis transition completion, uninterrupted audio, and rapid genre changes at desktop and phone widths.');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
