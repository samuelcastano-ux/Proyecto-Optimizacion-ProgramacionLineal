/**
 * api/cliente.ts — Cliente HTTP tipado hacia el backend FastAPI.
 * La URL base se configura con VITE_API_URL; nunca se calculan soluciones aquí.
 */

import type {
  EjemploCompleto,
  EjemploResumen,
  ModeloEntrada,
  RespuestaValidacion,
} from "../tipos/problema";

/** URL base del backend, configurable en el archivo .env. */
export const URL_API = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

/** Error de red o de respuesta HTTP, con el estado cuando existe. */
export class ErrorApi extends Error {
  readonly estado: number;

  constructor(mensaje: string, estado = 0) {
    super(mensaje);
    this.name = "ErrorApi";
    this.estado = estado;
  }
}

/** Mensaje genérico y claro para fallos de conexión. */
const MENSAJE_SIN_CONEXION = `No pudimos comunicarnos con el servidor (${URL_API}). Verifica que el backend esté en marcha y vuelve a intentarlo.`;

/**
 * Ejecuta una petición y devuelve el JSON tipado.
 * Lanza ErrorApi con un mensaje en español si la red o el estado fallan.
 */
async function solicitar<T>(
  ruta: string,
  opciones: RequestInit = {},
): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      headers: { Accept: "application/json", ...opciones.headers },
      ...opciones,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ErrorApi(MENSAJE_SIN_CONEXION);
  }

  if (!respuesta.ok) {
    const detalle = await leerMensajeDeError(respuesta);
    throw new ErrorApi(detalle, respuesta.status);
  }

  return (await respuesta.json()) as T;
}

/** Intenta extraer un mensaje útil del cuerpo de error del backend. */
async function leerMensajeDeError(respuesta: Response): Promise<string> {
  try {
    const cuerpo = (await respuesta.json()) as {
      detail?: unknown;
      errores?: unknown;
    };
    if (typeof cuerpo.detail === "string") {
      return cuerpo.detail;
    }
    if (Array.isArray(cuerpo.errores) && cuerpo.errores.length > 0) {
      return "El servidor rechazó los datos enviados. Revisa el modelo e inténtalo de nuevo.";
    }
  } catch {
    // El cuerpo no era JSON: se usa el mensaje por defecto.
  }

  if (respuesta.status === 404) {
    return "No encontramos el recurso solicitado en el servidor.";
  }
  return `El servidor respondió con un error (${respuesta.status}). Inténtalo de nuevo en unos segundos.`;
}

/** GET /salud */
export function consultarSalud(senal?: AbortSignal): Promise<{ estado: string }> {
  return solicitar<{ estado: string }>("/salud", { signal: senal });
}

/** GET /ejemplos */
export function listarEjemplos(senal?: AbortSignal): Promise<EjemploResumen[]> {
  return solicitar<EjemploResumen[]>("/ejemplos", { signal: senal });
}

/** GET /ejemplos/{id} */
export function obtenerEjemplo(
  id: string,
  senal?: AbortSignal,
): Promise<EjemploCompleto> {
  return solicitar<EjemploCompleto>(`/ejemplos/${encodeURIComponent(id)}`, {
    signal: senal,
  });
}

/**
 * POST /validar
 * Un 422 es una respuesta esperada (errores de validación), no una excepción.
 */
export async function validarModelo(
  modelo: ModeloEntrada,
  senal?: AbortSignal,
): Promise<RespuestaValidacion> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${URL_API}/validar`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(modelo),
      signal: senal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ErrorApi(MENSAJE_SIN_CONEXION);
  }

  if (respuesta.status === 422) {
    return (await respuesta.json()) as RespuestaValidacion;
  }

  if (!respuesta.ok) {
    throw new ErrorApi(await leerMensajeDeError(respuesta), respuesta.status);
  }

  return (await respuesta.json()) as RespuestaValidacion;
}
