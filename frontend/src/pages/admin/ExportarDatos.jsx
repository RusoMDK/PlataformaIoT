// frontend/src/pages/admin/ExportarDatos.jsx
import { useEffect, useMemo, useState, Fragment } from 'react';
import { FileDown, DownloadCloud, Loader2, ChevronDown, Calendar } from 'lucide-react';
import Button from '../../components/ui/Button';
import axiosInstance from '../../api/axiosInstance';
import { getCsrfToken } from '../../api/auth.api';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';

/* ========================= Config ========================= */

const FORMATS_BY_TYPE = {
  usuarios: ['csv', 'excel', 'pdf'],
  proyectos: ['csv', 'excel', 'pdf'],
  logs: ['csv', 'excel', 'pdf'],
  alertas: ['csv', 'excel', 'pdf'],
  sensores: ['csv', 'excel', 'pdf'],
  visualizaciones: ['json', 'csv'],
  lecturas: ['excel', 'pdf', 'csv'],
  backup: ['zip'],
};

const EXT_BY_FORMAT = {
  excel: 'xlsx',
  csv: 'csv',
  pdf: 'pdf',
  json: 'json',
  zip: 'zip',
};

/* ========================= DateRangePicker (igual estilo que Logs) ========================= */

const toISODate = (d) => {
  if (!(d instanceof Date)) return '';
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
      setStart(day); setEnd(null);
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
    setStart(null); setEnd(null);
    onChange({ from: '', to: '' });
    setOpen(false);
  };

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
    { k: '30d', label: 'Últ. 30 días', fn: () => {
      const toD = new Date(); const fromD = new Date(Date.now() - 30*24*60*60*1000);
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
              ✕
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
                ‹
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
                ›
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
          {formatRangeLabel(parseISODate(from), parseISODate(to))}
        </span>
      </button>

      {open ? createPortal(Modal, document.body) : null}
    </>
  );
}

/* ========================= Page ========================= */

