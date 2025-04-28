import { useEffect, useState } from 'react';
import { obtenerBibliotecaSensores } from '../../services/sensoresBiblioteca';
import SensorCard from './SensorCard';
import SensorAutocomplete from './SensorAutocomplete';

export default function SensorCatalogPanel({ onSelectSensor }) {
  const [sensores, setSensores] = useState([]);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    const cargarSensores = async () => {
      const lista = await obtenerBibliotecaSensores();
      setSensores(lista);
    };
    cargarSensores();
  }, []);

  const sensoresFiltrados = sensores.filter(
    s =>
      s.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      s.tipo.toLowerCase().includes(filtro.toLowerCase()) ||
      s.unidad?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full max-h-[81vh] 2xl:max-h-[87vh] overflow-auto">
      {/* 🔍 Buscador */}
      <div className="p-4 mt-4 border-b border-gray-200 dark:border-gray-700">
        <SensorAutocomplete
          onSelect={onSelectSensor}
          placeholder="Buscar sensor..."
          onInputChange={setFiltro}
          autoFocus={false}
        />
      </div>

      {/* 🧩 Lista de sensores scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="grid grid-cols-1 gap-4">
          {sensoresFiltrados.length > 0 ? (
            <>
              {sensoresFiltrados.map(sensor => (
                <SensorCard
                  key={sensor.nombre}
                  sensor={sensor}
                  onClick={() => onSelectSensor(sensor)}
                  className="hover:shadow-md hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
                />
              ))}
              {/* 🎯 After visual */}
              <div className="after:content-[''] after:block after:h-10 after:bg-transparent" />
            </>
          ) : (
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 col-span-full">
              No se encontraron sensores.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
