// src/components/things/ThingBuilder.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import DispositivoSelector from '../../components/things/DispositivoSelector';
import ConnectionCanvas from '../../components/things/ConnectionCanvas';
import SensorListEditor from '../../components/things/SensorListEditor';
import EmptySensors from '../../components/things/EmptySensors';
import ThingSummary from '../../components/things/ThingSummary';

export default function ThingBuilder() {
  const { id } = useParams();
  const [dispositivo, setDispositivo] = useState(null);
  const [sensores, setSensores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modoAgregar, setModoAgregar] = useState(false);
  const [sensorInicial, setSensorInicial] = useState(null);

  useEffect(() => {
    const fetchDispositivo = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`http://localhost:4000/api/dispositivos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDispositivo(data);
        setSensores(data.sensores || []);
      } catch (err) {
        console.error('❌ Error al obtener el dispositivo:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDispositivo();
  }, [id]);

  const agregarSensor = sensor => {
    setSensores(prev => [...prev, sensor]);
    setModoAgregar(false);
    setSensorInicial(null);
  };

  const actualizarSensor = (index, data) => {
    setSensores(prev => prev.map((s, i) => (i === index ? { ...s, ...data } : s)));
  };

  const eliminarSensor = index => {
    setSensores(prev => prev.filter((_, i) => i !== index));
  };

  const handleAgregarDesdeBuscador = sensor => {
    setSensorInicial(sensor);
    setModoAgregar(true);
  };

  if (loading) {
    return <p className="text-center text-gray-500 dark:text-gray-400">Cargando dispositivo…</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <DispositivoSelector value={dispositivo} onChange={setDispositivo} />

      {dispositivo && <ConnectionCanvas dispositivo={dispositivo} sensores={sensores} />}

      {/* 🔁 Agregar sensor desde Empty */}
      {sensores.length === 0 && !modoAgregar ? (
        <EmptySensors onAgregar={handleAgregarDesdeBuscador} />
      ) : (
        <SensorListEditor
          sensores={sensores}
          onUpdate={actualizarSensor}
          onRemove={eliminarSensor}
          onAdd={agregarSensor}
          dispositivo={dispositivo}
          sensorInicial={sensorInicial}
        />
      )}

      {dispositivo && sensores.length > 0 && (
        <ThingSummary dispositivo={dispositivo} sensores={sensores} />
      )}
    </div>
  );
}
