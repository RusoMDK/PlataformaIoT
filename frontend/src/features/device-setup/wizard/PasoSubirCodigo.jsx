import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { generarCodigoWiFi } from '@/utils/generarCodigoWiFi';
import { Copy, Download, AlertTriangle, BookOpen, FileDown } from 'lucide-react';
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
      setCodigo(generarCodigoWiFi({ placa }));
    }
  }, [placa]);

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(codigo);
      toast.success('✅ Código copiado al portapapeles');
    } catch {
      toast.error('❌ No se pudo copiar');
    }
  };

  const descargarCodigo = () => {
    try {
      saveAs(new Blob([codigo], { type: 'text/plain;charset=utf-8' }), `wifi-config-${placa}.ino`);
      toast.success('📥 Código descargado');
    } catch {
      toast.error('❌ No se pudo descargar');
    }
  };

  const descargarPaqueteCompleto = async () => {
    try {
      const uid = formData?.dispositivo?.uid || formData?.uid;
      if (!uid) return toast.error('❌ UID del dispositivo no disponible');

      const res = await fetch(`/api/sketch/manual/${uid}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Error al descargar');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sketch-${uid}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('📦 Sketch descargado correctamente');
    } catch (err) {
      toast.error('❌ No se pudo descargar el paquete');
      console.error(err);
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
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Sube tu sketch a la placa
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Aquí tienes el código listo para subir. ¡Adelante!
        </p>
      </div>

      {/* Advertencia si no tiene WiFi */}
      {esSinWiFi && (
        <div className="flex items-start gap-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-l-4 border-yellow-500 p-4 rounded-lg">
          <AlertTriangle className="w-5 h-5" />
          <div className="text-sm">
            Tu placa <strong>{placaNombre}</strong> no tiene Wi‑Fi integrado.
            <br />
            Puedes usar un módulo ESP8266 en modo AT o un ESP32 como puente.
          </div>
        </div>
      )}

      {/* Librerías necesarias */}
      <div className="max-w-md mx-auto bg-blue-50 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 p-4 rounded-lg text-sm space-y-2">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-100 font-medium">
          <BookOpen size={16} />
          Librerías necesarias
        </div>
        <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
          <li>
            Placa: <strong>{placaNombre}</strong>
          </li>
          <li>
            Librería: <strong>{libreria}</strong>
          </li>
          {libreria === 'WiFi.h' && (
            <li>
              Ya incluida en Arduino IDE. Si no, instálala desde{' '}
              <a
                href="https://github.com/espressif/arduino-esp32"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600 dark:text-blue-300"
              >
                GitHub oficial
              </a>
            </li>
          )}
        </ul>
      </div>

      {/* Instrucciones rápidas */}
      <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 text-sm max-w-md mx-auto space-y-1">
        <li>Abre Arduino IDE o PlatformIO</li>
        <li>
          Elige tu placa: <strong>{placaNombre}</strong>
        </li>
        <li>Pega el código en el editor</li>
        <li>
          Haz clic en <strong>Siguiente</strong>
        </li>
      </ul>

      {/* Botón de descarga del ZIP */}
      <div className="flex justify-center">
        <button
          onClick={descargarPaqueteCompleto}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
        >
          <FileDown size={16} />
          Descargar paquete completo (.zip)
        </button>
      </div>

      {/* Vista previa del código */}
      <div className="mx-auto max-w-3xl bg-gray-100 dark:bg-gray-800 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
        <div className="flex justify-end p-2 gap-2 bg-gray-200 dark:bg-gray-700">
          <button
            onClick={copiarCodigo}
            className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition"
            title="Copiar"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={descargarCodigo}
            className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition"
            title="Descargar"
          >
            <Download size={16} />
          </button>
        </div>
        <div
          className="max-h-[30vh] overflow-y-auto p-4"
          style={{
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">
            {codigo || '// Generando código...'}
          </pre>
        </div>
      </div>
    </motion.div>
  );
}
