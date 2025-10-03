// frontend/src/pages/admin/AgentesPage.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import * as XLSX from 'xlsx';
import { Download, Search, Monitor, LayoutGrid, List, ArrowUpDown } from 'lucide-react';

import axiosInstance from '../../api/axiosInstance';
import { getCsrfToken } from '../../api/auth.api';

import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

/* ======================== helpers ======================== */
function toRelTime(date, now = new Date()) {
  if (!date) return '—';
  const diff = (date.getTime() - now.getTime()) / 1000; // s
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  if (abs < 60) return rtf.format(Math.round(diff), 'seconds');
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minutes');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hours');
  return rtf.format(Math.round(diff / 86400), 'days');
}

function normalizeAgent(a) {
  const dispositivos = Array.isArray(a.dispositivos) ? a.dispositivos : [];
  const safeIp = a.ip === '::1' ? '127.0.0.1' : a.ip || '—';
  return {
    usuarioId: a.usuario?._id || a.usuarioId || '',
    nombre: a.usuario?.nombre || a.nombre || '—',
    email: a.usuario?.email || a.email || '—',
    foto: a.usuario?.fotoPerfil || a.foto || '/assets/profile-placeholder.png',
    socketId: a.socketId || null,
    isOnline: !!a.isOnline,
    connectedAt: a.connectedAt ? new Date(a.connectedAt) : null,
    lastHeartbeat: a.lastHeartbeat ? new Date(a.lastHeartbeat) : null,
    dispositivos,
    ip: safeIp,
  };
}

