/**
 * ResultadoPage — Pantalla 2: solución fija del modelo de dos variables.
 * Carga el ejemplo desde la API y delega la presentación en ResultadoSolucion.
 */

import { useEjemplo } from "../api/useEjemplo";
import { ResultadoSolucion } from "../componentes/ResultadoSolucion";
import { EstadoRemoto } from "../componentes/comunes/EstadoRemoto";
import { Pastilla } from "../componentes/comunes/Pastilla";

/** Página de resultados. */
export function ResultadoPage() {
  const { datos, cargando, error, reintentar } = useEjemplo("max-dos-variables");

  return (
    <div className="pagina">
      <header className="pagina__cabecera">
        <div>
          <h1 className="pagina__titulo">Resultado</h1>
          <p className="pagina__intro">
            Resumen del óptimo para el ejemplo de dos variables: valores de las
            variables, Z, uso de las restricciones y holguras.
          </p>
        </div>
        <Pastilla tono="exito">Datos fijos</Pastilla>
      </header>

      <EstadoRemoto cargando={cargando} error={error} onReintentar={reintentar}>
        {datos !== null && <ResultadoSolucion ejemplo={datos} />}
      </EstadoRemoto>
    </div>
  );
}
