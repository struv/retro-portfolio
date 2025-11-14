// Centralized blog data
// This file contains all blog post metadata and content
// Used by both the blog listing page and individual post pages

const blogData = {
    articles: [
        {
            id: 'vibe-coding-security',
            title: 'Vibe Coding Common Security Issues',
            excerpt: 'AI-assisted coding is revolutionary, but security can\'t be an afterthought. Learn the 8 essential security measures every developer should implement when building with modern AI tools.',
            image: 'https://i.pinimg.com/1200x/c2/3d/08/c23d082c090b55fe20d612b321a0511a.jpg',
            date: 'January 28, 2025',
            tag: 'SECURITY',
            readTime: '6 min read',
            author: 'William Struve'
        },
        {
            id: 'lions-of-paradise',
            title: 'The Lions of Paradise',
            excerpt: 'Starting a company where your childhood friend\'s brother wants you dead sounds stupid. And yeah, technically it is. But in my defense, the idea was good.',
            image: 'https://i.pinimg.com/1200x/73/34/2e/73342ef3caab915d1b75f89e0a7b05f8.jpg',
            date: 'January 23, 2025',
            tag: 'STORY',
            readTime: '12 min read',
            author: 'William Struve',
            series: {
                title: 'The Lions of Paradise',
                parts: [
                    {
                        id: 'lions-of-paradise-1',
                        title: 'Part 1: Valley Pediatric AI Solutions',
                        excerpt: 'The beginning of an unlikely venture in La Cañada.',
                        readTime: '5 min read'
                    },
                    {
                        id: 'lions-of-paradise-2',
                        title: 'Part 2: Test Story',
                        excerpt: 'Continuation of the Lions of Paradise story.',
                        readTime: '2 min read'
                    }
                ]
            }
        },
        {
            id: 'welcome-digital-realm',
            title: 'Welcome to My Digital Realm',
            excerpt: 'An introduction to my journey in web development, music production, and the intersection of technology and creativity. Exploring what makes digital experiences truly engaging.',
            image: 'https://i.pinimg.com/1200x/53/8d/f2/538df29b0fd24d2f21850feb1eb18214.jpg',
            date: 'January 15, 2025',
            tag: 'INTRO',
            readTime: '3 min read',
            author: 'William Struve'
        },
        {
            id: 'three-js-experiments',
            title: '3D Web Experiences with Three.js',
            excerpt: 'Deep dive into creating immersive 3D graphics for the web. From basic geometries to complex particle systems, exploring the possibilities of WebGL.',
            image: 'https://i.pinimg.com/736x/6c/d1/07/6cd10748a3dfb9d43929bf37c104ea5a.jpg',
            date: 'January 10, 2025',
            tag: 'TUTORIAL',
            readTime: '8 min read',
            author: 'William Struve'
        }
    ],

    // Helper function to get article by ID
    getArticle(id) {
        return this.articles.find(article => article.id === id);
    },

    // Helper function to get series info for a part ID
    getSeriesForPart(partId) {
        for (const article of this.articles) {
            if (article.series) {
                const partIndex = article.series.parts.findIndex(p => p.id === partId);
                if (partIndex !== -1) {
                    return {
                        article: article,
                        currentPart: article.series.parts[partIndex],
                        currentIndex: partIndex,
                        previousPart: partIndex > 0 ? article.series.parts[partIndex - 1] : null,
                        nextPart: partIndex < article.series.parts.length - 1 ? article.series.parts[partIndex + 1] : null
                    };
                }
            }
        }
        return null;
    }
};

// Make it available globally
if (typeof window !== 'undefined') {
    window.blogData = blogData;
}
