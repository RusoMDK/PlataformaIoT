// src/features/device-setup/wizard/PasoConexionDispositivo.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PasoConexionDispositivo({
  formData,
  setFormData,
  onDetectadoYaRegistrado,
  triggerAlertaManual,
}) {
  const [dispositivo, setDispositivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invalido, setInvalido] = useState(false);
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false);
  const [mostradoToast, setMostradoToast] = useState(false);

  const detectarTipoDesdeNombre = (nombre = '') => {
    const lower = nombre.toLowerCase();
    if (lower.includes('esp32') || lower.includes('esp8266')) return 'esp32';
    if (lower.includes('mega')) return 'mega';
    if (lower.includes('uno')) return 'uno';
    return 'otro';
  };

  const verificarSiRegistrado = async (uid, completo, tipoDetectado) => {
    const token = localStorage.getItem('token');
    if (!token || !uid) return;

    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/dispositivos/${uid.toLowerCase()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data?.uid?.toLowerCase() === uid.toLowerCase()) {
        if (!mostradoToast) {
          toast.warning('⚠️ ¡Ya habías registrado esta placa antes!');
          setMostradoToast(true);
        }
        setFormData(prev => ({
          ...prev,
          dispositivo: { ...completo, _id: data._id },
          placa: prev.placa || tipoDetectado,
          uid: uid.toLowerCase(),
        }));
        onDetectadoYaRegistrado?.(true);
      } else {
        onDetectadoYaRegistrado?.(false);
      }
    } catch (err) {
      onDetectadoYaRegistrado?.(false);
      if (err.response?.status !== 404) {
        console.error('❌ Error verificando registro:', err.message);
      }
    }
  };

  const fetchDispositivo = async () => {
    try {
      const res = await axios.get('http://localhost:3001/dispositivo-conectado');
      const disp = res.data;
      const tipoDetectado = detectarTipoDesdeNombre(disp.nombre || '');
      const coincide = formData.placa === tipoDetectado;

      const completo = { ...disp, tipo: tipoDetectado };
      setInvalido(!coincide);
      setDispositivo(completo);
      setFormData(prev => ({
        ...prev,
        dispositivo: completo,
        placa: prev.placa || tipoDetectado,
        uid: disp.uid.toLowerCase(),
      }));
      await verificarSiRegistrado(disp.uid, completo, tipoDetectado);
    } catch (error) {
      console.error('❌ No pudimos leer tu placa:', error.message);
      setDispositivo(null);
      setInvalido(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispositivo();
    const interval = setInterval(fetchDispositivo, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMostrarAdvertencia(triggerAlertaManual && formData.dispositivo?._id && !invalido);
  }, [triggerAlertaManual, invalido, formData.dispositivo]);

  return (
    <motion.div
      key="paso-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header más amigable */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">¡Enchufa tu placa!</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
          Conecta tu placa al USB y déjala que hable con nuestro Agente. Nosotros nos encargamos del
          resto.
        </p>
      </div>

      {/* Mini‑tutorial */}
      <div className="max-w-md mx-auto text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <p className="font-medium">¿Por qué esto es importante?</p>
        <ul className="list-disc list-inside">
          <li>Detectaremos tu placa al instante.</li>
          <li>Podrás continuar sin configuraciones manuales extra.</li>
        </ul>
      </div>

      {/* Estado de detección */}
      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400 animate-pulse">
          🔄 Buscando tu placa...
        </p>
      ) : dispositivo ? (
        <>
          <div
            className={`mx-auto max-w-md border-2 rounded-xl p-6 shadow-md transition-colors
              ${
                invalido
                  ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                  : 'border-primary bg-primary/10 dark:bg-primary/20'
              }`}
          >
            <img
              src={`/images/conexion/${dispositivo.imagen}`}
              alt={dispositivo.nombre}
              className="w-24 h-24 mx-auto mb-4 object-contain"
            />
            <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
              {dispositivo.nombre}
            </h3>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 text-center">
              <p>
                <strong>Puerto:</strong> {dispositivo.path}
              </p>
              <p>
                <strong>Chip:</strong> {dispositivo.chip}
              </p>
              <p>
                <strong>VID:</strong> {dispositivo.vendorId}
              </p>
              <p>
                <strong>PID:</strong> {dispositivo.productId}
              </p>
            </div>
            {invalido && (
              <p className="mt-4 text-red-600 dark:text-red-400 font-medium">
                ⚠️ Ups, esta placa no coincide con la que elegiste.
              </p>
            )}
          </div>

          {mostrarAdvertencia && !invalido && (
            <div className="mx-auto max-w-md mt-6 p-4 flex items-center gap-2 rounded-lg bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700">
              <AlertCircle className="text-yellow-600 dark:text-yellow-200" size={20} />
              <p className="text-sm text-yellow-800 dark:text-yellow-100">
                ⚠️ ¡Esta placa ya está registrada! Continuar sobreescribirá su anterior
                configuración.
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-red-500 dark:text-red-400 font-medium">
          ❌ No encontramos ninguna placa. ¿Está bien conectada?
        </p>
      )}
    </motion.div>
  );
}
