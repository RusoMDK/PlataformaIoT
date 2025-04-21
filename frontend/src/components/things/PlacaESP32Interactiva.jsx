// src/components/things/PlacaESP32Interactiva.jsx
import { useState } from 'react';
import Esp32DevkitCV4 from './svg/Esp32DevkitCV4';

const PINS = [
  // 📍 Lado izquierdo (LEFT SIDE)
  { id: '3V3', label: '3V3', top: '13.6%', left: '4%' },
  { id: 'EN', label: 'EN', top: '18%', left: '4%' },
  { id: 'VP', label: 'VP', top: '22.5%', left: '4%' },
  { id: 'VN', label: 'VN', top: '27%', left: '4%' },
  { id: '34', label: '34', top: '31.6%', left: '4%' },
  { id: '35', label: '35', top: '36.2%', left: '4%' },
  { id: '32', label: '32', top: '40.5%', left: '4%' },
  { id: '33', label: '33', top: '45%', left: '4%' },
  { id: '25', label: '25', top: '49.5%', left: '4%' },
  { id: '26', label: '26', top: '54%', left: '4%' },
  { id: '27', label: '27', top: '58.5%', left: '4%' },
  { id: '14', label: '14', top: '63%', left: '4%' },
  { id: '12', label: '12', top: '67.5%', left: '4%' },
  { id: 'GND1', label: 'GND', top: '71.8%', left: '4%' },
  { id: '13', label: '13', top: '76.3%', left: '4%' },
  { id: 'D2', label: 'D2', top: '80.7%', left: '4%' },
  { id: 'D3', label: 'D3', top: '85.2%', left: '4%' },
  { id: 'CMD', label: 'CMD', top: '89.5%', left: '4%' },
  { id: '5V', label: '5V', top: '94%', left: '4%' },

  // 📍 Lado derecho (RIGHT SIDE)
  { id: 'GND2', label: 'GND', top: '13.6%', left: '95%' },
  { id: '23', label: '23', top: '18%', left: '95%' },
  { id: '22', label: '22', top: '22.5%', left: '95%' },
  { id: 'TX', label: 'TX', top: '27%', left: '95%' },
  { id: 'RX', label: 'RX', top: '31.6%', left: '95%' },
  { id: '21', label: '21', top: '35.9%', left: '95%' },
  { id: 'GND', label: 'GND', top: '40.5%', left: '95%' },
  { id: '19', label: '19', top: '45%', left: '95%' },
  { id: '18', label: '18', top: '49.5%', left: '95%' },
  { id: '5', label: '5', top: '54%', left: '95%' },
  { id: '17', label: '17', top: '58.5%', left: '95%' },
  { id: '16', label: '16', top: '63%', left: '95%' },
  { id: '4', label: '4', top: '67.5%', left: '95%' },
  { id: '0', label: '0', top: '71.8%', left: '95%' },
  { id: '2', label: '2', top: '76.3%', left: '95%' },
  { id: '15', label: '15', top: '80.7%', left: '95%' },
  { id: 'D1', label: 'D1', top: '85.2%', left: '95%' },
  { id: 'DO', label: 'DO', top: '89.5%', left: '95%' },
  { id: 'CLK', label: 'CLK', top: '94%', left: '95%' },
];

export default function PlacaESP32Interactiva({ onSelectPin, sensores = [] }) {
  const [pinSeleccionado, setPinSeleccionado] = useState(null);

  const handleClick = pin => {
    const nuevo = pinSeleccionado === pin.id ? null : pin.id;
    setPinSeleccionado(nuevo);
    if (onSelectPin) onSelectPin(nuevo);
  };

  return (
    <div className="relative w-full max-w-[400px] sm:max-w-[300px] md:max-w-[360px] lg:max-w-[430px] mx-auto">
      <Esp32DevkitCV4 className="w-full h-auto" />

      {PINS.map(pin => (
        <button
          key={pin.id}
          onClick={() => handleClick(pin)}
          className={`absolute w-6 h-6 rounded-md text-[10px] font-semibold z-10 border-2
            flex items-center justify-center shadow
            ${
              pinSeleccionado === pin.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white/80 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-blue-200 dark:hover:bg-blue-600'
            }`}
          style={{ top: pin.top, left: pin.left, transform: 'translate(-50%, -50%)' }}
          title={`Pin ${pin.label}`}
        >
          {pin.label}
        </button>
      ))}

      {sensores.map(sensor => {
        const pin = PINS.find(p => p.id === sensor.pin);
        if (!pin) return null;
        return (
          <div
            key={sensor.pin}
            className="absolute text-[10px] bg-yellow-200 dark:bg-yellow-700 px-1 py-0.5 rounded shadow z-20 text-gray-900 dark:text-white"
            style={{
              top: `calc(${pin.top} - 3%)`,
              left: `calc(${pin.left} + 5%)`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {sensor.nombre || 'Sensor'}
          </div>
        );
      })}
    </div>
  );
}
