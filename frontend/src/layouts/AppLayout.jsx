import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import Sidebar from '../components/shared/Sidebar';
import SidebarDispositivos from '../components/shared/DispositivosSidebar';
import AppRoutes from '../routes/AppRoutes';
import { ToastViewport } from '../components/ui/Toast';

export default function AppLayout() {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');
  const location = useLocation();
  const [hoverSidebar, setHoverSidebar] = useState(false);
  const [hoverSidebarRight, setHoverSidebarRight] = useState(false);
  const [dispositivos, setDispositivos] = useState([]);

  const mostrarLayout = !['/login', '/register'].includes(location.pathname);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  useEffect(() => {
    const sidebar = document.getElementById('sidebar-hover');
    if (!sidebar) return;
    const enter = () => setHoverSidebar(true);
    const leave = () => setHoverSidebar(false);
    sidebar.addEventListener('mouseenter', enter);
    sidebar.addEventListener('mouseleave', leave);
    return () => {
      sidebar.removeEventListener('mouseenter', enter);
      sidebar.removeEventListener('mouseleave', leave);
    };
  }, []);

  return (
    <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text min-h-screen transition-colors duration-300">
      {mostrarLayout && (
        <>
          {/* Navbar glass y sombra */}
          <div className="fixed top-0 left-0 right-0 z-40 shadow-sm glass">
            <Navbar onOpenDispositivos={() => setHoverSidebarRight(true)} />
          </div>

          {/* Sidebar izquierdo con expansión hover */}
          <div
            id="sidebar-hover"
            className={`fixed top-[80px] bottom-[60px] left-0 z-40 transition-all duration-300 ease-in-out ${
              hoverSidebar ? 'w-64' : 'w-16'
            }`}
          >
            <Sidebar onLogout={handleLogout} />
          </div>

          {/* Footer fijo abajo */}
          <div className="fixed bottom-0 left-0 right-0 z-40">
            <Footer />
          </div>

          {/* Sidebar derecho (Dispositivos) */}
          <SidebarDispositivos
            hover={hoverSidebarRight}
            onHoverChange={setHoverSidebarRight}
            dispositivos={dispositivos}
            setDispositivos={setDispositivos}
          />
        </>
      )}

      {/* Contenido principal ajustado al layout */}
      <div
        className={`
          transition-[margin] duration-300 ease-in-out min-h-screen pt-[80px] pb-[60px] px-4
          ${mostrarLayout ? (hoverSidebar ? 'ml-64' : 'ml-16') : ''}
          ${mostrarLayout ? (hoverSidebarRight ? 'mr-64' : 'mr-16') : ''}
        `}
      >
        <main className="transition-all duration-300 ease-in-out">
          <AppRoutes token={token} rol={rol} />
        </main>
      </div>

      <ToastViewport />
    </div>
  );
}
