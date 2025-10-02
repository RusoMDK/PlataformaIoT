// src/pages/proyectos/Lecturas.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/api/axiosInstance';
import { getCsrfToken } from '@/api/auth.api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import { saveAs } from 'file-saver';
import TablaPro from '@/components/ui/TablaPro';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import { RefreshCcw, Play, Pause, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function Lecturas() {
  const { id } = useParams();
  const [lecturas, setLecturas] = useState([]);
  const [sensorId, setSensorId] = useState('');
  const [sensores, setSensores] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const timerRef = useRef(null);

  // -------- sensores --------
  const fetchSensores = async () => {
    try {
      const csrf = await getCsrfToken();
      const { data } = await axiosInstance.get('/sensores', {
        params: { proyecto: id },
        headers: { 'x-csrf-token': csrf },
        withCredentials: true,
      });
      const arr = Array.isArray(data) ? data : [];
      setSensores(arr);
      if (arr.length > 0) setSensorId((prev) => prev || arr[0]._id);
    } catch (err) {
      console.error('❌ Error al obtener sensores:', err);
      toast.error('Error al obtener sensores');
    }
  };

  // -------- lecturas --------
  const fetchLecturas = async () => {
    if (!sensorId) return;
    setLoading(true);
    try {
      const csrf = await getCsrfToken();
      const params = {
        sensor: sensorId,
        pagina,
        limite: 200, // densidad para la gráfica
        ...(desde && { desde }),
        ...(hasta && { hasta }),
      };

      const { data } = await axiosInstance.get('/lecturas/optimizado', {
        params,
        headers: { 'x-csrf-token': csrf },
        withCredentials: true,
      });

      setLecturas(Array.isArray(data?.lecturas) ? data.lecturas : []);
      setTotalPaginas(data?.paginas || 1);
    } catch (err) {
      console.error('❌ Error al obtener lecturas:', err);
      toast.error('No se pudieron obtener las lecturas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSensores(); }, [id]);
  useEffect(() => { fetchLecturas(); }, [sensorId, pagina, desde, hasta]);

  // Auto-refresh: cada 5s
  useEffect(() => {
    if (!autoRefresh) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => fetchLecturas(), 5000);
    return () => clearInterval(timerRef.current);
  }, [autoRefresh, sensorId, pagina, desde, hasta]);

  // -------- export --------
  const exportarExcel = async () => {
    if (!sensorId) return;
    try {
      const csrf = await getCsrfToken();
      const { data } = await axiosInstance.get('/exportar/excel', {
        params: { sensor: sensorId },
        responseType: 'blob',
        headers: { 'x-csrf-token': csrf },
        withCredentials: true,
      });
      saveAs(new Blob([data]), 'lecturas.xlsx');
    } catch (err) {
      console.error('❌ Error al exportar Excel:', err);
      toast.error('No se pudo exportar Excel');
    }
  };

  const exportarPDF = async () => {
    if (!sensorId) return;
    try {
      const csrf = await getCsrfToken();
      const { data } = await axiosInstance.get('/exportar/pdf', {
        params: { sensor: sensorId },
        responseType: 'blob',
        headers: { 'x-csrf-token': csrf },
        withCredentials: true,
      });
      saveAs(new Blob([data]), 'lecturas.pdf');
    } catch (err) {
      console.error('❌ Error al exportar PDF:', err);
      toast.error('No se pudo exportar PDF');
    }
  };

  const columnas = useMemo(
    () => [
      { Header: 'Fecha', accessor: (row) => new Date(row.timestamp).toLocaleString() },
      { Header: 'Valor', accessor: 'valor' },
    ],
    []
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 bg-light-bg dark:bg-dark-bg rounded-xl transition-colors">
      {/* Header: título izq / volver der */}
      <header className="space-y-3">
        <div className="flex items-start md:items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lecturas</h1>
          <BackButton fallback={`/proyectos/${id}`} />
        </div>
      </header>

      {/* Filtros + Acciones (todo en una fila en md+) */}
      <div className="flex items-end gap-2 md:gap-3 lg:gap-4 flex-wrap md:flex-nowrap">
        {/* Sensor */}
        <div className="min-w-[220px] shrink-0">
          <label className="form-label">Sensor</label>
          <div className="relative">
            <select
              value={sensorId}
              onChange={(e) => { setSensorId(e.target.value); setPagina(1); }}
              className="select-pro"
            >
              {sensores.map((s) => (
                <option key={s._id} value={s._id}>{s.nombre}</option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Desde */}
        <div className="w-[150px] shrink-0">
          <label className="form-label">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => { setDesde(e.target.value); setPagina(1); }}
            className="date-pro"
          />
        </div>

        {/* Hasta */}
        <div className="w-[150px] shrink-0">
          <label className="form-label">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => { setHasta(e.target.value); setPagina(1); }}
            className="date-pro"
          />
        </div>

        {/* Acciones: Actualizar / Auto */}
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="secondary" onClick={fetchLecturas} className="whitespace-nowrap">
            <RefreshCcw className="w-4 h-4 mr-2" /> Actualizar
          </Button>
          <Button
            size="sm"
            variant={autoRefresh ? 'danger' : 'outline'}
            onClick={() => setAutoRefresh((v) => !v)}
            title="Auto-refresco cada 5s"
            className="whitespace-nowrap"
          >
            {autoRefresh ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {autoRefresh ? 'Pausar' : 'Auto'}
          </Button>
        </div>

        {/* Descargas a la derecha (compactas) */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Button size="sm" onClick={exportarExcel} variant="outline" disabled={!sensorId} className="whitespace-nowrap">
            <Download className="w-4 h-4 mr-2" /> Excel
          </Button>
          <Button size="sm" onClick={exportarPDF} variant="outline" disabled={!sensorId} className="whitespace-nowrap">
            <Download className="w-4 h-4 mr-2" /> PDF
          </Button>
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="h-72 bg-gray-100 dark:bg-gray-900 rounded-xl animate-pulse" />
      ) : lecturas.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={lecturas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tickFormatter={(v) => new Date(v).toLocaleTimeString()} />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(31,41,55,0.9)', border: 'none', color: 'white' }}
                labelFormatter={(v) => new Date(v).toLocaleString()}
              />
              <Line type="monotone" dataKey="valor" stroke="#2563EB" strokeWidth={2} dot={false} />
              <Brush dataKey="timestamp" height={24} stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>

          <TablaPro columnas={columnas} datos={lecturas} sinPaginado />

          {/* Paginación simple */}
          <div className="flex justify-end items-center gap-2">
            <span className="text-sm text-gray-500">
              Página {pagina} de {totalPaginas}
            </span>
            <Button
              variant="outline"
              disabled={pagina <= 1}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
            >
              ←
            </Button>
            <Button
              variant="outline"
              disabled={pagina >= totalPaginas}
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            >
              →
            </Button>
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-500 dark:text-gray-400 p-6 border rounded-xl bg-white/60 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700">
          No hay lecturas disponibles para este sensor.
        </div>
      )}
    </div>
  );
}
