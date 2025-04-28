// src/components/shared/Sidebar.jsx
import { useLocation, Link } from 'react-router-dom';
import {
  Home,
  Folder,
  Bell,
  BarChart,
  HelpCircle,
  LogOut,
  Settings,
  Users,
  Download,
  Server,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { fetchUserProfile } from '../../api/auth.api';

export default function Sidebar({ onLogout }) {
  const location = useLocation();
  const { t } = useTranslation();
  const [usuario, setUsuario] = useState(undefined);

  useEffect(() => {
    (async () => {
      try {
        const user = await fetchUserProfile();
        setUsuario(user);
      } catch {
        setUsuario(null);
      }
    })();
  }, []);

  // Mientras chequeamos la sesión
  if (usuario === undefined) return null;

  // Define siempre un array de enlaces
  const enlacesPublicos = [
    { to: '/', label: t('sidebar.home'), icon: <Home size={20} /> },
    { to: '/ayuda', label: t('sidebar.ayuda'), icon: <HelpCircle size={20} /> },
  ];

  const enlacesPrivados = [
    ...enlacesPublicos,
    { to: '/proyectos', label: t('sidebar.proyectos'), icon: <Folder size={20} /> },
    { to: '/notificaciones', label: t('sidebar.notificaciones'), icon: <Bell size={20} /> },
    { to: '/logs', label: t('sidebar.actividad'), icon: <BarChart size={20} /> },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: t('sidebar.admin'), icon: <Settings size={20} /> },
    { to: '/logs/globales', label: t('sidebar.logsGlobales'), icon: <Users size={20} /> },
    { to: '/admin/exportar', label: t('sidebar.exportar'), icon: <Download size={20} /> },
    { to: '/admin/agentes', label: t('sidebar.agentesConectados'), icon: <Server size={20} /> },
  ];

  // Si hay usuario, usa privados (+ admin si toca), si no, solo públicos
  let enlaces = usuario
    ? [...enlacesPrivados, ...(usuario.rol === 'admin' ? [{ divider: true }, ...adminLinks] : [])]
    : enlacesPublicos;

  return (
    <aside
      className="fixed top-[66px] bottom-[60px] left-0 z-40 w-16 group hover:w-64
                      transition-all duration-300 bg-white/80 dark:bg-gray-950/80
                      backdrop-blur-md border-r border-gray-200 dark:border-gray-800
                      shadow-sm flex flex-col justify-between"
    >
      <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
        {enlaces.map((item, idx) =>
          item.divider ? (
            <hr
              key={`divider-${idx}`}
              className="my-3 border-gray-300 dark:border-gray-700 group-hover:mx-2"
            />
          ) : (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200 no-underline ${
                location.pathname === item.to
                  ? 'bg-blue-100 dark:bg-darkAccent/20 text-blue-600 dark:text-darkAccent font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-muted/10'
              }`}
            >
              <div className="min-w-[24px] flex justify-center items-center text-gray-600 dark:text-darkMuted">
                {item.icon}
              </div>
              <span
                className="ml-2 truncate opacity-0 group-hover:opacity-100
                               transition-opacity duration-300 text-sm font-medium"
              >
                {item.label}
              </span>
            </Link>
          )
        )}
      </nav>

      {usuario && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onLogout}
            className="flex items-center px-3 py-2 text-red-600 hover:bg-red-100
                       dark:hover:bg-red-800/50 rounded-lg w-full transition"
          >
            <div className="min-w-[24px] flex justify-center items-center">
              <LogOut size={20} />
            </div>
            <span
              className="ml-2 truncate opacity-0 group-hover:opacity-100
                             transition-opacity duration-300 text-sm"
            >
              {t('sidebar.cerrarSesion')}
            </span>
          </button>
        </div>
      )}
    </aside>
  );
}
