// src/pages/proyectos/VisualizacionAvanzada.jsx
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/api/axiosInstance';
import { getCsrfToken } from '@/api/auth.api';

import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

import VisualizacionCard from '@/widgets/visualizaciones/VisualizacionCard';
import FormularioVisualizacion from '@/widgets/visualizaciones/FormularioVisualizacion';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import { toast } from 'sonner';
import {
  BarChart3,
  PlusCircle,
  Search,
  SlidersHorizontal,
  GripVertical,
  Sparkles,
} from 'lucide-react';

export default function VisualizacionAvanzada() {
  const { id } = useParams();
  const [visualizaciones, setVisualizaciones] = useState([]);
  const [sensores, setSensores] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [visualizacionEditando, setVisualizacionEditando] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [q, setQ] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [sensorFiltro, setSensorFiltro] = useState('');
  const [compact, setCompact] = useState(false);

  // ---------- fetch ----------
  const fetchVisualizaciones = async () => {
    try {
      const csrf = await getCsrfToken();
      const { data } = await axiosInstance.get('/visualizaciones', {
        params: { proyecto: id },
        headers: { 'x-csrf-token': csrf },
        withCredentials: true,
      });
      setVisualizaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error al obtener visualizaciones:', err);
      toast.error('Error al obtener visualizaciones');
      setVisualizaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSensores = async () => {
    try {
      const csrf = await getCsrfToken();
      const { data } = await axiosInstance.get('/sensores', {
        params: { proyecto: id },
        headers: { 'x-csrf-token': csrf },
        withCredentials: true,
      });
      setSensores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error al obtener sensores:', err);
      toast.error('Error al obtener sensores');
      setSensores([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchVisualizaciones();
    fetchSensores();
  }, [id]);

  // ---------- derived ----------
  const tiposDisponibles = useMemo(() => {
    const set = new Set(visualizaciones.map(v => v.tipo).filter(Boolean));
    // Asegurar opciones comunes aunque aún no existan
    ['line','bar','area','scatter','radar','pie','histogram'].forEach(t => set.add(t));
    return Array.from(set);
  }, [visualizaciones]);

  const visibles = useMemo(() => {
    const term = q.trim().toLowerCase();
    return visualizaciones.filter(v => {
      const byQ =
        !term ||
        (v.titulo || '').toLowerCase().includes(term) ||
        (v.tipo || '').toLowerCase().includes(term);
      const byTipo = !tipoFiltro || v.tipo === tipoFiltro;
      const bySensor = !sensorFiltro || (Array.isArray(v.sensores) && v.sensores.includes(sensorFiltro));
      return byQ && byTipo && bySensor;
    });
  }, [visualizaciones, q, tipoFiltro, sensorFiltro]);

  // KPIs
  const kpiTipos = useMemo(() => new Set(visualizaciones.map(v => v.tipo).filter(Boolean)).size, [visualizaciones]);
  const kpiSensoresVinculados = useMemo(() => {
    const s = new Set();
    visualizaciones.forEach(v => (v.sensores || []).forEach(id => s.add(id)));
    return s.size;
  }, [visualizaciones]);

  // Drag habilitado solo si no hay filtros/búsqueda
  const dragEnabled = !q && !tipoFiltro && !sensorFiltro;

  // ---------- dnd ----------
  const handleDragEnd = async (event) => {
    if (!dragEnabled) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const current = visualizaciones.slice(); // lista completa sin filtros
    const oldIndex = current.findIndex((v) => v._id === active.id);
    const newIndex = current.findIndex((v) => v._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const nuevoOrden = arrayMove(current, oldIndex, newIndex);
    setVisualizaciones(nuevoOrden);

    try {
      const csrf = await getCsrfToken();
      for (let i = 0; i < nuevoOrden.length; i++) {
        await axiosInstance.put(
          `/visualizaciones/${nuevoOrden[i]._id}`,
          { orden: i },
          { headers: { 'x-csrf-token': csrf }, withCredentials: true }
        );
      }
    } catch (err) {
      console.error('❌ Error al actualizar orden:', err);
      toast.error('Error al actualizar orden de visualizaciones');
      fetchVisualizaciones();
    }
  };

  // ---------- modal ----------
  const abrirModal = () => { setVisualizacionEditando(null); setMostrarModal(true); };
  const editarVisualizacion = (vis) => { setVisualizacionEditando({ ...vis }); setMostrarModal(false); setTimeout(() => setMostrarModal(true), 60); };
  const cerrarModal = () => { setMostrarModal(false); setVisualizacionEditando(null); };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 bg-light-bg dark:bg-dark-bg rounded-xl transition-colors">
      {/* Header (título izq / volver der) */}
      <header className="space-y-3">
        <div className="flex items-start md:items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Visualización avanzada</h1>
          </div>
          <BackButton fallback={`/proyectos/${id}`} />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-2xl p-4 border bg-white/90 dark:bg-gray-900 border-light-border dark:border-dark-border shadow-sm">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Visualizaciones</div>
            <div className="text-2xl font-semibold mt-1">{visualizaciones.length}</div>
          </div>
          <div className="rounded-2xl p-4 border bg-white/90 dark:bg-gray-900 border-light-border dark:border-dark-border shadow-sm">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Tipos usados</div>
            <div className="text-2xl font-semibold mt-1">{kpiTipos}</div>
          </div>
          <div className="rounded-2xl p-4 border bg-white/90 dark:bg-gray-900 border-light-border dark:border-dark-border shadow-sm">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Sensores vinculados</div>
            <div className="text-2xl font-semibold mt-1">{kpiSensoresVinculados}</div>
          </div>
          <div className="rounded-2xl p-4 border bg-white/90 dark:bg-gray-900 border-light-border dark:border-dark-border shadow-sm">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Arrastrar para ordenar</div>
            <div className="mt-1 inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full border bg-gray-50 dark:bg-white/[0.04] border-light-border dark:border-dark-border">
              <GripVertical className="w-3.5 h-3.5" /> {dragEnabled ? 'Activo' : 'Deshabilitado por filtros'}
            </div>
          </div>
        </div>

        {/* Toolbar: búsqueda + filtros + CTA (md+: una línea) */}
        <div className="flex items-end gap-2 md:gap-3 lg:gap-4 flex-wrap md:flex-nowrap">
          {/* Búsqueda */}
          <div className="flex-1 min-w-[220px]">
            <label className="form-label">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filtrar por título o tipo…"
                className="form-input-md pl-9 pr-3"
                aria-label="Buscar visualizaciones"
              />
            </div>
          </div>

          {/* Filtro tipo */}
          <div className="w-[180px] shrink-0">
            <label className="form-label">Tipo</label>
            <div className="relative">
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                className="select-pro"
              >
                <option value="">Todos</option>
                {tiposDisponibles.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <SlidersHorizontal className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Filtro sensor */}
          <div className="w-[220px] shrink-0">
            <label className="form-label">Sensor</label>
            <div className="relative">
              <select
                value={sensorFiltro}
                onChange={(e) => setSensorFiltro(e.target.value)}
                className="select-pro"
              >
                <option value="">Todos</option>
                {sensores.map((s) => (
                  <option key={s._id} value={s._id}>{s.nombre}</option>
                ))}
              </select>
              <SlidersHorizontal className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Compact mode */}
          <div className="flex items-center gap-2 shrink-0">
            <label className="form-label mb-0">Vista</label>
            <Button
              size="sm"
              variant={compact ? 'secondary' : 'outline'}
              onClick={() => setCompact(v => !v)}
              className="whitespace-nowrap"
            >
              {compact ? 'Compacta' : 'Normal'}
            </Button>
          </div>

          {/* CTA */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <Button onClick={abrirModal} variant="success">
              <PlusCircle className="w-4 h-4 mr-2" />
              Nueva visualización
            </Button>
          </div>
        </div>
      </header>

      {/* Lista / Empty state */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 dark:bg-gray-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : visibles.length === 0 ? (
        <div className="rounded-2xl p-6 border bg-white/80 dark:bg-gray-900/80 border-light-border dark:border-dark-border">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Empieza a construir tu dashboard</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Crea visualizaciones personalizadas, arrástralas para reordenar y exporta cada gráfica como imagen desde su tarjeta.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button onClick={abrirModal} variant="success">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Crear la primera
                </Button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Consejo: usa los filtros de arriba para encontrar rápidamente lo que buscas.
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : dragEnabled ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
          <SortableContext items={visibles.map((v) => v._id)} strategy={verticalListSortingStrategy}>
            <div className={compact ? 'space-y-2' : 'space-y-4'}>
              {visibles.map((vis) => (
                <VisualizacionCard
                  key={vis._id}
                  visualizacion={vis}
                  sensores={sensores}
                  fetchAll={fetchVisualizaciones}
                  onEditar={() => editarVisualizacion(vis)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <>
          <div className="rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-gray-400 bg-white/60 dark:bg-white/[0.04] border border-light-border dark:border-dark-border">
            <GripVertical className="inline w-3.5 h-3.5 mr-1" />
            El arrastre para reordenar está deshabilitado mientras hay filtros o búsqueda activos.
            Limpia los filtros para reordenar.
          </div>
          <div className={compact ? 'mt-3 space-y-2' : 'mt-3 space-y-4'}>
            {visibles.map((vis) => (
              <VisualizacionCard
                key={vis._id}
                visualizacion={vis}
                sensores={sensores}
                fetchAll={fetchVisualizaciones}
                onEditar={() => editarVisualizacion(vis)}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal de creación/edición */}
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
