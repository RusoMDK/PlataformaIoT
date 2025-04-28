import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const PasoConexionDispositivo = ({
  formData,
  setFormData,
  onDetectadoYaRegistrado,
  triggerAlertaManual,
}) => {
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

  const verificarSiRegistrado = async uid => {
    const token = localStorage.getItem('token');
    if (!token || !uid) return;

    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/dispositivos/${uid.toLowerCase()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data?.uid?.toLowerCase() === uid.toLowerCase()) {
        if (!mostradoToast) {
          toast.warning('⚠️ Este dispositivo ya está registrado.');
          setMostradoToast(true);
        }

        setFormData(prev => ({
          ...prev,
          dispositivo: { ...prev.dispositivo, _id: data._id },
        }));

        onDetectadoYaRegistrado?.(true);
      } else {
        onDetectadoYaRegistrado?.(false);
      }
    } catch (err) {
      onDetectadoYaRegistrado?.(false);
      if (err.response?.status !== 404) {
        console.error('❌ Error al verificar dispositivo existente:', err.message);
      }
    }
  };

  const fetchDispositivo = async () => {
    try {
      const res = await axios.get('http://localhost:3001/dispositivo-conectado');
      const disp = res.data;

      const tipoDetectado = detectarTipoDesdeNombre(disp.nombre || '');
      const coincide = formData.placa === tipoDetectado;

      const completo = {
        ...disp,
        tipo: tipoDetectado,
      };

      setInvalido(!coincide);
      setDispositivo(completo);

      setFormData(prev => ({
        ...prev,
        dispositivo: completo,
        placa: prev.placa || tipoDetectado,
        uid: disp.uid.toLowerCase(),
      }));

      await verificarSiRegistrado(disp.uid);
    } catch (error) {
      console.error('❌ Error al obtener el dispositivo:', error.message);
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
    if (triggerAlertaManual && formData?.dispositivo?._id && !invalido) {
      setMostrarAdvertencia(true);
    } else {
      setMostrarAdvertencia(false);
    }
  }, [triggerAlertaManual, invalido]);

  return (
    <motion.div
      key="paso-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-light-text dark:text-white">
          2. Conecta tu dispositivo
        </h2>
        <p className="text-sm text-light-muted dark:text-dark-muted">
          Conecta tu placa al computador. El sistema la detectará automáticamente.
        </p>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400 animate-pulse">
          🔍 Buscando dispositivo conectado...
        </p>
      ) : dispositivo ? (
        <>
          <div
            className={`border-2 rounded-xl p-6 transition shadow max-w-md mx-auto ${
              invalido
                ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                : 'border-primary/50 hover:border-primary bg-blue-50 dark:bg-dark-muted/20'
            }`}
          >
            <img
              src={`/images/conexion/${dispositivo.imagen}`}
              alt={dispositivo.nombre}
              className="w-24 h-24 mx-auto mb-4 object-contain"
            />
            <h3 className="text-xl font-bold text-center text-light-text dark:text-white mb-2">
              {dispositivo.nombre || 'Dispositivo conectado'}
            </h3>
            <div className="text-sm text-light-muted dark:text-dark-muted space-y-1 text-center">
              <p>
                <strong>Fabricante:</strong> {dispositivo.fabricante || 'Desconocido'}
              </p>
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
              <p className="mt-4 text-red-600 dark:text-red-400 font-medium text-sm">
                ⚠️ La placa detectada no coincide con la seleccionada.
              </p>
            )}
          </div>

          {mostrarAdvertencia && !invalido && (
            <div className="mt-6 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 rounded-lg px-4 py-3 max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-yellow-600" size={20} />
                <p className="text-sm text-yellow-800 dark:text-yellow-100">
                  ⚠️ Este dispositivo ya está registrado. Si continúas, se sobreescribirá su
                  configuración anterior.
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-red-500 dark:text-red-400 font-medium">
          ❌ No se detectó ningún dispositivo. Verifica la conexión USB.
        </p>
      )}
    </motion.div>
  );
};

export default PasoConexionDispositivo;
