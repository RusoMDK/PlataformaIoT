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
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Sidebar({ onLogout }) {
  const location = useLocation();
  const rol = localStorage.getItem('rol');
  const { t } = useTranslation();

  const enlaces = [
    { to: '/', label: t('sidebar.home'), icon: <Home size={20} /> },
    { to: '/proyectos', label: t('sidebar.proyectos'), icon: <Folder size={20} /> },
    { to: '/notificaciones', label: t('sidebar.notificaciones'), icon: <Bell size={20} /> },
    { to: '/logs', label: t('sidebar.actividad'), icon: <BarChart size={20} /> },
    { to: '/ayuda', label: t('sidebar.ayuda'), icon: <HelpCircle size={20} /> },
  ];

  const admin = [
    { to: '/admin/dashboard', label: t('sidebar.admin'), icon: <Settings size={20} /> },
    { to: '/logs/globales', label: t('sidebar.logsGlobales'), icon: <Users size={20} /> },
    { to: '/admin/exportar', label: t('sidebar.exportar'), icon: <Download size={20} /> },
  ];

  return (
    <aside className="h-full group hover:w-64 w-16 transition-all duration-300 bg-white/90 dark:bg-darkSurface/90 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
        {[...enlaces, ...(rol === 'admin' ? [{ divider: true }, ...admin] : [])].map(
          (item, index) =>
            item.divider ? (
              <hr
                key={`divider-${index}`}
                className="my-3 border-gray-300 dark:border-gray-600 group-hover:mx-2"
              />
            ) : (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center px-3 py-2 rounded hover:bg-blue-50 dark:hover:bg-darkBg transition no-underline ${
                  location.pathname === item.to
                    ? 'bg-blue-100 dark:bg-darkAccent/20 font-semibold text-blue-600 dark:text-darkAccent'
                    : ''
                }`}
              >
                <div className="min-w-[24px] flex justify-center text-gray-600 dark:text-darkMuted">
                  {item.icon}
                </div>
                <span className="ml-2 truncate opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm text-gray-700 dark:text-white font-medium">
                  {item.label}
                </span>
              </Link>
            )
        )}
      </nav>

      <div className="p-3">
        <button
          onClick={onLogout}
          className="flex items-center px-3 py-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-800 rounded w-full"
        >
          <div className="min-w-[24px] flex justify-center">
            <LogOut size={20} />
          </div>
          <span className="ml-2 truncate opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">
            {t('sidebar.cerrarSesion')}
          </span>
        </button>
      </div>
    </aside>
  );
}
