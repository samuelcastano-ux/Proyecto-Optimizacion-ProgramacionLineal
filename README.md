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
│   │   ├── main.py              # API FastAPI (Integrante B)
│   │   ├── modelos.py           # Esquemas de entrada y salida (B)
│   │   ├── validacion.py        # Validación de entrada (B)
│   │   └── solver/              # Núcleo algorítmico (A / B)
│   ├── tests/
│   │   └── problemas_evaluacion.py  # Los 7 problemas del enunciado (B)
│   ├── requirements.txt
│   └── .venv/                   # Entorno virtual local (no se versiona)
├── frontend/
│   └── src/
│       ├── api/cliente.ts
│       ├── tipos/problema.ts
│       └── componentes/
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

## Frontend: puesta en marcha

```bash
cd frontend
npm install
npm run dev
```

## Estado (Sprint 1)

Solo estructura de carpetas y archivos base: no hay lógica de resolución implementada todavía. El único comportamiento funcional es el endpoint `GET /salud`.
