import * as THREE from 'https://unpkg.com/three@0.163.0/build/three.module.js';

class HeroScene {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    this.camera.position.set(-0.65, 0.62, 8.5);
    this.camera.up.set(-0.03, 1, 0);
    this.camera.lookAt(1.18, -0.34, -1.2);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.append(this.renderer.domElement);

    this.textureLoader = new THREE.TextureLoader();

    this.setupLights();
    this.setupScene();

    this.handleResizeBound = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResizeBound, { passive: true });

    this.resizeObserver = new ResizeObserver(this.handleResizeBound);
    this.resizeObserver.observe(this.container);
  }

  setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 1.05);
    const key = new THREE.DirectionalLight(0xfff8ee, 0.58);
    key.position.set(2.4, 1.6, 2.8);

    this.scene.add(ambient, key);
  }

  loadTexture(candidates) {
    const paths = Array.isArray(candidates) ? candidates : [candidates];

    return new Promise((resolve, reject) => {
      const tryPath = (index) => {
        if (index >= paths.length) {
          reject(new Error(`No se pudo cargar ninguna textura: ${paths.join(', ')}`));
          return;
        }

        this.textureLoader.load(
          paths[index],
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            resolve(texture);
          },
          undefined,
          () => tryPath(index + 1),
        );
      };

      tryPath(0);
    });
  }

  async setupScene() {
    try {
      const [mainTexture, brandTexture, systemTexture] = await Promise.all([
        this.loadTexture(['assets/hero/hero-main.webp', 'assets/hero/hero-main.png']),
        this.loadTexture(['assets/hero/hero-brand.webp', 'assets/hero/hero-brand.png']),
        this.loadTexture(['assets/hero/hero-system.webp', 'assets/hero/hero-system.png']),
      ]);

      const panelConfig = [
        {
          texture: brandTexture,
          height: 2.95,
          position: [-2.95, 1.95, -2.25],
          rotation: [0.14, 0.52, -0.38],
          opacity: 0.9,
        },
        {
          texture: systemTexture,
          height: 2.05,
          position: [0.32, -1.95, -1.05],
          rotation: [0.2, 0.4, -0.26],
          opacity: 0.95,
        },
        {
          texture: mainTexture,
          height: 3.65,
          position: [1.95, -0.06, 0.85],
          rotation: [0.08, -0.42, 0.03],
          opacity: 1,
        },
      ];

      panelConfig.forEach((config) => {
        const imageWidth = config.texture.image?.width ?? 1;
        const imageHeight = config.texture.image?.height ?? 1;
        const aspect = imageWidth / imageHeight;

        const width = config.height * aspect;
        const geometry = new THREE.PlaneGeometry(width, config.height);
        const material = new THREE.MeshBasicMaterial({
          map: config.texture,
          transparent: true,
          opacity: config.opacity,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...config.position);
        mesh.rotation.set(...config.rotation);

        this.scene.add(mesh);
      });

      this.handleResize();
      this.render();
    } catch (error) {
      console.error('No se pudo construir HeroScene:', error);
    }
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

const sceneContainer = document.querySelector('[data-hero-3d]');
if (sceneContainer) {
  new HeroScene(sceneContainer);
}
