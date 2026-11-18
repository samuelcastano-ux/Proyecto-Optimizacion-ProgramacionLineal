/**
 * tipos/problema.ts — Tipos que espejan los modelos Pydantic del backend.
 * Los valores numéricos viajan como cadenas para conservar la exactitud.
 */

/** Límite de variables del modelo; provisional, debe confirmarse con el docente. */
export const MAX_VARIABLES = 10;

/** Límite de restricciones que permite el formulario del prototipo. */
export const MAX_RESTRICCIONES = 8;

/** Sentido de la optimización. */
export type Sentido = "max" | "min";

/** Relaciones permitidas en una restricción. */
export type SignoRelacion = "<=" | ">=" | "=";

/** Modo de presentación elegido en el formulario (no cambia el cálculo). */
export type ModoResolucion = "directa" | "paso";

/** Valor que acepta el backend: número o marcador textual de los ejemplos. */
export type ValorNumerico = string | number;

/** Restricción tal como viaja en las respuestas de la API. */
export interface RestriccionApi {
  coeficientes: ValorNumerico[];
  signo: string;
  lado_derecho: ValorNumerico | null;
}

/** Restricción editable del formulario (siempre texto). */
export interface RestriccionFormulario {
  coeficientes: string[];
  signo: SignoRelacion;
  ladoDerecho: string;
}

/** Cuerpo de POST /validar. */
export interface ModeloEntrada {
  sentido: string;
  coeficientes_objetivo: ValorNumerico[];
  restricciones: RestriccionApi[];
}

/** Error de validación devuelto por el backend. */
export interface ErrorValidacion {
  campo: string;
  mensaje: string;
}

/** Respuesta de POST /validar (200 o 422). */
export interface RespuestaValidacion {
  valido: boolean;
  errores?: ErrorValidacion[];
}

/** Elemento del listado GET /ejemplos. */
export interface EjemploResumen {
  id: string;
  titulo: string;
}

/** Fila del tablero simplex de la Gran M. */
export interface FilaTablero {
  base: string;
  cb: string;
  coeficientes: string[];
  lado_derecho: string;
  razon: string;
}

/** Tablero inicial tal como lo entrega el backend. */
export interface TableroInicial {
  columnas: string[];
  filas: FilaTablero[];
  cj_menos_zj: string[];
  z: string;
}

/** Vértice factible para el gráfico 2D. */
export interface Vertice {
  x1: string;
  x2: string;
  Z: string;
}

/** Rango exacto de un coeficiente o de un lado derecho. */
export interface RangoValores {
  minimo: string;
  maximo: string;
}

/** Ejemplo completo de GET /ejemplos/{id}. */
export interface EjemploCompleto extends EjemploResumen {
  descripcion: string;
  sentido: Sentido | null;
  variables: string[];
  coeficientes_objetivo: string[];
  restricciones: RestriccionApi[];
  solucion: Record<string, string> | null;
  usos: Record<string, string> | null;
  holguras: Record<string, string> | null;
  vertices: Vertice[] | null;
  optimo: Record<string, string> | null;
  precios_sombra: Record<string, string> | null;
  costos_reducidos: Record<string, string> | null;
  rangos_coeficientes: Record<string, RangoValores> | null;
  rangos_lado_derecho: Record<string, RangoValores> | null;
  forma_estandar: string[] | null;
  funcion_penalizada: string | null;
  tablero_inicial: TableroInicial | null;
  iteracion: Record<string, string> | null;
  nota: string | null;
}
