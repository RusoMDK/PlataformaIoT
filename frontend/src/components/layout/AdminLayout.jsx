// components/layout/AdminLayout.jsx
import { useLocation } from 'react-router-dom';
import { Navbar, Sidebar, Footer } from '@/components/shared';

export default function AdminLayout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white dark:bg-darkBg text-gray-800 dark:text-white">
      <Navbar />

      <div className="flex pt-[80px] pb-[60px]">
        <Sidebar />

        <main className="flex-1 px-6 transition-all duration-300">{children}</main>
      </div>

      <Footer />
    </div>
  );
}
