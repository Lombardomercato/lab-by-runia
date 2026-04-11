import * as THREE from 'https://unpkg.com/three@0.163.0/build/three.module.js';

class HeroLayeredPanelsScene {
  constructor(container) {
    this.container = container;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    this.camera.position.set(-0.42, 0.2, 3.9);
    this.camera.lookAt(0.3, -0.05, -0.25);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.container.append(this.renderer.domElement);

    this.loadPanels();

    this.handleResizeBound = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResizeBound, { passive: true });

    this.resizeObserver = new ResizeObserver(this.handleResizeBound);
    this.resizeObserver.observe(this.container);

    this.handleResize();
  }

  loadPanels() {
    const loader = new THREE.TextureLoader();
    const anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const panelConfigs = [
      {
        texturePath: 'assets/hero/hero-main.webp',
        height: 2.45,
        position: [0.72, 0.03, 0.48],
        rotation: [-0.04, -0.28, 0.04],
      },
      {
        texturePath: 'assets/hero/hero-brand.webp',
        height: 1.35,
        position: [-1.5, 0.98, -0.82],
        rotation: [0.05, 0.22, -0.16],
      },
      {
        texturePath: 'assets/hero/hero-system.webp',
        height: 1.05,
        position: [0.38, -0.93, 0.08],
        rotation: [0.03, 0.16, -0.26],
      },
    ];

    Promise.all(
      panelConfigs.map(
        (panel) =>
          new Promise((resolve, reject) => {
            loader.load(
              panel.texturePath,
              (texture) => resolve({ panel, texture }),
              undefined,
              reject,
            );
          }),
      ),
    )
      .then((items) => {
        items.forEach(({ panel, texture }) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = anisotropy;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;

          const imageWidth = texture.image?.width ?? 1;
          const imageHeight = texture.image?.height ?? 1;
          const aspectRatio = imageWidth / imageHeight;

          const planeHeight = panel.height;
          const planeWidth = planeHeight * aspectRatio;

          const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 1, 1);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
          });

          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(...panel.position);
          mesh.rotation.set(...panel.rotation);
          this.scene.add(mesh);
        });
        this.render();
      })
      .catch((error) => {
        console.error('Error cargando paneles del hero:', error);
      });
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
  new HeroLayeredPanelsScene(sceneContainer);
}
