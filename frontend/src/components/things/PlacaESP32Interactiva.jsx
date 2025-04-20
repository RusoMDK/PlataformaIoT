// src/components/things/PlacaESP32Interactiva.jsx
import { useState } from 'react';
import esp32Img from '../../assets/placas/esp32.png'; // ruta hacia tu imagen generada

const PINS = [
  { id: 'D2', label: 'D2', top: '20%', left: '5%' },
  { id: 'D4', label: 'D4', top: '30%', left: '5%' },
  { id: 'D5', label: 'D5', top: '40%', left: '5%' },
  { id: 'A0', label: 'A0', top: '20%', left: '90%' },
  { id: 'A2', label: 'A2', top: '30%', left: '90%' },
  { id: 'GND', label: 'GND', top: '40%', left: '90%' },
  // 🔁 Puedes seguir agregando todos los pines reales de la ESP32 aquí
];

export default function PlacaESP32Interactiva({ onSelectPin }) {
  const [pinSeleccionado, setPinSeleccionado] = useState(null);

  const handleClick = pin => {
    setPinSeleccionado(pin.id);
    onSelectPin(pin.id);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <img src={esp32Img} alt="ESP32" className="w-full" />

      {PINS.map(pin => (
        <button
          key={pin.id}
          className={`
            absolute w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold
            ${
              pinSeleccionado === pin.id
                ? 'bg-primary text-white'
                : 'bg-white/80 hover:bg-blue-200 dark:bg-dark-muted/70 dark:hover:bg-blue-600'
            }
          `}
          style={{ top: pin.top, left: pin.left, transform: 'translate(-50%, -50%)' }}
          onClick={() => handleClick(pin)}
          title={`Pin ${pin.label}`}
        >
          {pin.label}
        </button>
      ))}
    </div>
  );
}
