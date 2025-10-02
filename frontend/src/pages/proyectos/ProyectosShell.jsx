// src/pages/proyectos/ProyectosShell.jsx
import { Outlet } from 'react-router-dom';
import Proyectos from './Proyectos';

export default function ProyectosShell() {
  // Renderiza SIEMPRE el listado y, si hay ruta anidada, el <Outlet> será el modal encima.
  return (
    <>
      <Proyectos />
      <Outlet />
    </>
  );
}
