"""Esquemas Pydantic de entrada y salida de la API de datos fijos (Sprint 1).

Todos los valores numéricos que viajan hacia el frontend se representan como
cadenas de texto para conservar la exactitud (por ejemplo "2/5", "80/3" o
"+∞"); en ningún caso se serializan como ``float``.
"""

from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

# Límite provisional aplicado en la validación del Sprint 1; debe confirmarse
# con el docente antes de convertirse en una restricción permanente.
MAX_VARIABLES = 10

# Un coeficiente puede llegar como número desde el cliente o como marcador
# ("a1,1", "c3") en los ejemplos de maqueta, pero siempre se devuelve texto.
NumeroOMarcador = str | int | Decimal


class Restriccion(BaseModel):
    """Una restricción lineal: coeficientes, signo y lado derecho.

    Se reutiliza tanto en las peticiones de ``POST /validar`` (coeficientes
    numéricos) como en los ejemplos fijos (coeficientes ya formateados como
    cadena).
    """

    model_config = ConfigDict(extra="ignore")

    coeficientes: list[NumeroOMarcador] = Field(
        default_factory=list,
        description="Coeficientes de las variables, en el orden declarado.",
    )
    signo: str = Field(
        default="",
        description="Relación de la restricción: '<=', '>=' o '='.",
    )
    lado_derecho: NumeroOMarcador | None = Field(
        default=None,
        description="Término independiente (lado derecho) de la restricción.",
    )


class ModeloEntrada(BaseModel):
    """Modelo de programación lineal tal como lo envía el usuario.

    Contiene solo datos estructurales: sentido, coeficientes de la función
    objetivo y restricciones. No incluye solución ni análisis.
    """

    model_config = ConfigDict(extra="ignore")

    sentido: str = Field(
        default="",
        description="Sentido de optimización: 'max' o 'min'.",
    )
    coeficientes_objetivo: list[NumeroOMarcador] = Field(
        default_factory=list,
        description="Coeficientes de la función objetivo (uno por variable).",
    )
    restricciones: list[Restriccion] = Field(
        default_factory=list,
        description="Restricciones lineales del modelo.",
    )


class ErrorValidacion(BaseModel):
    """Un error de validación estructural, con el campo afectado y su mensaje."""

    campo: str = Field(description="Ruta del campo con problemas, por ejemplo 'restricciones[0].signo'.")
    mensaje: str = Field(description="Explicación del error en español.")


class EjemploResumen(BaseModel):
    """Datos mínimos para listar un ejemplo en el selector del frontend."""

    id: str = Field(description="Identificador estable usado en la URL.")
    titulo: str = Field(description="Título legible para mostrar en la interfaz.")


class EjemploCompleto(EjemploResumen):
    """Ejemplo de datos fijos con toda la información que consume el prototipo.

    Los campos específicos de cada ejemplo son opcionales: los tres casos
    (gráfico 2x2, Gran M y maqueta de 10 variables) comparten el mismo esquema
    y dejan en ``None`` lo que no aplica.
    """

    model_config = ConfigDict(extra="ignore")

    descripcion: str = Field(description="Resumen en español del problema.")
    sentido: str | None = Field(default=None, description="'max' o 'min'.")
    variables: list[str] = Field(default_factory=list, description="Nombres de las variables, en orden.")
    coeficientes_objetivo: list[str] = Field(
        default_factory=list,
        description="Coeficientes de la función objetivo como texto exacto.",
    )
    restricciones: list[Restriccion] = Field(
        default_factory=list,
        description="Restricciones originales del modelo.",
    )
    solucion: dict[str, str] | None = Field(
        default=None,
        description="Valores exactos de las variables y de Z, por ejemplo {'x1': '2/5'}.",
    )
    usos: dict[str, str] | None = Field(
        default=None,
        description="Uso del lado izquierdo de cada restricción en el óptimo.",
    )
    holguras: dict[str, str] | None = Field(default=None, description="Holgura de cada restricción.")
    vertices: list[dict[str, str]] | None = Field(
        default=None,
        description="Vértices factibles (x1, x2, Z) para el gráfico 2D.",
    )
    optimo: dict[str, str] | None = Field(default=None, description="Vértice donde se alcanza el óptimo.")
    precios_sombra: dict[str, str] | None = Field(default=None, description="Precio sombra de cada restricción.")
    costos_reducidos: dict[str, str] | None = Field(default=None, description="Costo reducido de cada variable.")
    rangos_coeficientes: dict[str, dict[str, str]] | None = Field(
        default=None,
        description="Rango de optimalidad de cada coeficiente de la función objetivo.",
    )
    rangos_lado_derecho: dict[str, dict[str, str]] | None = Field(
        default=None,
        description="Rango de factibilidad del lado derecho de cada restricción.",
    )
    forma_estandar: list[str] | None = Field(
        default=None,
        description="Ecuaciones del modelo en forma estándar (texto exacto).",
    )
    funcion_penalizada: str | None = Field(
        default=None,
        description="Función objetivo con las variables artificiales penalizadas por M.",
    )
    tablero_inicial: dict[str, Any] | None = Field(
        default=None,
        description="Tablero simplex inicial: columnas, filas, Cj-Zj y Z.",
    )
    iteracion: dict[str, str] | None = Field(
        default=None,
        description="Iteración que lleva al óptimo: variable entrante, saliente y pivote.",
    )
    nota: str | None = Field(default=None, description="Aclaración sobre el alcance del ejemplo.")
