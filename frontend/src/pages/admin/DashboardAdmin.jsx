// src/pages/admin/DashboardAdmin.jsx
import { useEffect, useState, Fragment, useMemo } from 'react';
import axios from 'axios';
import TablaPro from '../../components/ui/TablaPro';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Folder,
  Activity,
  AlertTriangle,
  ChevronDown,
  Shield,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Download,
  Plus,
  Mail,
  Trash2,
} from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { getCsrfToken } from '../../api/auth.api';
import useConfirmDialog from '../../hooks/useConfirmDialog';

/* util */
const cls = (...p) => p.filter(Boolean).join(' ');

/* Skeletons sobrios */
function KPICardSkeleton() {
  return (
    <div className="rounded-2xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.05] p-4">
      <div className="h-4 w-24 bg-black/10 dark:bg-white/10 rounded mb-3" />
      <div className="h-7 w-20 bg-black/10 dark:bg-white/10 rounded" />
    </div>
  );
}
function ToolbarSkeleton() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="h-9 w-[320px] bg-black/5 dark:bg-white/10 rounded-xl" />
      <div className="flex items-center gap-2">
        <div className="h-9 w-28 bg-black/5 dark:bg-white/10 rounded-xl" />
        <div className="h-9 w-28 bg-black/5 dark:bg-white/10 rounded-xl" />
      </div>
    </div>
  );
}

