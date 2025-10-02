import { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from '../ui/Modal';
import Button from '../../components/ui/Button';

export default function FormularioVisualizacion({
  open,
  onClose,
  proyectoId,
  sensores,
  fetchAll,
  visualizacion,
}) {
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('line');
  const [color, setColor] = useState('#8884d8');
  const [mostrarLeyenda, setMostrarLeyenda] = useState(true);
  const [sensoresSeleccionados, setSensoresSeleccionados] = useState([]);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (visualizacion) {
      setTitulo(visualizacion.titulo);
      setTipo(visualizacion.tipo);
      setColor(visualizacion.color || '#8884d8');
      setMostrarLeyenda(visualizacion.mostrarLeyenda ?? true);
      setSensoresSeleccionados(visualizacion.sensores || []);
    } else {
      setTitulo('');
      setTipo('line');
      setColor('#8884d8');
      setMostrarLeyenda(true);
      setSensoresSeleccionados([]);
    }
  }, [visualizacion, open]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!titulo || sensoresSeleccionados.length === 0) {
      return alert('Debes ingresar un título y seleccionar al menos un sensor.');
    }

    try {
      const payload = {
        titulo,
        tipo,
        color,
        mostrarLeyenda,
        sensores: sensoresSeleccionados,
        proyecto: proyectoId,
      };

      if (visualizacion) {
        await axios.put(`/api/visualizaciones/${visualizacion._id}`, payload, config);
      } else {
        await axios.post('/api/visualizaciones', payload, config);
      }

      fetchAll();
      onClose();
    } catch (err) {
      console.error('❌ Error al guardar visualización:', err);
      alert('Error al guardar visualización.');
    }
  };

  const toggleSensor = id => {
    setSensoresSeleccionados(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <Modal
      open={open}
      onOpenChange={onClose}
      title={visualizacion ? '✏️ Editar Visualización' : '➕ Crear Visualización'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
            Título
          </label>
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            className="input"
            placeholder="Ej: Temperatura vs Tiempo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
            Tipo de gráfica
          </label>
          <select value={tipo} onChange={e => setTipo(e.target.value)} className="input">
            <option value="line">Línea</option>
            <option value="bar">Barras</option>
            <option value="area">Área</option>
            <option value="scatter">Dispersión</option>
            <option value="radar">Radar</option>
            <option value="pie">Torta</option>
            <option value="histogram">Histograma</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
            Color principal
          </label>
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="w-16 h-10 border border-light-border dark:border-dark-border rounded cursor-pointer bg-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="mostrarLeyenda"
            type="checkbox"
            checked={mostrarLeyenda}
            onChange={() => setMostrarLeyenda(!mostrarLeyenda)}
            className="rounded border-gray-300 dark:border-gray-600 text-primary dark:bg-dark-surface"
          />
          <label htmlFor="mostrarLeyenda" className="text-sm text-light-text dark:text-dark-text">
            Mostrar leyenda
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
            Selecciona sensores
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {sensores.map(sensor => (
              <label
                key={sensor._id}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
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
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {visualizacion ? 'Guardar cambios' : 'Crear visualización'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
