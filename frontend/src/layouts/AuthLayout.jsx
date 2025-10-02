// src/layouts/AuthLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../widgets/shell/Navbar';
import Footer from '../widgets/shell/Footer';

export default function AuthLayout() {
  return (
    <div className="
      min-h-screen flex flex-col
      bg-gradient-to-br
      from-light-bg via-blue-50 to-light-surface
      dark:from-dark-bg dark:via-dark-muted dark:to-dark-surface
      transition-colors duration-300
    ">
      {/* Navbar minimal */}
      <Navbar minimal />

      {/* Contenido principal */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div
          className="
            w-full max-w-md
            bg-white/90 dark:bg-dark-surface/90
            backdrop-blur-md rounded-2xl shadow-xl
            border border-light-border dark:border-dark-border
            p-8 animate-fade-in-down
          "
        >
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}
