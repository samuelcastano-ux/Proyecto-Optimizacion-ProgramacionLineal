"""Punto de entrada de la API: instancia FastAPI, CORS y routers.

El backend del Sprint 1 solo sirve datos fijos y valida estructura; no contiene
ningún algoritmo de optimización.
"""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .rutas import ejemplos, validacion

app = FastAPI(
    title="optimizacion-pl",
    version="0.2.0",
    description="API de datos fijos para el prototipo de programación lineal (Sprint 1).",
)

# El frontend de Vite corre en este origen durante el desarrollo.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ejemplos.router)
app.include_router(validacion.router)


@app.get("/salud", tags=["salud"], summary="Comprueba que la API está en línea")
def salud() -> dict[str, str]:
    """Devuelve un estado fijo para verificar el despliegue del backend."""
    return {"estado": "ok"}


@app.exception_handler(RequestValidationError)
async def manejar_error_de_esquema(
    request: Request, error: RequestValidationError
) -> JSONResponse:
    """Traduce los errores de esquema de Pydantic al formato en español de la API.

    Se usa cuando el cuerpo ni siquiera cumple el tipo esperado (por ejemplo un
    arreglo en lugar de un objeto); los errores de negocio los produce
    ``app.validacion``.
    """
    errores = []
    for detalle in error.errors():
        ubicacion = [str(parte) for parte in detalle.get("loc", ()) if parte != "body"]
        errores.append(
            {
                "campo": ".".join(ubicacion) or "cuerpo",
                "mensaje": "El valor enviado no tiene el formato esperado.",
            }
        )
    return JSONResponse(status_code=422, content={"valido": False, "errores": errores})
