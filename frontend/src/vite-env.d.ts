/// <reference types="vite/client" />

/** Variables de entorno propias del prototipo. */
interface ImportMetaEnv {
  /** URL base del backend FastAPI (por ejemplo http://localhost:8000). */
  readonly VITE_API_URL?: string;
}
