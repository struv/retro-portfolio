// Three.js background setup and management
function initializeBackground() {
    const config = window.SiteConfig.background;
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'bg';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '-1';
    document.body.appendChild(canvas);
    
    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        config.camera.fov,
        window.innerWidth / window.innerHeight,
        config.camera.near,
        config.camera.far
    );
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true
    });
    
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = config.camera.position.z;
    
    // Variables for interactions
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    let scrollY = 0, targetScrollY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    
    // Create grid
    const gridHelper = new THREE.GridHelper(
        config.grid.size,
        config.grid.divisions,
        config.grid.colors.primary,
        config.grid.colors.secondary
    );
    gridHelper.position.set(
        config.grid.position.x,
        config.grid.position.y,
        config.grid.position.z
    );
    scene.add(gridHelper);
    
    // Create abstract objects group
    const abstractGroup = new THREE.Group();
    scene.add(abstractGroup);
    
    // Create torus
    const torusGeometry = new THREE.TorusGeometry(
        config.objects.torus.geometry.radius,
        config.objects.torus.geometry.tube,
        config.objects.torus.geometry.radialSegments,
        config.objects.torus.geometry.tubularSegments
    );
    const torusMaterial = new THREE.MeshBasicMaterial(config.objects.torus.material);
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    abstractGroup.add(torus);
    
    // Create icosahedron
    const icosaGeometry = new THREE.IcosahedronGeometry(
        config.objects.icosahedron.geometry.radius,
        config.objects.icosahedron.geometry.detail
    );
    const icosaMaterial = new THREE.MeshBasicMaterial(config.objects.icosahedron.material);
    const icosahedron = new THREE.Mesh(icosaGeometry, icosaMaterial);
    abstractGroup.add(icosahedron);
    
    // Create octahedron
    const octaGeometry = new THREE.OctahedronGeometry(
        config.objects.octahedron.geometry.radius,
        config.objects.octahedron.geometry.detail
    );
    const octaMaterial = new THREE.MeshBasicMaterial(config.objects.octahedron.material);
    const octahedron = new THREE.Mesh(octaGeometry, octaMaterial);
    abstractGroup.add(octahedron);
    
    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCnt = config.particles.count;
    const posArray = new Float32Array(particlesCnt * 3);
    
    for(let i = 0; i < particlesCnt * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * config.particles.range;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: config.particles.size,
        color: config.particles.color
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Create controls
    createControls();
    
    // Event listeners
    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onWindowResize);
    
    function createControls() {
        const controlsHTML = `
            <div id="bg-controls" class="retro-panel bg-controls">
                <div class="retro-panel-header">
                    <span class="retro-panel-title">EFFECTS</span>
                    <button id="toggleControlsVisibility" class="retro-minimize-btn" title="Minimize/Expand Controls">−</button>
                </div>
                <div id="controlButtons" class="bg-controls-content">
                    ${config.controls.buttons.map(button => `
                        <button id="${button.id}" class="bg-control-btn">${button.label}</button>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', controlsHTML);
        
        // Setup control functionality
        let controlsMinimized = false;
        const controlsContainer = document.getElementById('bg-controls');
        const controlButtons = document.getElementById('controlButtons');
        const toggleButton = document.getElementById('toggleControlsVisibility');
        
        // Toggle minimize functionality
        toggleButton.addEventListener('click', () => {
            controlsMinimized = !controlsMinimized;
            
            if (controlsMinimized) {
                controlsContainer.classList.add('minimized');
                toggleButton.textContent = '+';
                toggleButton.title = 'Expand Controls';
            } else {
                controlsContainer.classList.remove('minimized');
                toggleButton.textContent = '−';
                toggleButton.title = 'Minimize Controls';
            }
        });
        
        // Control button functionality
        document.getElementById('toggleGrid').addEventListener('click', () => {
            gridHelper.visible = !gridHelper.visible;
        });
        
        document.getElementById('toggleParticles').addEventListener('click', () => {
            particlesMesh.visible = !particlesMesh.visible;
        });
        
        let colorMode = 0;
        document.getElementById('toggleColors').addEventListener('click', () => {
            colorMode = (colorMode + 1) % 3;
            
            if (colorMode === 0) {
                torusMaterial.color.set(0xff00ff);
                icosaMaterial.color.set(0x00ffff);
                octaMaterial.color.set(0xffff00);
            } else if (colorMode === 1) {
                torusMaterial.color.set(0x00ff00);
                icosaMaterial.color.set(0xff0000);
                octaMaterial.color.set(0x0000ff);
            } else {
                torusMaterial.color.set(0xffffff);
                icosaMaterial.color.set(0xffffff);
                octaMaterial.color.set(0xffffff);
            }
        });
    }
    
    function onDocumentMouseMove(event) {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    }
    
    function onScroll() {
        scrollY = window.scrollY;
    }
    
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Smooth mouse movement
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;
        
        // Smooth scroll movement
        targetScrollY = scrollY * 0.005;
        
        // Rotate abstract group based on mouse position
        abstractGroup.rotation.y += 0.005 * (targetX - abstractGroup.rotation.y);
        abstractGroup.rotation.x += 0.005 * (targetY - abstractGroup.rotation.x);
        
        // Individual rotations for objects
        torus.rotation.x += 0.01;
        torus.rotation.y += 0.005;
        
        icosahedron.rotation.x -= 0.007;
        icosahedron.rotation.z += 0.01;
        
        octahedron.rotation.y += 0.02;
        octahedron.rotation.z -= 0.01;
        
        // Scale objects based on scroll
        const scaleFactor = 1 + (targetScrollY * 0.01);
        abstractGroup.scale.set(
            Math.max(0.5, Math.min(1.5, scaleFactor)),
            Math.max(0.5, Math.min(1.5, scaleFactor)),
            Math.max(0.5, Math.min(1.5, scaleFactor))
        );
        
        // Move grid based on scroll
        gridHelper.position.y = -15 + (targetScrollY * 0.1);
        
        // Rotate particles
        particlesMesh.rotation.y += 0.001;
        
        renderer.render(scene, camera);
    }
    
    animate();
}

// Export function for global use
window.initializeBackground = initializeBackground;