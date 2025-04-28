// src/components/shared/AdminRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');
  const location = useLocation();

  if (!token || rol !== 'admin') {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
