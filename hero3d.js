import * as THREE from 'https://unpkg.com/three@0.163.0/build/three.module.js';

const canvasHost = document.querySelector('#hero-canvas');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvasHost) {
  const scene = new THREE.Scene();
  scene.background = null;
  scene.fog = new THREE.Fog(0xf3efe8, 6, 12);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.classList.add('hero-webgl-canvas');
  canvasHost.append(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
  camera.position.set(0.35, 0.1, 5.4);
  scene.add(camera);

  const ambient = new THREE.AmbientLight(0xf4ede2, 0.95);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xf7f1e8, 1.25);
  keyLight.position.set(1.8, 2.4, 4.2);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xd4c6b3, 0.45);
  fillLight.position.set(-2, -0.5, 1.8);
  scene.add(fillLight);

  const loader = new THREE.TextureLoader();
  const anisotropy = renderer.capabilities.getMaxAnisotropy();

  const makeTexture = (path) => {
    const texture = loader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = anisotropy;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  };

  const panels = [
    {
      key: 'texture',
      size: [10.8, 6.3],
      position: [0.2, -0.2, -3.3],
      rotation: [0.02, 0, -0.015],
      opacity: 0.16,
      float: 0.01,
      depth: 0.04,
      texture: makeTexture('assets/hero/hero-texture.webp'),
    },
    {
      key: 'abstract',
      size: [5.8, 3.55],
      position: [-1.1, 0.25, -1.95],
      rotation: [0.03, 0.22, -0.18],
      opacity: 0.42,
      float: 0.018,
      depth: 0.08,
      texture: makeTexture('assets/hero/hero-abstract.webp'),
    },
    {
      key: 'brand',
      size: [2.05, 1.72],
      position: [-1.92, 1.28, -0.62],
      rotation: [0.14, 0.34, -0.34],
      opacity: 0.92,
      float: 0.02,
      depth: 0.16,
      texture: makeTexture('assets/hero/hero-brand.webp'),
    },
    {
      key: 'main',
      size: [4.5, 2.95],
      position: [1.34, 0.04, 0.6],
      rotation: [0.06, -0.36, 0.04],
      opacity: 1,
      float: 0.024,
      depth: 0.24,
      texture: makeTexture('assets/hero/hero-main.webp'),
    },
    {
      key: 'system',
      size: [1.92, 1.66],
      position: [0.06, -1.3, 0.28],
      rotation: [0.03, 0.35, -0.2],
      opacity: 0.95,
      float: 0.016,
      depth: 0.2,
      texture: makeTexture('assets/hero/hero-system.webp'),
    },
    {
      key: 'mobile',
      size: [0.8, 1.46],
      position: [2.16, -1.18, 0.84],
      rotation: [-0.02, -0.25, 0.23],
      opacity: 0.7,
      float: 0.014,
      depth: 0.28,
      texture: makeTexture('assets/hero/hero-mobile.webp'),
    },
  ];

  const meshes = panels.map((panel) => {
    const geometry = new THREE.PlaneGeometry(panel.size[0], panel.size[1], 1, 1);
    const material = new THREE.MeshStandardMaterial({
      map: panel.texture,
      transparent: true,
      opacity: panel.opacity,
      roughness: 0.84,
      metalness: 0.06,
      emissive: 0x080706,
      emissiveIntensity: panel.key === 'main' ? 0.05 : 0.03,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...panel.position);
    mesh.rotation.set(...panel.rotation);
    scene.add(mesh);
    return {
      ...panel,
      mesh,
      basePosition: mesh.position.clone(),
      baseRotation: mesh.rotation.clone(),
    };
  });

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const clock = new THREE.Clock();

  const resize = () => {
    const { clientWidth, clientHeight } = canvasHost;
    if (!clientWidth || !clientHeight) return;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });

  canvasHost.addEventListener('pointermove', (event) => {
    const rect = canvasHost.getBoundingClientRect();
    pointer.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  canvasHost.addEventListener('pointerleave', () => {
    pointer.tx = 0;
    pointer.ty = 0;
  });

  const animate = () => {
    const elapsed = clock.getElapsedTime();
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;

    meshes.forEach((panel, index) => {
      const wave = Math.sin(elapsed * 0.46 + index * 0.9);
      const floatY = reducedMotion ? 0 : wave * panel.float;
      const driftX = reducedMotion ? 0 : pointer.x * panel.depth * 0.12;
      const driftY = reducedMotion ? 0 : pointer.y * panel.depth * 0.08;

      panel.mesh.position.x = panel.basePosition.x + driftX;
      panel.mesh.position.y = panel.basePosition.y + floatY - driftY;
      panel.mesh.rotation.x = panel.baseRotation.x + (reducedMotion ? 0 : pointer.y * panel.depth * 0.03);
      panel.mesh.rotation.y = panel.baseRotation.y + (reducedMotion ? 0 : pointer.x * panel.depth * 0.05);
    });

    camera.position.x += ((0.35 + pointer.x * 0.03) - camera.position.x) * 0.05;
    camera.position.y += ((0.1 - pointer.y * 0.02) - camera.position.y) * 0.05;
    camera.lookAt(0.28, -0.08, 0);

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };

  animate();
}
