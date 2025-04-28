import { useState, useRef, useEffect } from 'react'; // 👈 Agregamos useEffect
import { AnimatePresence, motion } from 'framer-motion';
import PasoSeleccionPlaca from './PasoSeleccionPlaca';
import PasoConexionDispositivo from './PasoConexionDispositivo';
import PasoConfigurarWiFi from './PasoConfigurarWiFi';
import PasoSubirCodigo from './PasoSubirCodigo';
import PasoInstalarESP32 from './PasoInstalarESP32';
import PasoVerificarConexion from './PasoVerificarConexion';
import PasoFinal from './PasoFinal';
import Navbar from '../shared/Navbar';
import axios from 'axios'; // 👈 Importamos axios para pedir CSRF

const placasConWiFi = [
  'esp32',
  'esp8266',
  'uno_wifi_rev2',
  'uno_wifi_rev4',
  'nano_33_iot',
  'nano_esp32',
  'giga_r1',
  'mkr_wifi_1010',
  'nano_rp2040',
];

const placaTieneWiFi = (placa = '') => {
  const id = placa.toLowerCase().replace(/\s/g, '_');
  return placasConWiFi.includes(id);
};

export default function Wizard() {
  const [pasoActual, setPasoActual] = useState(0);
  const [formData, setFormData] = useState({
    placa: '',
    dispositivo: null,
    ssid: '',
    password: '',
    nombre: '',
    descripcion: '',
    sensores: [],
    uid: '',
  });
  const [mostrarAlertaRegistro, setMostrarAlertaRegistro] = useState(false);
  const [triggerAlertaManual, setTriggerAlertaManual] = useState(false);
  const [csrfToken, setCsrfToken] = useState(''); // 👈 Estado para CSRF token
  const refPaso = useRef();

  // 🚀 Al cargar Wizard, pedir el CSRF token
  useEffect(() => {
    const obtenerCsrfToken = async () => {
      try {
        const { data } = await axios.get('/api/csrf-token');
        setCsrfToken(data.csrfToken);
        localStorage.setItem('csrfToken', data.csrfToken);
      } catch (err) {
        console.error('❌ Error obteniendo CSRF token:', err);
      }
    };

    obtenerCsrfToken();
  }, []);

  const incluirPasoInstalacion = formData.placa === 'esp32' || formData.placa === 'esp8266';
  const incluirPasoWiFi = placaTieneWiFi(formData.placa);

  const pasosBase = [
    { id: 'placa', nombre: 'Selecciona la placa', componente: PasoSeleccionPlaca },
    { id: 'conexion', nombre: 'Conecta el dispositivo', componente: PasoConexionDispositivo },
    ...(incluirPasoInstalacion
      ? [
          { id: 'esp32', nombre: 'Instala soporte ESP', componente: PasoInstalarESP32 },
          { id: 'codigo', nombre: 'Sube el código', componente: PasoSubirCodigo },
        ]
      : []),
    ...(incluirPasoWiFi
      ? [
          { id: 'wifi', nombre: 'Configura la red WiFi', componente: PasoConfigurarWiFi },
          { id: 'verificar', nombre: 'Verifica la conexión', componente: PasoVerificarConexion },
        ]
      : []),
    { id: 'final', nombre: 'Finalizando', componente: PasoFinal },
  ];

  const pasoDefinido = pasosBase[pasoActual];
  const PasoActualComponente = pasoDefinido?.componente;
  const idPasoActual = pasoDefinido?.id || 'error';
  const totalPasos = pasosBase.length;
  const porcentaje = ((pasoActual + 1) / totalPasos) * 100;

  const esPasoWiFi = idPasoActual === 'wifi';
  const esPasoVerificar = idPasoActual === 'verificar';
  const esPasoConexion = idPasoActual === 'conexion';

  const tipoDetectado = formData.dispositivo?.tipo || '';
  const tipoEsperado = formData.placa || '';
  const errorDeCoincidencia =
    esPasoConexion && tipoEsperado && tipoDetectado && tipoDetectado !== tipoEsperado;

  const yaRegistrado = formData?.dispositivo && formData?.dispositivo?._id;

  const siguiente = async () => {
    if ((esPasoWiFi || esPasoVerificar) && refPaso.current?.ejecutarPaso) {
      const exito = await refPaso.current.ejecutarPaso();
      if (!exito) return;
    }

    if (esPasoConexion && yaRegistrado && !errorDeCoincidencia && !triggerAlertaManual) {
      setMostrarAlertaRegistro(true);
      setTriggerAlertaManual(true);
      return;
    }

    if (pasoActual < totalPasos - 1) {
      setPasoActual(prev => prev + 1);
      setTriggerAlertaManual(false);
    }
  };

  const anterior = () => {
    if (pasoActual === 0) {
      window.history.back();
    } else {
      setPasoActual(prev => prev - 1);
      setTriggerAlertaManual(false);
    }
  };

  return (
    <div className="flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300 min-h-screen">
      <Navbar />

      <main className="flex flex-col items-center justify-center px-4 py-8 w-full">
        <div className="w-full max-w-2xl flex flex-col bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-light-border dark:border-dark-border">
            <div className="mb-2 text-sm font-medium text-light-muted dark:text-dark-muted">
              Paso {pasoActual + 1} de {totalPasos}
            </div>
            <div className="text-xl font-bold text-light-text dark:text-dark-text">
              {pasoDefinido?.nombre || 'Paso desconocido'}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>

          <div className="relative px-6 py-8 min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={idPasoActual}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {PasoActualComponente ? (
                  <PasoActualComponente
                    formData={formData}
                    setFormData={setFormData}
                    onNext={siguiente}
                    onBack={anterior}
                    onDetectadoYaRegistrado={setMostrarAlertaRegistro}
                    triggerAlertaManual={triggerAlertaManual}
                    ref={esPasoWiFi || esPasoVerificar ? refPaso : null}
                    csrfToken={csrfToken} // 👈 Ahora los pasos tienen disponible el token
                  />
                ) : (
                  <div className="text-center text-red-600 dark:text-red-400 font-medium">
                    ❌ Paso no definido. Verifica la configuración del asistente.
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="px-6 pb-6 pt-4 border-t border-light-border dark:border-dark-border">
            <div className="flex justify-between items-center">
              <button
                onClick={
                  mostrarAlertaRegistro && triggerAlertaManual && esPasoConexion
                    ? () => {
                        setMostrarAlertaRegistro(false);
                        anterior();
                      }
                    : anterior
                }
                className="px-4 py-2 text-sm rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                ⬅{' '}
                {mostrarAlertaRegistro && triggerAlertaManual && esPasoConexion
                  ? 'Cambiar placa'
                  : pasoActual === 0
                  ? 'Volver'
                  : 'Atrás'}
              </button>

              <button
                onClick={
                  mostrarAlertaRegistro && triggerAlertaManual && esPasoConexion
                    ? () => {
                        setMostrarAlertaRegistro(false);
                        setTriggerAlertaManual(false);
                        siguiente();
                      }
                    : siguiente
                }
                disabled={pasoActual === totalPasos - 1 || errorDeCoincidencia}
                className="px-4 py-2 text-sm rounded-md bg-primary hover:bg-primary-hover text-white disabled:opacity-50"
              >
                {mostrarAlertaRegistro && triggerAlertaManual && esPasoConexion
                  ? 'Continuar con este dispositivo'
                  : esPasoWiFi
                  ? 'Enviar configuración ➔'
                  : esPasoVerificar
                  ? 'Verificar ➔'
                  : 'Siguiente ➔'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
