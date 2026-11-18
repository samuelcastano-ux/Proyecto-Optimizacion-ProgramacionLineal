/**
 * GraficoDos — Pantalla 4: región factible y recta de isoutilidad en SVG.
 * Ajusta la escala en el objeto ESCALA; la geometría es solo presentación y
 * todos los valores de negocio provienen de la API.
 */

import { formatearValor, subindice } from "../formato/fracciones";
import type { EjemploCompleto } from "../tipos/problema";
import { AvisoDemo } from "./comunes/AvisoDemo";
import { Panel } from "./comunes/Panel";
import { Pastilla } from "./comunes/Pastilla";

/** Cambia estos valores para ajustar la escala y los márgenes del gráfico. */
const ESCALA = {
  ancho: 720,
  alto: 520,
  margenIzq: 64,
  margenDer: 32,
  margenSup: 28,
  margenInf: 56,
  maxX: 60,
  maxY: 48,
} as const;

const ANCHO_UTIL = ESCALA.ancho - ESCALA.margenIzq - ESCALA.margenDer;
const ALTO_UTIL = ESCALA.alto - ESCALA.margenSup - ESCALA.margenInf;

/** Punto en coordenadas del modelo. */
interface Punto {
  x: number;
  y: number;
}

/** Convierte x del modelo a la coordenada SVG. */
function aX(x: number): number {
  return ESCALA.margenIzq + (x / ESCALA.maxX) * ANCHO_UTIL;
}

/** Convierte y del modelo a la coordenada SVG. */
function aY(y: number): number {
  return ESCALA.alto - ESCALA.margenInf - (y / ESCALA.maxY) * ALTO_UTIL;
}

/** Recorta un segmento contra el área de dibujo (algoritmo de Liang-Barsky). */
function recortarSegmento(inicio: Punto, fin: Punto): [Punto, Punto] | null {
  let t0 = 0;
  let t1 = 1;
  const dx = fin.x - inicio.x;
  const dy = fin.y - inicio.y;
  const p = [-dx, dx, -dy, dy];
  const q = [
    inicio.x,
    ESCALA.maxX - inicio.x,
    inicio.y,
    ESCALA.maxY - inicio.y,
  ];

  for (let indice = 0; indice < 4; indice += 1) {
    const pi = p[indice] ?? 0;
    const qi = q[indice] ?? 0;

    if (pi === 0) {
      if (qi < 0) {
        return null;
      }
      continue;
    }

    const razon = qi / pi;
    if (pi < 0) {
      if (razon > t1) return null;
      if (razon > t0) t0 = razon;
    } else {
      if (razon < t0) return null;
      if (razon < t1) t1 = razon;
    }
  }

  return [
    { x: inicio.x + t0 * dx, y: inicio.y + t0 * dy },
    { x: inicio.x + t1 * dx, y: inicio.y + t1 * dy },
  ];
}

/** Obtiene dos puntos de la recta a·x₁ + b·x₂ = c dentro de los límites. */
function puntosDeRecta(a: number, b: number, c: number): [Punto, Punto] | null {
  if (Math.abs(b) > 1e-9) {
    return recortarSegmento(
      { x: 0, y: c / b },
      { x: ESCALA.maxX, y: (c - a * ESCALA.maxX) / b },
    );
  }
  if (Math.abs(a) > 1e-9) {
    return recortarSegmento(
      { x: c / a, y: 0 },
      { x: c / a, y: ESCALA.maxY },
    );
  }
  return null;
}

/** Colores de las rectas de restricción, en orden R1, R2, R3. */
const COLORES_RESTRICCIONES = ["#126344", "#356ba2", "#b86b21"] as const;

interface PropsGrafico {
  /** Ejemplo de dos variables con vértices factibles. */
  ejemplo: EjemploCompleto;
}

