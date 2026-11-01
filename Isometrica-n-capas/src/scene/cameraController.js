import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class CameraController {
  constructor(canvas, container) {
    this.canvas = canvas;
    this.container = container;

    const aspect = container.clientWidth / container.clientHeight;
    const frustumSize = 70;

    // Use Orthographic Camera for true isometric projection
    this.camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );

    // Initial true isometric position: (x=50, y=50, z=50) looking at (0, 4, 0)
    this.initialTarget = new THREE.Vector3(0, 4, 0);
    this.camera.position.set(55, 45, 55);
    this.camera.lookAt(this.initialTarget);

    // Controls
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.copy(this.initialTarget);
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1; // avoid looking from below ground

    // Smooth animation targets
    this.targetPos = null;
    this.targetLook = null;

    // Raycaster for click selection
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const frustumSize = 70;

    this.camera.left = (-frustumSize * aspect) / 2;
    this.camera.right = (frustumSize * aspect) / 2;
    this.camera.top = frustumSize / 2;
    this.camera.bottom = -frustumSize / 2;
    this.camera.updateProjectionMatrix();
  }

  setPreset(presetName) {
    switch (presetName) {
      case 'isoFront':
        this.smoothMove(new THREE.Vector3(55, 45, 55), new THREE.Vector3(0, 4, 0));
        break;
      case 'isoTop':
        this.smoothMove(new THREE.Vector3(35, 75, 35), new THREE.Vector3(0, 4, 0));
        break;
      case 'side':
        this.smoothMove(new THREE.Vector3(80, 10, 0), new THREE.Vector3(0, 4, 0));
        break;
    }
  }

  focusOn(positionVector) {
    const offset = new THREE.Vector3(45, 25, 45);
    const targetCamPos = positionVector.clone().add(offset);
    this.smoothMove(targetCamPos, positionVector.clone());
  }

  reset() {
    this.smoothMove(new THREE.Vector3(55, 45, 55), this.initialTarget.clone());
  }

  smoothMove(camPos, lookAtTarget) {
    this.targetPos = camPos;
    this.targetLook = lookAtTarget;
  }

  update(delta) {
    if (this.targetPos && this.targetLook) {
      this.camera.position.lerp(this.targetPos, 0.08);
      this.controls.target.lerp(this.targetLook, 0.08);

      if (this.camera.position.distanceTo(this.targetPos) < 0.2) {
        this.targetPos = null;
        this.targetLook = null;
      }
    }

    this.controls.update();
  }
}