/* ======================== componente ======================== */
export default function AgentesPage() {
  const [agentes, setAgentes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [csrfToken, setCsrfToken] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // filtros / ui
  const [filterStatus, setFilterStatus] = useState('todos'); // todos | activos | desconectados
  const [filtro, setFiltro] = useState('');
  const [fecha, setFecha] = useState(''); // YYYY-MM-DD
  const [view, setView] = useState('grid'); // grid | list
  const [sortBy, setSortBy] = useState('estado'); // estado | nombre | ultimoHB | dispositivos
  const [sortDir, setSortDir] = useState('desc'); // asc | desc

  // modal dispositivos
  const [modalDispositivos, setModalDispositivos] = useState(null);
  const [detalleDispositivos, setDetalleDispositivos] = useState([]);
  const [loadingDispositivos, setLoadingDispositivos] = useState(false);

  // refresco de tiempos relativos
  const [nowTick, setNowTick] = useState(Date.now());
  const tickRef = useRef(null);

  // cfg con Authorization + CSRF (igual a tu versión anterior)
  const cfg = useMemo(
    () => ({
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
      },
      withCredentials: true,
    }),
    [token, csrfToken]
  );

  /* ========== init: csrf + fetch (mantiene offline/online) ========== */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const t = await getCsrfToken();
        if (mounted) setCsrfToken(t || '');

        // IMPORTANTE: mantenemos el endpoint /api/agentes (axiosInstance tiene baseURL '/api')
        const res = await axiosInstance.get('/agentes', cfg);
        const arr = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.agentes) ? res.data.agentes : [];
        const mapped = arr.map(normalizeAgent);
        if (mounted) setAgentes(mapped);
      } catch (err) {
        console.error('❌ Error inicializando Agentes:', err?.message || err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [cfg]);

  /* ========== socket en canal /dashboard (no depender de csrf para evitar reconexiones) ========== */
  useEffect(() => {
    if (!token) return;
    const socket = io(`${import.meta.env.VITE_WS_URL}/dashboard`, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token },
    });

    const mergeAgent = (nuevo) => {
      setAgentes((prev) => {
        const map = new Map(prev.map(x => [x.usuarioId, { ...x }]));
        const existing = map.get(nuevo.usuarioId);
        map.set(nuevo.usuarioId, { ...existing, ...nuevo });
        return Array.from(map.values());
      });
    };

    socket.on('agente-conectado', (payload) => {
      const { usuario, socketId, connectedAt, lastHeartbeat, dispositivos, ip } = payload || {};
      const norm = normalizeAgent({
        usuario, socketId, connectedAt, lastHeartbeat, dispositivos, ip, isOnline: true,
      });
      mergeAgent(norm);
    });

    socket.on('agente-heartbeat', ({ socketId, lastHeartbeat }) => {
      setAgentes((prev) =>
        prev.map((a) =>
          a.socketId === socketId
            ? { ...a, lastHeartbeat: new Date(lastHeartbeat), isOnline: true }
            : a
        )
      );
    });

    socket.on('agente-desconectado', ({ usuarioId }) => {
      setAgentes((prev) =>
        prev.map((a) =>
          a.usuarioId === usuarioId
            ? { ...a, isOnline: false, socketId: null, lastHeartbeat: null }
            : a
        )
      );
    });

    return () => {
      try { socket.disconnect(); } catch {}
    };
  }, [token]);

  // tick para tiempos relativos
  useEffect(() => {
    tickRef.current = setInterval(() => setNowTick(Date.now()), 15000);
    return () => clearInterval(tickRef.current);
  }, []);

  /* ========== métricas ========== */
  const totalActivos = useMemo(() => agentes.filter(a => a.isOnline).length, [agentes]);
  const totalDesconectados = agentes.length - totalActivos;
  const totalDispositivos = useMemo(
    () => agentes.reduce((s, a) => s + (a.dispositivos?.length || 0), 0),
    [agentes]
  );

  /* ========== filtro + orden ========== */
  const agentesFiltradosOrdenados = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    let arr = agentes.filter(a => {
      if (filterStatus === 'activos' && !a.isOnline) return false;
      if (filterStatus === 'desconectados' && a.isOnline) return false;
      if (fecha && a.connectedAt?.toISOString().slice(0, 10) !== fecha) return false;
      if (!q) return true;
      const hay = (s) => String(s || '').toLowerCase().includes(q);
      const hitDispo = Array.isArray(a.dispositivos) && a.dispositivos.some(d => hay(d.uid) || hay(d.nombre));
      return hay(a.email) || hay(a.usuarioId) || hay(a.nombre) || hay(a.ip) || hitDispo;
    });

    const cmp = (a, b) => {
      switch (sortBy) {
        case 'estado': {
          const vA = a.isOnline ? 1 : 0;
          const vB = b.isOnline ? 1 : 0;
          return sortDir === 'asc' ? vA - vB : vB - vA;
        }
        case 'nombre': {
          const v = (a.nombre || '').localeCompare(b.nombre || '');
          return sortDir === 'asc' ? v : -v;
        }
        case 'ultimoHB': {
          const vA = a.lastHeartbeat ? a.lastHeartbeat.getTime() : 0;
          const vB = b.lastHeartbeat ? b.lastHeartbeat.getTime() : 0;
          return sortDir === 'asc' ? vA - vB : vB - vA;
        }
        case 'dispositivos': {
          const vA = a.dispositivos?.length || 0;
          const vB = b.dispositivos?.length || 0;
          return sortDir === 'asc' ? vA - vB : vB - vA;
        }
        default:
          return 0;
      }
    };

    return arr.sort(cmp);
  }, [agentes, filterStatus, fecha, filtro, sortBy, sortDir]);

  /* ========== exportar ========== */
  const exportarExcel = () => {
    const datos = agentesFiltradosOrdenados.map(a => ({
      UsuarioID: a.usuarioId,
      Email: a.email,
      Nombre: a.nombre,
      Estado: a.isOnline ? 'Online' : 'Offline',
      'Socket ID': a.socketId || '—',
      'Último HB': a.lastHeartbeat ? a.lastHeartbeat.toISOString() : '—',
      ConectadoDesde: a.connectedAt ? a.connectedAt.toISOString() : '—',
      Dispositivos: (a.dispositivos || []).map(d => d.uid).join(', '),
      IP: a.ip,
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Agentes');
    XLSX.writeFile(wb, 'agentes_iot.xlsx');
  };

  /* ========== modal dispositivos ========== */
  const abrirModalDispositivos = async (agente) => {
    try {
      setLoadingDispositivos(true);
      setModalDispositivos({ nombre: agente.nombre });

      const detalles = await Promise.all(
        (agente.dispositivos || []).map(async (d) => {
          const uid = d?.uid || '';
          if (!uid) {
            return { uid: '—', nombre: d?.nombre || '—', fabricante: '—', chip: '—', path: '—', imagen: null };
          }
          try {
            const { data } = await axiosInstance.get(`/dispositivos/${uid}`, cfg);
            return {
              uid: data?.uid || uid,
              nombre: data?.nombre || d?.nombre || '—',
              fabricante: data?.fabricante || '—',
              chip: data?.chip || '—',
              path: data?.path || '—',
              imagen: data?.imagen || null,
            };
          } catch {
            return { uid, nombre: d?.nombre || '—', fabricante: '—', chip: '—', path: '—', imagen: null };
          }
        })
      );

      setDetalleDispositivos(detalles);
    } catch (err) {
      console.error('❌ Error cargando dispositivos:', err?.message || err);
      setDetalleDispositivos([]);
    } finally {
      setLoadingDispositivos(false);
    }
  };

  /* ======================== UI ======================== */
  return (
    <div className="relative min-h-[calc(100vh-var(--header-h,80px))]">
      {/* Fondo suave coherente con Admin */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-black/[0.03] dark:bg-white/[0.04] blur-2xl" />
        <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-black/[0.03] dark:bg-white/[0.04] blur-2xl" />
      </div>

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 fade-in-down">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-light-text dark:text-white flex items-center gap-2">
            📡 Agentes IoT
          </h1>
          <p className="text-sm text-light-muted dark:text-dark-muted">
            Monitorea el estado de tu flota en tiempo real.
          </p>
        </header>

        {/* Métricas */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { lbl: 'Activos', val: totalActivos, grad: 'from-green-500 to-teal-600' },
            { lbl: 'Desconectados', val: totalDesconectados, grad: 'from-red-500 to-pink-600' },
            { lbl: 'Dispositivos', val: totalDispositivos, grad: 'from-blue-500 to-indigo-600' },
          ].map(({ lbl, val, grad }) => (
            <div key={lbl} className={`bg-gradient-to-r ${grad} text-white rounded-xl p-4 shadow-lg`}>
              <p className="text-xs uppercase tracking-wide/relaxed opacity-90">{lbl}</p>
              <p className="text-2xl font-semibold mt-1">{val}</p>
            </div>
          ))}
        </section>

        {/* Toolbar */}
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* chips estado */}
          <div className="flex flex-wrap gap-2">
            {['todos', 'activos', 'desconectados'].map((st) => {
              const active = filterStatus === st;
              return (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`btn ${active ? 'btn-primary' : 'btn-outline-primary'}`}
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              );
            })}
          </div>

          {/* filtros y acciones */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted dark:text-dark-muted" />
              <Input
                placeholder="Buscar email, nombre, UID, IP..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="pl-9 w-64"
              />
            </div>

            <input
              type="date"
              className="form-input-sm w-40"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              aria-label="Filtrar por fecha de conexión"
            />

            <Button
              variant="outline"
              onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
              className="gap-2"
              title="Orden asc/desc"
            >
              <ArrowUpDown size={16} />
              {sortDir.toUpperCase()}
            </Button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select-pro w-44"
                aria-label="Ordenar por"
              >
                <option value="estado">Ordenar: Estado</option>
                <option value="nombre">Ordenar: Nombre</option>
                <option value="ultimoHB">Ordenar: Último HB</option>
                <option value="dispositivos">Ordenar: Dispositivos</option>
              </select>
            </div>

            <Button
              variant="outline"
              onClick={() => setView((v) => (v === 'grid' ? 'list' : 'grid'))}
              className="gap-2"
              title={view === 'grid' ? 'Vista lista' : 'Vista grid'}
            >
              {view === 'grid' ? <List size={16} /> : <LayoutGrid size={16} />}
              {view === 'grid' ? 'Lista' : 'Grid'}
            </Button>

            <Button onClick={exportarExcel} variant="outline" className="gap-2">
              <Download size={16} /> Exportar
            </Button>
          </div>
        </section>

        {/* Listado */}
        {loading ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.05] animate-pulse space-y-3"
              >
                <div className="h-4 w-1/3 bg-black/10 dark:bg-white/10 rounded" />
                <div className="h-6 w-2/3 bg-black/10 dark:bg-white/10 rounded" />
                <div className="h-3 w-1/2 bg-black/10 dark:bg-white/10 rounded" />
                <div className="h-8 w-full bg-black/10 dark:bg-white/10 rounded" />
              </div>
            ))}
          </section>
        ) : agentesFiltradosOrdenados.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-light-border dark:border-dark-border p-8 text-center">
            <p className="text-light-muted dark:text-dark-muted">No hay agentes con los filtros actuales.</p>
          </section>
        ) : view === 'grid' ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agentesFiltradosOrdenados.map((a) => (
              <Card
                key={a.usuarioId}
                className={`p-4 md:p-6 border-l-4 ${
                  a.isOnline ? 'border-emerald-500' : 'border-red-500'
                } hover:shadow-lg transition bg-white/80 dark:bg-white/[0.05] border border-light-border dark:border-dark-border`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={a.foto}
                      alt="perfil"
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => { e.currentTarget.src = '/assets/profile-placeholder.png'; }}
                    />
                    <div>
                      <h4 className="font-semibold text-base text-light-text dark:text-white">{a.nombre}</h4>
                      <p className="text-xs text-light-muted dark:text-dark-muted">{a.email}</p>
                    </div>
                  </div>
                  <span
                    className={`h-3 w-3 rounded-full ${a.isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}
                    title={a.isOnline ? 'Online' : 'Offline'}
                  />
                </div>

                <div className="space-y-1 text-sm mb-4 text-light-text/90 dark:text-dark-text/90">
                  <p><b>Socket:</b> <code>{a.socketId?.slice(0, 10) || '—'}</code></p>
                  <p>
                    <b>Último:</b>{' '}
                    {a.lastHeartbeat
                      ? `${toRelTime(a.lastHeartbeat, new Date(nowTick))} (${a.lastHeartbeat.toLocaleTimeString()})`
                      : '—'}
                  </p>
                  <p><b>IP:</b> {a.ip}</p>
                  <p><b>Dispositivos:</b> {a.dispositivos?.length || 0}</p>
                </div>

                <Button
                  onClick={() => abrirModalDispositivos(a)}
                  variant="outline"
                  className="w-full text-center"
                >
                  <Monitor size={16} /> Ver dispositivos
                </Button>
              </Card>
            ))}
          </section>
        ) : (
          /* Vista lista compacta */
          <section className="overflow-x-auto rounded-2xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.05]">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-light-border dark:border-dark-border">
                  <th className="p-3">Estado</th>
                  <th className="p-3">Usuario</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Último HB</th>
                  <th className="p-3">Conectado</th>
                  <th className="p-3">Dispositivos</th>
                  <th className="p-3">IP</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {agentesFiltradosOrdenados.map((a) => (
                  <tr
                    key={a.usuarioId}
                    className="border-b last:border-b-0 border-light-border dark:border-dark-border hover:bg-light-bg/50 dark:hover:bg-dark-bg/50"
                  >
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs ${
                        a.isOnline
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        <span className={`h-2 w-2 rounded-full ${a.isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {a.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="p-3">{a.nombre}</td>
                    <td className="p-3">{a.email}</td>
                    <td className="p-3">
                      {a.lastHeartbeat
                        ? `${toRelTime(a.lastHeartbeat, new Date(nowTick))} (${a.lastHeartbeat.toLocaleTimeString()})`
                        : '—'}
                    </td>
                    <td className="p-3">{a.connectedAt ? a.connectedAt.toLocaleString() : '—'}</td>
                    <td className="p-3">{a.dispositivos?.length || 0}</td>
                    <td className="p-3">{a.ip}</td>
                    <td className="p-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirModalDispositivos(a)}
                        className="gap-2"
                      >
                        <Monitor size={16} /> Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Modal dispositivos */}
        {modalDispositivos && (
          <Modal
            open={!!modalDispositivos}
            onOpenChange={(open) => !open && setModalDispositivos(null)}
            title={`Dispositivos de ${modalDispositivos.nombre}`}
          >
            {loadingDispositivos ? (
              <p className="text-center text-light-muted dark:text-dark-muted">Cargando dispositivos...</p>
            ) : detalleDispositivos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-2 no-scrollbar">
                {detalleDispositivos.map((d, i) => {
                  const imagen = d.imagen ? `/images/conexion/${d.imagen}` : '/assets/placeholder-device.png';
                  return (
                    <div
                      key={`${d.uid}-${i}`}
                      className="rounded-lg border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.05] p-4 flex flex-col items-center gap-2 text-center"
                    >
                      <img
                        src={imagen}
                        alt={d.nombre}
                        className="w-20 h-20 object-contain rounded mb-2"
                        onError={(e) => { e.currentTarget.src = '/assets/placeholder-device.png'; }}
                      />
                      <div className="space-y-1">
                        <h4 className="font-semibold text-base text-light-text dark:text-white">
                          {d.nombre || 'Sin nombre'}
                        </h4>
                        <code className="text-xs text-light-muted dark:text-dark-muted">{d.uid}</code>
                      </div>
                      <div className="text-xs text-light-muted dark:text-dark-muted space-y-1 mt-3">
                        <p><b>Fabricante:</b> {d.fabricante || '—'}</p>
                        <p><b>Chip:</b> {d.chip || '—'}</p>
                        <p><b>Puerto:</b> {d.path || '—'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-light-muted dark:text-dark-muted">Sin dispositivos disponibles.</p>
            )}
          </Modal>
        )}
      </div>
    </div>
  );
}
