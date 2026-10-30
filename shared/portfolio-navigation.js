import './blog-data.js';

// The homepage only needs article paths. Fetch the renderer and Markdown
// parser when someone opens the blog or enters through an article.
async function renderBlog(...args) {
    const blog = await import('./blog.js');
    return blog.renderBlog(...args);
}

// Keep the page and its audio alive while moving around the listening portfolio.
// Other demos and external links retain normal browser navigation.
const siteRoot = new URL('../', import.meta.url);
const homeURL = new URL('index.html', siteRoot);
const blogURL = new URL('blog.html', siteRoot);
const playerStyleURL = new URL('projects/jukebox/compact-player.css?v=genres-20261030', siteRoot);
// Music lives outside the changing page. Its stylesheet must do the same.
let playerStyles = [...document.querySelectorAll('link[rel="stylesheet"]')]
    .find(node => new URL(node.href).pathname === playerStyleURL.pathname);
if (!playerStyles) {
    playerStyles = document.createElement('link'); playerStyles.rel = 'stylesheet';
    document.head.appendChild(playerStyles);
}
playerStyles.href = playerStyleURL.href;
playerStyles.media = '';
playerStyles.dataset.portfolioPersistent = '';
const blogPaths = new Set(window.blogData.articles.flatMap(article => article.series
    ? article.series.parts.map(part => new URL(`blog/${part.id}.html`, siteRoot).pathname)
    : [new URL(`blog/${article.id}.html`, siteRoot).pathname]));
const pages = new Map();
const pendingPages = new Map();
const scripts = new Map();
let currentPage, navigation = 0, changing = false, blogNav, homeInitialized = false;

function isHome(url) {
    return url.pathname === siteRoot.pathname || url.pathname === homeURL.pathname;
}

function supported(url) {
    return url.origin === siteRoot.origin && (isHome(url) ||
        url.pathname === blogURL.pathname || blogPaths.has(url.pathname));
}

function key(url) { return isHome(url) ? homeURL.pathname : url.pathname; }

function rebase(main, url) {
    for (const element of main.querySelectorAll('[href], [src], [poster]')) {
        for (const attr of ['href', 'src', 'poster']) {
            if (element.hasAttribute(attr)) element.setAttribute(attr, new URL(element.getAttribute(attr), url).href);
        }
    }
}

function capture(doc, url, initial = false) {
    const sourceMain = doc.querySelector('main');
    if (!sourceMain) throw new Error('Page content is missing.');
    const main = initial ? sourceMain : document.importNode(sourceMain, true);
    const page = {
        main, home: isHome(url), title: doc.title,
        description: doc.querySelector('meta[name="description"]')?.content || '',
        canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href'),
        styles: [...doc.querySelectorAll('head link[rel="stylesheet"], head style')]
        .filter(node => node.tagName !== 'LINK' || new URL(node.getAttribute('href'), url).pathname !== playerStyleURL.pathname)
        .map(node => {
            const style = initial ? node : document.importNode(node, true);
            if (style.hasAttribute('href')) style.href = new URL(style.getAttribute('href'), url).href;
            const media = style.getAttribute('media') || '';
            if (!initial) style.media = 'not all';
            return { node: style, media };
        })
    };
    main.dataset.portfolioPage = '';
    rebase(main, url);
    if (!initial) main.hidden = true;
    return page;
}

async function loadPage(url) {
    if (pages.has(key(url))) return pages.get(key(url));
    if (!pendingPages.has(key(url))) {
        pendingPages.set(key(url), fetchPage(url).finally(() => pendingPages.delete(key(url))));
    }
    return pendingPages.get(key(url));
}

