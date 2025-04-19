import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function PasoConectarDispositivo({ onNext, onBack, formData, setFormData }) {
  const [dispositivo, setDispositivo] = useState(null);
  const [loading, setLoading] = useState(true);

  const detectarTipoPorNombre = (nombre = '') => {
    const lower = nombre.toLowerCase();
    if (lower.includes('esp32')) return 'esp32';
    if (lower.includes('esp8266')) return 'esp8266';
    return 'otro';
  };

  const fetchDispositivo = async () => {
    try {
      const res = await axios.get('http://localhost:3001/dispositivo-conectado');
      const disp = res.data;
      const tipo = detectarTipoPorNombre(disp.manufacturer || disp.chip);
      const imagen = disp.imagen?.includes('.')
        ? `/images/conexion/${disp.imagen}`
        : `/images/conexion/${tipo}.png`;

      const completo = { ...disp, imagen, tipo };
      setDispositivo(completo);

      if (!formData.placa) {
        setFormData({ ...formData, dispositivo: completo, placa: tipo });
      } else {
        setFormData({ ...formData, dispositivo: completo });
      }
    } catch (error) {
      setDispositivo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispositivo();
    const interval = setInterval(fetchDispositivo, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key="paso-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-2xl mx-auto bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md transition-colors"
    >
      <div>
        <h2 className="text-2xl font-bold text-light-text dark:text-white">
          2. Conecta tu dispositivo
        </h2>
        <p className="text-sm text-light-muted dark:text-dark-muted">
          Conecta tu placa al computador. El agente la detectará automáticamente.
        </p>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">🔍 Buscando dispositivo...</p>
      ) : !dispositivo ? (
        <p className="text-center text-red-500 dark:text-red-400">
          ❌ No se detectó ningún dispositivo conectado.
        </p>
      ) : (
        <div
          onClick={() => setFormData({ ...formData, dispositivo })}
          className="cursor-pointer border-2 border-primary/60 hover:border-primary bg-blue-50 dark:bg-dark-muted/30 rounded-xl p-6 transition shadow"
        >
          <img
            src={dispositivo.imagen}
            alt={dispositivo.chip}
            className="w-24 h-24 mx-auto mb-4 object-contain"
          />
          <h3 className="text-xl font-bold text-center text-light-text dark:text-white mb-2">
            {formData.placa === 'esp32'
              ? 'ESP32 (WROOM)'
              : formData.placa === 'esp8266'
              ? 'ESP8266'
              : 'Dispositivo conectado'}
          </h3>
          <div className="text-sm text-light-muted dark:text-dark-muted space-y-1 text-center">
            <p>
              <strong>Fabricante:</strong> {dispositivo.manufacturer || 'Desconocido'}
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
        </div>
      )}

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-5 py-2 rounded-md text-sm font-medium bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition"
        >
          ⬅ Anterior
        </button>
        <button
          onClick={onNext}
          disabled={!dispositivo}
          className="px-5 py-2 rounded-md text-sm font-medium bg-primary hover:bg-primary-hover text-white transition disabled:opacity-50"
        >
          Siguiente ➡
        </button>
      </div>
    </motion.div>
  );
}
