import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const NotificacionesContext = createContext();

export const useNotificaciones = () => useContext(NotificacionesContext);

export const NotificacionesProvider = ({ children }) => {
  const [noLeidas, setNoLeidas] = useState(0);
  const token = localStorage.getItem('token');

  const obtenerConteo = async () => {
    try {
      const res = await axios.get('/api/notificaciones', {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('📥 Notificaciones recibidas:', res.data);

      if (Array.isArray(res.data)) {
        const nuevas = res.data.filter(n => !n.leida);
        setNoLeidas(nuevas.length);
      } else {
        console.warn('⚠️ Las notificaciones recibidas NO son un array:', res.data);
        setNoLeidas(0);
      }
    } catch (err) {
      console.error('❌ Error al obtener notificaciones:', err);
      setNoLeidas(0);
    }
  };

  useEffect(() => {
    if (token) obtenerConteo();
  }, [token]);

  return (
    <NotificacionesContext.Provider value={{ noLeidas, setNoLeidas, obtenerConteo }}>
      {children}
    </NotificacionesContext.Provider>
  );
};
