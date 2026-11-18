/**
 * Encabezado — cabecera institucional del prototipo.
 * Muestra la marca, el nombre del proyecto y el alcance del Sprint 1.
 */

import { Pastilla } from "./Pastilla";

/** Cabecera principal de la aplicación. */
export function Encabezado() {
  return (
    <header className="cabecera">
      <div className="contenedor cabecera__interior">
        <div className="marca">
          <span className="marca__icono" aria-hidden="true">
            <svg
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 22V4M3 22h20" />
              <path d="M7 17l4-6 4 3 6-9" />
              <circle cx="21" cy="5" r="1.6" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <div>
            <p className="marca__nombre">Investigación de Operaciones</p>
            <p className="marca__titulo">Optimización · Programación Lineal</p>
          </div>
        </div>
        <Pastilla tono="info">Sprint 1 · datos fijos</Pastilla>
      </div>
    </header>
  );
}
