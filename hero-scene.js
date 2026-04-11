import * as THREE from 'https://unpkg.com/three@0.163.0/build/three.module.js';

class HeroScene {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    this.camera.position.set(0.2, 0.08, 8.6);
    this.camera.lookAt(0.25, -0.1, 0);

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
          position: [-2.5, 1.55, -0.8],
          rotation: [0.03, 0.24, -0.28],
          opacity: 0.94,
        },
        {
          key: 'main',
          texture: mainTexture,
          height: 4.55,
          position: [0.74, 0.05, 0.3],
          rotation: [0.03, -0.22, 0.02],
          opacity: 1,
        },
        {
          key: 'system',
          texture: systemTexture,
          height: 2.62,
          position: [0.82, -2.22, 0.66],
          rotation: [0.03, 0.28, -0.24],
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
