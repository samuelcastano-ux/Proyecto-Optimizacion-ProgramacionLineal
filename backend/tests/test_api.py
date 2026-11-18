"""Pruebas de la API de datos fijos del Sprint 1 (pytest + TestClient).

Cubren los tres endpoints, los casos de error de ``POST /validar``, el 404 de
ejemplos y la garantía de que ninguna respuesta contiene números ``float``.
"""

from collections.abc import Iterator
from decimal import Decimal
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.modelos import ModeloEntrada

cliente = TestClient(app)

MODELO_VALIDO = {
    "sentido": "max",
    "coeficientes_objetivo": [50, 80],
    "restricciones": [
        {"coeficientes": [2, 1], "signo": "<=", "lado_derecho": 100},
        {"coeficientes": [1, 3], "signo": "<=", "lado_derecho": 90},
    ],
}


def _floats_en(dato: Any) -> Iterator[float]:
    """Recorre recursivamente una respuesta JSON y produce todo valor ``float``."""
    if isinstance(dato, float):
        yield dato
    elif isinstance(dato, dict):
        for valor in dato.values():
            yield from _floats_en(valor)
    elif isinstance(dato, list):
        for valor in dato:
            yield from _floats_en(valor)


def _errores(respuesta) -> list[dict[str, str]]:
    """Extrae la lista de errores de una respuesta 422 de la API."""
    cuerpo = respuesta.json()
    assert cuerpo["valido"] is False
    errores = cuerpo["errores"]
    assert isinstance(errores, list) and errores
    return errores


# --------------------------------------------------------------------------
# Salud y CORS
# --------------------------------------------------------------------------


def test_salud_responde_ok():
    """GET /salud devuelve el estado esperado."""
    respuesta = cliente.get("/salud")
    assert respuesta.status_code == 200
    assert respuesta.json() == {"estado": "ok"}


