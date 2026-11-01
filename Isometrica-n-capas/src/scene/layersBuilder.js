import * as THREE from 'three';

export const LAYER_INFO = {
  client: {
    id: 'client',
    index: 4,
    name: 'Capa 0: Clientes y Consumidores',
    role: 'Punto de origen de peticiones y destino de respuestas',
    codePath: 'ais86-semana05-mvc-refactor/templates/ (o cliente REST / Postman)',
    description: 'Navegadores web, aplicaciones móviles, scripts de prueba o sistemas externos. Emiten comandos y consultas HTTP estructurados (JSON / URL Encoded). No tienen conocimiento de la estructura de tablas ni de las reglas de base de datos.',
    rules: [
      'Debe comunicarse únicamente a través de la interfaz pública (API / Controlador).',
      'Nunca debe consultar directamente la Base de Datos ni ejecutar consultas SQL.',
      'Maneja el renderizado de la UI y la captura de eventos del usuario.'
    ],
    color: '#38bdf8',
    yBase: 24,
    techComponents: 'Browser / SPA / Mobile App / Postman / cURL'
  },

  presentation: {
    id: 'presentation',
    index: 3,
    name: 'Capa 1: Presentación & Controladores',
    role: 'Enrutamiento, Deserialización y Respuestas HTTP',
    codePath: 'ais86-semana05-mvc-refactor/controlador/rutas.py',
    description: 'Punto de entrada de la aplicación en el servidor. Desempaqueta peticiones HTTP, valida tipos de datos y sintaxis de entrada (campos no vacíos, formato email), y delega el flujo al servicio correspondiente. Serializa el resultado en respuestas HTTP (200, 201, 400, 500).',
    rules: [
      'Prohibido implementar lógica de negocio (no evalúa si quedan cupos o si un cliente es VIP).',
      'Prohibido llamar directamente a repositorios o ejecutar sentencias SQL.',
      'Es la única capa consciente del framework web (Flask, Express, FastAPI, ASP.NET).'
    ],
    color: '#818cf8',
    yBase: 14,
    techComponents: 'Flask Blueprints / Controller Endpoints / DTOs / Middlewares'
  },

  business: {
    id: 'business',
    index: 2,
    name: 'Capa 2: Lógica de Negocio & Servicios',
    role: 'Núcleo del Dominio y Validación de Reglas de Negocio',
    codePath: 'ais86-semana05-mvc-refactor/servicio/reservas.py',
    description: 'El cerebro de la aplicación. Aplica las políticas, cálculos, validaciones de dominio y flujos de trabajo (ej. "Solo se confirma si hay cupo disponible", "El total debe sumar tasas e impuestos"). Puede ejecutarse y probarse unitariamente de forma totalmente aislada sin servidor web ni base de datos real.',
    rules: [
      'Independiente de la tecnología web (no importa si la petición vino de HTTP, gRPC o CLI).',
      'Si una regla falla (ej. sin cupos), dispara una excepción de negocio (400) y aborta el flujo inmediatamente.',
      'Coordina uno o varios repositorios para completar un caso de uso transaccional.'
    ],
    color: '#f59e0b',
    yBase: 4,
    techComponents: 'Servicios de Dominio / Casos de Uso / Validadores / Reglas de Negocio'
  },

  repository: {
    id: 'repository',
    index: 1,
    name: 'Capa 3: Repositorio & Acceso a Datos (DAL)',
    role: 'Abstracción y Mapeo entre Dominio y Persistencia',
    codePath: 'ais86-semana05-mvc-refactor/repositorio/memoria.py',
    description: 'Oculta los detalles técnicos del almacenamiento al resto del sistema. Expone una colección orientada a objetos (obtener_todas, guardar, buscar_por_id). Transforma entidades de negocio en formatos persistibles y viceversa (Data Mapper / ORM).',
    rules: [
      'Permite cambiar de motor de base de datos (PostgreSQL, MongoDB, Memoria) sin alterar ni una línea del servicio.',
      'No contiene lógica de negocio ni validaciones de dominio.',
      'Maneja transacciones, conexiones a bases de datos y dialectos SQL.'
    ],
    color: '#10b981',
    yBase: -6,
    techComponents: 'Patrón Repositorio / Data Mapper / ORM (SQLAlchemy, Prisma) / DAO'
  },

  database: {
    id: 'database',
    index: 0,
    name: 'Capa 4: Base de Datos & Persistencia',
    role: 'Almacenamiento Físico Seguro y Durable',
    codePath: 'ais86-semana05-mvc-refactor/modelo/entidad.py (Esquema físico / WAL)',
    description: 'El medio de almacenamiento permanente. Garantiza propiedades ACID (Atomicidad, Consistencia, Aislamiento, Durabilidad), indexación de alto rendimiento, registros de transacción (WAL) y replicación.',
    rules: [
      'Solo accesible por la Capa de Repositorio.',
      'Almacena el estado persistente de la organización.',
      'Soporta motores relacionales (PostgreSQL, MySQL), NoSQL o memoria distribuida (Redis).'
    ],
    color: '#ec4899',
    yBase: -16,
    techComponents: 'RDBMS (PostgreSQL) / WAL Logs / Cache Redis / Tablas Físicas'
  }
};

