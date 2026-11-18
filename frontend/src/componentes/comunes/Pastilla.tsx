/**
 * Pastilla — etiqueta compacta para estados y metadatos.
 * Usa los colores semánticos de tokens.css para mantener contraste AA.
 */

import type { ReactNode } from "react";

type TonoPastilla = "exito" | "info" | "aviso" | "neutro" | "error";

interface PropsPastilla {
  /** Contenido breve de la etiqueta. */
  children: ReactNode;
  /** Color semántico de la pastilla. */
  tono?: TonoPastilla;
}

/** Pequeña etiqueta de estado. */
export function Pastilla({ children, tono = "neutro" }: PropsPastilla) {
  return <span className={`pastilla pastilla--${tono}`}>{children}</span>;
}
