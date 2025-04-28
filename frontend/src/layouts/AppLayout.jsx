// src/layouts/AppLayout.jsx
import { useState, useEffect } from 'react';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import Sidebar from '../components/shared/Sidebar';
import SidebarDispositivos from '../components/shared/DispositivosSidebar';
import { logout } from '../api/auth.api';
import { fetchUserProfile } from '../api/auth.api';

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoverSidebar, setHoverSidebar] = useState(false);
  const [hoverSidebarRight, setHoverSidebarRight] = useState(false);
  const [dispositivos, setDispositivos] = useState([]);

  // estado de autenticación: undefined = cargando, null = no auth, object = usuario
  const [usuario, setUsuario] = useState(undefined);

  // rutas públicas donde ocultamos TODO (navbar sigue igual)
  const rutasSinLayout = ['/login', '/register'];
  const mostrarLayout = !rutasSinLayout.includes(location.pathname);

  // al iniciar, validamos user
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

  // hover sidebar
  useEffect(() => {
    const sidebarEl = document.getElementById('sidebar-hover');
    if (!sidebarEl) return;
    const enter = () => setHoverSidebar(true);
    const leave = () => setHoverSidebar(false);
    sidebarEl.addEventListener('mouseenter', enter);
    sidebarEl.addEventListener('mouseleave', leave);
    return () => {
      sidebarEl.removeEventListener('mouseenter', enter);
      sidebarEl.removeEventListener('mouseleave', leave);
    };
  }, [usuario]);

  const handleLogout = async () => {
    try {
      await logout(); // borra la cookie
    } catch (err) {
      console.error('Error en logout:', err);
    }
    setUsuario(null);
    navigate('/login', { replace: true });
  };

  return (
    <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text min-h-screen transition-colors duration-300">
      {mostrarLayout && (
        <>
          {/* Navbar siempre */}
          <div className="fixed top-0 left-0 right-0 z-40 shadow-sm glass">
            <Navbar onOpenDispositivos={() => setHoverSidebarRight(true)} />
          </div>

          {/* Sidebar izquierdo SOLO si auth y ya cargado */}
          {usuario && (
            <div
              id="sidebar-hover"
              className={`fixed top-[80px] bottom-[60px] left-0 z-40 transition-all duration-300 ease-in-out ${
                hoverSidebar ? 'w-64' : 'w-16'
              }`}
            >
              <Sidebar onLogout={handleLogout} />
            </div>
          )}

          {/* Footer */}
          <div className="fixed bottom-0 left-0 right-0 z-40">
            <Footer />
          </div>

          {/* Sidebar dispositivos SOLO si auth */}
          {usuario && (
            <SidebarDispositivos
              hover={hoverSidebarRight}
              onHoverChange={setHoverSidebarRight}
              dispositivos={dispositivos}
              setDispositivos={setDispositivos}
            />
          )}
        </>
      )}

      {/* Contenido: ajustar margenes sólo si auth */}
      <div
        className={`
          transition-[margin] duration-300 ease-in-out min-h-screen pt-[80px] pb-[60px] px-4
          ${mostrarLayout && usuario ? (hoverSidebar ? 'ml-64' : 'ml-16') : ''}
          ${mostrarLayout && usuario ? (hoverSidebarRight ? 'mr-64' : 'mr-16') : ''}
        `}
      >
        <main className="transition-all duration-300 ease-in-out">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
