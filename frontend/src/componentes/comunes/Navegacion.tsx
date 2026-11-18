/**
 * Navegacion — menú principal entre las seis pantallas del prototipo.
 * Usa NavLink de React Router para marcar la sección activa con aria-current.
 */

import { NavLink } from "react-router-dom";

/** Secciones disponibles y la ruta asociada. */
const SECCIONES = [
  { ruta: "/modelo", etiqueta: "Modelo" },
  { ruta: "/resultado", etiqueta: "Resultado" },
  { ruta: "/paso-a-paso", etiqueta: "Paso a paso" },
  { ruta: "/grafico", etiqueta: "Gráfico 2D" },
  { ruta: "/sensibilidad", etiqueta: "Sensibilidad" },
  { ruta: "/capacidad", etiqueta: "Capacidad (10 variables)" },
] as const;

/** Barra de navegación horizontal con desplazamiento en pantallas pequeñas. */
export function Navegacion() {
  return (
    <nav className="navegacion" aria-label="Secciones del prototipo">
      <div className="contenedor">
        <ul className="navegacion__lista">
          {SECCIONES.map((seccion) => (
            <li key={seccion.ruta}>
              <NavLink
                to={seccion.ruta}
                className={({ isActive }) =>
                  isActive
                    ? "navegacion__enlace navegacion__enlace--activo"
                    : "navegacion__enlace"
                }
              >
                {seccion.etiqueta}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
