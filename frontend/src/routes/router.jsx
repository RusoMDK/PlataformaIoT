// src/router/index.jsx
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';
import PerfilLayout from '../layouts/PerfilLayout';
import WizardLayout from '../layouts/WizardLayout';
import DeviceConfigLayout from '../layouts/DeviceConfigLayout';

import ProtectedRoute from '../components/Wrappers/ProtectedRoute';

// Páginas públicas
import Home from '../pages/dashboard/Home';
import Ayuda from '../pages/ayuda/Ayuda';

// Autenticación
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// App protegida
import Logs from '../pages/dashboard/Logs';
import Proyectos from '../pages/proyectos/Proyectos';
import ProyectoDetalle from '../pages/proyectos/DetalleThing';
import EditarThing from '../pages/proyectos/EditarThing';
import Lecturas from '../pages/proyectos/Lecturas';
import Visualizacion from '../pages/proyectos/VisualizacionAvanzada';
import NuevoThing from '../pages/proyectos/NuevoThing';
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
import NuevoDispositivo from '../components/wizard/Wizard';

/** Layouts envueltos en ProtectedRoute **/
// 1. Toda la app principal
function ProtectedAppLayout() {
  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
}

// 2. Sección de perfil
function ProtectedPerfilLayout() {
  return (
    <ProtectedRoute>
      <PerfilLayout />
    </ProtectedRoute>
  );
}

// 3. Wizard nuevo dispositivo
function ProtectedWizardLayout() {
  return (
    <ProtectedRoute>
      <WizardLayout>
        <NuevoDispositivo />
      </WizardLayout>
    </ProtectedRoute>
  );
}

// 4. Configuración de dispositivo
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

  // ── 3. Rutas protegidas de la app ──
  {
    element: <ProtectedAppLayout />,
    children: [
      { path: '/logs', element: <Logs /> },
      { path: '/proyectos', element: <Proyectos /> },
      { path: '/proyectos/:id', element: <ProyectoDetalle /> },
      { path: '/proyectos/:id/editar-thing', element: <EditarThing /> },
      { path: '/proyectos/:id/lecturas', element: <Lecturas /> },
      { path: '/proyectos/:id/visualizacion', element: <Visualizacion /> },
      { path: '/things/nuevo', element: <NuevoThing /> },
      { path: '/notificaciones', element: <Notificaciones /> },

      // Admin
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
  },

  // ── 6. Configurar dispositivo ──
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
