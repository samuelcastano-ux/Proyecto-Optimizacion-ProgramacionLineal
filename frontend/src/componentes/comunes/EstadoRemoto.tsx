/**
 * EstadoRemoto — resuelve los estados de carga y error de las pantallas.
 * Si la API no responde, explica el problema y ofrece un botón para reintentar.
 */

import type { ReactNode } from "react";

import { Panel } from "./Panel";

interface PropsEstadoRemoto {
  /** La petición sigue en curso. */
  cargando: boolean;
  /** Mensaje de error en español, o null si todo salió bien. */
  error: string | null;
  /** Vuelve a lanzar la petición. */
  onReintentar: () => void;
  /** Contenido que se muestra cuando ya hay datos. */
  children: ReactNode;
}

/** Envoltorio de carga y error para las páginas que consumen la API. */
export function EstadoRemoto({
  cargando,
  error,
  onReintentar,
  children,
}: PropsEstadoRemoto) {
  if (cargando) {
    return (
      <Panel titulo="Cargando el ejemplo">
        <p className="texto-suave" role="status" aria-live="polite">
          Estamos consultando los datos fijos del servidor…
        </p>
      </Panel>
    );
  }

  if (error !== null) {
    return (
      <Panel
        titulo="No pudimos cargar la información"
        className="panel--error"
        acciones={
          <button type="button" className="boton boton--secundario" onClick={onReintentar}>
            Reintentar
          </button>
        }
      >
        <div className="aviso aviso--error" role="alert">
          <span className="aviso__icono" aria-hidden="true">
            !
          </span>
          <div className="aviso__contenido">
            <p className="aviso__texto">{error}</p>
          </div>
        </div>
      </Panel>
    );
  }

  return <>{children}</>;
}
