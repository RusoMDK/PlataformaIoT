// src/components/wizard/Wizard.jsx
import { useRef, useEffect, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import { WizardContext } from '../../context/WizardContext';

export default function Wizard() {
  const {
    pasoActual,
    setPasoActual,
    formData,
    setFormData,
    modo,
    setModo,
    csrfToken,
    setCsrfToken,
    pasos,
    refPaso,
  } = useContext(WizardContext);

  useEffect(() => {
    axios
      .get('/api/csrf-token')
      .then(({ data }) => setCsrfToken(data.csrfToken))
      .catch(console.error);
  }, [setCsrfToken]);

  const total = pasos.length;
  const StepComponent = pasos[pasoActual]?.comp;

  const avanzar = async () => {
    const id = pasos[pasoActual]?.id;
    if (
      ['wifi', 'conexion', 'instalar', 'codigo', 'wifi-prog', 'verificar'].includes(id) &&
      refPaso.current?.ejecutarPaso
    ) {
      const ok = await refPaso.current.ejecutarPaso();
      if (!ok) return;
    }
    if (pasoActual < total - 1) {
      setPasoActual(p => p + 1);
    }
  };

  const volver = () => {
    if (pasoActual === 0) return window.history.back();
    if (pasos[pasoActual - 1]?.id === 'modo') {
      setModo(null);
    }
    setPasoActual(p => p - 1);
  };

  return (
    <main className="flex justify-center w-full">
      <div
        className="w-full max-w-2xl flex flex-col bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg overflow-hidden mt-4 mb-4"
        style={{ height: 'calc(100vh - 64px - 88px - 72px - 32px)' }} // navbar + stepper + footer + margen visual
      >
        {/* Contenido scroll interno con barra oculta */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`paso-${pasoActual}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {StepComponent && (
                <StepComponent
                  formData={formData}
                  setFormData={setFormData}
                  ref={refPaso}
                  csrfToken={csrfToken}
                  setModo={setModo}
                  onComplete={() => setPasoActual(prev => prev + 1)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Botones de navegación */}
        <div className="px-6 py-4 border-t border-light-border dark:border-gray-700 flex justify-between bg-inherit">
          <button
            onClick={volver}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {pasoActual === 0 ? 'Volver' : 'Atrás'}
          </button>
          <button
            onClick={avanzar}
            disabled={pasoActual === total - 1}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primaryHover disabled:opacity-50"
          >
            {['wifi'].includes(pasos[pasoActual]?.id)
              ? 'Enviar ➔'
              : pasos[pasoActual]?.id === 'wifi-prog'
              ? '…'
              : pasos[pasoActual]?.id === 'verificar'
              ? 'Verificar ➔'
              : 'Siguiente ➔'}
          </button>
        </div>
      </div>
    </main>
  );
}
