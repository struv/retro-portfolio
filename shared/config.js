// Navigation configuration
const navConfig = [
    { path: 'index.html', label: 'Home' },
    { path: 'projects.html', label: 'Projects' },
    { path: 'life.html', label: 'Life' },
    { path: 'melody.html', label: 'Melody' },
    // Add new pages here
];

// Page-specific configuration
const pageConfig = {
    'index.html': {
        disableMP3Player: false
    },
    'projects.html': {
        disableMP3Player: false
    },
    'life.html': {
        disableMP3Player: false
    },
    'melody.html': {
        disableMP3Player: true  // Disable on melody page since it has its own audio
    }
};

// Three.js background configuration
const backgroundConfig = {
    camera: {
        fov: 75,
        near: 0.1,
        far: 1000,
        position: { x: 0, y: 0, z: 30 }
    },
    grid: {
        size: 50,
        divisions: 20,
        colors: { primary: 0xff00ff, secondary: 0x00ffff },
        position: { x: 0, y: -15, z: 0 }
    },
    objects: {
        torus: {
            geometry: { radius: 10, tube: 3, radialSegments: 16, tubularSegments: 100 },
            material: { color: 0xff00ff, wireframe: true }
        },
        icosahedron: {
            geometry: { radius: 8, detail: 0 },
            material: { color: 0x00ffff, wireframe: true }
        },
        octahedron: {
            geometry: { radius: 6, detail: 0 },
            material: { color: 0xffff00, wireframe: true }
        }
    },
    particles: {
        count: 5000,
        size: 0.2,
        color: 0xffffff,
        range: 100
    },
    controls: {
        position: { bottom: '2rem', right: '2rem' },
        buttons: [
            { id: 'toggleGrid', label: 'Toggle Grid Effect' },
            { id: 'toggleParticles', label: 'Toggle Particles' },
            { id: 'toggleColors', label: 'Toggle Colors' }
        ]
    }
};

// MP3 player configuration
const mp3PlayerConfig = {
    position: { bottom: '8rem', left: '2rem' },
    defaultPlaylist: [
        { title: 'analogBass', src: 'audio/analogBass.mp3' },
        { title: 'artificialGlass', src: 'audio/artificialGlass.mp3' },
        { title: 'frostbittenFeet', src: 'audio/frostbittenFeet.mp3' },
        { title: 'minecraftDeathcore', src: 'audio/minecraftDeathcore.mp3' },
        { title: 'slofi', src: 'audio/slofi.mp3' },
        { title: 'waveMobbin', src: 'audio/waveMobbin.mp3' }
        
    ]
};

// Export for use in other modules
window.SiteConfig = {
    nav: navConfig,
    page: pageConfig,
    background: backgroundConfig,
    mp3Player: mp3PlayerConfig
};