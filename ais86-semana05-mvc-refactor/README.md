# AIS86 · Semana 5 — Refactorizar MVC y capas

Pequeña aplicación Flask para una reserva de menú. Parte de una versión **funcional pero deliberadamente sobrecargada**: una sola ruta valida, aplica una regla, modifica datos y presenta la respuesta. El ejercicio consiste en refactorizar sin cambiar lo que observa el usuario.

## Requisitos

- Python 3.10 o superior.
- Conexión a internet solo para instalar Flask la primera vez.
- No se requiere base de datos, Node, Docker ni IDE especial. Los cupos se guardan en memoria y vuelven a 2 al reiniciar.

## Descargar

Con Git:

```bash
git clone https://github.com/eddynorris/ais86-semana05-mvc-refactor.git
cd ais86-semana05-mvc-refactor
```

Sin Git: en GitHub usa **Code → Download ZIP**, descomprime y abre una terminal en esa carpeta.

## Ejecutar en Windows

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

Abre <http://127.0.0.1:5000>. Si PowerShell bloquea la activación, usa CMD y ejecuta `.venv\Scripts\activate.bat`.

## Ejecutar en macOS/Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python app.py
```

## Ejecutar pruebas

En otra terminal, dentro de la carpeta del proyecto y con el entorno virtual activado:

```bash
python -m unittest discover -s tests -v
```

Las pruebas describen el comportamiento que debe conservarse. No prueban por sí solas que la arquitectura haya quedado bien separada.

## Para la actividad

Lee [`ACTIVIDAD.md`](ACTIVIDAD.md). No se incluye una solución en este repositorio estudiantil. La actividad se verifica con el diagrama, las pruebas y una defensa individual breve; no basta con que la página “funcione”.

## Alcance deliberado

Esta app tiene **capas lógicas** pero todo corre localmente en un proceso (un nivel de ejecución). El almacenamiento en memoria simula el papel de un repositorio; no es una base de datos ni una arquitectura de producción. La vista HTML simplifica MVC: entrada por ruta/controlador, reglas en el servicio y respuesta en la vista.
