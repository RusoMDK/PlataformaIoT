import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import VisualizacionCard from '../../components/visualizaciones/VisualizacionCard';
import FormularioVisualizacion from '../../components/visualizaciones/FormularioVisualizacion';
import Swal from 'sweetalert2';
import Button from '../../components/ui/Button';
import { toast } from 'sonner';

export default function VisualizacionAvanzada() {
  const { id } = useParams();
  const [visualizaciones, setVisualizaciones] = useState([]);
  const [sensores, setSensores] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [visualizacionEditando, setVisualizacionEditando] = useState(null);

  const token = localStorage.getItem('token');
  const csrfToken = localStorage.getItem('csrfToken');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-csrf-token': csrfToken,
    },
  };

  useEffect(() => {
    fetchVisualizaciones();
    fetchSensores();
  }, [id]);

  const fetchVisualizaciones = async () => {
    try {
      const res = await axios.get(`/api/visualizaciones?proyecto=${id}`, config);
      setVisualizaciones(res.data);
    } catch (err) {
      console.error('❌ Error al obtener visualizaciones:', err);
      toast.error('Error al obtener visualizaciones');
    }
  };

  const fetchSensores = async () => {
    try {
      const res = await axios.get(`/api/sensores?proyecto=${id}`, config);
      setSensores(res.data);
    } catch (err) {
      console.error('❌ Error al obtener sensores:', err);
      toast.error('Error al obtener sensores');
    }
  };

  const handleDragEnd = async event => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = visualizaciones.findIndex(v => v._id === active.id);
      const newIndex = visualizaciones.findIndex(v => v._id === over.id);

      const nuevoOrden = arrayMove(visualizaciones, oldIndex, newIndex);
      setVisualizaciones(nuevoOrden);

      try {
        for (let i = 0; i < nuevoOrden.length; i++) {
          await axios.put(`/api/visualizaciones/${nuevoOrden[i]._id}`, { orden: i }, config);
        }
      } catch (err) {
        console.error('❌ Error al actualizar orden:', err);
        toast.error('Error al actualizar orden de visualizaciones');
      }
    }
  };

  const abrirModal = () => {
    setVisualizacionEditando(null);
    setMostrarModal(true);
  };

  const editarVisualizacion = vis => {
    setVisualizacionEditando({ ...vis });
    setMostrarModal(false);
    setTimeout(() => {
      setMostrarModal(true);
    }, 100);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setVisualizacionEditando(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 bg-light-bg dark:bg-dark-bg rounded-xl transition-colors">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          📈 Visualización Avanzada
        </h1>
        <Button onClick={abrirModal} variant="success">
          ➕ Añadir gráfica personalizada
        </Button>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={visualizaciones.map(v => v._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {visualizaciones.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No hay visualizaciones creadas aún. Puedes añadir una usando el botón de arriba. 👆
              </p>
            ) : (
              visualizaciones.map(vis => (
                <VisualizacionCard
                  key={vis._id}
                  visualizacion={vis}
                  sensores={sensores}
                  fetchAll={fetchVisualizaciones}
                  onEditar={() => editarVisualizacion(vis)}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      <FormularioVisualizacion
        open={mostrarModal}
        onClose={cerrarModal}
        fetchAll={fetchVisualizaciones}
        sensores={sensores}
        proyectoId={id}
        visualizacion={visualizacionEditando}
      />
    </div>
  );
}
