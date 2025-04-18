import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../../components/ui/Button';
import Wizard from '../dispositivos/Wizard';
import { PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Proyectos() {
  const { t } = useTranslation();
  const [proyectos, setProyectos] = useState([]);
  const [mostrarWizard, setMostrarWizard] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const res = await axios.get('/api/proyectos', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setProyectos(res.data);
      } catch (err) {
        console.error('❌ Error al cargar proyectos:', err);
      }
    };

    fetchProyectos();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
            {t('proyectos.titulo')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('proyectos.descripcion')}</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setMostrarWizard(true)}>
            <PlusCircle size={16} className="mr-2" />
            {t('proyectos.nuevoDispositivo')}
          </Button>
          <Button onClick={() => navigate('/things/nuevo')}>
            <PlusCircle size={16} className="mr-2" />
            {t('proyectos.crearThing')}
          </Button>
        </div>
      </div>

      {proyectos.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">{t('proyectos.sinProyectos')}</p>
          <p className="text-sm">{t('proyectos.instruccion')}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {proyectos.map(proyecto => (
            <Link key={proyecto._id} to={`/proyectos/${proyecto._id}`}>
              <div className="group border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-darkSurface hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-primary transition">
                      {proyecto.nombre}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-3">
                      {proyecto.descripcion || t('proyectos.sinDescripcion')}
                    </p>
                  </div>
                  <p className="text-xs mt-4 text-gray-400 dark:text-gray-500">
                    ID: {proyecto._id.slice(0, 8)}…
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 🧙 Wizard de nuevo dispositivo */}
      {mostrarWizard && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-darkBg p-4 overflow-y-auto">
          <div className="flex justify-end">
            <button
              onClick={() => setMostrarWizard(false)}
              className="text-gray-500 dark:text-gray-300 hover:text-red-500 transition text-sm"
            >
              {t('proyectos.cerrar')}
            </button>
          </div>
          <Wizard
            onFinish={() => {
              setMostrarWizard(false);
              window.location.reload();
            }}
          />
        </div>
      )}
    </div>
  );
}
