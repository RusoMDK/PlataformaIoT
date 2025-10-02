// src/pages/proyectos/NuevoThingModal.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/api/axiosInstance';
import { getCsrfToken } from '@/api/auth.api';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import SensorAutocomplete from '@/features/device-setup/components/SensorAutocomplete';
import { toast } from 'sonner';
import { Save, X, Plug, Trash2 } from 'lucide-react';

export default function NuevoThingModal({ open = true, onOpenChange, onCreated }) {
  const navigate = useNavigate();
  const [dispositivos, setDispositivos] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    dispositivoId: '',
    sensores: [],
  });
  const [loading, setLoading] = useState(true);

  const close = () => {
    onOpenChange?.(false);
    navigate('/proyectos', { replace: true });
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const csrf = await getCsrfToken();
        const { data } = await axiosInstance.get('/dispositivos', {
          headers: { 'x-csrf-token': csrf },
          withCredentials: true,
        });
        setDispositivos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ Error al cargar dispositivos:', err);
        toast.error('Error al cargar dispositivos');
        setDispositivos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAgregarSensor = () => {
    setForm((prev) => ({
      ...prev,
      sensores: [...prev.sensores, { nombre: '', tipo: '', unidad: '', pin: '' }],
    }));
  };
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

  const erroresSensores = useMemo(
    () => form.sensores.filter((s) => !s.nombre || !s.tipo || !s.unidad || !s.pin),
    [form.sensores]
  );

  const handleCrearThing = async () => {
    if (!form.nombre || !form.descripcion) {
      toast.error('Debes completar nombre y descripción del proyecto');
      return;
    }
    if (erroresSensores.length > 0) {
      toast.error('Todos los sensores deben tener nombre, tipo, unidad y pin.');
      return;
    }

    try {
      const csrf = await getCsrfToken();
      const cfg = { headers: { 'x-csrf-token': csrf }, withCredentials: true };

      const { data } = await axiosInstance.post(
        '/proyectos',
        {
          nombre: form.nombre,
          descripcion: form.descripcion,
          placa: 'desconocida',
          dispositivoId: form.dispositivoId || null,
        },
        cfg
      );

      const proyectoId = data?._id;

      if (proyectoId && form.sensores.length) {
        await Promise.all(
          form.sensores.map((sensor) =>
            axiosInstance.post(
              '/sensores',
              {
                nombre: sensor.nombre,
                tipo: sensor.tipo,
                unidad: sensor.unidad,
                pin: sensor.pin,
                proyecto: proyectoId,
              },
              cfg
            )
          )
        );
      }

      toast.success('✅ Thing creado correctamente');
      window.dispatchEvent(new CustomEvent('reload-proyectos'));
      onCreated?.();
      close();
    } catch (err) {
      console.error('❌ Error creando Thing:', err);
      toast.error('Error al crear el proyecto');
    }
  };

  return (
    <Modal open={open} onOpenChange={(v) => (!v ? close() : null)} title="Crear nuevo Thing" className="sm:max-w-2xl">
      {loading ? (
        <div className="h-40 bg-gray-100 dark:bg-gray-900 rounded-xl animate-pulse" />
      ) : (
        <>
          {/* Proyecto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Nombre del proyecto</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Sistema de riego automático"
                className="form-input-md"
              />
            </div>
            <div>
              <label className="form-label">Descripción</label>
              <input
                type="text"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Proyecto que controla sensores de cultivo"
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
                      <img src={imgSrc} alt={d.nombre || 'Dispositivo'} className="w-10 h-10 object-contain" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-light-text dark:text-white">
                          {d.nombre || 'Sin nombre'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {d.uid ? d.uid.slice(0, 8) : 'UID desconocido'}
                        </p>
                      </div>
                      {selected && <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">✓</span>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                No hay dispositivos disponibles.{' '}
                <button className="text-primary underline" onClick={() => navigate('/nuevo-dispositivo')}>
                  Vincular uno
                </button>
                .
              </div>
            )}
            <div className="mt-2">
              <Button variant="secondary" onClick={() => navigate('/nuevo-dispositivo')}>
                <Plug className="w-4 h-4 mr-2" /> Vincular nuevo
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
                    onSelect={(s) => {
                      handleSensorChange(i, 'nombre', s.nombre);
                      handleSensorChange(i, 'tipo', s.tipo);
                      handleSensorChange(i, 'unidad', s.unidad);
                    }}
                    onInputChange={(val) => handleSensorChange(i, 'nombre', val)}
                  />
                  <input
                    type="text"
                    placeholder="Tipo"
                    value={sensor.tipo}
                    onChange={(e) => handleSensorChange(i, 'tipo', e.target.value)}
                    className="form-input-md"
                  />
                  <input
                    type="text"
                    placeholder="Unidad"
                    value={sensor.unidad}
                    onChange={(e) => handleSensorChange(i, 'unidad', e.target.value)}
                    className="form-input-md"
                  />
                  <input
                    type="text"
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
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={close}>
              <X className="w-4 h-4 mr-1" /> Cancelar
            </Button>
            <Button onClick={handleCrearThing}>
              <Save className="w-4 h-4 mr-1" /> Crear Thing
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
