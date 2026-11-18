/**
 * PasoAPaso — Pantalla 3: recorrido guiado del ejemplo de Gran M.
 * Los tableros y las razones vienen fijos del backend; la interfaz solo resalta
 * la columna que entra, la fila que sale y el pivote.
 */

import { useState } from "react";

import { formatearValor, subindice } from "../formato/fracciones";
import type { EjemploCompleto } from "../tipos/problema";
import { AvisoDemo } from "./comunes/AvisoDemo";
import { Metrica } from "./comunes/Metrica";
import { Panel } from "./comunes/Panel";
import { Pastilla } from "./comunes/Pastilla";
import { TablaDesplazable } from "./comunes/TablaDesplazable";

interface PropsPasoAPaso {
  /** Ejemplo de minimización resuelto por Gran M. */
  ejemplo: EjemploCompleto;
}

/** Pantalla con navegación anterior/siguiente entre los pasos del método. */
export function PasoAPaso({ ejemplo }: PropsPasoAPaso) {
  const [indice, setIndice] = useState<number>(0);

  const tablero = ejemplo.tablero_inicial;
  const iteracion = ejemplo.iteracion;
  const entra = iteracion?.entra ?? "";
  const sale = iteracion?.sale ?? "";
  const pivote = iteracion?.pivote ?? "";
  const filaQueSale = tablero?.filas.find((fila) => fila.base === sale);

  const pasos = ["Forma estándar", "Iteración 1 · tablero inicial", "Solución final"];
  const ultimoPaso = pasos.length - 1;

  return (
    <div className="pila">
      <AvisoDemo texto="El tablero, las razones y la solución son datos fijos del enunciado; el navegador no ejecuta el algoritmo." />

      <Panel
        titulo="Recorrido del método"
        descripcion="Usa los botones para avanzar o volver. Cada paso explica qué está ocurriendo en el tablero."
        acciones={
          <div className="fila">
            <button
              type="button"
              className="boton boton--secundario"
              onClick={() => setIndice((valor) => Math.max(0, valor - 1))}
              disabled={indice === 0}
            >
              Anterior
            </button>
            <button
              type="button"
              className="boton boton--primario"
              onClick={() => setIndice((valor) => Math.min(ultimoPaso, valor + 1))}
              disabled={indice === ultimoPaso}
            >
              Siguiente
            </button>
          </div>
        }
      >
        <div className="pasos__cabecera">
          <Pastilla tono="info">{pasos[indice]}</Pastilla>
          <span className="pasos__indicador">
            Paso {indice + 1} de {pasos.length}
          </span>
        </div>

        <div className="pasos__contenido" aria-live="polite">
          {indice === 0 && (
            <>
              <p>
                <strong>Se lleva el modelo a forma estándar.</strong> Las
                restricciones de igualdad y de mayor o igual necesitan variables
                artificiales, que se penalizan con una M muy grande.
              </p>
              {ejemplo.forma_estandar !== null ? (
                <div className="formula--destacada">
                  {ejemplo.forma_estandar.map((ecuacion) => (
                    <p key={ecuacion} className="formula__expresion">
                      {ecuacion}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="texto-suave">El ejemplo no incluye la forma estándar.</p>
              )}
              {ejemplo.funcion_penalizada !== null && (
                <p className="formula">{ejemplo.funcion_penalizada}</p>
              )}
              <p className="pasos__explicacion">
                La función penalizada suma M·a₁ y M·a₂. Mientras las variables
                artificiales sigan en la base, su costo domina la función objetivo.
              </p>
            </>
          )}

          {indice === 1 && (
            <>
              <p>
                <strong>Tablero inicial.</strong> Se elige la columna con el
                criterio de entrada y se calcula la razón mínima para decidir qué
                variable sale de la base.
              </p>

              {tablero !== null ? (
                <TablaDesplazable etiqueta="Tablero inicial del método de la Gran M">
                  <table className="tabla tabla--fija tabla--compacta">
                    <caption>
                      Base actual: {tablero.filas.map((fila) => subindice(fila.base)).join(", ")}.
                      La columna que entra es {subindice(entra)} y la fila que sale
                      es {subindice(sale)}.
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Base</th>
                        <th scope="col">Cb</th>
                        {tablero.columnas.map((columna) => (
                          <th
                            scope="col"
                            key={columna}
                            className={columna === entra ? "tabla__entra" : undefined}
                          >
                            {columna === "b" ? "b" : subindice(columna)}
                          </th>
                        ))}
                        <th scope="col">Razón</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tablero.filas.map((fila) => (
                        <tr
                          key={fila.base}
                          className={
                            fila.base === sale ? "tabla__destacada" : undefined
                          }
                        >
                          <th scope="row">{subindice(fila.base)}</th>
                          <td className="tabla__numero">{fila.cb}</td>
                          {fila.coeficientes.map((coeficiente, posicion) => {
                            const columna = tablero.columnas[posicion] ?? "";
                            const esPivote =
                              fila.base === sale && columna === entra;
                            return (
                              <td
                                key={`${fila.base}-${columna}`}
                                className={
                                  esPivote
                                    ? "tabla__numero tabla__celda-pivote"
                                    : "tabla__numero"
                                }
                              >
                                {coeficiente}
                              </td>
                            );
                          })}
                          <td className="tabla__numero">{fila.lado_derecho}</td>
                          <td className="tabla__numero">{fila.razon}</td>
                        </tr>
                      ))}
                      <tr>
                        <th scope="row">Cj − Zj</th>
                        <td />
                        {tablero.cj_menos_zj.map((valor, posicion) => (
                          <td
                            key={`cj-${posicion}`}
                            className="tabla__numero"
                          >
                            {valor}
                          </td>
                        ))}
                        <td className="tabla__numero">Z = {tablero.z}</td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                </TablaDesplazable>
              ) : (
                <p className="texto-suave">El ejemplo no incluye el tablero inicial.</p>
              )}

              <div className="metricas">
                <Metrica etiqueta="Entra a la base" valor={subindice(entra)} detalle="Columna resaltada" />
                <Metrica etiqueta="Sale de la base" valor={subindice(sale)} detalle="Fila resaltada" />
                <Metrica etiqueta="Pivote" valor={pivote} detalle="Intersección" />
                <Metrica
                  etiqueta="Razón mínima"
                  valor={filaQueSale?.razon ?? "—"}
                  detalle="Cociente b / coeficiente"
                />
              </div>

              <p className="pasos__explicacion">
                Entra <strong>{subindice(entra)}</strong> porque su indicador
                Cj − Zj es el más favorable del tablero y permite reducir la
                función penalizada. Sale <strong>{subindice(sale)}</strong> por la
                razón mínima {filaQueSale?.razon ?? "—"}. El pivote es{" "}
                <strong>{pivote}</strong>.
              </p>
            </>
          )}

          {indice === 2 && (
            <>
              <p>
                <strong>Solución final.</strong> Después de la iteración, las
                variables artificiales salen de la base y queda el óptimo del
                modelo original.
              </p>

              {ejemplo.solucion !== null ? (
                <div className="metricas">
                  {Object.entries(ejemplo.solucion)
                    .filter(([clave]) => clave !== "Z")
                    .map(([clave, valor]) => (
                      <Metrica
                        key={clave}
                        etiqueta={subindice(clave)}
                        valor={formatearValor(valor)}
                        detalle="Variable de decisión"
                      />
                    ))}
                  <Metrica
                    etiqueta="Z (mínimo)"
                    valor={formatearValor(ejemplo.solucion.Z ?? "—")}
                    detalle="Valor óptimo"
                    destacada
                  />
                </div>
              ) : (
                <p className="texto-suave">El ejemplo no incluye la solución final.</p>
              )}

              <p className="pasos__explicacion">
                Las fracciones se conservan exactas: {formatearValor(ejemplo.solucion?.x1 ?? "—")} y{" "}
                {formatearValor(ejemplo.solucion?.x2 ?? "—")} son los valores de
                las variables; el valor mínimo es{" "}
                {formatearValor(ejemplo.solucion?.Z ?? "—")}. En un sprint
                posterior estas cifras las calculará el solver y no estarán
                escritas en el JSON.
              </p>
            </>
          )}
        </div>
      </Panel>
    </div>
  );
}
