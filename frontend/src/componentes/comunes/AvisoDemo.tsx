/**
 * AvisoDemo — recordatorio no bloqueante de que los datos son de ejemplo.
 * Reemplaza el "toast" del boceto por un aviso estable dentro de la página.
 */

interface PropsAvisoDemo {
  /** Permite cambiar el texto en pantallas con matices propios. */
  texto?: string;
  /** Variante visual del aviso. */
  tono?: "info" | "aviso";
}

/** Aviso fijo sobre el origen de los datos mostrados. */
export function AvisoDemo({
  texto = "Las cifras provienen de la API y no de un cálculo en el navegador.",
  tono = "info",
}: PropsAvisoDemo) {
  return (
    <aside className={`aviso aviso--${tono}`} role="note">
      <span className="aviso__icono" aria-hidden="true">
        i
      </span>
      <div className="aviso__contenido">
        <p className="aviso__titulo">Datos de ejemplo fijos</p>
        <p className="aviso__texto">{texto}</p>
      </div>
    </aside>
  );
}
