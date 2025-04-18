// src/layouts/AuthLayout.jsx

import { Outlet } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 via-blue-50 to-white dark:from-darkBg dark:via-darkMuted dark:to-darkSurface transition-colors duration-300">
      {/* Navbar normal fluido */}
      <Navbar minimal />

      {/* Contenido principal centrado con espacio natural */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white/90 dark:bg-darkSurface/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 animate-fade-in-down">
          <Outlet />
        </div>
      </main>

      {/* Footer normal fluido */}
      <Footer />
    </div>
  );
}
