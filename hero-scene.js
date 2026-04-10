import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';

const PANEL_TEXTURES = {
  texture: 'assets/hero/hero-texture.webp',
  abstract: 'assets/hero/hero-abstract.webp',
  brand: 'assets/hero/hero-brand.webp',
  main: 'assets/hero/hero-main.webp',
  system: 'assets/hero/hero-system.webp',
  mobile: 'assets/hero/hero-mobile.webp',
};

const PANEL_BLUEPRINTS = {
  texture: {
    size: [7.8, 5.6],
    position: [0.1, 0.1, -3.6],
    rotation: [0, -0.07, 0.01],
    radius: 0.22,
    tint: '#d2c4ae',
    opacity: 0.24,
  },
  abstract: {
    size: [6.2, 4.5],
    position: [0.55, 0.28, -2.4],
    rotation: [0.02, -0.16, -0.02],
    radius: 0.24,
    tint: '#efe4d3',
    opacity: 0.58,
  },
  brand: {
    size: [2.55, 2.06],
    position: [-2.7, 1.74, -1.3],
    rotation: [0.07, 0.27, -0.13],
    radius: 0.2,
    tint: '#ffffff',
    opacity: 0.95,
  },
  main: {
    size: [4.5, 2.94],
    position: [1.4, 0.38, 0.46],
    rotation: [-0.03, -0.26, 0.03],
    radius: 0.25,
    tint: '#ffffff',
    opacity: 1,
  },
  system: {
    size: [2.45, 1.76],
    position: [-0.52, -1.45, -0.36],
    rotation: [0.08, 0.21, -0.1],
    radius: 0.2,
    tint: '#f7f0e6',
    opacity: 0.96,
  },
  mobile: {
    size: [1.2, 2.1],
    position: [2.72, -1.33, -0.22],
    rotation: [0.08, -0.36, 0.12],
    radius: 0.2,
    tint: '#f6ede1',
    opacity: 0.92,
  },
};

const PANEL_MOTION = {
  texture: { ampY: 0.06, ampR: 0.007, speed: 0.21, phase: 0.9 },
  abstract: { ampY: 0.07, ampR: 0.009, speed: 0.25, phase: 0.5 },
  brand: { ampY: 0.09, ampR: 0.013, speed: 0.38, phase: 1.7 },
  main: { ampY: 0.12, ampR: 0.015, speed: 0.34, phase: 0.1 },
  system: { ampY: 0.1, ampR: 0.012, speed: 0.42, phase: 2.2 },
  mobile: { ampY: 0.08, ampR: 0.014, speed: 0.47, phase: 2.8 },
};

const RESPONSIVE_PROFILES = {
  desktop: { visible: ['texture', 'abstract', 'brand', 'main', 'system', 'mobile'], cameraZ: 6.35, cameraX: 0.2 },
  tablet: { visible: ['texture', 'abstract', 'brand', 'main', 'system'], cameraZ: 6.9, cameraX: 0.14 },
  mobile: { visible: ['texture', 'abstract', 'main', 'mobile'], cameraZ: 7.35, cameraX: 0.08 },
};

const createRoundedRectGeometry = (width, height, radius) => {
  const shape = new THREE.Shape();
  const hw = width / 2;
  const hh = height / 2;
  const safeRadius = Math.min(radius, hw, hh);

  shape.moveTo(-hw + safeRadius, -hh);
  shape.lineTo(hw - safeRadius, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + safeRadius);
  shape.lineTo(hw, hh - safeRadius);
  shape.quadraticCurveTo(hw, hh, hw - safeRadius, hh);
  shape.lineTo(-hw + safeRadius, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - safeRadius);
  shape.lineTo(-hw, -hh + safeRadius);
  shape.quadraticCurveTo(-hw, -hh, -hw + safeRadius, -hh);

  return new THREE.ShapeGeometry(shape, 18);
};

class ScenePanel {
  constructor(name, texture) {
    this.name = name;
    this.blueprint = PANEL_BLUEPRINTS[name];
    this.motion = PANEL_MOTION[name];

    const geometry = createRoundedRectGeometry(this.blueprint.size[0], this.blueprint.size[1], this.blueprint.radius);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      color: new THREE.Color(this.blueprint.tint),
      roughness: 0.56,
      metalness: 0.04,
      transparent: true,
      opacity: 0,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(...this.blueprint.position);
    this.mesh.rotation.set(...this.blueprint.rotation);
    this.basePosition = this.mesh.position.clone();
    this.baseRotation = this.mesh.rotation.clone();
    this.entryOffset = new THREE.Vector3(0.3, -0.22, -0.65);
  }

  setVisible(isVisible) {
    this.mesh.visible = isVisible;
  }

  update(time, entryProgress, motionScale) {
    const material = this.mesh.material;
    const eased = 1 - (1 - entryProgress) ** 3;
    const floatFactor = motionScale * eased;

    this.mesh.position.x = this.basePosition.x + this.entryOffset.x * (1 - eased);
    this.mesh.position.y =
      this.basePosition.y +
      this.entryOffset.y * (1 - eased) +
      Math.sin(time * this.motion.speed + this.motion.phase) * this.motion.ampY * floatFactor;
    this.mesh.position.z = this.basePosition.z + this.entryOffset.z * (1 - eased);

    this.mesh.rotation.x =
      this.baseRotation.x +
      0.09 * (1 - eased) +
      Math.sin(time * this.motion.speed * 0.92 + this.motion.phase) * this.motion.ampR * floatFactor;
    this.mesh.rotation.y =
      this.baseRotation.y +
      Math.cos(time * this.motion.speed * 0.9 + this.motion.phase) * this.motion.ampR * 1.3 * floatFactor;

    material.opacity = this.blueprint.opacity * eased;
  }
}

