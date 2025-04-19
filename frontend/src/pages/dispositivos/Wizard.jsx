// src/components/wizard/Wizard.jsx
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import PasoSeleccionPlaca from '../../components/wizard/PasoSeleccionPlaca';
import PasoConexionDispositivo from '../../components/wizard/PasoConexionDispositivo';
import PasoConfigurarWiFi from '../../components/wizard/PasoConfigurarWiFi';
import PasoSubirCodigo from '../../components/wizard/PasoSubirCodigo';
import PasoInstalarESP32 from '../../components/wizard/PasoInstalarESP32';
import PasoVerificarConexion from '../../components/wizard/PasoVerificarConexion';
import PasoFinal from '../../components/wizard/PasoFinal';

export default function Wizard() {
  const [pasoActual, setPasoActual] = useState(0);
  const [formData, setFormData] = useState({
    placa: '',
    dispositivo: null,
    ssid: '',
    password: '',
    nombre: '',
    descripcion: '',
    sensores: [],
  });

  const incluirPasoInstalacion = formData.placa === 'esp32' || formData.placa === 'esp8266';

  const pasosBase = [
    { id: 'placa', nombre: 'Selecciona la placa', componente: PasoSeleccionPlaca },
    { id: 'conexion', nombre: 'Conecta el dispositivo', componente: PasoConexionDispositivo },
    ...(incluirPasoInstalacion
      ? [{ id: 'esp32', nombre: 'Instala soporte ESP', componente: PasoInstalarESP32 }]
      : []),
    { id: 'wifi', nombre: 'Configura la red WiFi', componente: PasoConfigurarWiFi },
    { id: 'codigo', nombre: 'Sube el código', componente: PasoSubirCodigo },
    { id: 'verificar', nombre: 'Verifica la conexión', componente: PasoVerificarConexion },
    { id: 'final', nombre: 'Finalizando', componente: PasoFinal },
  ];

  const PasoActualComponente = pasosBase[pasoActual].componente;

  const siguiente = () => {
    if (pasoActual < pasosBase.length - 1) {
      setPasoActual(prev => prev + 1);
    }
  };

  const anterior = () => {
    if (pasoActual > 0) {
      setPasoActual(prev => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-3xl bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl shadow-xl p-8 transition-colors duration-300">
      {/* 🧭 Barra superior con título */}
      <div className="mb-6 text-center">
        <p className="text-sm text-light-muted dark:text-dark-muted mb-1">
          Paso {pasoActual + 1} de {pasosBase.length}
        </p>
        <h1 className="text-xl font-bold text-light-text dark:text-white">
          {pasosBase[pasoActual].nombre}
        </h1>
      </div>

      {/* 🎞️ Animación y paso actual */}
      <AnimatePresence mode="wait">
        <PasoActualComponente
          key={pasosBase[pasoActual].id}
          formData={formData}
          setFormData={setFormData}
          onNext={siguiente}
          onBack={anterior}
        />
      </AnimatePresence>
    </div>
  );
}
