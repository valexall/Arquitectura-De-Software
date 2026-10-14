# Actividad en parejas — Refactorizar sin romper el comportamiento

## Meta

Separar responsabilidades del endpoint de reserva en MVC/capas y conservar el comportamiento observable. **No se pide diseñar una arquitectura de producción ni añadir funcionalidades.**

## Regla de trabajo

- Parejas con dos roles: **constructor/a** y **verificador/a**. Cambian de rol a mitad del ejercicio.
- Antes de conversar o usar IA, cada integrante escribe individualmente el recorrido de una reserva y marca dónde ve validación, regla de negocio, acceso a datos y presentación.
- Después acuerdan una sola propuesta. Guarden un registro breve: *predicción → cambio → prueba → resultado*.
- La primera ronda se hace sin IA. Si luego usan IA para revisar, anoten la pregunta, qué aceptaron, qué rechazaron y qué prueba respalda su decisión.

## Entregables de la pareja

1. **Mapa del estado inicial:** ruta HTTP → responsabilidades que actualmente concentra → respuesta.
2. **Diagrama propuesto:** vista/presentación → controlador → servicio/caso de uso → repositorio. Marquen qué queda dentro del mismo proceso y qué componente sería un nivel físico distinto solo si realmente lo despliegan aparte.
3. **Refactor pequeño:** mover la decisión de reservar y el acceso a los datos fuera de la ruta. Mantener la misma interfaz y los mismos casos de respuesta.
4. **Pruebas:** correr las pruebas incluidas; añadir al menos una prueba del servicio que no importe Flask ni use HTTP. No borren ni debiliten las pruebas originales.
5. **Defensa individual:** explicar una fila/caso asignado al azar y responder una variante del docente.

## Aceptación ✅ / No aceptado 🚫

- [ ] ✅ Nombre inválido: se rechaza y no consume cupo.
- [ ] ✅ Reserva válida: se confirma y el cupo baja exactamente en uno.
- [ ] ✅ Sin cupos: se rechaza sin crear una reserva.
- [ ] ✅ La ruta no contiene la regla “si quedan cupos” ni modifica directamente la colección de reservas.
- [ ] ✅ El servicio puede probarse sin Flask ni navegador.
- [ ] ✅ El grupo explica qué es capa lógica y qué sería nivel físico en este caso.
- [ ] 🚫 Cambiar o borrar tests para que pasen.
- [ ] 🚫 Mover código de carpeta sin mostrar la dirección de dependencias.
- [ ] 🚫 Entregar código que funciona solo porque el portavoz leyó una respuesta de IA.

## Ronda de intercambio (si el docente la indica)

Revisen el mapa de otra pareja y dejen una observación verificable: “esta regla sigue en ___”, “esta prueba demuestra ___” o “no sabemos dónde se conserva el cupo porque ___”. No reescriban el código de la otra pareja.

## Salida individual (2 minutos)

Sin mirar el trabajo de tu compañero, responde: **si mañana cambia la regla de cupos, ¿qué módulo esperas modificar y qué prueba ejecutarías primero? ¿Por qué?**
