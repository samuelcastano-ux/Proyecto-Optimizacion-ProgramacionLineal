/**
 * GraficoPage — Pantalla 4: método gráfico del ejemplo de dos variables.
 * Valida que el modelo tenga dos variables y pasa los datos al SVG.
 */

import { useEjemplo } from "../api/useEjemplo";
import { GraficoDos } from "../componentes/GraficoDos";
import { EstadoRemoto } from "../componentes/comunes/EstadoRemoto";
import { Pastilla } from "../componentes/comunes/Pastilla";

/** Página del gráfico 2D. */
export function GraficoPage() {
  const { datos, cargando, error, reintentar } = useEjemplo("max-dos-variables");

  return (
    <div className="pagina">
      <header className="pagina__cabecera">
        <div>
          <h1 className="pagina__titulo">Gráfico 2D</h1>
          <p className="pagina__intro">
            Región factible, rectas de restricción, vértices factibles y la recta
            de isoutilidad que pasa por el óptimo.
          </p>
        </div>
        <Pastilla tono="neutro">Método gráfico</Pastilla>
      </header>

      <EstadoRemoto cargando={cargando} error={error} onReintentar={reintentar}>
        {datos !== null && <GraficoDos ejemplo={datos} />}
      </EstadoRemoto>
    </div>
  );
}
