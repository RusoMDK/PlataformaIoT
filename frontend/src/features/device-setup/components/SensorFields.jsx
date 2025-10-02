import { useEffect, useState } from 'react';

export default function SensorFields({ sensor, onChange }) {
  const [campos, setCampos] = useState(sensor);

  useEffect(() => {
    setCampos(sensor);
  }, [sensor]);

  const actualizar = (campo, valor) => {
    const actualizado = { ...campos, [campo]: valor };
    setCampos(actualizado);
    onChange(actualizado);
  };

  return (
    <div className="space-y-4 bg-light-surface dark:bg-dark-surface p-4 rounded-xl border border-light-border dark:border-dark-border shadow-sm">
      <div>
        <label className="block text-sm font-medium text-light-text dark:text-white mb-1">
          Nombre del sensor
        </label>
        <input
          type="text"
          value={campos.nombre}
          onChange={e => actualizar('nombre', e.target.value)}
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text dark:text-white mb-1">
          Unidad de medida
        </label>
        <input
          type="text"
          value={campos.unidad}
          onChange={e => actualizar('unidad', e.target.value)}
          className="input"
        />
      </div>

      <div className="flex gap-4">
        <div className="w-1/2">
          <label className="block text-sm font-medium text-light-text dark:text-white mb-1">
            Rango mínimo
          </label>
          <input
            type="number"
            value={campos.rangoMin || ''}
            onChange={e => actualizar('rangoMin', e.target.value)}
            className="input"
          />
        </div>
        <div className="w-1/2">
          <label className="block text-sm font-medium text-light-text dark:text-white mb-1">
            Rango máximo
          </label>
          <input
            type="number"
            value={campos.rangoMax || ''}
            onChange={e => actualizar('rangoMax', e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text dark:text-white mb-1">
          Tipo
        </label>
        <select
          value={campos.tipo}
          onChange={e => actualizar('tipo', e.target.value)}
          className="input"
        >
          <option value="">Seleccionar tipo</option>
          <option value="analogico">Analógico</option>
          <option value="digital">Digital</option>
          <option value="pwm">PWM</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text dark:text-white mb-1">
          Pin asignado
        </label>
        <input
          type="text"
          value={campos.pin}
          disabled
          className="input opacity-60 cursor-not-allowed"
        />
      </div>
    </div>
  );
}
