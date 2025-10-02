// src/pages/proyectos/EditarThingModal.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/api/axiosInstance';
import { getCsrfToken } from '@/api/auth.api';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import SensorAutocomplete from '@/features/device-setup/components/SensorAutocomplete';
import { toast } from 'sonner';
import { Save, X, Plug, Trash2 } from 'lucide-react';

export default function EditarThingModal({ open = true, onOpenChange, onSaved, proyectoId: proyectoIdProp }) {
  const navigate = useNavigate();
  const params = useParams();
  const id = proyectoIdProp || params.id;

  const [loading, setLoading] = useState(true);
  const [dispositivos, setDispositivos] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    dispositivoId: '',
    sensores: [],
  });

  const close = () => {
    onOpenChange?.(false);
    navigate('/proyectos', { replace: true });
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const csrf = await getCsrfToken();
        const cfg = { headers: { 'x-csrf-token': csrf }, withCredentials: true };

        const [{ data: proyecto }, { data: sensores }, { data: dispositivos }] = await Promise.all([
          axiosInstance.get(`/proyectos/${id}`, cfg),
          axiosInstance.get(`/sensores`, { ...cfg, params: { proyecto: id } }),
          axiosInstance.get(`/dispositivos`, cfg),
        ]);

        setForm({
          nombre: proyecto?.nombre || '',
          descripcion: proyecto?.descripcion || '',
          dispositivoId: proyecto?.dispositivoId || '',
          sensores: Array.isArray(sensores) ? sensores : [],
        });
        setDispositivos(Array.isArray(dispositivos) ? dispositivos : []);
      } catch (err) {
        console.error('❌ Error al cargar proyecto/dispositivos/sensores:', err);
        toast.error('No se pudo cargar el proyecto.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSensorChange = (index, campo, valor) => {
    setForm((prev) => {
      const next = [...prev.sensores];
      next[index] = { ...next[index], [campo]: valor };
      return { ...prev, sensores: next };
    });
  };
  const handleEliminarSensor = (index) => {
    setForm((prev) => {
      const next = [...prev.sensores];
      next.splice(index, 1);
      return { ...prev, sensores: next };
    });
  };
  const handleAgregarSensor = () => {
    setForm((prev) => ({
      ...prev,
      sensores: [...prev.sensores, { nombre: '', tipo: '', unidad: '', pin: '' }],
    }));
  };
  const erroresSensores = useMemo(
    () => form.sensores.filter((s) => !s.nombre || !s.tipo || !s.unidad),
    [form.sensores]
  );

  const handleGuardarCambios = async () => {
    if (!form.nombre || !form.descripcion) {
      toast.error('Completa nombre y descripción.');
      return;
    }
    if (erroresSensores.length > 0) {
      toast.error('Todos los sensores deben tener nombre, tipo y unidad.');
      return;
    }

    try {
      const csrf = await getCsrfToken();
      const cfg = { headers: { 'x-csrf-token': csrf }, withCredentials: true };

      await axiosInstance.put(
        `/proyectos/${id}`,
        {
          nombre: form.nombre,
          descripcion: form.descripcion,
          placa: 'desconocida',
          dispositivoId: form.dispositivoId || null,
        },
        cfg
      );

      await axiosInstance.delete(`/sensores/proyecto/${id}`, cfg);

      await Promise.all(
        form.sensores.map((sensor) =>
          axiosInstance.post(
            '/sensores',
            {
              nombre: sensor.nombre,
              tipo: sensor.tipo,
              unidad: sensor.unidad,
              pin: sensor.pin,
              proyecto: id,
            },
            cfg
          )
        )
      );

      toast.success('✅ Thing actualizado correctamente');
      window.dispatchEvent(new CustomEvent('reload-proyectos'));
      onSaved?.();
      close();
    } catch (err) {
      console.error('❌ Error actualizando thing:', err);
      toast.error('Error al guardar los cambios.');
    }
  };

  const handleEliminarThing = async () => {
    if (!window.confirm('¿Seguro que deseas eliminar este Thing? Esta acción no se puede deshacer.'))
      return;
    try {
      const csrf = await getCsrfToken();
      const cfg = { headers: { 'x-csrf-token': csrf }, withCredentials: true };
      await axiosInstance.delete(`/proyectos/${id}`, cfg);
      toast.success('🗑️ Thing eliminado correctamente');
      window.dispatchEvent(new CustomEvent('reload-proyectos'));
      close();
    } catch (err) {
      console.error('❌ Error eliminando thing:', err);
      toast.error('Error al eliminar el Thing.');
    }
  };

  return (
    <Modal open={open} onOpenChange={(v) => (!v ? close() : null)} title="Editar Thing" className="sm:max-w-2xl">
      {loading ? (
        <div className="h-40 bg-gray-100 dark:bg-gray-900 rounded-xl animate-pulse" />
      ) : (
        <>
          {/* Proyecto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Nombre del proyecto</label>
              <input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Sensor de humedad"
                className="form-input-md"
              />
            </div>
            <div>
              <label className="form-label">Descripción</label>
              <input
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Proyecto que mide humedad en suelo"
                className="form-input-md"
              />
            </div>
          </div>

          {/* Dispositivo */}
          <div>
            <label className="form-label">Dispositivo asociado</label>
            {dispositivos.length ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {dispositivos.map((d) => {
                  const selected = form.dispositivoId === d._id;
                  const imgSrc = d.imagen || 'generic.png';
                  return (
                    <div
                      key={d._id}
                      onClick={() => setForm((prev) => ({ ...prev, dispositivoId: d._id }))}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition ${
                        selected
                          ? 'bg-blue-100 dark:bg-blue-900 border-blue-400'
                          : 'hover:bg-light-muted/20 dark:hover:bg-dark-muted/30 border-light-border dark:border-dark-border'
                      }`}
                    >
                      <img src={imgSrc} alt={d.nombre} className="w-10 h-10 object-contain" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-800 dark:text-white">{d.nombre}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{d.uid?.slice(0, 8)}…</p>
                      </div>
                      {selected && <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">✓</span>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                No tienes dispositivos.{' '}
                <button className="text-primary underline" onClick={() => navigate('/nuevo-dispositivo')}>
                  Agregar dispositivo
                </button>
                .
              </div>
            )}
            <div className="mt-2">
              <Button variant="secondary" onClick={() => navigate('/nuevo-dispositivo')}>
                <Plug className="w-4 h-4 mr-2" /> Vincular uno nuevo
              </Button>
            </div>
          </div>

          {/* Sensores */}
          <div>
            <label className="form-label">Sensores</label>
            <div className="space-y-3">
              {form.sensores.map((sensor, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 items-end">
                  <SensorAutocomplete
                    value={sensor.nombre}
                    onInputChange={(val) => handleSensorChange(i, 'nombre', val)}
                    onSelect={(s) => {
                      handleSensorChange(i, 'nombre', s.nombre);
                      handleSensorChange(i, 'tipo', s.tipo);
                      handleSensorChange(i, 'unidad', s.unidad);
                    }}
                  />
                  <input
                    placeholder="Tipo"
                    value={sensor.tipo}
                    onChange={(e) => handleSensorChange(i, 'tipo', e.target.value)}
                    className="form-input-md"
                  />
                  <input
                    placeholder="Unidad"
                    value={sensor.unidad}
                    onChange={(e) => handleSensorChange(i, 'unidad', e.target.value)}
                    className="form-input-md"
                  />
                  <input
                    placeholder="Pin"
                    value={sensor.pin}
                    onChange={(e) => handleSensorChange(i, 'pin', e.target.value)}
                    className="form-input-md"
                  />
                  <button
                    onClick={() => handleEliminarSensor(i)}
                    className="text-red-500 text-sm hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </button>
                </div>
              ))}
            </div>
            <div className="pt-3 flex flex-wrap gap-2">
              <Button onClick={handleAgregarSensor}>➕ Agregar sensor</Button>
              {erroresSensores.length > 0 && (
                <span className="text-xs text-amber-600">
                  Hay {erroresSensores.length} sensores con campos obligatorios vacíos.
                </span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between pt-4">
            <Button variant="danger" onClick={handleEliminarThing}>
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar Thing
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={close}>
                <X className="w-4 h-4 mr-1" /> Cancelar
              </Button>
              <Button onClick={handleGuardarCambios}>
                <Save className="w-4 h-4 mr-1" />
                Guardar cambios
              </Button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
