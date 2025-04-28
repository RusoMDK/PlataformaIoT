import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SensorAutocomplete from '../../components/things/SensorAutocomplete';

export default function EditarThing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dispositivos, setDispositivos] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    dispositivoId: '',
    sensores: [],
  });

  const token = localStorage.getItem('token');
  const csrfToken = localStorage.getItem('csrfToken'); // 👈 CSRF token
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-csrf-token': csrfToken,
    },
  };

  useEffect(() => {
    const fetchProyecto = async () => {
      try {
        const { data: proyecto } = await axios.get(`/api/proyectos/${id}`, config);
        const { data: sensores } = await axios.get(`/api/sensores?proyecto=${id}`, config);
        const { nombre, descripcion, dispositivoId } = proyecto;
        setForm({
          nombre,
          descripcion,
          dispositivoId: dispositivoId || '',
          sensores: sensores || [],
        });
      } catch (err) {
        console.error('❌ Error al cargar proyecto:', err);
        toast.error('No se pudo cargar el proyecto.');
      }
    };
    fetchProyecto();
  }, [id]);

  useEffect(() => {
    axios
      .get('/api/dispositivos', config)
      .then(res => setDispositivos(res.data))
      .catch(err => console.error('❌ Error al cargar dispositivos:', err));
  }, []);

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

  const handleAgregarSensor = () => {
    setForm(prev => ({
      ...prev,
      sensores: [...prev.sensores, { nombre: '', tipo: '', unidad: '', pin: '' }],
    }));
  };

  const handleGuardarCambios = async () => {
    const errores = form.sensores.filter(s => !s.nombre || !s.tipo || !s.unidad);
    if (errores.length > 0) {
      toast.error('❌ Todos los sensores deben tener nombre, tipo y unidad.');
      return;
    }

    try {
      const usuarioId = localStorage.getItem('usuarioId');

      await axios.put(
        `/api/proyectos/${id}`,
        {
          nombre: form.nombre,
          descripcion: form.descripcion,
          placa: 'desconocida',
          dispositivoId: form.dispositivoId,
        },
        config
      );

      await axios.delete(`/api/sensores/proyecto/${id}`, config);

      await Promise.all(
        form.sensores.map(sensor =>
          axios.post(
            '/api/sensores',
            {
              nombre: sensor.nombre,
              tipo: sensor.tipo,
              unidad: sensor.unidad,
              pin: sensor.pin,
              proyecto: id,
              usuario: usuarioId,
            },
            config
          )
        )
      );

      toast.success('✅ Thing actualizado correctamente');
      navigate(`/proyectos/${id}`);
    } catch (err) {
      console.error('❌ Error actualizando thing:', err);
      toast.error('Error al guardar los cambios.');
    }
  };

  const handleEliminarThing = async () => {
    if (
      !window.confirm('¿Seguro que deseas eliminar este Thing? Esta acción no se puede deshacer.')
    )
      return;
    try {
      await axios.delete(`/api/proyectos/${id}`, config);
      toast.success('🗑️ Thing eliminado correctamente');
      navigate('/proyectos');
    } catch (err) {
      console.error('❌ Error eliminando thing:', err);
      toast.error('Error al eliminar el Thing.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-light-bg dark:bg-dark-bg rounded-xl transition-colors">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Editar Thing</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Modifica los datos de tu proyecto.
        </p>
      </div>

      <div className="space-y-6 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-sm p-6 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
              Nombre del proyecto
            </label>
            <Input
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Sensor de humedad"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
              Descripción
            </label>
            <Input
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Proyecto que mide humedad en suelo"
            />
          </div>
        </div>

        {/* Dispositivos */}
        <div>
          <label className="block text-sm font-medium mb-2 text-light-text dark:text-dark-text">
            Dispositivo asociado
          </label>
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
                      : 'hover:bg-light-muted/20 dark:hover:bg-dark-muted/30 border-light-border dark:border-dark-border'
                  }`}
                >
                  <img src={imgSrc} alt={d.nombre} className="w-10 h-10 object-contain" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 dark:text-white">{d.nombre}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{d.uid.slice(0, 8)}…</p>
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
          <label className="block text-sm font-medium mb-2 text-light-text dark:text-dark-text">
            Sensores
          </label>
          <div className="space-y-3">
            {form.sensores.map((sensor, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 items-end">
                <SensorAutocomplete
                  value={sensor.nombre}
                  onInputChange={val => handleSensorChange(i, 'nombre', val)}
                  onSelect={s => {
                    handleSensorChange(i, 'nombre', s.nombre);
                    handleSensorChange(i, 'tipo', s.tipo);
                    handleSensorChange(i, 'unidad', s.unidad);
                  }}
                />
                <Input
                  placeholder="Tipo"
                  value={sensor.tipo}
                  onChange={e => handleSensorChange(i, 'tipo', e.target.value)}
                />
                <Input
                  placeholder="Unidad"
                  value={sensor.unidad}
                  onChange={e => handleSensorChange(i, 'unidad', e.target.value)}
                />
                <Input
                  placeholder="Pin"
                  value={sensor.pin}
                  onChange={e => handleSensorChange(i, 'pin', e.target.value)}
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

        {/* Acciones */}
        <div className="flex justify-between pt-6">
          <Button variant="danger" onClick={handleEliminarThing}>
            🗑️ Eliminar Thing
          </Button>
          <Button onClick={handleGuardarCambios}>💾 Guardar cambios</Button>
        </div>
      </div>
    </div>
  );
}
