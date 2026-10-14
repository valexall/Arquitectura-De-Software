# Torre Isométrica 3D — Arquitectura en N-Capas (Framework Anatomy)

Este proyecto implementa un artefacto explicativo físico e interactivo de alta fidelidad basado en el framework **Anatomy**, diseñado para comprender en profundidad el funcionamiento de una **Arquitectura en N-Capas (N-Tier / N-Layer)**.

Alineado con el curso de **Arquitectura del Software (UNAMBA - AIS-86)** y la práctica de refactorización MVC/Capas (`ais86-semana05-mvc-refactor`).

---

## 1. El Principio Fundamental de Anatomy
> *"El objeto es la explicación. No dibuje cajas, flechas ni etiquetas flotantes. Invente una máquina real y precisa cuyo funcionamiento sea el concepto mismo."*

La máquina modelada es una **Torre Modular Vertical de Calibración e Inspección** de 4 niveles sobre una bancada pesada de hierro fundido con 4 columnas guía cromadas, un émbolo central de petición/respuesta y un mecanismo de bypass para excepciones de negocio.

---

## 2. Correspondencia Mecánica con la Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│ NIVEL 4: TOLVA DE ENTRADA & REGULADOR (Presentación / Ctrl) │
│ [Tolva calibrada] [Manómetro HTTP] [Mirilla de Parámetros]  │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Émbolo / Request HTTP)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ NIVEL 3: BALANZA MICROMÉTRICA & RESORTES (Servicio/Negocio) │
│ [Galgas de Tolerancia] [Resortes] [Rampa de Rechazo 400]    │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Si regla OK: pasa libre)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ NIVEL 2: TAMBOR SELECTOR & JUNTA OLDHAM (Repositorio)       │
│ [Tambor de Levas] [Mapeador Entidad <-> BD] [Dial Consulta] │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Traducción a almacenamiento)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ NIVEL 1: BÓVEDA & TAMBOR MAGNÉTICO (Persistencia / BD)      │
│ [Platos Magnéticos] [Cabezal Cremallera] [Registro WAL]     │
└─────────────────────────────────────────────────────────────┘
                               ▲
                        (Bancada y Pies)
