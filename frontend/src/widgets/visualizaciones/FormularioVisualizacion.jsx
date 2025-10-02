import { useEffect, useState } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { getCsrfToken } from '@/api/auth.api';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function FormularioVisualizacion({
  open,
  onClose,
  proyectoId,
  sensores = [],
  fetchAll,
  visualizacion,
}) {
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('line');
  const [color, setColor] = useState('#3B82F6');
  const [mostrarLeyenda, setMostrarLeyenda] = useState(true);
  const [sensoresSeleccionados, setSensoresSeleccionados] = useState([]);

  useEffect(() => {
    if (visualizacion) {
      setTitulo(visualizacion.titulo || '');
      setTipo(visualizacion.tipo || 'line');
      setColor(visualizacion.color || '#3B82F6');
      setMostrarLeyenda(visualizacion.mostrarLeyenda ?? true);
      setSensoresSeleccionados(Array.isArray(visualizacion.sensores) ? visualizacion.sensores : []);
    } else {
      setTitulo('');
      setTipo('line');
      setColor('#3B82F6');
      setMostrarLeyenda(true);
      setSensoresSeleccionados([]);
    }
  }, [visualizacion, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo || sensoresSeleccionados.length === 0) {
      return alert('Debes ingresar un título y seleccionar al menos un sensor.');
    }

    try {
      const csrf = await getCsrfToken();
      const payload = { titulo, tipo, color, mostrarLeyenda, sensores: sensoresSeleccionados, proyecto: proyectoId };

      if (visualizacion?._id) {
        await axiosInstance.put(`/visualizaciones/${visualizacion._id}`, payload, {
          headers: { 'x-csrf-token': csrf },
          withCredentials: true,
        });
      } else {
        await axiosInstance.post('/visualizaciones', payload, {
          headers: { 'x-csrf-token': csrf },
          withCredentials: true,
        });
      }

      fetchAll?.();
      onClose?.();
    } catch (err) {
      console.error('❌ Error al guardar visualización:', err);
      alert('Error al guardar visualización.');
    }
  };

  const toggleSensor = (id) => {
    setSensoresSeleccionados((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  return (
    <Modal
      open={open}
      onOpenChange={onClose}
      title={visualizacion ? 'Editar visualización' : 'Crear visualización'}
      className="sm:max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <div>
          <label className="form-label">Título</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="form-input-md"
            placeholder="Ej: Temperatura vs tiempo"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="form-label">Tipo de gráfica</label>
          <div className="relative">
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="select-pro">
              <option value="line">Línea</option>
              <option value="bar">Barras</option>
              <option value="area">Área</option>
              <option value="scatter">Dispersión</option>
              <option value="radar">Radar</option>
              <option value="pie">Torta</option>
              <option value="histogram">Histograma</option>
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="form-label">Color principal</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-16 h-10 border border-light-border dark:border-dark-border rounded cursor-pointer bg-transparent"
          />
        </div>

        {/* Leyenda */}
        <div className="flex items-center gap-2">
          <input
            id="mostrarLeyenda"
            type="checkbox"
            checked={mostrarLeyenda}
            onChange={() => setMostrarLeyenda(!mostrarLeyenda)}
            className="rounded border-gray-300 dark:border-gray-600 text-primary dark:bg-dark-surface"
          />
          <label htmlFor="mostrarLeyenda" className="text-sm text-light-text dark:text-dark-text">Mostrar leyenda</label>
        </div>

        {/* Sensores */}
        <div>
          <label className="form-label">Selecciona sensores</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {sensores.map((sensor) => (
              <label key={sensor._id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={sensoresSeleccionados.includes(sensor._id)}
                  onChange={() => toggleSensor(sensor._id)}
                  className="rounded border-gray-300 dark:border-gray-600 text-primary dark:bg-dark-surface"
                />
                {sensor.nombre}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary">{visualizacion ? 'Guardar cambios' : 'Crear visualización'}</Button>
        </div>
      </form>
    </Modal>
  );
}