/** Pantalla del gráfico 2D dibujado a mano. */
export function GraficoDos({ ejemplo }: PropsGrafico) {
  if (ejemplo.variables.length !== 2) {
    return (
      <Panel titulo="El método gráfico no aplica">
        <p className="texto-suave">
          Este modelo tiene {ejemplo.variables.length} variables. El método
          gráfico solo representa problemas de dos variables.
        </p>
      </Panel>
    );
  }

  const vertices = ejemplo.vertices ?? [];
  const valorZ = ejemplo.solucion?.Z;
  const coeficientes = ejemplo.coeficientes_objetivo.map((valor) => Number(valor));
  const isoutilidad =
    valorZ !== undefined &&
    coeficientes.length === 2 &&
    coeficientes.every((valor) => Number.isFinite(valor))
      ? {
          a: coeficientes[0] ?? 0,
          b: coeficientes[1] ?? 0,
          c: Number(valorZ),
        }
      : null;

  const marcasX = Array.from(
    { length: Math.floor(ESCALA.maxX / 10) + 1 },
    (_, indice) => indice * 10,
  );
  const marcasY = Array.from(
    { length: Math.floor(ESCALA.maxY / 10) + 1 },
    (_, indice) => indice * 10,
  );

  const rectas = ejemplo.restricciones.map((restriccion, indice) => {
    const a = Number(restriccion.coeficientes[0] ?? 0);
    const b = Number(restriccion.coeficientes[1] ?? 0);
    const c = Number(restriccion.lado_derecho ?? 0);
    const segmento =
      Number.isFinite(a) && Number.isFinite(b) && Number.isFinite(c)
        ? puntosDeRecta(a, b, c)
        : null;
    return {
      nombre: `R${indice + 1}`,
      color: COLORES_RESTRICCIONES[indice % COLORES_RESTRICCIONES.length] ?? "#126344",
      segmento,
    };
  });

  const segmentoIsoutilidad =
    isoutilidad !== null ? puntosDeRecta(isoutilidad.a, isoutilidad.b, isoutilidad.c) : null;

  const puntosRegion = vertices
    .map((vertice) => `${aX(Number(vertice.x1))},${aY(Number(vertice.x2))}`)
    .join(" ");

  return (
    <div className="pila">
      <AvisoDemo texto="La región, los vértices y la recta de isoutilidad se dibujan a partir de los datos fijos del backend." />

      <Panel
        titulo="Región factible y recta de isoutilidad"
        descripcion="Cada restricción aparece rotulada; el óptimo está marcado sobre el vértice correspondiente."
        acciones={<Pastilla tono="info">2 variables</Pastilla>}
      >
        <div className="grafico">
          <svg
            className="grafico__svg"
            viewBox={`0 0 ${ESCALA.ancho} ${ESCALA.alto}`}
            role="img"
            aria-labelledby="titulo-grafico descripcion-grafico"
          >
            <title id="titulo-grafico">
              Gráfico 2D de la región factible del modelo
            </title>
            <desc id="descripcion-grafico">
              Ejes de {subindice("x1")} y {subindice("x2")} con{" "}
              {ejemplo.restricciones.length} restricciones y los vértices
              factibles.
            </desc>

            <defs>
              <clipPath id="area-grafico">
                <rect
                  x={ESCALA.margenIzq}
                  y={ESCALA.margenSup}
                  width={ANCHO_UTIL}
                  height={ALTO_UTIL}
                />
              </clipPath>
            </defs>

            {/* Retícula y ejes */}
            <g aria-hidden="true">
              {marcasX.map((marca) => (
                <g key={`marca-x-${marca}`}>
                  <line
                    x1={aX(marca)}
                    y1={ESCALA.margenSup}
                    x2={aX(marca)}
                    y2={ESCALA.alto - ESCALA.margenInf}
                    stroke="var(--color-borde)"
                    strokeWidth="1"
                  />
                  <text
                    x={aX(marca)}
                    y={ESCALA.alto - ESCALA.margenInf + 20}
                    textAnchor="middle"
                    fontSize="11"
                    fill="var(--color-texto-suave)"
                  >
                    {marca}
                  </text>
                </g>
              ))}

              {marcasY.map((marca) => (
                <g key={`marca-y-${marca}`}>
                  <line
                    x1={ESCALA.margenIzq}
                    y1={aY(marca)}
                    x2={ESCALA.ancho - ESCALA.margenDer}
                    y2={aY(marca)}
                    stroke="var(--color-borde)"
                    strokeWidth="1"
                  />
                  <text
                    x={ESCALA.margenIzq - 12}
                    y={aY(marca) + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="var(--color-texto-suave)"
                  >
                    {marca}
                  </text>
                </g>
              ))}

              <line
                x1={ESCALA.margenIzq}
                y1={ESCALA.alto - ESCALA.margenInf}
                x2={ESCALA.ancho - ESCALA.margenDer}
                y2={ESCALA.alto - ESCALA.margenInf}
                stroke="var(--color-primario-oscuro)"
                strokeWidth="1.5"
              />
              <line
                x1={ESCALA.margenIzq}
                y1={ESCALA.margenSup}
                x2={ESCALA.margenIzq}
                y2={ESCALA.alto - ESCALA.margenInf}
                stroke="var(--color-primario-oscuro)"
                strokeWidth="1.5"
              />

              <text
                x={ESCALA.ancho - ESCALA.margenDer}
                y={ESCALA.alto - ESCALA.margenInf + 40}
                textAnchor="end"
                fontSize="13"
                fontStyle="italic"
                fill="var(--color-texto)"
              >
                {subindice("x1")}
              </text>
              <text
                x={ESCALA.margenIzq - 12}
                y={ESCALA.margenSup + 4}
                textAnchor="end"
                fontSize="13"
                fontStyle="italic"
                fill="var(--color-texto)"
              >
                {subindice("x2")}
              </text>
            </g>

            <g clipPath="url(#area-grafico)">
              {vertices.length >= 3 && (
                <polygon
                  points={puntosRegion}
                  fill="rgba(18, 99, 68, 0.14)"
                  stroke="var(--color-primario)"
                  strokeWidth="2"
                />
              )}

              {rectas.map((recta) =>
                recta.segmento !== null ? (
                  <g key={recta.nombre}>
                    <line
                      x1={aX(recta.segmento[0].x)}
                      y1={aY(recta.segmento[0].y)}
                      x2={aX(recta.segmento[1].x)}
                      y2={aY(recta.segmento[1].y)}
                      stroke={recta.color}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <text
                      x={aX((recta.segmento[0].x + recta.segmento[1].x) / 2)}
                      y={
                        aY((recta.segmento[0].y + recta.segmento[1].y) / 2) - 10
                      }
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="700"
                      fill={recta.color}
                      stroke="#ffffff"
                      strokeWidth="3"
                      paintOrder="stroke"
                    >
                      {recta.nombre}
                    </text>
                  </g>
                ) : null,
              )}

              {segmentoIsoutilidad !== null && isoutilidad !== null && (
                <g>
                  <line
                    x1={aX(segmentoIsoutilidad[0].x)}
                    y1={aY(segmentoIsoutilidad[0].y)}
                    x2={aX(segmentoIsoutilidad[1].x)}
                    y2={aY(segmentoIsoutilidad[1].y)}
                    stroke="var(--color-naranja)"
                    strokeWidth="2"
                    strokeDasharray="7 5"
                  />
                  <text
                    x={aX((segmentoIsoutilidad[0].x + segmentoIsoutilidad[1].x) / 2)}
                    y={
                      aY(
                        (segmentoIsoutilidad[0].y + segmentoIsoutilidad[1].y) / 2,
                      ) - 10
                    }
                    textAnchor="middle"
                    fontSize="12"
                    fill="var(--color-naranja)"
                    stroke="#ffffff"
                    strokeWidth="4"
                    paintOrder="stroke"
                  >
                    {`${coeficientes[0]}${subindice("x1")} + ${coeficientes[1]}${subindice("x2")} = ${formatearValor(valorZ ?? "")}`}
                  </text>
                </g>
              )}

              {vertices.map((vertice) => {
                const x = Number(vertice.x1);
                const y = Number(vertice.x2);
                const esOptimo =
                  ejemplo.optimo !== null &&
                  ejemplo.optimo.x1 === vertice.x1 &&
                  ejemplo.optimo.x2 === vertice.x2;
                const ancla: "start" | "end" = x > ESCALA.maxX * 0.75 ? "end" : "start";
                const desplazamientoX = ancla === "start" ? 10 : -10;
                // Las etiquetas se dibujan siempre por encima para que el vértice
                // (0, 0) no quede recortado por el borde inferior del SVG.
                const desplazamientoY = -26;

                return (
                  <g key={`${vertice.x1}-${vertice.x2}`}>
                    <circle
                      cx={aX(x)}
                      cy={aY(y)}
                      r={esOptimo ? 6 : 4.5}
                      fill={esOptimo ? "var(--color-primario)" : "#ffffff"}
                      stroke="var(--color-primario-oscuro)"
                      strokeWidth="2"
                    />
                    <text
                      x={aX(x) + desplazamientoX}
                      y={aY(y) + desplazamientoY}
                      textAnchor={ancla}
                      fontSize="12"
                      fontWeight="700"
                      fill="var(--color-primario-oscuro)"
                      stroke="#ffffff"
                      strokeWidth="3.5"
                      paintOrder="stroke"
                    >
                      ({formatearValor(vertice.x1)}, {formatearValor(vertice.x2)})
                    </text>
                    <text
                      x={aX(x) + desplazamientoX}
                      y={aY(y) + desplazamientoY + 14}
                      textAnchor={ancla}
                      fontSize="11"
                      fill="var(--color-texto-suave)"
                      stroke="#ffffff"
                      strokeWidth="3"
                      paintOrder="stroke"
                    >
                      Z = {formatearValor(vertice.Z)}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        <div className="grafico__pie">
          <div className="leyenda">
            <span className="leyenda__item">
              <span className="leyenda__muestra leyenda__muestra--region" aria-hidden="true" />
              Región factible
            </span>
            <span className="leyenda__item">
              <span className="leyenda__muestra" aria-hidden="true" />
              Restricciones (R1, R2, R3)
            </span>
            <span className="leyenda__item">
              <span
                className="leyenda__muestra leyenda__muestra--punteada"
                aria-hidden="true"
              />
              Isoutilidad {formatearValor(valorZ ?? "")}
            </span>
            <span className="leyenda__item">
              <span className="leyenda__muestra leyenda__muestra--vertice" aria-hidden="true" />
              Vértice factible
            </span>
          </div>
          <p className="texto-suave texto-pequeno">
            Óptimo en ({formatearValor(ejemplo.optimo?.x1 ?? "—")},{" "}
            {formatearValor(ejemplo.optimo?.x2 ?? "—")}).
          </p>
        </div>

        {vertices.length < 3 && (
          <p className="texto-suave margen-superior">
            Este ejemplo no incluye suficientes vértices para sombrear la región.
          </p>
        )}
      </Panel>

      <div className="aviso aviso--info" role="note">
        <span className="aviso__icono" aria-hidden="true">
          i
        </span>
        <div className="aviso__contenido">
          <p className="aviso__texto">
            La recta punteada es la isoutilidad que pasa por el óptimo: cualquier
            punto de esa recta tendría el mismo valor de Z.
          </p>
        </div>
      </div>
    </div>
  );
}
