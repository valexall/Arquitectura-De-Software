import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import * as k from "./kit/iso-kit.mjs";
import * as g from "./geometry.mjs";
import { SCENARIOS, LAYER_INFO } from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const isLight = process.argv.includes("--light");
const theme = isLight ? "light" : "dark";

// Read ISO CSS from local kit
const isoCssContent = readFileSync(join(HERE, "kit", "iso.css"), "utf8");

// Assemble static SVG layers
const baseSvg = g.buildBase();
const l1Svg = g.buildLayer1();
const l2Svg = g.buildLayer2();
const l3Svg = g.buildLayer3();
const l4Svg = g.buildLayer4();
const dyn = g.buildDynamicParts();

// Center Plunger starting point (rest at Z = 206)
const plungerRestAt = g.at([0, 0, 206]);

// Lateral Reject Capsule
const rejectStart = g.at([-28, 6, 153]);
const rejectEnd = g.at([-82, 18, 138]);

// SVG markup with discrete data-layer groups for physics-based explosion & inspection
const svgBody = `
  <defs>
    <filter id="glow-lit" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Base & 4 Chrome Posts -->
  <g class="iso-base-group" data-name="base">
    ${baseSvg}
  </g>

  <!-- Layer 1: Persistencia & BD -->
  <g class="iso-layer" data-layer="1" id="layer-1">
    ${l1Svg}
  </g>

  <!-- Layer 2: Repositorio -->
  <g class="iso-layer" data-layer="2" id="layer-2">
    ${l2Svg}
  </g>

  <!-- Layer 3: Negocio / Servicio -->
  <g class="iso-layer" data-layer="3" id="layer-3">
    ${l3Svg}
    <!-- Lateral Ejection Capsule (Visible during 400 reject) -->
    <g class="iso-reject-capsule" id="reject-capsule" style="opacity: 0;">
      <circle cx="0" cy="0" r="3.6" fill="var(--anatomy-red, #ff6b6b)" stroke="var(--anatomy-top)" stroke-width="0.8" />
    </g>
  </g>

  <!-- Layer 4: Presentación / Controlador -->
  <g class="iso-layer" data-layer="4" id="layer-4">
    ${l4Svg}
    <!-- Dynamic Manometer Needle on Layer 4 -->
    <g id="mano-needle-group">
      <line id="mano-needle" x1="${g.at([26, 6, 170 + 34 + 14])[0]}" y1="${g.at([26, 6, 170 + 34 + 14])[1]}"
            x2="${g.at([26, 6, 170 + 34 + 14])[0]}" y2="${g.at([26, 6, 170 + 34 + 14])[1] - 8}"
            stroke="var(--anatomy-lit)" stroke-width="1.2" stroke-linecap="round" />
    </g>
  </g>

  <!-- Central Request Plunger (Lit Accent) -->
  <g class="iso-plunger-unit" id="plunger" transform="translate(0, 0)">
    <g transform="translate(${plungerRestAt[0]}, ${plungerRestAt[1]})">
      ${dyn.plungerSvg}
    </g>
  </g>
`;

const svg = k.figureSvg({
  width: g.WIDTH,
  height: g.HEIGHT,
  label: "Torre Modular Isométrica de Arquitectura en N-Capas",
  body: svgBody,
});