export default function ExportarDatos() {
  const [tipo, setTipo] = useState('usuarios');
  const [formato, setFormato] = useState('csv');

  // Campos específicos
  const [sensorId, setSensorId] = useState('');
  const [bucket, setBucket] = useState(''); // ej: 1m, 5m, 15m, 1h

  // Filtros comunes (date-only con picker pro)
  const [showFilters, setShowFilters] = useState(false);
  const [q, setQ] = useState('');
  const [from, setFrom] = useState(''); // YYYY-MM-DD
  const [to, setTo] = useState('');     // YYYY-MM-DD

  // Seguridad/estado
  const [csrfToken, setCsrfToken] = useState('');
  const [downloading, setDownloading] = useState(false);

  // cuando cambia el tipo, forzamos a un formato válido
  useEffect(() => {
    const options = FORMATS_BY_TYPE[tipo] ?? ['csv'];
    if (!options.includes(formato)) setFormato(options[0]);
  }, [tipo]); // eslint-disable-line

  // precargar CSRF
  useEffect(() => {
    (async () => {
      try {
        const t = await getCsrfToken();
        setCsrfToken(t || '');
      } catch (err) {
        console.error('❌ Error obteniendo CSRF token:', err?.message || err);
      }
    })();
  }, []);

  const canDownload = useMemo(() => {
    if (downloading) return false;
    if (tipo === 'lecturas' && !sensorId.trim()) return false;
    return true;
  }, [downloading, tipo, sensorId]);

  function humanTipoLabel(t) {
    switch (t) {
      case 'usuarios': return 'Usuarios';
      case 'proyectos': return 'Proyectos';
      case 'logs': return 'Logs';
      case 'lecturas': return 'Lecturas';
      case 'alertas': return 'Alertas';
      case 'sensores': return 'Sensores';
      case 'visualizaciones': return 'Visualizaciones';
      case 'backup': return 'Respaldo completo';
      default: return t;
    }
  }

  function suggestedFilenameFromHeaders(res, fallbackName) {
    const cd = res?.headers?.['content-disposition'] || res?.headers?.['Content-Disposition'];
    if (cd && /filename=/i.test(cd)) {
      const match = cd.match(/filename\*?=(?:UTF-8'')?"?([^";\n]+)/i);
      if (match?.[1]) {
        try { return decodeURIComponent(match[1].replace(/"/g, '')); }
        catch { return match[1].replace(/"/g, ''); }
      }
    }
    return fallbackName;
  }

  function defaultFilename() {
    const ext = EXT_BY_FORMAT[formato] || 'dat';
    const date = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
    const base = tipo === 'lecturas' && sensorId ? `lecturas-${sensorId}` : tipo;
    return `${base}-${stamp}.${ext}`;
  }

  function addQueryIfPresent(params, key, value) {
    if (value != null && String(value).trim() !== '') {
      params.append(key, String(value).trim());
    }
  }

  // convierte YYYY-MM-DD → ISO inicio/fin del día; soporta también datetime-local
  function toISODateOrDateTime(str, endOfDay = false) {
    if (!str) return '';
    if (str.includes('T')) {
      const ms = Date.parse(str);
      return Number.isNaN(ms) ? '' : new Date(ms).toISOString();
    }
    // sólo fecha
    const [y, m, d] = str.split('-').map(Number);
    if (!y || !m || !d) return '';
    const dt = endOfDay ? new Date(y, m - 1, d, 23, 59, 59, 999) : new Date(y, m - 1, d, 0, 0, 0, 0);
    return dt.toISOString();
  }

  async function manejarExportacion() {
    if (!canDownload) return;
    try {
      setDownloading(true);

      // Construcción de path relativo (axiosInstance ya tiene baseURL = `${API}/api`)
      let path = '';
      switch (tipo) {
        case 'usuarios':         path = `/exportar/usuarios`; break;
        case 'proyectos':        path = `/exportar/proyectos`; break;
        case 'logs':             path = `/exportar/logs`; break;
        case 'lecturas':
          if (!sensorId.trim()) {
            toast.warning('Selecciona un ID de sensor para exportar lecturas.');
            setDownloading(false);
            return;
          }
          path = `/exportar/lecturas/${formato}`; // lecturas usa /:formato
          break;
        case 'alertas':          path = `/exportar/alertas`; break;
        case 'sensores':         path = `/exportar/sensores`; break;
        case 'visualizaciones':  path = `/exportar/visualizaciones`; break;
        case 'backup':           path = `/exportar/backup`; break;
        default:
          toast.error('Tipo de exportación no soportado.');
          setDownloading(false);
          return;
      }

      // Query params
      const params = new URLSearchParams();
      if (tipo !== 'lecturas' && tipo !== 'backup') {
        params.append('formato', formato);
      }

      // Filtros comunes
      const fromISO = toISODateOrDateTime(from, false);
      const toISO   = toISODateOrDateTime(to, true);
      addQueryIfPresent(params, 'q', q);
      addQueryIfPresent(params, 'from', fromISO);
      addQueryIfPresent(params, 'to', toISO);

      // Campos específicos
      if (tipo === 'lecturas') {
        addQueryIfPresent(params, 'sensor', sensorId);
        addQueryIfPresent(params, 'bucket', bucket);
      }

      const qs = params.toString();
      const url = qs ? `${path}?${qs}` : path;

      const res = await axiosInstance.get(url, {
        responseType: 'blob',
        withCredentials: true,
        headers: csrfToken ? { 'x-csrf-token': csrfToken } : {},
      });

      const fallback = defaultFilename();
      const filename = suggestedFilenameFromHeaders(res, fallback);

      const blob = new Blob([res.data]);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);

      toast.success('Descarga iniciada.');
    } catch (err) {
      console.error('❌ Error al exportar:', err);
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.msg ||
        (status === 403 ? 'CSRF inválido o ausente.' : 'Error al exportar datos.');
      toast.error(msg);
    } finally {
      setDownloading(false);
    }
  }

  const formatosDisponibles = FORMATS_BY_TYPE[tipo] ?? ['csv'];
  const showAdvanced = showFilters && tipo !== 'backup';

  return (
    <div className="relative min-h-[calc(100vh-var(--header-h,80px))]">
      {/* Fondo suave como en Admin */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-black/[0.03] dark:bg-white/[0.04] blur-2xl" />
        <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-black/[0.03] dark:bg-white/[0.04] blur-2xl" />
      </div>

      <div className="p-8 max-w-3xl mx-auto space-y-10 fade-in-down">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-light-text dark:text-white flex items-center justify-center gap-2">
            <DownloadCloud className="w-7 h-7 text-primary" />
            Exportar Datos
          </h1>
          <p className="text-sm text-light-muted dark:text-dark-muted">
            Descarga los datos del sistema con filtros opcionales y formatos flexibles.
          </p>
        </div>

        {/* Card principal */}
        <div className="space-y-6 bg-white/80 dark:bg-white/[0.05] border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-lg backdrop-blur">
          {/* Tipo */}
          <div className="space-y-1">
            <label className="form-label">Tipo de datos</label>
            <div className="relative">
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="select-pro w-full"
              >
                <option value="usuarios">Usuarios</option>
                <option value="proyectos">Proyectos</option>
                <option value="logs">Logs</option>
                <option value="lecturas">Lecturas (por sensor)</option>
                <option value="alertas">Alertas</option>
                <option value="sensores">Sensores</option>
                <option value="visualizaciones">Visualizaciones</option>
                <option value="backup">Respaldo completo (ZIP)</option>
              </select>
              <ChevronDown className="chev absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted dark:text-dark-muted pointer-events-none" />
            </div>
            {tipo === 'backup' && (
              <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
                El respaldo completo ignora filtros y siempre genera un .zip.
              </p>
            )}
          </div>

          {/* Sensor y bucket si aplica */}
          {tipo === 'lecturas' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="form-label">
                  ID del sensor <span className="text-xs text-light-muted dark:text-dark-muted">(requerido)</span>
                </label>
                <input
                  type="text"
                  value={sensorId}
                  onChange={(e) => setSensorId(e.target.value)}
                  placeholder="Ej: 661234abc123..."
                  className={`form-input-md ${!sensorId.trim() && downloading ? 'border-red-400' : ''}`}
                />
              </div>
              <div>
                <label className="form-label">Bucket (opcional)</label>
                <input
                  type="text"
                  value={bucket}
                  onChange={(e) => setBucket(e.target.value)}
                  placeholder="p. ej. 5m, 15m, 1h"
                  className="form-input-md"
                />
              </div>
            </div>
          )}

          {/* Formato */}
          <div className="space-y-1">
            <label className="form-label">Formato</label>
            <div className="relative">
              <select
                value={formato}
                onChange={(e) => setFormato(e.target.value)}
                className="select-pro w-full"
                disabled={tipo === 'backup'}
              >
                {formatosDisponibles.map((f) => (
                  <option key={f} value={f}>
                    {f === 'excel' ? 'Excel (.xlsx)' :
                      f === 'zip' ? 'ZIP' :
                      f.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="chev absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted dark:text-dark-muted pointer-events-none" />
            </div>
          </div>

          {/* Filtros opcionales */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowFilters(v => !v)}
              className="btn btn-outline-primary w-full rotate-on-press"
              aria-expanded={showFilters}
              disabled={tipo === 'backup'}
            >
              <ChevronDown className="chev w-4 h-4" />
              {tipo === 'backup'
                ? 'Los filtros no aplican para respaldo completo'
                : showFilters ? 'Ocultar filtros' : 'Mostrar filtros (opcional)'}
            </button>

            {showAdvanced && (
              <div className="animate-fade-in-down grid grid-cols-1 gap-4 bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-xl p-4">
                {/* fila 1: búsqueda + rango pro */}
                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <div className="flex items-center gap-2 rounded-xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.04] px-3 py-1.5">
                    <span className="text-xs text-light-muted dark:text-dark-muted">Búsqueda</span>
                    <input
                      type="text"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Texto a buscar…"
                      className="bg-transparent outline-none text-sm w-full placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <DateRangePicker
                    from={from}
                    to={to}
                    onChange={({ from: f, to: tto }) => { setFrom(f); setTo(tto); }}
                  />
                </div>

                {/* acciones filtros */}
                <div className="flex items-center justify-end gap-2">
                  {(q || from || to) && (
                    <button
                      type="button"
                      onClick={() => { setQ(''); setFrom(''); setTo(''); }}
                      className="text-xs underline text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Resumen */}
          <div className="bg-white/80 dark:bg-white/[0.04] border border-light-border dark:border-dark-border rounded-lg p-3 text-sm text-light-text/80 dark:text-dark-text/80">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="px-2 py-1 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                <strong>Tipo:</strong> {humanTipoLabel(tipo)}
              </span>
              <span className="px-2 py-1 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                <strong>Formato:</strong> {formato === 'excel' ? 'Excel (.xlsx)' : formato.toUpperCase()}
              </span>
              {tipo === 'lecturas' && sensorId.trim() && (
                <span className="px-2 py-1 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                  <strong>Sensor:</strong> {sensorId.trim()}
                </span>
              )}
              {bucket && tipo === 'lecturas' && (
                <span className="px-2 py-1 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                  <strong>Bucket:</strong> {bucket}
                </span>
              )}
              {(from || to) && (
                <span className="px-2 py-1 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                  <strong>Rango:</strong>{' '}
                  {from ? new Date(from).toLocaleDateString() : '—'} → {to ? new Date(to).toLocaleDateString() : '—'}
                </span>
              )}
              {q && (
                <span className="px-2 py-1 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                  <strong>Filtro:</strong> “{q}”
                </span>
              )}
              <span className="px-2 py-1 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                <strong>Archivo:</strong> {defaultFilename()}
              </span>
              <span className={`px-2 py-1 rounded border ${csrfToken
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-900/30'
                : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-900/30'
              }`}>
                {csrfToken ? 'Seguridad lista (CSRF)' : 'Preparando CSRF…'}
              </span>
            </div>
          </div>

          {/* Acción */}
          <div className="pt-2">
            <Button onClick={manejarExportacion} className="w-full" disabled={!canDownload} aria-busy={downloading}>
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Preparando…
                </>
              ) : (
                <>
                  <FileDown className="w-5 h-5 mr-2" />
                  Descargar archivo
                </>
              )}
            </Button>

            {!csrfToken && (
              <p className="text-xs text-light-muted dark:text-dark-muted mt-2 text-center">
                Si ves un 403, intenta nuevamente cuando el token CSRF esté listo.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
