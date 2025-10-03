// src/pages/admin/LogsGlobales.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';
import axios from '@/api/axiosInstance';
import TablaPro from '@/components/ui/TablaPro';
import Button from '@/components/ui/Button';
import { createPortal } from 'react-dom';
import { Card, CardContent } from '@/components/ui/Card';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import {
  FileText,
  Activity,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  PlugZap,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

/* ========================= helpers ========================= */

const SHOW_RAW_FLAG = String(import.meta.env.VITE_LOGS_SHOW_RAW || '').trim() === '1';

const levelIcon = (lvl = '') => {
  const v = String(lvl).toLowerCase();
  if (v === 'error' || v === 'critical') return <AlertOctagon className="w-4 h-4 text-red-600" />;
  if (v === 'warn' || v === 'warning')   return <AlertTriangle className="w-4 h-4 text-orange-500" />;
  if (v === 'success' || v === 'ok')     return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  if (v === 'debug')                      return <Activity className="w-4 h-4 text-violet-600" />;
  return <Info className="w-4 h-4 text-sky-600" />;
};

const levelBadgeClass = (lvl = '') => {
  const v = String(lvl).toLowerCase();
  if (v === 'error' || v === 'critical')
    return 'bg-red-100 text-red-700 ring-1 ring-inset ring-black/5 dark:bg-red-400/15 dark:text-red-300';
  if (v === 'warn' || v === 'warning')
    return 'bg-orange-100 text-orange-700 ring-1 ring-inset ring-black/5 dark:bg-orange-400/15 dark:text-orange-300';
  if (v === 'success' || v === 'ok')
    return 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-black/5 dark:bg-emerald-400/15 dark:text-emerald-300';
  if (v === 'debug')
    return 'bg-violet-100 text-violet-700 ring-1 ring-inset ring-black/5 dark:bg-violet-400/15 dark:text-violet-300';
  return 'bg-sky-100 text-sky-700 ring-1 ring-inset ring-black/5 dark:bg-sky-400/15 dark:text-sky-300';
};

// 🎨 badge para la columna Acción
const actionBadgeClass = (a = '') => {
  const v = String(a).toLowerCase();
  if (/(delete|remove|eliminar|borrar|destroy)/.test(v))
    return 'bg-red-100 text-red-700 ring-1 ring-inset ring-black/5 dark:bg-red-400/15 dark:text-red-300';
  if (/(create|add|crear|registro|register|new|alta)/.test(v))
    return 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-black/5 dark:bg-emerald-400/15 dark:text-emerald-300';
  if (/(update|edit|patch|actualizar|editar|change|cambiar)/.test(v))
    return 'bg-sky-100 text-sky-700 ring-1 ring-inset ring-black/5 dark:bg-sky-400/15 dark:text-sky-300';
  if (/(login|logout|auth|signin|signout|token)/.test(v))
    return 'bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-black/5 dark:bg-indigo-400/15 dark:text-indigo-300';
  if (/(export|download|descargar)/.test(v))
    return 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-black/5 dark:bg-amber-400/15 dark:text-amber-300';
  if (/(import|upload|subir)/.test(v))
    return 'bg-violet-100 text-violet-700 ring-1 ring-inset ring-black/5 dark:bg-violet-400/15 dark:text-violet-300';
  return 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-black/5 dark:bg-white/10 dark:text-gray-200';
};

const normalizeRows = (data) => {
  if (Array.isArray(data)) return data;
  const arr = data?.items ?? data?.docs ?? data?.data ?? data?.logs ?? [];
  return Array.isArray(arr) ? arr : [];
};

const getTime = (row) => row?.ts || row?.fecha || row?.timestamp || row?.createdAt || row?.time;
const fmtFull = (ts) => (ts ? new Date(ts).toLocaleString() : '—');

const tryParseJWT = (token) => {
  try {
    const base = token?.split?.('.')[1];
    if (!base) return null;
    const json = JSON.parse(atob(base));
    return json || null;
  } catch { return null; }
};

const isAdminFromClient = () => {
  try {
    const lsRole = localStorage.getItem('role') || localStorage.getItem('rol');
    if (lsRole && /admin/i.test(lsRole)) return true;
  } catch {}
  try {
    const token = localStorage.getItem('token');
    const payload = tryParseJWT(token);
    const role = payload?.role || payload?.rol || (Array.isArray(payload?.roles) ? payload.roles.join(',') : '');
    if (role && /admin/i.test(String(role))) return true;
  } catch {}
  return false;
};

/* ========================= DateRangePicker ========================= */

const toISODate = (d) => {
  if (!(d instanceof Date) || Number.isNaN(d)) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const parseISODate = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return Number.isNaN(dt) ? null : dt;
};
const formatRangeLabel = (from, to) => {
  const fmt = new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  if (from && to) return `${fmt.format(from)} — ${fmt.format(to)}`;
  if (from) return `${fmt.format(from)} — …`;
  if (to) return `… — ${fmt.format(to)}`;
  return 'Rango de fechas';
};

function MonthGrid({ baseDate, start, end, onSelectDay }) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const first = new Date(year, month, 1);
  const startWeekday = (first.getDay() + 6) % 7; // Lunes=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const isSameDay = (a, b) =>
    a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const inRange = (day) => start && end && day >= start && day <= end;
  const isStart = (day) => start && isSameDay(day, start);
  const isEnd = (day) => end && isSameDay(day, end);

  const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(baseDate);

  return (
    <div className="w-[280px]">
      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-center mb-2 capitalize">
        {monthLabel}
      </div>
      <div className="grid grid-cols-7 gap-1 text-[11px] text-gray-500 dark:text-gray-400 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} className="h-8" />;
          const selected = isStart(d) || isEnd(d);
          const between = inRange(d) && !selected;
          return (
            <button
              key={d.toISOString()}
              onClick={() => onSelectDay(d)}
              className={[
                'h-8 rounded-md text-sm transition outline-none',
                'focus-visible:ring-2 focus-visible:ring-primary/50',
                selected
                  ? 'bg-primary text-white'
                  : between
                  ? 'bg-primary/10 text-gray-900 dark:text-gray-100'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200',
              ].join(' ')}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateRangePicker({ from, to, onChange, quickPresets = true }) {
  const [open, setOpen] = useState(false);
  const [base, setBase] = useState(() => new Date());
  const [start, setStart] = useState(() => parseISODate(from));
  const [end, setEnd] = useState(() => parseISODate(to));

  useEffect(() => { setStart(parseISODate(from)); }, [from]);
  useEffect(() => { setEnd(parseISODate(to)); }, [to]);

  const openPicker = () => {
    const f = parseISODate(from);
    setBase(f || new Date());
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const handleSelect = (day) => {
    if (!start || (start && end)) {
      setStart(day);
      setEnd(null);
    } else if (start && !end) {
      if (day < start) { setEnd(start); setStart(day); }
      else { setEnd(day); }
    }
  };

  const apply = () => {
    onChange({ from: start ? toISODate(start) : '', to: end ? toISODate(end) : '' });
    setOpen(false);
  };

  const clear = () => {
    setStart(null);
    setEnd(null);
    onChange({ from: '', to: '' });
    setOpen(false);
  };

  // presets rápidos: Hoy / 24h / 7d
  const presets = [
    { k: 'hoy', label: 'Hoy', fn: () => {
      const d = new Date(); const ymd = toISODate(d); onChange({ from: ymd, to: ymd }); setOpen(false);
    }},
    { k: '24h', label: 'Últ. 24h', fn: () => {
      const toD = new Date(); const fromD = new Date(Date.now() - 24*60*60*1000);
      onChange({ from: toISODate(fromD), to: toISODate(toD) }); setOpen(false);
    }},
    { k: '7d', label: 'Últ. 7 días', fn: () => {
      const toD = new Date(); const fromD = new Date(Date.now() - 7*24*60*60*1000);
      onChange({ from: toISODate(fromD), to: toISODate(toD) }); setOpen(false);
    }},
  ];

  const Modal = (
    <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={() => setOpen(false)} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-[720px] rounded-2xl border border-light-border dark:border-dark-border bg-white dark:bg-[#0b0f1a] shadow-2xl z-[10000]">
          {/* header */}
          <div className="flex items-center justify-between p-3 border-b border-light-border dark:border-dark-border">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Selecciona rango</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* contenido */}
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setBase(new Date(base.getFullYear(), base.getMonth() - 1, 1))}
                className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setBase(new Date())}
                className="px-2 py-1 text-xs rounded-md border border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/10"
              >
                Hoy
              </button>
              <button
                onClick={() => setBase(new Date(base.getFullYear(), base.getMonth() + 1, 1))}
                className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-center gap-4">
              <MonthGrid baseDate={base} start={start} end={end} onSelectDay={handleSelect} />
              <MonthGrid baseDate={new Date(base.getFullYear(), base.getMonth() + 1, 1)} start={start} end={end} onSelectDay={handleSelect} />
            </div>

            {quickPresets && (
              <div className="flex items-center gap-2">
                {presets.map(p => (
                  <button
                    key={p.k}
                    onClick={p.fn}
                    className="text-xs px-2 py-1 rounded-md border border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* footer */}
          <div className="flex items-center justify-between gap-2 p-3 border-t border-light-border dark:border-dark-border">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {formatRangeLabel(start, end)}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={clear}>Limpiar</Button>
              <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={apply}>Aplicar</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={openPicker}
        className="inline-flex items-center gap-2 rounded-xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.04] px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10 transition"
        title="Rango de fechas"
      >
        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-gray-800 dark:text-gray-200">
          {formatRangeLabel(start, end)}
        </span>
      </button>

      {open ? createPortal(Modal, document.body) : null}
    </>
  );
}

/* ========================= Page (Global) ========================= */

export default function LogsGlobales() {
  const { t } = useTranslation();
  const { confirmDelete } = useConfirmDialog();

  const [canSeeRaw] = useState(() => SHOW_RAW_FLAG || isAdminFromClient());

  // tabla (server-mode)
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filtros
  const [q, setQ] = useState('');
  const [level, setLevel] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // paginación / orden
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('ts');
  const [sortDir, setSortDir] = useState('desc');

  // selección
  const [seleccionados, setSeleccionados] = useState([]);

  // tiempo real
  const [live, setLive] = useState(true);
  const socketRef = useRef(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchData = async ({ pageArg = page, pageSizeArg = pageSize } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pageArg,
        pageSize: pageSizeArg,
        sort: sortBy ? `${sortBy}:${sortDir}` : undefined,
      };
      if (level) params.level = level;
      if (moduleName) params.module = moduleName;
      if (action) params.action = action;
      if (q) params.q = q;        // backend: buscar usuario/email/mensaje/acción/módulo
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await axios.get('/logs/globales', {
        params,
        // axiosInstance ya mete Authorization/CSRF; mantener esto por si acaso
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const items = normalizeRows(res.data);
      setRows(items);
      setTotal(Number(res.data?.total || items.length || 0));
    } catch (err) {
      console.error('❌ Error al obtener logs globales:', err);
      setRows([]);
      setTotal(0);
      setError(t('logs.error', 'Ocurrió un error al cargar los logs.'));
    } finally {
      setLoading(false);
    }
  };

  // primera carga
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // filtros → recargar (debounce suave)
  useEffect(() => {
    const id = setTimeout(() => {
      setPage(1);
      fetchData({ pageArg: 1 });
    }, 220);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, level, moduleName, action, from, to, sortBy, sortDir, pageSize]);

  // tiempo real (usa VITE_WS_URL para mantener coherencia con otras páginas)
  useEffect(() => {
    if (!live || !token) return;
    if (socketRef.current) return;

    const BASE = (import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || 'https://localhost:4443').replace(/\/$/, '');
    const s = io(`${BASE}/dashboard`, {
      transports: ['websocket'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
      timeout: 10000,
      auth: { token },
    });
    socketRef.current = s;

    s.on('connect', () => {
      // opcional: ya se manda en auth
    });

    s.on('logs:new', () => {
      if (sortBy === 'ts' && sortDir === 'desc' && page === 1) {
        fetchData({ pageArg: 1 });
      }
    });

    return () => {
      try { s.removeAllListeners(); s.disconnect(); } catch {}
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, token, sortBy, sortDir, page]);

  const onDeleteSelected = async (ids = []) => {
    if (!ids.length) return;

    const ok = await confirmDelete({
      title: t('logs.confirmarEliminacionTitulo', 'Eliminar logs'),
      message: t('logs.confirmarEliminacion', '¿Seguro que deseas eliminar los logs seleccionados? Esta acción no se puede deshacer.'),
      confirmText: t('common.eliminar', 'Eliminar'),
      cancelText: t('common.cancelar', 'Cancelar'),
      tone: 'danger',
    });
    if (!ok) return;

    try {
      await axios.post(
        '/logs/eliminar-varios',
        { ids },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      setSeleccionados([]);
      const willBeEmpty = rows.length === ids.length && page > 1;
      const nextPage = willBeEmpty ? page - 1 : page;
      setPage(nextPage);
      await fetchData({ pageArg: nextPage });
    } catch (err) {
      console.error('❌ Error eliminando logs:', err);
    }
  };

  /* ========================= columnas ========================= */
  const columnas = useMemo(
    () => [
      {
        campo: 'ts',
        label: 'Fecha',
        ancho: 'min-w-[180px]',
        sortable: true,
        render: (r) => (
          <div className="flex flex-col">
            <span className="text-[13px] text-gray-900 dark:text-gray-100">{fmtFull(getTime(r))}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
                .format(-Math.floor((Date.now() - new Date(getTime(r) || 0).getTime()) / 1000 / 60), 'minute')}
            </span>
          </div>
        ),
      },
      {
        campo: 'level',
        label: 'Nivel',
        ancho: 'w-[120px]',
        sortable: true,
        render: (r) => (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${levelBadgeClass(r.level)}`}>
            {levelIcon(r.level)}
            {(r.level || 'info').toString().toLowerCase()}
          </span>
        ),
      },
      {
        campo: 'usuario',
        label: 'Usuario',
        ancho: 'min-w-[220px]',
        sortable: false,
        render: (r) => {
          const nombre = r.user?.name || r.user?.nombre || r.usuario?.nombre || r.usuarioNombre || '';
          const email  = r.user?.email || r.usuario?.email || r.usuarioEmail || '';
          const inicial = (nombre || email || '?').slice(0, 1).toUpperCase();
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full grid place-items-center bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-200 text-xs font-semibold">
                {inicial}
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-gray-900 dark:text-gray-100">{nombre || '—'}</span>
                <span className="text-[12px] text-gray-500 dark:text-gray-400">{email || '—'}</span>
              </div>
            </div>
          );
        },
      },
      {
        campo: 'module',
        label: 'Módulo',
        ancho: 'w-[160px]',
        sortable: true,
        render: (r) => (r.module || r.origin || '—'),
      },
      {
        campo: 'action',
        label: 'Acción',
        ancho: 'w-[160px]',
        sortable: true,
        render: (r) => (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${actionBadgeClass(r.action)}`}>
            {String(r.action || '—')}
          </span>
        ),
      },
      {
        campo: 'message',
        label: 'Mensaje',
        ancho: 'min-w-[320px]',
        sortable: true,
        render: (r) => (
          <div className="max-w-[640px] truncate" title={r.message || ''}>
            {r.message || '—'}
          </div>
        ),
      },
    ],
    []
  );

  // clase por fila según nivel
  const getRowClassName = (r) => {
    const v = String(r.level || '').toLowerCase();
    if (v === 'error' || v === 'critical') return 'ring-1 ring-red-100 dark:ring-red-900/30';
    if (v === 'warn' || v === 'warning')   return 'ring-1 ring-orange-100 dark:ring-orange-900/30';
    if (v === 'success' || v === 'ok')     return 'ring-1 ring-emerald-100 dark:ring-emerald-900/30';
    return '';
  };

  // export full CSV (incluye usuario)
  const exportAllCSV = async () => {
    try {
      const headers = ['Fecha', 'Nivel', 'Usuario', 'Email', 'Módulo', 'Acción', 'Mensaje'];
      const lines = [headers.join(',')];

      const pageSizeExport = 200;
      let p = 1;
      const maxLoops = Math.ceil(Math.min(total, 5000) / pageSizeExport);

      for (let i = 0; i < maxLoops; i += 1) {
        const params = {
          page: p,
          pageSize: pageSizeExport,
          sort: sortBy ? `${sortBy}:${sortDir}` : undefined,
        };
        if (level) params.level = level;
        if (moduleName) params.module = moduleName;
        if (action) params.action = action;
        if (q) params.q = q;
        if (from) params.from = from;
        if (to) params.to = to;

        // eslint-disable-next-line no-await-in-loop
        const res = await axios.get('/logs/globales', { params, headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        const items = normalizeRows(res.data);
        if (!items.length) break;

        items.forEach((r) => {
          const nombre = r.user?.name || r.user?.nombre || r.usuario?.nombre || r.usuarioNombre || '';
          const email  = r.user?.email || r.usuario?.email || r.usuarioEmail || '';
          const row = [
            fmtFull(getTime(r)),
            r.level || '',
            nombre,
            email,
            r.module || r.origin || '',
            r.action || '',
            r.message || '',
          ].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`);
          lines.push(row.join(','));
        });

        if (p * pageSizeExport >= Number(res.data?.total || items.length)) break;
        p += 1;
      }

      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: `logs-globales-${new Date().toISOString().slice(0,10)}.csv`,
      });
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('❌ Export CSV error:', e);
    }
  };

  /* ========================= UI ========================= */
  return (
    <div className="relative min-h-[calc(100vh-var(--header-h,80px)-var(--footer-h,60px))] flex flex-col">
      {/* fondo suave como en admin */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 -left-24 w-96 h-96 rounded-full bg-black/[0.03] dark:bg-white/[0.04] blur-2xl" />
        <div className="absolute -bottom-28 -right-24 w-[28rem] h-[28rem] rounded-full bg-black/[0.03] dark:bg-white/[0.04] blur-2xl" />
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-8 w-full">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              {t('logsGlobal.titulo', 'Logs globales')}
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t('logsGlobal.sub', 'Eventos y acciones de todos los usuarios, en tiempo real.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => fetchData({ pageArg: page })} className="h-9 px-3">
              <RefreshCw className="w-4 h-4 mr-1" />
              {t('logs.refrescar', 'Refrescar')}
            </Button>
            <button
              onClick={() => setLive((v) => !v)}
              className={`inline-flex items-center h-9 px-3 rounded-md text-sm font-medium transition
                border ${live ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-200 border-light-border dark:border-dark-border'}`}
              title={live ? t('logs.liveOn', 'Tiempo real: ON') : t('logs.liveOff', 'Tiempo real: OFF')}
            >
              <PlugZap className="w-4 h-4 mr-1" />
              {live ? t('logs.enVivo', 'En vivo') : t('logs.pausado', 'Pausado')}
            </button>
          </div>
        </header>

        {/* Filtros */}
        <Card className="border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.05] backdrop-blur">
          <CardContent className="p-4 space-y-3">
            {/* fila 1: búsqueda + rango de fechas */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1 min-w-[260px] flex items-center gap-2 rounded-xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.04] px-3 py-1.5">
                <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t('logsGlobal.buscar', 'Buscar usuario/email, mensaje, acción o módulo…')}
                  className="bg-transparent outline-none text-sm w-full placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <DateRangePicker
                from={from}
                to={to}
                onChange={({ from: f, to: tto }) => { setFrom(f); setTo(tto); }}
              />
            </div>

            {/* fila 2: select nivel + inputs módulo/acción + botón limpiar */}
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
              <div className="inline-flex items-center gap-2 rounded-xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.04] px-3 py-1.5">
                <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="bg-transparent outline-none text-sm"
                >
                  <option value="">{t('logs.nivelTodos', 'Nivel: Todos')}</option>
                  <option value="info">Info</option>
                  <option value="warn">Warn</option>
                  <option value="error">Error</option>
                  <option value="success">Success</option>
                  <option value="debug">Debug</option>
                </select>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.04] px-3 py-1.5">
                <span className="text-xs text-gray-500 dark:text-gray-400">Módulo</span>
                <input
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder={t('logs.modulo', 'Módulo')}
                  className="bg-transparent outline-none text-sm w-full placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.04] px-3 py-1.5">
                <span className="text-xs text-gray-500 dark:text-gray-400">Acción</span>
                <input
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder={t('logs.accion', 'Acción')}
                  className="bg-transparent outline-none text-sm w-full placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div className="flex items-center">
                <Button
                  variant="secondary"
                  className="ml-auto"
                  onClick={() => { setQ(''); setLevel(''); setModuleName(''); setAction(''); setFrom(''); setTo(''); }}
                >
                  {t('logs.limpiar', 'Limpiar filtros')}
                </Button>
              </div>
            </div>

            {/* fila 3: chips rápidos de nivel (UX) */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { v: '', label: 'Todos' },
                { v: 'info', label: 'Info' },
                { v: 'warn', label: 'Warn' },
                { v: 'error', label: 'Error' },
                { v: 'success', label: 'Success' },
                { v: 'debug', label: 'Debug' },
              ].map(({ v, label }) => (
                <button
                  key={v || 'all'}
                  onClick={() => setLevel(v)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition
                    ${level === v
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white/80 dark:bg-white/[0.04] border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <TablaPro
          id="logs-globales"
          columnas={columnas}
          datos={rows}
          total={total}
          loading={loading}
          error={error}
          onRetry={() => fetchData({ pageArg: page })}
          serverMode
          page={page}
          pageSize={pageSize}
          onPageChange={(p) => { setPage(p); fetchData({ pageArg: p }); }}
          onPageSizeChange={(n) => { setPageSize(n); setPage(1); fetchData({ pageArg: 1, pageSizeArg: n }); }}
          sortBy={sortBy}
          sortDir={sortDir}
          onSortChange={(campo, dir) => { setSortBy(campo); setSortDir(dir); setPage(1); fetchData({ pageArg: 1 }); }}
          hideToolbarSearch
          seleccionados={seleccionados}
          setSeleccionados={setSeleccionados}
          onEliminarSeleccionados={onDeleteSelected}
          expandible
          renderExpand={(r) => {
            const nombre = r.user?.name || r.user?.nombre || r.usuario?.nombre || r.usuarioNombre || '';
            const email  = r.user?.email || r.usuario?.email || r.usuarioEmail || '';
            return (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold mb-1">Detalle</div>
                  {typeof (r.detail ?? r.detalle ?? r.meta) === 'string' ? (
                    <div className="text-xs overflow-auto max-h-64 p-3 rounded-lg bg-black/5 dark:bg-white/10 break-words">
                      {r.detail ?? r.detalle ?? r.meta}
                    </div>
                  ) : (
                    <pre className="text-xs overflow-auto max-h-64 p-3 rounded-lg bg-black/5 dark:bg-white/10">
                      {JSON.stringify(r.detail ?? r.detalle ?? r.meta ?? {}, null, 2)}
                    </pre>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold mb-1">Usuario</div>
                  <div className="text-xs grid grid-cols-2 gap-y-1">
                    <span className="opacity-70">Nombre:</span>
                    <span>{nombre || '—'}</span>
                    <span className="opacity-70">Email:</span>
                    <span className="truncate">{email || '—'}</span>
                    <span className="opacity-70">Fecha:</span>
                    <span>{fmtFull(getTime(r))}</span>
                    <span className="opacity-70">Módulo:</span>
                    <span>{r.module || r.origin || '—'}</span>
                    <span className="opacity-70">Acción:</span>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${actionBadgeClass(r.action)}`}>
                      {String(r.action || '—')}
                    </span>
                  </div>
                </div>

                {canSeeRaw && (
                  <div className="sm:col-span-2">
                    <div className="text-xs font-semibold mb-1">Crudo</div>
                    <pre className="text-xs overflow-auto max-h-64 p-3 rounded-lg bg-black/5 dark:bg-white/10">
                      {JSON.stringify(r, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          }}
          getRowClassName={getRowClassName}
          onExportCSV={exportAllCSV}
          rowKey="_id"
        />
      </div>
    </div>
  );
}