// Controls & Pedagogical Diagnostics UI
const uiControlsHtml = `
<div class="anatomy-controls-panel">
  <div class="anatomy-row-top">
    <div class="anatomy-col">
      <span class="ctrl-label">CASO DE USO / ESCENARIO:</span>
      <div class="btn-group">
        <button class="ctrl-btn active" data-scenario="200_OK" title="Flujo completo exitoso a través de las 4 capas">
          <span class="badge-dot badge-green"></span> 200 OK · Reserva Exitosa
        </button>
        <button class="ctrl-btn" data-scenario="400_REJECT" title="Rechazo por regla de negocio en Capa 3: Repositorio y BD NO se ejecutan">
          <span class="badge-dot badge-red"></span> 400 Bad Request · Sin Cupo
        </button>
        <button class="ctrl-btn" data-scenario="422_INVALID" title="Rechazo sintáctico inmediato en Capa 4: No ingresa al sistema">
          <span class="badge-dot badge-orange"></span> 422 Unprocessable · Formato Inválido
        </button>
      </div>
    </div>
    <div class="anatomy-col-right">
      <button class="ctrl-btn-action" id="btn-trigger" title="Despacha una petición por la torre (Espacio)">
        ▶ Despachar Petición
      </button>
      <button class="ctrl-btn-action" id="btn-theme" title="Alternar tema oscuro / claro (T)">
        🌓 Tema
      </button>
    </div>
  </div>

  <div class="anatomy-row-mid">
    <div class="explode-control">
      <label for="explode-slider" class="ctrl-label">
        VISTA DESPIEZADA (SEPARACIÓN DE CAPAS): <span id="explode-val">0%</span>
      </label>
      <input type="range" id="explode-slider" min="0" max="100" value="0" step="1" title="Presione [E] para alternar despiece" />
    </div>
  </div>

  <div class="anatomy-row-bottom">
    <div class="pedagogy-card" id="layer-card">
      <div class="pedagogy-header">
        <span class="pedagogy-tag" id="pedagogy-layer-tag">CAPA ACTIVA: NINGUNA</span>
        <span class="pedagogy-ref" id="pedagogy-layer-ref">Refactor MVC · AIS-86</span>
      </div>
      <div class="pedagogy-body">
        <strong id="pedagogy-title">Torre en Reposo (Ciclo Listo)</strong>
        <p id="pedagogy-desc">
          Haga clic en 'Despachar Petición', arrastre el cursor sobre las capas para inspeccionarlas o use el control de despiece para ver cómo las interfaces aíslan la lógica de dominio.
        </p>
      </div>
    </div>

    <div class="log-terminal">
      <div class="log-title">TRAZA DE EJECUCIÓN (LIFECYCLE TRACE)</div>
      <div class="log-content" id="log-console">
        <div class="log-line text-muted">[SISTEMA] Torre de ensayo modular inicializada. Esperando señal HTTP...</div>
      </div>
    </div>
  </div>
</div>
`;

// Plate container wrapping figure
const plate = k.plateHtml({
  fig: "Fig 1",
  title: "Torre de Ensayo y Procesamiento Modular N-Capas",
  hint: "Haga clic en los botones de escenario o arrastre el despiece · Teclas [1, 2, 3, E, Espacio, T]",
  readout: "STANDBY · 4 CAPAS ACOPLADAS",
  keys: [
    { mark: "lit", label: "Émbolo central: Petición (Request) y Respuesta (Response) en tránsito" },
    { mark: "raised", label: "4 Módulos independientes: Presentación, Servicio, Repositorio y Persistencia" },
    { mark: "flat", label: "Columnas cromadas e interfaces: Desacoplamiento mecánico por contratos" },
  ],
  caption:
    "Demostración mecánica de una Arquitectura en N-Capas sobre bancada de fundición. Cada nivel tiene responsabilidad única: el Controlador valida la entrada, el Servicio evalúa las reglas de negocio puras, el Repositorio mapea las entidades y la Base de Datos persiste el estado. En un error 400 (sin cupo), el Servicio expulsa la solicitud por el bypass lateral sin tocar el Repositorio ni la Base de Datos.",
  body: `<div class="iso-stage" tabindex="0">${svg}</div>${uiControlsHtml}`,
});

