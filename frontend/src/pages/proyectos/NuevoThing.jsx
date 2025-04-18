import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toastEasy } from '../../hooks/toastEasy';
import axios from 'axios';
import Button from '../../components/ui/Button';
import SensorAutocomplete from '../../components/things/SensorAutocomplete';

export default function NuevoThing() {
  const navigate = useNavigate();
  const [dispositivos, setDispositivos] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    dispositivoId: '',
    sensores: [],
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get('/api/dispositivos', { headers })
      .then(res => setDispositivos(res.data))
      .catch(err => console.error('❌ Error al cargar dispositivos:', err));
  }, []);

  const handleAgregarSensor = () => {
    setForm(prev => ({
      ...prev,
      sensores: [...prev.sensores, { nombre: '', tipo: '', unidad: '', pin: '' }],
    }));
  };

  const handleSensorChange = (index, campo, valor) => {
    const actualizados = [...form.sensores];
    actualizados[index][campo] = valor;
    setForm(prev => ({ ...prev, sensores: actualizados }));
  };

  const handleEliminarSensor = index => {
    const nuevos = [...form.sensores];
    nuevos.splice(index, 1);
    setForm(prev => ({ ...prev, sensores: nuevos }));
  };

  const handleCrearThing = async () => {
    const errores = form.sensores.filter(s => !s.nombre || !s.tipo || !s.unidad || !s.pin);

    if (!form.nombre || !form.descripcion) {
      // toast.error("❌ Debes completar el nombre y la descripción del proyecto.");
      return;
    }

    if (errores.length > 0) {
      // toast.error("❌ Todos los sensores deben tener nombre, tipo, unidad y pin.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Crear proyecto
      const res = await axios.post(
        '/api/proyectos',
        {
          nombre: form.nombre,
          descripcion: form.descripcion,
          placa: 'desconocida',
        },
        { headers }
      );

      const proyectoId = res.data._id;

      // 2. Crear sensores con proyectoId asignado
      for (const sensor of form.sensores) {
        await axios.post(
          '/api/sensores',
          {
            nombre: sensor.nombre,
            tipo: sensor.tipo,
            unidad: sensor.unidad,
            pin: sensor.pin,
            proyecto: proyectoId,
          },
          { headers }
        );
      }

      // toast.success("✅ Thing creado correctamente");
      navigate('/proyectos');
    } catch (err) {
      console.error('❌ Error creando Thing:', err);
      // toast.error("❌ Error al crear el Thing");
    }
  };
  const lol = () => {
    toastEasy('success', 'klk');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white" onClick={lol}>
          {' '}
          Crear nuevo Thing
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Asocia un dispositivo y configura los sensores.
        </p>
      </div>

      <div className="space-y-6 bg-white dark:bg-darkSurface rounded-lg p-6 shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 font-medium">Nombre del proyecto</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded bg-white dark:bg-darkBg dark:border-gray-600 dark:text-white"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Mi sistema de riego automático"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium">Descripción</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded bg-white dark:bg-darkBg dark:border-gray-600 dark:text-white"
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Proyecto para controlar sensores del cultivo"
            />
          </div>
        </div>

        {/* 📡 Dispositivos */}
        <div>
          <label className="block text-sm font-medium mb-2">Dispositivo asociado</label>
          <div className="grid sm:grid-cols-2 gap-3">
            {dispositivos.map(d => {
              const selected = form.dispositivoId === d._id;
              const imgSrc = `${d.imagen || 'generic.png'}`;
              return (
                <div
                  key={d._id}
                  onClick={() => setForm(prev => ({ ...prev, dispositivoId: d._id }))}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition ${
                    selected
                      ? 'bg-blue-100 dark:bg-blue-900 border-blue-400'
                      : 'hover:bg-gray-50 dark:hover:bg-darkMuted'
                  }`}
                >
                  <img src={imgSrc} alt={d.nombre} className="w-10 h-10 object-contain" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{d.nombre}</p>
                    <p className="text-xs text-gray-500">{d.uid.slice(0, 8)}…</p>
                  </div>
                  {selected && (
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 🧪 Sensores */}
        <div>
          <label className="block text-sm font-medium mb-2">Sensores</label>
          <div className="space-y-3">
            {form.sensores.map((sensor, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 items-end">
                <SensorAutocomplete
                  value={sensor.nombre}
                  onSelect={s => {
                    handleSensorChange(i, 'nombre', s.nombre);
                    handleSensorChange(i, 'tipo', s.tipo);
                    handleSensorChange(i, 'unidad', s.unidad);
                  }}
                  onInputChange={val => handleSensorChange(i, 'nombre', val)}
                />
                <input
                  type="text"
                  placeholder="Tipo"
                  value={sensor.tipo}
                  onChange={e => handleSensorChange(i, 'tipo', e.target.value)}
                  className="border px-2 py-1 rounded bg-white dark:bg-darkBg dark:border-gray-600 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Unidad"
                  value={sensor.unidad}
                  onChange={e => handleSensorChange(i, 'unidad', e.target.value)}
                  className="border px-2 py-1 rounded bg-white dark:bg-darkBg dark:border-gray-600 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Pin"
                  value={sensor.pin}
                  onChange={e => handleSensorChange(i, 'pin', e.target.value)}
                  className="border px-2 py-1 rounded bg-white dark:bg-darkBg dark:border-gray-600 dark:text-white"
                />
                <button
                  onClick={() => handleEliminarSensor(i)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
          <div className="pt-3">
            <Button onClick={handleAgregarSensor}>➕ Agregar sensor</Button>
          </div>
        </div>

        {/* ✅ Crear */}
        <div className="pt-4 text-right">
          <Button onClick={handleCrearThing}>✅ Crear Thing</Button>
        </div>
      </div>
    </div>
  );
}
