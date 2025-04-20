import { Routes, Route, Navigate } from 'react-router-dom';

/* ─ Páginas públicas / auth ─ */
import Home from '../pages/dashboard/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Ayuda from '../pages/ayuda/Ayuda';
import Logs from '../pages/dashboard/Logs';

/* ─ Páginas privadas comunes ─ */
import Proyectos from '../pages/proyectos/Proyectos';
import ProyectoDetalle from '../pages/proyectos/DetalleThing';
import EditarThing from '../pages/proyectos/EditarThing';
import Lecturas from '../pages/proyectos/Lecturas';
import Visualizacion from '../pages/proyectos/VisualizacionAvanzada';
import NuevoDispositivo from '../pages/dispositivos/Wizard';
import NuevoThing from '../pages/proyectos/NuevoThing';
import Notificaciones from '../pages/notificaciones/Notificaciones';
import Perfil from '../pages/user/Perfil';
import ThingBuilder from '../pages/sensor/ThingBuilder';

/* ─ Páginas de administración ─ */
import DashboardAdmin from '../pages/admin/DashboardAdmin';
import LogsGlobales from '../pages/admin/LogsGlobales';
import ExportarDatos from '../pages/admin/ExportarDatos';

/* ─ Layouts ─ */
import AuthLayout from '../layouts/AuthLayout';
import WizardLayout from '../layouts/WizardLayout';

/* ─ Wrappers de protección ─ */
const PrivateRoute = ({ children, token }) => {
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children, token, rol }) => {
  return token && rol === 'admin' ? children : <Navigate to="/" replace />;
};

export default function AppRoutes({ token, rol }) {
  return (
    <Routes>
      {/* ──────────── Rutas públicas ──────────── */}
      <Route path="/" element={<Home />} />
      <Route path="/ayuda" element={<Ayuda />} />
      <Route path="/logs" element={<Logs />} />

      {/* ──────────── Rutas auth (dentro de layout) ──────────── */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* ──────────── Rutas privadas comunes ──────────── */}
      <Route
        path="/proyectos"
        element={
          <PrivateRoute token={token}>
            <Proyectos />
          </PrivateRoute>
        }
      />
      <Route
        path="/proyectos/:id"
        element={
          <PrivateRoute token={token}>
            <ProyectoDetalle />
          </PrivateRoute>
        }
      />
      <Route
        path="/proyectos/:id/editar-thing"
        element={
          <PrivateRoute token={token}>
            <EditarThing />
          </PrivateRoute>
        }
      />
      <Route
        path="/proyectos/:id/lecturas"
        element={
          <PrivateRoute token={token}>
            <Lecturas />
          </PrivateRoute>
        }
      />
      <Route
        path="/proyectos/:id/visualizacion"
        element={
          <PrivateRoute token={token}>
            <Visualizacion />
          </PrivateRoute>
        }
      />
      <Route
        path="/nuevo-dispositivo"
        element={
          <PrivateRoute token={token}>
            <WizardLayout>
              <NuevoDispositivo />
            </WizardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/things/nuevo"
        element={
          <PrivateRoute token={token}>
            <NuevoThing />
          </PrivateRoute>
        }
      />
      <Route
        path="/configurar-dispositivo/:id"
        element={
          <PrivateRoute token={token}>
            <ThingBuilder />
          </PrivateRoute>
        }
      />
      <Route
        path="/notificaciones"
        element={
          <PrivateRoute token={token}>
            <Notificaciones />
          </PrivateRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <PrivateRoute token={token}>
            <Perfil />
          </PrivateRoute>
        }
      />

      {/* ──────────── Rutas exclusivas para admin ──────────── */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute token={token} rol={rol}>
            <DashboardAdmin />
          </AdminRoute>
        }
      />
      <Route
        path="/logs/globales"
        element={
          <AdminRoute token={token} rol={rol}>
            <LogsGlobales />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/exportar"
        element={
          <AdminRoute token={token} rol={rol}>
            <ExportarDatos />
          </AdminRoute>
        }
      />

      {/* ──────────── Fallbacks ──────────── */}
      <Route
        path="*"
        element={token ? <Navigate to="/proyectos" replace /> : <Navigate to="/" replace />}
      />
    </Routes>
  );
}
