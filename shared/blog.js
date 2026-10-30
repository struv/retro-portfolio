import './blog-data.js';
import { marked } from './marked.esm.js';

const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[character]));

const absoluteURL = (value, pageURL) => new URL(value, pageURL).href;

function resolveContentURLs(root, pageURL) {
    root.querySelectorAll('[href], [src]').forEach(element => {
        for (const attribute of ['href', 'src']) {
            if (element.hasAttribute(attribute)) {
                element.setAttribute(attribute, absoluteURL(element.getAttribute(attribute), pageURL));
            }
        }
    });
}

function renderArticles(grid, pageURL) {
    const cards = window.blogData.articles.map(article => {
        const element = document.createElement('article');
        element.className = 'article-card';

        const firstPart = article.series ? article.series.parts[0].id : article.id;
        const linkURL = absoluteURL(`blog/${firstPart}.html`, pageURL);
        const seriesInfo = article.series
            ? `<span class="article-date">• ${article.series.parts.length} parts</span>`
            : '';

        element.innerHTML = `
            <a href="${escapeHTML(linkURL)}" aria-labelledby="article-title-${escapeHTML(article.id)}" style="display: block; color: inherit; text-decoration: none;">
                <img src="${escapeHTML(absoluteURL(article.image, pageURL))}" alt="${escapeHTML(article.title)}" class="article-image">
                <div class="article-content-card">
                    <div class="article-meta-card">
                        <span class="article-tag">${escapeHTML(article.tag)}</span>
                        <span class="article-date">${escapeHTML(article.date)}</span>
                        <span class="article-date">•</span>
                        <span class="article-date">${escapeHTML(article.readTime)}</span>
                        ${seriesInfo}
                    </div>
                    <h2 class="article-title-card" id="article-title-${escapeHTML(article.id)}">${escapeHTML(article.title)}</h2>
                    <p class="article-excerpt">${escapeHTML(article.excerpt)}</p>
                    <span class="read-more">Read ${article.series ? 'Series' : 'Article'}</span>
                </div>
            </a>
        `;
        return element;
    });

    grid.replaceChildren(...cards);
}

function renderSeries(root, pageURL, contentData) {
    const partID = root.dataset.partId;
    const seriesData = window.blogData.getSeriesForPart(partID);
    if (!seriesData) throw new Error(`Blog series part not found: ${partID}`);

    const { article, currentPart, currentIndex, previousPart, nextPart } = seriesData;
    const seriesNavigation = article.series.parts.map(part => part.id === partID
        ? `<span class="series-part current" aria-current="page">${escapeHTML(part.title)}</span>`
        : `<a href="${escapeHTML(absoluteURL(`${part.id}.html`, pageURL))}" class="series-part">${escapeHTML(part.title)}</a>`
    ).join('');
    const previousButton = previousPart
        ? `<a href="${escapeHTML(absoluteURL(`${previousPart.id}.html`, pageURL))}" class="nav-button prev">Previous Part</a>`
        : '<div></div>';
    const nextButton = nextPart
        ? `<a href="${escapeHTML(absoluteURL(`${nextPart.id}.html`, pageURL))}" class="nav-button next">Next Part</a>`
        : '<div></div>';

    root.innerHTML = `
        <a href="${escapeHTML(absoluteURL('../blog.html', pageURL))}" class="back-link">Back to Articles</a>
        <div class="series-header">
            <div class="series-title">Series: ${escapeHTML(article.series.title)}</div>
            <div class="series-nav">${seriesNavigation}</div>
        </div>
        <article>
            <header class="article-header">
                <div class="category-tag">${escapeHTML(article.tag)} • PART ${currentIndex + 1} OF ${article.series.parts.length}</div>
                <h1 class="article-title">${escapeHTML(article.title)}</h1>
                <div class="article-meta">
                    <span>${escapeHTML(article.author)}</span>
                    <span class="meta-separator">•</span>
                    <span>${escapeHTML(article.date)}</span>
                    <span class="meta-separator">•</span>
                    <span>${escapeHTML(currentPart.readTime)}</span>
                </div>
            </header>
            <img src="${escapeHTML(absoluteURL(article.image, pageURL))}" alt="${escapeHTML(article.title)}" class="featured-image">
            <div class="article-content" id="article-content"></div>
            <nav class="article-nav">${previousButton}${nextButton}</nav>
        </article>
    `;

    // Keep the inert source with the page so rendering remains safe to repeat.
    root.appendChild(contentData);
}

/** Render a blog main after either a direct load or a portfolio navigation. */
export async function renderBlog(root, url) {
    const pageURL = new URL(url, window.location.href);
    const grid = root.querySelector('#articles-grid');
    if (grid) renderArticles(grid, pageURL);

    const contentData = root.querySelector('script[type="application/json"][data-article-content]');
    if (contentData) {
        const content = JSON.parse(contentData.textContent);
        if (typeof content !== 'string') throw new TypeError('Blog content must be a string.');

        if (root.dataset.partId) renderSeries(root, pageURL, contentData);
        const contentElement = root.querySelector('#article-content');
        if (!contentElement) throw new Error('Blog content container is missing.');

        if (root.dataset.partId) {
            const paragraphs = content.split('\n\n').map(text => {
                const paragraph = document.createElement('p');
                paragraph.textContent = text;
                return paragraph;
            });
            contentElement.replaceChildren(...paragraphs);
        } else {
            contentElement.innerHTML = await marked.parse(content);
        }
    }

    resolveContentURLs(root, pageURL);
}
