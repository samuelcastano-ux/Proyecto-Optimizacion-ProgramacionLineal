/**
 * CapacidadPage — Pantalla 6: maqueta del modelo de diez variables.
 * Sirve para probar el diseño de una tabla ancha con columna fija.
 */

import { useEjemplo } from "../api/useEjemplo";
import { CapacidadDiez } from "../componentes/CapacidadDiez";
import { EstadoRemoto } from "../componentes/comunes/EstadoRemoto";
import { Pastilla } from "../componentes/comunes/Pastilla";

/** Página de capacidad máxima. */
export function CapacidadPage() {
  const { datos, cargando, error, reintentar } = useEjemplo("modelo-diez-variables");

  return (
    <div className="pagina">
      <header className="pagina__cabecera">
        <div>
          <h1 className="pagina__titulo">Capacidad (10 variables)</h1>
          <p className="pagina__intro">
            Vista de la tabla con el límite máximo de variables del prototipo.
            Es una maqueta de diseño, no un problema resuelto.
          </p>
        </div>
        <Pastilla tono="aviso">Sin solución</Pastilla>
      </header>

      <EstadoRemoto cargando={cargando} error={error} onReintentar={reintentar}>
        {datos !== null && <CapacidadDiez ejemplo={datos} />}
      </EstadoRemoto>
    </div>
  );
}
