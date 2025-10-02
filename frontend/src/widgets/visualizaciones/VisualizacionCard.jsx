import { useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  LineChart as RLChart,
  Line,
  BarChart as RBChart,
  Bar,
  AreaChart as RAChart,
  Area,
  ScatterChart as RSChart,
  Scatter,
  PieChart as RPChart,
  Pie,
  Cell,
  RadarChart as RRChart,
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
import { GripVertical, Expand } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';
import Swal from 'sweetalert2';
import axiosInstance from '@/api/axiosInstance';
import { getCsrfToken } from '@/api/auth.api';
import FullscreenModal from '@/components/ui/FullscreenModal';

export default function VisualizacionCard({ visualizacion, sensores, fetchAll, onEditar }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: visualizacion?._id || '' });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const [lecturas, setLecturas] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (visualizacion?.sensores?.length > 0) fetchLecturas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualizacion?._id]);

  const fetchLecturas = async () => {
    try {
      const csrf = await getCsrfToken();
      const respuestas = await Promise.all(
        (visualizacion.sensores || []).map((sensorId) =>
          axiosInstance.get('/lecturas/optimizado', {
            params: { sensor: sensorId, limite: 200, pagina: 1 },
            headers: { 'x-csrf-token': csrf },
            withCredentials: true,
          })
        )
      );
      const datos = respuestas.flatMap((res) => Array.isArray(res.data?.lecturas) ? res.data.lecturas : []);
      setLecturas(datos.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
    } catch (error) {
      console.error('Error al obtener lecturas:', error);
    }
  };

  const eliminar = async () => {
    const confirmar = await Swal.fire({
      title: '¿Eliminar visualización?',
      text: 'Esta visualización se eliminará permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: { popup: 'dark:bg-dark-bg dark:text-white' },
    });

    if (confirmar.isConfirmed) {
      try {
        const csrf = await getCsrfToken();
        await axiosInstance.delete(`/visualizaciones/${visualizacion._id}`, {
          headers: { 'x-csrf-token': csrf }, withCredentials: true,
        });
        await fetchAll?.();
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
    .filter((s) => (visualizacion.sensores || []).includes(s._id))
    .map((s) => s.nombre)
    .join(', ');

  const ejeX = (
    <XAxis dataKey="timestamp" tickFormatter={(v) => new Date(v).toLocaleTimeString()} stroke="currentColor" />
  );
  const ejeY = <YAxis stroke="currentColor" />;
  const tooltip = (
    <Tooltip
      contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', color: 'white' }}
      labelFormatter={(v) => new Date(v).toLocaleString()}
    />
  );
  const leyenda = mostrarLeyenda ? <Legend /> : null;

  const Grafica = () => (
    <ResponsiveContainer width="100%" height={fullscreen ? 500 : 250}>
      {visualizacion.tipo === 'line' && (
        <RLChart data={lecturas}>
          {ejeX}{ejeY}{tooltip}{leyenda}
          <Line dataKey="valor" stroke={color} strokeWidth={2} dot={false} />
        </RLChart>
      )}
      {visualizacion.tipo === 'bar' && (
        <RBChart data={lecturas}>
          {ejeX}{ejeY}{tooltip}{leyenda}
          <Bar dataKey="valor" fill={color} />
        </RBChart>
      )}
      {visualizacion.tipo === 'area' && (
        <RAChart data={lecturas}>
          {ejeX}{ejeY}{tooltip}{leyenda}
          <Area dataKey="valor" stroke={color} fill={color} />
        </RAChart>
      )}
      {visualizacion.tipo === 'scatter' && (
        <RSChart>
          {ejeX}{ejeY}{tooltip}{leyenda}
          <Scatter data={lecturas} fill={color} />
        </RSChart>
      )}
      {visualizacion.tipo === 'radar' && (
        <RRChart data={lecturas} outerRadius={90}>
          <PolarGrid />
          <PolarAngleAxis dataKey="timestamp" />
          <PolarRadiusAxis />
          <Radar dataKey="valor" stroke={color} fill={color} fillOpacity={0.6} />
          {tooltip}{leyenda}
        </RRChart>
      )}
      {visualizacion.tipo === 'pie' && (
        <RPChart>
          <Pie data={lecturas} dataKey="valor" nameKey="timestamp" cx="50%" cy="50%" outerRadius={80}>
            {lecturas.map((_, i) => <Cell key={i} fill={color} />)}
          </Pie>
          {tooltip}{leyenda}
        </RPChart>
      )}
      {visualizacion.tipo === 'histogram' && (
        <RBChart data={lecturas}>
          {ejeX}{ejeY}{tooltip}{leyenda}
          <Bar dataKey="valor" fill={color} />
        </RBChart>
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
          <button onClick={onEditar} className="text-primary hover:underline dark:text-primary-dark">Editar</button>
          <button onClick={eliminar} className="text-danger hover:underline">Eliminar</button>
          <button onClick={() => exportarImagen('png')} className="text-success hover:underline">PNG</button>
          <button onClick={() => exportarImagen('jpg')} className="text-accent hover:underline">JPG</button>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Sensores: {nombreSensores || '—'}</p>

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

      <FullscreenModal open={fullscreen} onClose={() => setFullscreen(false)} title={visualizacion.titulo}>
        <div className="h-full">
          <Grafica />
        </div>
      </FullscreenModal>
    </div>
  );
}
