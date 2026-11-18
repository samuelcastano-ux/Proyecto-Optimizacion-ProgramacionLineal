/**
 * SensibilidadPage — Pantalla 5: análisis de sensibilidad del ejemplo fijo.
 * Presenta precios sombra, costos reducidos y rangos exactos.
 */

import { useEjemplo } from "../api/useEjemplo";
import { Sensibilidad } from "../componentes/Sensibilidad";
import { EstadoRemoto } from "../componentes/comunes/EstadoRemoto";
import { Pastilla } from "../componentes/comunes/Pastilla";

/** Página de sensibilidad. */
export function SensibilidadPage() {
  const { datos, cargando, error, reintentar } = useEjemplo("max-dos-variables");

  return (
    <div className="pagina">
      <header className="pagina__cabecera">
        <div>
          <h1 className="pagina__titulo">Sensibilidad</h1>
          <p className="pagina__intro">
            Cuánto puede moverse un coeficiente o un lado derecho sin que cambie
            la base óptima, con fracciones exactas.
          </p>
        </div>
        <Pastilla tono="info">Rangos exactos</Pastilla>
      </header>

      <EstadoRemoto cargando={cargando} error={error} onReintentar={reintentar}>
        {datos !== null && <Sensibilidad ejemplo={datos} />}
      </EstadoRemoto>
    </div>
  );
}
