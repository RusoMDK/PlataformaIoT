// ✅ EmptySensors.jsx
import { useState } from 'react';
import SensorAutocomplete from './SensorAutocomplete';

export default function EmptySensors({ onAgregar }) {
  const [query, setQuery] = useState('');

  const handleSelect = sensor => {
    if (!sensor) return;
    onAgregar(sensor);
    setQuery('');
  };

  return (
    <div className="text-center p-6 border border-dashed rounded-xl border-gray-300 dark:border-gray-600 bg-light-surface dark:bg-dark-surface transition">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white">Sin sensores asignados</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Usa el buscador para agregar sensores desde la biblioteca y configurarlos visualmente.
      </p>

      <div className="max-w-md mx-auto">
        <SensorAutocomplete value={query} onInputChange={setQuery} onSelect={handleSelect} />
      </div>
    </div>
  );
}
