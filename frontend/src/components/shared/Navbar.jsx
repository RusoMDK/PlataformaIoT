// src/components/shared/Navbar.jsx
import { Link } from 'react-router-dom';
import { Bell, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchUserProfile } from '../../api/auth.api';
import NotificacionesDropdown from './NotificacionesDropdown';
import ThemeToggle from './ThemeToggle';
import { useTranslation } from 'react-i18next';

import logoLight from '../../assets/logo.png';
import logoDark from '../../assets/logo_dark_contrast.png';

// Si NotificacionesContext no está montado (p.ej. en minimal), evitamos errores
let useNotificacionesSafe = () => ({ noLeidas: 0, notificaciones: [] });
try {
  const { useNotificaciones } = require('../../context/NotificacionesContext');
  useNotificacionesSafe = useNotificaciones;
} catch {}

export default function Navbar({ minimal = false }) {
  const { noLeidas, notificaciones } = useNotificacionesSafe();
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    if (minimal) return;
    let mounted = true;
    (async () => {
      try {
        const user = await fetchUserProfile();
        if (mounted) setUsuario(user);
      } catch {
        if (mounted) setUsuario(null);
      }
    })();
    return () => { mounted = false; };
  }, [minimal]);

  const toggleIdioma = () => {
    const nuevo = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nuevo);
  };

  const toggleNotificaciones = () => setMostrarNotificaciones(p => !p);

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="w-full flex items-center justify-between px-4 py-3">
        {/* Logo (swap según tema) */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3">
            {/* Light */}
            <img src={logoLight} alt="Smart IoT" className="h-10 w-auto dark:hidden" />
            {/* Dark */}
            <img src={logoDark}  alt="Smart IoT" className="h-10 w-auto hidden dark:block" />
          </Link>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <button
            onClick={toggleIdioma}
            className="icon-btn"
            aria-label="Cambiar idioma"
          >
            <Globe size={20} />
          </button>

          {minimal ? (
            <div className="flex gap-2">
              <Link to="/login" className="btn btn-primary">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn btn-outline-primary">
                Crear Cuenta
              </Link>
            </div>
          ) : (
            <>
              {usuario ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleNotificaciones}
                    className="relative icon-btn"
                    aria-label="Abrir notificaciones"
                  >
                    <Bell size={20} />
                    {noLeidas > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {noLeidas}
                      </span>
                    )}
                  </button>

                  <span className="text-sm text-gray-700 dark:text-gray-200 hidden sm:block">
                    👋 {i18n.language === 'es' ? 'Hola' : 'Hi'},{' '}
                    <strong>{usuario.nombre || 'Usuario'}</strong>
                  </span>

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
                  <Link to="/login" className="btn btn-primary">
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="btn btn-outline-primary">
                    Crear Cuenta
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!minimal && usuario && (
        <NotificacionesDropdown
          open={mostrarNotificaciones}
          onClose={() => setMostrarNotificaciones(false)}
          notificaciones={notificaciones}
        />
      )}
    </header>
  );
}
