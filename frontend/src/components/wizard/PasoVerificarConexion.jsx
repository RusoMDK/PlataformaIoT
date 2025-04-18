import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PasoVerificarConexion({ formData, onNext, onBack }) {
  const [estado, setEstado] = useState('verificando'); // verificando | exito | error

  useEffect(() => {
    const verificarConexion = async () => {
      setEstado('verificando');

      const uid = formData?.uid || formData?.dispositivo?.uid || formData?.dispositivo?.UID; // por si algún campo lo devuelve diferente

      if (!uid) {
        console.warn('⚠️ UID del dispositivo no disponible.');
        setEstado('error');
        return;
      }

      console.log('🔎 Verificando conexión con UID:', uid);

      try {
        const res = await axios.get(`http://localhost:3000/api/dispositivos/verificar/${uid}`);

        if (res.data?.conectado) {
          setEstado('exito');
        } else {
          setEstado('error');
        }
      } catch (err) {
        console.error('❌ Error verificando conexión:', err);
        setEstado('error');
      }
    };

    verificarConexion();
  }, [formData]);

  return (
    <motion.div
      key="paso-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 text-center"
    >
      <h2 className="text-xl font-bold text-gray-800 dark:text-darkText">
        5. Verificando conexión
      </h2>
      <p className="text-sm text-gray-600 dark:text-darkMuted">
        Estamos intentando verificar si tu dispositivo está conectado a la red...
      </p>

      <div className="mt-6 flex justify-center">
        {estado === 'verificando' && <Loader2 className="animate-spin w-12 h-12 text-blue-500" />}
        {estado === 'exito' && (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-green-600 font-medium">¡Conexión exitosa!</p>
          </div>
        )}
        {estado === 'error' && (
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 font-medium">No se pudo verificar la conexión.</p>
            <p className="text-sm text-gray-600 dark:text-darkMuted">
              Asegúrate de que tu placa esté encendida, conectada al WiFi, y que el código fue
              cargado correctamente.
            </p>
            <button
              onClick={onBack}
              className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>

      {estado === 'exito' && (
        <div className="text-right">
          <button
            onClick={onNext}
            className="bg-primary hover:bg-primaryHover text-white px-5 py-2 rounded transition"
          >
            Continuar
          </button>
        </div>
      )}
    </motion.div>
  );
}
