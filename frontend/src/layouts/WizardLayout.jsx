// src/layouts/WizardLayout.jsx
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import { Outlet } from 'react-router-dom';

export default function WizardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors">
      <Navbar />

      <main className="flex-1 w-full px-4 py-10 flex items-center justify-center">
        <div className="w-full max-w-3xl">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}
