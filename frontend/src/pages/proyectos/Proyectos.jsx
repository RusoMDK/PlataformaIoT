// src/pages/proyectos/Proyectos.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '@/api/axiosInstance';
import { getCsrfToken } from '@/api/auth.api';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import { PlusCircle, Search, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export default function Proyectos() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchProyectos = async () => {
    setRefreshing(true);
    try {
      const csrf = await getCsrfToken();
      const { data } = await axiosInstance.get('/proyectos', {
        headers: { 'x-csrf-token': csrf },
        withCredentials: true,
      });
      setProyectos(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('❌ Error al cargar proyectos:', err);
      setError('Ocurrió un error al cargar los proyectos.');
      toast.error('❌ Error al cargar los proyectos');
      setProyectos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    document.title = 'IoT Platform | ' + t('proyectos.titulo');
    fetchProyectos();
  }, [t]);

  // Refrescar lista cuando haya cambios desde modales
  useEffect(() => {
    const handler = () => fetchProyectos();
    window.addEventListener('reload-proyectos', handler);
    return () => window.removeEventListener('reload-proyectos', handler);
  }, []);

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return proyectos;
    return proyectos.filter((p) =>
      [p.nombre, p.descripcion, p._id].some((x) => (x || '').toLowerCase().includes(term))
    );
  }, [proyectos, q]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 transition-colors duration-300">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {t('proyectos.titulo')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('proyectos.descripcion')}
          </p>
        </div>
        <BackButton fallback="/" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Buscador ancho */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, descripción o ID…"
            className="form-input-md pl-9 pr-3 w-full"
            aria-label="Buscar proyectos"
          />
        </div>

        {/* Actualizar */}
        <Button variant="secondary" onClick={fetchProyectos} disabled={refreshing}>
          <RefreshCcw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>

        {/* Contador */}
        <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {filtrados.length} de {proyectos.length}
        </div>

        {/* Acciones al extremo derecho */}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => navigate('/nuevo-dispositivo')}>
            <PlusCircle size={16} className="mr-2" />
            {t('proyectos.nuevoDispositivo')}
          </Button>

          {/* Abrir NUEVO Thing como modal (ruta anidada) */}
          <Button onClick={() => navigate('/proyectos/nuevo')}>
            <PlusCircle size={16} className="mr-2" />
            {t('proyectos.crearThing')}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 dark:text-red-400">{error}</p>}

      {/* Skeleton */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 border bg-white/60 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700 animate-pulse h-40"
            />
          ))}
        </div>
      )}

      {/* Lista */}
      {!loading && Array.isArray(filtrados) && filtrados.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrados.map((proyecto, index) => (
            <div
              key={proyecto._id || index}
              className="group rounded-2xl p-5 border bg-white/90 dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <div className="flex flex-col justify-between h-full">
                <div>
                  <Link to={`/proyectos/${proyecto._id}`} className="no-underline">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-primary dark:group-hover:text-darkAccent transition">
                      {proyecto.nombre}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">
                    {proyecto.descripcion || t('proyectos.sinDescripcion')}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    ID: {proyecto._id ? proyecto._id.slice(0, 8) : 'N/A'}…
                  </p>
                  <div className="flex gap-2">
                    <Link to={`/proyectos/${proyecto._id}`}>
                      <Button size="sm">Ver</Button>
                    </Link>

                    {/* Abrir EDITAR como modal: ruta anidada */}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/proyectos/${proyecto._id}/editar-thing`)}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">{t('proyectos.sinProyectos')}</p>
          <p className="text-sm">{t('proyectos.instruccion')}</p>
        </div>
      ) : null}
    </div>
  );
}
