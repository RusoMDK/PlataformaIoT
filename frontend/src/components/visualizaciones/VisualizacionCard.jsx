// src/components/VisualizacionCard.jsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useEffect, useState } from 'react';
import { GripVertical, Expand } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';
import Swal from 'sweetalert2';
import axios from 'axios';
import FullscreenModal from '../ui/FullscreenModal';

export default function VisualizacionCard({ visualizacion, sensores, fetchAll, onEditar }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: visualizacion?._id || '',
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [lecturas, setLecturas] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (visualizacion?.sensores?.length > 0) fetchLecturas();
  }, []);

  const fetchLecturas = async () => {
    try {
      const respuestas = await Promise.all(
        visualizacion.sensores.map(sensorId =>
          axios.get(`/api/lecturas/optimizadas?sensor=${sensorId}&limite=10`, config)
        )
      );
      const datos = respuestas.flatMap(res => res.data.lecturas);
      setLecturas(datos.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
    } catch (error) {
      console.error('Error al obtener lecturas:', error);
    }
  };

  const eliminar = async () => {
    const confirmar = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta visualización se eliminará permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'dark:bg-dark-bg dark:text-white',
      },
    });

    if (confirmar.isConfirmed) {
      try {
        await axios.delete(`/api/visualizaciones/${visualizacion._id}`, config);
        await fetchAll();
        Swal.fire('Eliminado', 'La visualización ha sido eliminada.', 'success');
      } catch (err) {
        console.error('Error al eliminar visualización:', err);
        Swal.fire('Error', 'No se pudo eliminar la visualización.', 'error');
      }
    }
  };

  const exportarImagen = async (formato = 'png') => {
    const nodo = document.getElementById(`grafica-${visualizacion._id}`);
    if (!nodo) return;
    try {
      const dataUrl =
        formato === 'jpg'
          ? await htmlToImage.toJpeg(nodo, { quality: 0.95 })
          : await htmlToImage.toPng(nodo);
      download(dataUrl, `${visualizacion.titulo}.${formato}`);
    } catch (err) {
      console.error('Error al exportar imagen:', err);
    }
  };

  const color = visualizacion.color || '#3B82F6';
  const mostrarLeyenda = visualizacion.mostrarLeyenda !== false;
  const nombreSensores = sensores
    .filter(s => visualizacion.sensores.includes(s._id))
    .map(s => s.nombre)
    .join(', ');

  const ejeX = (
    <XAxis
      dataKey="timestamp"
      tickFormatter={v => new Date(v).toLocaleTimeString()}
      stroke="currentColor"
    />
  );
  const ejeY = <YAxis stroke="currentColor" />;
  const tooltip = (
    <Tooltip
      contentStyle={{
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        border: 'none',
        color: 'white',
      }}
      labelFormatter={v => new Date(v).toLocaleString()}
    />
  );
  const leyenda = mostrarLeyenda ? <Legend /> : null;

  const Grafica = () => (
    <ResponsiveContainer width="100%" height={fullscreen ? 500 : 250}>
      {visualizacion.tipo === 'line' && (
        <LineChart data={lecturas}>
          {ejeX}
          {ejeY}
          {tooltip}
          {leyenda}
          <Line dataKey="valor" stroke={color} strokeWidth={2} />
        </LineChart>
      )}
      {visualizacion.tipo === 'bar' && (
        <BarChart data={lecturas}>
          {ejeX}
          {ejeY}
          {tooltip}
          {leyenda}
          <Bar dataKey="valor" fill={color} />
        </BarChart>
      )}
      {visualizacion.tipo === 'area' && (
        <AreaChart data={lecturas}>
          {ejeX}
          {ejeY}
          {tooltip}
          {leyenda}
          <Area dataKey="valor" stroke={color} fill={color} />
        </AreaChart>
      )}
      {visualizacion.tipo === 'scatter' && (
        <ScatterChart>
          {ejeX}
          {ejeY}
          {tooltip}
          {leyenda}
          <Scatter data={lecturas} fill={color} />
        </ScatterChart>
      )}
      {visualizacion.tipo === 'radar' && (
        <RadarChart data={lecturas} outerRadius={90}>
          <PolarGrid />
          <PolarAngleAxis dataKey="timestamp" />
          <PolarRadiusAxis />
          <Radar dataKey="valor" stroke={color} fill={color} fillOpacity={0.6} />
          {tooltip}
          {leyenda}
        </RadarChart>
      )}
      {visualizacion.tipo === 'pie' && (
        <PieChart>
          <Pie
            data={lecturas}
            dataKey="valor"
            nameKey="timestamp"
            cx="50%"
            cy="50%"
            outerRadius={80}
          >
            {lecturas.map((entry, i) => (
              <Cell key={i} fill={color} />
            ))}
          </Pie>
          {tooltip}
          {leyenda}
        </PieChart>
      )}
      {visualizacion.tipo === 'histogram' && (
        <BarChart data={lecturas}>
          {ejeX}
          {ejeY}
          {tooltip}
          {leyenda}
          <Bar dataKey="valor" fill={color} />
        </BarChart>
      )}
    </ResponsiveContainer>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4 shadow transition-all relative"
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab p-1 text-light-muted dark:text-dark-muted"
            title="Mover"
          >
            <GripVertical size={16} />
          </button>
          <h2 className="font-semibold text-lg text-light-text dark:text-white">
            {visualizacion.titulo}
          </h2>
        </div>
        <div className="flex gap-2 text-sm">
          <button
            onClick={onEditar}
            className="text-primary hover:underline dark:text-primary-dark"
          >
            Editar
          </button>
          <button onClick={eliminar} className="text-danger hover:underline">
            Eliminar
          </button>
          <button onClick={() => exportarImagen('png')} className="text-success hover:underline">
            PNG
          </button>
          <button onClick={() => exportarImagen('jpg')} className="text-accent hover:underline">
            JPG
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Sensores: {nombreSensores}</p>

      <div id={`grafica-${visualizacion._id}`}>
        <Grafica />
      </div>

      <button
        onClick={() => setFullscreen(true)}
        className="absolute bottom-2 right-2 p-1 text-gray-400 hover:text-primary transition"
        title="Pantalla completa"
      >
        <Expand size={18} />
      </button>

      <FullscreenModal
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        title={visualizacion.titulo}
      >
        <div className="h-full">
          <Grafica />
        </div>
      </FullscreenModal>
    </div>
  );
}
