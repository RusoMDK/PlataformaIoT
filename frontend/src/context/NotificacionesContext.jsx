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
      const noLeidasCount = res.data.filter(n => !n.leida).length;
      setNoLeidas(noLeidasCount);
    } catch (err) {
      console.error('Error al obtener notificaciones:', err);
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
