// src/components/wizard/PasoDescargaAgente.jsx
import { motion } from 'framer-motion';
import { FaWindows, FaApple, FaLinux } from 'react-icons/fa';

export default function PasoDescargaAgente() {
  return (
    <motion.div
      key="paso-descarga"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 text-center"
    >
      {/* Título y descripción principal */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          ¡Bienvenido a Agente IoT!
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
          Para que nuestro asistente hable directamente con tu placa, necesitas instalar el Agente
          de Escritorio. ¡No te preocupes, tarda solo un momento y es 100% seguro!
        </p>
      </div>

      {/* Mini–tutorial con tono amistoso */}
      <div className="text-sm text-gray-700 dark:text-gray-300 px-4">
        <p className="font-medium">¿Qué hace el Agente?</p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-left mx-auto max-w-md">
          <li>
            <strong>Detecta</strong> tu placa al conectarla por USB, sin esfuerzos extra.
          </li>
          <li>
            <strong>Envía</strong> las credenciales de Wi‑Fi y el firmware de forma automática.
          </li>
          <li>
            <strong>Sincroniza</strong> toda la configuración directamente desde el navegador.
          </li>
        </ul>
      </div>

      {/* Botones de descarga con iconos a color */}
      <div className="flex justify-center gap-8 mt-4">
        <a
          href="https://example.com/agent/windows"
          className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 p-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          download
        >
          <FaWindows size={48} className="mb-2 text-blue-600" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Windows</span>
        </a>
        <a
          href="https://example.com/agent/macos"
          className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 p-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          download
        >
          <FaApple size={48} className="mb-2 text-gray-900 dark:text-gray-100" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">macOS</span>
        </a>
        <a
          href="https://example.com/agent/linux"
          className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 p-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          download
        >
          <FaLinux size={48} className="mb-2 text-yellow-500" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Linux</span>
        </a>
      </div>

      {/* Nota final */}
      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Al hacer clic en “Siguiente”, asumiremos que ya instalaste el Agente.
      </p>
    </motion.div>
  );
}
