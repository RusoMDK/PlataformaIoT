import { useEffect, useRef } from 'react';
import Button from '../ui/Button';

export default function PerfilDropdown({ open, onClose, nombre, correo, onLogout }) {
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = e => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-4 top-14 w-64 bg-white rounded shadow-lg p-4 border animate-fadeInDown z-50"
    >
      <h3 className="font-semibold text-sm mb-2">👤 Perfil</h3>
      <p className="text-sm text-gray-700">
        <strong>Nombre:</strong> {nombre}
      </p>
      <p className="text-sm text-gray-700 mb-4">
        <strong>Correo:</strong> {correo}
      </p>
      <Button onClick={onLogout} variant="danger" className="w-full">
        Cerrar sesión
      </Button>
    </div>
  );
}
