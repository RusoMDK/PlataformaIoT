import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import PlacaESP32Interactiva from '../components/things/PlacaESP32Interactiva';
import SensorAutocomplete from '../components/things/SensorAutocomplete';
import SensorListEditor from '../components/things/SensorListEditor';
import SensorConfigPanel from '../components/things/SensorConfigPanel';

export default function DeviceConfigLayout() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [sensorSeleccionado, setSensorSeleccionado] = useState(null);
  const [sensoresAsignados, setSensoresAsignados] = useState([]);
  const [pinSeleccionado, setPinSeleccionado] = useState(null);

  const handleGuardarSensor = sensorConfig => {
    const finalPin = sensorConfig.pin || pinSeleccionado;
    if (!finalPin) return;

    const actualizado = {
      ...sensorConfig,
      pin: finalPin,
    };

    setSensoresAsignados(prev => {
      const existentes = prev.filter(s => s.id !== actualizado.id);
      return [...existentes, actualizado];
    });

    setSensorSeleccionado(null);
    setPinSeleccionado(null);
  };

  const handleCerrar = () => {
    const back = location.state?.from || '/';
    navigate(back);
  };

  const validarCompatibilidadPin = (pin, sensor) => {
    if (!sensor || !sensor.tipo) return true;
    const tipo = sensor.tipo.toLowerCase();
    const analogicos = ['VP', 'VN', '34', '35', '32', '33', '25', '26', '27'];
    const digitales = [
      '0',
      '2',
      '4',
      '5',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '21',
      '22',
      '23',
      'D2',
      'D3',
      'D1',
      'DO',
      'CMD',
      'CLK',
    ];
    if (tipo.includes('temperatura') || tipo.includes('analogo')) {
      return analogicos.includes(pin);
    }
    return digitales.includes(pin);
  };

  return (
    <div className="flex flex-col h-screen dark:bg-gray-950 relative">
      {/* ✕ Botón cerrar */}
      <button
        onClick={handleCerrar}
        className="absolute top-4 right-4 z-50 px-3 py-1.5 bg-gray-200 dark:bg-gray-800 hover:bg-red-500 hover:text-white text-sm rounded shadow"
      >
        ✕ Cerrar
      </button>

      {/* Header */}
      <header className="px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Configurar dispositivo</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">UID: {id}</p>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <section className="flex flex-1 flex-col gap-6 p-6 overflow-auto">
          {/* Placa + Buscador */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="col-span-1 lg:col-span-3 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow border border-gray-200 dark:border-gray-800">
              <PlacaESP32Interactiva
                onPinSelect={pin => {
                  if (!sensorSeleccionado || validarCompatibilidadPin(pin, sensorSeleccionado)) {
                    setPinSeleccionado(pin);
                  } else {
                    alert('Este sensor no es compatible con el pin seleccionado.');
                  }
                }}
                sensores={sensoresAsignados}
              />
            </div>
            <div className="col-span-1 lg:col-span-2">
              <SensorAutocomplete
                onSelect={sensor => {
                  if (pinSeleccionado && !validarCompatibilidadPin(pinSeleccionado, sensor)) {
                    alert('Este sensor no es compatible con el pin seleccionado.');
                    return;
                  }
                  setSensorSeleccionado({ ...sensor, pin: pinSeleccionado || '' });
                }}
              />
            </div>
          </div>

          {/* Lista de sensores */}
          <SensorListEditor
            sensores={sensoresAsignados}
            onEdit={setSensorSeleccionado}
            onRemove={index => {
              setSensoresAsignados(prev => prev.filter((_, i) => i !== index));
            }}
          />
        </section>

        {/* Panel lateral */}
        <aside className="w-[380px] border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          {sensorSeleccionado ? (
            <SensorConfigPanel
              sensor={{ ...sensorSeleccionado, pin: sensorSeleccionado.pin || pinSeleccionado }}
              onClose={() => {
                setSensorSeleccionado(null);
                setPinSeleccionado(null);
              }}
              onSave={handleGuardarSensor}
            />
          ) : (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-10">
              Selecciona un sensor para configurarlo
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
