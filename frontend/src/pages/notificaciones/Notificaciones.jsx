// src/pages/Notificaciones.jsx
import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '@/api/axiosInstance';
import Button from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { getCsrfToken } from '@/api/auth.api';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  Cpu,
  ServerCrash,
  Filter,
  Search,
  RefreshCw,
  MailCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useNotificaciones } from '@/context/NotificacionesContext';
import useNotifsRT from '@/hooks/useNotifsRT';

export default function Notificaciones() {
  const { t } = useTranslation();
  const { obtenerConteo: refreshUnread } = useNotificaciones();

  // ---------- estado ----------
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState(''); // '', 'no-leida', 'leida'
  const [query, setQuery] = useState('');
  const [tipo, setTipo] = useState('');     // '', 'alert', 'info', 'device'
  const [sev, setSev] = useState('');       // '', 'low','med','high','critical'
  const [error, setError] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');

  // ---------- helpers ----------
  const normalizeResponse = (data) => {
    if (Array.isArray(data)) return data;
    const candidate = data?.items ?? data?.docs ?? data?.data ?? data?.notificaciones ?? [];
    return Array.isArray(candidate) ? candidate : [];
  };

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filtro === 'leida') params.leida = true;
      if (filtro === 'no-leida') params.leida = false;
      if (tipo) params.tipo = tipo;
      if (sev) params.severity = sev;
      if (query.trim()) params.q = query.trim();

      const res = await axiosInstance.get('/notificaciones', { params });
      const arr = normalizeResponse(res.data).sort(
        (a, b) => (new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      );
      setRaw(arr);
    } catch (err) {
      console.error('❌ Error al obtener notificaciones:', err);
      setError(t('notificaciones.error', 'Error al obtener notificaciones.'));
      setRaw([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ts) =>
    !ts ? t('notificaciones.sinFecha', 'Fecha no disponible') : new Date(ts).toLocaleString();

  const formatAgo = (ts) => {
    if (!ts) return '';
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
    if (diff < 60) return rtf.format(-diff, 'second');
    if (diff < 3600) return rtf.format(-Math.floor(diff / 60), 'minute');
    if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), 'hour');
    return rtf.format(-Math.floor(diff / 86400), 'day');
  };

  const iconFor = (n) => {
    const severity = (n?.severity || n?.nivel || '').toLowerCase();
    const type = (n?.tipo || n?.type || '').toLowerCase();
    if (severity === 'critical') return <ServerCrash className="w-4 h-4 text-red-600" />;
    if (severity === 'high')     return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    if (type === 'device')       return <Cpu className="w-4 h-4 text-blue-600" />;
    if (type === 'info')         return <Info className="w-4 h-4 text-sky-500" />;
    if (severity === 'low')      return <Info className="w-4 h-4 text-sky-500" />;
    return <Bell className="w-4 h-4 text-primary" />;
  };

  const SevBadge = ({ sev }) => {
    const lv = (sev || '').toLowerCase();
    const map = {
      critical: 'bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300',
      high:     'bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300',
      med:      'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
      medium:   'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
      low:      'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300',
      info:     'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300',
      default:  'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ring-1 ring-inset ring-black/5 ${map[lv] || map.default}`}>
        {lv || t('notificaciones.sev', 'normal')}
      </span>
    );
  };

  const TipoBadge = ({ tipo }) => {
    const v = (tipo || '').toLowerCase();
    const label = v || t('notificaciones.tipo', 'general');
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/70 dark:bg-white/[0.06] border border-light-border dark:border-dark-border">
        {label}
      </span>
    );
  };

  const marcarLeida = async (id) => {
    // Optimista
    setRaw((prev) => prev.map((n) => (n._id === id ? { ...n, leida: true } : n)));
    try {
      const token = csrfToken || (await getCsrfToken());
      await axiosInstance.patch(
        `/notificaciones/${id}/leida`,
        {},
        { headers: { 'X-CSRF-Token': token } }
      );
      refreshUnread?.();
    } catch (err) {
      console.error('❌ Error al marcar como leída:', err);
      // rollback
      setRaw((prev) => prev.map((n) => (n._id === id ? { ...n, leida: false } : n)));
    }
  };

  const marcarTodasVisibles = async () => {
    const ids = filtered.filter((n) => !n.leida).map((n) => n._id);
    if (!ids.length) return;

    // Optimista
    setRaw((prev) => prev.map((n) => (ids.includes(n._id) ? { ...n, leida: true } : n)));
    try {
      const token = csrfToken || (await getCsrfToken());
      await axiosInstance.patch(
        '/notificaciones/mark-read-bulk',
        { ids },
        { headers: { 'X-CSRF-Token': token } }
      );
      refreshUnread?.();
    } catch (err) {
      console.error('❌ Error al marcar en lote:', err);
      // si falla, recarga del servidor para quedar consistentes
      fetchNotificaciones();
    }
  };

  // ---------- efectos ----------
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getCsrfToken();
        if (mounted) setCsrfToken(token);
      } catch {/* ignore */}
      await fetchNotificaciones();
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro, tipo, sev, query]); // cuando cambian filtros, pedimos al backend

  // ---------- filtros client-side mínimos (solo si quieres doble filtro local) ----------
  const filtered = useMemo(() => {
    // ahora la mayoría de filtros van al backend; aquí sólo validamos búsqueda extra si quieres
    return [...raw];
  }, [raw]);

  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  // ► Escucha notifs en vivo y añádelas arriba sin perder filtros
  useNotifsRT({
    onNew: (n) => {
      const doc = Array.isArray(n?.items) ? n.items[0] : n; // por si algún día viene batch
      if (!doc) return;
      // normaliza lo mínimo: leida/timestamp
      const normalized = {
        ...doc,
        leida: typeof doc.leida === 'boolean' ? doc.leida : !!doc.leido,
        timestamp: doc.timestamp || doc.creadoEn || doc.createdAt || Date.now(),
      };
      setRaw((prev) => {
        // evita duplicados por _id
        if (normalized._id && prev.some((x) => x._id === normalized._id)) return prev;
        return [normalized, ...prev];
      });
    },
  });

  return (
    <div className="relative min-h-[calc(100vh-var(--header-h,80px)-var(--footer-h,60px))] flex flex-col">
      {/* halos de fondo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/15 dark:bg-primary/25 blur-2xl opacity-70 dark:opacity-40" />
        <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-accent/15 dark:bg-accent/25 blur-2xl opacity-70 dark:opacity-40" />
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-8 w-full">
        {/* Header + controles */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              {t('notificaciones.titulo', 'Notificaciones')}
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t('notificaciones.sub', 'Alertas de dispositivos, seguridad y sistema en tiempo real.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={fetchNotificaciones} className="h-9 px-3">
              <RefreshCw className="w-4 h-4 mr-1" />
              {t('notificaciones.refrescar', 'Refrescar')}
            </Button>
            <Button variant="primary" onClick={marcarTodasVisibles} className="h-9 px-3">
              <MailCheck className="w-4 h-4 mr-1" />
              {t('notificaciones.marcarTodo', 'Marcar visibles como leídas')}
            </Button>
          </div>
        </header>

        {/* Filtros */}
        <Card className="border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.05] backdrop-blur">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="inline-flex rounded-xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.04] overflow-hidden">
                <TabBtn active={filtro === ''} onClick={() => setFiltro('')}>
                  <Bell className="w-4 h-4 mr-1" />
                  {t('notificaciones.todas', 'Todas')}
                </TabBtn>
                <TabBtn active={filtro === 'no-leida'} onClick={() => setFiltro('no-leida')}>
                  <Eye className="w-4 h-4 mr-1" />
                  {t('notificaciones.noLeidas', 'No leídas')}
                </TabBtn>
                <TabBtn active={filtro === 'leida'} onClick={() => setFiltro('leida')}>
                  <EyeOff className="w-4 h-4 mr-1" />
                  {t('notificaciones.leidas', 'Leídas')}
                </TabBtn>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.04] px-3 py-1.5">
                  <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('notificaciones.buscar', 'Buscar por mensaje, dispositivo, proyecto…')}
                    className="bg-transparent outline-none text-sm w-56 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.04] px-3 py-1.5">
                  <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="bg-transparent outline-none text-sm"
                    title="Tipo"
                  >
                    <option value="">{t('notificaciones.tipoTodos', 'Tipo: Todos')}</option>
                    <option value="alert">{t('notificaciones.tipoAlerta', 'Alerta')}</option>
                    <option value="info">{t('notificaciones.tipoInfo', 'Info')}</option>
                    <option value="device">{t('notificaciones.tipoDevice', 'Dispositivo')}</option>
                  </select>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <select
                    value={sev}
                    onChange={(e) => setSev(e.target.value)}
                    className="bg-transparent outline-none text-sm"
                    title="Severidad"
                  >
                    <option value="">{t('notificaciones.sevTodos', 'Severidad: Todas')}</option>
                    <option value="low">{t('notificaciones.sevLow', 'Baja')}</option>
                    <option value="med">{t('notificaciones.sevMed', 'Media')}</option>
                    <option value="high">{t('notificaciones.sevHigh', 'Alta')}</option>
                    <option value="critical">{t('notificaciones.sevCritical', 'Crítica')}</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista / estados */}
        {loading ? (
          <SkeletonList />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchNotificaciones} />
        ) : filtered.length === 0 ? (
          <div className="flex-1">
            <EmptyState onReset={() => { setFiltro(''); setQuery(''); setTipo(''); setSev(''); }} />
          </div>
        ) : (
          Object.entries(groups).map(([group, items]) => (
            <section key={group} className="space-y-3">
              <h3 className="text-xs tracking-wide uppercase text-gray-500 dark:text-gray-400 pl-1">
                {group}
              </h3>
              <div className="space-y-3">
                {items.map((n) => (
                  <Card
                    key={n._id}
                    className={`border-light-border dark:border-dark-border bg-white/85 dark:bg-white/[0.05] ${
                      n.leida ? '' : 'ring-1 ring-primary/10'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">{iconFor(n)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {n.mensaje || n.message || t('notificaciones.mensajeVacio', 'Mensaje')}
                            </CardTitle>
                            <TipoBadge tipo={n.tipo || n.type} />
                            <SevBadge sev={(n.severity || n.nivel || '').toLowerCase()} />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {(n.detalle || n.detail || n.meta || '') &&
                              JSON.stringify(n.detalle || n.detail || n.meta)}
                          </p>
                          <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                            {n.deviceId && <span>🧩 {n.deviceId}</span>}
                            {n.project && <span>📁 {n.project}</span>}
                            <span>⏱ {formatTime(n.timestamp)}</span>
                            <span>({formatAgo(n.timestamp)})</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {n.leida ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {t('notificaciones.leida', 'Leída')}
                            </span>
                          ) : (
                            <Button
                              variant="secondary"
                              className="h-8 text-xs"
                              onClick={() => marcarLeida(n._id)}
                              title={t('notificaciones.marcarLeida', 'Marcar como leída')}
                            >
                              <MailCheck className="w-3.5 h-3.5 mr-1" />
                              {t('notificaciones.marcarLeida', 'Marcar leída')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

/* ================= Subcomponentes ================= */

function TabBtn({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium transition ${
        active
          ? 'bg-primary text-white'
          : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-2xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-white/10 dark:via-white/5 dark:to-white/10 animate-pulse"
        />
      ))}
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <Card className="border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.05]">
      <CardContent className="p-12 text-center space-y-3">
        <Bell className="w-7 h-7 mx-auto text-primary" />
        <p className="text-sm text-gray-700 dark:text-gray-300">
          No hay notificaciones que coincidan.
        </p>
        <Button variant="secondary" onClick={onReset} className="mt-1">
          Limpiar filtros
        </Button>
      </CardContent>
    </Card>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <Card className="border-red-200 dark:border-red-950 bg-red-50/60 dark:bg-red-400/10">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-300">
              {message}
            </h3>
            <p className="text-xs text-red-700/80 dark:text-red-300/80 mt-1">
              Revisa tu conexión o vuelve a intentarlo.
            </p>
          </div>
          <Button variant="secondary" onClick={onRetry} className="h-8 text-xs">
            Reintentar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ================= Utils ================= */

function groupByDay(list) {
  const out = { Hoy: [], Ayer: [], Anteriores: [] };
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;

  list.forEach((n) => {
    const ts = new Date(n.timestamp || 0).getTime();
    if (ts >= today) out.Hoy.push(n);
    else if (ts >= yesterday) out.Ayer.push(n);
    else out.Anteriores.push(n);
  });

  Object.keys(out).forEach((k) => { if (!out[k].length) delete out[k]; });
  return out;
}
