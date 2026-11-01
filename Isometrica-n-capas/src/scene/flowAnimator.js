import * as THREE from 'three';

export const SIMULATION_TYPES = {
  GET_QUERY: {
    id: 'GET_QUERY',
    name: 'GET /api/reservas (Lectura Exitosa - 200 OK)',
    badge: 'Consulta',
    color: '#38bdf8',
    payload: {
      action: 'LIST_ALL',
      headers: { Authorization: 'Bearer eyJhbGciOi...' },
      params: { status: 'confirmada' }
    },
    steps: [
      {
        layer: 'client',
        title: '1. Emisión de Solicitud de Consulta',
        detail: 'El navegador del usuario o cliente móvil envía una solicitud HTTP GET a la ruta /api/reservas.',
        log: 'Cliente -> HTTP GET /api/reservas (Accept: application/json)',
        progress: 0.05
      },
      {
        layer: 'presentation',
        title: '2. Enrutamiento & Deserialización',
        detail: 'El controlador (controlador/rutas.py) recibe la petición, valida los headers y delega al servicio de reservas.',
        log: 'Presentación -> Delegando a servicio_reservas.obtener_todas()',
        progress: 0.2
      },
      {
        layer: 'business',
        title: '3. Coordinación de Regla de Negocio',
        detail: 'El servicio de negocio (servicio/reservas.py) aplica reglas de visibilidad y solicita los datos al repositorio.',
        log: 'Negocio -> Coordinando consulta hacia el Repositorio',
        progress: 0.38
      },
      {
        layer: 'repository',
        title: '4. Generación de Consulta & Acceso a Datos',
        detail: 'El repositorio (repositorio/memoria.py) traduce la solicitud en una consulta compatible con el motor de persistencia.',
        log: 'Repositorio -> SELECT * FROM reservas WHERE estado = ?',
        progress: 0.55
      },
      {
        layer: 'database',
        title: '5. Lectura Física en Almacenamiento',
        detail: 'La base de datos busca en sus índices, lee los bloques de disco magnético o memoria RAM y devuelve el set de registros.',
        log: 'Base de Datos -> 42 registros leídos del disco (I/O: 1.2ms)',
        progress: 0.65
      },
      {
        layer: 'repository',
        title: '6. Mapeo a Entidades de Dominio (Data Mapper)',
        detail: 'El repositorio transforma las tuplas de base de datos en instancias de la clase de dominio Reserva.',
        log: 'Repositorio -> Mapeando tuplas SQL a objetos [Reserva]',
        progress: 0.78
      },
      {
        layer: 'business',
        title: '7. Procesamiento y Filtros de Dominio',
        detail: 'El servicio valida que los objetos cumplan las políticas de seguridad antes de retornar al controlador.',
        log: 'Negocio -> Colección validada. Retornando a controlador.',
        progress: 0.88
      },
      {
        layer: 'presentation',
        title: '8. Serialización de Respuesta HTTP',
        detail: 'El controlador convierte la lista de reservas a formato JSON y asigna el código HTTP 200 OK.',
        log: 'Presentación -> HTTP 200 OK (Content-Type: application/json)',
        progress: 0.95
      },
      {
        layer: 'client',
        title: '9. Renderizado en Cliente',
        detail: 'El cliente recibe el JSON con éxito y actualiza la interfaz de usuario para el usuario final.',
        log: 'Cliente -> JSON recibido con éxito. Renderizado completado.',
        progress: 1.0
      }
    ]
  },

  POST_SUCCESS: {
    id: 'POST_SUCCESS',
    name: 'POST /api/reservas (Creación Exitosa - 201 Created)',
    badge: 'Comando',
    color: '#10b981',
    payload: {
      action: 'CREATE_RESERVATION',
      body: { nombre: 'María Quispe', personas: 2, fecha: '2026-10-20' }
    },
    steps: [
      {
        layer: 'client',
        title: '1. Envío de Formulario / Payload',
        detail: 'El usuario presiona "Reservar Mesa". El cliente serializa el formulario y emite un POST con datos JSON.',
        log: 'Cliente -> POST /api/reservas {"nombre":"María Quispe","personas":2}',
        progress: 0.05
      },
      {
        layer: 'presentation',
        title: '2. Validación Sintáctica de Entrada',
        detail: 'El controlador valida campos obligatorios no nulos y tipos de datos numéricos. ¡No valida cupos aún!',
        log: 'Presentación -> Sintaxis JSON válida. Despachando a servicio.',
        progress: 0.2
      },
      {
        layer: 'business',
        title: '3. Verificación de Regla de Negocio (¡Cupo OK!)',
        detail: 'El servicio evalúa: ¿Quedan cupos disponibles en el local? La regla se cumple favorablemente (Cupos > 0).',
        log: 'Negocio -> Regla: "cupos_disponibles >= 2" -> APROBADO (quedan 6).',
        progress: 0.38
      },
      {
        layer: 'repository',
        title: '4. Construcción de Sentencia de Inserción',
        detail: 'El repositorio crea el objeto de persistencia y prepara la transacción de inserción.',
        log: 'Repositorio -> Preparando INSERT INTO reservas (cliente, cupos)...',
        progress: 0.55
      },
      {
        layer: 'database',
        title: '5. Escritura Persistente en Disco & WAL',
        detail: 'La base de datos graba el registro en las tablas y actualiza el log de transacciones WAL con confirmación ACID.',
        log: 'Base de Datos -> COMMIT TRANSACTION (ID: 10842). Registro guardado.',
        progress: 0.65
      },
      {
        layer: 'repository',
        title: '6. Asignación de Identificador Generado',
        detail: 'El repositorio vincula el ID autogenerado (#10842) al objeto de negocio.',
        log: 'Repositorio -> Entidad persistida con ID asignado.',
        progress: 0.78
      },
      {
        layer: 'business',
        title: '7. Descuento de Cupos en Memoria de Negocio',
        detail: 'El servicio actualiza el estado del cupo global y confirma la creación del recurso.',
        log: 'Negocio -> Cupos actualizados. Confirmación generada.',
        progress: 0.88
      },
      {
        layer: 'presentation',
        title: '8. Respuesta HTTP 201 Created',
        detail: 'El controlador adjunta el header Location y retorna HTTP 201 Created con el recurso recién generado.',
        log: 'Presentación -> HTTP 201 Created (Location: /api/reservas/10842)',
        progress: 0.95
      },
      {
        layer: 'client',
        title: '9. Confirmación Visual al Usuario',
        detail: 'La interfaz muestra un toast verde: "¡Reserva #10842 confirmada exitosamente!".',
        log: 'Cliente -> Notificación de confirmación mostrada en UI.',
        progress: 1.0
      }
    ]
  },

  POST_REJECTED: {
    id: 'POST_REJECTED',
    name: 'POST /api/reservas (Rechazo por Negocio - 400 Bad Request)',
    badge: 'Excepción de Negocio',
    color: '#ef4444',
    payload: {
      action: 'CREATE_RESERVATION',
      body: { nombre: 'Carlos Ramos', personas: 15, fecha: '2026-10-20' }
    },
    steps: [
      {
        layer: 'client',
        title: '1. Petición con Parámetros que Exceden Reglas',
        detail: 'El cliente solicita una reserva para 15 personas cuando la capacidad máxima permitida o disponible es 4.',
        log: 'Cliente -> POST /api/reservas {"personas": 15}',
        progress: 0.05
      },
      {
        layer: 'presentation',
        title: '2. Validación de Formato Aprobada',
        detail: 'El controlador constata que el JSON está bien estructurado y delega al servicio. El controlador ignora las reglas de negocio.',
        log: 'Presentación -> Formato OK. Delegando a servicio_reservas.crear(...)',
        progress: 0.25
      },
      {
        layer: 'business',
        title: '3. ¡Infracción de Regla de Negocio Detectada!',
        detail: 'El servicio ejecuta: if personas > cupos_disponibles: raise ReglaNegocioException("No hay cupos suficientes").',
        log: 'Negocio -> ¡ALERTA! Regla violada: Solicitados 15, Disponibles 4.',
        progress: 0.45
      },
      {
        layer: 'business',
        title: '4. Expulsión por Rampa de Excepción',
        detail: '¡El flujo se interrumpe de inmediato! El paquete es desviado a la rampa lateral de rechazo. ¡Las Capas 3 (Repo) y 4 (BD) nunca son tocadas!',
        log: 'Negocio -> Rampa de Excepción activada. Persistencia protegida.',
        progress: 0.65
      },
      {
        layer: 'presentation',
        title: '5. Mapeo de Excepción de Negocio a HTTP 400',
        detail: 'El controlador captura la excepción de dominio y la traduce a un código de cliente HTTP 400 Bad Request con mensaje descriptivo.',
        log: 'Presentación -> HTTP 400 Bad Request: {"error": "Cupos insuficientes"}',
        progress: 0.85
      },
      {
        layer: 'client',
        title: '6. Notificación de Error al Usuario',
        detail: 'El cliente recibe el error 400 y muestra una advertencia en pantalla para que el usuario elija otra fecha o reduzca invitados.',
        log: 'Cliente -> Error 400 procesado. Base de datos 100% intacta.',
        progress: 1.0
      }
    ]
  }
};

