// Navigation configuration
const navConfig = [
    { path: 'index.html', label: 'Home' },
    { path: 'life.html', label: 'Game of Life' },
    // Add new pages here
];

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

// Export for use in other modules
window.SiteConfig = {
    nav: navConfig,
    background: backgroundConfig
};