import { LAYER_INFO } from '../scene/layersBuilder.js';
import { SCENARIO_THEMES } from '../scene/themeManager.js';
import { SIMULATION_TYPES } from '../scene/flowAnimator.js';

export class HUDController {
  constructor({ themeManager, layersBuilder, flowAnimator, cameraController }) {
    this.themeManager = themeManager;
    this.layersBuilder = layersBuilder;
    this.flowAnimator = flowAnimator;
    this.cameraController = cameraController;

    this.selectedLayerId = 'business'; // default focused layer
    this.initElements();
    this.bindEvents();
    this.updateInspector(this.selectedLayerId);
  }

  initElements() {
    // Top Bar buttons
    this.btnScenariosModal = document.getElementById('btn-scenarios-modal');
    this.btnGuideModal = document.getElementById('btn-guide-modal');
    this.scenariosModal = document.getElementById('scenarios-modal');
    this.guideModal = document.getElementById('guide-modal');
    this.closeModalBtns = document.querySelectorAll('.modal-close');

    // Simulation Controls
    this.simSelect = document.getElementById('sim-select');
    this.btnPlay = document.getElementById('btn-play');
    this.btnPause = document.getElementById('btn-pause');
    this.btnReset = document.getElementById('btn-reset');
    this.timelineSlider = document.getElementById('timeline-slider');
    this.speedBtns = document.querySelectorAll('.speed-btn');

    // Simulation Step Display
    this.stepTitle = document.getElementById('step-title');
    this.stepDetail = document.getElementById('step-detail');
    this.stepLog = document.getElementById('step-log');
    this.stepBadge = document.getElementById('step-badge');

    // Exploded View Slider
    this.sliderExploded = document.getElementById('slider-exploded');
    this.explodedVal = document.getElementById('exploded-val');

    // Camera preset buttons
    this.btnCamIsoFront = document.getElementById('cam-iso-front');
    this.btnCamIsoTop = document.getElementById('cam-iso-top');
    this.btnCamSide = document.getElementById('cam-side');
    this.btnCamReset = document.getElementById('cam-reset');

    // Layer list navigation
    this.layerNavItems = document.querySelectorAll('.layer-nav-item');

    // Layer Inspector
    this.inspectorTitle = document.getElementById('inspector-title');
    this.inspectorRole = document.getElementById('inspector-role');
    this.inspectorCodePath = document.getElementById('inspector-codepath');
    this.inspectorDesc = document.getElementById('inspector-desc');
    this.inspectorRules = document.getElementById('inspector-rules');
    this.inspectorTech = document.getElementById('inspector-tech');
    this.btnFocusLayer = document.getElementById('btn-focus-layer');

    // Quick Theme Switchers in footer
    this.quickThemeBtns = document.querySelectorAll('.quick-theme-btn');
  }

