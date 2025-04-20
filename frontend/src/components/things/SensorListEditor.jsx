// src/components/things/SensorListEditor.jsx
import { useEffect, useState } from 'react';
import SensorAutocomplete from './SensorAutocomplete';
import SensorCard from './SensorCard';
import SensorFields from './SensorFields';
import PlacaESP32Interactiva from './PlacaESP32Interactiva';

export default function SensorListEditor({
  sensores,
  onUpdate,
  onRemove,
  onAdd,
  dispositivo,
  sensorInicial,
}) {
  const [sensorSeleccionado, setSensorSeleccionado] = useState(null);
  const [formulario, setFormulario] = useState({ pin: '', campos: {} });

  // 🧠 Si llega un sensorInicial desde EmptySensors → lo seleccionamos automáticamente
  useEffect(() => {
    if (sensorInicial) {
      setSensorSeleccionado(sensorInicial);
      setFormulario({
        pin: '',
        campos: {
          nombre: sensorInicial.nombre,
          unidad: sensorInicial.unidad,
          tipo: sensorInicial.tipo || '',
          rangoMin: '',
          rangoMax: '',
          pin: '',
        },
      });
    }
  }, [sensorInicial]);

  const handleSensorSelect = sensor => {
    setSensorSeleccionado(sensor);
    setFormulario({
      pin: '',
      campos: {
        nombre: sensor.nombre,
        unidad: sensor.unidad,
        tipo: sensor.tipo || '',
        rangoMin: '',
        rangoMax: '',
        pin: '',
      },
    });
  };

  const handleAgregar = () => {
    if (!sensorSeleccionado || !formulario.pin) return;

    const yaExiste = sensores.some(s => s.pin === formulario.pin);
    if (yaExiste) {
      alert('Ese pin ya está ocupado');
      return;
    }

    const nuevo = {
      ...sensorSeleccionado,
      pin: formulario.pin,
      configuracion: formulario.campos,
    };

    onAdd(nuevo);
    setSensorSeleccionado(null);
    setFormulario({ pin: '', campos: {} });
  };

  return (
    <div className="space-y-6">
      <SensorAutocomplete
        value={sensorSeleccionado?.nombre || ''}
        onSelect={handleSensorSelect}
        onInputChange={() => {}}
      />

      {sensorSeleccionado && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlacaESP32Interactiva onSelectPin={pin => setFormulario({ ...formulario, pin })} />

          <SensorFields
            sensor={formulario.campos}
            onChange={campos => setFormulario({ ...formulario, campos })}
          />

          <div className="md:col-span-2 text-right">
            <button
              onClick={handleAgregar}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg"
            >
              ➕ Agregar sensor
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
        {sensores.map((s, idx) => (
          <SensorCard key={idx} sensor={s} onRemove={() => onRemove(idx)} />
        ))}
      </div>
    </div>
  );
}
