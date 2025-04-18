import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner'; // 🆕 Toasts
import api from '../../utils/axios'; // 🆕 Axios con interceptores

export default function PasoConfigurarWiFi({ formData, setFormData, onNext, onBack }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const enviarConfiguracion = async () => {
    setEnviando(true);
    setError('');

    const ssid = formData.ssid?.trim();
    const password = formData.password?.trim();
    const puerto = formData.dispositivo?.path || formData.dispositivo?.puerto;

    if (!puerto || !ssid || !password) {
      setError('Faltan datos requeridos. Selecciona un dispositivo.');
      setEnviando(false);
      return;
    }

    try {
      const { data } = await api.post(
        '/configurar-wifi',
        {
          ssid,
          password,
          puerto,
          uid: formData.uid || undefined,
        },
        { baseURL: 'http://localhost:3001' }
      ); // 👈 peticiones al agente local

      if (data.ok) {
        toast.success('Configuración Wi‑Fi enviada');

        setFormData(prev => ({ ...prev, uid: data.uid }));
        setTimeout(onNext, 1200);
      } else {
        setError('La placa no respondió correctamente.');
        toast.error('La placa no respondió correctamente');
      }
    } catch (err) {
      console.error('❌ Error al configurar WiFi:', err);
      let msg = 'No se pudo enviar la configuración.';
      if (err.response?.status === 423) {
        msg = 'El puerto está ocupado. Cierra el IDE de Arduino u otra app.';
      } else if (err.response?.status === 500) {
        msg = 'Error al abrir el puerto. Verifica que el dispositivo esté conectado.';
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <motion.div
      key="paso-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold mb-1">3. Configura la red WiFi</h2>
        <p className="text-sm text-gray-600 dark:text-darkMuted">
          Ingresa las credenciales de la red WiFi. Estas se enviarán al dispositivo conectado.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Nombre de red (SSID)</label>
          <input
            type="text"
            value={formData.ssid || ''}
            onChange={e => setFormData({ ...formData, ssid: e.target.value })}
            className="w-full border px-3 py-2 rounded bg-white dark:bg-darkSurface dark:border-gray-600 dark:text-white"
            placeholder="MiRedWiFi"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Contraseña</label>
          <input
            type="password"
            value={formData.password || ''}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            className="w-full border px-3 py-2 rounded bg-white dark:bg-darkSurface dark:border-gray-600 dark:text-white"
            placeholder="********"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded transition"
        >
          Atrás
        </button>
        <button
          onClick={enviarConfiguracion}
          disabled={!formData.ssid || !formData.password || enviando}
          className="bg-primary hover:bg-primaryHover text-white px-5 py-2 rounded transition disabled:opacity-50"
        >
          {enviando ? 'Enviando…' : 'Enviar y continuar'}
        </button>
      </div>
    </motion.div>
  );
}
