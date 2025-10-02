// src/features/device-setup/wizard/PasoInstalarESP32.jsx
import { motion } from 'framer-motion';
import { Copy, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useCallback } from 'react';

const ESP32_URL =
  'https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json';

export default function PasoInstalarESP32() {
  const copiarURL = useCallback(() => {
    navigator.clipboard
      .writeText(ESP32_URL)
      .then(() => toast.success('📋 URL copiada'))
      .catch(() => toast.error('❌ No se pudo copiar'));
  }, []);

  return (
    <motion.div
      key="paso-instalar-esp32"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Preparar tu entorno</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
          Para cargar el sketch de forma manual, asegúrate de tener instalado el soporte de ESP32.
        </p>
      </div>

      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-4 max-w-md mx-auto">
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            Abre el <strong>Arduino IDE</strong> y ve a <em>Preferencias</em>.
          </li>
          <li>
            En <em>Gestor de URLs adicionales de tarjetas</em>, añade:
            <div
              onClick={copiarURL}
              className="mt-1 flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <code className="break-all text-xs">{ESP32_URL}</code>
              <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
          </li>
          <li>
            Ve a <strong>Herramientas → Placa → Gestor de tarjetas</strong> y busca “ESP32”.
          </li>
          <li>
            Instala el paquete de <strong>Espressif</strong>.
          </li>
        </ol>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100 p-4 rounded-lg flex items-start gap-3 text-sm max-w-md mx-auto">
        <BookOpen className="w-5 h-5 mt-1" />
        <span>
          Después de instalar el soporte, estarás listo para subir el sketch generado en el
          siguiente paso.
        </span>
      </div>
    </motion.div>
  );
}
