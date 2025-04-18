// components/layout/MainLayout.jsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar, Sidebar, SidebarDispositivos, Footer } from '@/components/shared';

export default function MainLayout({ children }) {
  const location = useLocation();
  const [hoverSidebar, setHoverSidebar] = useState(false);
  const [hoverSidebarRight, setHoverSidebarRight] = useState(false);
  const [mostrarDispositivos, setMostrarDispositivos] = useState(false);

  const ocultarNavbarEn = ['/login', '/register'];
  const mostrarLayout = !ocultarNavbarEn.includes(location.pathname);

  useEffect(() => {
    const sidebar = document.getElementById('sidebar-hover');
    if (!sidebar) return;
    const handleEnter = () => setHoverSidebar(true);
    const handleLeave = () => setHoverSidebar(false);
    sidebar.addEventListener('mouseenter', handleEnter);
    sidebar.addEventListener('mouseleave', handleLeave);
    return () => {
      sidebar.removeEventListener('mouseenter', handleEnter);
      sidebar.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-darkBg text-gray-800 dark:text-darkText transition-colors duration-300 min-h-screen">
      {mostrarLayout && (
        <div className="fixed top-0 left-0 right-0 z-40">
          <Navbar onOpenDispositivos={() => setMostrarDispositivos(true)} />
        </div>
      )}

      {mostrarLayout && (
        <div
          id="sidebar-hover"
          className={`fixed top-[80px] bottom-[60px] left-0 z-40 transition-all duration-300 ease-in-out ${
            hoverSidebar ? 'w-64' : 'w-16'
          }`}
        >
          <Sidebar />
        </div>
      )}

      <main
        className={`pt-[80px] pb-[60px] min-h-screen px-4 transition-[margin] duration-300 ease-in-out ${
          mostrarLayout ? (hoverSidebar ? 'ml-64' : 'ml-16') : ''
        } ${mostrarLayout ? (hoverSidebarRight ? 'mr-64' : 'mr-16') : ''}`}
      >
        {children}
      </main>

      {mostrarLayout && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <Footer />
        </div>
      )}

      {mostrarLayout && (
        <SidebarDispositivos
          hover={hoverSidebarRight}
          onHoverChange={setHoverSidebarRight}
          abierto={mostrarDispositivos}
          onClose={() => setMostrarDispositivos(false)}
        />
      )}
    </div>
  );
}
