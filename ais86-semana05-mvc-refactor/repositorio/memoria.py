"""Repositorio — acceso a los datos en memoria (app.config de Flask).

Toda lectura y escritura de CUPOS y RESERVAS pasa por aquí.
El servicio y el controlador nunca tocan app.config directamente.
"""
from flask import current_app


def obtener_cupos(turno: str):
    """Devuelve el número de cupos del turno, o None si no existe."""
    return current_app.config["CUPOS"].get(turno)


def descontar_cupo(turno: str) -> None:
    """Reduce en uno el cupo del turno indicado."""
    current_app.config["CUPOS"][turno] -= 1


def guardar_reserva(nombre: str, turno: str) -> None:
    """Persiste una reserva en la lista en memoria."""
    current_app.config["RESERVAS"].append({"nombre": nombre, "turno": turno})
