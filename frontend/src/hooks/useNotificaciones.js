// src/hooks/useNotificaciones.js
import { useContext } from 'react';
import { NotificacionesContext } from '../context/NotificacionesContext';

export function useNotificaciones() {
  return useContext(NotificacionesContext);
}
