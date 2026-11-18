/**
 * api/useEjemplo.ts — Hook de carga de un ejemplo fijo del backend.
 * Centraliza estados de carga, error y reintento para todas las pantallas.
 */

import { useCallback, useEffect, useState } from "react";

import { obtenerEjemplo } from "./cliente";
import type { EjemploCompleto } from "../tipos/problema";

/** Estado que expone el hook a las páginas. */
export interface EstadoEjemplo {
  datos: EjemploCompleto | null;
  cargando: boolean;
  error: string | null;
  reintentar: () => void;
}

/**
 * Carga GET /ejemplos/{id} al montar la página y permite reintentar.
 * Cancela la petición anterior si el componente se desmonta.
 */
export function useEjemplo(id: string): EstadoEjemplo {
  const [datos, setDatos] = useState<EjemploCompleto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState<number>(0);

  // La carga se deduce del estado: sin datos y sin error equivale a "cargando".
  const cargando = datos === null && error === null;

  const reintentar = useCallback(() => {
    setDatos(null);
    setError(null);
    setIntento((valor) => valor + 1);
  }, []);

  useEffect(() => {
    const controlador = new AbortController();
    let activo = true;

    obtenerEjemplo(id, controlador.signal)
      .then((ejemplo) => {
        if (activo) {
          setDatos(ejemplo);
        }
      })
      .catch((fallo: unknown) => {
        if (!activo || controlador.signal.aborted) {
          return;
        }
        setError(
          fallo instanceof Error
            ? fallo.message
            : "No pudimos cargar el ejemplo. Revisa la conexión e inténtalo de nuevo.",
        );
      });

    return () => {
      activo = false;
      controlador.abort();
    };
  }, [id, intento]);

  return { datos, cargando, error, reintentar };
}
