/**
 * TablaDesplazable — contenedor accesible para tablas anchas.
 * Permite desplazamiento horizontal con teclado y conserva la primera columna fija.
 */

import type { ReactNode } from "react";

interface PropsTablaDesplazable {
  /** Descripción para lectores de pantalla. */
  etiqueta: string;
  /** Tabla u otro contenido desplazable. */
  children: ReactNode;
  /** Clases adicionales para el contenedor. */
  className?: string;
}

/** Región desplazable que envuelve una tabla ancha. */
export function TablaDesplazable({
  etiqueta,
  children,
  className,
}: PropsTablaDesplazable) {
  return (
    <div
      className={`tabla-scroll ${className ?? ""}`.trim()}
      role="region"
      aria-label={etiqueta}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
