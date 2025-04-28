// src/components/asistente/PasoSeleccionPlaca.jsx
import { motion } from 'framer-motion';
import { RadioGroup } from '@headlessui/react';
import { CheckCircle } from 'lucide-react';

const placas = [
  {
    nombre: 'ESP32 (WROOM)',
    descripcion: 'Placa con WiFi integrada, ideal para proyectos IoT.',
    valor: 'esp32',
  },
  {
    nombre: 'ESP8266',
    descripcion: 'Alternativa compacta con conectividad WiFi.',
    valor: 'esp8266',
  },
  {
    nombre: 'Arduino Uno',
    descripcion: 'Popular y sencilla, ideal para principiantes.',
    valor: 'uno',
  },
  {
    nombre: 'Arduino Mega 2560',
    descripcion: 'Con muchos pines y capacidad de procesamiento.',
    valor: 'mega',
  },
  {
    nombre: 'Arduino Nano',
    descripcion: 'Versión mini del Uno, ideal para espacios reducidos.',
    valor: 'nano',
  },
  {
    nombre: 'Giga R1 WiFi',
    descripcion: 'Placa potente para proyectos de IA e IoT.',
    valor: 'giga_r1',
  },
  {
    nombre: 'Nano RP2040 Connect',
    descripcion: 'Compatible con Edge AI y conectividad avanzada.',
    valor: 'nano_rp2040',
  },
  {
    nombre: 'MKR WiFi 1010',
    descripcion: 'Diseñada para IoT, conectividad WiFi segura.',
    valor: 'mkr_wifi_1010',
  },
  {
    nombre: 'Nano 33 IoT',
    descripcion: 'Pequeña y poderosa, con WiFi y seguridad integrada.',
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
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
          1. Selecciona tu placa
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Elige el tipo de placa que estás utilizando para configurar correctamente el asistente.
        </p>
      </div>

      <RadioGroup
        value={formData.placa}
        onChange={value => setFormData({ ...formData, placa: value })}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {placas.map(placa => (
            <RadioGroup.Option
              key={placa.valor}
              value={placa.valor}
              className={({ checked }) =>
                `flex items-start gap-3 p-4 rounded-xl cursor-pointer border transition-all duration-200
                ${
                  checked
                    ? 'border-blue-500 bg-blue-50 dark:bg-gray-800'
                    : 'border-gray-300 hover:border-blue-400'
                }`
              }
            >
              {({ checked }) => (
                <>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{placa.nombre}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{placa.descripcion}</p>
                  </div>
                  {checked && (
                    <CheckCircle className="text-blue-600 dark:text-blue-400 w-5 h-5 mt-1" />
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
