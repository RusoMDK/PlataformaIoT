import { useState, useMemo, useEffect, Fragment } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  FileText,
  ChevronDown,
  ArrowUpDown,
  SlidersHorizontal,
  Columns,
  Loader2,
  AlertTriangle,
  ChevronDown as ChDown,
} from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import Input from './Input';
import Button from './Button';

/* ================= helpers ================= */

const getVal = (row, pathOrFn) => {
  if (typeof pathOrFn === 'function') return pathOrFn(row);
  return String(pathOrFn || '')
    .split('.')
    .reduce((a, k) => (a == null ? a : a[k]), row);
};

const useDebounced = (value, ms = 250) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
};

const cls = (...parts) => parts.filter(Boolean).join(' ');

/* ================ TablaPro ================ */

export default function TablaPro({
  id = 'tabla',
  columnas = [],
  datos = [],
  total = null,
  loading = false,
  error = null,
  onRetry,
  acciones = [],
  accionesLabel = 'Acciones',
  seleccionados = [],
  setSeleccionados = () => {},
  onEliminarSeleccionados = () => {},
  onExportCSV,
  serverMode = false,
  page: cPage,
  pageSize: cPageSize,
  onPageChange,
  onPageSizeChange,
  sortBy: cSortBy,
  sortDir: cSortDir, // 'asc' | 'desc'
  onSortChange,
  onSearch, // (q)=>void
  initialQuery = '',
  rowKey = '_id',
  expandible = false,
  renderExpand = null,
  getRowClassName,
  initialDensity = 'comfortable',
  /* UX extras */
  hideToolbarSearch = false,
  toolbarLeft = null,
  toolbarRight = null,
}) {
  const storage = (k, def) => {
    if (typeof window === 'undefined') return def;
    try {
      const val = localStorage.getItem(`${id}:${k}`);
      return val == null ? def : JSON.parse(val);
    } catch {
      return def;
    }
  };
  const persist = (k, v) => {
    try {
      localStorage.setItem(`${id}:${k}`, JSON.stringify(v));
    } catch {}
  };

  /* ====== estado interno / controlado ====== */
  const [query, setQuery] = useState(initialQuery);
  const debouncedQ = useDebounced(query, 250);

  const [pageI, setPageI] = useState(storage('p', 1));
  const [ppI, setPpI] = useState(storage('pp', 20));
  const [sortByI, setSortByI] = useState(storage('sortBy', ''));
  const [sortDirI, setSortDirI] = useState(storage('sortDir', 'asc'));
  const [density, setDensity] = useState(storage('density', initialDensity));
  const [hiddenCols, setHiddenCols] = useState(storage('hiddenCols', []));

  const page = cPage ?? pageI;
  const pageSize = cPageSize ?? ppI;
  const sortBy = cSortBy ?? sortByI;
  const sortDir = cSortDir ?? sortDirI;

  const [openRows, setOpenRows] = useState(() => new Set());

  /* notifica servidor */
  useEffect(() => {
    if (!serverMode) return;
    onSearch?.(debouncedQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  /* ====== derivaciones cliente ====== */
  const visibleCols = useMemo(
    () => columnas.filter(c => !hiddenCols.includes(c.campo)),
    [columnas, hiddenCols]
  );

  const filtered = useMemo(() => {
    if (serverMode) return datos;
    const q = debouncedQ.trim().toLowerCase();
    if (!q) return datos;
    const pickable = columnas.filter(c => !hiddenCols.includes(c.campo));
    return datos.filter(r =>
      pickable.some(c =>
        String(getVal(r, c.campo) ?? '')
          .toLowerCase()
          .includes(q)
      )
    );
  }, [serverMode, datos, columnas, hiddenCols, debouncedQ]);

  const sorted = useMemo(() => {
    if (serverMode || !sortBy) return filtered;
    const dir = sortDir === 'desc' ? -1 : 1;
    return [...filtered].sort((a, b) => {
      const va = getVal(a, sortBy);
      const vb = getVal(b, sortBy);
      if (va == null && vb == null) return 0;
      if (va == null) return -1 * dir;
      if (vb == null) return 1 * dir;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }, [serverMode, filtered, sortBy, sortDir]);

  const totalLocal = total ?? sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalLocal / pageSize));

  const slice = useMemo(() => {
    if (serverMode) return datos;
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [serverMode, sorted, datos, page, pageSize]);

  useEffect(() => {
    if (!serverMode && page > totalPages) handlePageChange(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  /* ====== handlers ====== */
  function handlePageChange(p) {
    if (cPage != null) onPageChange?.(p);
    else {
      setPageI(p);
      persist('p', p);
    }
  }
  function handlePageSizeChange(n) {
    if (cPageSize != null) onPageSizeChange?.(n);
    else {
      setPpI(n);
      setPageI(1);
      persist('pp', n);
      persist('p', 1);
    }
  }
  function toggleCol(campo) {
    setHiddenCols(prev => {
      const next = prev.includes(campo) ? prev.filter(x => x !== campo) : [...prev, campo];
      persist('hiddenCols', next);
      return next;
    });
  }
  function handleSort(campo, sortable) {
    if (!sortable) return;
    const nextDir = sortBy === campo ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
    if (cSortBy != null || cSortDir != null) onSortChange?.(campo, nextDir);
    else {
      setSortByI(campo);
      setSortDirI(nextDir);
      persist('sortBy', campo);
      persist('sortDir', nextDir);
    }
  }
  function toggleRowOpen(key) {
    setOpenRows(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  }

  const allIdsInPage = useMemo(() => slice.map(r => String(getVal(r, rowKey))), [slice, rowKey]);
  const allSelected =
    allIdsInPage.length > 0 && allIdsInPage.every(id => seleccionados.includes(id));

  const toggleAll = () => {
    setSeleccionados(prev => {
      const set = new Set(prev.map(String));
      if (allSelected) allIdsInPage.forEach(id => set.delete(id));
      else allIdsInPage.forEach(id => set.add(id));
      return Array.from(set);
    });
  };

  const toggleOne = id => {
    const key = String(id);
    setSeleccionados(prev => {
      const set = new Set(prev.map(String));
      set.has(key) ? set.delete(key) : set.add(key);
      return Array.from(set);
    });
  };

  const exportCSV = () => {
    if (onExportCSV) return onExportCSV();
    const rows = serverMode ? datos : sorted;
    const headers = visibleCols.map(c => c.label);
    const lines = [headers.join(',')];
    rows.forEach(r => {
      const row = visibleCols.map(c => {
        const v = c.render ? c.render(r) : getVal(r, c.campo);
        const s = String(v ?? '').replace(/"/g, '""');
        return `"${s}"`;
      });
      lines.push(row.join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `${id}.csv` });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  /* ====== UI ====== */

  return (
    <div className="space-y-4 tbpro">
      {/* estilos finos */}
      <style>{`
        .tbpro .tbpro-scroll { scrollbar-width: thin; scrollbar-color: rgba(120,130,150,.35) transparent; }
        .tbpro .tbpro-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .tbpro .tbpro-scroll::-webkit-scrollbar-thumb { background: rgba(120,130,150,.35); border-radius: 8px; }
        .tbpro .tbpro-scroll::-webkit-scrollbar-track { background: transparent; }
        @keyframes tbpro-fade { from { opacity:.0; transform: translateY(4px);} to{opacity:1; transform:translateY(0);} }
        .tbpro .fade-in { animation: tbpro-fade .16s ease-out; }
      `}</style>

      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        {/* Izquierda: slot o buscador */}
        <div className="flex items-center gap-2">
          {toolbarLeft}
          {!hideToolbarSearch && (
            <div className="flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] px-3 py-1.5 min-w-[260px]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className="text-gray-500 dark:text-gray-400"
              >
                <path
                  fill="currentColor"
                  d="m21.53 20.47l-4.66-4.66A7.94 7.94 0 0 0 18 10a8 8 0 1 0-8 8a7.94 7.94 0 0 0 5.81-2.13l4.66 4.66zm-13.53-4.47a6 6 0 1 1 6-6a6 6 0 0 1-6 6"
                />
              </svg>
              <Input
                placeholder="Buscar…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="bg-transparent outline-none border-0 shadow-none focus:ring-0 px-0"
              />
            </div>
          )}
        </div>

        {/* Derecha: ahora → Page size → slot (Refrescar) → Densidad → Columnas → CSV */}
        <div className="flex items-center gap-2">
          {/* Page size */}
          <Menu as="div" className="relative">
            <Menu.Button className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 bg-white dark:bg-[#0b0f1a] border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition text-sm">
              {pageSize} / pág.
              <ChevronDown size={14} className="chev opacity-60" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition duration-100 ease-out"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition duration-75 ease-in"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-50 mt-1 w-36 rounded-xl bg-white dark:bg-[#0b0f1a] shadow ring-1 ring-black/10 dark:ring-white/10 overflow-hidden">
                {[5, 10, 20, 50, 100].map(n => (
                  <Menu.Item key={n}>
                    {({ active }) => (
                      <button
                        className={cls(
                          'w-full px-3 py-2 text-left',
                          active && 'bg-primary/10 dark:bg-primary/20'
                        )}
                        onClick={() => handlePageSizeChange(n)}
                      >
                        {n} por página
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>

          {/* slot del padre (usa esto para el botón Refrescar) */}
          {toolbarRight}

          {/* Densidad */}
          <Menu as="div" className="relative">
            <Menu.Button className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm bg-white dark:bg-[#0b0f1a] border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition">
              <SlidersHorizontal size={16} />
              {density === 'compact' ? 'Compacta' : 'Cómoda'}
              <ChevronDown size={14} className="chev opacity-60" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition duration-100 ease-out"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition duration-75 ease-in"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-50 mt-1 w-40 rounded-xl bg-white dark:bg-[#0b0f1a] shadow ring-1 ring-black/10 dark:ring-white/10 overflow-hidden">
                {['comfortable', 'compact'].map(opt => (
                  <Menu.Item key={opt}>
                    {({ active }) => (
                      <button
                        className={cls(
                          'w-full px-3 py-2 text-sm text-left',
                          active && 'bg-primary/10 dark:bg-primary/20'
                        )}
                        onClick={() => {
                          setDensity(opt);
                          persist('density', opt);
                        }}
                      >
                        {opt === 'compact' ? 'Compacta' : 'Cómoda'}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Columnas */}
          <Menu as="div" className="relative">
            <Menu.Button className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm bg-white dark:bg-[#0b0f1a] border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition">
              <Columns size={16} />
              Columnas
              <ChevronDown size={14} className="chev opacity-60" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition duration-100 ease-out"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition duration-75 ease-in"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-50 mt-1 w-56 rounded-xl bg-white dark:bg-[#0b0f1a] shadow ring-1 ring-black/10 dark:ring-white/10 overflow-hidden max-h-[60vh] tbpro-scroll overflow-y-auto">
                {columnas.map(c => (
                  <Menu.Item key={c.campo}>
                    {({ active }) => (
                      <label
                        className={cls(
                          'w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer',
                          active && 'bg-primary/10 dark:bg-primary/20'
                        )}
                      >
                        <input
                          type="checkbox"
                          className="accent-primary"
                          checked={!hiddenCols.includes(c.campo)}
                          onChange={() => toggleCol(c.campo)}
                        />
                        <span>{c.label}</span>
                      </label>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Export (solo si el padre provee onExportCSV) */}
          {onExportCSV && (
            <Button size="sm" variant="outline" onClick={exportCSV}>
              <FileText size={15} className="mr-1" /> CSV
            </Button>
          )}
        </div>
      </div>

      {/* Barra de selección */}
      <div
        className={cls(
          'overflow-hidden transition-[max-height] duration-200',
          seleccionados.length ? 'max-h-12' : 'max-h-0'
        )}
      >
        {seleccionados.length > 0 && (
          <div className="flex justify-between items-center bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-900/30 p-3 rounded-xl">
            <span className="text-sm text-red-700 dark:text-red-300">
              {seleccionados.length} seleccionados
            </span>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onEliminarSeleccionados(seleccionados)}
            >
              <Trash2 size={15} className="mr-1" /> Eliminar
            </Button>
          </div>
        )}
      </div>

      {/* Contenedor tabla */}
      <div className="w-full overflow-x-auto tbpro-scroll border rounded-2xl shadow bg-white dark:bg-[#0b0f1a] border-black/10 dark:border-white/10">
        <table className="w-full min-w-max text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-white/90 dark:bg-[#0b0f1a]/90 backdrop-blur text-gray-700 dark:text-gray-100">
              <th className="w-10 p-2 border-b border-black/10 dark:border-white/10 text-center align-middle">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Seleccionar página"
                />
              </th>
              {visibleCols.map(c => {
                const sortable = c.sortable !== false;
                const isActive = sortBy === c.campo;
                const isAsc = isActive && sortDir === 'asc';
                return (
                  <th
                    key={c.campo}
                    className={cls(
                      'p-2 border-b border-black/10 dark:border-white/10 font-medium text-left whitespace-nowrap select-none',
                      c.ancho
                    )}
                  >
                    <button
                      className={cls(
                        'inline-flex items-center gap-1',
                        sortable ? 'hover:text-primary transition' : 'cursor-default'
                      )}
                      onClick={() => handleSort(c.campo, sortable)}
                      disabled={!sortable}
                      title={sortable ? 'Ordenar' : undefined}
                    >
                      {c.label}
                      {sortable && (
                        <span
                          className={cls('inline-flex', isActive ? 'text-primary' : 'opacity-60')}
                        >
                          <ChDown
                            size={14}
                            className={cls('chev', isAsc ? 'rotate-180' : 'rotate-0')}
                          />
                        </span>
                      )}
                    </button>
                  </th>
                );
              })}
              {acciones.length > 0 && (
                <th className="p-2 border-b border-black/10 dark:border-white/10 whitespace-nowrap w-[180px]">
                  {accionesLabel}
                </th>
              )}{' '}
              {expandible && (
                <th className="p-2 border-b border-black/10 dark:border-white/10 w-10" />
              )}
            </tr>
          </thead>

          <tbody key={`${page}-${pageSize}-${sortBy}-${sortDir}`} className="fade-in">
            {loading && !datos.length ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  <td colSpan={visibleCols.length + 2} className="p-4">
                    <div className="h-5 w-full rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-white/10 dark:via-white/5 dark:to-white/10 animate-pulse" />
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={visibleCols.length + 2} className="p-6">
                  <div className="flex items-start gap-3 text-red-700 dark:text-red-300">
                    <AlertTriangle className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{error}</p>
                      {onRetry && (
                        <Button variant="secondary" size="sm" className="mt-2" onClick={onRetry}>
                          Reintentar
                        </Button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ) : slice.length ? (
              slice.map((r, idx) => {
                const key = String(getVal(r, rowKey) ?? idx);
                const isOpen = openRows.has(key);
                return (
                  <Fragment key={key}>
                    <tr
                      className={cls(
                        'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors',
                        'border-b border-black/5 dark:border-white/[0.08]',
                        getRowClassName?.(r)
                      )}
                    >
                      <td className="w-10 p-2 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={seleccionados.map(String).includes(key)}
                          onChange={() => toggleOne(key)}
                          aria-label="Seleccionar fila"
                        />
                      </td>

                      {visibleCols.map(col => (
                        <td
                          key={col.campo}
                          className={cls(
                            'p-2 align-top',
                            density === 'compact' ? 'py-1.5' : 'py-2.5'
                          )}
                        >
                          {col.render ? col.render(r) : String(getVal(r, col.campo) ?? '')}
                        </td>
                      ))}

                      {acciones.length > 0 && (
                        <td className="p-2 align-top">
                          <div className="flex justify-end flex-wrap gap-1">
                            {acciones.map(({ label, variant = 'default', icono, onClick }, i) => (
                              <Button
                                key={i}
                                size="sm"
                                variant={variant}
                                onClick={() => onClick(r)}
                              >
                                {icono} {label}
                              </Button>
                            ))}
                          </div>
                        </td>
                      )}

                      {expandible && (
                        <td className="p-2 align-top text-right">
                          <button
                            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition"
                            onClick={() => toggleRowOpen(key)}
                            aria-label={isOpen ? 'Contraer' : 'Expandir'}
                            aria-expanded={isOpen}
                          >
                            {/* Rotación automática vía CSS .chev + [aria-expanded="true"] */}
                            <ChDown size={16} className="chev" />
                          </button>
                        </td>
                      )}
                    </tr>

                    {expandible && isOpen && (
                      <tr>
                        <td
                          colSpan={visibleCols.length + (acciones.length ? 2 : 1)}
                          className="p-0"
                        >
                          <div className="px-4 py-3 bg-black/[0.03] dark:bg-white/[0.04] border-t border-black/5 dark:border-white/[0.08]">
                            {renderExpand ? (
                              renderExpand(r)
                            ) : (
                              <pre className="text-xs overflow-auto tbpro-scroll max-h-64 p-3 rounded-lg bg-black/5 dark:bg-white/10">
                                {JSON.stringify(r, null, 2)}
                              </pre>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={visibleCols.length + 2}
                  className="p-6 text-center text-gray-400 dark:text-gray-500"
                >
                  No se encontraron resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* footer paginación (SIN selector de page size ahora) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
        <div className="text-gray-600 dark:text-gray-400">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
            </span>
          ) : (
            <>
              Mostrando{' '}
              <strong>
                {serverMode
                  ? `${(page - 1) * pageSize + (totalLocal ? 1 : 0)}–${Math.min(
                      page * pageSize,
                      totalLocal
                    )}`
                  : `${Math.min(1 + (page - 1) * pageSize, totalLocal)}–${Math.min(
                      page * pageSize,
                      totalLocal
                    )}`}
              </strong>{' '}
              de <strong>{totalLocal}</strong>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            disabled={page === 1 || loading}
            onClick={() => handlePageChange(page - 1)}
          >
            <ChevronLeft size={15} /> Anterior
          </Button>
          <span className="px-2">
            Página <strong>{page}</strong> de <strong>{Math.max(1, totalPages)}</strong>
          </span>
          <Button
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => handlePageChange(page + 1)}
          >
            Siguiente <ChevronRight size={15} />
          </Button>
        </div>
      </div>
    </div>
  );
}
