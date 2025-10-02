// src/features/device-setup/wizard/PasoVerificarConexion.jsx
import { motion } from 'framer-motion';
import { forwardRef, useImperativeHandle, useState, useContext } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { WizardContext } from "@/context/WizardContext";

const AGENT_URL = import.meta.env.VITE_AGENT_URL || 'http://localhost:3001';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://localhost:4443';

export default forwardRef(function PasoVerificarConexion({ formData }, ref) {
  const [status, setStatus] = useState('idle'); // idle | checking | success | fail
  const [message, setMessage] = useState('');
  const { modo } = useContext(WizardContext);

  useImperativeHandle(ref, () => ({
    ejecutarPaso: () =>
      new Promise(async resolve => {
        const uid = formData.uid || formData?.dispositivo?.uid;
        if (!uid) {
          toast.error('❌ UID inválido, retrocede y selecciona tu placa de nuevo.');
          return resolve(false);
        }

        const isManual = modo === 'manual';
        const url = isManual
          ? `${BACKEND_URL}/api/dispositivos/verificar/${uid}`
          : `${AGENT_URL}/api/configuracion/verificar-conexion/${uid}`;

        setStatus('checking');
        setMessage('🔄 Comprobando conexión…');

        try {
          let attempts = 0;
          let conectado = false;

          while (attempts < 5 && !conectado) {
            const res = await fetch(url);
            const body = await res.json();

            if (body.conectado) {
              conectado = true;
              break;
            }

            attempts++;
            setMessage(`⏳ Intento ${attempts} de 5…`);
            await new Promise(r => setTimeout(r, 2000));
          }

          if (conectado) {
            setStatus('success');
            setMessage('✅ ¡Tu placa está en la red!');
            toast.success('✅ Conexión confirmada');
            resolve(true);
          } else {
            setStatus('fail');
            setMessage('❌ No encontramos tu placa en la red.');
            toast.error('❌ Verificación fallida');
            resolve(false);
          }
        } catch (err) {
          console.error('[Front] Error durante fetch:', err);
          setStatus('fail');
          setMessage('❌ Error al verificar conexión.');
          toast.error('❌ Error de red');
          resolve(false);
        }
      }),
  }));

  const renderIcon = () => {
    if (status === 'success') return <Wifi size={48} className="text-green-500" />;
    if (status === 'fail') return <WifiOff size={48} className="text-red-500" />;
    return <Wifi size={48} className="text-primary" />;
  };

  return (
    <motion.div
      key="paso-verificar-wifi"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 text-center"
    >
      {renderIcon()}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        {status === 'idle'
          ? 'Verifiquemos tu conexión'
          : status === 'checking'
          ? 'Comprobando…'
          : status === 'success'
          ? '¡Conexión exitosa!'
          : 'Algo no fue bien'}
      </h2>

      {status !== 'fail' ? (
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      ) : (
        <div className="space-y-3 text-gray-700 dark:text-gray-300">
          <p>{message}</p>
          <p className="font-medium">¿Qué puedes revisar?</p>
          <ul className="list-disc list-inside text-left ml-4">
            <li>Asegúrate de que la placa esté encendida y flasheada.</li>
            <li>Confirma que los datos Wi‑Fi fueron bien configurados.</li>
            <li>
              Verifica que tu red sea de <strong>2.4 GHz</strong>.
            </li>
            <li>Abre el Monitor Serial para ver errores si los hay.</li>
          </ul>
        </div>
      )}

      {status !== 'success' && (
        <button
          disabled={status === 'checking'}
          onClick={() => ref.current.ejecutarPaso()}
          className={`
            mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-full text-white transition
            ${
              status === 'checking'
                ? 'bg-gray-300 cursor-not-allowed'
                : status === 'fail'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-primary hover:bg-primaryHover'
            }
          `}
        >
          {status === 'checking' ? (
            'Comprobando…'
          ) : status === 'fail' ? (
            <>
              <RefreshCw size={16} /> Reintentar
            </>
          ) : (
            'Verificar ahora'
          )}
        </button>
      )}
    </motion.div>
  );
});
