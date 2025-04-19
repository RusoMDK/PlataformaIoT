import { useEffect, useRef, useState } from 'react';

export default function NotificacionesDropdown({ open, onClose, notificaciones = [] }) {
  const ref = useRef();
  const [hover, setHover] = useState(false);

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
    <div className="fixed inset-0 z-[99998] bg-transparent" onClick={onClose}>
      <div
        ref={ref}
        onClick={e => e.stopPropagation()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={`absolute right-4 top-16 w-80 max-h-[24rem] z-[99999] rounded-xl border 
          border-gray-200 dark:border-gray-700 
          bg-white/60 dark:bg-gray-900/60 
          shadow-xl p-4 backdrop-blur-md 
          animate-fade-in-down transition-all duration-300
          ${hover ? 'bg-white dark:bg-gray-900 opacity-100' : 'opacity-70'}`}
      >
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
          🔔 Notificaciones
        </h3>

        {notificaciones.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No hay nuevas notificaciones.</p>
        ) : (
          <ul className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {notificaciones.map((n, idx) => (
              <li
                key={idx}
                className="text-sm px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-transparent hover:border-blue-500 transition"
              >
                {n.mensaje}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