// Client-Side Interactive Logic
const clientScript = `
const SCENARIOS = ${JSON.stringify(SCENARIOS)};
const LAYER_INFO = ${JSON.stringify(LAYER_INFO)};
const EXPLODE_DZ = ${JSON.stringify(g.EXPLODE_DZ)};
const P = ${JSON.stringify(g.P)};

// DOM Elements
const stage = document.querySelector(".iso-stage");
const readout = document.querySelector("[data-readout]");
const hint = document.querySelector('[data-corner="hint"]');
const plunger = document.getElementById("plunger");
const rejectCapsule = document.getElementById("reject-capsule");
const manoNeedle = document.getElementById("mano-needle");
const explodeSlider = document.getElementById("explode-slider");
const explodeVal = document.getElementById("explode-val");
const btnTrigger = document.getElementById("btn-trigger");
const btnTheme = document.getElementById("btn-theme");
const scenarioBtns = document.querySelectorAll("[data-scenario]");
const logConsole = document.getElementById("log-console");
const pedagogyTag = document.getElementById("pedagogy-layer-tag");
const pedagogyRef = document.getElementById("pedagogy-layer-ref");
const pedagogyTitle = document.getElementById("pedagogy-title");
const pedagogyDesc = document.getElementById("pedagogy-desc");

const layerEls = {
  1: document.getElementById("layer-1"),
  2: document.getElementById("layer-2"),
  3: document.getElementById("layer-3"),
  4: document.getElementById("layer-4"),
};

// State variables
let currentScenario = "200_OK";
let explodeFactor = 0; // 0 to 1
let targetExplode = 0;
let isAnimating = false;
let animProgress = 0; // 0 to 1
let lastTime = performance.now();
let activeLayer = 0;
let loggedSteps = new Set();

// Isometric translation scale constant along vertical Z axis
const screenRisePerUnit = 0.8660254 * P.scale * Math.sqrt(1.6);

function log(msg, type = "normal") {
  const line = document.createElement("div");
  line.className = "log-line" + (type === "error" ? " text-red" : type === "success" ? " text-green" : type === "warn" ? " text-orange" : "");
  const time = new Date().toISOString().substring(11, 23);
  line.textContent = "[" + time + "] " + msg;
  logConsole.appendChild(line);
  logConsole.scrollTop = logConsole.scrollHeight;
}

function updatePedagogy(layerId, customTitle = null, customDesc = null) {
  if (layerId && LAYER_INFO[layerId]) {
    const info = LAYER_INFO[layerId];
    pedagogyTag.textContent = info.title.toUpperCase();
    pedagogyRef.textContent = info.fileRef;
    pedagogyTitle.textContent = customTitle || info.subtitle;
    pedagogyDesc.textContent = customDesc || info.desc;
  } else {
    pedagogyTag.textContent = "ESTADO DEL SISTEMA";
    pedagogyRef.textContent = "UNAMBA · AIS-86";
    pedagogyTitle.textContent = customTitle || "Torre en Reposo (Standby)";
    pedagogyDesc.textContent = customDesc || "Seleccione un escenario arquitectónico y presione 'Despachar Petición' para observar el flujo de datos.";
  }
}

function setScenario(scenId) {
  if (!SCENARIOS[scenId]) return;
  currentScenario = scenId;
  scenarioBtns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.scenario === scenId);
  });
  const scen = SCENARIOS[scenId];
  log("Escenario seleccionado: " + scen.name, "warn");
  updatePedagogy(null, scen.name, scen.description);
}

function triggerCycle() {
  if (isAnimating) return;
  isAnimating = true;
  animProgress = 0;
  loggedSteps.clear();
  log("=========================================");
  log("NUEVA PETICIÓN HTTP DESPACHADA (" + SCENARIOS[currentScenario].code + ")", "warn");
}

function applyExplosion(factor) {
  explodeFactor = factor;
  for (let l = 1; l <= 4; l++) {
    const dz = EXPLODE_DZ[l - 1] * factor;
    const dyScreen = -dz * screenRisePerUnit;
    layerEls[l].setAttribute("transform", "translate(0, " + dyScreen.toFixed(2) + ")");
  }
  explodeVal.textContent = Math.round(factor * 100) + "%";
}

function renderFrame(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  // Smooth explode easing
  if (Math.abs(targetExplode - explodeFactor) > 0.001) {
    applyExplosion(explodeFactor + (targetExplode - explodeFactor) * (1 - Math.exp(-dt * 8)));
  }

  // Animation cycle
  if (isAnimating) {
    const speed = 0.35; // cycle duration ~2.8 seconds
    animProgress += dt * speed;
    if (animProgress > 1) {
      animProgress = 1;
      isAnimating = false;
      log("Ciclo completado. Resultado: " + SCENARIOS[currentScenario].code, currentScenario === "200_OK" ? "success" : "error");
      readout.textContent = "RESPUESTA HTTP EMITIDA: " + SCENARIOS[currentScenario].code;
    }

    const t = animProgress;
    let plungerZOffset = 0;
    let manoAngle = 0; // in degrees

    if (currentScenario === "200_OK") {
      // 4 Layers traversal:
      // t 0..0.15: Layer 4 [Presentación]
      // t 0.15..0.45: Layer 3 [Servicio]
      // t 0.45..0.70: Layer 2 [Repositorio]
      // t 0.70..0.85: Layer 1 [Persistencia/BD]
      // t 0.85..1.00: Return to Layer 4
      if (t < 0.15) {
        activeLayer = 4;
        plungerZOffset = (t / 0.15) * -20;
        manoAngle = 10;
      } else if (t < 0.45) {
        activeLayer = 3;
        const sub = (t - 0.15) / 0.30;
        plungerZOffset = -20 + sub * -54;
        manoAngle = 20;
      } else if (t < 0.70) {
        activeLayer = 2;
        const sub = (t - 0.45) / 0.25;
        plungerZOffset = -74 + sub * -54;
        manoAngle = 30;
      } else if (t < 0.85) {
        activeLayer = 1;
        const sub = (t - 0.70) / 0.15;
        plungerZOffset = -128 + sub * -54;
        manoAngle = 45; // 200 OK green
      } else {
        activeLayer = 4;
        const sub = (t - 0.85) / 0.15;
        plungerZOffset = -182 * (1 - sub);
        manoAngle = 45;
      }
      rejectCapsule.style.opacity = "0";

    } else if (currentScenario === "400_REJECT") {
      // Layer 4 -> Layer 3 -> Trip lateral bypass -> Return
      // Layers 2 and 1 remain completely untouched!
      if (t < 0.20) {
        activeLayer = 4;
        plungerZOffset = (t / 0.20) * -20;
        manoAngle = -10;
        rejectCapsule.style.opacity = "0";
      } else if (t < 0.55) {
        activeLayer = 3;
        const sub = (t - 0.20) / 0.35;
        plungerZOffset = -20 + sub * -54;
        manoAngle = -35;
        // Eject reject capsule along chute
        rejectCapsule.style.opacity = "1";
        const chuteX = -28 + sub * (-54);
        const chuteY = 6 + sub * 12;
        const chuteZ = 153 + sub * (-15);
        // Transform reject capsule in SVG screen coordinates
        const capPt = [
          P.origin[0] + (chuteX * P.sinA - chuteY * P.cosA) * P.k,
          P.origin[1] + ((chuteX * P.cosA + chuteY * P.sinA) * P.sinE - chuteZ * P.cosE) * P.k
        ];
        rejectCapsule.setAttribute("transform", "translate(" + capPt[0].toFixed(1) + ", " + capPt[1].toFixed(1) + ")");
      } else {
        activeLayer = 4;
        const sub = (t - 0.55) / 0.45;
        plungerZOffset = -74 * (1 - sub);
        manoAngle = -45; // 400 Bad Request
        if (sub > 0.8) rejectCapsule.style.opacity = String(1 - (sub - 0.8) / 0.2);
      }

    } else if (currentScenario === "422_INVALID") {
      // Rejection immediately in Layer 4
      if (t < 0.30) {
        activeLayer = 4;
        plungerZOffset = (t / 0.30) * -16;
        manoAngle = -20;
      } else if (t < 0.60) {
        activeLayer = 4;
        // vibration / rejection rattle
        plungerZOffset = -16 + Math.sin((t - 0.3) * 60) * 2;
        manoAngle = -70; // 422 Unprocessable
      } else {
        activeLayer = 4;
        const sub = (t - 0.60) / 0.40;
        plungerZOffset = -16 * (1 - sub);
        manoAngle = -70;
      }
      rejectCapsule.style.opacity = "0";
    }

    // Step logger
    const scen = SCENARIOS[currentScenario];
    scen.steps.forEach((step, idx) => {
      if (t >= step.t && !loggedSteps.has(idx)) {
        loggedSteps.add(idx);
        log("[Capa " + step.layer + " · " + step.name + "] " + step.detail, currentScenario === "200_OK" ? "normal" : "error");
        updatePedagogy(step.layer, step.name, step.detail);
      }
    });

    // Update plunger position (incorporating explode offset of top layer if exploded)
    const topExplodeOffset = -EXPLODE_DZ[3] * explodeFactor * screenRisePerUnit;
    const dyPlunger = -plungerZOffset * screenRisePerUnit + topExplodeOffset;
    plunger.setAttribute("transform", "translate(0, " + dyPlunger.toFixed(2) + ")");

    // Update manometer needle rotation
    const baseMano = [
      P.origin[0] + (26 * P.sinA - 6 * P.cosA) * P.k,
      P.origin[1] + ((26 * P.cosA + 6 * P.sinA) * P.sinE - 218 * P.cosE) * P.k + topExplodeOffset
    ];
    manoNeedle.setAttribute("transform", "rotate(" + manoAngle.toFixed(1) + ", " + baseMano[0].toFixed(1) + ", " + baseMano[1].toFixed(1) + ")");

    // Update readout
    readout.textContent = "CICLO EN CURSO (" + Math.round(t * 100) + "%) · CAPA " + activeLayer + " ACTIVA";
  }

  requestAnimationFrame(renderFrame);
}

// Event Listeners
scenarioBtns.forEach(btn => {
  btn.addEventListener("click", () => setScenario(btn.dataset.scenario));
});

btnTrigger.addEventListener("click", triggerCycle);

explodeSlider.addEventListener("input", (e) => {
  targetExplode = parseInt(e.target.value, 10) / 100;
});

btnTheme.addEventListener("click", () => {
  const current = document.body.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", next);
  log("Tema cambiado a: " + next.toUpperCase());
});

// Layer hover inspection
for (let l = 1; l <= 4; l++) {
  layerEls[l].addEventListener("pointerenter", () => {
    layerEls[l].style.filter = "brightness(1.22)";
    updatePedagogy(l);
  });
  layerEls[l].addEventListener("pointerleave", () => {
    layerEls[l].style.filter = "none";
  });
}

// Keyboard shortcuts
window.addEventListener("keydown", (e) => {
  if (e.key === "1") setScenario("200_OK");
  if (e.key === "2") setScenario("400_REJECT");
  if (e.key === "3") setScenario("422_INVALID");
  if (e.key === " " || e.key === "Enter") { e.preventDefault(); triggerCycle(); }
  if (e.key === "e" || e.key === "E") {
    targetExplode = targetExplode > 0.5 ? 0 : 0.85;
    explodeSlider.value = Math.round(targetExplode * 100);
  }
  if (e.key === "t" || e.key === "T") btnTheme.click();
});

// Start loop
requestAnimationFrame(renderFrame);
log("Máquina lista. Presione [Espacio] o 'Despachar Petición' para comenzar.");
`;