export class LayersBuilder {
  constructor(scene, themeManager) {
    this.scene = scene;
    this.themeManager = themeManager;
    this.layerGroups = {};
    this.allMeshes = [];
    this.interactiveObjects = [];
    this.columnsGroup = new THREE.Group();
    this.centralConduitGroup = new THREE.Group();
    this.explosionFactor = 0; // 0 = normal, 1 = maximum explosion
    this.animatedElements = [];
  }

  buildAll() {
    const theme = this.themeManager.getCurrentTheme();

    // 1. Build Base Foundation & Ground Grid
    this.buildFoundation(theme);

    // 2. Build Vertical Support Columns
    this.buildSupportColumns(theme);

    // 3. Build Central Data Conduits (connecting the floors)
    this.buildCentralConduit(theme);

    // 4. Build Layers
    this.layerGroups.database = this.buildDatabaseLayer(theme);
    this.layerGroups.repository = this.buildRepositoryLayer(theme);
    this.layerGroups.business = this.buildBusinessLayer(theme);
    this.layerGroups.presentation = this.buildPresentationLayer(theme);
    this.layerGroups.client = this.buildClientLayer(theme);

    // Add layers to scene
    Object.values(this.layerGroups).forEach(group => {
      this.scene.add(group);
    });

    this.scene.add(this.columnsGroup);
    this.scene.add(this.centralConduitGroup);

    // Listen for theme updates
    this.themeManager.onThemeChange((newTheme) => {
      this.updateThemeMaterials(newTheme);
    });
  }

