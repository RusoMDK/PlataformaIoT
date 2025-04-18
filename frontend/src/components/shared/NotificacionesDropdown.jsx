import { useEffect, useRef } from 'react';
import Button from '../ui/Button';

export default function NotificacionesDropdown({ open, onClose, notificaciones = [] }) {
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
      className="absolute right-14 top-14 w-72 bg-white rounded shadow-lg p-4 border animate-fadeInDown z-50"
    >
      <h3 className="font-semibold text-sm mb-2">🔔 Notificaciones</h3>
      {notificaciones.length === 0 ? (
        <p className="text-sm text-gray-500">No tienes notificaciones nuevas.</p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {notificaciones.map((n, idx) => (
            <li key={idx} className="text-sm bg-gray-100 px-3 py-2 rounded shadow-sm">
              {n.mensaje}
            </li>
          ))}
        </ul>
      )}
      <div className="text-right mt-4">
        <Button onClick={onClose} variant="secondary">
          Cerrar
        </Button>
      </div>
    </div>
  );
}
