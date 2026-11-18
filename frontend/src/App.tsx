/**
 * App.tsx — Rutas del prototipo con HashRouter.
 * La ruta inicial redirige a /modelo; cualquier ruta desconocida vuelve allí.
 */

import { useEffect } from "react";
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { Encabezado } from "./componentes/comunes/Encabezado";
import { Navegacion } from "./componentes/comunes/Navegacion";
import { CapacidadPage } from "./paginas/CapacidadPage";
import { GraficoPage } from "./paginas/GraficoPage";
import { ModeloPage } from "./paginas/ModeloPage";
import { PasoAPasoPage } from "./paginas/PasoAPasoPage";
import { ResultadoPage } from "./paginas/ResultadoPage";
import { SensibilidadPage } from "./paginas/SensibilidadPage";

/** Lleva la vista al inicio cada vez que cambia la ruta. */
function DesplazamientoAlInicio() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

/** Raíz de la aplicación. */
export default function App() {
  return (
    <HashRouter>
      <div className="aplicacion">
        <Encabezado />
        <Navegacion />
        <DesplazamientoAlInicio />

        <main className="contenedor" id="contenido">
          <Routes>
            <Route path="/" element={<Navigate to="/modelo" replace />} />
            <Route path="/modelo" element={<ModeloPage />} />
            <Route path="/resultado" element={<ResultadoPage />} />
            <Route path="/paso-a-paso" element={<PasoAPasoPage />} />
            <Route path="/grafico" element={<GraficoPage />} />
            <Route path="/sensibilidad" element={<SensibilidadPage />} />
            <Route path="/capacidad" element={<CapacidadPage />} />
            <Route path="*" element={<Navigate to="/modelo" replace />} />
          </Routes>
        </main>

        <footer className="pie">
          <div className="contenedor pie__interior">
            <span>Optimización · Programación Lineal · Sprint 1</span>
            <span>
              Prototipo de interfaz con datos fijos; sin cálculo de optimización en
              el navegador.
            </span>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
}
