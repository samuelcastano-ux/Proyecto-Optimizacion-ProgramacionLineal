/**
 * ResultadoSolucion — Pantalla 2: resumen del óptimo con datos fijos.
 * Presenta métricas, uso de cada restricción y enlaces al gráfico y a la
 * sensibilidad; no realiza ningún cálculo.
 */

import { Link } from "react-router-dom";

import { formatearValor, subindice } from "../formato/fracciones";
import type { EjemploCompleto } from "../tipos/problema";
import { AvisoDemo } from "./comunes/AvisoDemo";
import { Metrica } from "./comunes/Metrica";
import { Panel } from "./comunes/Panel";
import { Pastilla } from "./comunes/Pastilla";
import { TablaDesplazable } from "./comunes/TablaDesplazable";

interface PropsResultado {
  /** Ejemplo resuelto entregado por la API. */
  ejemplo: EjemploCompleto;
}

/** Convierte el valor de una restricción a texto seguro. */
function valorDeRestriccion(valor: EjemploCompleto["restricciones"][number]["lado_derecho"]): string {
  if (valor === null) {
    return "—";
  }
  return formatearValor(String(valor));
}

/** Pantalla de resultados del modelo fijo. */
export function ResultadoSolucion({ ejemplo }: PropsResultado) {
  const solucion = ejemplo.solucion;
  const variables = Object.entries(solucion ?? {}).filter(([clave]) => clave !== "Z");
  const valorZ = solucion?.Z;

  const filas = ejemplo.restricciones.map((restriccion, indice) => {
    const clave = `R${indice + 1}`;
    const holgura = ejemplo.holguras?.[clave];
    const uso = ejemplo.usos?.[clave];
    return {
      clave,
      uso: uso !== undefined ? formatearValor(uso) : "—",
      limite: valorDeRestriccion(restriccion.lado_derecho),
      holgura: holgura !== undefined ? formatearValor(holgura) : "—",
      activa: holgura === "0",
    };
  });

  const activas = filas.filter((fila) => fila.activa).map((fila) => fila.clave);
  const conHolgura = filas.filter((fila) => !fila.activa);

  return (
    <div className="pila">
      <div className="fila fila--separada">
        <div>
          <p className="texto-suave texto-pequeno">Estado de la solución</p>
          <div className="fila fila--junta">
            <Pastilla tono={solucion ? "exito" : "neutro"}>
              {solucion ? "Óptimo único" : "Sin solución en el prototipo"}
            </Pastilla>
            <span className="texto-suave texto-pequeno">{ejemplo.titulo}</span>
          </div>
        </div>
        <Pastilla tono="info">Método: Gran M / simplex</Pastilla>
      </div>

      <AvisoDemo />

      {solucion ? (
        <>
          <Panel
            titulo="Valores óptimos"
            descripcion="Cifras exactas entregadas por la API; las fracciones se muestran sin convertir a decimales."
          >
            <div className="metricas">
              {variables.map(([clave, valor]) => (
                <Metrica
                  key={clave}
                  etiqueta={subindice(clave)}
                  valor={formatearValor(valor)}
                  detalle="Variable de decisión"
                />
              ))}
              <Metrica
                etiqueta="Z (función objetivo)"
                valor={formatearValor(valorZ ?? "—")}
                detalle={ejemplo.sentido === "max" ? "Valor máximo" : "Valor mínimo"}
                destacada
              />
            </div>
          </Panel>

          <Panel
            titulo="Uso de las restricciones"
            descripcion="Comparación entre el lado izquierdo en el óptimo, el límite y la holgura restante."
            sinRelleno
          >
            <TablaDesplazable etiqueta="Uso y holgura de las restricciones">
              <table className="tabla">
                <thead>
                  <tr>
                    <th scope="col">Restricción</th>
                    <th scope="col" className="tabla__numero">
                      Uso
                    </th>
                    <th scope="col" className="tabla__numero">
                      Límite
                    </th>
                    <th scope="col" className="tabla__numero">
                      Holgura
                    </th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((fila) => (
                    <tr key={fila.clave}>
                      <th scope="row">{fila.clave}</th>
                      <td className="tabla__numero valor-fraccion">{fila.uso}</td>
                      <td className="tabla__numero valor-fraccion">{fila.limite}</td>
                      <td className="tabla__numero valor-fraccion">{fila.holgura}</td>
                      <td>
                        <Pastilla tono={fila.activa ? "aviso" : "neutro"}>
                          {fila.activa ? "Activa" : "Con holgura"}
                        </Pastilla>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TablaDesplazable>
          </Panel>

          <Panel titulo="Lectura rápida" descripcion="Interpretación de las restricciones en el punto óptimo.">
            <p>
              {activas.length > 0 ? (
                <>
                  <strong>{activas.join(" y ")}</strong>{" "}
                  {activas.length === 1 ? "está activa" : "están activas"}: se usan
                  al 100 % y limitan el valor de Z.
                </>
              ) : (
                "Ninguna restricción está activa en la solución."
              )}{" "}
              {conHolgura.length > 0 && (
                <>
                  {conHolgura
                    .map((fila) => `${fila.clave} (holgura ${fila.holgura})`)
                    .join(", ")}{" "}
                  {conHolgura.length === 1 ? "conserva" : "conservan"} capacidad sin
                  usar.
                </>
              )}
            </p>
            <p className="texto-suave texto-pequeno margen-superior">
              El precio sombra de cada restricción activa mide cuánto cambiaría Z
              al mover su límite; el detalle está en Sensibilidad.
            </p>
          </Panel>

          <div className="enlaces">
            <Link className="enlace-flecha" to="/grafico">
              Ver el gráfico 2D <span aria-hidden="true">→</span>
            </Link>
            <Link className="enlace-flecha" to="/sensibilidad">
              Analizar la sensibilidad <span aria-hidden="true">→</span>
            </Link>
            <Link className="enlace-flecha" to="/paso-a-paso">
              Revisar el paso a paso <span aria-hidden="true">→</span>
            </Link>
          </div>
        </>
      ) : (
        <Panel titulo="Sin datos de solución">
          <p className="texto-suave">
            Este ejemplo del prototipo todavía no incluye una solución. En el
            Sprint 1 solo el modelo de dos variables está resuelto con datos fijos.
          </p>
        </Panel>
      )}
    </div>
  );
}