async function fetchPage(url) {
    const response = await fetch(url, { cache: 'no-cache', signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Page could not load (${response.status}).`);
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    const page = capture(doc, url);
    try {
        if (!page.home) await renderBlog(page.main, url);
        rebase(page.main, url);
        await Promise.all(page.styles.map(({ node }) => new Promise((resolve, reject) => {
            if (node.tagName !== 'LINK' || new URL(node.href).origin !== siteRoot.origin) {
                document.head.appendChild(node); resolve(); return;
            }
            const timer = setTimeout(() => reject(new Error('Page styles took too long to load.')), 10000);
            node.onload = () => { clearTimeout(timer); resolve(); };
            node.onerror = () => { clearTimeout(timer); reject(new Error('Page styles could not load.')); };
            document.head.appendChild(node);
        })));
        pages.set(key(url), page);
        return page;
    } catch (error) {
        page.main.remove(); page.styles.forEach(({ node }) => node.remove());
        throw error;
    }
}

function loadScript(path) {
    const url = new URL(path, siteRoot).href;
    if (!scripts.has(url)) scripts.set(url, new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url; script.onload = resolve; script.onerror = reject;
        document.head.appendChild(script);
    }));
    return scripts.get(url);
}

async function initializeHome() {
    if (homeInitialized) return;
    homeInitialized = true;
    for (const path of ['shared/projects-data.js', 'shared/project-gallery.js',
        'shared/works-strip.js', 'shared/works-slider.js', 'shared/opening-scroll.js?v=continuous-2']) await loadScript(path);
    document.addEventListener('sharedComponentsReady', () => {
        if (!document.getElementById('bg')) window.initializeBackground();
    }, { once: true });
    await loadScript('shared/init.js');
}

function updateNav(page) {
    if (!blogNav) {
        blogNav = document.createElement('nav');
        blogNav.className = 'navbar'; blogNav.setAttribute('aria-label', 'Main navigation');
        blogNav.innerHTML = `<div class="nav-container"><a class="site-name" href="${homeURL}">W.STRUVE</a>
            <button class="mobile-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false" aria-controls="portfolio-nav-links">☰</button>
            <div class="nav-links" id="portfolio-nav-links"><a class="nav-link" href="${homeURL}">Home</a><a class="nav-link" href="${homeURL}#projects">Projects</a><a class="nav-link active" aria-current="page" href="${blogURL}">Blog</a></div></div>`;
        document.body.prepend(blogNav);
        const toggle = blogNav.querySelector('button'), links = blogNav.querySelector('.nav-links');
        toggle.addEventListener('click', () => toggle.setAttribute('aria-expanded', String(links.classList.toggle('active'))));
    }
    blogNav.hidden = page.home;
    blogNav.querySelector('.nav-links').classList.remove('active');
    blogNav.querySelector('button').setAttribute('aria-expanded', 'false');
}

function activate(page) {
    for (const cached of pages.values()) {
        cached.main.hidden = cached !== page;
        // Only the home deck needs to stay mounted for the audio controller.
        // Cache other views off-document so article IDs remain unique.
        if (cached !== page && !cached.home) cached.main.remove();
        for (const { node } of cached.styles) node.media = 'not all';
    }
    // Retain each page's original cascade order, including the homepage styles.
    for (const { node, media } of page.styles) { node.media = media; document.head.appendChild(node); }
    page.main.hidden = false;
    if (!page.main.isConnected) document.body.appendChild(page.main);
    document.body.classList.toggle('home-jukebox', page.home);
    document.body.toggleAttribute('data-jukebox-home', page.home);
    document.body.setAttribute('data-jukebox-portfolio', '');
    window.OpeningScroll?.setEnabled?.(page.home);
    const background = document.getElementById('bg');
    if (background) background.hidden = !page.home;
    const backgroundControls = document.getElementById('bg-controls');
    if (backgroundControls) backgroundControls.hidden = true;
    updateNav(page);
    document.title = page.title;
    let description = document.querySelector('meta[name="description"]');
    if (!description) { description = document.createElement('meta'); description.name = 'description'; document.head.appendChild(description); }
    description.content = page.description;
    document.querySelector('link[rel="canonical"]')?.remove();
    if (page.canonical) {
        const canonical = document.createElement('link'); canonical.rel = 'canonical'; canonical.href = page.canonical;
        document.head.appendChild(canonical);
    }
    currentPage = page;
    document.dispatchEvent(new CustomEvent('portfolio-pagechange'));
}

function saveScroll() {
    if (changing) return;
    history.replaceState({ ...history.state, portfolioScroll: window.scrollY }, '');
}

async function navigate(url, { push = true, restore } = {}) {
    url = new URL(url, location.href);
    if (!supported(url)) { location.assign(url); return; }
    const token = ++navigation;
    if (push) saveScroll();
    changing = true;
    try {
        const page = await loadPage(url);
        if (token !== navigation) return;
        if (push) history.pushState({ portfolioScroll: 0 }, '', url);
        activate(page);
        if (page.home) await initializeHome();
        if (token !== navigation) return;
        const target = url.hash && page.main.querySelector(`#${CSS.escape(decodeURIComponent(url.hash.slice(1)))}`);
        const top = typeof restore === 'number' ? restore : target ? target.getBoundingClientRect().top + window.scrollY : 0;
        window.scrollTo({ top, behavior: 'instant' });
        if (push) {
            const heading = page.main.querySelector('h1') || page.main;
            heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true });
        }
    } catch (error) {
        if (token === navigation) { console.warn('Portfolio navigation:', error.message); location.assign(url); }
    } finally {
        if (token === navigation) { changing = false; saveScroll(); }
    }
}

const initialURL = new URL(location.href);
const initialPage = capture(document, initialURL, true);
pages.set(key(initialURL), initialPage);
homeInitialized = initialPage.home;
history.scrollRestoration = 'manual';
const guard = document.createElement('style');
guard.textContent = '[data-portfolio-page][hidden], .navbar[hidden], #bg[hidden], body[data-jukebox-portfolio]:not([data-jukebox-home]) #bg, body[data-jukebox-portfolio] #bg-controls { display: none !important; }';
document.head.appendChild(guard);
activate(initialPage);
if (!initialPage.home) await renderBlog(initialPage.main, initialURL);

document.addEventListener('click', event => {
    const anchor = event.target.closest?.('a[href]');
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        anchor.hasAttribute('download') || anchor.hasAttribute('data-no-navigation') || (anchor.target && anchor.target !== '_self')) return;
    const url = new URL(anchor.href);
    if (!supported(url)) return;
    // Let native hash navigation and the opening's scroll controls do their job.
    if (currentPage === pages.get(key(url)) && url.pathname === location.pathname && url.search === location.search && url.hash) return;
    event.preventDefault();
    navigate(url);
}, true);
window.addEventListener('popstate', event => navigate(location.href, { push: false, restore: event.state?.portfolioScroll }));
let scrollFrame = 0;
window.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(saveScroll);
}, { passive: true });
await import('../projects/jukebox/app.js?v=live-order-20261030');
