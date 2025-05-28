// Navbar generation and management
function initializeNavbar() {
    const config = window.SiteConfig.nav;
    const currentPage = getCurrentPagePath();
    
    // Create navbar HTML
    const navbarHTML = `
        <nav class="navbar">
            <div class="nav-container">
                <a href="index.html" class="site-name">W.STRUVE</a>
                <button class="mobile-toggle" id="mobileToggle">☰</button>
                <div class="nav-links" id="navLinks">
                    ${config.map(item => `
                        <a href="${item.path}" class="nav-link ${item.path === currentPage ? 'active' : ''}">${item.label}</a>
                    `).join('')}
                </div>
            </div>
        </nav>
    `;
    
    // Insert navbar at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);
    
    // Initialize mobile toggle functionality
    setupMobileToggle();
    
    // Add active page styling
    highlightCurrentPage(currentPage);
}

function getCurrentPagePath() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    return filename;
}

function setupMobileToggle() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        // Close mobile nav when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 600) {
                    navLinks.classList.remove('active');
                }
            });
        });
    }
}

function highlightCurrentPage(currentPage) {
    // Add additional styling for current page if needed
    const activeLink = document.querySelector(`.nav-link[href="${currentPage}"]`);
    if (activeLink) {
        activeLink.style.color = 'var(--accent)';
    }
}

// Export function for global use
window.initializeNavbar = initializeNavbar;