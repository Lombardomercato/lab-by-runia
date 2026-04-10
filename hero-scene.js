import * as THREE from 'https://unpkg.com/three@0.163.0/build/three.module.js';

class HeroSinglePanelScene {
  constructor(container) {
    this.container = container;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    this.camera.position.set(0, 0, 3.2);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.container.append(this.renderer.domElement);

    this.loadSinglePanel();

    this.handleResizeBound = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResizeBound, { passive: true });

    this.resizeObserver = new ResizeObserver(this.handleResizeBound);
    this.resizeObserver.observe(this.container);

    this.handleResize();
  }

  loadSinglePanel() {
    const loader = new THREE.TextureLoader();

    loader.load(
      'assets/hero/hero-main.webp',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;

        const imageWidth = texture.image?.width ?? 1;
        const imageHeight = texture.image?.height ?? 1;
        const aspectRatio = imageWidth / imageHeight;

        const planeHeight = 2.3;
        const planeWidth = planeHeight * aspectRatio;

        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 1, 1);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
        });

        this.plane = new THREE.Mesh(geometry, material);
        this.plane.position.set(0, 0, 0);
        this.scene.add(this.plane);

        this.render();
      },
      undefined,
      (error) => {
        console.error('Error cargando assets/hero/hero-main.webp:', error);
      },
    );
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
  new HeroSinglePanelScene(sceneContainer);
}
