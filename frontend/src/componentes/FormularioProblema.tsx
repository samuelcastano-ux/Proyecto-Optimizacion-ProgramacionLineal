/**
 * FormularioProblema — Pantalla 1: captura del modelo de programación lineal.
 * Solo construye y valida la estructura; no resuelve nada. Los valores se
 * envían al backend para validarlos, sin abrir ni atribuirles resultados fijos.
 */

import { useMemo, useState } from "react";

import { validarModelo } from "../api/cliente";
import {
  esNumero,
  formatearExpresion,
  formatearRestriccion,
  formatearSigno,
  subindice,
} from "../formato/fracciones";
import { MAX_RESTRICCIONES, MAX_VARIABLES } from "../tipos/problema";
import type {
  ErrorValidacion,
  RestriccionFormulario,
  Sentido,
  SignoRelacion,
} from "../tipos/problema";
import { Panel } from "./comunes/Panel";
import { Pastilla } from "./comunes/Pastilla";
import { TablaDesplazable } from "./comunes/TablaDesplazable";
import { AvisoDemo } from "./comunes/AvisoDemo";

/** Objetivo del ejemplo fijo con el que arranca el prototipo. */
const OBJETIVO_INICIAL: string[] = ["50", "80"];

/** Restricciones del ejemplo fijo con el que arranca el prototipo. */
const RESTRICCIONES_INICIALES: RestriccionFormulario[] = [
  { coeficientes: ["2", "1"], signo: "<=", ladoDerecho: "100" },
  { coeficientes: ["1", "3"], signo: "<=", ladoDerecho: "90" },
  { coeficientes: ["0", "1"], signo: "<=", ladoDerecho: "40" },
];

/** Error en un campo concreto del formulario. */
type ErroresFormulario = Record<string, string | undefined>;

/** Crea una fila válida por defecto con ceros, sin inventar coeficientes reales. */
function crearFilaVacia(numeroVariables: number): RestriccionFormulario {
  return {
    coeficientes: Array.from({ length: numeroVariables }, () => "0"),
    signo: "<=",
    ladoDerecho: "0",
  };
}

/** Ajusta un número entero dentro de los límites permitidos. */
function limitar(valor: number, minimo: number, maximo: number): number {
  return Math.min(Math.max(valor, minimo), maximo);
}

/** Verifica campos vacíos y valores no numéricos con mensajes en español. */
function validarFormulario(
  objetivo: readonly string[],
  restricciones: readonly RestriccionFormulario[],
): ErroresFormulario {
  const errores: ErroresFormulario = {};

  objetivo.forEach((valor, indice) => {
    if (valor.trim() === "") {
      errores[`objetivo-${indice}`] = "Escribe el coeficiente de la variable.";
    } else if (!esNumero(valor)) {
      errores[`objetivo-${indice}`] =
        "Usa solo números (por ejemplo 50, -2 o 0.5).";
    }
  });

  restricciones.forEach((restriccion, indiceFila) => {
    restriccion.coeficientes.forEach((valor, indiceCoef) => {
      const clave = `restriccion-${indiceFila}-coef-${indiceCoef}`;
      if (valor.trim() === "") {
        errores[clave] = "Falta este coeficiente.";
      } else if (!esNumero(valor)) {
        errores[clave] = "Debe ser un número.";
      }
    });

    const claveDerecha = `restriccion-${indiceFila}-derecha`;
    if (restriccion.ladoDerecho.trim() === "") {
      errores[claveDerecha] = "Falta el lado derecho.";
    } else if (!esNumero(restriccion.ladoDerecho)) {
      errores[claveDerecha] = "Debe ser un número.";
    }
  });

  return errores;
}