export class FlowAnimator {
  constructor(scene, layersBuilder) {
    this.scene = scene;
    this.layersBuilder = layersBuilder;

    this.currentSimulationType = 'GET_QUERY';
    this.isPlaying = false;
    this.speed = 1.0;
    this.progress = 0; // 0 to 1
    this.listeners = [];

    // Create 3D Packet Mesh
    this.createPacket();

    // Create particle trail
    this.createTrail();
  }

  createPacket() {
    this.packetGroup = new THREE.Group();
    this.packetGroup.name = 'DataPacket';

    // Glowing core sphere
    const coreGeo = new THREE.SphereGeometry(0.8, 16, 16);
    this.packetMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x00d2ff,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9
    });
    this.packetCore = new THREE.Mesh(coreGeo, this.packetMat);
    this.packetGroup.add(this.packetCore);

    // Orbiting data bit rings
    const ringGeo = new THREE.TorusGeometry(1.2, 0.08, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    this.pRing1 = new THREE.Mesh(ringGeo, ringMat);
    this.pRing2 = new THREE.Mesh(ringGeo, ringMat);
    this.pRing2.rotation.x = Math.PI / 2;
    this.packetGroup.add(this.pRing1, this.pRing2);

    // Point light radiating from packet
    this.packetLight = new THREE.PointLight(0x00f0ff, 2.5, 12);
    this.packetGroup.add(this.packetLight);

    this.packetGroup.visible = false;
    this.scene.add(this.packetGroup);
  }

  createTrail() {
    this.trailPoints = [];
    this.maxTrail = 18;
    this.trailMeshes = [];

    const trailGeo = new THREE.SphereGeometry(0.35, 8, 8);
    for (let i = 0; i < this.maxTrail; i++) {
      const trailMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: (1 - i / this.maxTrail) * 0.6
      });
      const tMesh = new THREE.Mesh(trailGeo, trailMat);
      tMesh.visible = false;
      this.scene.add(tMesh);
      this.trailMeshes.push(tMesh);
    }
  }

  setSimulationType(typeKey) {
    if (!SIMULATION_TYPES[typeKey]) return;
    this.currentSimulationType = typeKey;
    this.reset();
  }

  start() {
    this.isPlaying = true;
    this.packetGroup.visible = true;
    this.notifyState();
  }

  pause() {
    this.isPlaying = false;
    this.notifyState();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.start();
    }
  }

  reset() {
    this.progress = 0;
    this.trailPoints = [];
    this.trailMeshes.forEach(m => { m.visible = false; });
    this.updatePacketPosition(0);
    this.notifyState();
  }

  setSpeed(speedVal) {
    this.speed = speedVal;
  }

  seek(progressVal) {
    this.progress = Math.max(0, Math.min(1, progressVal));
    this.updatePacketPosition(this.progress);
    this.notifyState();
  }

  onStateChange(fn) {
    this.listeners.push(fn);
  }

  notifyState() {
    const sim = SIMULATION_TYPES[this.currentSimulationType];
    const currentStep = this.getCurrentStep();
    this.listeners.forEach(fn => fn({
      sim,
      isPlaying: this.isPlaying,
      progress: this.progress,
      currentStep,
      speed: this.speed
    }));
  }

  getCurrentStep() {
    const sim = SIMULATION_TYPES[this.currentSimulationType];
    const steps = sim.steps;
    for (let i = steps.length - 1; i >= 0; i--) {
      if (this.progress >= steps[i].progress) {
        return { step: steps[i], index: i, total: steps.length };
      }
    }
    return { step: steps[0], index: 0, total: steps.length };
  }

  // Calculate packet 3D position along the architectural route
  getRoutePosition(t) {
    // Current layer group Y coordinates (accounts for exploded view!)
    const lClientY = this.layersBuilder.layerGroups.client.position.y + 1.2;
    const lPresY = this.layersBuilder.layerGroups.presentation.position.y + 1.2;
    const lBizY = this.layersBuilder.layerGroups.business.position.y + 1.2;
    const lRepoY = this.layersBuilder.layerGroups.repository.position.y + 1.2;
    const lDbY = this.layersBuilder.layerGroups.database.position.y + 1.2;

    const simType = this.currentSimulationType;

    if (simType === 'POST_REJECTED') {
      // Rejection trajectory:
      // 0.0 -> 0.25: Client (Y client) down to Presentation (Y pres)
      // 0.25 -> 0.45: Presentation down to Business core (Y biz)
      // 0.45 -> 0.65: Business Core deflected out to lateral rejection ramp (X = 13, Y = biz + 0.4)
      // 0.65 -> 0.85: Ascends from ramp back up to Presentation (Y pres, X returns to 0)
      // 0.85 -> 1.0: Presentation back up to Client (Y client)
      if (t < 0.25) {
        const localT = t / 0.25;
        const y = THREE.MathUtils.lerp(lClientY, lPresY, localT);
        return new THREE.Vector3(0, y, 0);
      } else if (t < 0.45) {
        const localT = (t - 0.25) / 0.2;
        const y = THREE.MathUtils.lerp(lPresY, lBizY, localT);
        return new THREE.Vector3(0, y, 0);
      } else if (t < 0.65) {
        const localT = (t - 0.45) / 0.2;
        // Travel down to chute
        const x = THREE.MathUtils.lerp(0, 13, localT);
        const y = THREE.MathUtils.lerp(lBizY, lBizY - 0.5, localT);
        return new THREE.Vector3(x, y, 0);
      } else if (t < 0.85) {
        const localT = (t - 0.65) / 0.2;
        // Ascends back up to Presentation
        const x = THREE.MathUtils.lerp(13, 0, localT);
        const y = THREE.MathUtils.lerp(lBizY - 0.5, lPresY, localT);
        return new THREE.Vector3(x, y, 0);
      } else {
        const localT = (t - 0.85) / 0.15;
        const y = THREE.MathUtils.lerp(lPresY, lClientY, localT);
        return new THREE.Vector3(0, y, 0);
      }
    } else {
      // Full descent and ascent (GET_QUERY or POST_SUCCESS):
      // 0.0 -> 0.5: Descent: Client -> Presentation -> Business -> Repository -> Database
      // 0.5 -> 1.0: Ascent: Database -> Repository -> Business -> Presentation -> Client
      if (t <= 0.5) {
        const localT = t / 0.5;
        // Path through 5 nodes
        let y;
        if (localT < 0.25) {
          y = THREE.MathUtils.lerp(lClientY, lPresY, localT / 0.25);
        } else if (localT < 0.5) {
          y = THREE.MathUtils.lerp(lPresY, lBizY, (localT - 0.25) / 0.25);
        } else if (localT < 0.75) {
          y = THREE.MathUtils.lerp(lBizY, lRepoY, (localT - 0.5) / 0.25);
        } else {
          y = THREE.MathUtils.lerp(lRepoY, lDbY, (localT - 0.75) / 0.25);
        }
        return new THREE.Vector3(0, y, 0);
      } else {
        const localT = (t - 0.5) / 0.5;
        // Ascent
        let y;
        if (localT < 0.25) {
          y = THREE.MathUtils.lerp(lDbY, lRepoY, localT / 0.25);
        } else if (localT < 0.5) {
          y = THREE.MathUtils.lerp(lRepoY, lBizY, (localT - 0.25) / 0.25);
        } else if (localT < 0.75) {
          y = THREE.MathUtils.lerp(lBizY, lPresY, (localT - 0.5) / 0.25);
        } else {
          y = THREE.MathUtils.lerp(lPresY, lClientY, (localT - 0.75) / 0.25);
        }
        return new THREE.Vector3(0, y, 0);
      }
    }
  }

  updatePacketPosition(t) {
    const pos = this.getRoutePosition(t);
    this.packetGroup.position.copy(pos);

    // Dynamic color based on simulation state
    const sim = SIMULATION_TYPES[this.currentSimulationType];
    let colorHex = sim.color;
    if (this.currentSimulationType === 'POST_REJECTED' && t >= 0.45) {
      colorHex = '#ef4444'; // Red alarm for rejection
    } else if (t > 0.5 && this.currentSimulationType === 'POST_SUCCESS') {
      colorHex = '#10b981'; // Green confirmation
    }

    this.packetMat.color.setStyle(colorHex);
    this.packetMat.emissive.setStyle(colorHex);
    this.packetLight.color.setStyle(colorHex);

    // Update trail
    this.trailPoints.unshift(pos.clone());
    if (this.trailPoints.length > this.maxTrail) {
      this.trailPoints.pop();
    }

    this.trailMeshes.forEach((mesh, i) => {
      if (i < this.trailPoints.length) {
        mesh.position.copy(this.trailPoints[i]);
        mesh.visible = true;
        mesh.material.color.setStyle(colorHex);
      } else {
        mesh.visible = false;
      }
    });
  }

  update(delta, elapsed) {
    if (this.isPlaying) {
      // Advance progress
      const cycleDuration = 10; // seconds for complete journey
      this.progress += (delta * this.speed) / cycleDuration;

      if (this.progress >= 1.0) {
        this.progress = 1.0;
        this.isPlaying = false;
        this.notifyState();
      }

      this.updatePacketPosition(this.progress);
      this.notifyState();
    }

    // Packet spin animation
    if (this.packetGroup.visible) {
      this.pRing1.rotation.y += delta * 4;
      this.pRing2.rotation.z += delta * 3;
    }
  }
}
