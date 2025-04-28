import { motion } from 'framer-motion';
import { useState, useImperativeHandle, forwardRef } from 'react';
import { toast } from 'sonner';
import api from '../../utils/axios';
import { getCsrfToken } from '../../api/auth.api'; // ⬅️ Añadimos para pedir CSRF token

const PasoConfigurarWiFi = forwardRef(({ formData, setFormData }, ref) => {
  const [enviando, setEnviando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [error, setError] = useState('');

  useImperativeHandle(ref, () => ({
    async ejecutarPaso() {
      setError('');
      const ssid = formData.ssid?.trim();
      const password = formData.password?.trim();
      const dispositivo = formData.dispositivo || {};
      const puerto = dispositivo.path || dispositivo.puerto;

      if (!puerto || !ssid || !password) {
        const msg = 'Faltan datos requeridos. Verifica SSID, contraseña y conexión USB.';
        setError(msg);
        toast.error(msg);
        return false;
      }

      setEnviando(true);

      try {
        const csrfToken = await getCsrfToken(); // ⬅️ Pedimos el token CSRF

        const { data } = await api.post(
          '/configuracion/configurar-wifi',
          {
            ssid,
            password,
            puerto,
            uid: formData.uid || undefined,
            nombre: dispositivo.nombre,
            fabricante: dispositivo.fabricante,
            chip: dispositivo.chip,
            vendorId: dispositivo.vendorId,
            productId: dispositivo.productId,
            imagen: dispositivo.imagen,
          },
          {
            baseURL: 'http://localhost:3001',
            headers: { 'X-CSRF-Token': csrfToken }, // ⬅️ Lo enviamos en la cabecera
          }
        );

        if (!data.ok) {
          const msg = 'La placa no respondió correctamente.';
          setError(msg);
          toast.error(msg);
          return false;
        }

        setFormData(prev => ({ ...prev, uid: data.uid }));
        toast.success('✅ Configuración Wi‑Fi enviada');

        // Verificación inmediata
        setVerificando(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const respuesta = await api.get('/configuracion/verificar-conexion', {
          baseURL: 'http://localhost:3001',
          params: { uid: data.uid },
        });

        if (!respuesta.data.conectado) {
          const msg = 'No se pudo verificar la conexión Wi‑Fi.';
          setError(msg);
          toast.error(msg);
          return false;
        }

        toast.success('📡 Conexión verificada');
        return true;
      } catch (err) {
        console.error('❌ Error al configurar WiFi:', err);
        let msg = 'No se pudo enviar la configuración.';
        if (err.response?.status === 423) {
          msg = 'El puerto está ocupado. Cierra el IDE de Arduino u otra app.';
        } else if (err.response?.status === 500) {
          msg = 'Error al abrir el puerto. Verifica que el dispositivo esté conectado.';
        } else if (err.message.includes('Network Error')) {
          msg = 'No se pudo contactar al agente. Verifica que esté ejecutándose.';
        } else if (err.response?.status === 404) {
          msg = 'La ruta /configuracion/configurar-wifi no se encontró. Revisa el backend.';
        }
        setError(msg);
        toast.error(msg);
        return false;
      } finally {
        setEnviando(false);
        setVerificando(false);
      }
    },
  }));

  return (
    <motion.div
      key="paso-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 text-light-text dark:text-dark-text"
    >
      <div>
        <h2 className="text-2xl font-bold">3. Configura la red WiFi</h2>
        <p className="text-sm text-light-muted dark:text-dark-muted">
          Ingresa las credenciales de la red WiFi. Estas se enviarán al dispositivo conectado al
          continuar.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-light-text dark:text-white">
            Nombre de red (SSID)
          </label>
          <input
            type="text"
            value={formData.ssid || ''}
            onChange={e => setFormData({ ...formData, ssid: e.target.value })}
            className="w-full rounded-md px-3 py-2 border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition"
            placeholder="MiRedWiFi"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-light-text dark:text-white">
            Contraseña
          </label>
          <input
            type="password"
            value={formData.password || ''}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            className="w-full rounded-md px-3 py-2 border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition"
            placeholder="********"
          />
        </div>
        {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
        {verificando && (
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 animate-pulse">
            📡 Verificando conexión Wi‑Fi...
          </p>
        )}
      </div>
    </motion.div>
  );
});

export default PasoConfigurarWiFi;
