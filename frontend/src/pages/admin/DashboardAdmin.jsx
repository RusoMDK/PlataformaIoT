import { useEffect, useState, Fragment, useMemo } from 'react';
import axios from 'axios';
import TablaPro from '../../components/ui/TablaPro';
import Card from '../../components/ui/Card';
import { useTranslation } from 'react-i18next';
import { Users, Folder, Activity, AlertTriangle, ChevronDown } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { getCsrfToken } from '../../api/auth.api'; // 🔥 Importamos función para pedir CSRF

export default function DashboardAdmin() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [error, setError] = useState(null);
  const [openRol, setOpenRol] = useState(null);
  const [csrfToken, setCsrfToken] = useState(''); // 🔥 Estado CSRF

  const token = localStorage.getItem('token');
  const config = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
        'x-csrf-token': csrfToken,
      },
    }),
    [token, csrfToken]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const csrf = await getCsrfToken();
        setCsrfToken(csrf);

        const [resStats, resUsuarios] = await Promise.all([
          axios.get('/api/admin/estadisticas', config),
          axios.get('/api/admin/usuarios', config),
        ]);
        setStats(resStats.data);
        setUsuarios(Array.isArray(resUsuarios.data) ? resUsuarios.data : []);
      } catch (err) {
        console.error('❌ Error al obtener datos:', err);
        setError('Error al cargar el dashboard de administración.');
      }
    };
    fetchData();
  }, [token, csrfToken]);

  const cambiarRol = async (id, nuevoRol) => {
    try {
      setOpenRol(id);
      await axios.put(`/api/admin/usuarios/${id}/rol`, { rol: nuevoRol }, config);
      setUsuarios(prev => prev.map(u => (u._id === id ? { ...u, rol: nuevoRol } : u)));
    } catch (err) {
      console.error('❌ Error al cambiar rol:', err);
    } finally {
      setOpenRol(null);
    }
  };

  const eliminarSeleccionados = async () => {
    if (!window.confirm(t('admin.confirmarEliminacion'))) return;
    try {
      await Promise.all(seleccionados.map(id => axios.delete(`/api/admin/usuarios/${id}`, config)));
      setUsuarios(prev => prev.filter(u => !seleccionados.includes(u._id)));
      setSeleccionados([]);
    } catch (err) {
      console.error('❌ Error al eliminar usuarios:', err);
    }
  };

  const columnas = [
    { campo: 'nombre', label: t('admin.nombre') },
    { campo: 'email', label: t('admin.email') },
    {
      campo: 'rol',
      label: t('admin.rol'),
      render: fila => (
        <Menu as="div" className="relative inline-block text-left w-32">
          <>
            <Menu.Button className="inline-flex justify-between items-center w-full rounded border px-3 py-1 text-sm bg-white text-gray-800 border-gray-300 hover:bg-gray-50 dark:bg-dark-surface dark:text-white dark:border-dark-border dark:hover:bg-dark-muted transition">
              {fila.rol === 'admin' ? t('admin.admin') : t('admin.usuario')}
              <ChevronDown
                size={14}
                className={`ml-1 transition-transform duration-200 ${
                  openRol === fila._id ? 'animate-spin' : ''
                } text-gray-500 dark:text-gray-400`}
              />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute z-50 mt-1 w-full origin-top-right rounded-md bg-white dark:bg-dark-surface shadow-lg ring-1 ring-black/10 focus:outline-none">
                {[
                  { value: 'usuario', label: t('admin.usuario') },
                  { value: 'admin', label: t('admin.admin') },
                ].map(opt => (
                  <Menu.Item key={opt.value}>
                    {({ active }) => (
                      <button
                        onClick={() => cambiarRol(fila._id, opt.value)}
                        className={`w-full px-3 py-2 text-sm text-left transition ${
                          active
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-white'
                            : 'text-gray-700 dark:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </>
        </Menu>
      ),
    },
    {
      campo: 'activo',
      label: t('admin.estado'),
      render: fila =>
        typeof fila.activo !== 'undefined' && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              fila.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {fila.activo ? t('admin.activo') : t('admin.inactivo')}
          </span>
        ),
    },
  ];

  const acciones = [
    {
      label: t('admin.activarDesactivar'),
      onClick: async fila => {
        try {
          const res = await axios.patch(`/api/admin/usuarios/${fila._id}/estado`, {}, config);
          setUsuarios(prev =>
            prev.map(u => (u._id === fila._id ? { ...u, activo: res.data.activo } : u))
          );
        } catch (err) {
          console.error('❌ Error al cambiar estado:', err);
        }
      },
    },
    {
      label: t('admin.eliminar'),
      variant: 'danger',
      onClick: async fila => {
        if (!window.confirm(t('admin.confirmarEliminarUsuario'))) return;
        try {
          await axios.delete(`/api/admin/usuarios/${fila._id}`, config);
          setUsuarios(prev => prev.filter(u => u._id !== fila._id));
        } catch (err) {
          console.error('❌ Error al eliminar usuario:', err);
        }
      },
    },
  ];

  const resumenes = [
    {
      label: t('admin.usuarios'),
      value: stats?.totalUsuarios || 0,
      icon: <Users size={18} />,
      grad: 'from-blue-500 to-blue-700',
    },
    {
      label: t('admin.proyectos'),
      value: stats?.totalProyectos || 0,
      icon: <Folder size={18} />,
      grad: 'from-purple-500 to-purple-700',
    },
    {
      label: t('admin.sensores'),
      value: stats?.totalSensores || 0,
      icon: <Activity size={18} />,
      grad: 'from-green-500 to-green-700',
    },
    {
      label: t('admin.alertas'),
      value: stats?.totalAlertas || 0,
      icon: <AlertTriangle size={18} />,
      grad: 'from-red-500 to-red-700',
    },
  ];

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📊 {t('admin.titulo')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.descripcion')}</p>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {resumenes.map((item, i) => (
            <div
              key={i}
              className={`bg-gradient-to-r ${item.grad} text-white rounded-lg p-4 flex flex-col justify-between hover:shadow-md transition`}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                {item.icon}
                {item.label}
              </div>
              <div className="text-2xl font-semibold">{item.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="min-h-[400px] transition-all duration-300">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          👥 {t('admin.usuariosRegistrados')}
        </h2>
        <TablaPro
          columnas={columnas}
          datos={usuarios}
          acciones={acciones}
          seleccionados={seleccionados}
          setSeleccionados={setSeleccionados}
          onEliminarSeleccionados={eliminarSeleccionados}
        />
      </div>
    </div>
  );
}
