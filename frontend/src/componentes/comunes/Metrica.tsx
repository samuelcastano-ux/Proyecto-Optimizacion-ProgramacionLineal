/**
 * Metrica — tarjeta para un valor puntual de la solución (variable o Z).
 * La variante destacada se reserva para el valor de la función objetivo.
 */

interface PropsMetrica {
  /** Nombre de la métrica, por ejemplo "x₁". */
  etiqueta: string;
  /** Valor exacto ya formateado. */
  valor: string;
  /** Aclaración opcional debajo del valor. */
  detalle?: string;
  /** Resalta la tarjeta con el color principal. */
  destacada?: boolean;
}

/** Tarjeta numérica de la pantalla de resultados. */
export function Metrica({
  etiqueta,
  valor,
  detalle,
  destacada = false,
}: PropsMetrica) {
  return (
    <article className={`metrica${destacada ? " metrica--destacada" : ""}`}>
      <p className="metrica__etiqueta">{etiqueta}</p>
      <p className="metrica__valor valor-fraccion">{valor}</p>
      {detalle !== undefined && <p className="metrica__detalle">{detalle}</p>}
    </article>
  );
}
