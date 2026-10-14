"""Controlador — rutas Flask.

Solo orquesta: recibe la petición HTTP, llama al servicio,
pide a la vista que renderice y devuelve la respuesta.
No contiene lógica de negocio ni acceso directo a datos.
"""
from flask import request, Blueprint

from vista import pagina
from servicio import reservas as servicio_reservas
from repositorio import memoria

bp = Blueprint("reservas", __name__)


@bp.get("/")
def inicio():
    cupos = memoria.obtener_cupos("almuerzo")
    return pagina.renderizar(cupos=cupos), 200


@bp.post("/reservar")
def reservar():
    nombre = request.form.get("nombre", "").strip()
    turno = request.form.get("turno", "")

    resultado = servicio_reservas.hacer_reserva(nombre, turno)
    cupos = memoria.obtener_cupos("almuerzo")

    return pagina.renderizar(cupos=cupos, mensaje=resultado.mensaje), resultado.codigo
