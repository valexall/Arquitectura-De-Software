# Torre Isométrica 3D — Arquitectura de Software en N-Capas
**Universidad Nacional Micaela Bastidas de Apurímac (UNAMBA)**  
*Escuela Profesional de Ingeniería Informática y Sistemas — AIS-86 (Arquitectura del Software)*

---

## 🌟 Descripción General

Este proyecto es una aplicación web interactiva en 3D basada en **Three.js** que renderiza una **Torre Isométrica de Arquitectura en N-Capas**. Modela con precisión física y geométrica el flujo de peticiones (`Request`) y respuestas (`Response`) a través de las 5 capas estándar de la ingeniería de software:

1. **Capa 0: Clientes y Consumidores** (Dispositivos, Navegadores, APIs externas).
2. **Capa 1: Presentación y Controladores** (Enrutamiento, Deserialización HTTP, Validación de Sintaxis).
3. **Capa 2: Lógica de Negocio y Servicios** (Validación de Reglas de Dominio, Independencia Web, Rampa de Excepciones).
4. **Capa 3: Repositorio y Acceso a Datos — DAL** (Desacoplamiento, Data Mapper, Consultas).
5. **Capa 4: Base de Datos y Persistencia** (Platos Magnéticos, Bóveda de Almacenamiento, Registros WAL).

