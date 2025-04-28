import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchUserProfile } from '../../api/auth.api'; // 🔥 Llamamos perfil real

export default function ProtectedRoute({ children }) {
  const [autenticado, setAutenticado] = useState(null); // null = cargando
  const location = useLocation();

  useEffect(() => {
    const verificarAuth = async () => {
      try {
        await fetchUserProfile(); // 🔥 Si obtiene perfil, está autenticado
        setAutenticado(true);
      } catch (err) {
        console.warn('⚠️ Usuario no autenticado');
        setAutenticado(false);
      }
    };
    verificarAuth();
  }, []);

  if (autenticado === null) {
    return <div className="text-center mt-20 text-gray-500">Cargando...</div>; // 🔄 Mientras verifica
  }

  if (autenticado === false) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
