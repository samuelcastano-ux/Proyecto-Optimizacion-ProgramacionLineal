/**
 * CapacidadDiez — Pantalla 6: maqueta de un modelo con diez variables.
 * Ilustra cómo se desplaza una tabla ancha manteniendo la primera columna fija;
 * no representa un problema resuelto.
 */

import { formatearSigno, formatearValor, subindice } from "../formato/fracciones";
import type { EjemploCompleto } from "../tipos/problema";
import { AvisoDemo } from "./comunes/AvisoDemo";
import { Panel } from "./comunes/Panel";
import { Pastilla } from "./comunes/Pastilla";
import { TablaDesplazable } from "./comunes/TablaDesplazable";

interface PropsCapacidad {
  /** Ejemplo de maqueta con diez variables. */
  ejemplo: EjemploCompleto;
}

/** Pantalla de capacidad máxima del modelo. */
export function CapacidadDiez({ ejemplo }: PropsCapacidad) {
  return (
    <div className="pila">
      <AvisoDemo texto="Los coeficientes son marcadores (a1,1 … a3,10); esta vista es una maqueta de diseño y no un problema resuelto." />

      <Panel
        titulo="Modelo de diez variables"
        descripcion={ejemplo.descripcion}
        acciones={<Pastilla tono="aviso">Maqueta de diseño</Pastilla>}
      >
        <div className="pila pila--compacta">
          <div className="aviso aviso--aviso" role="note">
            <span className="aviso__icono" aria-hidden="true">
              !
            </span>
            <div className="aviso__contenido">
              <p className="aviso__titulo">El método gráfico no aplica a este modelo</p>
              <p className="aviso__texto">
                El gráfico 2D solo puede representar dos variables; con diez
                variables la tabla es la vista principal.
              </p>
            </div>
          </div>

          <div className="aviso aviso--info" role="note">
            <span className="aviso__icono" aria-hidden="true">
              i
            </span>
            <div className="aviso__contenido">
              <p className="aviso__texto">
                Esta vista ilustra la distribución de la tabla; no es un problema
                resuelto. Desplázate horizontalmente: la primera columna permanece
                visible.
              </p>
            </div>
          </div>

          <TablaDesplazable etiqueta="Tabla del modelo de diez variables">
            <table className="tabla tabla--fija">
              <thead>
                <tr>
                  <th scope="col">Restricción</th>
                  {ejemplo.variables.map((variable) => (
                    <th scope="col" key={variable}>
                      {subindice(variable)}
                    </th>
                  ))}
                  <th scope="col">Relación</th>
                  <th scope="col">Lado derecho</th>
                </tr>
              </thead>
              <tbody>
                {ejemplo.restricciones.map((restriccion, indice) => (
                  <tr key={`fila-${indice + 1}`}>
                    <th scope="row">R{indice + 1}</th>
                    {restriccion.coeficientes.map((coeficiente, posicion) => (
                      <td className="tabla__numero" key={`coef-${indice}-${posicion}`}>
                        {coeficiente}
                      </td>
                    ))}
                    <td className="tabla__numero">
                      {formatearSigno(restriccion.signo)}
                    </td>
                    <td className="tabla__numero valor-fraccion">
                      {formatearValor(String(restriccion.lado_derecho ?? "—"))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TablaDesplazable>

          <p className="texto-suave texto-pequeno">
            {ejemplo.nota ??
              "El modelo completo se resolverá en un sprint posterior."}
          </p>
        </div>
      </Panel>
    </div>
  );
}
