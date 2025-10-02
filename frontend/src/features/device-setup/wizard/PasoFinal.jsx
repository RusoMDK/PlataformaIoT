import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axiosInstance from "@/api/axiosInstance";
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Button from "@/components/ui/Button";
import { getCsrfToken } from '@/api/auth.api'; // ⬅️ Importar CSRF

export default function PasoFinal({ formData }) {
  const navigate = useNavigate();
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [dispositivoExistente, setDispositivoExistente] = useState(null);

  const getNombreSeguro = () => {
    if (formData?.dispositivo?.nombre) return formData.dispositivo.nombre;
    if (formData?.placa) return `Dispositivo ${formData.placa.toUpperCase()}`;
    return 'Dispositivo IoT';
  };

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

  const registrar = async (forzar = false) => {
    setGuardando(true);
    setError('');

    try {
      const csrfToken = await getCsrfToken(); // ⬅️ Pedimos el token CSRF

      const res = await axiosInstance.post('/dispositivos', payload, {
        headers: { 'X-CSRF-Token': csrfToken }, // ⬅️ Enviamos CSRF
      });

      if (res?.data?.msg === 'Dispositivo ya registrado' && !forzar) {
        setDispositivoExistente(res.data?.dispositivo || {});
        setMostrarConfirmacion(true);
        return;
      }

      await axiosInstance.patch(`/dispositivos/${formData.uid}/configurado`, null, {
        headers: { 'X-CSRF-Token': csrfToken }, // ⬅️ También para el PATCH
      });

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

  const confirmarRemplazo = () => {
    setMostrarConfirmacion(false);
    registrar(true);
  };

  return (
    <motion.div
      key="final"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="text-center space-y-6"
    >
      <h2 className="text-2xl font-bold">🎉 ¡Todo listo!</h2>
      <p className="text-sm text-light-muted dark:text-dark-muted">
        Tu dispositivo ha sido registrado correctamente. ¿Qué deseas hacer ahora?
      </p>

      {guardando && (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-primary">Guardando dispositivo…</p>
        </div>
      )}

      {mostrarConfirmacion && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 rounded-lg p-5 shadow max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-yellow-600 w-6 h-6" />
            <span className="font-semibold text-yellow-700 dark:text-yellow-300">
              Este dispositivo ya está registrado
            </span>
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-200 mb-4">
            UID: <strong>{formData.uid}</strong>
            <br />
            ¿Deseas reemplazarlo con la nueva configuración?
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={confirmarRemplazo}>Reemplazar</Button>
            <Button variant="outline" onClick={() => navigate('/proyectos')}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {ok && (
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-5 shadow max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="text-green-600 w-6 h-6" />
            <span className="font-semibold text-green-700 dark:text-green-300">
              ¡Dispositivo registrado!
            </span>
          </div>

          <div className="text-left text-sm space-y-1 text-light-text dark:text-dark-text">
            <p>
              <strong>Nombre:</strong> {getNombreSeguro()}
            </p>
            <p>
              <strong>Chip:</strong> {formData?.dispositivo?.chip}
            </p>
            <p>
              <strong>Fabricante:</strong> {formData?.dispositivo?.fabricante}
            </p>
            <p>
              <strong>UID:</strong> {formData?.uid}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-5">
            <Button onClick={() => navigate('/proyectos/nuevo')}>🚀 Crear Thing</Button>
            <Button onClick={() => navigate(`/configurar-dispositivo/${formData.uid}`)}>
              🔧 Configurar sensores
            </Button>
            <Button variant="outline" onClick={() => navigate('/proyectos')}>
              🏠 Ir al panel
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>}

      {!ok && !guardando && !mostrarConfirmacion && (
        <Button onClick={() => registrar(false)} className="mt-4">
          Reintentar
        </Button>
      )}
    </motion.div>
  );
}
