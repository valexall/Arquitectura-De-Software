import * as THREE from 'three';

export const SCENARIO_THEMES = {
  cyber: {
    id: 'cyber',
    name: 'Cyber-Grid Quantum (Sci-Fi)',
    tag: 'Recomendado para visualización de microservicios y nubes modernas',
    description: 'Estética ciberespacio con plataformas de obsidiana translúcida, rejilla de neón cian/magenta infinita, tuberías de fotones y núcleos de luz cuántica.',
    background: 0x060913,
    fogColor: 0x060913,
    ambientLight: { color: 0x142036, intensity: 1.8 },
    dirLight1: { color: 0x00f0ff, intensity: 2.2, pos: [30, 60, 40] },
    dirLight2: { color: 0xff007f, intensity: 1.5, pos: [-30, 20, -30] },
    gridColor1: 0x00e5ff,
    gridColor2: 0x112244,
    platform: {
      color: 0x0e172a,
      roughness: 0.2,
      metalness: 0.85,
      transparent: true,
      opacity: 0.92,
      edgeColor: 0x00f5ff
    },
    accentColors: {
      client: 0x38bdf8,
      presentation: 0x818cf8,
      business: 0xf59e0b,
      repository: 0x10b981,
      database: 0xec4899,
      exception: 0xef4444,
      columns: 0x1e293b
    },
    particleColor: 0x38bdf8,
    rejectionColor: 0xff3366,
    successColor: 0x10b981
  },

  glass: {
    id: 'glass',
    name: 'Minimalist Clean Studio (Glassmorphism)',
    tag: 'Elegancia arquitectónica corporativa y salas de conferencias',
    description: 'Losas de vidrio templado esmerilado con refracción física, titanio satinado, columnas cromadas y acentos en oro suave y esmeralda.',
    background: 0x0c0e14,
    fogColor: 0x0c0e14,
    ambientLight: { color: 0x2a324b, intensity: 2.0 },
    dirLight1: { color: 0xffffff, intensity: 2.5, pos: [40, 70, 30] },
    dirLight2: { color: 0x94a3b8, intensity: 1.2, pos: [-40, 30, -30] },
    gridColor1: 0x334155,
    gridColor2: 0x1e293b,
    platform: {
      color: 0x1e293b,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.75,
      edgeColor: 0x94a3b8
    },
    accentColors: {
      client: 0x60a5fa,
      presentation: 0xa78bfa,
      business: 0xfbbf24,
      repository: 0x34d399,
      database: 0xf43f5e,
      exception: 0xf87171,
      columns: 0x64748b
    },
    particleColor: 0x38bdf8,
    rejectionColor: 0xf87171,
    successColor: 0x34d399
  },

  industrial: {
    id: 'industrial',
    name: 'Industrial Data Plant (Mecatrónica)',
    tag: 'Ideal para entender sistemas monolíticos pesados y computación local',
    description: 'Infraestructura de centro de datos industrial pesado: acero estructural fundido, latón bruñido, cilindros neumáticos, franjas de advertencia y vapor de enfriamiento.',
    background: 0x101012,
    fogColor: 0x101012,
    ambientLight: { color: 0x33281e, intensity: 2.0 },
    dirLight1: { color: 0xffb366, intensity: 2.6, pos: [35, 55, 35] },
    dirLight2: { color: 0x5588aa, intensity: 1.2, pos: [-35, 25, -25] },
    gridColor1: 0xeab308,
    gridColor2: 0x27272a,
    platform: {
      color: 0x27272a,
      roughness: 0.6,
      metalness: 0.8,
      transparent: false,
      opacity: 1.0,
      edgeColor: 0xf59e0b
    },
    accentColors: {
      client: 0x0284c7,
      presentation: 0x6366f1,
      business: 0xd97706,
      repository: 0x059669,
      database: 0xbe185d,
      exception: 0xdc2626,
      columns: 0x78716c
    },
    particleColor: 0xf59e0b,
    rejectionColor: 0xdc2626,
    successColor: 0x10b981
  },

  blueprint: {
    id: 'blueprint',
    name: 'Holographic CAD Blueprint (Técnico)',
    tag: 'Diagramas formales de ingeniería y especificaciones UML',
    description: 'Visualización holográfica en alambre y mallas técnicas sobre cuadrícula milimétrica azul cobalto, ideal para auditorías de arquitectura.',
    background: 0x030b1e,
    fogColor: 0x030b1e,
    ambientLight: { color: 0x0f2d59, intensity: 2.2 },
    dirLight1: { color: 0x38bdf8, intensity: 2.5, pos: [30, 60, 30] },
    dirLight2: { color: 0x0284c7, intensity: 1.6, pos: [-30, 30, -30] },
    gridColor1: 0x00f0ff,
    gridColor2: 0x075985,
    platform: {
      color: 0x0c2340,
      roughness: 0.3,
      metalness: 0.7,
      transparent: true,
      opacity: 0.7,
      edgeColor: 0x38bdf8
    },
    accentColors: {
      client: 0x38bdf8,
      presentation: 0x60a5fa,
      business: 0x38bdf8,
      repository: 0x0284c7,
      database: 0x0369a1,
      exception: 0xf43f5e,
      columns: 0x075985
    },
    particleColor: 0x38bdf8,
    rejectionColor: 0xf43f5e,
    successColor: 0x38bdf8
  }
};

export class ThemeManager {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.currentThemeId = 'cyber';
    this.listeners = [];
  }

  getCurrentTheme() {
    return SCENARIO_THEMES[this.currentThemeId];
  }

  setTheme(themeId) {
    if (!SCENARIO_THEMES[themeId]) return;
    this.currentThemeId = themeId;
    const theme = SCENARIO_THEMES[themeId];

    // Background & Fog
    this.scene.background = new THREE.Color(theme.background);
    if (this.scene.fog) {
      this.scene.fog.color.setHex(theme.fogColor);
    }

    this.notifyThemeChanged(theme);
    return theme;
  }

  onThemeChange(fn) {
    this.listeners.push(fn);
  }

  notifyThemeChanged(theme) {
    this.listeners.forEach(fn => fn(theme));
  }
}
