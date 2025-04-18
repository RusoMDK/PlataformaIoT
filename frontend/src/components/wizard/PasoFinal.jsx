// src/components/wizard/PasoFinal.jsx
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../utils/axios';
import { Loader2, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';

export default function PasoFinal({ formData }) {
  const navigate = useNavigate();
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');

  const getNombreSeguro = () => {
    if (formData?.dispositivo?.nombre) return formData.dispositivo.nombre;
    if (formData?.placa) return `Dispositivo ${formData.placa.toUpperCase()}`;
    return 'Dispositivo IoT';
  };

  const registrar = async () => {
    setGuardando(true);
    setError('');

    try {
      const payload = {
        uid: formData.uid,
        nombre: getNombreSeguro(),
        fabricante: formData?.dispositivo?.fabricante || 'Desconocido',
        path: formData?.dispositivo?.puerto || formData?.dispositivo?.path,
        chip: formData?.dispositivo?.chip,
        vendorId: formData?.dispositivo?.vendorId,
        productId: formData?.dispositivo?.productId,
        imagen: formData?.dispositivo?.imagen,
      };

      console.log('📦 Payload:', payload);

      await api.post('/dispositivos', payload);
      await api.patch(`/dispositivos/${formData.uid}/configurado`);

      toast.success('✅ Dispositivo registrado correctamente');
      setOk(true);
    } catch (err) {
      console.error('❌ Error al registrar:', err);
      const msg = err.response?.data?.msg || 'No se pudo registrar el dispositivo.';
      toast.error(msg);
      setError(msg);
    } finally {
      setGuardando(false);
    }
  };

  useEffect(() => {
    registrar();
  }, []);

  return (
    <motion.div
      key="final"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="text-center space-y-6"
    >
      <h2 className="text-2xl font-bold">🎉 Finalización del asistente</h2>
      <p className="text-sm text-gray-600">
        Estamos registrando tu nuevo dispositivo en la plataforma…
      </p>

      {guardando && (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-primary">Guardando dispositivo…</p>
        </div>
      )}

      {ok && (
        <div className="bg-green-50 dark:bg-green-900 border border-green-400 dark:border-green-700 rounded-lg p-5 shadow max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-600 w-6 h-6" />
            <span className="font-semibold text-green-700 dark:text-green-300">
              ¡Dispositivo registrado!
            </span>
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-200 mb-4">
            Ahora puedes crear un proyecto (Thing) o volver al panel.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => navigate('/proyectos/nuevo')}>Crear Thing</Button>
            <Button variant="outline" onClick={() => navigate('/proyectos')}>
              Ir al panel
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!ok && !guardando && (
        <Button onClick={registrar} className="mt-4">
          Reintentar
        </Button>
      )}
    </motion.div>
  );
}
