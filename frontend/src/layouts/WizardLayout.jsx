// src/layouts/WizardLayout.jsx
import { Outlet } from 'react-router-dom';

export default function WizardLayout() {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg px-4 py-10 flex items-center justify-center transition-colors duration-300">
      <div className="w-full max-w-3xl rounded-2xl shadow-xl p-8 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border transition-colors">
        <Outlet />
      </div>
    </div>
  );
}
