import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';

const PANEL_TEXTURES = [
  'assets/hero-panels/panel-01.svg',
  'assets/hero-panels/panel-02.svg',
  'assets/hero-panels/panel-03.svg',
  'assets/hero-panels/panel-04.svg',
  'assets/hero-panels/panel-05.svg',
  'assets/hero-panels/panel-06.svg',
];

const PANEL_LAYOUT = [
  {
    size: [4.4, 2.7],
    position: [0.75, 0.05, 0.48],
    rotation: [-0.03, -0.34, 0.01],
    radius: 0.26,
  },
  {
    size: [3.1, 1.9],
    position: [-2.52, 0.92, -1.08],
    rotation: [0.08, 0.34, -0.12],
    radius: 0.22,
  },
  {
    size: [2.6, 1.6],
    position: [2.76, 1.06, -1.42],
    rotation: [0.2, -0.42, 0.13],
    radius: 0.22,
  },
  {
    size: [2.95, 1.84],
    position: [-2.92, -1.64, -0.7],
    rotation: [-0.13, 0.42, -0.26],
    radius: 0.24,
  },
  {
    size: [2.62, 1.64],
    position: [2.96, -1.42, -1.55],
    rotation: [0.13, -0.16, 0.26],
    radius: 0.2,
  },
  {
    size: [3.5, 2.2],
    position: [0.24, 1.92, -2.12],
    rotation: [0.22, -0.02, -0.03],
    radius: 0.24,
  },
];

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

class FloatingPanelsHeroScene {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#07080b');

    this.camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
    this.camera.position.set(-0.2, 0.22, 7.2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

    this.container.append(this.renderer.domElement);

    this.addLights();
    this.mountPanels();
    this.handleResize();

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);
    window.addEventListener('resize', this.handleResizeBound, { passive: true });
  }

  handleResizeBound = () => {
    this.handleResize();
  };

  addLights() {
    const ambient = new THREE.AmbientLight('#f6e3cc', 0.5);
    this.scene.add(ambient);

    const key = new THREE.DirectionalLight('#fff4df', 0.95);
    key.position.set(3.6, 2.4, 4.5);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight('#8fa2c9', 0.5);
    fill.position.set(-4.1, -0.8, 2.4);
    this.scene.add(fill);
  }

  async mountPanels() {
    const loader = new THREE.TextureLoader();

    const textures = await Promise.all(
      PANEL_TEXTURES.map(
        (texturePath) =>
          new Promise((resolve, reject) => {
            loader.load(texturePath, resolve, undefined, reject);
          }),
      ),
    ).catch((error) => {
      console.error('No se pudieron cargar las texturas del hero 3D.', error);
      return [];
    });

    PANEL_LAYOUT.forEach((panel, index) => {
      const texture = textures[index];
      if (!texture) return;

      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = 8;

      const geometry = createRoundedRectGeometry(panel.size[0], panel.size[1], panel.radius);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.46,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...panel.position);
      mesh.rotation.set(...panel.rotation);
      this.scene.add(mesh);
    });

    this.render();
  }

  handleResize() {
    const width = this.container.clientWidth || 1;
    const height = this.container.clientHeight || 1;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

const heroCanvasContainer = document.querySelector('[data-hero-3d]');
if (heroCanvasContainer) {
  new FloatingPanelsHeroScene(heroCanvasContainer);
}
