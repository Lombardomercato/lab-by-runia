import * as THREE from 'https://unpkg.com/three@0.163.0/build/three.module.js';

class HeroTextureDebugScene {
  constructor(container) {
    this.container = container;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    this.camera.position.set(0, 0, 3);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.append(this.renderer.domElement);

    this.handleResizeBound = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResizeBound, { passive: true });

    this.resizeObserver = new ResizeObserver(this.handleResizeBound);
    this.resizeObserver.observe(this.container);

    this.loadSingleTexturePlane();
  }

  loadSingleTexturePlane() {
    const loader = new THREE.TextureLoader();

    loader.load(
      'assets/hero/hero-main.png',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;

        const imageWidth = texture.image?.width ?? 1;
        const imageHeight = texture.image?.height ?? 1;
        const aspectRatio = imageWidth / imageHeight;

        const planeHeight = 2;
        const planeWidth = planeHeight * aspectRatio;

        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 1, 1);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 0, 0);
        this.scene.add(this.mesh);

        this.handleResize();
      },
      undefined,
      (error) => {
        console.error('Error cargando textura de prueba:', error);
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
  new HeroTextureDebugScene(sceneContainer);
}
