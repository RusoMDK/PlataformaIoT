import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import { PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Proyectos() {
  const { t } = useTranslation();
  const [proyectos, setProyectos] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const csrfToken = localStorage.getItem('csrfToken');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-csrf-token': csrfToken,
    },
  };

  useEffect(() => {
    document.title = 'IoT Platform | ' + t('proyectos.titulo');

    const fetchProyectos = async () => {
      try {
        const res = await axios.get('/api/proyectos', config);

        if (Array.isArray(res.data)) {
          setProyectos(res.data);
        } else {
          console.warn('⚠️ El backend no devolvió un array:', res.data);
          setProyectos([]);
        }
      } catch (err) {
        console.error('❌ Error al cargar proyectos:', err);
        setError('Ocurrió un error al cargar los proyectos.');
        toast.error('❌ Error al cargar los proyectos');
      }
    };

    fetchProyectos();
  }, [t]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {t('proyectos.titulo')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('proyectos.descripcion')}</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/nuevo-dispositivo')}>
            <PlusCircle size={16} className="mr-2" />
            {t('proyectos.nuevoDispositivo')}
          </Button>
          <Button onClick={() => navigate('/things/nuevo')}>
            <PlusCircle size={16} className="mr-2" />
            {t('proyectos.crearThing')}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 dark:text-red-400">{error}</p>}

      {/* Proyectos */}
      {Array.isArray(proyectos) && proyectos.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {proyectos.map((proyecto, index) => (
            <Link key={proyecto._id || index} to={`/proyectos/${proyecto._id}`}>
              <div className="group rounded-2xl p-5 border bg-white/90 dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-primary dark:group-hover:text-darkAccent transition">
                      {proyecto.nombre}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">
                      {proyecto.descripcion || t('proyectos.sinDescripcion')}
                    </p>
                  </div>
                  <p className="text-xs mt-4 text-gray-400 dark:text-gray-500">
                    ID: {proyecto._id ? proyecto._id.slice(0, 8) : 'N/A'}…
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">{t('proyectos.sinProyectos')}</p>
          <p className="text-sm">{t('proyectos.instruccion')}</p>
        </div>
      )}
    </div>
  );
}
