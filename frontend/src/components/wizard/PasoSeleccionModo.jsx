// src/components/wizard/PasoSeleccionModo.jsx
import { motion } from 'framer-motion';
import { RadioGroup } from '@headlessui/react';
import { CheckCircle, Zap, Wrench, Info } from 'lucide-react';
import { useState, useContext, useEffect } from 'react';
import { WizardContext } from '../../context/WizardContext';

const modos = [
  {
    nombre: 'Automático',
    descripcion: 'Nos encargamos de todo: flasheo, WiFi, verificación… Tú solo observa.',
    valor: 'automatico',
    icono: <Zap size={40} className="text-primary" />,
  },
  {
    nombre: 'Manual',
    descripcion: 'Tú controlas el proceso: copia, pega y sube el código por tu cuenta.',
    valor: 'manual',
    icono: <Wrench size={40} className="text-yellow-600 dark:text-yellow-400" />,
  },
];

export default function PasoSeleccionModo() {
  const [modoSeleccionado, setModoSeleccionado] = useState(null);

  const { setModo: setModoContext } = useContext(WizardContext);

  useEffect(() => {
    if (modoSeleccionado) {
      setModoContext(modoSeleccionado);
    }
  }, [modoSeleccionado, setModoContext]);

  return (
    <motion.div
      key="paso-seleccion-modo"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-10"
    >
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          ¿Cómo prefieres continuar?
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Puedes dejar que el asistente lo haga todo por ti, o tomar el control del proceso.
        </p>
      </div>

      {/* Recomendación */}
      <div className="flex items-center gap-3 text-sm text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg px-4 py-3 max-w-2xl mx-auto">
        <Info className="w-5 h-5 flex-shrink-0" />
        <span>
          Se recomienda usar el modo <strong>Automático</strong> para una configuración más rápida y
          sin errores.
        </span>
      </div>

      {/* Opciones */}
      <RadioGroup value={modoSeleccionado} onChange={setModoSeleccionado}>
        <div className="flex flex-col sm:flex-row gap-6 max-w-2xl mx-auto">
          {modos.map(m => (
            <RadioGroup.Option
              key={m.valor}
              value={m.valor}
              className={({ checked }) =>
                `relative flex-1 flex flex-col items-center gap-3 text-center cursor-pointer border rounded-xl p-6 shadow-lg transition
                ${
                  checked
                    ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-xl'
                    : 'border-gray-300 dark:border-gray-700 hover:shadow-md'
                }`
              }
            >
              {({ checked }) => (
                <>
                  {m.icono}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {m.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{m.descripcion}</p>
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
