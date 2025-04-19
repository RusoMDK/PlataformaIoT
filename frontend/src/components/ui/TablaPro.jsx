import { useState, useMemo, useEffect, Fragment } from 'react';
import { ChevronLeft, ChevronRight, Trash2, FileText, ChevronDown } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import Input from './Input';
import Button from './Button';

const getVal = (row, path) => path.split('.').reduce((a, k) => a?.[k], row);

export default function TablaPro({
  columnas = [],
  datos = [],
  acciones = [],
  seleccionados = [],
  setSeleccionados = () => {},
  onEliminarSeleccionados = () => {},
}) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(() => +localStorage.getItem('tabla_p') || 1);
  const [pp, setPp] = useState(() => +localStorage.getItem('tabla_pp') || 10);
  const [openMenu, setOpenMenu] = useState(false);

  const rows = useMemo(
    () =>
      datos.filter(r =>
        columnas.some(c =>
          getVal(r, c.campo)?.toString().toLowerCase().includes(query.toLowerCase())
        )
      ),
    [datos, columnas, query]
  );

  const total = Math.max(1, Math.ceil(rows.length / pp));
  const slice = rows.slice((page - 1) * pp, page * pp);

  useEffect(() => {
    if (page > total) setPage(1);
  }, [total]);

  const toggle = id => {
    setSeleccionados(prev => {
      const set = new Set(prev);
      set.has(id) ? set.delete(id) : set.add(id);
      return Array.from(set);
    });
  };

  const toggleAll = () => {
    const ids = slice.map(r => r._id);
    const allSelected = ids.every(id => seleccionados.includes(id));
    setSeleccionados(prev => {
      const set = new Set(prev);
      if (allSelected) {
        ids.forEach(id => set.delete(id));
      } else {
        ids.forEach(id => set.add(id));
      }
      return Array.from(set);
    });
  };

  const csv = () => {
    const lines = [columnas.map(c => c.label)];
    rows.forEach(r => lines.push(columnas.map(c => getVal(r, c.campo) ?? '')));
    const blob = new Blob([lines.map(l => l.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: 'tabla.csv' }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <Input
          placeholder="🔍 Buscar…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Menu as="div" className="relative">
            <Menu.Button
              onClick={() => setOpenMenu(!openMenu)}
              className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-muted/10 transition-all"
            >
              {pp} / pág.
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${
                  openMenu ? 'rotate-180' : 'rotate-0'
                }`}
              />
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
              <Menu.Items className="absolute z-50 mt-1 w-full rounded-xl bg-white dark:bg-dark-surface shadow ring-1 ring-black/10 overflow-hidden">
                {[5, 10, 20, 50].map(n => (
                  <Menu.Item key={n}>
                    {({ active }) => (
                      <button
                        className={`w-full px-3 py-2 text-sm text-left transition ${
                          active ? 'bg-primary/10 dark:bg-primary-dark/20' : ''
                        }`}
                        onClick={() => {
                          setPp(n);
                          setPage(1);
                          localStorage.setItem('tabla_pp', n);
                          setOpenMenu(false);
                        }}
                      >
                        {n} por página
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>

          <Button size="sm" variant="outline" onClick={csv}>
            <FileText size={15} className="mr-1" /> CSV
          </Button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-[max-height] duration-200 ${
          seleccionados.length ? 'max-h-12' : 'max-h-0'
        }`}
      >
        {seleccionados.length > 0 && (
          <div className="flex justify-between items-center bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 p-3 rounded-xl">
            <span className="text-sm text-red-600 dark:text-red-300">
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

      <div className="w-full max-w-none overflow-x-auto overflow-y-auto scrollbar-gutter-stable border rounded-xl shadow bg-white dark:bg-dark-surface min-h-[320px] max-h-[70vh]">
        <table className="w-full min-w-max table-auto text-sm">
          <thead>
            <tr className="bg-white/80 dark:bg-gray-950/80 text-gray-700 dark:text-white">
              <th className="w-10 p-2 border text-center">
                <input
                  type="checkbox"
                  checked={slice.length && slice.every(r => seleccionados.includes(r._id))}
                  onChange={toggleAll}
                />
              </th>
              {columnas.map(c => (
                <th key={c.campo} className="p-2 border font-medium text-left">
                  {c.label}
                </th>
              ))}
              {acciones.length > 0 && (
                <th className="p-2 border whitespace-nowrap w-[180px]">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {slice.length ? (
              slice.map(r => (
                <tr key={r._id} className="border-t hover:bg-gray-50 dark:hover:bg-dark-muted/50">
                  <td className="w-10 p-2 border text-center">
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(r._id)}
                      onChange={() => toggle(r._id)}
                    />
                  </td>
                  {columnas.map(col => (
                    <td key={col.campo} className="p-2 border">
                      {col.render ? col.render(r) : getVal(r, col.campo)}
                    </td>
                  ))}
                  {acciones.length > 0 && (
                    <td className="p-2 border">
                      <div className="flex justify-end flex-wrap gap-1">
                        {acciones.map(({ label, variant = 'default', icono, onClick }, i) => {
                          if (variant === 'danger' && seleccionados.length) return null;
                          return (
                            <Button key={i} size="sm" variant={variant} onClick={() => onClick(r)}>
                              {icono} {label}
                            </Button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columnas.length + 2}
                  className="p-4 text-center text-gray-400 dark:text-gray-500"
                >
                  No se encontraron resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm">
        <span>
          Página {page} de {total}
        </span>
        <div className="space-x-2">
          <Button
            size="sm"
            disabled={page === 1}
            onClick={() => {
              const p = page - 1;
              setPage(p);
              localStorage.setItem('tabla_p', p);
            }}
          >
            <ChevronLeft size={15} /> Anterior
          </Button>
          <Button
            size="sm"
            disabled={page === total}
            onClick={() => {
              const p = page + 1;
              setPage(p);
              localStorage.setItem('tabla_p', p);
            }}
          >
            Siguiente <ChevronRight size={15} />
          </Button>
        </div>
      </div>
    </div>
  );
}
