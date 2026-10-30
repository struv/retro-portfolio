// Shared initialization and dependency loading
(function() {
    'use strict';

    // Resolve assets from this script, not the page's directory depth. This
    // also works from nested routes and when the HTML is opened as a file.
    const sharedBase = new URL('./', document.currentScript.src);
    
    // Load Three.js dependency
    function loadThreeJS() {
        return new Promise((resolve, reject) => {
            if (window.THREE) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = new URL('vendor/three-r128.min.js', sharedBase).href;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Get the correct path for shared components
    function getSharedPath() {
        return sharedBase.href;
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
        
        // Config and Three.js are independent. Components can load together
        // once both dependencies are ready; keep the shared readiness event.
        Promise.all([loadConfig(), loadThreeJS()])
            .then(() => Promise.all([loadNavbar(), loadBackground(), loadMP3Player()]))
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
