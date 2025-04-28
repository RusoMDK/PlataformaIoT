import { Trash2, Pencil } from 'lucide-react';

export default function SensorCard({ sensor, onRemove, onEdit, onClick, className = '' }) {
  const esCatalogo = !onEdit && !onRemove;

  const baseStyle = `rounded-xl border shadow-sm transition-all bg-white dark:bg-gray-900 
    border-gray-200 dark:border-gray-700 ${className}`;

  if (esCatalogo) {
    // 🌟 Vista catálogo (sidebar derecho)
    return (
      <div
        onClick={onClick}
        className={`cursor-pointer hover:shadow-md hover:scale-[1.02] p-4 ${baseStyle}`}
        style={{ minWidth: '100%', maxWidth: '100%' }}
      >
        <div className="flex items-center gap-4">
          {sensor.imagen && (
            <img
              src={sensor.imagen}
              alt={sensor.nombre}
              className="w-14 h-14 object-contain rounded bg-gray-100 dark:bg-gray-800 p-1"
            />
          )}
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-gray-800 dark:text-white text-base break-words line-clamp-2">
              {sensor.nombre}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 break-words line-clamp-1">
              {sensor.tipo} – {sensor.unidad || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 🧩 Vista sensores asignados (carrusel)
  return (
    <div
      className={`flex flex-col justify-between p-4 ${baseStyle}`}
      style={{
        minWidth: '180px',
        maxWidth: '200px',
        height: '100%',
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        {sensor.imagen && (
          <img
            src={sensor.imagen}
            alt={sensor.nombre}
            className="w-12 h-12 object-contain rounded bg-gray-100 dark:bg-gray-800 p-1"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 dark:text-white text-base break-words line-clamp-2">
            {sensor.nombre}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 break-words line-clamp-1">
            {sensor.tipo} – {sensor.unidad || 'N/A'}
          </p>
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        🧩 Pin: <span className="font-medium">{sensor.pin || '—'}</span>
      </div>

      <div className="flex justify-end gap-2">
        {onEdit && (
          <button
            onClick={() => onEdit(sensor)}
            className="text-blue-600 hover:text-blue-800 transition"
            title="Editar sensor"
          >
            <Pencil size={16} />
          </button>
        )}
        {onRemove && (
          <button
            onClick={() => onRemove(sensor)}
            className="text-red-600 hover:text-red-800 transition"
            title="Eliminar sensor"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
