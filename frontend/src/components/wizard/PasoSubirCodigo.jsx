// src/components/wizard/PasoSubirCodigo.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { generarCodigoWiFi } from '../../utils/generarCodigoWiFi';
import { Copy, Download, AlertTriangle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';

export default function PasoSubirCodigo({ formData, onNext, onBack }) {
  const [codigo, setCodigo] = useState('');

  const detectarTipoPorNombre = (texto = '') => {
    const lower = texto.toLowerCase();
    if (lower.includes('esp32') || lower.includes('cp210')) return 'esp32';
    if (lower.includes('esp8266')) return 'esp8266';
    if (lower.includes('mega')) return 'mega';
    if (lower.includes('uno')) return 'uno';
    return 'otro';
  };

  const tipoDetectado = detectarTipoPorNombre(
    formData.dispositivo?.nombre || formData.dispositivo?.chip || formData.placa
  );
  const placa = tipoDetectado;
  const placaNombre = placa.toUpperCase();

  const esSinWiFi = ['uno', 'mega'].includes(placa);
  const libreria = ['esp32', 'esp8266'].includes(placa) ? 'WiFi.h' : 'Ninguna o módulo adicional';

  useEffect(() => {
    if (placa) {
      const generado = generarCodigoWiFi({ placa });
      setCodigo(generado);
    }
  }, [placa]);

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(codigo);
      toast.success('✅ Código copiado al portapapeles');
    } catch (err) {
      console.error('❌ Error al copiar:', err);
      toast.error('Error al copiar el código');
    }
  };

  const descargarCodigo = () => {
    try {
      const blob = new Blob([codigo], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `wifi-config-${placa || 'dispositivo'}.ino`);
      toast.success('📥 Código descargado');
    } catch (err) {
      console.error('❌ Error al descargar:', err);
      toast.error('No se pudo descargar el archivo');
    }
  };

  return (
    <motion.div
      key="paso-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">4. Sube el código a tu placa</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Para que tu placa pueda recibir la configuración WiFi, debes subir el siguiente código.
        </p>

        {esSinWiFi && (
          <div className="flex items-start gap-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-l-4 border-yellow-500 p-4 rounded-lg text-sm">
            <AlertTriangle className="mt-0.5" />
            <div>
              <strong>Tu placa {placaNombre} no tiene WiFi integrado.</strong>
              <br />
              Puedes usar un módulo ESP8266 en modo AT, o un ESP32 como puente.
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border border-blue-300 dark:border-blue-700">
          <div className="flex items-center gap-2 mb-2 text-blue-800 dark:text-blue-100 font-medium">
            <BookOpen size={16} />
            Librerías necesarias
          </div>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Placa:</strong> {placaNombre}
            </li>
            <li>
              <strong>Librería:</strong> {libreria}
            </li>
            {libreria === 'WiFi.h' && (
              <li>
                Ya viene incluida con el IDE de Arduino para ESP32 y ESP8266. Si falta, puedes
                instalarla desde
                <a
                  href="https://github.com/espressif/arduino-esp32"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline ml-1"
                >
                  GitHub oficial
                </a>
              </li>
            )}
          </ul>
        </div>

        <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1 mt-4 mb-4">
          <li>Abre Arduino IDE o PlatformIO</li>
          <li>
            Selecciona la placa: <strong>{placaNombre}</strong>
          </li>
          <li>Pega este código y súbelo</li>
          <li>Luego haz clic en "Siguiente"</li>
        </ul>
      </div>

      <div className="relative">
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
          {codigo || '// Generando código...'}
        </pre>
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={copiarCodigo}
            className="bg-white dark:bg-gray-700 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            title="Copiar"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={descargarCodigo}
            className="bg-white dark:bg-gray-700 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            title="Descargar"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
