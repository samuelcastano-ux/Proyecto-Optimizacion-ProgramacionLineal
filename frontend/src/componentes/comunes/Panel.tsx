/**
 * Panel — contenedor visual reutilizable con título, descripción y acciones.
 * Unifica el espaciado y la jerarquía de todas las tarjetas del prototipo.
 */

import type { ReactNode } from "react";

interface PropsPanel {
  /** Título visible del panel. */
  titulo: string;
  /** Texto breve que explica el contenido. */
  descripcion?: ReactNode;
  /** Botones o pastillas alineados a la derecha del título. */
  acciones?: ReactNode;
  /** Contenido interno del panel. */
  children: ReactNode;
  /** Clases adicionales para variantes (por ejemplo, panel--destacado). */
  className?: string;
  /** Quita el relleno cuando el contenido es una tabla a sangre. */
  sinRelleno?: boolean;
}

/** Tarjeta semántica con cabecera y cuerpo. */
export function Panel({
  titulo,
  descripcion,
  acciones,
  children,
  className,
  sinRelleno = false,
}: PropsPanel) {
  return (
    <section className={`panel ${className ?? ""}`.trim()}>
      <header className="panel__cabecera">
        <div>
          <h2 className="panel__titulo">{titulo}</h2>
          {descripcion !== undefined && (
            <p className="panel__descripcion">{descripcion}</p>
          )}
        </div>
        {acciones !== undefined && <div className="panel__acciones">{acciones}</div>}
      </header>
      <div className={`panel__cuerpo${sinRelleno ? " panel__cuerpo--sin-relleno" : ""}`}>
        {children}
      </div>
    </section>
  );
}
