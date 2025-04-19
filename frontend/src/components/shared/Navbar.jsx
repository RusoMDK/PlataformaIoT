// src/components/shared/Navbar.jsx
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
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="IoT Platform Logo" className="h-10 w-auto" />
        </Link>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          {/* Modo oscuro */}
          <button
            onClick={toggleModoOscuro}
            className="text-gray-600 dark:text-gray-300 hover:text-primary transition"
            aria-label="Cambiar tema"
          >
            {modoOscuro ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Idioma */}
          <button
            onClick={toggleIdioma}
            className="text-gray-600 dark:text-gray-300 hover:text-primary transition"
            aria-label="Cambiar idioma"
          >
            <Globe size={20} />
          </button>

          {!minimal && token && (
            <div className="flex items-center gap-3">
              {/* 🔔 Notificaciones */}
              <button
                onClick={toggleNotificaciones}
                className="relative"
                aria-label="Abrir notificaciones"
              >
                <Bell
                  className="text-gray-600 dark:text-gray-300 hover:text-primary transition"
                  size={20}
                />
                {noLeidas > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {noLeidas}
                  </span>
                )}
              </button>

              {/* 👋 Saludo */}
              <span className="text-sm text-gray-700 dark:text-gray-200 hidden sm:block">
                👋 {i18n.language === 'es' ? 'Hola' : 'Hi'}, <strong>{nombre || 'Usuario'}</strong>
              </span>

              {/* 👤 Perfil */}
              <Link
                to="/perfil"
                className="text-gray-600 dark:text-gray-300 hover:text-primary transition"
                aria-label="Perfil"
              >
                <User size={20} />
              </Link>
            </div>
          )}

          {!minimal && !token && (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="text-sm px-3 py-1.5 rounded-md bg-primary text-white hover:bg-primary/90 transition"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="text-sm px-3 py-1.5 rounded-md border border-primary text-primary hover:bg-primary/10 transition"
              >
                Crear Cuenta
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown notificaciones */}
      {!minimal && (
        <NotificacionesDropdown
          open={mostrarNotificaciones}
          onClose={() => setMostrarNotificaciones(false)}
          notificaciones={notificaciones}
        />
      )}
    </header>
  );
}