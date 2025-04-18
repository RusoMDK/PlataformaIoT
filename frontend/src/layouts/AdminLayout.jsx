// ✅ src/layouts/AdminLayout.jsx

import { Outlet } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import Sidebar from '@/components/shared/Sidebar';
import Footer from '@/components/shared/Footer';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-darkBg text-gray-900 dark:text-white">
      <Navbar />
      <div className="flex pt-[72px] pb-[60px]">
        <Sidebar />
        <main className="flex-1 px-4">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
