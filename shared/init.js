// Shared initialization and dependency loading
(function() {
    'use strict';
    
    // Load Three.js dependency
    function loadThreeJS() {
        return new Promise((resolve, reject) => {
            if (window.THREE) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Get the correct path for shared components
    function getSharedPath() {
        const isInSubdirectory = window.location.pathname.split('/').length > 2;
        return isInSubdirectory ? '../shared/' : 'shared/';
    }
    
    // Load configuration
    function loadConfig() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = getSharedPath() + 'config.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Load navbar component
    function loadNavbar() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = getSharedPath() + 'navbar.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Load background component
    function loadBackground() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = getSharedPath() + 'background.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Load MP3 player component
    function loadMP3Player() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = getSharedPath() + 'mp3player.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Initialize shared components after DOM is ready
    function initializeSharedComponents() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeSharedComponents);
            return;
        }
        
        console.log('Starting component initialization...');
        
        // Load dependencies and components sequentially
        loadConfig()
            .then(() => {
                console.log('Config loaded');
                return loadNavbar();
            })
            .then(() => {
                console.log('Navbar loaded');
                return loadThreeJS();
            })
            .then(() => {
                console.log('Three.js loaded');
                return loadBackground();
            })
            .then(() => {
                console.log('Background loaded');
                return loadMP3Player();
            })
            .then(() => {
                console.log('MP3 Player loaded');
                // All dependencies loaded, components are ready to use
                console.log('Shared components loaded successfully');
                
                // Dispatch custom event to signal readiness
                const event = new CustomEvent('sharedComponentsReady');
                document.dispatchEvent(event);
            })
            .catch(error => {
                console.error('Failed to load shared components:', error);
            });
    }
    
    // Auto-initialize on script load
    initializeSharedComponents();
    
    // Export initialization functions for manual use
    window.SharedComponents = {
        loadConfig,
        loadNavbar,
        loadBackground,
        loadThreeJS,
        loadMP3Player
    };
})();