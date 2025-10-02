// src/components/wizard/PasoSeleccionPlaca.jsx
import { motion } from 'framer-motion';
import { RadioGroup } from '@headlessui/react';
import { CheckCircle } from 'lucide-react';

const placas = [
  {
    nombre: 'ESP32 (WROOM)',
    descripcion: 'Wi‑Fi integrado y gran potencia para tus proyectos IoT.',
    valor: 'esp32',
  },
  {
    nombre: 'ESP8266',
    descripcion: 'Compacta y económica, con conectividad Wi‑Fi.',
    valor: 'esp8266',
  },
  {
    nombre: 'Arduino Uno',
    descripcion: 'Clásica y versátil, perfecta para principiantes.',
    valor: 'uno',
  },
  {
    nombre: 'Arduino Mega 2560',
    descripcion: 'Muchos pines y potencia extra para tus circuitos.',
    valor: 'mega',
  },
  {
    nombre: 'Arduino Nano',
    descripcion: 'Miniatura del Uno, ideal para espacios reducidos.',
    valor: 'nano',
  },
  {
    nombre: 'Giga R1 WiFi',
    descripcion: 'Optimizada para IA e IoT, con Wi‑Fi integrado.',
    valor: 'giga_r1',
  },
  {
    nombre: 'Nano RP2040 Connect',
    descripcion: 'Edge AI + conectividad avanzada en formato nano.',
    valor: 'nano_rp2040',
  },
  {
    nombre: 'MKR WiFi 1010',
    descripcion: 'Seguridad y Wi‑Fi para tus proyectos IoT.',
    valor: 'mkr_wifi_1010',
  },
  {
    nombre: 'Nano 33 IoT',
    descripcion: 'Pequeña, poderosa y segura, con Wi‑Fi.',
    valor: 'nano_33_iot',
  },
];

export default function PasoSeleccionPlaca({ formData, setFormData }) {
  return (
    <motion.div
      key="paso-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Encabezado amigable */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">¡Empecemos!</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
          Cuéntanos qué placa vas a usar para que el asistente adapte todo a tu hardware.
        </p>
      </div>

      {/* Mini‑tutorial sobre la selección */}
      <div className="max-w-md mx-auto text-left text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <p className="font-medium">¿Por qué es importante?</p>
        <ul className="list-disc list-inside">
          <li>Permite cargar el firmware correcto para tu modelo de placa.</li>
          <li>
            Ajusta los pasos de configuración (instalación de cores, tamaño de memoria, etc.).
          </li>
        </ul>
      </div>

      {/* Opciones de placas */}
      <RadioGroup
        value={formData.placa}
        onChange={value => setFormData({ ...formData, placa: value })}
        className="max-w-2xl mx-auto"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {placas.map(placa => (
            <RadioGroup.Option
              key={placa.valor}
              value={placa.valor}
              className={({ checked }) =>
                `relative flex items-start gap-4 p-4 rounded-xl cursor-pointer border transition-shadow duration-200
                 ${
                   checked
                     ? 'border-primary bg-primary/10 shadow-md'
                     : 'border-gray-300 hover:shadow-sm dark:border-gray-600'
                 }`
              }
            >
              {({ checked }) => (
                <>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{placa.nombre}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{placa.descripcion}</p>
                  </div>
                  {checked && (
                    <CheckCircle className="text-primary w-6 h-6 absolute top-4 right-4" />
                  )}
                </>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </motion.div>
  );
}
