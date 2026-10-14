"""Vista / Presentación — template HTML y función de renderizado.

No contiene lógica de negocio ni acceso a datos.
"""
from flask import render_template_string

PAGINA = """
<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><title>Reserva de menú</title></head>
<body>
  <h1>Reserva de menú</h1>
  <p>Cupos disponibles para almuerzo: {{ cupos }}</p>
  <form method="post" action="/reservar">
    <label>Nombre: <input name="nombre" required></label>
    <input type="hidden" name="turno" value="almuerzo">
    <button type="submit">Reservar</button>
  </form>
  {% if mensaje %}<p id="mensaje">{{ mensaje }}</p>{% endif %}
</body>
</html>
"""


def renderizar(cupos: int, mensaje: str = "") -> str:
    """Devuelve el HTML de la página con los cupos y mensaje dados."""
    return render_template_string(PAGINA, cupos=cupos, mensaje=mensaje)
