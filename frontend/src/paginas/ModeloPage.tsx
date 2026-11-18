/**
 * ModeloPage — Pantalla 1: captura del modelo.
 * Envuelve el formulario con el título de la sección y una breve guía.
 */

import { FormularioProblema } from "../componentes/FormularioProblema";
import { Pastilla } from "../componentes/comunes/Pastilla";

/** Página de entrada del prototipo. */
export function ModeloPage() {
  return (
    <div className="pagina">
      <header className="pagina__cabecera">
        <div>
          <h1 className="pagina__titulo">Modelo</h1>
          <p className="pagina__intro">
            Define la función objetivo y las restricciones. La vista previa usa
            notación matemática y el servidor confirma la estructura antes de
            continuar.
          </p>
        </div>
        <Pastilla tono="info">Paso 1 de 4</Pastilla>
      </header>
      <FormularioProblema />
    </div>
  );
}
