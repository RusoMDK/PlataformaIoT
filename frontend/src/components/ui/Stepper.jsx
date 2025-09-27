// src/components/ui/Stepper.jsx
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { WizardContext } from '../../context/WizardContext';

export default function Stepper() {
  const { pasos, pasoActual } = useContext(WizardContext);

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex items-center justify-center gap-4 min-w-fit">
        {pasos.map((p, i) => {
          const estado = i < pasoActual ? 'done' : i === pasoActual ? 'active' : 'pending';
          const color =
            estado === 'done'
              ? 'bg-success'
              : estado === 'active'
              ? 'bg-primary'
              : 'bg-gray-300 dark:bg-gray-600';

          return (
            <div className="flex items-center flex-shrink-0" key={p.id}>
              <div className="flex flex-col items-center w-20 min-h-[72px]">
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${color}`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'tween', duration: 0.2 }}
                >
                  {i + 1}
                </motion.div>
                <span className="mt-1 text-[11px] leading-tight text-center text-light-text dark:text-dark-text break-words">
                  {p.label}
                </span>
              </div>
              {i < pasos.length - 1 && (
                <div className="w-6 h-1 bg-gray-300 dark:bg-gray-600 mx-1 rounded" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
