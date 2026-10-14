"""Pruebas de comportamiento: deben seguir pasando después de refactorizar."""
import unittest

from app import crear_app


class ReservasWebTest(unittest.TestCase):
    def setUp(self):
        self.app = crear_app()
        self.client = self.app.test_client()

    def test_inicio_muestra_dos_cupos(self):
        respuesta = self.client.get("/")
        self.assertEqual(respuesta.status_code, 200)
        self.assertIn(b"Cupos disponibles para almuerzo: 2", respuesta.data)

    def test_reserva_valida_confirma_y_reduce_cupo(self):
        respuesta = self.client.post(
            "/reservar", data={"nombre": "Ana", "turno": "almuerzo"}
        )
        self.assertEqual(respuesta.status_code, 201)
        self.assertIn(b"Reserva confirmada para Ana", respuesta.data)
        self.assertEqual(self.app.config["CUPOS"]["almuerzo"], 1)

    def test_nombre_demasiado_corto_se_rechaza_sin_consumir_cupo(self):
        respuesta = self.client.post(
            "/reservar", data={"nombre": "A", "turno": "almuerzo"}
        )
        self.assertEqual(respuesta.status_code, 400)
        self.assertEqual(self.app.config["CUPOS"]["almuerzo"], 2)

    def test_sin_cupos_no_se_confirma_otra_reserva(self):
        for nombre in ("Ana", "Luis"):
            self.client.post(
                "/reservar", data={"nombre": nombre, "turno": "almuerzo"}
            )
        respuesta = self.client.post(
            "/reservar", data={"nombre": "Mia", "turno": "almuerzo"}
        )
        self.assertEqual(respuesta.status_code, 409)
        self.assertIn(b"No quedan cupos", respuesta.data)
        self.assertEqual(len(self.app.config["RESERVAS"]), 2)

    def test_turno_inexistente_se_rechaza(self):
        respuesta = self.client.post(
            "/reservar", data={"nombre": "Ana", "turno": "noche"}
        )
        self.assertEqual(respuesta.status_code, 404)
        self.assertEqual(len(self.app.config["RESERVAS"]), 0)


if __name__ == "__main__":
    unittest.main()
