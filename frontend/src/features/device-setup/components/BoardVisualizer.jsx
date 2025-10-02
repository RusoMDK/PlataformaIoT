// src/components/things/BoardVisualizer.jsx

import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * BoardVisualizer muestra una imagen de la placa y los pines interactivos
 * donde el usuario puede hacer clic para asignar sensores.
 */
export default function BoardVisualizer({ board, pinesOcupados = [], onPinClick }) {
  const [hoveredPin, setHoveredPin] = useState(null);

  // Pines de ejemplo con posiciones absolutas (editable por tipo de placa)
  const pines = [
    { id: 'D1', top: '20%', left: '15%' },
    { id: 'D2', top: '30%', left: '15%' },
    { id: 'A0', top: '40%', left: '15%' },
    { id: 'A1', top: '50%', left: '15%' },
    { id: 'GND', top: '60%', left: '15%' },
    // Agrega más según la imagen real
  ];

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Imagen de la placa */}
      <img
        src={`/images/placas/${board || 'esp32'}.png`}
        alt={`Placa ${board}`}
        className="w-full h-auto rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
      />

      {/* Pines interactivos */}
      {pines.map(pin => {
        const ocupado = pinesOcupados.includes(pin.id);
        return (
          <div
            key={pin.id}
            className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition 
              ${ocupado ? 'bg-red-500 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} 
              ${hoveredPin === pin.id ? 'scale-110 shadow-lg' : ''}`}
            style={{ top: pin.top, left: pin.left, transform: 'translate(-50%, -50%)' }}
            onClick={() => !ocupado && onPinClick(pin.id)}
            onMouseEnter={() => setHoveredPin(pin.id)}
            onMouseLeave={() => setHoveredPin(null)}
            title={`Pin ${pin.id}`}
          >
            {pin.id}
          </div>
        );
      })}
    </div>
  );
}

BoardVisualizer.propTypes = {
  board: PropTypes.string.isRequired,
  pinesOcupados: PropTypes.arrayOf(PropTypes.string),
  onPinClick: PropTypes.func.isRequired,
};
