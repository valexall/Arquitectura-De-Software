"""Punto de entrada de la aplicación.

Crea el app Flask, registra el blueprint del controlador
e inicializa los datos en memoria.

Ejecuta con: python app.py
Abre:        http://127.0.0.1:5000
"""
from flask import Flask

from controlador.rutas import bp


def crear_app():
    app = Flask(__name__)
    # Datos en memoria (la práctica no requiere BD).
    app.config["CUPOS"] = {"almuerzo": 2}
    app.config["RESERVAS"] = []

    app.register_blueprint(bp)
    return app


if __name__ == "__main__":
    crear_app().run(debug=True)
