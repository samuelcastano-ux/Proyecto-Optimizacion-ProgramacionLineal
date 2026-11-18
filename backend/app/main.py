"""API FastAPI del proyecto: punto de entrada del backend (Integrante B)."""

from fastapi import FastAPI

app = FastAPI(title="optimizacion-pl", version="0.1.0")


@app.get("/salud")
def salud() -> dict[str, str]:
    """Endpoint de verificación: confirma que la API está en línea."""
    return {"estado": "ok"}