  // --- Foundation & Grid Floor ---
  buildFoundation(theme) {
    const group = new THREE.Group();
    group.name = 'Foundation';

    // Massive beveled pedestal
    const baseGeo = new THREE.BoxGeometry(44, 2.5, 44);
    const baseMat = new THREE.MeshStandardMaterial({
      color: theme.platform.color,
      roughness: 0.7,
      metalness: 0.8
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -22;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // Sub-pedestal rim with chamfer
    const subGeo = new THREE.BoxGeometry(47, 1.2, 47);
    const subMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d,
      roughness: 0.9,
      metalness: 0.5
    });
    const subMesh = new THREE.Mesh(subGeo, subMat);
    subMesh.position.y = -23.8;
    group.add(subMesh);

    // Corner isolation dampeners / feet
    const footGeo = new THREE.CylinderGeometry(2, 2.4, 2, 16);
    const footMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.2
    });
    const corners = [
      [-20, -25, -20],
      [20, -25, -20],
      [-20, -25, 20],
      [20, -25, 20]
    ];
    corners.forEach(pos => {
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(...pos);
      group.add(foot);
    });

    // Floor holographic grid
    const grid = new THREE.GridHelper(100, 50, theme.gridColor1, theme.gridColor2);
    grid.position.y = -24.9;
    group.add(grid);
    this.gridHelper = grid;

    // Outer perimeter neon light strip
    const rimGeo = new THREE.RingGeometry(30, 31, 32);
    const rimMat = new THREE.MeshBasicMaterial({
      color: theme.platform.edgeColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -24.8;
    group.add(rim);

    this.scene.add(group);
  }

  // --- Vertical Support Columns ---
  buildSupportColumns(theme) {
    const colGeo = new THREE.CylinderGeometry(0.5, 0.5, 54, 16);
    const colMat = new THREE.MeshStandardMaterial({
      color: theme.accentColors.columns,
      metalness: 0.95,
      roughness: 0.15
    });

    const positions = [
      [-17, 3, -17],
      [17, 3, -17],
      [-17, 3, 17],
      [17, 3, 17]
    ];

    positions.forEach((pos, i) => {
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(...pos);
      col.castShadow = true;
      this.columnsGroup.add(col);

      // Add calibrated graduation rings on columns
      for (let y = -18; y <= 24; y += 4) {
        const ringGeo = new THREE.TorusGeometry(0.55, 0.05, 8, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.6 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(pos[0], y, pos[2]);
        this.columnsGroup.add(ring);
      }
    });
  }

  // --- Central Data Conduits ---
  buildCentralConduit(theme) {
    // Glass energy sleeve
    const conduitGeo = new THREE.CylinderGeometry(1.2, 1.2, 48, 24, 1, true);
    const conduitMat = new THREE.MeshPhysicalMaterial({
      color: theme.accentColors.client,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
      transmission: 0.8,
      thickness: 1.0,
      side: THREE.DoubleSide
    });
    const conduit = new THREE.Mesh(conduitGeo, conduitMat);
    conduit.position.y = 4;
    this.centralConduitGroup.add(conduit);
    this.centralConduit = conduit;

    // Internal fiber core
    const coreGeo = new THREE.CylinderGeometry(0.3, 0.3, 48, 12);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.8
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 4;
    this.centralConduitGroup.add(core);

    // Glowing pulsing energy rings around the conduit
    for (let i = 0; i < 8; i++) {
      const rGeo = new THREE.TorusGeometry(1.35, 0.06, 8, 24);
      const rMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.7
      });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.rotation.x = Math.PI / 2;
      rMesh.position.y = -16 + i * 5.7;
      this.centralConduitGroup.add(rMesh);
      this.animatedElements.push({
        type: 'ring_pulse',
        mesh: rMesh,
        speed: 1.5,
        offset: i * 0.8
      });
    }
  }

  // --- Helper to build a platform slab ---
  createPlatformSlab(theme, colorHex, w = 34, h = 1.2, d = 34) {
    const group = new THREE.Group();

    // Main slab
    const slabGeo = new THREE.BoxGeometry(w, h, d);
    const slabMat = new THREE.MeshStandardMaterial({
      color: theme.platform.color,
      roughness: theme.platform.roughness,
      metalness: theme.platform.metalness,
      transparent: theme.platform.transparent,
      opacity: theme.platform.opacity
    });
    const slab = new THREE.Mesh(slabGeo, slabMat);
    slab.castShadow = true;
    slab.receiveShadow = true;
    group.add(slab);

    // Glowing edge border
    const edgeGeo = new THREE.EdgesGeometry(slabGeo);
    const edgeMat = new THREE.LineBasicMaterial({
      color: colorHex,
      linewidth: 2,
      transparent: true,
      opacity: 0.85
    });
    const edgeLine = new THREE.LineSegments(edgeGeo, edgeMat);
    group.add(edgeLine);

    // Corner brackets
    const bracketGeo = new THREE.BoxGeometry(2.5, h + 0.3, 2.5);
    const bracketMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.2
    });
    const bracketOffsets = [
      [-w / 2 + 1.25, 0, -d / 2 + 1.25],
      [w / 2 - 1.25, 0, -d / 2 + 1.25],
      [-w / 2 + 1.25, 0, d / 2 - 1.25],
      [w / 2 - 1.25, 0, d / 2 - 1.25]
    ];
    bracketOffsets.forEach(pos => {
      const bracket = new THREE.Mesh(bracketGeo, bracketMat);
      bracket.position.set(...pos);
      group.add(bracket);
    });

    return { group, slab, edgeLine };
  }

  // ==========================================
  // CAPA 4: BASE DE DATOS Y PERSISTENCIA (Y = -16)
  // ==========================================
  buildDatabaseLayer(theme) {
    const info = LAYER_INFO.database;
    const group = new THREE.Group();
    group.name = 'Layer_Database';
    group.userData = { layerId: info.id, info, yBase: info.yBase };
    group.position.y = info.yBase;

    const { group: slabGroup } = this.createPlatformSlab(theme, info.color, 36, 1.4, 36);
    group.add(slabGroup);

    // 1. Dual Hard Disk Platter Arrays (Bóveda Magnética)
    const diskClusterGroup = new THREE.Group();
    diskClusterGroup.position.set(-7, 1.2, -6);

    const platterPlates = [];
    const platterRadius = 3.6;
    for (let i = 0; i < 4; i++) {
      const platterGeo = new THREE.CylinderGeometry(platterRadius, platterRadius, 0.25, 32);
      const platterMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.95,
        roughness: 0.05
      });
      const platter = new THREE.Mesh(platterGeo, platterMat);
      platter.position.y = i * 0.7;
      diskClusterGroup.add(platter);
      platterPlates.push(platter);

      // Central spindle ring
      const spindleGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.75, 16);
      const spindleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 });
      const spindle = new THREE.Mesh(spindleGeo, spindleMat);
      spindle.position.y = i * 0.7;
      diskClusterGroup.add(spindle);
    }

    // Actuator arm with laser read/write head
    const armPivot = new THREE.Group();
    armPivot.position.set(platterRadius + 1.2, 1.2, 1.2);
    const armGeo = new THREE.BoxGeometry(3.8, 0.2, 0.5);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const armMesh = new THREE.Mesh(armGeo, armMat);
    armMesh.position.x = -1.9;
    armPivot.add(armMesh);

    // Laser head
    const headGeo = new THREE.SphereGeometry(0.25, 12, 12);
    const headMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(-3.6, 0.2, 0);
    armPivot.add(headMesh);
    diskClusterGroup.add(armPivot);

    this.animatedElements.push({
      type: 'db_disks',
      platters: platterPlates,
      armPivot,
      speed: 2.0
    });
    group.add(diskClusterGroup);

    // 2. Redis In-Memory Cache Bank
    const cacheGroup = new THREE.Group();
    cacheGroup.position.set(8, 1.4, -6);

    const cacheBoxGeo = new THREE.BoxGeometry(6, 2.5, 4);
    const cacheBoxMat = new THREE.MeshPhysicalMaterial({
      color: 0xdc2626,
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85
    });
    const cacheBox = new THREE.Mesh(cacheBoxGeo, cacheBoxMat);
    cacheGroup.add(cacheBox);

    // Cooling fins on cache
    for (let f = -2.2; f <= 2.2; f += 0.8) {
      const finGeo = new THREE.BoxGeometry(0.1, 2.7, 4.2);
      const finMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.x = f;
      cacheGroup.add(fin);
    }
    group.add(cacheGroup);

    // 3. Write-Ahead Log (WAL) Monolith
    const walGroup = new THREE.Group();
    walGroup.position.set(0, 1.6, 7);
    const walGeo = new THREE.BoxGeometry(8, 2.8, 3);
    const walMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.3
    });
    const walMesh = new THREE.Mesh(walGeo, walMat);
    walGroup.add(walMesh);

    // Status activity lights on WAL
    for (let l = 0; l < 5; l++) {
      const ledGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(-2.8 + l * 1.4, 0.8, 1.55);
      walGroup.add(led);
      this.animatedElements.push({ type: 'blink_led', mesh: led, rate: 0.4 + l * 0.2 });
    }
    group.add(walGroup);

    // Tag for click detection
    this.registerInteractiveGroup(group, info);
    return group;
  }

  // ==========================================
  // CAPA 3: REPOSITORIOS Y ACCESO A DATOS (Y = -6)
  // ==========================================
  buildRepositoryLayer(theme) {
    const info = LAYER_INFO.repository;
    const group = new THREE.Group();
    group.name = 'Layer_Repository';
    group.userData = { layerId: info.id, info, yBase: info.yBase };
    group.position.y = info.yBase;

    const { group: slabGroup } = this.createPlatformSlab(theme, info.color, 34, 1.2, 34);
    group.add(slabGroup);

    // 1. Data Mapper Central Translation Drum (Tambor de Levas)
    const drumGroup = new THREE.Group();
    drumGroup.position.set(0, 2.0, 0);

    const drumGeo = new THREE.CylinderGeometry(3.5, 3.5, 2.6, 32);
    const drumMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.2
    });
    const drum = new THREE.Mesh(drumGeo, drumMat);
    drumGroup.add(drum);

    // Helical grooves / brass teeth on the drum (simulating translation logic)
    for (let g = 0; g < 8; g++) {
      const angle = (g / 8) * Math.PI * 2;
      const toothGeo = new THREE.BoxGeometry(0.8, 2.2, 0.4);
      const toothMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        metalness: 0.9,
        roughness: 0.1
      });
      const tooth = new THREE.Mesh(toothGeo, toothMat);
      tooth.position.set(Math.cos(angle) * 3.6, 0, Math.sin(angle) * 3.6);
      tooth.rotation.y = -angle;
      drumGroup.add(tooth);
    }

    this.animatedElements.push({
      type: 'rotate_drum',
      mesh: drumGroup,
      speed: 0.5
    });
    group.add(drumGroup);

    // 2. Query Dispatch Terminals (SELECT, INSERT, UPDATE, DELETE)
    const terminalData = [
      { name: 'SELECT (Query)', pos: [-9, 1.0, -6], color: 0x38bdf8 },
      { name: 'INSERT (Command)', pos: [9, 1.0, -6], color: 0x10b981 },
      { name: 'UPDATE', pos: [-9, 1.0, 6], color: 0xf59e0b },
      { name: 'DELETE', pos: [9, 1.0, 6], color: 0xef4444 }
    ];

    terminalData.forEach(t => {
      const tGeo = new THREE.BoxGeometry(3.2, 1.8, 3.2);
      const tMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.8,
        roughness: 0.3
      });
      const tMesh = new THREE.Mesh(tGeo, tMat);
      tMesh.position.set(...t.pos);
      group.add(tMesh);

      // Glowing dial on top
      const dialGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.3, 16);
      const dialMat = new THREE.MeshStandardMaterial({
        color: t.color,
        emissive: t.color,
        emissiveIntensity: 0.4
      });
      const dial = new THREE.Mesh(dialGeo, dialMat);
      dial.position.set(t.pos[0], t.pos[1] + 1.0, t.pos[2]);
      group.add(dial);
    });

    // 3. Flexible Oldham Coupling / Shock Absorber (Desacoplamiento arquitectónico)
    const damperGeo = new THREE.TorusGeometry(5.2, 0.4, 12, 32);
    const damperMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.8,
      roughness: 0.2
    });
    const damper = new THREE.Mesh(damperGeo, damperMat);
    damper.rotation.x = Math.PI / 2;
    damper.position.y = 0.8;
    group.add(damper);

    this.registerInteractiveGroup(group, info);
    return group;
  }

  // ==========================================
  // CAPA 2: LÓGICA DE NEGOCIO Y SERVICIOS (Y = +4)
  // ==========================================
  buildBusinessLayer(theme) {
    const info = LAYER_INFO.business;
    const group = new THREE.Group();
    group.name = 'Layer_Business';
    group.userData = { layerId: info.id, info, yBase: info.yBase };
    group.position.y = info.yBase;

    const { group: slabGroup } = this.createPlatformSlab(theme, info.color, 34, 1.2, 34);
    group.add(slabGroup);

    // 1. Central Core Processor (Matriz de Reglas de Negocio)
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 2.2, 0);

    const octGeo = new THREE.OctahedronGeometry(2.4, 1);
    const octMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.7,
      thickness: 1.5,
      transparent: true,
      opacity: 0.9,
      emissive: 0xd97706,
      emissiveIntensity: 0.3
    });
    const coreMesh = new THREE.Mesh(octGeo, octMat);
    coreGroup.add(coreMesh);

    // Gyroscopic gold rings around the core
    const ring1Geo = new THREE.TorusGeometry(3.2, 0.12, 12, 32);
    const ring1Mat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.95 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    coreGroup.add(ring1);

    const ring2 = ring1.clone();
    ring2.rotation.x = Math.PI / 3;
    coreGroup.add(ring2);

    this.animatedElements.push({
      type: 'business_core',
      core: coreMesh,
      ring1,
      ring2,
      speed: 1.0
    });
    group.add(coreGroup);

    // 2. Decision Gate: Rule Validations (Validar Cupos Disponibles)
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 1.2, -7);

    const gatePillarGeo = new THREE.BoxGeometry(0.8, 3.2, 0.8);
    const gatePillarMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const p1 = new THREE.Mesh(gatePillarGeo, gatePillarMat);
    p1.position.x = -2.5;
    const p2 = new THREE.Mesh(gatePillarGeo, gatePillarMat);
    p2.position.x = 2.5;
    gateGroup.add(p1, p2);

    // Scanner beam across the gate
    const beamGeo = new THREE.CylinderGeometry(0.1, 0.1, 5, 8);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.rotation.z = Math.PI / 2;
    beam.position.y = 1.0;
    gateGroup.add(beam);
    group.add(gateGroup);

    // 3. Lateral Rejection Chute (Rampa de Excepción 400 - Sin Cupo)
    const chuteGroup = new THREE.Group();
    chuteGroup.position.set(13, 0.4, 0);

    // Cantilevered ramp extending out to the side
    const rampGeo = new THREE.BoxGeometry(10, 0.6, 3.2);
    const rampMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.6,
      roughness: 0.3
    });
    const ramp = new THREE.Mesh(rampGeo, rampMat);
    ramp.rotation.z = -Math.PI / 16;
    chuteGroup.add(ramp);

    // Warning barrier & Rejector piston
    const pistonGeo = new THREE.CylinderGeometry(0.6, 0.6, 2.2, 16);
    const pistonMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.9 });
    const piston = new THREE.Mesh(pistonGeo, pistonMat);
    piston.rotation.z = Math.PI / 2;
    piston.position.set(-2, 1.2, 0);
    chuteGroup.add(piston);

    // Hazard beacon
    const beaconGeo = new THREE.SphereGeometry(0.4, 12, 12);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(4.5, 0.8, 0);
    chuteGroup.add(beacon);

    this.animatedElements.push({
      type: 'blink_beacon',
      mesh: beacon,
      rate: 1.2
    });
    group.add(chuteGroup);

    this.registerInteractiveGroup(group, info);
    return group;
  }

  // ==========================================
  // CAPA 1: PRESENTACIÓN Y CONTROLADOR (Y = +14)
  // ==========================================
  buildPresentationLayer(theme) {
    const info = LAYER_INFO.presentation;
    const group = new THREE.Group();
    group.name = 'Layer_Presentation';
    group.userData = { layerId: info.id, info, yBase: info.yBase };
    group.position.y = info.yBase;

    const { group: slabGroup } = this.createPlatformSlab(theme, info.color, 32, 1.0, 32);
    group.add(slabGroup);

    // 1. API Gateway Hexagonal Scanner Arch (Entrada de Peticiones)
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 1.0, 0);

    const archRingGeo = new THREE.TorusGeometry(4.2, 0.35, 12, 6); // Hexagonal torus
    const archRingMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      metalness: 0.9,
      roughness: 0.2
    });
    const archRing = new THREE.Mesh(archRingGeo, archRingMat);
    archRing.rotation.x = Math.PI / 2;
    archRing.position.y = 1.8;
    archGroup.add(archRing);

    // Laser barrier scanner in the arch
    const laserGridGeo = new THREE.PlaneGeometry(6, 6);
    const laserGridMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const laserPlane = new THREE.Mesh(laserGridGeo, laserGridMat);
    laserPlane.rotation.x = Math.PI / 2;
    laserPlane.position.y = 1.8;
    archGroup.add(laserPlane);

    this.animatedElements.push({
      type: 'rotate_arch',
      mesh: archRing,
      speed: 0.3
    });
    group.add(archGroup);

    // 2. Controller Routing Hubs (controlador/rutas.py)
    const controller1 = this.createControllerConsole('GET /reservas', [-8, 1.0, 0], 0x38bdf8);
    const controller2 = this.createControllerConsole('POST /reservas', [8, 1.0, 0], 0x818cf8);
    group.add(controller1);
    group.add(controller2);

    // 3. HTTP Status LED Bar (200, 201, 400, 500)
    const statusBarGroup = new THREE.Group();
    statusBarGroup.position.set(0, 1.2, 10);

    const barBoxGeo = new THREE.BoxGeometry(10, 1.0, 1.5);
    const barBoxMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    const barBox = new THREE.Mesh(barBoxGeo, barBoxMat);
    statusBarGroup.add(barBox);

    const statusCodes = [
      { code: '200 OK', color: 0x10b981 },
      { code: '201 Created', color: 0x34d399 },
      { code: '400 Bad Req', color: 0xf59e0b },
      { code: '500 Err', color: 0xef4444 }
    ];
    statusCodes.forEach((s, idx) => {
      const ledGeo = new THREE.BoxGeometry(1.6, 0.4, 0.5);
      const ledMat = new THREE.MeshBasicMaterial({ color: s.color });
      const ledMesh = new THREE.Mesh(ledGeo, ledMat);
      ledMesh.position.set(-3.6 + idx * 2.4, 0.5, 0.4);
      statusBarGroup.add(ledMesh);
    });
    group.add(statusBarGroup);

    this.registerInteractiveGroup(group, info);
    return group;
  }

  createControllerConsole(label, pos, color) {
    const g = new THREE.Group();
    g.position.set(...pos);

    const bodyGeo = new THREE.BoxGeometry(3.5, 2.0, 3.5);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    g.add(body);

    const screenGeo = new THREE.PlaneGeometry(2.4, 1.4);
    const screenMat = new THREE.MeshBasicMaterial({ color: color });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0.3, 1.76);
    g.add(screen);

    return g;
  }

  // ==========================================
  // CAPA 0: CLIENTES Y CONSUMIDORES (Y = +24)
  // ==========================================
  buildClientLayer(theme) {
    const info = LAYER_INFO.client;
    const group = new THREE.Group();
    group.name = 'Layer_Client';
    group.userData = { layerId: info.id, info, yBase: info.yBase };
    group.position.y = info.yBase;

    const { group: slabGroup } = this.createPlatformSlab(theme, info.color, 30, 0.9, 30);
    group.add(slabGroup);

    // 1. Laptop Workstation Model
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(-6, 0.6, -2);

    // Laptop base
    const lBaseGeo = new THREE.BoxGeometry(3.6, 0.15, 2.6);
    const lMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const lBase = new THREE.Mesh(lBaseGeo, lMat);
    laptopGroup.add(lBase);

    // Laptop screen open at 110 deg
    const lScreenGeo = new THREE.BoxGeometry(3.6, 2.4, 0.12);
    const lScreen = new THREE.Mesh(lScreenGeo, lMat);
    lScreen.position.set(0, 1.1, -1.2);
    lScreen.rotation.x = -Math.PI / 14;
    laptopGroup.add(lScreen);

    // Glowing display
    const lDispGeo = new THREE.PlaneGeometry(3.2, 2.0);
    const lDispMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const lDisp = new THREE.Mesh(lDispGeo, lDispMat);
    lDisp.position.set(0, 1.1, -1.13);
    lDisp.rotation.x = -Math.PI / 14;
    laptopGroup.add(lDisp);

    group.add(laptopGroup);

    // 2. Mobile Smartphone Device Model
    const phoneGroup = new THREE.Group();
    phoneGroup.position.set(6, 0.6, -2);

    const phoneGeo = new THREE.BoxGeometry(1.6, 0.12, 3.2);
    const phoneMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    const phone = new THREE.Mesh(phoneGeo, phoneMat);
    phoneGroup.add(phone);

    const pScreenGeo = new THREE.PlaneGeometry(1.4, 2.8);
    const pScreenMat = new THREE.MeshBasicMaterial({ color: 0x818cf8 });
    const pScreen = new THREE.Mesh(pScreenGeo, pScreenMat);
    pScreen.rotation.x = -Math.PI / 2;
    pScreen.position.y = 0.08;
    phoneGroup.add(pScreen);

    group.add(phoneGroup);

    // 3. Central Emitter / Antenna Tower
    const antennaGroup = new THREE.Group();
    antennaGroup.position.set(0, 0.6, 5);

    const mastGeo = new THREE.CylinderGeometry(0.3, 0.5, 3.5, 12);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.y = 1.75;
    antennaGroup.add(mast);

    const emitterGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const emitterMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const emitter = new THREE.Mesh(emitterGeo, emitterMat);
    emitter.position.y = 3.6;
    antennaGroup.add(emitter);

    // Pulsing broadcast rings
    const bRingGeo = new THREE.RingGeometry(0.8, 1.1, 24);
    const bRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const bRing = new THREE.Mesh(bRingGeo, bRingMat);
    bRing.rotation.x = Math.PI / 2;
    bRing.position.y = 3.6;
    antennaGroup.add(bRing);

    this.animatedElements.push({
      type: 'broadcast_ring',
      mesh: bRing,
      speed: 2.0
    });
    group.add(antennaGroup);

    this.registerInteractiveGroup(group, info);
    return group;
  }

  // --- Register interactive click target ---
  registerInteractiveGroup(group, info) {
    group.traverse(child => {
      if (child.isMesh) {
        child.userData = { layerId: info.id, info, parentGroup: group };
        this.interactiveObjects.push(child);
        this.allMeshes.push(child);
      }
    });
  }

  // --- Exploded View Interpolation ---
  setExplosionFactor(factor) {
    this.explosionFactor = Math.max(0, Math.min(1, factor));
    const maxExpansion = 16; // extra vertical gap per tier

    const tiers = ['database', 'repository', 'business', 'presentation', 'client'];
    tiers.forEach((id, index) => {
      const group = this.layerGroups[id];
      if (group) {
        // Multiplier centered around middle tier (business at index 2)
        const offsetMultiplier = index - 2;
        const targetY = group.userData.yBase + offsetMultiplier * (this.explosionFactor * maxExpansion);
        group.position.y = targetY;
      }
    });

    // Scale central conduit to stretch
    if (this.centralConduitGroup) {
      const scaleY = 1 + this.explosionFactor * 0.9;
      this.centralConduitGroup.scale.set(1, scaleY, 1);
    }
  }

  // --- Update Materials on Theme Switch ---
  updateThemeMaterials(theme) {
    if (this.gridHelper) {
      this.gridHelper.material.color.setHex(theme.gridColor1);
    }

    // Refresh platform slabs
    Object.keys(this.layerGroups).forEach(id => {
      const group = this.layerGroups[id];
      group.traverse(child => {
        if (child.isMesh && child.material && child.geometry.type === 'BoxGeometry') {
          if (child.parent && child.parent.name.startsWith('PlatformSlab')) {
            child.material.color.setHex(theme.platform.color);
            child.material.roughness = theme.platform.roughness;
            child.material.metalness = theme.platform.metalness;
          }
        }
      });
    });
  }

  // --- Frame Loop Animations ---
  animate(delta, elapsed) {
    this.animatedElements.forEach(item => {
      switch (item.type) {
        case 'db_disks':
          item.platters.forEach(p => { p.rotation.y += delta * item.speed; });
          item.armPivot.rotation.y = Math.sin(elapsed * 3) * 0.25;
          break;

        case 'rotate_drum':
          item.mesh.rotation.y += delta * item.speed;
          break;

        case 'business_core':
          item.core.rotation.y += delta * item.speed * 0.6;
          item.core.rotation.x = Math.sin(elapsed * 1.5) * 0.2;
          item.ring1.rotation.z += delta * 1.2;
          item.ring2.rotation.y -= delta * 0.9;
          break;

        case 'rotate_arch':
          item.mesh.rotation.z += delta * item.speed;
          break;

        case 'blink_beacon':
          item.mesh.material.opacity = 0.4 + Math.sin(elapsed * 8) * 0.6;
          break;

        case 'blink_led':
          item.mesh.visible = Math.sin(elapsed * (item.rate * 10)) > 0;
          break;

        case 'ring_pulse':
          const scale = 1 + Math.sin(elapsed * 3 + item.offset) * 0.15;
          item.mesh.scale.set(scale, scale, 1);
          break;

        case 'broadcast_ring':
          const s = 1 + ((elapsed * item.speed) % 2.5);
          item.mesh.scale.set(s, s, 1);
          item.mesh.material.opacity = Math.max(0, 1 - (s - 1) / 2.5);
          break;
      }
    });
  }
}
