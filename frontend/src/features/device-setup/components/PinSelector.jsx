import placaESP32 from '../../assets/placas/esp32.png'; // Asegúrate de tener la imagen

const PINS = [
  { nombre: 'D2', x: 70, y: 20 },
  { nombre: 'D4', x: 70, y: 60 },
  { nombre: 'D5', x: 70, y: 100 },
  { nombre: 'D12', x: 70, y: 140 },
  { nombre: 'D13', x: 70, y: 180 },
  { nombre: 'A0', x: 220, y: 20 },
  { nombre: 'A1', x: 220, y: 60 },
  { nombre: 'A2', x: 220, y: 100 },
  { nombre: 'A3', x: 220, y: 140 },
];

export default function PinSelector({ value, onSelect, disponibles = [] }) {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Imagen base */}
      <img src={placaESP32} alt="ESP32" className="w-full rounded shadow-md" />

      {/* Pines */}
      {PINS.map(pin => {
        const disponible = disponibles.includes(pin.nombre);
        const isSelected = value === pin.nombre;

        return (
          <button
            key={pin.nombre}
            disabled={!disponible}
            onClick={() => onSelect(pin.nombre)}
            className={`absolute w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center
              border transition-all duration-200
              ${isSelected ? 'bg-blue-500 text-white border-blue-700' : ''}
              ${
                !disponible
                  ? 'opacity-30 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-blue-100'
              }
            `}
            style={{ left: pin.x, top: pin.y }}
            title={pin.nombre}
          >
            {pin.nombre}
          </button>
        );
      })}
    </div>
  );
}