/** Pantalla de captura del modelo con vista previa en tiempo real. */
export function FormularioProblema() {
  const [sentido, setSentido] = useState<Sentido>("max");
  const [objetivo, setObjetivo] = useState<string[]>(OBJETIVO_INICIAL);
  const [restricciones, setRestricciones] = useState<RestriccionFormulario[]>(
    RESTRICCIONES_INICIALES,
  );
  const [erroresServidor, setErroresServidor] = useState<ErrorValidacion[]>([]);
  const [avisoRed, setAvisoRed] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [validacionExitosa, setValidacionExitosa] = useState<boolean>(false);

  const errores = useMemo(
    () => validarFormulario(objetivo, restricciones),
    [objetivo, restricciones],
  );
  const numeroErrores = Object.keys(errores).length;
  const variables = useMemo(
    () => objetivo.map((_, indice) => `x${indice + 1}`),
    [objetivo],
  );

  /** Cambia la cantidad de variables y ajusta las filas existentes. */
  function ajustarVariables(delta: number): void {
    setValidacionExitosa(false);
    setErroresServidor([]);
    const nuevoTotal = limitar(objetivo.length + delta, 1, MAX_VARIABLES);
    if (nuevoTotal === objetivo.length) {
      return;
    }

    setObjetivo((actuales) => {
      if (nuevoTotal > actuales.length) {
        return [
          ...actuales,
          ...Array.from({ length: nuevoTotal - actuales.length }, () => "0"),
        ];
      }
      return actuales.slice(0, nuevoTotal);
    });

    setRestricciones((actuales) =>
      actuales.map((fila) => {
        const coeficientes =
          nuevoTotal > fila.coeficientes.length
            ? [
                ...fila.coeficientes,
                ...Array.from(
                  { length: nuevoTotal - fila.coeficientes.length },
                  () => "0",
                ),
              ]
            : fila.coeficientes.slice(0, nuevoTotal);
        return { ...fila, coeficientes };
      }),
    );
  }

  /** Añade o quita filas de restricciones respetando el mínimo y el máximo. */
  function ajustarRestricciones(delta: number): void {
    setValidacionExitosa(false);
    setErroresServidor([]);
    const nuevoTotal = limitar(
      restricciones.length + delta,
      1,
      MAX_RESTRICCIONES,
    );
    if (nuevoTotal === restricciones.length) {
      return;
    }

    setRestricciones((actuales) =>
      nuevoTotal > actuales.length
        ? [...actuales, crearFilaVacia(objetivo.length)]
        : actuales.slice(0, nuevoTotal),
    );
  }

  /** Actualiza un coeficiente de la función objetivo. */
  function cambiarObjetivo(indice: number, valor: string): void {
    setValidacionExitosa(false);
    setErroresServidor([]);
    setObjetivo((actuales) =>
      actuales.map((coeficiente, posicion) =>
        posicion === indice ? valor : coeficiente,
      ),
    );
  }

  /** Actualiza un coeficiente de la restricción seleccionada. */
  function cambiarCoeficiente(
    indiceFila: number,
    indiceCoeficiente: number,
    valor: string,
  ): void {
    setValidacionExitosa(false);
    setErroresServidor([]);
    setRestricciones((actuales) =>
      actuales.map((fila, posicionFila) =>
        posicionFila === indiceFila
          ? {
              ...fila,
              coeficientes: fila.coeficientes.map((coeficiente, posicion) =>
                posicion === indiceCoeficiente ? valor : coeficiente,
              ),
            }
          : fila,
      ),
    );
  }

  /** Actualiza la relación de la restricción seleccionada. */
  function cambiarSigno(indiceFila: number, signo: SignoRelacion): void {
    setValidacionExitosa(false);
    setErroresServidor([]);
    setRestricciones((actuales) =>
      actuales.map((fila, posicion) =>
        posicion === indiceFila ? { ...fila, signo } : fila,
      ),
    );
  }

  /** Actualiza el lado derecho de la restricción seleccionada. */
  function cambiarLadoDerecho(indiceFila: number, valor: string): void {
    setValidacionExitosa(false);
    setErroresServidor([]);
    setRestricciones((actuales) =>
      actuales.map((fila, posicion) =>
        posicion === indiceFila ? { ...fila, ladoDerecho: valor } : fila,
      ),
    );
  }

  /** Valida la estructura enviada, sin calcular una solución. */
  async function manejarValidacion(): Promise<void> {
    if (numeroErrores > 0 || enviando) {
      return;
    }

    setEnviando(true);
    setValidacionExitosa(false);
    setAvisoRed(null);
    setErroresServidor([]);

    try {
      const resultado = await validarModelo({
        sentido,
        coeficientes_objetivo: objetivo,
        restricciones: restricciones.map((fila) => ({
          coeficientes: fila.coeficientes,
          signo: fila.signo,
          lado_derecho: fila.ladoDerecho,
        })),
      });

      if (resultado.valido) {
        setValidacionExitosa(true);
        return;
      }

      setErroresServidor(resultado.errores ?? []);
    } catch (fallo) {
      setAvisoRed(
        fallo instanceof Error
          ? fallo.message
          : "No pudimos validar el modelo con el servidor. Inténtalo de nuevo.",
      );
    } finally {
      setEnviando(false);
    }
  }

  const etiquetaSentido = sentido === "max" ? "Max" : "Min";

  return (
    <div className="rejilla-dos-columnas">
      <div className="pila">
        <AvisoDemo texto="Los valores iniciales son los del ejemplo max-dos-variables y puedes editarlos. Esta pantalla solo valida la estructura: no resuelve este modelo ni reemplaza los datos fijos de las otras pantallas." />

        <Panel
          titulo="Sentido y tamaño del modelo"
          descripcion="Define el objetivo, cuántas variables y cuántas restricciones tendrá el problema."
        >
          <div className="pila pila--compacta">
            <fieldset className="campo">
              <legend className="campo__etiqueta">Sentido de optimización</legend>
              <div className="segmentado">
                <label className="segmentado__opcion">
                  <input
                    type="radio"
                    name="sentido"
                    value="max"
                    checked={sentido === "max"}
                    onChange={() => {
                      setValidacionExitosa(false);
                      setErroresServidor([]);
                      setSentido("max");
                    }}
                  />
                  Maximizar
                </label>
                <label className="segmentado__opcion">
                  <input
                    type="radio"
                    name="sentido"
                    value="min"
                    checked={sentido === "min"}
                    onChange={() => {
                      setValidacionExitosa(false);
                      setErroresServidor([]);
                      setSentido("min");
                    }}
                  />
                  Minimizar
                </label>
              </div>
            </fieldset>

            <div className="campo-contador">
              <div className="campo-contador__texto">
                <span className="campo-contador__titulo">Variables</span>
                <span className="campo__ayuda">Mínimo 1, máximo {MAX_VARIABLES}.</span>
              </div>
              <div className="contador">
                <button
                  type="button"
                  className="contador__boton"
                  aria-label="Quitar una variable"
                  disabled={objetivo.length <= 1}
                  onClick={() => ajustarVariables(-1)}
                >
                  −
                </button>
                <span className="contador__valor" aria-live="polite">
                  {objetivo.length}
                </span>
                <button
                  type="button"
                  className="contador__boton"
                  aria-label="Añadir una variable"
                  disabled={objetivo.length >= MAX_VARIABLES}
                  onClick={() => ajustarVariables(1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="campo-contador">
              <div className="campo-contador__texto">
                <span className="campo-contador__titulo">Restricciones</span>
                <span className="campo__ayuda">
                  Mínimo 1, máximo {MAX_RESTRICCIONES}.
                </span>
              </div>
              <div className="contador">
                <button
                  type="button"
                  className="contador__boton"
                  aria-label="Quitar una restricción"
                  disabled={restricciones.length <= 1}
                  onClick={() => ajustarRestricciones(-1)}
                >
                  −
                </button>
                <span className="contador__valor" aria-live="polite">
                  {restricciones.length}
                </span>
                <button
                  type="button"
                  className="contador__boton"
                  aria-label="Añadir una restricción"
                  disabled={restricciones.length >= MAX_RESTRICCIONES}
                  onClick={() => ajustarRestricciones(1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          titulo="Función objetivo"
          descripcion="Coeficientes de cada variable. El navegador solo valida; el cálculo lo hará el backend en un sprint posterior."
        >
          <div className="metricas">
            {objetivo.map((valor, indice) => {
              const clave = `objetivo-${indice}`;
              const error = errores[clave];
              return (
                <div className="campo" key={clave}>
                  <label className="campo__etiqueta" htmlFor={`objetivo-${indice}`}>
                    Coeficiente de {subindice(`x${indice + 1}`)}
                  </label>
                  <input
                    id={`objetivo-${indice}`}
                    className={`entrada entrada--numero${error ? " entrada--error" : ""}`}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={valor}
                    aria-invalid={error !== undefined}
                    aria-describedby={error ? `error-${clave}` : undefined}
                    onChange={(evento) =>
                      cambiarObjetivo(indice, evento.target.value)
                    }
                  />
                  {error !== undefined && (
                    <p className="campo__error" id={`error-${clave}`} aria-live="polite">
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel
          titulo="Restricciones"
          descripcion="Cada fila debe tener un coeficiente por variable. Usa ≤, ≥ o = y escribe el lado derecho."
          acciones={
            <button
              type="button"
              className="boton boton--secundario"
              onClick={() => ajustarRestricciones(1)}
              disabled={restricciones.length >= MAX_RESTRICCIONES}
            >
              Añadir restricción
            </button>
          }
        >
          <TablaDesplazable etiqueta="Tabla de restricciones del modelo">
            <table className="tabla tabla--entrada">
              <thead>
                <tr>
                  <th scope="col">Restricción</th>
                  {variables.map((variable) => (
                    <th scope="col" key={variable}>
                      {subindice(variable)}
                    </th>
                  ))}
                  <th scope="col">Relación</th>
                  <th scope="col">Lado derecho</th>
                  <th scope="col" className="tabla__accion">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {restricciones.map((fila, indiceFila) => {
                  const nombre = `R${indiceFila + 1}`;
                  return (
                    <tr key={nombre}>
                      <th scope="row">{nombre}</th>
                      {fila.coeficientes.map((valor, indiceCoef) => {
                        const clave = `restriccion-${indiceFila}-coef-${indiceCoef}`;
                        const error = errores[clave];
                        return (
                          <td key={clave}>
                            <input
                              className={`entrada entrada--numero${error ? " entrada--error" : ""}`}
                              type="text"
                              inputMode="decimal"
                              autoComplete="off"
                              aria-label={`Coeficiente de x${indiceCoef + 1} en ${nombre}`}
                              aria-invalid={error !== undefined}
                              aria-describedby={error ? `error-${clave}` : undefined}
                              value={valor}
                              onChange={(evento) =>
                                cambiarCoeficiente(
                                  indiceFila,
                                  indiceCoef,
                                  evento.target.value,
                                )
                              }
                            />
                            {error !== undefined && (
                              <p className="campo__error" id={`error-${clave}`} aria-live="polite">
                                {error}
                              </p>
                            )}
                          </td>
                        );
                      })}
                      <td>
                        <select
                          className="entrada"
                          aria-label={`Relación de ${nombre}`}
                          value={fila.signo}
                          onChange={(evento) =>
                            cambiarSigno(
                              indiceFila,
                              evento.target.value as SignoRelacion,
                            )
                          }
                        >
                          <option value="<=">≤ (menor o igual)</option>
                          <option value=">=">≥ (mayor o igual)</option>
                          <option value="=">= (igual)</option>
                        </select>
                      </td>
                      <td>
                        {(() => {
                          const clave = `restriccion-${indiceFila}-derecha`;
                          const error = errores[clave];
                          return (
                            <>
                              <input
                                className={`entrada entrada--numero${error ? " entrada--error" : ""}`}
                                type="text"
                                inputMode="decimal"
                                autoComplete="off"
                                aria-label={`Lado derecho de ${nombre}`}
                                aria-invalid={error !== undefined}
                                aria-describedby={error ? `error-${clave}` : undefined}
                                value={fila.ladoDerecho}
                                onChange={(evento) =>
                                  cambiarLadoDerecho(
                                    indiceFila,
                                    evento.target.value,
                                  )
                                }
                              />
                              {error !== undefined && (
                                <p className="campo__error" id={`error-${clave}`} aria-live="polite">
                                  {error}
                                </p>
                              )}
                            </>
                          );
                        })()}
                      </td>
                      <td className="tabla__accion">
                        <button
                          type="button"
                          className="boton boton--peligro"
                          aria-label={`Quitar la restricción ${nombre}`}
                          disabled={restricciones.length <= 1}
                          onClick={() => ajustarRestricciones(-1)}
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TablaDesplazable>
        </Panel>

        <Panel
          titulo="Validación"
          descripcion="Se comprueba la estructura del modelo; el prototipo todavía no lo resuelve."
        >
          <div className="pila pila--compacta">
            <p
              className={`resumen-errores ${
                numeroErrores > 0 ? "resumen-errores--error" : "resumen-errores--ok"
              }`}
              role="status"
              aria-live="polite"
            >
              {validacionExitosa
                ? "Estructura validada correctamente. Este prototipo todavía no calcula la solución."
                : numeroErrores === 0
                  ? "El modelo está completo y listo para validarse."
                  : `${numeroErrores} ${
                    numeroErrores === 1 ? "campo necesita" : "campos necesitan"
                  } corrección antes de continuar.`}
            </p>

            {erroresServidor.length > 0 && (
              <div className="aviso aviso--error" role="alert">
                <span className="aviso__icono" aria-hidden="true">
                  !
                </span>
                <div className="aviso__contenido">
                  <p className="aviso__titulo">El servidor encontró estos problemas</p>
                  <ul className="pasos__lista texto-pequeno">
                    {erroresServidor.map((error) => (
                      <li key={`${error.campo}-${error.mensaje}`}>
                        <strong>{error.campo}:</strong> {error.mensaje}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {avisoRed !== null && (
              <div className="aviso aviso--aviso" role="status">
                <span className="aviso__icono" aria-hidden="true">
                  !
                </span>
                <div className="aviso__contenido">
                  <p className="aviso__titulo">No se pudo contactar el servidor</p>
                  <p className="aviso__texto">{avisoRed}</p>
                </div>
                <div className="aviso__acciones">
                  <button
                    type="button"
                    className="boton boton--secundario"
                    onClick={() => {
                      void manejarValidacion();
                    }}
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              className="boton boton--primario boton--ancho"
              onClick={() => void manejarValidacion()}
              disabled={numeroErrores > 0 || enviando}
            >
              {enviando ? "Validando con el servidor…" : "Validar estructura"}
            </button>
            <p className="campo__ayuda">
              Se enviará el modelo a <code>POST /validar</code>. El resultado,
              gráfico y sensibilidad disponibles son ejemplos fijos, no la
              solución de este modelo.
            </p>
          </div>
        </Panel>
      </div>

      <aside className="pila" aria-label="Vista previa del modelo">
        <Panel
          titulo="Vista previa del modelo"
          descripcion="Se actualiza con cada cambio, sin enviar nada al servidor."
          className="panel--destacado"
        >
          <div className="previa__meta">
            <Pastilla tono={sentido === "max" ? "exito" : "info"}>
              {sentido === "max" ? "Maximizar" : "Minimizar"}
            </Pastilla>
            <Pastilla tono="neutro">
              {objetivo.length} {objetivo.length === 1 ? "variable" : "variables"}
            </Pastilla>
            <Pastilla tono="neutro">
              {restricciones.length}{" "}
              {restricciones.length === 1 ? "restricción" : "restricciones"}
            </Pastilla>
          </div>

          <div className="formula--destacada" aria-live="polite">
            {etiquetaSentido} Z ={" "}
            {formatearExpresion(objetivo, variables)}
          </div>

          <div className="formula pila pila--compacta" aria-live="polite">
            {restricciones.map((fila, indice) => (
              <div className="formula__fila" key={`previa-${indice}`}>
                <span className="formula__etiqueta">{`R${indice + 1}`}</span>
                <span className="formula__expresion">
                  {formatearRestriccion(
                    fila.coeficientes,
                    fila.signo,
                    fila.ladoDerecho,
                    variables,
                  )}
                </span>
              </div>
            ))}
          </div>

          <p className="previa__nota">
            Notación: {formatearSigno("<=")} menor o igual,{" "}
            {formatearSigno(">=")} mayor o igual. Los subíndices identifican
            cada variable.
          </p>
        </Panel>

        <div className="aviso aviso--info" role="note">
          <span className="aviso__icono" aria-hidden="true">
            i
          </span>
          <div className="aviso__contenido">
            <p className="aviso__titulo">Validación en dos capas</p>
            <p className="aviso__texto">
              El formulario revisa campos vacíos y valores no numéricos; el
              backend confirma la estructura con reglas propias.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
