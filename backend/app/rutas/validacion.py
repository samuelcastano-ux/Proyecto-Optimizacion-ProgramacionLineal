"""Endpoint de validación estructural mínima del modelo (sin resolverlo).

Delega las reglas en ``app.validacion`` y traduce el resultado al contrato de
la API: 200 con ``{"valido": true}`` o 422 con la lista de errores en español.
"""

from fastapi import APIRouter, Response
from fastapi.responses import JSONResponse

from ..modelos import ModeloEntrada
from ..validacion import validar_modelo

router = APIRouter(tags=["validación"])


@router.post(
    "/validar",
    summary="Valida la estructura de un modelo de programación lineal",
)
def validar(modelo: ModeloEntrada) -> Response:
    """Comprueba la forma del modelo y responde 200 o 422.

    No calcula la solución: solo verifica campos vacíos, valores no numéricos,
    dimensiones incoherentes y signos no permitidos.
    """
    errores = validar_modelo(modelo)
    if errores:
        return JSONResponse(
            status_code=422,
            content={
                "valido": False,
                "errores": [error.model_dump() for error in errores],
            },
        )
    return {"valido": True}