/* ===== Dropdowns tipo TablaPro (con chevrón 180°) ===== */
function RoleFilter({ value, onChange, t }) {
  const options = [
    { value: '', label: t('admin.todosLosRoles', { defaultValue: 'Todos los roles' }) },
    { value: 'admin', label: t('admin.admin', { defaultValue: 'Admin' }) },
    { value: 'usuario', label: t('admin.usuario', { defaultValue: 'Usuario' }) },
  ];
  const current = options.find(o => o.value === value) || options[0];

  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <Menu.Button
            className={cls(
              'inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm',
              'bg-white dark:bg-[#0b0f1a] border-light-border dark:border-dark-border',
              'hover:bg-black/5 dark:hover:bg-white/10 transition'
            )}
          >
            <Filter className="w-4 h-4 opacity-70" />
            <span className="truncate max-w-[10rem]">{current.label}</span>
            <ChevronDown size={14} className={cls('transition-transform', open && 'rotate-180')} />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-50 mt-1 w-56 origin-top-right rounded-xl bg-white dark:bg-[#0b0f1a] shadow ring-1 ring-black/10 dark:ring-white/10 overflow-hidden">
              {options.map(opt => (
                <Menu.Item key={opt.value}>
                  {({ active }) => (
                    <button
                      onClick={() => onChange(opt.value)}
                      className={cls(
                        'w-full px-3 py-2 text-sm text-left transition',
                        active ? 'bg-primary/10 dark:bg-primary/20' : ''
                      )}
                    >
                      {opt.label}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}

function StatusFilter({ value, onChange, t }) {
  const options = [
    { value: '', label: t('admin.todosLosEstados', { defaultValue: 'Todos los estados' }) },
    { value: 'activos', label: t('admin.activos', { defaultValue: 'Activos' }) },
    { value: 'inactivos', label: t('admin.inactivos', { defaultValue: 'Inactivos' }) },
  ];
  const current = options.find(o => o.value === value) || options[0];

  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <Menu.Button
            className={cls(
              'inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm',
              'bg-white dark:bg-[#0b0f1a] border-light-border dark:border-dark-border',
              'hover:bg-black/5 dark:hover:bg-white/10 transition'
            )}
          >
            <Filter className="w-4 h-4 opacity-70" />
            <span className="truncate max-w-[10rem]">{current.label}</span>
            <ChevronDown size={14} className={cls('transition-transform', open && 'rotate-180')} />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-50 mt-1 w-56 origin-top-right rounded-xl bg-white dark:bg-[#0b0f1a] shadow ring-1 ring-black/10 dark:ring-white/10 overflow-hidden">
              {options.map(opt => (
                <Menu.Item key={opt.value}>
                  {({ active }) => (
                    <button
                      onClick={() => onChange(opt.value)}
                      className={cls(
                        'w-full px-3 py-2 text-sm text-left transition',
                        active ? 'bg-primary/10 dark:bg-primary/20' : ''
                      )}
                    >
                      {opt.label}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}

export default function DashboardAdmin() {
  const { t } = useTranslation();
  const { confirmDelete } = useConfirmDialog();

  // ===== estado =====
  const [stats, setStats] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [error, setError] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [loading, setLoading] = useState(true);

  // filtros cliente (UI)
  const [q, setQ] = useState('');
  const [rolFilter, setRolFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // ===== carga inicial con CSRF =====
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const csrf = await getCsrfToken();
        setCsrfToken(csrf);

        const cfg = {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-csrf-token': csrf,
          },
        };

        const [resStats, resUsuarios] = await Promise.all([
          axios.get('/api/admin/estadisticas', cfg),
          axios.get('/api/admin/usuarios', cfg),
        ]);

        setStats(resStats.data);
        setUsuarios(Array.isArray(resUsuarios.data) ? resUsuarios.data : []);
        setError(null);
      } catch (err) {
        console.error('❌ Error al obtener datos:', err);
        setError('No se pudo cargar el panel de administración.');
        setStats(null);
        setUsuarios([]);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const cfgAuth = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
        'x-csrf-token': csrfToken,
      },
    }),
    [token, csrfToken]
  );

  // ===== acciones =====
  const cambiarRol = async (id, nuevoRol) => {
    try {
      await axios.put(`/api/admin/usuarios/${id}/rol`, { rol: nuevoRol }, cfgAuth);
      setUsuarios(prev => prev.map(u => (u._id === id ? { ...u, rol: nuevoRol } : u)));
    } catch (err) {
      console.error('❌ Error al cambiar rol:', err);
    }
  };

  const eliminarSeleccionados = async () => {
    if (!seleccionados.length) return;

    const ok = await confirmDelete({
      title: t('admin.confirmarEliminacionTitulo', { defaultValue: 'Eliminar usuarios' }),
      message: t('admin.confirmarEliminacion', { defaultValue: '¿Estás seguro que deseas eliminar los usuarios seleccionados?' }),
      confirmText: t('common.eliminar', { defaultValue: 'Eliminar' }),
      cancelText: t('common.cancelar', { defaultValue: 'Cancelar' }),
      tone: 'danger',
    });
    if (!ok) return;

    try {
      await Promise.all(seleccionados.map(id => axios.delete(`/api/admin/usuarios/${id}`, cfgAuth)));
      setUsuarios(prev => prev.filter(u => !seleccionados.includes(u._id)));
      setSeleccionados([]);
    } catch (err) {
      console.error('❌ Error al eliminar usuarios:', err);
    }
  };

  const eliminarUno = async (fila) => {
    const ok = await confirmDelete({
      title: t('admin.confirmarEliminarUsuarioTitulo', { defaultValue: 'Eliminar usuario' }),
      message:
        t('admin.confirmarEliminarUsuario', {
          defaultValue: `¿Eliminar el usuario ${fila?.nombre || fila?.email || ''}? Esta acción no se puede deshacer.`,
        }),
      confirmText: t('common.eliminar', { defaultValue: 'Eliminar' }),
      cancelText: t('common.cancelar', { defaultValue: 'Cancelar' }),
      tone: 'danger',
    });
    if (!ok) return;

    try {
      await axios.delete(`/api/admin/usuarios/${fila._id}`, cfgAuth);
      setUsuarios(prev => prev.filter(u => u._id !== fila._id));
    } catch (err) {
      console.error('❌ Error al eliminar usuario:', err);
    }
  };

  const toggleActivo = async fila => {
    try {
      const res = await axios.patch(`/api/admin/usuarios/${fila._id}/estado`, {}, cfgAuth);
      setUsuarios(prev => prev.map(u => (u._id === fila._id ? { ...u, activo: res.data.activo } : u)));
    } catch (err) {
      console.error('❌ Error al cambiar estado:', err);
    }
  };

  // ===== filtros cliente =====
  const filteredUsers = useMemo(() => {
    let data = usuarios;
    const needle = q.trim().toLowerCase();

    if (needle) {
      data = data.filter(u =>
        String(u.nombre || '').toLowerCase().includes(needle) ||
        String(u.email || '').toLowerCase().includes(needle)
      );
    }
    if (rolFilter) {
      data = data.filter(u => String(u.rol || '').toLowerCase() === rolFilter);
    }
    if (estadoFilter === 'activos') data = data.filter(u => !!u.activo);
    if (estadoFilter === 'inactivos') data = data.filter(u => !u.activo);
    return data;
  }, [usuarios, q, rolFilter, estadoFilter]);

  // ===== columnas tabla =====
  const columnas = [
    {
      campo: 'nombre',
      label: t('admin.nombre', { defaultValue: 'Nombre' }),
      ancho: 'min-w-[260px]',
      sortable: true,
      render: fila => {
        const inicial = (fila?.nombre || fila?.email || '?').slice(0, 1).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full grid place-items-center bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-200 font-semibold">
              {inicial}
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-gray-900 dark:text-gray-100">
                {fila?.nombre || '—'}
              </span>
              <span className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400">
                <Mail size={12} className="opacity-70" />
                <a href={`mailto:${fila?.email || ''}`} className="hover:underline">
                  {fila?.email || '—'}
                </a>
              </span>
            </div>
          </div>
        );
      },
    },
    {
      campo: 'rol',
      label: t('admin.rol', { defaultValue: 'Rol' }),
      ancho: 'w-[160px]',
      sortable: true,
      render: fila => (
        <Menu as="div" className="relative inline-block text-left w-[140px]">
          <>
            <Menu.Button
              className={cls(
                'inline-flex justify-between items-center w-full rounded-lg border px-3 py-1.5 text-sm',
                'bg-white dark:bg-[#0b0f1a] text-gray-800 dark:text-gray-100',
                'border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/10 transition'
              )}
            >
              <span className="inline-flex items-center gap-1">
                {String(fila?.rol).toLowerCase() === 'admin' ? <ShieldCheck size={14} /> : <Shield size={14} />}
                {String(fila?.rol || 'usuario').toLowerCase() === 'admin'
                  ? t('admin.admin', { defaultValue: 'Admin' })
                  : t('admin.usuario', { defaultValue: 'Usuario' })}
              </span>
              <ChevronDown size={14} className="chev opacity-60" />
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
              <Menu.Items className="absolute right-0 z-50 mt-1 w-[180px] origin-top-right rounded-xl bg-white dark:bg-[#0b0f1a] shadow ring-1 ring-black/10 dark:ring-white/10 overflow-hidden">
                {[
                  { value: 'usuario', label: t('admin.usuario', { defaultValue: 'Usuario' }) },
                  { value: 'admin', label: t('admin.admin', { defaultValue: 'Admin' }) },
                ].map(opt => (
                  <Menu.Item key={opt.value}>
                    {({ active }) => (
                      <button
                        onClick={() => cambiarRol(fila._id, opt.value)}
                        className={cls(
                          'w-full px-3 py-2 text-sm text-left transition',
                          active ? 'bg-primary/10 dark:bg-primary/20' : ''
                        )}
                      >
                        <span className="inline-flex items-center gap-2">
                          {opt.value === 'admin' ? <ShieldCheck size={14} /> : <Shield size={14} />}
                          {opt.label}
                        </span>
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
      label: t('admin.estado', { defaultValue: 'Estado' }),
      ancho: 'w-[160px]',
      sortable: true,
      render: fila => (
        <span
          className={cls(
            'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ring-1 ring-inset',
            fila.activo
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-white/10 dark:text-emerald-300 dark:ring-emerald-400/20'
              : 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-white/10 dark:text-red-300 dark:ring-red-400/20'
          )}
        >
          <span className={cls('h-1.5 w-1.5 rounded-full', fila.activo ? 'bg-emerald-500' : 'bg-red-500')} />
          {fila.activo
            ? t('admin.activo', { defaultValue: 'Activo' })
            : t('admin.inactivo', { defaultValue: 'Inactivo' })}
        </span>
      ),
    },
    {
      campo: 'creado',
      label: t('admin.creado', { defaultValue: 'Creado' }),
      ancho: 'min-w-[160px]',
      sortable: true,
      render: fila => {
        const dt = fila?.createdAt || fila?.creado || fila?.fechaAlta;
        return dt ? new Date(dt).toLocaleString() : '—';
      },
    },
    // ==== Acciones compactas (centro): switch + icono eliminar
    {
      campo: '__acciones',
      label: t('common.acciones', { defaultValue: 'Acciones' }),
      ancho: 'w-[140px]',
      sortable: false,
      render: (fila) => (
        <div className="flex items-center justify-center gap-2">
          {/* Switch elegante */}
          <button
            onClick={() => toggleActivo(fila)}
            className={cls(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
              fila.activo
                ? 'bg-emerald-500/70 hover:bg-emerald-500'
                : 'bg-gray-300 hover:bg-gray-400 dark:bg-white/15 dark:hover:bg-white/25'
            )}
            role="switch"
            aria-checked={!!fila.activo}
            title={fila.activo ? t('admin.desactivar', { defaultValue: 'Desactivar' }) : t('admin.activar', { defaultValue: 'Activar' })}
          >
            <span
              className={cls(
                'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                fila.activo ? 'translate-x-5' : 'translate-x-1'
              )}
            />
          </button>

          {/* Eliminar (icon-only) */}
          <button
            onClick={() => eliminarUno(fila)}
            className={cls(
              'inline-flex items-center justify-center rounded-md p-2 transition',
              'border border-red-200/60 hover:bg-red-50 text-red-600',
              'dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-400/10'
            )}
            title={t('admin.eliminar', { defaultValue: 'Eliminar' })}
            aria-label={t('admin.eliminar', { defaultValue: 'Eliminar' })}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // ===== export CSV (de lo filtrado) — botón vive en el header del módulo =====
  const exportCSV = () => {
    const headers = ['Nombre', 'Email', 'Rol', 'Estado', 'Creado'];
    const lines = [headers.join(',')];
    filteredUsers.forEach(u => {
      const row = [
        u.nombre || '',
        u.email || '',
        String(u.rol || ''),
        u.activo ? 'activo' : 'inactivo',
        u.createdAt ? new Date(u.createdAt).toISOString() : '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`);
      lines.push(row.join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `usuarios-${new Date().toISOString().slice(0, 10)}.csv`,
    });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // ===== tarjetas KPI =====
  const resumenes = [
    { label: t('admin.usuarios', { defaultValue: 'Usuarios' }),  value: stats?.totalUsuarios  ?? 0, icon: <Users size={16} /> },
    { label: t('admin.proyectos', { defaultValue: 'Proyectos' }), value: stats?.totalProyectos ?? 0, icon: <Folder size={16} /> },
    { label: t('admin.sensores', { defaultValue: 'Sensores' }),  value: stats?.totalSensores  ?? 0, icon: <Activity size={16} /> },
    { label: t('admin.alertas', { defaultValue: 'Alertas' }),    value: stats?.totalAlertas   ?? 0, icon: <AlertTriangle size={16} /> },
  ];

  // ===== estilos fila =====
  const getRowClassName = fila => (!fila.activo ? 'ring-1 ring-red-100 dark:ring-red-900/30' : '');

  return (
    <div className="relative min-h:[calc(100vh-var(--header-h,80px))] sm:min-h-[calc(100vh-var(--header-h,80px))]">
      {/* Fondo neutro sutil */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-black/[0.03] dark:bg-white/[0.04] blur-2xl" />
        <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-black/[0.03] dark:bg-white/[0.04] blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
        {/* Header + acciones primarias */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
              {t('admin.titulo', { defaultValue: 'Panel de administración' })}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('admin.descripcion', { defaultValue: 'Control centralizado de usuarios y recursos.' })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm bg-white dark:bg-[#0b0f1a] border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/10 transition"
              onClick={() => window.location.reload()}
              title={t('admin.refrescar', { defaultValue: 'Refrescar' })}
            >
              <RefreshCw size={16} /> {t('admin.refrescar', { defaultValue: 'Refrescar' })}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white bg-primary hover:bg-primary-hover transition"
              onClick={() => alert('TODO: Crear usuario')}
              title={t('admin.crearUsuario', { defaultValue: 'Crear usuario' })}
            >
              <Plus size={16} /> {t('admin.crearUsuario', { defaultValue: 'Crear usuario' })}
            </button>
          </div>
        </header>

        {/* KPIs */}
        {error ? null : (
          <section>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {resumenes.map((kpi, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.05] p-4"
                  >
                    <div className="flex items-center gap-2 text-[12px] text-gray-600 dark:text-gray-400">
                      {kpi.icon}
                      <span>{kpi.label}</span>
                    </div>
                    <div className="text-[28px] font-semibold mt-1 text-gray-900 dark:text-gray-100 leading-tight">
                      {kpi.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tabla de usuarios */}
        <section className="space-y-4">
          {/* Título */}
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {t('admin.usuariosRegistrados', { defaultValue: 'Usuarios registrados' })}
          </h2>

          {/* 🔎 Header de filtros/búsqueda/CSV con Menús tipo TablaPro */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Buscar */}
            <div className="flex-1 min-w-[260px] flex items-center gap-2 rounded-lg border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.04] px-3 py-1.5">
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('admin.buscarUsuario', { defaultValue: 'Buscar por nombre o email...' })}
                className="bg-transparent outline-none text-sm w-full placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Filtro Rol (dropdown) */}
            <RoleFilter value={rolFilter} onChange={setRolFilter} t={t} />

            {/* Filtro Estado (dropdown) */}
            <StatusFilter value={estadoFilter} onChange={setEstadoFilter} t={t} />

            {/* CSV */}
            <button
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm bg-white dark:bg-[#0b0f1a] border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/10 transition"
              onClick={exportCSV}
              title="Exportar CSV"
            >
              <Download size={16} /> CSV
            </button>

            {(q || rolFilter || estadoFilter) && (
              <button
                onClick={() => { setQ(''); setRolFilter(''); setEstadoFilter(''); }}
                className="text-xs underline text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-1"
              >
                {t('admin.limpiar', { defaultValue: 'Limpiar filtros' })}
              </button>
            )}
          </div>

          {/* Toolbar superior coherente (skeleton) */}
          {loading && <ToolbarSkeleton />}

          {/* Tabla — toolbar derecha: Page size → Densidad → Columnas (sin Refrescar aquí) */}
          <div
            className={cls(
              'rounded-2xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.05] p-3',
              loading ? 'opacity-60 pointer-events-none' : ''
            )}
          >
            <TablaPro
              id="admin-users"
              columnas={columnas}
              datos={filteredUsers}
              /* ¡OJO! No pasamos `acciones` para evitar header duplicado de acciones */
              accionesLabel={t('common.acciones', { defaultValue: 'Acciones' })}
              onEliminarSeleccionados={eliminarSeleccionados}
              seleccionados={seleccionados}
              setSeleccionados={setSeleccionados}
              rowKey="_id"
              initialDensity="comfortable"
              hideToolbarSearch
              getRowClassName={getRowClassName}
              expandible
              renderExpand={(fila) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold mb-1">{t('admin.perfil', { defaultValue: 'Perfil' })}</div>
                    <div className="text-xs grid grid-cols-2 gap-y-1">
                      <span className="opacity-70">ID:</span>
                      <span className="truncate">{fila?._id}</span>
                      <span className="opacity-70">{t('admin.nombre', { defaultValue: 'Nombre' })}:</span>
                      <span>{fila?.nombre || '—'}</span>
                      <span className="opacity-70">Email:</span>
                      <span className="truncate">{fila?.email || '—'}</span>
                      <span className="opacity-70">{t('admin.rol', { defaultValue: 'Rol' })}:</span>
                      <span>{fila?.rol || 'usuario'}</span>
                      <span className="opacity-70">{t('admin.estado', { defaultValue: 'Estado' })}:</span>
                      <span>{fila?.activo ? t('admin.activo', { defaultValue: 'Activo' }) : t('admin.inactivo', { defaultValue: 'Inactivo' })}</span>
                      <span className="opacity-70">{t('admin.creado', { defaultValue: 'Creado' })}:</span>
                      <span>{fila?.createdAt ? new Date(fila.createdAt).toLocaleString() : '—'}</span>
                      <span className="opacity-70">{t('admin.ultimoAcceso', { defaultValue: 'Último acceso' })}:</span>
                      <span>{fila?.lastLogin ? new Date(fila.lastLogin).toLocaleString() : '—'}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-1">{t('admin.accionesRapidas', { defaultValue: 'Acciones rápidas' })}</div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button
                        className="inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 bg-white dark:bg-[#0b0f1a] border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/10 transition"
                        onClick={() => toggleActivo(fila)}
                      >
                        {fila.activo ? t('admin.desactivar', { defaultValue: 'Desactivar' }) : t('admin.activar', { defaultValue: 'Activar' })}
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 bg-white dark:bg-[#0b0f1a] border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/10 transition"
                        onClick={() => cambiarRol(fila._id, String(fila.rol).toLowerCase() === 'admin' ? 'usuario' : 'admin')}
                      >
                        {String(fila.rol).toLowerCase() === 'admin'
                          ? t('admin.hacerUsuario', { defaultValue: 'Hacer usuario' })
                          : t('admin.hacerAdmin', { defaultValue: 'Hacer admin' })}
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 bg-white dark:bg-[#0b0f1a] border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/10 transition"
                        onClick={() => alert('TODO: Resetear contraseña')}
                      >
                        {t('admin.resetPass', { defaultValue: 'Resetear contraseña' })}
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 bg-white dark:bg-[#0b0f1a] border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/10 transition"
                        onClick={() => alert('TODO: Ver actividad')}
                      >
                        {t('admin.verActividad', { defaultValue: 'Ver actividad' })}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>

          {/* Estado vacío elegante */}
          {!loading && !error && filteredUsers.length === 0 && (
            <div className="rounded-2xl border border-dashed border-light-border dark:border-dark-border p-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('admin.sinResultados', { defaultValue: 'Sin resultados con los filtros actuales.' })}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/60 dark:bg-red-400/10 p-4 text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
