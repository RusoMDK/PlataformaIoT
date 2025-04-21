import { Trash2, Pencil } from 'lucide-react';

export default function SensorCard({ sensor, onRemove, onEdit }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-xl bg-white dark:bg-dark-surface border-light-border dark:border-dark-border shadow-sm">
      <div className="flex items-center gap-4">
        {/* Imagen opcional del sensor */}
        {sensor.imagen && (
          <img
            src={sensor.imagen}
            alt={sensor.nombre}
            className="w-12 h-12 object-contain rounded bg-light-muted dark:bg-dark-muted p-1"
          />
        )}

        <div>
          <h3 className="font-semibold text-light-text dark:text-white">{sensor.nombre}</h3>
          <p className="text-sm text-muted dark:text-gray-400">
            {sensor.tipo} – {sensor.unidad} <br />
            <span className="text-xs">🧩 Pin asignado: {sensor.pin}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Botón editar */}
        {onEdit && (
          <button
            onClick={() => onEdit(sensor)}
            className="text-blue-600 hover:text-blue-800 transition"
            title="Editar sensor"
          >
            <Pencil size={18} />
          </button>
        )}

        {/* Botón eliminar */}
        <button
          onClick={() => onRemove(sensor)}
          className="text-danger hover:text-danger-hover transition"
          title="Eliminar sensor"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
