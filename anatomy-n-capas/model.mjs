// Kinematic and Architectural State Model for N-Tier Machine

export const SCENARIOS = {
  "200_OK": {
    id: "200_OK",
    name: "200 OK · Reserva Exitosa",
    code: "200 OK",
    description: "Flujo completo de 4 capas: Validación de entrada -> Regla de negocio aprobada (cupos - 1) -> Mapeo en Repositorio -> Escritura en Base de Datos.",
    color: "var(--anatomy-green, #6be0a0)",
    steps: [
      { t: 0.15, layer: 4, name: "Controlador", detail: "Payload recibido: {cliente, fecha}. Validación sintáctica OK." },
      { t: 0.40, layer: 3, name: "Servicio / Negocio", detail: "Regla verificada: Cupos disponibles > 0. Cupo reservado (-1)." },
      { t: 0.65, layer: 2, name: "Repositorio", detail: "Traducción DTO <-> Entidad. Consulta de guardado generada." },
      { t: 0.85, layer: 1, name: "Persistencia / BD", detail: "Transacción persistida en memoria/disco. WAL sincronizado." },
      { t: 1.00, layer: 4, name: "Controlador", detail: "Respuesta 200 enviada con confirmación de reserva." },
    ],
  },
  "400_REJECT": {
    id: "400_REJECT",
    name: "400 Bad Request · Sin Cupos (Regla Negocio)",
    code: "400 Bad Request",
    description: "Rechazo por regla pura de negocio: La Capa de Servicio evalúa que no quedan cupos y expulsa la solicitud por el bypass. ¡El Repositorio y la BD quedan 100% intactos!",
    color: "var(--anatomy-red, #ff6b6b)",
    steps: [
      { t: 0.20, layer: 4, name: "Controlador", detail: "Entrada sintácticamente válida. Delegación inmediata a Servicio." },
      { t: 0.50, layer: 3, name: "Servicio / Negocio", detail: "VIOLACIÓN DE REGLA: Cupos = 0. Balanza desbalanceada, compuerta de rechazo activada." },
      { t: 0.75, layer: 3, name: "Bypass Lateral", detail: "Muestra expulsada por rampa de descarte. Repositorio y BD NO ejecutados." },
      { t: 1.00, layer: 4, name: "Controlador", detail: "Respuesta 400 Bad Request enviada: 'No quedan cupos'." },
    ],
  },
  "422_INVALID": {
    id: "422_INVALID",
    name: "422 Unprocessable · Parámetros Inválidos",
    code: "422 Unprocessable",
    description: "Error de formato capturado en la Capa de Presentación/Controlador (ej. nombre vacío o formato inválido). La petición no llega a tocar el Servicio ni los datos.",
    color: "var(--anatomy-red, #ff6b6b)",
    steps: [
      { t: 0.30, layer: 4, name: "Controlador", detail: "Error de validación sintáctica: nombre vacío o tipo inválido." },
      { t: 0.60, layer: 4, name: "Controlador", detail: "Petición bloqueada en la tolva de entrada. No se invoca a Capa 3." },
      { t: 1.00, layer: 4, name: "Controlador", detail: "Respuesta 422: Parámetros requeridos no suministrados." },
    ],
  },
};

export const LAYER_INFO = {
  1: {
    title: "Capa 1: Persistencia & Base de Datos",
    subtitle: "Storage Engine & Data Store",
    desc: "Almacenamiento permanente en memoria, archivo o SQL/NoSQL. El cabezal electromecánico y el tambor magnético registran los bloques confirmados. Solo es invocada por el Repositorio.",
    fileRef: "repositorio/memoria.py · app.py",
  },
  2: {
    title: "Capa 2: Repositorio (Acceso a Datos)",
    subtitle: "Data Mapper & Repository Pattern",
    desc: "Aísla y desacopla la lógica de negocio de los detalles de infraestructura. El tambor de levas helicoidales mapea las Entidades a registros de almacenamiento físico mediante interfaces.",
    fileRef: "repositorio/memoria.py",
  },
  3: {
    title: "Capa 3: Lógica de Negocio / Servicio",
    subtitle: "Use Case & Domain Logic",
    desc: "Núcleo puro de la aplicación. Aplica políticas y reglas de negocio (ej. 'si cupos > 0'). Totalmente desacoplada: puede probarse sin Flask, sin HTTP y con repositorios simulados/mock.",
    fileRef: "servicio/reservas.py · tests/test_app.py",
  },
  4: {
    title: "Capa 4: Presentación & Controlador",
    subtitle: "HTTP API & Request Routing",
    desc: "Frontera con el mundo exterior. Deserializa JSON/HTTP, valida formato inicial, despacha al Servicio y retorna códigos HTTP (200, 400, 422). No contiene reglas de negocio.",
    fileRef: "controlador/rutas.py · vista/pagina.py",
  },
};
