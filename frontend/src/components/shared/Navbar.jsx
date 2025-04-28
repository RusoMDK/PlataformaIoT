import { Link, useNavigate } from 'react-router-dom';
import { useNotificaciones } from '../../context/NotificacionesContext';
import { Bell, Moon, Sun, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchUserProfile } from '../../api/auth.api';
import NotificacionesDropdown from './NotificacionesDropdown';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/logo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const { noLeidas, notificaciones } = useNotificaciones();
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const { theme, setTheme } = useTheme(); // 🔥 cambiamos esto
  const { i18n } = useTranslation();

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const user = await fetchUserProfile();
        setUsuario(user);
      } catch (err) {
        console.warn('⚠️ Usuario no autenticado');
        setUsuario(null);
      }
    };
    cargarUsuario();
  }, []);

  const toggleIdioma = () => {
    const nuevo = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nuevo);
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  const toggleNotificaciones = () => {
    setMostrarNotificaciones(prev => !prev);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="w-full flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="IoT Platform Logo" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          {/* Botón Modo Oscuro */}
          {/* Botón Modo Oscuro */}
          <button
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300 hover:text-primary transition"
            aria-label="Cambiar tema"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Botón Idioma */}
          <button
            onClick={toggleIdioma}
            className="text-gray-600 dark:text-gray-300 hover:text-primary transition"
            aria-label="Cambiar idioma"
          >
            <Globe size={20} />
          </button>

          {/* Usuario logueado */}
          {usuario ? (
            <div className="flex items-center gap-3">
              {/* Notificaciones */}
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

              {/* Saludo */}
              <span className="text-sm text-gray-700 dark:text-gray-200 hidden sm:block">
                👋 {i18n.language === 'es' ? 'Hola' : 'Hi'},{' '}
                <strong>{usuario.nombre || 'Usuario'}</strong>
              </span>

              {/* Foto de perfil */}
              <Link
                to="/perfil"
                className="block w-11 h-11 rounded-full overflow-hidden border-2 border-primary hover:scale-105 transition"
              >
                <img
                  src={usuario.fotoPerfil || '/assets/profile-placeholder.png'}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                />
              </Link>
            </div>
          ) : (
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

      {/* Dropdown de notificaciones */}
      {usuario && (
        <NotificacionesDropdown
          open={mostrarNotificaciones}
          onClose={() => setMostrarNotificaciones(false)}
          notificaciones={notificaciones}
        />
      )}
    </header>
  );
}