  bindEvents() {
    // 1. Modals
    if (this.btnScenariosModal) {
      this.btnScenariosModal.addEventListener('click', () => {
        this.scenariosModal.classList.add('active');
      });
    }

    if (this.btnGuideModal) {
      this.btnGuideModal.addEventListener('click', () => {
        this.guideModal.classList.add('active');
      });
    }

    this.closeModalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.scenariosModal) this.scenariosModal.classList.remove('active');
        if (this.guideModal) this.guideModal.classList.remove('active');
      });
    });

    // Close on backdrop click
    [this.scenariosModal, this.guideModal].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.classList.remove('active');
        });
      }
    });

    // 2. Scenario Card Selection inside Modal
    document.querySelectorAll('.scenario-card').forEach(card => {
      card.addEventListener('click', () => {
        const themeId = card.getAttribute('data-theme');
        this.selectTheme(themeId);
        if (this.scenariosModal) this.scenariosModal.classList.remove('active');
      });
    });

    // Quick theme footer buttons
    this.quickThemeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const themeId = btn.getAttribute('data-theme');
        this.selectTheme(themeId);
      });
    });

    // 3. Simulation Controls
    if (this.simSelect) {
      this.simSelect.addEventListener('change', (e) => {
        this.flowAnimator.setSimulationType(e.target.value);
      });
    }

    if (this.btnPlay) {
      this.btnPlay.addEventListener('click', () => this.flowAnimator.start());
    }
    if (this.btnPause) {
      this.btnPause.addEventListener('click', () => this.flowAnimator.pause());
    }
    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => this.flowAnimator.reset());
    }

    if (this.timelineSlider) {
      this.timelineSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100;
        this.flowAnimator.seek(val);
      });
    }

    this.speedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.speedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const spd = parseFloat(btn.getAttribute('data-speed'));
        this.flowAnimator.setSpeed(spd);
      });
    });

    // Listen to Flow Animator state
    this.flowAnimator.onStateChange(state => {
      if (this.timelineSlider && !this.timelineSlider.matches(':active')) {
        this.timelineSlider.value = (state.progress * 100).toFixed(1);
      }

      if (this.btnPlay && this.btnPause) {
        if (state.isPlaying) {
          this.btnPlay.style.display = 'none';
          this.btnPause.style.display = 'inline-flex';
        } else {
          this.btnPlay.style.display = 'inline-flex';
          this.btnPause.style.display = 'none';
        }
      }

      // Update Step Card
      const stepInfo = state.currentStep;
      if (stepInfo && stepInfo.step) {
        this.stepTitle.textContent = stepInfo.step.title;
        this.stepDetail.textContent = stepInfo.step.detail;
        this.stepLog.textContent = stepInfo.step.log;
        this.stepBadge.textContent = `Paso ${stepInfo.index + 1} de ${stepInfo.total}`;

        // Auto highlight the corresponding layer in the list
        this.highlightNavLayer(stepInfo.step.layer);
      }
    });

    // 4. Exploded View Slider
    if (this.sliderExploded) {
      this.sliderExploded.addEventListener('input', (e) => {
        const factor = parseFloat(e.target.value) / 100;
        this.layersBuilder.setExplosionFactor(factor);
        if (this.explodedVal) {
          this.explodedVal.textContent = `${Math.round(factor * 100)}%`;
        }
      });
    }

    // 5. Camera Presets
    if (this.btnCamIsoFront) {
      this.btnCamIsoFront.addEventListener('click', () => {
        this.cameraController.setPreset('isoFront');
        this.setActiveCamBtn(this.btnCamIsoFront);
      });
    }
    if (this.btnCamIsoTop) {
      this.btnCamIsoTop.addEventListener('click', () => {
        this.cameraController.setPreset('isoTop');
        this.setActiveCamBtn(this.btnCamIsoTop);
      });
    }
    if (this.btnCamSide) {
      this.btnCamSide.addEventListener('click', () => {
        this.cameraController.setPreset('side');
        this.setActiveCamBtn(this.btnCamSide);
      });
    }
    if (this.btnCamReset) {
      this.btnCamReset.addEventListener('click', () => {
        this.cameraController.reset();
        this.setActiveCamBtn(this.btnCamIsoFront);
      });
    }

    // 6. Layer Navigation Click
    this.layerNavItems.forEach(item => {
      item.addEventListener('click', () => {
        const layerId = item.getAttribute('data-layer');
        this.selectLayer(layerId);
      });
    });

    if (this.btnFocusLayer) {
      this.btnFocusLayer.addEventListener('click', () => {
        const group = this.layersBuilder.layerGroups[this.selectedLayerId];
        if (group) {
          this.cameraController.focusOn(group.position);
        }
      });
    }
  }

  setActiveCamBtn(activeBtn) {
    [this.btnCamIsoFront, this.btnCamIsoTop, this.btnCamSide].forEach(btn => {
      if (btn) btn.classList.remove('active');
    });
    if (activeBtn) activeBtn.classList.add('active');
  }

  selectTheme(themeId) {
    const theme = this.themeManager.setTheme(themeId);
    if (!theme) return;

    // Update active badges
    this.quickThemeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === themeId);
    });

    document.querySelectorAll('.scenario-card').forEach(card => {
      card.classList.toggle('selected', card.getAttribute('data-theme') === themeId);
    });
  }

  selectLayer(layerId) {
    if (!LAYER_INFO[layerId]) return;
    this.selectedLayerId = layerId;
    this.highlightNavLayer(layerId);
    this.updateInspector(layerId);

    // Camera gentle pan towards layer
    const group = this.layersBuilder.layerGroups[layerId];
    if (group && this.cameraController) {
      this.cameraController.focusOn(group.position);
    }
  }

  highlightNavLayer(layerId) {
    this.layerNavItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-layer') === layerId);
    });
  }

  updateInspector(layerId) {
    const info = LAYER_INFO[layerId];
    if (!info) return;

    if (this.inspectorTitle) {
      this.inspectorTitle.textContent = info.name;
      this.inspectorTitle.style.color = info.color;
    }
    if (this.inspectorRole) this.inspectorRole.textContent = info.role;
    if (this.inspectorCodePath) this.inspectorCodePath.textContent = info.codePath;
    if (this.inspectorDesc) this.inspectorDesc.textContent = info.description;
    if (this.inspectorTech) this.inspectorTech.textContent = info.techComponents;

    if (this.inspectorRules) {
      this.inspectorRules.innerHTML = '';
      info.rules.forEach(rule => {
        const li = document.createElement('li');
        li.textContent = rule;
        this.inspectorRules.appendChild(li);
      });
    }
  }
}
