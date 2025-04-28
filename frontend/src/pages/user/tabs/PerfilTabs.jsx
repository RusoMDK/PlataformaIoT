// src/pages/user/tabs/PerfilTabs.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

export default function PerfilTabs() {
  const navigate = useNavigate();
  const links = [
    { to: '/perfil/cuenta', label: 'Cuenta' },
    { to: '/perfil/preferencias', label: 'Preferencias' },
    { to: '/perfil/seguridad', label: 'Seguridad' },
    { to: '/perfil/datos', label: 'Datos' },
    { to: '/perfil/privacidad', label: 'Privacidad' },
  ];

  return (
    <nav className="fixed top-[65px] left-0 right-0 bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
        {/* Enlaces alineados a la izquierda */}
        <div className="flex items-center space-x-4">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `h-full flex items-center px-3 text-sm font-medium border-b-2 transition ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-primary'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Botón Volver alineado a la derecha */}
        <Button variant="outline" size="sm" onClick={() => navigate('/home')}>
          Volver
        </Button>
      </div>
    </nav>
  );
}
