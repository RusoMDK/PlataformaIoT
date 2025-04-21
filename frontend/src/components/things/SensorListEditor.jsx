import SensorCard from './SensorCard';

export default function SensorListEditor({
  sensores = [],
  onEdit = () => {},
  onRemove = () => {},
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
        Sensores asignados ({sensores.length})
      </h2>

      {sensores.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No se han agregado sensores aún. Usa el buscador para comenzar.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sensores.map((sensor, idx) => (
            <SensorCard
              key={sensor.id || idx}
              sensor={sensor}
              onEdit={() => onEdit(sensor)}
              onRemove={() => onRemove(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
