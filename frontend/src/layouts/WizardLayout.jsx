// ✅ src/layouts/WizardLayout.jsx

import { Outlet } from 'react-router-dom';

export default function WizardLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-darkBg dark:to-darkSurface px-4">
      <div className="w-full max-w-3xl bg-white dark:bg-darkSurface rounded-2xl shadow-xl p-8">
        <Outlet />
      </div>
    </div>
  );
}
