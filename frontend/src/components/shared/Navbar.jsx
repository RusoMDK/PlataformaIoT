import { Link, useNavigate } from 'react-router-dom';
import { useNotificaciones } from '../../context/NotificacionesContext';
import { Bell, User, Moon, Sun, Globe } from 'lucide-react';
import { useState } from 'react';
import NotificacionesDropdown from './NotificacionesDropdown';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/logo.png';

export default function Navbar({ minimal = false }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const nombre = localStorage.getItem('nombre');
  const correo = localStorage.getItem('correo');

  const { noLeidas, notificaciones } = useNotificaciones();
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const { modoOscuro, toggleModoOscuro } = useTheme();
  const { i18n } = useTranslation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const toggleIdioma = () => {
    const nuevo = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nuevo);
  };

  const toggleNotificaciones = () => {
    setMostrarNotificaciones(prev => !prev);
  };

  return (
    <div className="relative">
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 dark:bg-darkSurface/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex justify-between items-center shadow-sm">
        {/* Logo visible y grande */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="IoT Platform Logo"
            className="h-12 sm:h-14 w-auto object-contain drop-shadow dark:drop-shadow-lg"
          />
        </Link>

        <div className="flex items-center gap-6 relative z-50">
          {/* Modo oscuro */}
          <button
            onClick={toggleModoOscuro}
            className="text-gray-600 dark:text-darkMuted hover:text-blue-500 transition"
            aria-label="Cambiar tema"
          >
            {modoOscuro ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Cambio de idioma */}
          <button
            onClick={toggleIdioma}
            className="text-gray-600 dark:text-darkMuted hover:text-blue-500 transition"
            aria-label="Cambiar idioma"
          >
            <Globe size={20} />
          </button>

          {/* Contenido según si es minimal o no */}
          {!minimal && token ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700 dark:text-darkText">
                👋 {i18n.language === 'es' ? 'Hola' : 'Hi'}, {nombre || 'Usuario'}
              </span>

              <button
                onClick={toggleNotificaciones}
                className="relative"
                aria-label="Abrir notificaciones"
              >
                <Bell
                  size={20}
                  className="text-gray-600 dark:text-darkMuted hover:text-blue-500 transition"
                />
                {noLeidas > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold text-white">
                    {noLeidas}
                  </span>
                )}
              </button>

              <Link
                to="/perfil"
                className="text-gray-600 dark:text-darkMuted hover:text-blue-500 transition"
                aria-label="Ir al perfil"
              >
                <User size={20} />
              </Link>
            </div>
          ) : null}

          {!minimal && !token && (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm text-blue-600 hover:underline">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="text-sm text-blue-600 hover:underline">
                Crear Cuenta
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Dropdowns */}
      {!minimal && (
        <NotificacionesDropdown
          open={mostrarNotificaciones}
          onClose={() => setMostrarNotificaciones(false)}
          notificaciones={notificaciones}
        />
      )}
    </div>
  );
}
