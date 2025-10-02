// src/layouts/WizardLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../widgets/shell/Navbar';
import Footer from '../widgets/shell/Footer';
import Stepper from '../components/ui/Stepper';

export default function WizardLayout() {
  return (
    <div className="flex flex-col h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
      {/* Navbar fijo arriba */}
      <Navbar />

      {/* Contenido principal debajo del navbar */}
      <main className="flex-1 flex flex-col pt-[64px] overflow-hidden">
        {/* Stepper centrado y del mismo ancho del navbar */}
        <div className="w-full border-b border-light-border dark:border-gray-700 shadow-sm bg-light-bg dark:bg-dark-bg">
          <div className="max-w-6xl mx-auto w-full px-4 py-4">
            <Stepper />
          </div>
        </div>

        {/* Contenido dinámico */}
        <div className="flex-1 overflow-hidden px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer visible al fondo */}
      <Footer />
    </div>
  );
}
