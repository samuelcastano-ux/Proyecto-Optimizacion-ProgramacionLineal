/**
 * Sensibilidad — Pantalla 5: precios sombra, costos reducidos y rangos exactos.
 * Solo formatea los datos de la API; no recalcula rangos ni soluciones.
 */

import { formatearRango, formatearValor, subindice } from "../formato/fracciones";
import type { EjemploCompleto, RangoValores } from "../tipos/problema";
import { AvisoDemo } from "./comunes/AvisoDemo";
import { Panel } from "./comunes/Panel";
import { TablaDesplazable } from "./comunes/TablaDesplazable";

interface PropsSensibilidad {
  /** Ejemplo con análisis de sensibilidad fijo. */
  ejemplo: EjemploCompleto;
}

/** Comprueba si un aumento de una unidad sigue dentro del rango de factibilidad. */
function aumentoDentroDelRango(
  ladoDerecho: number,
  rango: RangoValores | undefined,
): boolean {
  if (rango === undefined) {
    return true;
  }
  if (rango.maximo === "+∞" || rango.maximo === "∞") {
    return true;
  }
  const maximo = Number(rango.maximo);
  return !Number.isFinite(maximo) || ladoDerecho + 1 <= maximo;
}

/** Pantalla de análisis de sensibilidad. */
export function Sensibilidad({ ejemplo }: PropsSensibilidad) {
  const precios = Object.entries(ejemplo.precios_sombra ?? {});
  const costos = ejemplo.costos_reducidos ?? {};
  const rangosCoeficientes = ejemplo.rangos_coeficientes ?? {};
  const rangosDerechos = ejemplo.rangos_lado_derecho ?? {};

  const interpretaciones = ejemplo.restricciones.map((restriccion, indice) => {
    const clave = `R${indice + 1}`;
    const sombra = ejemplo.precios_sombra?.[clave];
    const ladoDerecho = Number(restriccion.lado_derecho ?? 0);
    if (sombra === undefined || !Number.isFinite(ladoDerecho)) {
      return null;
    }

    if (Number(sombra) === 0) {
      return `${clave}: un aumento de una unidad no cambia Z porque su precio sombra es 0.`;
    }

    if (!aumentoDentroDelRango(ladoDerecho, rangosDerechos[clave])) {
      return `${clave}: el aumento de una unidad queda fuera del rango de factibilidad, así que el precio sombra ya no aplica.`;
    }

    return `Si ${clave} aumenta de ${formatearValor(String(ladoDerecho))} a ${ladoDerecho + 1}, Z aumenta ${formatearValor(sombra)} unidades.`;
  });

  const sinDatos =
    precios.length === 0 &&
    Object.keys(costos).length === 0 &&
    Object.keys(rangosCoeficientes).length === 0 &&
    Object.keys(rangosDerechos).length === 0;

  return (
    <div className="pila">
      <AvisoDemo />

      {sinDatos ? (
        <Panel titulo="Sin análisis de sensibilidad">
          <p className="texto-suave">
            Este ejemplo del prototipo todavía no incluye precios sombra ni rangos.
          </p>
        </Panel>
      ) : (
        <>
          <Panel
            titulo="Precios sombra"
            descripcion="Cambio de Z por cada unidad adicional en el lado derecho, manteniendo válido el rango."
            sinRelleno
          >
            <TablaDesplazable etiqueta="Tabla de precios sombra">
              <table className="tabla">
                <thead>
                  <tr>
                    <th scope="col">Restricción</th>
                    <th scope="col" className="tabla__numero">
                      Precio sombra
                    </th>
                    <th scope="col">Unidades</th>
                  </tr>
                </thead>
                <tbody>
                  {precios.map(([clave, valor]) => (
                    <tr key={clave}>
                      <th scope="row">{clave}</th>
                      <td className="tabla__numero valor-fraccion">
                        {formatearValor(valor)}
                      </td>
                      <td className="texto-suave">unidades de Z por unidad de b</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TablaDesplazable>
          </Panel>

          <Panel
            titulo="Costos reducidos y rangos de coeficientes"
            descripcion="El rango de optimalidad indica cuánto puede moverse cada coeficiente sin cambiar las variables básicas."
            sinRelleno
          >
            <TablaDesplazable etiqueta="Tabla de costos reducidos y rangos de coeficientes">
              <table className="tabla">
                <thead>
                  <tr>
                    <th scope="col">Variable</th>
                    <th scope="col" className="tabla__numero">
                      Costo reducido
                    </th>
                    <th scope="col">Rango del coeficiente</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(costos).map((variable) => {
                    const rango = rangosCoeficientes[variable];
                    return (
                      <tr key={variable}>
                        <th scope="row">{subindice(variable)}</th>
                        <td className="tabla__numero valor-fraccion">
                          {formatearValor(costos[variable] ?? "—")}
                        </td>
                        <td className="valor-fraccion">
                          {rango !== undefined
                            ? formatearRango(rango.minimo, rango.maximo)
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TablaDesplazable>
          </Panel>

          <Panel
            titulo="Rangos de los lados derechos"
            descripcion="Dentro de estos intervalos el precio sombra se mantiene; fuera de ellos cambia la base óptima."
            sinRelleno
          >
            <TablaDesplazable etiqueta="Tabla de rangos de los lados derechos">
              <table className="tabla">
                <thead>
                  <tr>
                    <th scope="col">Restricción</th>
                    <th scope="col">Rango de factibilidad</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(rangosDerechos).map((clave) => {
                    const rango = rangosDerechos[clave];
                    return (
                      <tr key={clave}>
                        <th scope="row">{clave}</th>
                        <td className="valor-fraccion">
                          {rango !== undefined
                            ? formatearRango(rango.minimo, rango.maximo)
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TablaDesplazable>
          </Panel>

          <Panel titulo="Interpretación" descripcion="Lectura del precio sombra solo dentro del rango permitido.">
            <ul className="pasos__lista">
              {interpretaciones
                .filter((texto): texto is string => texto !== null)
                .map((texto) => (
                  <li key={texto}>{texto}</li>
                ))}
            </ul>
            <p className="texto-suave texto-pequeno margen-superior">
              Las fracciones y los infinitos se muestran con la notación exacta del
              backend: por ejemplo{" "}
              <span className="valor-fraccion">[80⁄3, 160]</span> o{" "}
              <span className="valor-fraccion">[16, +∞]</span>.
            </p>
          </Panel>
        </>
      )}
    </div>
  );
}
