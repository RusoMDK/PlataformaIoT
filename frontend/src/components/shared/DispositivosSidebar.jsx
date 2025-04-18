import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, AlertCircle, Plus, Cpu } from 'lucide-react';
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
      className={`fixed top-[80px] bottom-[60px] right-0 z-40 transition-all duration-300 ease-in-out ${
        hover ? 'w-64' : 'w-16'
      } group`}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <aside className="h-full bg-white/90 dark:bg-darkSurface/90 backdrop-blur-md border-l border-gray-200 dark:border-gray-700 flex flex-col relative">
        {/* Cabecera */}
        <header className="flex items-center justify-between px-3 py-3 border-b border-gray-200 dark:border-gray-700">
          {hover ? (
            <h2 className="text-sm font-semibold whitespace-nowrap">
              Dispositivos <span className="text-xs text-gray-500">({dispositivos.length})</span>
            </h2>
          ) : (
            <div className="relative flex items-center justify-center w-full">
              <Cpu size={18} className="text-gray-500" />
              {dispositivos.length > 0 && (
                <span className="absolute top-0.5 right-1.5 w-2.5 h-2.5 rounded-full bg-green-500 shadow-md animate-pulse"></span>
              )}
            </div>
          )}
        </header>

        {/* Lista de dispositivos */}
        <section className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-3">
          {dispositivos.length ? (
            dispositivos.map((d) => {
              const online = Date.now() - new Date(d.ultimaConexion).getTime() < 10000;
              const file = (d.imagen || 'generic.png').split('/').pop();
              const imgSrc = `/images/conexion/${file}`;

              return (
                <div
                  key={d.uid}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50 dark:bg-neutral-800"
                >
                  <img src={imgSrc} alt={d.nombre} className="w-11 h-11 object-contain shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{d.nombre}</p>
                    <p className="text-xs text-gray-500 truncate">{d.uid.slice(0, 8)}…</p>
                  </div>
                  {online ? (
                    <BadgeCheck className="w-5 h-5 text-green-500 shrink-0" title="En línea" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" title="Offline" />
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-center text-xs text-gray-500 mt-4">Sin dispositivos.</p>
          )}

          {/* ➕ Botón de nuevo dispositivo al final */}
          {hover && (
            <div
              onClick={() => navigate('/nuevo-dispositivo')}
              className="flex items-center justify-center h-[64px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:border-darkAccent/60 dark:hover:bg-darkMuted transition"
            >
              <Plus size={20} className="text-gray-500 dark:text-gray-300" />
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}