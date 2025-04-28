import { useState, useEffect } from 'react';

export default function SensorConfigPanel({ sensor, selectedPin, onSave }) {
  const [nombre, setNombre] = useState('');
  const [pin, setPin] = useState('');
  const [color, setColor] = useState('#facc15');
  const [parametros, setParametros] = useState({});

  useEffect(() => {
    setNombre(sensor?.nombre || '');
    setPin(sensor?.pin || selectedPin || '');
    setColor(sensor?.color || '#facc15');
    setParametros(sensor?.parametros || {});
  }, [sensor]);

  useEffect(() => {
    if (selectedPin && selectedPin !== pin) {
      setPin(selectedPin);
    }
  }, [selectedPin]);

  const handleSave = () => {
    if (!sensor) return; // No guardar si no hay sensor
    const configuracionFinal = {
      ...sensor,
      nombre,
      pin: pin || selectedPin || '',
      color,
      parametros,
    };
    onSave(configuracionFinal);
  };

  return (
    <div className="w-full space-y-6 min-h-[260px] border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-900 shadow">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Configurar sensor</h2>

      {/* 📸 Info sensor o aviso */}
      {!sensor ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          Selecciona un sensor del catálogo para comenzar.
        </p>
      ) : (
        <div className="flex items-start gap-4">
          {sensor.imagen && (
            <img
              src={sensor.imagen}
              alt={sensor.nombre}
              className="w-16 h-16 object-contain rounded-md bg-gray-100 dark:bg-gray-800 p-1 border border-gray-300 dark:border-gray-700"
            />
          )}
          <div className="flex-1 space-y-1 text-sm">
            <div className="font-medium text-gray-800 dark:text-white">{sensor.nombre}</div>
            <p className="text-gray-600 dark:text-gray-300 leading-snug">
              <strong>Tipo:</strong> {sensor.tipo || 'N/A'} <br />
              <strong>Unidad:</strong> {sensor.unidad || 'N/A'} <br />
              <strong>Categoría:</strong> {sensor.categoria || 'General'}
            </p>
          </div>
        </div>
      )}

      {/* 🧩 Formulario (siempre visible) */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
            Nombre personalizado
          </label>
          <input
            type="text"
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej: Sensor de luz 1"
            disabled={!sensor}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
            Pin asignado
          </label>
          <input
            type="text"
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="Ej: A0, D4..."
            disabled={!sensor}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
            Color de pin en placa
          </label>
          <input
            type="color"
            className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer"
            value={color}
            onChange={e => setColor(e.target.value)}
            disabled={!sensor}
          />
        </div>
      </div>

      {/* 💾 Botón guardar */}
      <div className="pt-2">
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-40"
          onClick={handleSave}
          disabled={!sensor}
        >
          Guardar configuración
        </button>
      </div>
    </div>
  );
}
