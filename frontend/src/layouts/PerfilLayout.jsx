// src/layouts/PerfilLayout.jsx
import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProfile, updateCuenta } from '../api/apiUsuarios';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import PerfilTabs from '../pages/user/tabs/PerfilTabs';

export default function PerfilLayout() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carga inicial del perfil
  useEffect(() => {
    (async () => {
      try {
        const user = await getProfile();

        // 🛡️ Aseguramos que siempre haya preferencias
        setPerfil({
          ...user,
          preferencias: {
            temaUI: user.preferencias?.temaUI || 'system',
            idioma: user.preferencias?.idioma || 'es',
            notificaciones: user.preferencias?.notificaciones ?? true,
          },
        });
      } catch (err) {
        console.error('Error cargando perfil', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Función de guardado única
  const onSaveProfile = async formData => {
    const updated = await updateCuenta(formData);

    // 🛡️ Al guardar también garantizamos preferencias
    setPerfil({
      ...updated,
      preferencias: {
        temaUI: updated.preferencias?.temaUI || 'system',
        idioma: updated.preferencias?.idioma || 'es',
        notificaciones: updated.preferencias?.notificaciones ?? true,
      },
    });

    return updated;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Cargando perfil...</span>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-red-500 dark:text-red-400">No se pudo cargar el perfil.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg transition-colors">
      <Navbar />

      <div className="sticky top-[65px] z-30 bg-white dark:bg-gray-950 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PerfilTabs />
        </div>
      </div>

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 py-8 mt-[113px]">
        <Outlet context={{ perfil, setPerfil, onSaveProfile }} />
      </main>

      <Footer />
    </div>
  );
}