// Dedicated Page & Control Panel CSS
const customCss = `
${isoCssContent}

.anatomy-controls-panel {
  margin-top: 18px;
  background: var(--anatomy-card);
  border: 1px solid var(--anatomy-lo);
  border-radius: 4px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.anatomy-row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.ctrl-label {
  font-family: var(--anatomy-mono);
  font-size: 11px;
  color: var(--anatomy-muted);
  letter-spacing: 0.08em;
  display: block;
  margin-bottom: 6px;
}

.btn-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ctrl-btn {
  background: var(--anatomy-paper);
  border: 1px solid var(--anatomy-mid);
  color: var(--anatomy-text);
  padding: 6px 12px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  font-family: var(--anatomy-mono);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.ctrl-btn:hover {
  border-color: var(--anatomy-hi);
  color: var(--anatomy-strong);
}

.ctrl-btn.active {
  background: var(--anatomy-face);
  border-color: var(--anatomy-lit);
  color: var(--anatomy-strong);
  box-shadow: 0 0 0 1px var(--anatomy-lit);
}

.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}
.badge-green { background: var(--anatomy-green, #6be0a0); }
.badge-red { background: var(--anatomy-red, #ff6b6b); }
.badge-orange { background: #ffaa44; }

.anatomy-col-right {
  display: flex;
  gap: 8px;
}

.ctrl-btn-action {
  background: var(--anatomy-strong);
  color: var(--anatomy-page);
  border: 1px solid var(--anatomy-strong);
  font-weight: 600;
  padding: 7px 16px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12.5px;
  font-family: var(--anatomy-mono);
  transition: opacity 0.15s ease;
}
.ctrl-btn-action:hover {
  opacity: 0.88;
}

.explode-control {
  width: 100%;
}
.explode-control input[type="range"] {
  width: 100%;
  accent-color: var(--anatomy-hi);
  cursor: pointer;
}

.anatomy-row-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.pedagogy-card {
  background: var(--anatomy-paper);
  border: 1px solid var(--anatomy-lo);
  border-radius: 3px;
  padding: 12px 14px;
}

.pedagogy-header {
  display: flex;
  justify-content: space-between;
  font-family: var(--anatomy-mono);
  font-size: 10.5px;
  color: var(--anatomy-muted);
  border-bottom: 1px solid var(--anatomy-faint);
  padding-bottom: 6px;
  margin-bottom: 8px;
}

.pedagogy-tag {
  color: var(--anatomy-hi);
  font-weight: 600;
}

.pedagogy-body strong {
  display: block;
  font-size: 13px;
  color: var(--anatomy-strong);
  margin-bottom: 4px;
}

.pedagogy-body p {
  margin: 0;
  font-size: 12px;
  color: var(--anatomy-text);
  line-height: 1.5;
}

.log-terminal {
  background: #080808;
  border: 1px solid var(--anatomy-faint);
  border-radius: 3px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  height: 130px;
}
[data-theme="light"] .log-terminal {
  background: #f7f7f5;
  border-color: #dfdfdc;
}

.log-title {
  font-family: var(--anatomy-mono);
  font-size: 10px;
  color: var(--anatomy-muted);
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.log-content {
  overflow-y: auto;
  font-family: var(--anatomy-mono);
  font-size: 11px;
  line-height: 1.45;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.log-line { color: var(--anatomy-text); }
.text-muted { color: var(--anatomy-muted); }
.text-green { color: var(--anatomy-green, #6be0a0); }
.text-red { color: var(--anatomy-red, #ff6b6b); }
.text-orange { color: #ffaa44; }

.iso-layer {
  transition: transform 0.05s linear;
  cursor: pointer;
}

@media (max-width: 768px) {
  .anatomy-row-bottom {
    grid-template-columns: 1fr;
  }
}
`;

// HTML Shell
const fullHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Torre Isométrica 3D · Arquitectura en N-Capas (Anatomy)</title>
  <style>
    ${customCss}
    body {
      margin: 0;
      background: var(--anatomy-page);
      color: var(--anatomy-text);
      display: flex;
      justify-content: center;
      padding: 32px 16px;
    }
    .container {
      width: min(960px, 100%);
    }
  </style>
</head>
<body class="iso" data-theme="${theme}">
  <div class="container">
    ${plate}
  </div>
  <script type="module">
    ${clientScript}
  </script>
</body>
</html>
`;

// Output HTML files
const outFileName = isLight ? "index-light.html" : "index.html";
writeFileSync(join(HERE, outFileName), fullHtml, "utf8");
console.log(`[Anatomy] Successfully built standalone page: ${outFileName}`);

// If building default, also write index.html
if (!isLight) {
  console.log(`[Anatomy] Primary file written to: ${join(HERE, "index.html")}`);
}