```

### Detalle de cada Capa:
1. **Capa 4: Presentación & Controlador (Nivel Superior)**
   - **Piezas:** Tolva de inyección en latón torneado, anillo de fijación con pernos hexagonales, manómetro de respuesta HTTP (200, 400, 422, 500) y mirilla de parámetros.
   - **Rol arquitectónico:** Frontera externa del sistema. Deserializa la petición, valida la sintaxis básica (ej. campos obligatorios no nulos) y delega al servicio. **Nunca implementa reglas de negocio.**
   - **Archivo en código:** [`controlador/rutas.py`](file:///c:/Users/richa/Desktop/UNAMBA/SEMESTRES/SEMESTRE%20VIII/ARQUITECTURA%20DEL%20SOFTWARE/Codigo/ais86-semana05-mvc-refactor/controlador/rutas.py).

2. **Capa 3: Lógica de Negocio / Servicio (Nivel Intermedio Superior)**
   - **Piezas:** Balanza micrométrica sobre cojinete de zafiro, dos resortes helicoidales de acero calibrados, galga palpadora de cupos y rampa lateral de descarte con trampa basculante.
   - **Rol arquitectónico:** El núcleo del dominio. Evalúa reglas puras (ej. `"quedan cupos disponibles"`). Es **completamente independiente de HTTP y Flask**; se puede ejecutar en pruebas unitarias aisladas sin navegador.
   - **Comportamiento en fallo (400 Bad Request):** Si la regla no se cumple, la balanza traba el émbolo y expulsa la muestra por la rampa lateral de rechazo. **Las Capas 2 (Repositorio) y 1 (BD) permanecen totalmente intactas e inmóviles.**
   - **Archivo en código:** [`servicio/reservas.py`](file:///c:/Users/richa/Desktop/UNAMBA/SEMESTRES/SEMESTRE%20VIII/ARQUITECTURA%20DEL%20SOFTWARE/Codigo/ais86-semana05-mvc-refactor/servicio/reservas.py).

3. **Capa 2: Repositorio (Nivel Intermedio Inferior)**
   - **Piezas:** Tambor rotatorio con estrías de levas helicoidales (Data Mapper), dial selector de consultas (`SELECT / INSERT / FILTER`) y acoplamiento flexible Oldham.
   - **Rol arquitectónico:** Abstracción y desacoplamiento. Traduce objetos de dominio (`Reserva`) a estructuras compatibles con la tecnología de base de datos elegida (memoria, PostgreSQL, SQLite), permitiendo cambiar el motor sin tocar la lógica de negocio.
   - **Archivo en código:** [`repositorio/memoria.py`](file:///c:/Users/richa/Desktop/UNAMBA/SEMESTRES/SEMESTRE%20VIII/ARQUITECTURA%20DEL%20SOFTWARE/Codigo/ais86-semana05-mvc-refactor/repositorio/memoria.py).

4. **Capa 1: Persistencia & Base de Datos (Nivel Inferior / Bóveda)**
   - **Piezas:** Tambor de platos magnéticos cilíndricos con marcas de sectores, cabezal de lectura/escritura deslizante sobre cremallera con tornillo micrométrico y mirilla de registro WAL (Write-Ahead Log).
   - **Rol arquitectónico:** Retención física o en memoria del estado de la aplicación.
   - **Archivo en código:** Diccionario global / base de datos persistente.

---

## 3. Escenarios Interactivos Demostrados en la Simulación

1. **Escenario 200 OK (Reserva Exitosa):**
   - El payload entra por la tolva superior, pasa la validación del controlador, la balanza de negocio aprueba el cupo (disminuye en 1), el repositorio mapea la entidad y la base de datos registra el bloque. El émbolo retorna al origen con confirmación 200 OK.
2. **Escenario 400 Bad Request (Violación de Regla de Negocio - Sin Cupos):**
   - El controlador envía la petición a la capa de servicio; la balanza detecta sobrecarga de cupo (cupos = 0) y activa mecánicamente el seguro lateral. La cápsula es expulsada por la rampa de descarte. **El repositorio y la base de datos jamás son tocados**, demostrando la protección del dominio.
3. **Escenario 422 Unprocessable (Error Sintáctico de Entrada):**
   - La petición es rechazada de inmediato en el controlador por parámetros inválidos o vacíos, rebotando en la tolva superior sin penetrar al servicio.
4. **Vista Despiezada (Exploded View):**
   - Un deslizador interactivo desplaza verticalmente los 4 módulos a lo largo de las 4 columnas de acero cromado, revelando el interior, los bujes de bronce y los acoplamientos mecánicos de desacople entre capas.

---

## 4. Instrucciones de Uso y Visualización

### Opción 1: Abrir directamente en el navegador
Haga doble clic o abra en su navegador web favorito:
- [`index.html`](file:///c:/Users/richa/Desktop/UNAMBA/SEMESTRES/SEMESTRE%20VIII/ARQUITECTURA%20DEL%20SOFTWARE/Codigo/anatomy-n-capas/index.html) (Modo Oscuro)
- [`index-light.html`](file:///c:/Users/richa/Desktop/UNAMBA/SEMESTRES/SEMESTRE%20VIII/ARQUITECTURA%20DEL%20SOFTWARE/Codigo/anatomy-n-capas/index-light.html) (Modo Claro / Paper & Ink)

### Opción 2: Reconstruir con Node.js
```bash
# Construir modo oscuro (predeterminado)
node build.mjs

# Construir modo claro
node build.mjs --light
```

### Atajos de Teclado:
- `[1]`: Seleccionar caso 200 OK (Reserva Exitosa)
- `[2]`: Seleccionar caso 400 Bad Request (Sin Cupo)
- `[3]`: Seleccionar caso 422 Unprocessable (Formato Inválido)
- `[Espacio]` o `[Enter]`: Despachar Petición HTTP
- `[E]`: Alternar Vista Despiezada (Separación de capas)
- `[T]`: Alternar Tema Claro / Oscuro

---

## 5. Estructura de Archivos del Módulo
```
anatomy-n-capas/
├── build.mjs          # Script constructor Node.js (compila a SVG + HTML autónomo)
├── geometry.mjs       # Definición matemática de sólidos, bujes, levas y cilindros
├── model.mjs          # Modelo de estados, cinemática y traza pedagógica
├── index.html         # Diagrama interactivo autónomo (Tema Oscuro)
├── index-light.html   # Diagrama interactivo autónomo (Tema Claro)
├── kit/               # Motor isométrico Anatomy (iso-kit.mjs, lathe.mjs, iso.css)
└── README.md          # Esta documentación pedagógica
```