class HeroScene {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = null;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.clock = new THREE.Clock();
    this.pointerTarget = new THREE.Vector2();
    this.pointerCurrent = new THREE.Vector2();
    this.pointerActive = false;
    this.panels = new Map();

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100);
    this.camera.position.set(0.2, 0.12, 6.35);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));

    this.container.append(this.renderer.domElement);

    this.addLights();
    this.bindEvents();
    this.loadPanels().then(() => {
      this.applyResponsiveProfile();
      this.handleResize();
      this.animate();
    });
  }

  addLights() {
    this.scene.add(new THREE.AmbientLight('#f5ead9', 0.75));

    const keyLight = new THREE.DirectionalLight('#fff2df', 0.9);
    keyLight.position.set(3.2, 2.6, 5.1);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#dce4ef', 0.42);
    fillLight.position.set(-4.5, -1.4, 3.1);
    this.scene.add(fillLight);
  }

  bindEvents() {
    this.handleResizeBound = this.handleResize.bind(this);
    this.handlePointerMoveBound = this.handlePointerMove.bind(this);
    this.handlePointerLeaveBound = this.handlePointerLeave.bind(this);

    window.addEventListener('resize', this.handleResizeBound, { passive: true });
    this.container.addEventListener('pointermove', this.handlePointerMoveBound);
    this.container.addEventListener('pointerleave', this.handlePointerLeaveBound);

    this.resizeObserver = new ResizeObserver(this.handleResizeBound);
    this.resizeObserver.observe(this.container);
  }

  async loadPanels() {
    const loader = new THREE.TextureLoader();
    const panelEntries = Object.entries(PANEL_TEXTURES);

    const textures = await Promise.all(
      panelEntries.map(
        ([, path]) =>
          new Promise((resolve, reject) => {
            loader.load(path, resolve, undefined, reject);
          }),
      ),
    ).catch((error) => {
      console.error('Error cargando texturas del hero 3D:', error);
      return [];
    });

    panelEntries.forEach(([name], index) => {
      const texture = textures[index];
      if (!texture) return;

      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = 8;

      const panel = new ScenePanel(name, texture);
      this.group.add(panel.mesh);
      this.panels.set(name, panel);
    });
  }

  getProfileName() {
    const width = window.innerWidth;
    if (width <= 700) return 'mobile';
    if (width <= 1080) return 'tablet';
    return 'desktop';
  }

  applyResponsiveProfile() {
    const profile = RESPONSIVE_PROFILES[this.getProfileName()];
    const visibleSet = new Set(profile.visible);

    this.panels.forEach((panel, key) => {
      panel.setVisible(visibleSet.has(key));
    });

    this.camera.position.x = profile.cameraX;
    this.camera.position.z = profile.cameraZ;
  }

  handleResize() {
    const width = this.container.clientWidth || 1;
    const height = this.container.clientHeight || 1;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
    this.applyResponsiveProfile();
    this.render();
  }

  handlePointerMove(event) {
    if (this.prefersReducedMotion) return;

    const rect = this.container.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    this.pointerTarget.set(x, y);
    this.pointerActive = true;
  }

  handlePointerLeave() {
    this.pointerTarget.set(0, 0);
    this.pointerActive = false;
  }

  animate = () => {
    this.rafId = requestAnimationFrame(this.animate);

    const elapsed = this.clock.getElapsedTime();
    const motionScale = this.prefersReducedMotion ? 0 : 1;

    this.pointerCurrent.lerp(this.pointerTarget, this.pointerActive ? 0.065 : 0.045);

    const groupTargetY = this.pointerCurrent.x * 0.11 * motionScale;
    const groupTargetX = this.pointerCurrent.y * -0.07 * motionScale;

    this.group.rotation.y += (groupTargetY - this.group.rotation.y) * 0.07;
    this.group.rotation.x += (groupTargetX - this.group.rotation.x) * 0.07;

    this.camera.position.x += (0.2 + this.pointerCurrent.x * 0.12 * motionScale - this.camera.position.x) * 0.05;
    this.camera.position.y += (0.12 + this.pointerCurrent.y * -0.08 * motionScale - this.camera.position.y) * 0.05;

    this.panels.forEach((panel, index) => {
      const staggerStart = index * 0.12;
      const progress = this.prefersReducedMotion ? 1 : THREE.MathUtils.clamp((elapsed - staggerStart) / 1.1, 0, 1);
      panel.update(elapsed, progress, motionScale);
    });

    this.render();
  };

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

class HeroSection {
  constructor() {
    this.sceneContainer = document.querySelector('[data-hero-3d]');
    if (!this.sceneContainer) return;

    this.heroScene = new HeroScene(this.sceneContainer);
  }
}

new HeroSection();