def test_cors_permite_el_origen_del_frontend():
    """El preflight desde Vite (localhost:5173) queda autorizado."""
    respuesta = cliente.options(
        "/ejemplos",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert respuesta.status_code == 200
    assert respuesta.headers["access-control-allow-origin"] == "http://localhost:5173"


# --------------------------------------------------------------------------
# Ejemplos fijos
# --------------------------------------------------------------------------


def test_listar_ejemplos_devuelve_solo_id_y_titulo():
    """GET /ejemplos lista los tres ids en orden, sin campos sobrantes."""
    respuesta = cliente.get("/ejemplos")
    assert respuesta.status_code == 200

    datos = respuesta.json()
    assert [ejemplo["id"] for ejemplo in datos] == [
        "max-dos-variables",
        "gran-m-minimizacion",
        "modelo-diez-variables",
    ]
    assert all(set(ejemplo) == {"id", "titulo"} for ejemplo in datos)
    assert all(ejemplo["titulo"].strip() for ejemplo in datos)


def test_ejemplo_max_dos_variables():
    """El ejemplo gráfico trae solución, vértices, precios sombra y rangos exactos."""
    datos = cliente.get("/ejemplos/max-dos-variables").json()

    assert datos["sentido"] == "max"
    assert datos["variables"] == ["x1", "x2"]
    assert datos["coeficientes_objetivo"] == ["50", "80"]
    assert [r["signo"] for r in datos["restricciones"]] == ["<=", "<=", "<="]

    assert datos["solucion"] == {"x1": "42", "x2": "16", "Z": "3380"}
    assert datos["usos"] == {"R1": "100", "R2": "90", "R3": "16"}
    assert datos["holguras"] == {"R1": "0", "R2": "0", "R3": "24"}
    assert datos["vertices"] == [
        {"x1": "0", "x2": "0", "Z": "0"},
        {"x1": "50", "x2": "0", "Z": "2500"},
        {"x1": "42", "x2": "16", "Z": "3380"},
        {"x1": "0", "x2": "30", "Z": "2400"},
    ]
    assert datos["optimo"] == {"x1": "42", "x2": "16"}
    assert datos["precios_sombra"] == {"R1": "14", "R2": "22", "R3": "0"}
    assert datos["costos_reducidos"] == {"x1": "0", "x2": "0"}

    assert datos["rangos_coeficientes"] == {
        "x1": {"minimo": "80/3", "maximo": "160"},
        "x2": {"minimo": "25", "maximo": "150"},
    }
    assert datos["rangos_lado_derecho"] == {
        "R1": {"minimo": "30", "maximo": "180"},
        "R2": {"minimo": "50", "maximo": "150"},
        "R3": {"minimo": "16", "maximo": "+∞"},
    }


def test_ejemplo_gran_m():
    """El ejemplo de Gran M trae forma estándar, tablero inicial y solución fraccionaria."""
    datos = cliente.get("/ejemplos/gran-m-minimizacion").json()

    assert datos["sentido"] == "min"
    assert datos["restricciones"] == [
        {"coeficientes": ["3", "1"], "signo": "=", "lado_derecho": "3"},
        {"coeficientes": ["4", "3"], "signo": ">=", "lado_derecho": "6"},
        {"coeficientes": ["-1", "-2"], "signo": ">=", "lado_derecho": "-4"},
    ]
    assert datos["forma_estandar"] == [
        "3x1 + x2 + a1 = 3",
        "4x1 + 3x2 - s2 + a2 = 6",
        "x1 + 2x2 + s3 = 4",
    ]
    assert datos["funcion_penalizada"] == "Min Z = 4x1 + x2 + M*a1 + M*a2"

    tablero = datos["tablero_inicial"]
    assert tablero["columnas"] == ["x1", "x2", "s2", "a1", "a2", "s3", "b"]
    assert [fila["base"] for fila in tablero["filas"]] == ["a1", "a2", "s3"]
    assert [fila["cb"] for fila in tablero["filas"]] == ["M", "M", "0"]
    assert tablero["filas"][0]["razon"] == "3/3 = 1"
    assert tablero["filas"][1]["razon"] == "6/4 = 3/2"
    assert tablero["filas"][2]["razon"] == "4/1 = 4"
    assert tablero["cj_menos_zj"] == ["4 - 7M", "1 - 4M", "M", "0", "0", "0"]
    assert tablero["z"] == "9M"

    assert datos["iteracion"] == {"entra": "x1", "sale": "a1", "pivote": "3"}
    assert datos["solucion"] == {"x1": "2/5", "x2": "9/5", "Z": "17/5"}


def test_ejemplo_diez_variables_es_maqueta():
    """El ejemplo de 10 variables solo expone estructura con marcadores."""
    datos = cliente.get("/ejemplos/modelo-diez-variables").json()

    assert datos["sentido"] == "max"
    assert len(datos["variables"]) == 10
    assert len(datos["coeficientes_objetivo"]) == 10
    assert len(datos["restricciones"]) == 3
    assert len(datos["restricciones"][0]["coeficientes"]) == 10
    assert datos["restricciones"][0]["coeficientes"][0] == "a1,1"
    assert datos["restricciones"][1]["coeficientes"][4] == "a2,5"
    assert datos["restricciones"][2]["coeficientes"][9] == "a3,10"
    assert datos["solucion"] is None
    assert "maqueta" in datos["nota"].lower()


def test_ejemplo_inexistente_devuelve_404_en_español():
    """Un id desconocido produce 404 con un mensaje que guía al listado."""
    respuesta = cliente.get("/ejemplos/no-existe")
    assert respuesta.status_code == 404

    mensaje = respuesta.json()["detail"]
    assert "no-existe" in mensaje
    assert "GET /ejemplos" in mensaje


def test_las_respuestas_no_contienen_floats():
    """Ningún valor de los ejemplos se serializa como float (se conserva la exactitud)."""
    for resumen in cliente.get("/ejemplos").json():
        datos = cliente.get(f"/ejemplos/{resumen['id']}").json()
        assert list(_floats_en(datos)) == []


# --------------------------------------------------------------------------
# Validación estructural
# --------------------------------------------------------------------------


def test_validar_modelo_correcto():
    """Un modelo bien formado devuelve 200 con ``valido`` en true."""
    respuesta = cliente.post("/validar", json=MODELO_VALIDO)
    assert respuesta.status_code == 200
    assert respuesta.json() == {"valido": True}


def test_validar_rechaza_mas_del_maximo_provisional_de_variables():
    """La API aplica el mismo límite provisional de diez variables."""
    modelo = {
        "sentido": "max",
        "coeficientes_objetivo": [1] * 11,
        "restricciones": [
            {"coeficientes": [1] * 11, "signo": "<=", "lado_derecho": 10},
        ],
    }

    respuesta = cliente.post("/validar", json=modelo)

    assert respuesta.status_code == 422
    error = next(
        error
        for error in respuesta.json()["errores"]
        if error["campo"] == "coeficientes_objetivo"
    )
    assert "máximo provisional" in error["mensaje"]


def test_validar_acepta_coeficientes_decimales_exactos():
    """Los decimales JSON se aceptan mediante Decimal, sin usar float."""
    modelo = {
        "sentido": "max",
        "coeficientes_objetivo": [0.1],
        "restricciones": [
            {"coeficientes": [0.2], "signo": "<=", "lado_derecho": 0.3},
        ],
    }

    respuesta = cliente.post("/validar", json=modelo)

    assert respuesta.status_code == 200
    assert respuesta.json() == {"valido": True}
    interpretado = ModeloEntrada.model_validate(modelo)
    assert interpretado.coeficientes_objetivo[0] == Decimal("0.1")
    assert interpretado.restricciones[0].coeficientes[0] == Decimal("0.2")


def test_validar_detecta_campos_vacios():
    """Un cuerpo vacío acumula un error por cada campo obligatorio."""
    respuesta = cliente.post("/validar", json={})
    assert respuesta.status_code == 422

    errores = _errores(respuesta)
    campos = {error["campo"] for error in errores}
    assert {"sentido", "coeficientes_objetivo", "restricciones"} <= campos
    assert all(error["mensaje"].strip() for error in errores)


def test_validar_detecta_valores_no_numericos():
    """Los coeficientes y el lado derecho deben ser numéricos."""
    modelo = {
        "sentido": "max",
        "coeficientes_objetivo": ["cincuenta", 80],
        "restricciones": [
            {"coeficientes": [2, "x"], "signo": "<=", "lado_derecho": "cien"},
        ],
    }
    respuesta = cliente.post("/validar", json=modelo)
    assert respuesta.status_code == 422

    mensajes = [error["mensaje"] for error in _errores(respuesta)]
    assert any("no es numérico" in mensaje for mensaje in mensajes)
    assert any("lado derecho" in mensaje for mensaje in mensajes)


def test_validar_detecta_dimensiones_incoherentes():
    """Cada restricción debe tener tantos coeficientes como variables declaradas."""
    modelo = {
        "sentido": "max",
        "coeficientes_objetivo": [50, 80],
        "restricciones": [
            {"coeficientes": [2], "signo": "<=", "lado_derecho": 100},
        ],
    }
    respuesta = cliente.post("/validar", json=modelo)
    assert respuesta.status_code == 422

    errores = _errores(respuesta)
    assert any(
        "1" in error["mensaje"] and "2 variables" in error["mensaje"] for error in errores
    )


def test_validar_detecta_signo_no_permitido():
    """Solo se aceptan los signos '<=', '>=' y '='."""
    modelo = {
        "sentido": "min",
        "coeficientes_objetivo": [4, 1],
        "restricciones": [
            {"coeficientes": [3, 1], "signo": "<", "lado_derecho": 3},
        ],
    }
    respuesta = cliente.post("/validar", json=modelo)
    assert respuesta.status_code == 422

    errores = _errores(respuesta)
    assert any("no es válido" in error["mensaje"] for error in errores)
    assert any(error["campo"].endswith(".signo") for error in errores)


def test_validar_detecta_sentido_no_permitido():
    """El sentido debe ser exactamente 'max' o 'min'."""
    modelo = {**MODELO_VALIDO, "sentido": "maximizar"}
    respuesta = cliente.post("/validar", json=modelo)
    assert respuesta.status_code == 422

    errores = _errores(respuesta)
    assert any("max" in error["mensaje"] and "min" in error["mensaje"] for error in errores)


def test_validar_cuerpo_con_tipo_invalido_responde_en_español():
    """Un cuerpo que no es objeto produce 422 con el formato de error de la API."""
    respuesta = cliente.post("/validar", json=[])
    assert respuesta.status_code == 422

    errores = _errores(respuesta)
    assert errores[0]["campo"] == "cuerpo"
    assert "formato" in errores[0]["mensaje"]


def test_validar_no_devuelve_solucion():
    """La respuesta exitosa no incluye cálculos: solo confirma la estructura."""
    respuesta = cliente.post("/validar", json=MODELO_VALIDO)
    assert set(respuesta.json()) == {"valido"}


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__]))