Alineado directamente con la práctica de laboratorio del curso: [`ais86-semana05-mvc-refactor`](file:///c:/Users/richa/Desktop/UNAMBA/SEMESTRES/SEMESTRE%20VIII/ARQUITECTURA%20DEL%20SOFTWARE/Codigo/ais86-semana05-mvc-refactor/).

---

## 🎨 Opciones de Escenario (¿Qué tipo de escenario elegir?)

La aplicación incluye un **Selector de Escenarios en Tiempo Real** accesible desde el botón superior `🎨 Escenarios 3D` y el dock inferior. Puedes alternar libremente entre **4 tipos de escenarios**:

| Escenario | Metáfora Visual | Paleta de Colores & Materiales | Ideal Para |
| :--- | :--- | :--- | :--- |
| **1. Cyber-Grid Quantum (Sci-Fi)** *(Por defecto)* | **Ciberespacio & Nube Cuántica**: Plataformas de obsidiana translúcida suspendidas en el vacío espacial, rejilla de datos lumínica infinita, haces de fotones y anillos de energía cian/violeta. | Obsidiana `#0e172a`, Neón Cian `#00f0ff`, Magenta `#ff007f`, Azul Profundo `#060913`. | Comprender arquitecturas modernas en la nube, microservicios y sistemas reactivos. |
| **2. Minimal Clean Studio (Glassmorphism)** | **Estudio Arquitectónico / Apple Lab**: Losas de vidrio templado esmerilado con refracción física, metales pulidos (aluminio mate, titanio, oro suave), iluminación suave de estudio y sombras difusas. | Grafito mate `#1e293b`, Vidrio esmerilado, Oro champagne `#fbbf24`, Esmeralda `#34d399`. | Presentaciones académicas formales, defensas de tesis y reportes ejecutivos. |
| **3. Industrial Data Plant (Mecatrónica)** | **Planta Industrial / Centro de Cómputo Pesado**: Vigas de acero estructural fundido, latón bruñido, cilindros neumáticos con pistones de validación, franjas de advertencia y luces ámbar. | Hierro fundido `#242628`, Latón `#d97706`, Franjas de advertencia amarillo/negro, Luces ámbar `#ffaa44`. | Demostrar la robustez física de sistemas monolíticos y tolerancia a fallos. |
| **4. Holographic CAD Blueprint (Técnico)** | **Matriz Holográfica de Ingeniería**: Malla alámbrica técnica (wireframe) sobre plano cartesiano milimétrico en azul cobalto, simulando un escáner de telemetría de software. | Azul Cobalto `#030b1e`, Mallas vectoriales `#38bdf8`, Acentos técnicos en cian brillante. | Auditorías de arquitectura, verificación de acoplamiento y diagramación UML/C4. |

---

## 🚀 Cómo Ejecutar la Aplicación

### Modo Desarrollo (Vite HMR):
```bash
cd "Isometrica-n-capas"
npm run dev
```
Abre la URL proporcionada (generalmente `http://localhost:5173`) en tu navegador.

### Modo Vista Previa de Producción:
```bash
npm run build
npm run preview
```

---

## 📐 Correspondencia Mecánica 3D y Código del Proyecto

Cada capa de la torre isométrica cuenta con elementos 3D tangibles que representan su rol arquitectónico y se mapean con los archivos del proyecto universitario:

```
┌─────────────────────────────────────────────────────────────┐
│ NIVEL 4: CLIENTES & CONSUMIDORES (Y = +24)                  │
│ [Laptop 3D] [Smartphone 3D] [Antena Emisora de Paquetes]    │
│ Mapeo: templates/ (Navegador, Postman, cliente HTTP)        │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Petición HTTP / Request)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ NIVEL 3: PRESENTACIÓN & CONTROLADORES (Y = +14)              │
│ [Arco Gateway Hexagonal] [Nodos Dispatcher] [LEDs HTTP Bar] │
│ Mapeo: controlador/rutas.py                                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Llamada al Caso de Uso)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ NIVEL 2: LÓGICA DE NEGOCIO & SERVICIOS (Y = +4)             │
│ [Núcleo Cristalino Giroscópico] [Rampa de Excepción 400]    │
│ Mapeo: servicio/reservas.py                                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Si reglas OK: continúa hacia abajo)
                               ▼ (Si falla regla: expulsado por la rampa roja)
┌─────────────────────────────────────────────────────────────┐
│ NIVEL 1: REPOSITORIOS / ACCESO A DATOS (Y = -6)             │
│ [Tambor de Levas Data Mapper] [Diales SELECT/INSERT/UPDATE] │
│ Mapeo: repositorio/memoria.py                                │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Persistencia física)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ NIVEL 0: BASE DE DATOS & PERSISTENCIA (Y = -16)             │
│ [Platos Magnéticos Giratorios] [Cache Redis] [Monolito WAL] │
│ Mapeo: modelo/entidad.py & Motor de BD                       │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Flujos de Simulación Disponibles

1. **`GET /api/reservas` (Lectura Exitosa - 200 OK)**:
   - El paquete desciende desde el Cliente hasta los discos magnéticos de la Base de Datos.
   - La base de datos lee los bloques, asciende por el Repositorio (donde se transforman tuplas SQL en Entidades `Reserva`), pasa por el Servicio de Negocio y el Controlador empaqueta el JSON para el Cliente.

2. **`POST /api/reservas` (Creación Exitosa - 201 Created)**:
   - El payload desciende validado por el Controlador.
   - En la Capa de Negocio se evalúa la regla de cupos: `cupos_disponibles >= solicitados` (Aprobado).
   - El Repositorio genera el `INSERT`, los platos magnéticos escriben el registro y confirman la transacción con HTTP 201.

3. **`POST /api/reservas` (Rechazo de Regla de Negocio - 400 Bad Request)**:
   - El cliente envía una reserva que supera la capacidad (ej. 15 personas).
   - El Controlador valida la sintaxis (es un JSON válido) y delega al Servicio.
   - **¡El núcleo de negocio detecta la infracción!**: Se dispara la rampa lateral de excepción roja.
   - El paquete retorna como `400 Bad Request` hacia el cliente.
   - **¡Demostración visual clave!**: Las capas de **Repositorio** y **Base de Datos** permanecen completamente inmóviles e intactas, protegiendo los recursos de almacenamiento.

---

## 🕹️ Funcionalidades Interactivas

- **Proyección Isométrica Verdadera**: Cámara ortográfica orientada en los ángulos canónicos isométricos (35.264° de inclinación y 45° de rotación).
- **Vista Explosionada (Exploded View)**: Deslizador dinámico que separa verticalmente las losas para inspeccionar el interior y los conductos de datos.
- **Raycasting e Inspector de Capas**: Haz clic en cualquier parte de la torre para enfocar la cámara y abrir el panel con sus reglas arquitectónicas, responsabilidades y código.
- **Control de Telemetría**: Barra de tiempo interactiva, velocidad ajustable (0.5x, 1x, 2x), logs en tiempo real y pasos explicativos.
