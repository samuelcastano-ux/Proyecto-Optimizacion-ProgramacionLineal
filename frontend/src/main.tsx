/**
 * main.tsx — Punto de entrada del frontend.
 * Carga los tokens y estilos globales y monta React en modo estricto.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./estilos/tokens.css";
import "./estilos/global.css";

const contenedor = document.getElementById("root");

if (contenedor === null) {
  throw new Error("No se encontró el elemento #root para montar la aplicación.");
}

createRoot(contenedor).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
