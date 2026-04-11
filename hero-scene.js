import * as THREE from 'https://unpkg.com/three@0.163.0/build/three.module.js';

class HeroScene {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    this.camera.position.set(-0.35, 0.45, 8.1);
    this.camera.rotation.set(THREE.MathUtils.degToRad(-2.8), THREE.MathUtils.degToRad(-4.8), THREE.MathUtils.degToRad(-0.7));
    this.camera.lookAt(0.95, -0.38, -0.1);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.append(this.renderer.domElement);

    this.textureLoader = new THREE.TextureLoader();
    this.planes = [];

    this.setupLights();
    this.setupScene();

    this.handleResizeBound = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResizeBound, { passive: true });

    this.resizeObserver = new ResizeObserver(this.handleResizeBound);
    this.resizeObserver.observe(this.container);
  }

  setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 1.08);
    const key = new THREE.DirectionalLight(0xfff8ee, 0.62);
    key.position.set(2.2, 1.4, 2.6);

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
          key: 'brand',
          texture: brandTexture,
          height: 2.35,
          position: [-2.7, 1.72, -1.25],
          rotation: [0.07, 0.34, -0.34],
          opacity: 0.94,
        },
        {
          key: 'main',
          texture: mainTexture,
          height: 4.55,
          position: [0.92, -0.04, 0.58],
          rotation: [0.09, -0.34, 0.04],
          opacity: 1,
        },
        {
          key: 'system',
          texture: systemTexture,
          height: 2.62,
          position: [1.06, -2.35, 0.95],
          rotation: [0.08, 0.39, -0.28],
          opacity: 0.97,
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
        this.planes.push(mesh);
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
