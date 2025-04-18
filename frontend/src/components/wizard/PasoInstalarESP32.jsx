// src/components/wizard/PasoInstalarESP32.jsx
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function PasoInstalarESP32({ onNext, onBack }) {
  return (
    <motion.div
      key="paso-esp32"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-start gap-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-l-4 border-yellow-500 p-4 rounded-lg text-sm">
        <AlertTriangle className="mt-0.5" />
        <div>
          <strong>¡Importante!</strong>
          <br />
          Si es tu primera vez usando una placa <strong>ESP32</strong> en Arduino IDE, debes
          instalar el soporte oficial.
        </div>
      </div>

      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-4">
        <p>✅ Sigue estos pasos para instalar soporte ESP32:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Abre Arduino IDE</li>
          <li>
            Ve a <strong>Preferencias</strong> (Arduino → Preferences)
          </li>
          <li>
            En <strong>"Gestor de URLs adicionales de tarjetas"</strong>, agrega:
            <br />
            <code className="block mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs">
              https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
            </code>
          </li>
          <li>
            Luego ve a <strong>Herramientas → Placa → Gestor de tarjetas</strong>
          </li>
          <li>
            Busca "ESP32" e instala el paquete de <strong>Espressif</strong>
          </li>
        </ol>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded transition"
        >
          Atrás
        </button>
        <button
          onClick={onNext}
          className="bg-primary hover:bg-primaryHover text-white px-5 py-2 rounded transition"
        >
          Ya lo instalé ✅
        </button>
      </div>
    </motion.div>
  );
}
