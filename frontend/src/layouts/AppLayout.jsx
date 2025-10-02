import { useState, useEffect } from 'react';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../widgets/shell/Navbar';
import Footer from '../widgets/shell/Footer';
import Sidebar from '../widgets/shell/Sidebar';
import SidebarDispositivos from '../widgets/shell/DispositivosSidebar';
import { logout, fetchUserProfile } from '../api/auth.api';

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoverSidebar, setHoverSidebar] = useState(false);
  const [hoverSidebarRight, setHoverSidebarRight] = useState(false);
  const [dispositivos, setDispositivos] = useState([]);

  // undefined = cargando, null = no auth, object = usuario
  const [usuario, setUsuario] = useState(undefined);

  const rutasSinLayout = ['/login', '/register'];
  const mostrarLayout = !rutasSinLayout.includes(location.pathname);

  useEffect(() => {
    (async () => {
      try { setUsuario(await fetchUserProfile()); }
      catch { setUsuario(null); }
    })();
  }, []);

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
    try { await logout(); } catch (err) { console.error('Error en logout:', err); }
    setUsuario(null);
    navigate('/login', { replace: true });
  };

  return (
    // el body no scrollea; scrollea #app-content
    <div className="relative h-screen overflow-hidden bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300">
      {/* Fondo global cubriendo toda la pantalla (también detrás de sidebars) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/20 blur-xl md:blur-2xl opacity-70 dark:opacity-40" />
        <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-accent/20 blur-xl md:blur-2xl opacity-70 dark:opacity-40" />
        <div className="absolute inset-0 [background:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:20px_20px] dark:opacity-20 opacity-30" />
      </div>

      {mostrarLayout && (
        <>
          {/* Navbar */}
          <div className="fixed top-0 left-0 right-0 z-40 shadow-sm glass">
            <Navbar onOpenDispositivos={() => setHoverSidebarRight(true)} />
          </div>

          {/* Sidebar izquierdo (overlay) */}
          {usuario && (
            <div
              id="sidebar-hover"
              className={`fixed top-[80px] bottom-[60px] left-0 z-40 transition-all duration-300 ease-in-out ${hoverSidebar ? 'w-64' : 'w-16'}`}
            >
              <Sidebar onLogout={handleLogout} />
            </div>
          )}

          {/* Footer */}
          <div className="fixed bottom-0 left-0 right-0 z-40">
            <Footer />
          </div>

          {/* Sidebar derecho (overlay) */}
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

      {/* Contenido (padding lateral dinámico cuando los sidebars se expanden) */}
      <div
        id="app-content"
        className={`
          h-full overflow-y-auto no-scrollbar overscroll-y-contain scroll-smooth
          transition-[padding] duration-300 ease-in-out pt-[80px] pb-[60px] will-change-transform
          ${mostrarLayout && usuario ? (hoverSidebar ? 'pl-[calc(1rem+16rem)]' : 'pl-4') : 'pl-4'}
          ${mostrarLayout && usuario ? (hoverSidebarRight ? 'pr-[calc(1rem+16rem)]' : 'pr-4') : 'pr-4'}
        `}
      >
        <main className="transition-all duration-300 ease-in-out cv-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
