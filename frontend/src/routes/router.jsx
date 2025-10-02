// src/router/index.jsx
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';
import PerfilLayout from '../layouts/PerfilLayout';
import WizardLayout from '../layouts/WizardLayout';
import DeviceConfigLayout from '../layouts/DeviceConfigLayout';

import ProtectedRoute from '../app/guards/ProtectedRoute';

// Context
import { WizardProvider } from '../context/WizardContext';

// Páginas públicas
import Home from '../pages/dashboard/Home';
import Ayuda from '../pages/ayuda/Ayuda';

// Autenticación
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// App protegida
import Logs from '../pages/dashboard/Logs';
import ProyectoDetalle from '../pages/proyectos/DetalleThing';
import Lecturas from '../pages/proyectos/Lecturas';
import Visualizacion from '../pages/proyectos/VisualizacionAvanzada';
import Notificaciones from '../pages/notificaciones/Notificaciones';

// Admin
import DashboardAdmin from '../pages/admin/DashboardAdmin';
import LogsGlobales from '../pages/admin/LogsGlobales';
import ExportarDatos from '../pages/admin/ExportarDatos';
import AgentesPage from '../pages/admin/AgentesPage.jsx';

// Perfil
import CuentaTab from '../pages/user/tabs/CuentaTab';
import DatosTab from '../pages/user/tabs/DatosTab';
import PreferenciasTab from '../pages/user/tabs/PreferenciasTab';
import SeguridadTab from '../pages/user/tabs/SeguridadTab';
import PrivacidadTab from '../pages/user/tabs/PrivacidadTab';

// Wizard de nuevo dispositivo
import Wizard from '../features/device-setup/wizard/Wizard';

// Proyectos (shell + modales)
import ProyectosShell from '../pages/proyectos/ProyectosShell';
import NuevoThingModal from '../pages/proyectos/NuevoThingModal';
import EditarThingModal from '../pages/proyectos/EditarThingModal';

/** Layouts envueltos en ProtectedRoute **/
function ProtectedAppLayout() {
  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
}

function ProtectedPerfilLayout() {
  return (
    <ProtectedRoute>
      <PerfilLayout />
    </ProtectedRoute>
  );
}

function ProtectedWizardLayout() {
  return (
    <ProtectedRoute>
      <WizardProvider>
        <WizardLayout />
      </WizardProvider>
    </ProtectedRoute>
  );
}

function ProtectedDeviceConfigLayout() {
  return (
    <ProtectedRoute>
      <DeviceConfigLayout />
    </ProtectedRoute>
  );
}

const router = createBrowserRouter([
  // ── 1. Auth (login/register) ──
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },

  // ── 2. Páginas públicas ──
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/home', element: <Home /> },
      { path: '/ayuda', element: <Ayuda /> },
    ],
  },

  // ── 3. Rutas protegidas ──
  {
    element: <ProtectedAppLayout />,
    children: [
      { path: '/logs', element: <Logs /> },

      // 🔸 Proyectos: listado SIEMPRE visible + modales anidados sobre el listado
      {
        path: '/proyectos',
        element: <ProyectosShell />, // Renderiza la lista + <Outlet/> para los modales
        children: [
          // Modal crear
          { path: 'nuevo', element: <NuevoThingModal /> },
          // Modal editar
          { path: ':id/editar-thing', element: <EditarThingModal /> },
        ],
      },

      // Páginas de detalle “normales” (pantalla completa)
      { path: '/proyectos/:id', element: <ProyectoDetalle /> },
      { path: '/proyectos/:id/lecturas', element: <Lecturas /> },
      { path: '/proyectos/:id/visualizacion', element: <Visualizacion /> },

      // ♻️ Retrocompatibilidad: /things/nuevo -> /proyectos/nuevo
      { path: '/things/nuevo', element: <Navigate to="/proyectos/nuevo" replace /> },

      { path: '/notificaciones', element: <Notificaciones /> },
      { path: '/admin/dashboard', element: <DashboardAdmin /> },
      { path: '/admin/exportar', element: <ExportarDatos /> },
      { path: '/logs/globales', element: <LogsGlobales /> },
      { path: '/admin/agentes', element: <AgentesPage /> },
    ],
  },

  // ── 4. Perfil ──
  {
    path: '/perfil',
    element: <ProtectedPerfilLayout />,
    children: [
      { index: true, element: <Navigate to="cuenta" replace /> },
      { path: 'cuenta', element: <CuentaTab /> },
      { path: 'datos', element: <DatosTab /> },
      { path: 'preferencias', element: <PreferenciasTab /> },
      { path: 'seguridad', element: <SeguridadTab /> },
      { path: 'privacidad', element: <PrivacidadTab /> },
    ],
  },

  // ── 5. Wizard nuevo dispositivo ──
  {
    path: '/nuevo-dispositivo',
    element: <ProtectedWizardLayout />,
    children: [{ index: true, element: <Wizard /> }],
  },

  // ── 6. Configurar dispositivo existente ──
  {
    path: '/configurar-dispositivo/:id',
    element: <ProtectedDeviceConfigLayout />,
  },

  // ── 7. Fallback ──
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
