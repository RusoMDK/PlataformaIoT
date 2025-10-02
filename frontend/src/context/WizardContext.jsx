// src/context/WizardContext.jsx
import { createContext, useContext, useState, useRef, useMemo } from 'react';
import PasoSeleccionPlaca from '../features/device-setup/wizard/PasoSeleccionPlaca';
import PasoDescargaAgente from '../features/device-setup/wizard/PasoDescargaAgente';
import PasoSeleccionModo from '../features/device-setup/wizard/PasoSeleccionModo';
import PasoConexionDispositivo from '../features/device-setup/wizard/PasoConexionDispositivo';
import PasoInstalarESP32 from '../features/device-setup/wizard/PasoInstalarESP32';
import PasoSubirCodigo from '../features/device-setup/wizard/PasoSubirCodigo';
import PasoConfigurarWiFi from '../features/device-setup/wizard/PasoConfigurarWiFi';
import PasoProgresoWiFi from '../features/device-setup/wizard/PasoProgresoWiFi';
import PasoVerificarConexion from '../features/device-setup/wizard/PasoVerificarConexion';
import PasoFinal from '../features/device-setup/wizard/PasoFinal';

export const WizardContext = createContext();

export function useWizard() {
  return useContext(WizardContext);
}

export function WizardProvider({ children }) {
  const [pasoActual, setPasoActual] = useState(0);
  const [formData, setFormData] = useState({
    placa: '',
    dispositivo: null,
    ssid: '',
    password: '',
    uid: '',
    ip: '',
  });
  const [modo, setModo] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const refPaso = useRef();

  const placasConWiFi = useMemo(
    () => [
      'esp32',
      'esp8266',
      'uno_wifi_rev2',
      'uno_wifi_rev4',
      'nano_33_iot',
      'nano_esp32',
      'giga_r1',
      'mkr_wifi_1010',
      'nano_rp2040',
    ],
    []
  );

  const placaTieneWiFi = placa => placasConWiFi.includes(placa.toLowerCase().replace(/\s/g, '_'));

  const incluirESP = useMemo(() => ['esp32', 'esp8266'].includes(formData.placa), [formData.placa]);

  const incluirWiFi = useMemo(() => placaTieneWiFi(formData.placa), [formData.placa]);

  const pasos = useMemo(() => {
    return [
      { id: 'placa', label: 'Selecciona placa', comp: PasoSeleccionPlaca },
      { id: 'descarga', label: 'Descargar Agente', comp: PasoDescargaAgente },
      ...(incluirESP || incluirWiFi
        ? [{ id: 'modo', label: 'Modo configuración', comp: PasoSeleccionModo }]
        : []),
      { id: 'conexion', label: 'Conectar dispositivo', comp: PasoConexionDispositivo },
      ...(incluirESP && modo === 'manual'
        ? [
            { id: 'instalar', label: 'Instalar ESP32', comp: PasoInstalarESP32 },
            { id: 'codigo', label: 'Subir código', comp: PasoSubirCodigo },
            { id: 'verificar', label: 'Verificar conexión', comp: PasoVerificarConexion },
          ]
        : incluirESP && modo === 'automatico'
        ? [
            { id: 'wifi', label: 'Configurar Wi‑Fi', comp: PasoConfigurarWiFi },
            { id: 'wifi-prog', label: 'Flasheando placa', comp: PasoProgresoWiFi },
            { id: 'verificar', label: 'Verificar conexión', comp: PasoVerificarConexion },
          ]
        : []),
      { id: 'final', label: 'Finalizar', comp: PasoFinal },
    ];
  }, [formData.placa, incluirESP, incluirWiFi, modo]);

  const value = useMemo(
    () => ({
      pasoActual,
      setPasoActual,
      formData,
      setFormData,
      modo,
      setModo,
      csrfToken,
      setCsrfToken,
      refPaso,
      pasos,
    }),
    [pasoActual, formData, modo, csrfToken, pasos]
  );

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}
