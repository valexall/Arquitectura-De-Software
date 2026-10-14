"""Servicio / Caso de uso — lógica de reserva.

Contiene la validación de formato y la regla de negocio (cupos).
No sabe nada de Flask ni de HTTP: es testeable de forma aislada.
"""
from dataclasses import dataclass
from repositorio import memoria


@dataclass
class ResultadoReserva:
    ok: bool
    mensaje: str
    codigo: int  # código HTTP sugerido


def hacer_reserva(nombre: str, turno: str) -> ResultadoReserva:
    # 1. Validación de formato
    if len(nombre) < 2:
        return ResultadoReserva(
            ok=False,
            mensaje="Escribe un nombre de al menos 2 caracteres.",
            codigo=400,
        )

    # 2. Existencia del turno (acceso a datos)
    cupos = memoria.obtener_cupos(turno)
    if cupos is None:
        return ResultadoReserva(ok=False, mensaje="El turno no existe.", codigo=404)

    # 3. Regla de negocio: cupos disponibles
    if cupos <= 0:
        return ResultadoReserva(ok=False, mensaje="No quedan cupos.", codigo=409)

    # 4. Persistencia (acceso a datos)
    memoria.descontar_cupo(turno)
    memoria.guardar_reserva(nombre, turno)

    return ResultadoReserva(
        ok=True,
        mensaje=f"Reserva confirmada para {nombre}.",
        codigo=201,
    )
