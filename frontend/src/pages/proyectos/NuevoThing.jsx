import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../../components/ui/Button';
import SensorAutocomplete from '../../components/things/SensorAutocomplete';
import { toast } from 'sonner';

export default function NuevoThing() {
  const navigate = useNavigate();
  const [dispositivos, setDispositivos] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    dispositivoId: '',
    sensores: [],
  });
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const csrfToken = localStorage.getItem('csrfToken');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-csrf-token': csrfToken,
    },
  };

  useEffect(() => {
    const fetchDispositivos = async () => {
      try {
        const res = await axios.get('/api/dispositivos', config);
        if (Array.isArray(res.data)) {
          setDispositivos(res.data);
        } else {
          setDispositivos([]);
          setError('Error al cargar los dispositivos: respuesta inesperada.');
        }
      } catch (err) {
        console.error('❌ Error al cargar dispositivos:', err);
        setError('Error al cargar dispositivos');
      }
    };
    fetchDispositivos();
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
      toast.error('Debes completar todos los campos del proyecto');
      return;
    }

    if (errores.length > 0) {
      toast.error('Todos los sensores deben tener nombre, tipo, unidad y pin.');
      return;
    }

    try {
      const res = await axios.post(
        '/api/proyectos',
        {
          nombre: form.nombre,
          descripcion: form.descripcion,
          placa: 'desconocida',
          dispositivoId: form.dispositivoId,
        },
        config
      );

      const proyectoId = res.data._id;

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
          config
        );
      }

      toast.success('✅ Thing creado correctamente');
      navigate('/proyectos');
    } catch (err) {
      console.error('❌ Error creando Thing:', err);
      toast.error('Error al crear el proyecto');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-light-bg dark:bg-dark-bg rounded-xl transition-colors">
      {/* Encabezado */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
          Crear nuevo Thing
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Asocia un dispositivo y configura los sensores.
        </p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Formulario */}
      <div className="space-y-6 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-6 shadow transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
              Nombre del proyecto
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Sistema de riego automático"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
              Descripción
            </label>
            <input
              type="text"
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Proyecto que controla sensores de cultivo"
              className="input"
            />
          </div>
        </div>

        {/* Dispositivo */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
            Dispositivo asociado
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            {dispositivos.map(d => {
              const selected = form.dispositivoId === d._id;
              const imgSrc = d.imagen || 'generic.png';
              return (
                <div
                  key={d._id}
                  onClick={() => setForm(prev => ({ ...prev, dispositivoId: d._id }))}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition ${
                    selected
                      ? 'bg-blue-100 dark:bg-blue-900 border-blue-400'
                      : 'hover:bg-light-muted/20 dark:hover:bg-dark-muted/30 border-light-border dark:border-dark-border'
                  }`}
                >
                  <img
                    src={imgSrc}
                    alt={d.nombre || 'Dispositivo'}
                    className="w-10 h-10 object-contain"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-light-text dark:text-white">
                      {d.nombre || 'Sin nombre'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {d.uid ? d.uid.slice(0, 8) : 'UID desconocido'}
                    </p>
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

        {/* Sensores */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
            Sensores
          </label>
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
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Unidad"
                  value={sensor.unidad}
                  onChange={e => handleSensorChange(i, 'unidad', e.target.value)}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Pin"
                  value={sensor.pin}
                  onChange={e => handleSensorChange(i, 'pin', e.target.value)}
                  className="input"
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

        {/* Botón crear */}
        <div className="pt-4 text-right">
          <Button onClick={handleCrearThing}>✅ Crear Thing</Button>
        </div>
      </div>
    </div>
  );
}
