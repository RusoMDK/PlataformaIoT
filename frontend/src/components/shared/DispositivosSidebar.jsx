import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, AlertCircle, Plus, Cpu, Wrench, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function SidebarDispositivos({
  hover,
  onHoverChange,
  dispositivos,
  setDispositivos,
}) {
  const navigate = useNavigate();

  const fetchDispositivos = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:4000/api/dispositivos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDispositivos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error cargando dispositivos:', err);
      setDispositivos([]);
    }
  };

  useEffect(() => {
    fetchDispositivos();
    const id = setInterval(fetchDispositivos, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      id="sidebar-dispositivos"
      className={`fixed top-[64px] right-0 z-30 h-[calc(91.5vh-64px)] transition-all duration-300 ease-in-out ${
        hover ? 'w-64' : 'w-16'
      } group`}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <aside className="h-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-l border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
        {/* Cabecera */}
        <header className="flex items-center justify-between px-3 py-3 border-b border-gray-200 dark:border-gray-700">
          {hover ? (
            <h2 className="text-sm font-semibold whitespace-nowrap text-gray-700 dark:text-white">
              Dispositivos{' '}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({dispositivos.length})
              </span>
            </h2>
          ) : (
            <div className="relative flex items-center justify-center w-full">
              <Cpu size={18} className="text-gray-500 dark:text-gray-400" />
              {dispositivos.length > 0 && (
                <span className="absolute top-0.5 right-1.5 w-2.5 h-2.5 rounded-full bg-green-500 shadow-md animate-pulse"></span>
              )}
            </div>
          )}
        </header>

        {/* Lista de dispositivos */}
        <section className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-3">
          {dispositivos.length ? (
            dispositivos.map(d => {
              const online = Date.now() - new Date(d.ultimaConexion).getTime() < 10000;
              const file = (d.imagen || 'generic.png').split('/').pop();
              const imgSrc = `/images/conexion/${file}`;
              const sensoresConfigurados = Array.isArray(d.sensores) && d.sensores.length > 0;

              return (
                <div
                  key={d.uid}
                  onClick={() => navigate(`/configurar-dispositivo/${d.uid}`)}
                  className="relative flex items-center gap-3 p-3 rounded-lg border bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-700 cursor-pointer hover:ring-1 hover:ring-blue-400 transition"
                >
                  {/* Imagen */}
                  <img src={imgSrc} alt={d.nombre} className="w-11 h-11 object-contain shrink-0" />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-gray-800 dark:text-white">
                      {d.nombre}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {d.uid.slice(0, 8)}…
                    </p>
                  </div>

                  {/* Indicadores alineados */}
                  <div className="flex flex-col gap-1 items-center justify-center">
                    {online ? (
                      <BadgeCheck className="w-5 h-5 text-green-500" title="En línea" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" title="Offline" />
                    )}
                    {hover && (
                      <div
                        className={`p-1 rounded-full ${
                          sensoresConfigurados
                            ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}
                        title={
                          sensoresConfigurados
                            ? 'Sensores configurados'
                            : 'Aún sin sensores configurados'
                        }
                      >
                        {sensoresConfigurados ? <CheckCircle size={16} /> : <Wrench size={16} />}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
              Sin dispositivos.
            </p>
          )}

          {/* ➕ Botón de nuevo dispositivo */}
          {hover && (
            <div
              onClick={() => navigate('/nuevo-dispositivo')}
              className="flex items-center justify-center h-[64px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-100/40 dark:hover:bg-blue-600/20 transition"
            >
              <Plus size={20} className="text-gray-500 dark:text-gray-300" />
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}
