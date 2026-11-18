"""Endpoints de solo lectura con los ejemplos fijos de ``datos/ejemplos.json``.

El archivo se lee una única vez, al importar el módulo (es decir, al arrancar
la aplicación), y el resultado queda en memoria. No hay cálculo de
optimización: las soluciones ya vienen escritas en el JSON como texto exacto.
"""

import json
from functools import lru_cache
from pathlib import Path

from fastapi import APIRouter, HTTPException

from ..modelos import EjemploCompleto, EjemploResumen

router = APIRouter(tags=["ejemplos"])

RUTA_EJEMPLOS = Path(__file__).resolve().parents[1] / "datos" / "ejemplos.json"


@lru_cache(maxsize=1)
def cargar_ejemplos() -> dict[str, EjemploCompleto]:
    """Lee ``ejemplos.json`` y devuelve los ejemplos indexados por su id.

    ``lru_cache`` garantiza una sola lectura por proceso; si el archivo no
    existe o no cumple el esquema, el error aparece al iniciar la aplicación.
    """
    with RUTA_EJEMPLOS.open(encoding="utf-8") as archivo:
        contenido = json.load(archivo)

    ejemplos = [EjemploCompleto.model_validate(datos) for datos in contenido["ejemplos"]]
    return {ejemplo.id: ejemplo for ejemplo in ejemplos}


# Carga única al iniciar: la constante se reutiliza en todas las peticiones.
EJEMPLOS: dict[str, EjemploCompleto] = cargar_ejemplos()


@router.get(
    "/ejemplos",
    response_model=list[EjemploResumen],
    summary="Lista los ejemplos disponibles",
)
def listar_ejemplos() -> list[EjemploCompleto]:
    """Devuelve el id y el título de cada ejemplo, en el orden del archivo JSON."""
    return list(EJEMPLOS.values())


@router.get(
    "/ejemplos/{ejemplo_id}",
    response_model=EjemploCompleto,
    summary="Obtiene un ejemplo completo por su id",
)
def obtener_ejemplo(ejemplo_id: str) -> EjemploCompleto:
    """Devuelve el ejemplo solicitado o un 404 con un mensaje en español."""
    ejemplo = EJEMPLOS.get(ejemplo_id)
    if ejemplo is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No existe el ejemplo '{ejemplo_id}'. "
                "Consulta GET /ejemplos para ver los identificadores disponibles."
            ),
        )
    return ejemplo
