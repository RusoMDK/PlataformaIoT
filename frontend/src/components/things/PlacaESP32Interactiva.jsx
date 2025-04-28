import { useParams } from 'react-router-dom';
import Esp32DevkitCV4 from './svg/Esp32DevkitCV4';
import { useDispositivo } from '../../hooks/useDispositivo'; // ✅ CORRECTO

const PINS = [
  // 📍 Lado izquierdo
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

  // 📍 Lado derecho
  { id: 'GND2', label: 'GND', top: '13.6%', left: '96%' },
  { id: '23', label: '23', top: '18%', left: '96%' },
  { id: '22', label: '22', top: '22.5%', left: '96%' },
  { id: 'TX', label: 'TX', top: '27%', left: '96%' },
  { id: 'RX', label: 'RX', top: '31.6%', left: '96%' },
  { id: '21', label: '21', top: '35.9%', left: '96%' },
  { id: 'GND', label: 'GND', top: '40.5%', left: '96%' },
  { id: '19', label: '19', top: '45%', left: '96%' },
  { id: '18', label: '18', top: '49.5%', left: '96%' },
  { id: '5', label: '5', top: '54%', left: '96%' },
  { id: '17', label: '17', top: '58.5%', left: '96%' },
  { id: '16', label: '16', top: '63%', left: '96%' },
  { id: '4', label: '4', top: '67.5%', left: '96%' },
  { id: '0', label: '0', top: '71.8%', left: '96%' },
  { id: '2', label: '2', top: '76.3%', left: '96%' },
  { id: '15', label: '15', top: '80.7%', left: '96%' },
  { id: 'D1', label: 'D1', top: '85.2%', left: '96%' },
  { id: 'DO', label: 'DO', top: '89.5%', left: '96%' },
  { id: 'CLK', label: 'CLK', top: '94%', left: '96%' },
];

export default function PlacaESP32Interactiva({
  onSelectPin,
  sensores = [],
  pinSeleccionado,
  sensorSeleccionado,
  validarCompatibilidadPin,
}) {
  const { id: uid } = useParams();
  const { dispositivo } = useDispositivo(uid); // 🔥 datos reales del backend

  const handleClick = pin => {
    const nuevo = pinSeleccionado === pin.id ? null : pin.id;
    onSelectPin(nuevo);
  };

  const isAlimentacion = id => ['GND', 'GND1', 'GND2', '3V3', '5V'].includes(id);

  return (
    <div className="w-full flex flex-col lg:flex-row items-start justify-center gap-6 lg:gap-10">
      {/* 🧩 Columna visual con título y placa */}
      <div className="flex flex-col items-center w-full">
        <div className="text-center text-base font-semibold text-gray-800 dark:text-white mt-6 mb-2">
          {dispositivo?.nombre || 'Cargando...'}
        </div>

        <div className="relative w-full aspect-[3/5]">
          <Esp32DevkitCV4 className="w-full h-auto" />

          {PINS.map(pin => {
            const isSelected = pinSeleccionado === pin.id;
            const isCompatible = sensorSeleccionado
              ? validarCompatibilidadPin(pin.id, sensorSeleccionado)
              : true;

            const sensorAsignado = sensores.find(s => s.pin === pin.id);
            const customColor = sensorAsignado?.color;

            const bgColor = customColor
              ? `${customColor} border-white`
              : isSelected
              ? isCompatible
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-red-500 text-white border-red-500'
              : !isCompatible && !isAlimentacion(pin.id)
              ? 'bg-red-500/80 text-white border-red-500'
              : 'bg-white/80 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-blue-200 dark:hover:bg-blue-600';

            return (
              <button
                key={pin.id}
                onClick={() => handleClick(pin)}
                className={`absolute w-5 h-5 rounded-md text-[9px] font-semibold z-10 border-2 flex items-center justify-center shadow transition-all duration-150 ${
                  customColor ? '' : bgColor
                }`}
                style={{
                  top: pin.top,
                  left: pin.left,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: customColor || undefined,
                  color: customColor ? '#fff' : undefined,
                }}
                title={`Pin ${pin.label}`}
              >
                {pin.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🧾 Leyenda a la derecha */}
      <div className="w-full max-w-md px-4 mt-10">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-1">Leyenda de Pines</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Esta guía te ayuda a identificar los tipos de pines disponibles en la placa ESP32.
        </p>
        <ul className="text-sm space-y-2">
          <li className="flex gap-2 items-start">
            <span className="text-lg">🔋</span>
            <div>
              <strong className="text-gray-700 dark:text-white">3V3 / 5V:</strong>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Pines de salida de voltaje para alimentar sensores o periféricos (3.3V o 5V).
              </p>
            </div>
          </li>
          <li className="flex gap-2 items-start">
            <span className="text-lg">⚫</span>
            <div>
              <strong className="text-gray-700 dark:text-white">GND:</strong>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Pines de tierra (negativo) esenciales para el circuito eléctrico.
              </p>
            </div>
          </li>
          <li className="flex gap-2 items-start">
            <span className="text-lg">📏</span>
            <div>
              <strong className="text-gray-700 dark:text-white">VP / VN / ADC:</strong>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Pines de entrada analógica, permiten leer voltajes variables.
              </p>
            </div>
          </li>
          <li className="flex gap-2 items-start">
            <span className="text-lg">🔁</span>
            <div>
              <strong className="text-gray-700 dark:text-white">RX / TX:</strong>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Pines de comunicación serial (UART), útiles para conectar módulos como GPS o
                Bluetooth.
              </p>
            </div>
          </li>
          <li className="flex gap-2 items-start">
            <span className="text-lg">🔄</span>
            <div>
              <strong className="text-gray-700 dark:text-white">EN:</strong>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Pin de enable/reset, reinicia la placa cuando se activa.
              </p>
            </div>
          </li>
          <li className="flex gap-2 items-start">
            <span className="text-lg">⚙️</span>
            <div>
              <strong className="text-gray-700 dark:text-white">GPIO (0–39):</strong>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Pines digitales de propósito general. Puedes usarlos como entradas o salidas.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
