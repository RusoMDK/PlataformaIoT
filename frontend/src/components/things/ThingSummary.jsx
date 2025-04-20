export default function ThingSummary({ dispositivo, sensores }) {
  return (
    <div className="rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface p-5 shadow-sm space-y-4 transition-colors">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        🧾 Resumen del Proyecto
      </h2>

      {/* Datos del dispositivo */}
      <div className="space-y-1">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong className="text-light-text dark:text-white">Placa seleccionada:</strong>{' '}
          {dispositivo.nombre || dispositivo.tipo}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong className="text-light-text dark:text-white">Modelo o chip:</strong>{' '}
          {dispositivo.chip || 'No definido'}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong className="text-light-text dark:text-white">Puerto:</strong>{' '}
          {dispositivo.path || 'N/A'}
        </p>
      </div>

      {/* Resumen de sensores */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-2">
          📦 Sensores asignados
        </h3>
        {sensores.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Aún no se han agregado sensores.
          </p>
        ) : (
          <ul className="space-y-2">
            {sensores.map((sensor, i) => (
              <li
                key={i}
                className="text-sm text-gray-700 dark:text-gray-300 border-b border-dashed pb-2 last:border-none last:pb-0"
              >
                <strong>{sensor.nombre}</strong> en pin{' '}
                <span className="font-mono text-primary dark:text-primary-dark">{sensor.pin}</span>{' '}
                — <span className="text-muted dark:text-dark-muted">{sensor.tipo}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
