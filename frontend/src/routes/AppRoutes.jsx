// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

/* ─ Páginas públicas / auth ──────────────────────────────────────────── */
import Home from '../pages/dashboard/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Ayuda from '../pages/ayuda/Ayuda';
import Logs from '../pages/dashboard/Logs';

/* ─ Páginas privadas comunes ─────────────────────────────────────────── */
import Proyectos from '../pages/proyectos/Proyectos';
import ProyectoDetalle from '../pages/proyectos/DetalleThing';
import EditarThing from '../pages/proyectos/EditarThing';
import Lecturas from '../pages/proyectos/Lecturas';
import Visualizacion from '../pages/proyectos/VisualizacionAvanzada';
import NuevoDispositivo from '../pages/dispositivos/NuevoDispositivoPage';
import NuevoThing from '../pages/proyectos/NuevoThing';
import Notificaciones from '../pages/notificaciones/Notificaciones';
import Perfil from '../pages/user/Perfil'; // ← NUEVO

/* ─ Páginas de administración ────────────────────────────────────────── */
import DashboardAdmin from '../pages/admin/DashboardAdmin';
import LogsGlobales from '../pages/admin/LogsGlobales';
import ExportarDatos from '../pages/admin/ExportarDatos';

/* ─ Layout auth ──────────────────────────────────────────────────────── */
import AuthLayout from '../layouts/AuthLayout';

export default function AppRoutes({ token, rol }) {
  /* wrapper para rutas solo‑admin */
  const AdminRoute = ({ children }) =>
    token && rol === 'admin' ? children : <Navigate to="/" replace />;

  /* wrapper para rutas privadas genéricas */
  const PrivateRoute = ({ children }) => (token ? children : <Navigate to="/login" replace />);

  return (
    <Routes>
      {/* ──────────── Públicas ──────────── */}
      <Route path="/" element={<Home />} />
      <Route path="/ayuda" element={<Ayuda />} />
      <Route path="/logs" element={<Logs />} />

      {/* Auth (dentro de AuthLayout) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* ─────────── Privadas ──────────── */}
      <Route element={<PrivateRoute />} /* todo lo anidado requiere token */>
        <Route path="/proyectos" element={<Proyectos />} />
        <Route path="/proyectos/:id" element={<ProyectoDetalle />} />
        <Route path="/proyectos/:id/editar-thing" element={<EditarThing />} />
        <Route path="/proyectos/:id/lecturas" element={<Lecturas />} />
        <Route path="/proyectos/:id/visualizacion" element={<Visualizacion />} />
        <Route path="/nuevo-dispositivo" element={<NuevoDispositivo />} />
        <Route path="/things/nuevo" element={<NuevoThing />} />
        <Route path="/notificaciones" element={<Notificaciones />} />
        <Route path="/perfil" element={<Perfil />} /> {/* ← NUEVO */}
        {/* ───── rutas solo‑admin ───── */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <DashboardAdmin />
            </AdminRoute>
          }
        />
        <Route
          path="/logs/globales"
          element={
            <AdminRoute>
              <LogsGlobales />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/exportar"
          element={
            <AdminRoute>
              <ExportarDatos />
            </AdminRoute>
          }
        />
        {/* fallback privado */}
        <Route path="*" element={<Navigate to="/proyectos" replace />} />
      </Route>

      {/* fallback público (sin token) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
