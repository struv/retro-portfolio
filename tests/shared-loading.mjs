import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../shared/init.js', import.meta.url), 'utf8');
for (const [page, script] of [
    ['https://portfolio.test/', 'https://portfolio.test/shared/init.js'],
    ['https://portfolio.test/projects/life.html', 'https://portfolio.test/shared/init.js'],
    ['https://portfolio.test/preview/index.html', 'https://portfolio.test/preview/shared/init.js?v=1'],
    ['file:///Users/example/My%20Portfolio/index.html', 'file:///Users/example/My%20Portfolio/shared/init.js']
]) {
    test(`background dependencies load from the script directory on ${page}`, async () => {
        const requested = [], events = [];
        const window = { location: new URL(page) };
        const document = {
            readyState: 'complete', currentScript: { src: script },
            createElement: () => ({}),
            head: { appendChild(element) {
                requested.push(element.src);
                queueMicrotask(() => element.onload());
            } },
            dispatchEvent: event => events.push(event.type)
        };
        vm.runInNewContext(source, {
            window, document, URL, console: { log() {}, error(error) { throw error; } },
            CustomEvent: class { constructor(type) { this.type = type; } }
        });
        // The page URL may change while the async dependencies are loading.
        window.location = new URL('https://portfolio.test/blog/article.html');
        document.currentScript = null;
        await new Promise(resolve => setImmediate(resolve));
        const base = new URL('./', script);
        assert.deepEqual(requested.sort(), ['config.js', 'vendor/three-r128.min.js', 'navbar.js', 'background.js', 'mp3player.js']
            .map(file => new URL(file, base).href).sort());
        assert.deepEqual(events, ['sharedComponentsReady']);
    });
}
