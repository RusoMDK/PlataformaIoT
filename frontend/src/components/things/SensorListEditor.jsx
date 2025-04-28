import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SensorCard from './SensorCard';

export default function SensorListEditor({
  sensores = [],
  onEdit = () => {},
  onRemove = () => {},
}) {
  const [slideIndex, setSlideIndex] = useState(0);
  const SLIDE_WIDTH = 500; // Ancho fijo en px por slide

  const slides = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < sensores.length; i += 4) {
      chunks.push(sensores.slice(i, i + 4));
    }
    return chunks;
  }, [sensores]);

  const avanzar = () => {
    setSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
  };

  const retroceder = () => {
    setSlideIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="space-y-4 w-full">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
        Sensores asignados ({sensores.length})
      </h2>

      {slides.length > 0 && (
        <div className="flex items-center justify-center gap-4">
          {/* ⬅️ Botón izquierda */}
          <button
            onClick={retroceder}
            disabled={slideIndex === 0}
            className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 p-2 rounded-full shadow hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>

          {/* 🎞️ Carrusel */}
          <div className="w-[500px] overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out mb-12"
              style={{
                transform: `translateX(-${slideIndex * SLIDE_WIDTH}px)`,
                width: `${slides.length * SLIDE_WIDTH}px`,
              }}
            >
              {slides.map((grupo, i) => (
                <div key={i} className="grid grid-cols-2 grid-rows-2 gap-4 flex-none w-[500px]">
                  {grupo.map((sensor, idx) => (
                    <SensorCard
                      key={sensor.id || `${i}-${idx}`}
                      sensor={sensor}
                      onEdit={() => onEdit(sensor)}
                      onRemove={() => onRemove(idx + i * 4)}
                      className="h-full"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ➡️ Botón derecha */}
          <button
            onClick={avanzar}
            disabled={slideIndex === slides.length - 1}
            className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 p-2 rounded-full shadow hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
