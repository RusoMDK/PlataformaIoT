// DeviceConfigLayout.jsx
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Outlet } from 'react-router-dom';
import Navbar from '../widgets/shell/Navbar';
import Footer from '../widgets/shell/Footer';
import PlacaESP32Interactiva from '../features/device-setup/components/PlacaESP32Interactiva';
import SensorListEditor from '../features/device-setup/components/SensorListEditor';
import SensorCatalogPanel from '../features/device-setup/components/SensorCatalogPanel';
import SensorConfigPanel from '../features/device-setup/components/SensorConfigPanel';
import ThingSummary from '../features/device-setup/components/ThingSummary';
import { useDispositivo } from '../hooks/useDispositivo';
import axiosInstance from '../api/axiosInstance';

export default function DeviceConfigLayout() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { dispositivo, loading } = useDispositivo(id);
  const [sensorSeleccionado, setSensorSeleccionado] = useState(null);
  const [sensoresAsignados, setSensoresAsignados] = useState([]);
  const [pinSeleccionado, setPinSeleccionado] = useState(null);
  const [verResumen, setVerResumen] = useState(false);

  useEffect(() => {
    if (dispositivo?.sensores?.length > 0) {
      setSensoresAsignados(dispositivo.sensores);
    }
  }, [dispositivo]);

  const handleGuardarSensor = sensorConfig => {
    const finalPin = sensorConfig.pin || pinSeleccionado;
    if (!finalPin) return;

    const actualizado = {
      ...sensorConfig,
      pin: finalPin,
      id: sensorConfig.id || crypto.randomUUID(), // ✅ asegura ID único
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

  const handleFinalizar = async () => {
    try {
      await axiosInstance.patch(`/dispositivos/${id}/sensores`, {
        sensores: sensoresAsignados,
      });
      navigate('/');
    } catch (error) {
      console.error('❌ Error guardando la configuración:', error);
    }
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
    return tipo.includes('temperatura') || tipo.includes('analogo')
      ? analogicos.includes(pin)
      : digitales.includes(pin);
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">⏳ Cargando dispositivo...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen dark:bg-gray-950">
      <Navbar />
      <header className="sticky top-[64px] z-40 px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-[72px] flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            Configurar dispositivo
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">UID: {id}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setVerResumen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded shadow"
          >
            ➡️ Ver resumen y guardar
          </button>
          <button
            onClick={handleCerrar}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-red-500 hover:text-white text-sm rounded shadow"
          >
            ⬅️ Volver atrás
          </button>
        </div>
      </header>

      <Outlet />

      {!verResumen ? (
        <main className="flex flex-1 overflow-hidden mt-[50px]">
          <section className="flex-none w-[36%] min-w-[320px] border-r border-gray-200 dark:border-gray-800 overflow-auto">
            <div className="w-full h-full p-0 m-0">
              <div className="w-full h-full bg-white dark:bg-gray-900 border dark:border-gray-800 shadow rounded-2xl p-4">
                <PlacaESP32Interactiva
                  onSelectPin={pin => {
                    if (!sensorSeleccionado || validarCompatibilidadPin(pin, sensorSeleccionado)) {
                      setPinSeleccionado(pin);
                    } else {
                      alert('Este sensor no es compatible con el pin seleccionado.');
                    }
                  }}
                  sensores={sensoresAsignados}
                  pinSeleccionado={pinSeleccionado}
                  sensorSeleccionado={sensorSeleccionado}
                  validarCompatibilidadPin={validarCompatibilidadPin}
                />
              </div>
            </div>
          </section>

          <section className="flex-1 min-w-[320px] max-w-[calc(100%-380px)] flex flex-col gap-6 px-6 py-6 overflow-hidden">
            <div className="min-h-[260px]">
              <SensorConfigPanel
                sensor={sensorSeleccionado}
                selectedPin={pinSeleccionado}
                onSave={handleGuardarSensor}
              />
            </div>

            <div className="flex-shrink-0 overflow-hidden">
              <SensorListEditor
                sensores={sensoresAsignados}
                onEdit={setSensorSeleccionado}
                onRemove={index => setSensoresAsignados(prev => prev.filter((_, i) => i !== index))}
              />
            </div>
          </section>

          <aside className="w-[380px] h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <SensorCatalogPanel
                onSelectSensor={sensor => {
                  if (pinSeleccionado && !validarCompatibilidadPin(pinSeleccionado, sensor)) {
                    alert('Este sensor no es compatible con el pin seleccionado.');
                    return;
                  }
                  setSensorSeleccionado({
                    ...sensor,
                    pin: pinSeleccionado || '',
                    id: crypto.randomUUID(), // ⚠️ Generar ID para nuevo sensor
                  });
                }}
              />
            </div>
          </aside>
        </main>
      ) : (
        <main className="flex-1 p-6">
          <ThingSummary sensores={sensoresAsignados} onConfirm={handleFinalizar} />
        </main>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40">
        <Footer />
      </div>
    </div>
  );
}
