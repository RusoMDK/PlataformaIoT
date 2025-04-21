import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function SensorConfigPanel({ sensor, onClose, onSave }) {
  const [nombre, setNombre] = useState(sensor?.nombre || '');
  const [pin, setPin] = useState(sensor?.pin || '');
  const [parametros, setParametros] = useState(sensor?.parametros || {});

  useEffect(() => {
    if (sensor?.pin && sensor.pin !== pin) {
      setPin(sensor.pin);
    }
  }, [sensor?.pin]);

  const handleSave = () => {
    const configuracionFinal = {
      ...sensor,
      nombre,
      pin,
      parametros,
    };
    onSave(configuracionFinal);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 w-full space-y-6">
      {/* Cabecera */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Configurar Sensor</h2>
        <button onClick={onClose}>
          <X className="text-gray-500 hover:text-red-500" />
        </button>
      </div>

      {/* Información general del sensor */}
      <div className="flex items-start gap-4">
        {sensor?.imagen && (
          <img
            src={sensor.imagen}
            alt={sensor.nombre}
            className="w-20 h-20 object-contain rounded-lg bg-gray-100 dark:bg-gray-800 p-1 border border-gray-300 dark:border-gray-700"
          />
        )}

        <div className="flex-1 space-y-1">
          <h3 className="text-md font-bold text-gray-800 dark:text-white">{sensor?.nombre}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Tipo:</strong> {sensor?.tipo || 'N/A'}
            <br />
            <strong>Unidad:</strong> {sensor?.unidad || 'N/A'}
            <br />
            <strong>Categoría:</strong> {sensor?.categoria || 'General'}
          </p>
        </div>
      </div>

      {/* Formulario de configuración */}
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Nombre personalizado</label>
          <input
            className="w-full mt-1 rounded-lg border px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej: Sensor suelo 1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Pin asignado</label>
          <input
            className="w-full mt-1 rounded-lg border px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white"
            value={pin || ''}
            onChange={e => setPin(e.target.value)}
            placeholder="Ej: A0, D4, etc."
          />
        </div>

        {/* Campos adicionales si se desea extender luego */}
        {/* Agregar parámetros específicos aquí si existen */}
      </div>

      <div className="pt-4">
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold"
          onClick={handleSave}
        >
          Guardar configuración
        </button>
      </div>
    </div>
  );
}
