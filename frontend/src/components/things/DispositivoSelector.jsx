// src/components/things/DispositivoSelector.jsx
import { Cpu, RefreshCw } from 'lucide-react';

export default function DispositivoSelector({ dispositivo, onChangePlaca }) {
  if (!dispositivo) return null;

  return (
    <div className="w-full p-5 border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface rounded-xl shadow-sm flex items-center gap-6">
      <img
        src={dispositivo.imagen}
        alt={dispositivo.nombre}
        className="w-24 h-24 object-contain border border-gray-300 dark:border-gray-700 rounded-lg"
      />

      <div className="flex-1 space-y-1">
        <h3 className="text-lg font-bold text-light-text dark:text-white">
          {dispositivo.nombre || 'Dispositivo detectado'}
        </h3>
        <p className="text-sm text-light-muted dark:text-dark-muted">
          <span className="font-medium">Tipo:</span> {dispositivo.tipo.toUpperCase()}
        </p>
        <p className="text-sm text-light-muted dark:text-dark-muted">
          <span className="font-medium">Puerto:</span> {dispositivo.path}
        </p>
        <p className="text-sm text-light-muted dark:text-dark-muted">
          <span className="font-medium">Fabricante:</span>{' '}
          {dispositivo.manufacturer || 'Desconocido'}
        </p>
      </div>

      <button
        onClick={onChangePlaca}
        className="flex items-center gap-1 px-3 py-2 rounded-md text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition"
      >
        <RefreshCw size={16} />
        Cambiar
      </button>
    </div>
  );
}
