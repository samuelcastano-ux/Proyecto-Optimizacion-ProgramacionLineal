"""Reglas de validación estructural del modelo de programación lineal.

No resuelve ni evalúa el modelo: solo comprueba que la petición tenga la forma
mínima esperada (campos diligenciados, valores numéricos, dimensiones
coherentes, signos permitidos y el límite provisional de variables).
"""

from decimal import Decimal, InvalidOperation

from .modelos import MAX_VARIABLES, ErrorValidacion, ModeloEntrada

SENTIDOS_VALIDOS = {"max", "min"}
SIGNOS_VALIDOS = {"<=", ">=", "="}


def _es_numerico(valor: object) -> bool:
    """Indica si ``valor`` es un número real finito o una cadena numérica.

    Rechaza booleanos (que en Python heredan de ``int``), cadenas vacías,
    fracciones con barra y valores no finitos como ``NaN`` o ``Infinity``.
    """
    if isinstance(valor, bool):
        return False
    if isinstance(valor, int):
        return True
    if isinstance(valor, Decimal):
        return valor.is_finite()
    if isinstance(valor, str):
        try:
            numero = Decimal(valor.strip())
        except (InvalidOperation, ValueError):
            return False
        return numero.is_finite()
    return False


def _esta_vacio(valor: object) -> bool:
    """Indica si un campo opcional no fue diligenciado (``None`` o texto vacío)."""
    return valor is None or (isinstance(valor, str) and not valor.strip())


def validar_modelo(modelo: ModeloEntrada) -> list[ErrorValidacion]:
    """Valida la estructura de ``modelo`` y devuelve la lista de errores.

    La lista queda vacía cuando el modelo es estructuralmente válido. Los
    mensajes están en español y el campo ``campo`` permite resaltar el error en
    el formulario del frontend.
    """
    errores: list[ErrorValidacion] = []

    sentido = modelo.sentido.strip().lower()
    if not sentido:
        errores.append(
            ErrorValidacion(
                campo="sentido",
                mensaje="El sentido es obligatorio: use 'max' o 'min'.",
            )
        )
    elif sentido not in SENTIDOS_VALIDOS:
        errores.append(
            ErrorValidacion(
                campo="sentido",
                mensaje=f"El sentido '{modelo.sentido}' no es válido; use 'max' o 'min'.",
            )
        )

    if not modelo.coeficientes_objetivo:
        errores.append(
            ErrorValidacion(
                campo="coeficientes_objetivo",
                mensaje="La función objetivo debe tener al menos un coeficiente.",
            )
        )

    for posicion, valor in enumerate(modelo.coeficientes_objetivo, start=1):
        if not _es_numerico(valor):
            errores.append(
                ErrorValidacion(
                    campo=f"coeficientes_objetivo[{posicion - 1}]",
                    mensaje=f"El coeficiente {posicion} de la función objetivo no es numérico: {valor!r}.",
                )
            )

    if not modelo.restricciones:
        errores.append(
            ErrorValidacion(
                campo="restricciones",
                mensaje="Debe incluir al menos una restricción.",
            )
        )

    numero_variables = len(modelo.coeficientes_objetivo)
    if numero_variables > MAX_VARIABLES:
        errores.append(
            ErrorValidacion(
                campo="coeficientes_objetivo",
                mensaje=(
                    f"El modelo tiene {numero_variables} variables; "
                    f"el máximo provisional del Sprint 1 es {MAX_VARIABLES}."
                ),
            )
        )

    for indice, restriccion in enumerate(modelo.restricciones):
        nombre = f"R{indice + 1}"
        campo = f"restricciones[{indice}]"

        if _esta_vacio(restriccion.signo):
            errores.append(
                ErrorValidacion(
                    campo=f"{campo}.signo",
                    mensaje=f"La restricción {nombre} no tiene signo; use '<=', '>=' o '='.",
                )
            )
        elif restriccion.signo.strip() not in SIGNOS_VALIDOS:
            errores.append(
                ErrorValidacion(
                    campo=f"{campo}.signo",
                    mensaje=(
                        f"El signo '{restriccion.signo}' de {nombre} no es válido; "
                        "use '<=', '>=' o '='."
                    ),
                )
            )

        if not restriccion.coeficientes:
            errores.append(
                ErrorValidacion(
                    campo=f"{campo}.coeficientes",
                    mensaje=f"La restricción {nombre} no tiene coeficientes.",
                )
            )
        elif numero_variables and len(restriccion.coeficientes) != numero_variables:
            errores.append(
                ErrorValidacion(
                    campo=f"{campo}.coeficientes",
                    mensaje=(
                        f"La restricción {nombre} tiene {len(restriccion.coeficientes)} "
                        f"coeficientes y el modelo declara {numero_variables} variables."
                    ),
                )
            )

        for posicion, valor in enumerate(restriccion.coeficientes, start=1):
            if not _es_numerico(valor):
                errores.append(
                    ErrorValidacion(
                        campo=f"{campo}.coeficientes[{posicion - 1}]",
                        mensaje=(
                            f"El coeficiente {posicion} de {nombre} no es numérico: {valor!r}."
                        ),
                    )
                )

        if _esta_vacio(restriccion.lado_derecho):
            errores.append(
                ErrorValidacion(
                    campo=f"{campo}.lado_derecho",
                    mensaje=f"La restricción {nombre} no tiene lado derecho.",
                )
            )
        elif not _es_numerico(restriccion.lado_derecho):
            errores.append(
                ErrorValidacion(
                    campo=f"{campo}.lado_derecho",
                    mensaje=(
                        f"El lado derecho de {nombre} no es numérico: "
                        f"{restriccion.lado_derecho!r}."
                    ),
                )
            )

    return errores
