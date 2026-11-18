/**
 * formato/fracciones.ts — Utilidades de presentación matemática.
 * No calcula soluciones: solo convierte las cadenas exactas del backend
 * ("2/5", "+∞") a notación legible con subíndices Unicode.
 */

/** Mapa de dígitos y letras a subíndices Unicode. */
const SUBINDICES: Readonly<Record<string, string>> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
  a: "ₐ",
  e: "ₑ",
  h: "ₕ",
  i: "ᵢ",
  j: "ⱼ",
  k: "ₖ",
  l: "ₗ",
  m: "ₘ",
  n: "ₙ",
  o: "ₒ",
  p: "ₚ",
  r: "ᵣ",
  s: "ₛ",
  t: "ₜ",
  u: "ᵤ",
  v: "ᵥ",
  x: "ₓ",
};

/**
 * Convierte un nombre con dígitos finales a subíndice Unicode.
 * Ejemplos: "x1" → "x₁", "x10" → "x₁₀", "a1,1" → "a₁,₁", "R2" → "R₂".
 */
export function subindice(nombre: string): string {
  const coincidencia = /^([^\d]+)(.+)$/.exec(nombre);
  if (coincidencia === null) {
    return nombre;
  }
  const [, base, resto] = coincidencia;
  const subindizado = [...resto]
    .map((caracter) => SUBINDICES[caracter] ?? caracter)
    .join("");
  return `${base}${subindizado}`;
}

/**
 * Conserva la fracción exacta "a/b" tal como la entrega el backend.
 * La fuente serif del contenedor la hace legible sin convertirla a decimal.
 */
export function formatearFraccion(valor: string): string {
  return valor.trim();
}

/** Da formato exacto a un valor del backend: fracciones y símbolo de infinito. */
export function formatearValor(valor: string): string {
  const limpio = valor.trim();
  if (limpio === "+∞" || limpio === "∞" || limpio === "-∞" || limpio === "−∞") {
    return limpio;
  }
  return formatearFraccion(limpio);
}

/** Presenta un rango exacto como [mínimo, máximo]. */
export function formatearRango(minimo: string, maximo: string): string {
  return `[${formatearValor(minimo)}, ${formatearValor(maximo)}]`;
}

/** Indica si una cadena representa un número (entero o decimal). */
export function esNumero(valor: string): boolean {
  return /^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(valor.trim());
}

/** Convierte un coeficiente a su término matemático con subíndice. */
function formatearTermino(
  valor: string,
  variable: string,
  esPrimero: boolean,
): string {
  const limpio = valor.trim();
  const variableSub = subindice(variable);

  if (limpio === "") {
    return esPrimero ? "…" : "+ …";
  }

  const numero = Number(limpio);
  if (!Number.isFinite(numero)) {
    return esPrimero ? "…" : "+ …";
  }

  const negativo = numero < 0;
  const separador = esPrimero ? (negativo ? "−" : "") : negativo ? " − " : " + ";
  const magnitud = Math.abs(numero);
  const coeficiente = magnitud === 1 ? "" : String(magnitud);
  return `${separador}${coeficiente}${variableSub}`;
}

/** Construye la expresión de la función objetivo, por ejemplo "50x₁ + 80x₂". */
export function formatearExpresion(
  coeficientes: readonly string[],
  variables: readonly string[],
): string {
  return coeficientes
    .map((coeficiente, indice) =>
      formatearTermino(coeficiente, variables[indice] ?? `x${indice + 1}`, indice === 0),
    )
    .join("");
}

/** Traduce el signo ASCII del backend a su símbolo matemático. */
export function formatearSigno(signo: string): string {
  if (signo === "<=") return "≤";
  if (signo === ">=") return "≥";
  return signo;
}

/** Construye una restricción legible, por ejemplo "2x₁ + x₂ ≤ 100". */
export function formatearRestriccion(
  coeficientes: readonly string[],
  signo: string,
  ladoDerecho: string,
  variables: readonly string[],
): string {
  const izquierda = formatearExpresion(coeficientes, variables);
  const derecha = ladoDerecho.trim() === "" ? "…" : ladoDerecho;
  return `${izquierda} ${formatearSigno(signo)} ${derecha}`;
}
