/**
 * PasoAPasoPage — Pantalla 3: recorrido del ejemplo de Gran M.
 * Consume el ejemplo de minimización y muestra sus tableros fijos.
 */

import { useEjemplo } from "../api/useEjemplo";
import { PasoAPaso } from "../componentes/PasoAPaso";
import { EstadoRemoto } from "../componentes/comunes/EstadoRemoto";
import { Pastilla } from "../componentes/comunes/Pastilla";

/** Página del paso a paso. */
export function PasoAPasoPage() {
  const { datos, cargando, error, reintentar } = useEjemplo("gran-m-minimizacion");

  return (
    <div className="pagina">
      <header className="pagina__cabecera">
        <div>
          <h1 className="pagina__titulo">Paso a paso</h1>
          <p className="pagina__intro">
            Forma estándar, tablero inicial y solución final del ejemplo de
            minimización resuelto con Gran M.
          </p>
        </div>
        <Pastilla tono="info">Gran M</Pastilla>
      </header>

      <EstadoRemoto cargando={cargando} error={error} onReintentar={reintentar}>
        {datos !== null && <PasoAPaso ejemplo={datos} />}
      </EstadoRemoto>
    </div>
  );
}
