// src/features/device-setup/wizard/PasoConfigurarWiFi.jsx
import { motion } from 'framer-motion';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Wifi, Info } from 'lucide-react';
import { toast } from 'sonner';

const AGENT_URL = import.meta.env.VITE_AGENT_URL || 'http://localhost:3001';

const PasoConfigurarWiFi = forwardRef(({ formData, setFormData }, ref) => {
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    ejecutarPaso: () => {
      // disparamos el envío en background
      (async () => {
        const { uid, ssid, password, dispositivo } = formData;
        const puerto = dispositivo?.path;
        if (!uid || !puerto || !ssid.trim() || !password.trim()) {
          toast.error('🚨 Completa UID, puerto, SSID y contraseña');
          return;
        }
        try {
          const res = await fetch(`${AGENT_URL}/api/configuracion/configurar-wifi`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, puerto, ssid, password }),
          });
          const body = await res.json();
          if (!res.ok) toast.error(body.error || '⚠️ El agente no aceptó las credenciales');
          else toast.success('✅ ¡Red Wi‑Fi enviada al agente!');
        } catch {
          toast.error('❌ No se pudo contactar al agente');
        }
      })();

      // avanzamos YA
      setLoading(true);
      setTimeout(() => setLoading(false), 300);
      return Promise.resolve(true);
    },
  }));

  return (
    <motion.div
      key="paso-configurar-wifi"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Encabezado */}
      <div className="text-center space-y-2">
        <Wifi size={36} className="mx-auto text-primary" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          ¡Hora de conectar tu Wi‑Fi!
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Usa una red de <strong>2.4 GHz</strong>.<em>ESP32/ESP8266 no admiten 5 GHz.</em>
        </p>
      </div>

      {/* Formulario */}
      <div className="max-w-md mx-auto space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Nombre de la red (SSID)
          </label>
          <input
            type="text"
            value={formData.ssid || ''}
            onChange={e => {
              setFormData(prev => ({ ...prev, ssid: e.target.value }));
            }}
            placeholder="MiRed2.4GHz"
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 focus:ring-primary focus:border-primary transition"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Contraseña
          </label>
          <input
            type="password"
            value={formData.password || ''}
            onChange={e => {
              setFormData(prev => ({ ...prev, password: e.target.value }));
            }}
            placeholder="••••••••"
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 focus:ring-primary focus:border-primary transition"
            disabled={loading}
          />
        </div>
      </div>

      {/* Consejo */}
      <div className="flex items-center gap-2 max-w-md mx-auto text-sm text-gray-600 dark:text-gray-400">
        <Info size={16} />
        <span>Revisa que tu router no esté solo en 5 GHz.</span>
      </div>

      {loading && (
        <p className="text-center text-primary animate-pulse">⌛ Enviando credenciales…</p>
      )}
    </motion.div>
  );
});

export default PasoConfigurarWiFi;
