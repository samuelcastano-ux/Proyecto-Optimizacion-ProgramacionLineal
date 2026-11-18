# Proyecto de Aplicación de Programación Lineal

Aplicación web para resolver y visualizar problemas de **Programación Lineal** (forma estándar, simplex revisado, gran M, método gráfico 2D y análisis de sensibilidad).

- **Backend:** Python + FastAPI (`backend/`)
- **Frontend:** Vite + React + TypeScript (`frontend/`)
- **Documentación:** propuesta y bocetos (`docs/`)

## Estructura

```
Proyecto-Optimizacion-ProgramacionLineal/
├── backend/
│   ├── app/
│   │   ├── main.py              # API FastAPI, CORS y manejo de errores (B)
│   │   ├── modelos.py           # Esquemas Pydantic de entrada y salida (B)
│   │   ├── validacion.py        # Reglas de validación estructural (B)
│   │   ├── datos/
│   │   │   └── ejemplos.json    # Datos fijos de los tres ejemplos (B)
│   │   ├── rutas/
│   │   │   ├── ejemplos.py      # GET /ejemplos y GET /ejemplos/{id}
│   │   │   └── validacion.py    # POST /validar
│   │   └── solver/              # Núcleo algorítmico (A / B) — vacío por ahora
│   ├── tests/
│   │   ├── test_api.py              # Pruebas de los endpoints (B)
│   │   └── problemas_evaluacion.py  # Los 7 problemas del enunciado (B)
│   ├── requirements.txt
│   └── .venv/                   # Entorno virtual local (no se versiona)
├── frontend/
│   ├── .env.example              # VITE_API_URL=http://localhost:8000
│   ├── index.html
│   └── src/
│       ├── main.tsx              # Montaje de React y carga de estilos
│       ├── App.tsx               # HashRouter y definición de rutas
│       ├── api/
│       │   ├── cliente.ts        # fetch tipado a /ejemplos, /ejemplos/{id} y /validar
│       │   └── useEjemplo.ts     # Carga, error y reintento de un ejemplo fijo
│       ├── tipos/problema.ts     # Tipos espejo de los modelos Pydantic
│       ├── formato/fracciones.ts # Subíndices Unicode y fracciones exactas
│       ├── estilos/
│       │   ├── tokens.css        # Colores, espacios y tipografía
│       │   └── global.css        # Componentes visuales y diseño responsivo
│       ├── componentes/
│       │   ├── FormularioProblema.tsx  # Pantalla 1: modelo
│       │   ├── ResultadoSolucion.tsx   # Pantalla 2: resultado
│       │   ├── PasoAPaso.tsx           # Pantalla 3: paso a paso
│       │   ├── GraficoDos.tsx          # Pantalla 4: gráfico 2D en SVG
│       │   ├── Sensibilidad.tsx        # Pantalla 5: sensibilidad
│       │   ├── CapacidadDiez.tsx       # Pantalla 6: diez variables
│       │   └── comunes/               # Encabezado, Navegacion, Panel, Metrica,
│       │                              # TablaDesplazable, AvisoDemo, Pastilla,
│       │                              # EstadoRemoto
│       └── paginas/              # Una página por ruta; envuelve al componente
├── docs/
│   ├── propuesta.md
│   └── boceto/
└── .gitignore
```

## Backend: puesta en marcha

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux / macOS
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Verificación rápida: `GET http://127.0.0.1:8000/salud` → `{"estado": "ok"}`

Documentación interactiva de la API: `http://127.0.0.1:8000/docs`

### Endpoints (Sprint 1)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Verificación del servicio → `{"estado": "ok"}` |
| GET | `/ejemplos` | ids y títulos de los ejemplos disponibles |
| GET | `/ejemplos/{id}` | Ejemplo completo; 404 en español si no existe |
| POST | `/validar` | Validación estructural → 200 `{"valido": true}` o 422 con errores |

Todos los valores numéricos de las respuestas viajan como cadenas exactas
(`"2/5"`, `"80/3"`, `"+∞"`); no se usan `float` ni librerías de optimización.

Pruebas:

```bash
cd backend
pytest -q
```

## Frontend: puesta en marcha

```bash
cd frontend
npm install
npm run dev
```

La URL del backend se configura en un archivo `.env` (copia de `.env.example`):

```
VITE_API_URL=http://localhost:8000
```

Otros comandos:

```bash
npm run build   # comprueba tipos (tsc -b) y genera dist/
npm run preview # sirve la compilación de producción
npm run lint    # oxlint
```

### Pantallas del prototipo

| Ruta | Pantalla | Contenido |
|---|---|---|
| `/modelo` | Modelo | Sentido, contadores, objetivo, restricciones y vista previa matemática |
| `/resultado` | Resultado | Estado, variables, Z, uso/límite/holgura de cada restricción |
| `/paso-a-paso` | Paso a paso | Forma estándar, tablero de la Gran M y solución final |
| `/grafico` | Gráfico 2D | Región factible, restricciones rotuladas e isoutilidad (SVG) |
| `/sensibilidad` | Sensibilidad | Precios sombra, costos reducidos y rangos exactos |
| `/capacidad` | Capacidad | Maqueta de la tabla de diez variables con columna fija |

La ruta inicial redirige a `/modelo`. El navegador **no calcula** ninguna
solución: solo formatea las cadenas exactas que entrega la API. La única
petición que envía el modelo es `POST /validar`, usada al pulsar "Validar
estructura". El resultado y los análisis siguen siendo datos de ejemplo fijos.

## Estado (Sprint 1)

El backend sirve **datos fijos** para el prototipo de interfaz y valida la
estructura de los modelos; **no implementa ningún solver** ni cálculo de
optimización. El frontend ya implementa las seis pantallas del Sprint 1 con
React 18 + TypeScript estricto, `HashRouter`, CSS plano y un gráfico SVG dibujado
a mano.
