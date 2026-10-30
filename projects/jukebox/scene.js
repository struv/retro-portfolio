import * as THREE from './vendor/three.module.min.js';

// Individual annular meshes keep selection, holes, edges and insertion genuinely 3D.
export async function createScene(host, tracks, onSelect, onBrowse) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const world = new THREE.Scene();
  const carousel = new THREE.Group();
  world.add(carousel);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 30);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const discs = [];
  const textures = new Set();
  // Start all artwork requests together, while fonts and geometry initialize.
  const loader = new THREE.TextureLoader();
  const coverLoads = Promise.allSettled(tracks.map(track => loader.loadAsync(track.artwork).then(texture => {
    textures.add(texture);
    return texture;
  })));
  let collection = tracks.map((_, index) => index);
  let target = 0, current = 0, velocity = 0, locked = false, loaded = -1;
  let animation = null, genreAnimation = null, last = performance.now(), elapsed = 0, spin = 0;
  let down = null, hoverX = null, hovered = -1, visible = true, raf;
  world.add(new THREE.HemisphereLight(0xe6efff, 0x273644, 3));
  const light = new THREE.DirectionalLight(0xffffff, 4);
  light.position.set(-3, 5, 7); world.add(light);
  const edgeLight = new THREE.DirectionalLight(0x8adbe7, 3);
  edgeLight.position.set(4, -2, 2); world.add(edgeLight);

  const shape = new THREE.Shape();
  shape.absarc(0, 0, 0.88, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.11, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const bodyGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.022, bevelEnabled: true, bevelSegments: 2,
    steps: 1, bevelSize: 0.004, bevelThickness: 0.004, curveSegments: 96
  });
  bodyGeometry.translate(0, 0, -0.011);
  const faceGeometry = new THREE.RingGeometry(0.19, 0.875, 128);
  const pos = faceGeometry.attributes.position;
  const uv = faceGeometry.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / 1.76 + .5, pos.getY(i) / 1.76 + .5);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x9babb5, metalness: .72, roughness: .22 });
  const vertexShader = `varying vec2 vUv; varying vec3 vNormal; varying vec3 vView;
    void main(){ vUv=uv; vNormal=normalize(normalMatrix*normal);
      vec4 p=modelViewMatrix*vec4(position,1.); vView=normalize(-p.xyz);
      gl_Position=projectionMatrix*p; }`;
  const fragmentShader = `uniform sampler2D art; uniform float reverse;
    varying vec2 vUv; varying vec3 vNormal; varying vec3 vView;
    void main(){
      vec2 p=vUv-.5; float radius=length(p); float a=atan(p.y,p.x);
      vec3 n=normalize(vNormal); float facing=abs(dot(n,normalize(vView)));
      float shift=dot(n,normalize(vec3(-.6,.8,1.)));
      vec3 rainbow=.5+.5*cos(6.28318*(vec3(0.,.33,.67)+a*.6+shift*.65));
      float lobes=pow(abs(sin(a+shift*2.)),10.);
      float grooves=.94+.06*sin(radius*2300.);
      float glint=pow(max(0.,dot(reflect(-normalize(vec3(-.8,1.,2.)),n),vView)),48.);
      vec3 silver=vec3(.27,.30,.34)+rainbow*(.18+.65*lobes)+vec3(glint*.65);
      silver*=grooves*(.65+.4*facing);
      vec3 label=texture2D(art,vUv).rgb*(.8+.25*facing);
      label+=rainbow*lobes*.095+glint*.25;
      gl_FragColor=vec4(mix(label,silver,reverse),1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`;
  // Label artwork is a transparent decal on the actual front face. A separate
  // annular mesh keeps the spindle hole open and leaves the foil back untouched.
  if (document.fonts) {
    let timer;
    await Promise.race([document.fonts.ready, new Promise(resolve => { timer = setTimeout(resolve, 1800); })]);
    clearTimeout(timer);
  }
  function labelTexture(track, index) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const center = 512, radius = 382, maxArc = 2.48, spacing = 5;
    const title = [...track.title.toUpperCase()];
    let size = 108, widths, width;
    do {
      ctx.font = `${size}px "VT323", "Courier New", monospace`;
      widths = title.map(letter => ctx.measureText(letter).width);
      width = widths.reduce((sum, value) => sum + value, 0) + spacing * (title.length - 1);
      if (width / radius <= maxArc || size <= 52) break;
      size -= 2;
    } while (true);
    const span = width / radius;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.arc(center, center, radius, -Math.PI / 2 - span / 2 - .06, -Math.PI / 2 + span / 2 + .06);
    ctx.lineWidth = size + 18; ctx.strokeStyle = 'rgba(7, 5, 28, .66)'; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 10; ctx.strokeStyle = '#08051c'; ctx.fillStyle = '#fff9ef';
    ctx.shadowColor = '#040010'; ctx.shadowBlur = 6;
    let offset = -width / 2;
    title.forEach((letter, letterIndex) => {
      const angle = -Math.PI / 2 + (offset + widths[letterIndex] / 2) / radius;
      ctx.save();
      ctx.translate(center + Math.cos(angle) * radius, center + Math.sin(angle) * radius);
      ctx.rotate(angle + Math.PI / 2);
      ctx.strokeText(letter, 0, 0); ctx.fillText(letter, 0, 0);
      ctx.restore();
      offset += widths[letterIndex] + spacing;
    });
    ctx.shadowBlur = 0;
    // The small lower label sits inside the art, well clear of the hub and rim.
    ctx.fillStyle = 'rgba(7, 5, 28, .66)'; ctx.fillRect(324, 748, 376, 116);
    ctx.fillStyle = track.color; ctx.fillRect(380, 748, 264, 3);
    ctx.font = '28px "Press Start 2P", "Courier New", monospace';
    ctx.fillStyle = '#fff9ef'; ctx.lineWidth = 6;
    ctx.strokeText('W. STRUVE', center, 787); ctx.fillText('W. STRUVE', center, 787);
    ctx.font = '32px "VT323", "Courier New", monospace'; ctx.fillStyle = track.color;
    ctx.fillText(track.genre.toUpperCase(), center, 834);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    textures.add(texture);
    return texture;
  }
  const covers = await coverLoads;
  if (covers.some(result => result.status === 'rejected')) {
    textures.forEach(texture => texture.dispose());
    bodyGeometry.dispose(); faceGeometry.dispose(); bodyMaterial.dispose();
    renderer.dispose(); renderer.domElement.remove();
    throw new Error('A disc cover could not be loaded. Reload to retry.');
  }
  for (let i = 0; i < tracks.length; i++) {
    const texture = covers[i].value;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    const group = new THREE.Group(); group.userData.index = i;
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial); group.add(body);
    for (const reverse of [0, 1]) {
      const material = new THREE.ShaderMaterial({
        uniforms: { art: { value: texture }, reverse: { value: reverse } }, vertexShader, fragmentShader
      });
      const face = new THREE.Mesh(faceGeometry, material);
      face.position.z = reverse ? -.017 : .017;
      if (reverse) face.rotation.y = Math.PI;
      group.add(face);
    }
    const label = new THREE.Mesh(faceGeometry, new THREE.MeshBasicMaterial({
      map: labelTexture(tracks[i], i), transparent: true, alphaTest: .025,
      depthWrite: false, toneMapped: false, side: THREE.FrontSide
    }));
    label.name = `disc-label-${tracks[i].id}`;
    label.position.z = .025;
    group.add(label);
    const hub = new THREE.Mesh(new THREE.RingGeometry(.11, .19, 96), new THREE.MeshStandardMaterial({
      color: 0x91a2aa, metalness: .55, roughness: .16, side: THREE.DoubleSide, transparent: true, opacity: .55
    }));
    hub.position.z = .019; group.add(hub);
    for (const r of [.113,.185,.876]) {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(r, .0035, 6, 128), bodyMaterial);
      rim.position.z = .02; group.add(rim);
    }
    const halo = new THREE.Mesh(new THREE.TorusGeometry(.898,.004,6,128), new THREE.MeshBasicMaterial({
      color: tracks[i].color, transparent: true, opacity: 0
    }));
    group.add(halo);
    group.userData.halo = halo;
    carousel.add(group); discs.push(group);
  }
  function resize() {
    const r = host.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.position.set(0, .05, camera.aspect < 1 ? 7.3 : 5.7);
    camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  function pose(index, shelf = collection, shelfPosition = current) {
    const theta = (shelf.indexOf(index) - shelfPosition) * .91;
    const position = new THREE.Vector3(Math.sin(theta)*2.3, Math.cos(theta)*2.3-1.5, -Math.abs(theta)*.45);
    // Flip between label and foil while traveling, then settle nearly face-on at center.
    const euler = new THREE.Euler(reduced.matches ? 0 : .08*Math.sin(elapsed*.35+index), theta*2.5,
      -theta*.55+(reduced.matches ? 0 : spin), 'YXZ');
    return { position, quaternion: new THREE.Quaternion().setFromEuler(euler) };
  }
  function slotPosition() {
    const r = host.getBoundingClientRect(), slot = document.getElementById('disc-slot').getBoundingClientRect();
    const v = new THREE.Vector3(((slot.left+slot.width/2-r.left)/r.width)*2-1,
      -((slot.top+slot.height/2-r.top)/r.height)*2+1, .5).unproject(camera);
    const dir = v.sub(camera.position).normalize();
    return camera.position.clone().add(dir.multiplyScalar(-camera.position.z/dir.z));
  }
  const smooth = t => t*t*(3-2*t);
  function updateVisibility(shelf = collection, shelfPosition = current) {
    const center = Math.round(shelfPosition);
    const visible = shelf.filter((index, slot) => Math.abs(slot - center) <= 1 && index !== loaded);
    // A moving disc counts toward the same three-disc limit.
    if (animation) {
      const position = visible.indexOf(animation.index);
      if (position >= 0) visible.splice(position, 1);
      visible.unshift(animation.index);
    }
    const shown = new Set(visible.slice(0, 3));
    discs.forEach((disc, index) => { disc.visible = shown.has(index); });
  }
  function finishGenreTransition() {
    genreAnimation = null;
    carousel.position.set(0, 0, 0); carousel.rotation.set(0, 0, 0);
    renderer.domElement.style.opacity = '1';
    host.dataset.genreTransition = 'idle';
    discs.forEach((disc, index) => {
      if (animation?.index === index) return;
      const p = pose(index);
      disc.position.copy(p.position); disc.quaternion.copy(p.quaternion); disc.scale.setScalar(1);
    });
    updateVisibility();
    world.updateMatrixWorld(true);
  }
  function setLoaded(index) {
    const pending = animation;
    animation = null;
    loaded = index;
    updateVisibility();
    pending?.resolve();
  }
  function settleAnimation() {
    if (animation) setLoaded(animation.type === 'insert' ? animation.index : -1);
  }
  function animateDisc(index, type) {
    if (animation) return Promise.reject(new Error('A disc is already moving.'));
    // Disc insertion uses deck coordinates, so settle the outer orbit first.
    if (genreAnimation) finishGenreTransition();
    // Background tabs suspend animation frames. Resolve even a queued insert
    // after an eject settles, so playback never waits muted for the tab to return.
    if (document.hidden) {
      setLoaded(type === 'insert' ? index : -1);
      return Promise.resolve();
    }
    const disc = discs[index];
    const start = { position: disc.position.clone(), quaternion: disc.quaternion.clone(), scale: disc.scale.x };
    disc.visible = true;
    return new Promise(resolve => { animation = { index, type, start, started: performance.now(), duration: reduced.matches ? 100 : type==='insert' ? 1150 : 850, resolve }; });
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now-last)/1000,.05); last = now;
    // Library buttons can scroll the canvas out of view: finish transitions anyway.
    if ((!visible && !animation && !genreAnimation) || document.hidden) return;
    elapsed += dt;
    if (!reduced.matches) spin += dt*.085;
    if (reduced.matches) { current = target; velocity = 0; }
    else { velocity += (target-current)*55*dt; velocity *= Math.exp(-12*dt); current += velocity*dt; }
    let displayedShelf = collection, displayedPosition = current;
    if (genreAnimation) {
      const progress = Math.min((now - genreAnimation.started) / 1100, 1);
      const outgoing = progress < .5;
      // Two quarter-turns make a 180-degree sweep. Exchange shelves only at
      // zero opacity, bringing the next one forward from the opposite side.
      const angle = smooth(progress) * Math.PI - (outgoing ? 0 : Math.PI);
      // Orbit about the upright axis (Y in Three.js, Z in the user's floor-plane
      // coordinates): sweep into the page, then bring the next shelf forward.
      const radius = 3.25;
      carousel.rotation.y = angle;
      carousel.position.set(radius * Math.sin(angle), 0, -radius * (1 - Math.cos(angle)));
      renderer.domElement.style.opacity = String(smooth(Math.abs(1 - progress * 2)));
      if (outgoing) {
        displayedShelf = genreAnimation.shelf;
        displayedPosition = genreAnimation.position;
      }
      if (progress === 1) finishGenreTransition();
    }
    for (let i=0; i<discs.length; i++) {
      const d=discs[i];
      if (animation?.index===i) continue;
      const p=pose(i, displayedShelf, displayedPosition); d.position.copy(p.position); d.quaternion.copy(p.quaternion); d.scale.setScalar(1);
      d.userData.halo.material.opacity = i===hovered ? .8 : collection[Math.round(target)]===i ? .22 : 0;
    }
    if (animation) {
      const a=animation, disc=discs[a.index], t=Math.min((now-a.started)/a.duration,1), slot=slotPosition();
      const slotQ=new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,0,0));
      if (a.type==='insert') {
        const align = Math.min(t/.6,1), slide = Math.max(0,(t-.6)/.4);
        const above=slot.clone().add(new THREE.Vector3(0,.62, .25));
        disc.position.lerpVectors(a.start.position,above,smooth(align));
        disc.quaternion.slerpQuaternions(a.start.quaternion,slotQ,smooth(align));
        if (slide>0) disc.position.lerpVectors(above,slot.clone().add(new THREE.Vector3(0,-.16,0)),smooth(slide));
        disc.scale.setScalar(THREE.MathUtils.lerp(a.start.scale,.68,smooth(align)));
      } else {
        const end=pose(a.index);
        disc.position.lerpVectors(slot,end.position,smooth(t));
        disc.quaternion.slerpQuaternions(slotQ,end.quaternion,smooth(t));
        disc.scale.setScalar(THREE.MathUtils.lerp(.68,1,smooth(t)));
      }
      if (t===1) {
        settleAnimation();
      }
    }
    updateVisibility(displayedShelf, displayedPosition);
    renderer.render(world,camera);
  }
  raf = requestAnimationFrame(frame);
  function onVisibilityChange() {
    if (document.hidden) { settleAnimation(); finishGenreTransition(); }
  }
  document.addEventListener('visibilitychange', onVisibilityChange);
  function hit(event) {
    const r=host.getBoundingClientRect();
    pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    const found=raycaster.intersectObjects(discs.filter(d=>d.visible),true)[0];
    if(!found) return -1;
    let object=found.object;
    while(object.parent && object.userData.index===undefined) object=object.parent;
    return object.userData.index ?? -1;
  }
  const canvas=renderer.domElement;
  canvas.style.touchAction='pan-y';
  canvas.addEventListener('pointerenter', e => { hoverX = e.clientX; });
  canvas.addEventListener('pointerdown',e=>{
    if(locked || genreAnimation) return;
    // Hold the disc under the pointer still for the entire press.
    target=current;velocity=0;
    down={x:e.clientX,y:e.clientY,start:target,id:e.pointerId,index:hit(e),touch:e.pointerType!=='mouse',drag:false};
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
    if(locked || genreAnimation) { hoverX = e.clientX; return; }
    if(down) {
      const dx=e.clientX-down.x, dy=e.clientY-down.y;
      if(Math.abs(dx)>8 && Math.abs(dx)>Math.abs(dy)) down.drag=true;
      if(down.drag) { target=THREE.MathUtils.clamp(down.start-dx/100,0,collection.length-1); onBrowse(collection[Math.round(target)]); }
    } else if(e.pointerType === 'mouse' && hoverX !== null) {
      target=THREE.MathUtils.clamp(target+(e.clientX-hoverX)/160,0,collection.length-1);
      onBrowse(collection[Math.round(target)]);
    }
    hoverX=e.clientX;
    hovered=hit(e); canvas.style.cursor=hovered>=0?'pointer':'grab';
  });
  canvas.addEventListener('pointerup',e=>{
    if(!down) return;
    const start=down; down=null;
    if(canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    if(!locked && !start.drag && Math.hypot(e.clientX-start.x,e.clientY-start.y)<8) {
      const index=start.index >= 0 ? start.index : hit(e); if(index>=0) onSelect(index);
    } else { target=Math.round(target); onBrowse(collection[target]); }
  });
  canvas.addEventListener('pointercancel',()=>{down=null;hoverX=null;target=Math.round(target);});
  canvas.addEventListener('pointerleave',()=>{hoverX=null;hovered=-1;if(!down && !locked && !genreAnimation){target=Math.round(target);onBrowse(collection[target]);}});
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}); intersection.observe(host);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();document.getElementById('scene-message').hidden=false;document.getElementById('scene-message').textContent='3D preview paused. Reload to restore it; music controls are still available.';});
  return {
    browse(index){const slot=collection.indexOf(index);if(slot>=0)target=slot;hoverX=null;},
    setCollection(indices,index,{animate=false}={}){
      if(genreAnimation) finishGenreTransition();
      const previousShelf=collection, previousPosition=current;
      collection=[...indices];
      target=current=Math.max(0,collection.indexOf(index));
      velocity=0;hoverX=null;hovered=-1;down=null;
      if(animate && !reduced.matches && visible && !document.hidden) {
        genreAnimation={shelf:previousShelf,position:previousPosition,started:performance.now()};
        host.dataset.genreTransition='rotating';
      } else finishGenreTransition();
    },
    lock(value){locked=value;hovered=-1;},
    // Offscreen/automatic changes share the same disc state without running an
    // invisible transition. Resolve a superseded motion so callers can unwind.
    setLoaded,
    insert(index){return animateDisc(index,'insert');},
    eject(index){return animateDisc(index,'eject');},
    dispose(){
      cancelAnimationFrame(raf);document.removeEventListener('visibilitychange',onVisibilityChange);observer.disconnect();intersection.disconnect();
      const geometries = new Set(), materials = new Set();
      world.traverse(object => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
      });
      textures.forEach(texture => texture.dispose());
      geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
      renderer.dispose();
    }
  };
}
