import * as THREE from 'three';
import { ThemeManager } from './scene/themeManager.js';
import { LayersBuilder } from './scene/layersBuilder.js';
import { CameraController } from './scene/cameraController.js';
import { FlowAnimator } from './scene/flowAnimator.js';
import { HUDController } from './ui/hudController.js';

class App {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();

    this.initScene();
    this.initLights();
    this.initLayers();
    this.initInteraction();
    this.initUI();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060913, 0.007);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    this.cameraController = new CameraController(this.renderer.domElement, this.container);
    this.themeManager = new ThemeManager(this.scene, this.renderer);

    window.addEventListener('resize', () => {
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  initLights() {
    const theme = this.themeManager.getCurrentTheme();

    // Ambient light
    this.ambientLight = new THREE.AmbientLight(theme.ambientLight.color, theme.ambientLight.intensity);
    this.scene.add(this.ambientLight);

    // Primary directional light with shadows
    this.dirLight1 = new THREE.DirectionalLight(theme.dirLight1.color, theme.dirLight1.intensity);
    this.dirLight1.position.set(...theme.dirLight1.pos);
    this.dirLight1.castShadow = true;
    this.dirLight1.shadow.mapSize.width = 2048;
    this.dirLight1.shadow.mapSize.height = 2048;
    this.dirLight1.shadow.camera.near = 0.5;
    this.dirLight1.shadow.camera.far = 250;
    const d = 45;
    this.dirLight1.shadow.camera.left = -d;
    this.dirLight1.shadow.camera.right = d;
    this.dirLight1.shadow.camera.top = d;
    this.dirLight1.shadow.camera.bottom = -d;
    this.scene.add(this.dirLight1);

    // Secondary fill light
    this.dirLight2 = new THREE.DirectionalLight(theme.dirLight2.color, theme.dirLight2.intensity);
    this.dirLight2.position.set(...theme.dirLight2.pos);
    this.scene.add(this.dirLight2);

    // Ground reflector / bounce light
    this.groundLight = new THREE.DirectionalLight(0x101b30, 0.6);
    this.groundLight.position.set(0, -30, 0);
    this.scene.add(this.groundLight);

    // Update lights on theme change
    this.themeManager.onThemeChange((newTheme) => {
      this.ambientLight.color.setHex(newTheme.ambientLight.color);
      this.ambientLight.intensity = newTheme.ambientLight.intensity;

      this.dirLight1.color.setHex(newTheme.dirLight1.color);
      this.dirLight1.intensity = newTheme.dirLight1.intensity;
      this.dirLight1.position.set(...newTheme.dirLight1.pos);

      this.dirLight2.color.setHex(newTheme.dirLight2.color);
      this.dirLight2.intensity = newTheme.dirLight2.intensity;
      this.dirLight2.position.set(...newTheme.dirLight2.pos);
    });
  }

  initLayers() {
    this.layersBuilder = new LayersBuilder(this.scene, this.themeManager);
    this.layersBuilder.buildAll();

    this.flowAnimator = new FlowAnimator(this.scene, this.layersBuilder);
  }

  initInteraction() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    const onPointerMove = (e) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.cameraController.camera);
      const intersects = this.raycaster.intersectObjects(this.layersBuilder.interactiveObjects, true);

      if (intersects.length > 0) {
        this.renderer.domElement.style.cursor = 'pointer';
      } else {
        this.renderer.domElement.style.cursor = 'default';
      }
    };

    const onClick = (e) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.cameraController.camera);
      const intersects = this.raycaster.intersectObjects(this.layersBuilder.interactiveObjects, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData && hit.userData.layerId && this.hudController) {
          this.hudController.selectLayer(hit.userData.layerId);
        }
      }
    };

    this.renderer.domElement.addEventListener('pointermove', onPointerMove);
    this.renderer.domElement.addEventListener('click', onClick);
  }

  initUI() {
    this.hudController = new HUDController({
      themeManager: this.themeManager,
      layersBuilder: this.layersBuilder,
      flowAnimator: this.flowAnimator,
      cameraController: this.cameraController
    });

    // Start with a small welcome flow after 1 second
    setTimeout(() => {
      this.flowAnimator.start();
    }, 1200);
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    this.cameraController.update(delta);
    this.layersBuilder.animate(delta, elapsed);
    this.flowAnimator.update(delta, elapsed);

    this.renderer.render(this.scene, this.cameraController.camera);
  }
}

// Bootstrap on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
