// src/pages/proyectos/DetalleThing.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '@/api/axiosInstance';
import { getCsrfToken } from '@/api/auth.api';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';

import {
  Settings,
  LineChart as LineIcon,
  FileDown,
  AlertTriangle,
  Gauge,
  ListTree,
  Cpu,
  Power,
  RotateCcw,
} from 'lucide-react';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

import ControlSwitch from '@/widgets/thing/ControlSwitch';
import MetricTile from '@/widgets/thing/MetricTile';
import { sendCommand } from '@/api/deviceActions.api';
import { toast } from 'sonner';

const COLORS = ['#6366F1', '#22C55E', '#FBBF24', '#EC4899', '#10B981', '#F97316'];

export default function ProyectoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [proyecto, setProyecto] = useState(null);
  const [sensores, setSensores] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [dispositivo, setDispositivo] = useState(null);

  // ---------- fetch ----------
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const csrf = await getCsrfToken();
        const cfg = { headers: { 'x-csrf-token': csrf }, withCredentials: true };

        const [resProyecto, resSensores, resAlertas] = await Promise.all([
          axiosInstance.get(`/proyectos/${id}`, cfg),
          axiosInstance.get(`/sensores`, { ...cfg, params: { proyecto: id } }),
          axiosInstance.get(`/alertas/historial/proyecto`, { ...cfg, params: { proyecto: id } }),
        ]);

        const proj = resProyecto.data || null;
        setProyecto(proj);
        setSensores(Array.isArray(resSensores.data) ? resSensores.data : []);
        setAlertas(Array.isArray(resAlertas.data) ? resAlertas.data : []);

        if (proj?.dispositivoId) {
          try {
            const { data: disp } = await axiosInstance.get(`/dispositivos/${proj.dispositivoId}`, cfg);
            setDispositivo(disp || null);
          } catch {
            setDispositivo(null);
          }
        } else {
          setDispositivo(null);
        }
      } catch (err) {
        console.error('❌ Error cargando proyecto:', err);
        setProyecto(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ---------- datos derivados ----------
  const tiposSensoresMap = useMemo(() => {
    return sensores.reduce((acc, s) => {
      let tipo = (s.tipo || '').toString().trim();
      if (!tipo) return acc;
      tipo = tipo.charAt(0).toUpperCase() + tipo.slice(1);
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});
  }, [sensores]);

  const datosTipos = useMemo(
    () => Object.entries(tiposSensoresMap).map(([name, value]) => ({ name, value })),
    [tiposSensoresMap]
  );

  const alertasPorSensor = useMemo(() => {
    const map = sensores.map((s) => ({
      nombre: s.nombre || s._id?.slice(0, 6) || 'Sensor',
      total: alertas.filter((a) => a.sensor?._id === s._id).length,
    }));
    return map.sort((a, b) => b.total - a.total);
  }, [sensores, alertas]);

  const lastAlert =
    alertas.length > 0
      ? alertas
          .slice()
          .sort((a, b) => new Date(b?.timestamp || b?.fecha) - new Date(a?.timestamp || a?.fecha))[0]
      : null;

  const kpis = [
    { label: 'Sensores', value: sensores.length, icon: <Gauge className="w-4 h-4" /> },
    { label: 'Tipos distintos', value: Object.keys(tiposSensoresMap).length, icon: <ListTree className="w-4 h-4" /> },
    { label: 'Alertas (total)', value: alertas.length, icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> },
    {
      label: 'Última alerta',
      value: lastAlert ? new Date(lastAlert.timestamp || lastAlert.fecha).toLocaleString() : '—',
      icon: <Cpu className="w-4 h-4" />,
    },
  ];

  // ---------- export ----------
  const handleExport = async (formato) => {
    try {
      setExporting(true);
      const csrf = await getCsrfToken();
      const { data } = await axiosInstance.get(`/exportar/proyectos/${id}/${formato}`, {
        headers: { 'x-csrf-token': csrf },
        responseType: 'blob',
        withCredentials: true,
      });

      const blob = new Blob([data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `proyecto_${id}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
      link.click();
    } catch (err) {
      console.error('❌ Error exportando:', err);
    } finally {
      setExporting(false);
    }
  };

  // ---------- comandos ----------
  const handleReboot = async () => {
    if (!dispositivo?._id && !proyecto?.dispositivoId) return;
    const deviceId = dispositivo?._id || proyecto.dispositivoId;
    try {
      await sendCommand(deviceId, 'reboot');
      toast.success('Comando enviado: reiniciar');
    } catch (e) {
      toast.error('No se pudo enviar el comando');
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
          <div className="grid md:grid-cols-4 gap-4 mt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-gray-900 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="p-8 max-w-6xl mx-auto text-gray-600 dark:text-gray-300">
        No se pudo cargar el proyecto.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      {/* Header (título izq / volver der) */}
      <header className="space-y-3">
        <div className="flex items-start md:items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {proyecto.nombre}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{proyecto.descripcion}</p>
          </div>
          <BackButton fallback="/proyectos" />
        </div>

        {/* Toolbar: acciones izq / export der */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-wrap gap-2">
            <Link to={`/proyectos/${id}/editar-thing`}>
              <Button variant="secondary">
                <Settings className="w-4 h-4 mr-2" /> Editar
              </Button>
            </Link>
            <Link to={`/proyectos/${id}/lecturas`}>
              <Button variant="primary">
                <LineIcon className="w-4 h-4 mr-2" /> Lecturas
              </Button>
            </Link>
            <Link to={`/proyectos/${id}/visualizacion`}>
              <Button variant="success">
                <LineIcon className="w-4 h-4 mr-2" /> Visualización
              </Button>
            </Link>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => handleExport('excel')} variant="outline" disabled={exporting}>
              <FileDown className="w-4 h-4 mr-2" /> Exportar Excel
            </Button>
            <Button onClick={() => handleExport('pdf')} variant="ghost" disabled={exporting}>
              <FileDown className="w-4 h-4 mr-2" /> Exportar PDF
            </Button>
          </div>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl p-4 border bg-white/90 dark:bg-gray-900 border-light-border dark:border-dark-border shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {k.label}
              </div>
              <div className="text-gray-500 dark:text-gray-400">{k.icon}</div>
            </div>
            <div className="text-2xl font-semibold mt-2">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Panel de control del dispositivo (si hay dispositivo asociado) */}
      {proyecto.dispositivoId && (
        <Card
          title="Control del dispositivo"
          right={
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReboot}
                disabled={!proyecto.dispositivoId}
                title="Reiniciar dispositivo"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <MetricTile title="UID" value={dispositivo?.uid || '—'} subtitle="Identificador" />
            <MetricTile title="Firmware" value={dispositivo?.estado?.fw || '—'} subtitle="Versión" />
            <MetricTile
              title="Última conexión"
              value={dispositivo?.ultimaConexion ? new Date(dispositivo.ultimaConexion).toLocaleTimeString() : '—'}
              subtitle={dispositivo?.ultimaConexion ? new Date(dispositivo.ultimaConexion).toLocaleString() : ''}
            />
            <MetricTile title="IP" value={dispositivo?.ipUltimaConexion || '—'} subtitle="Última IP" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Ejemplos de desired; cambia desiredKey según tu gemelo digital */}
            <ControlSwitch deviceId={proyecto.dispositivoId} label="Bomba" desiredKey="pumpOn" />
            <ControlSwitch deviceId={proyecto.dispositivoId} label="Luz" desiredKey="lightOn" />
            <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-white/70 dark:bg-white/[0.03]">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Acciones rápidas</p>
              <div className="flex gap-2">
                <Button onClick={() => sendCommand(proyecto.dispositivoId, 'powerOn')}>
                  <Power className="w-4 h-4 mr-2" /> Encender
                </Button>
                <Button variant="secondary" onClick={() => sendCommand(proyecto.dispositivoId, 'powerOff')}>
                  Apagar
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Dashboard: gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Tipos de sensores">
          {datosTipos.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={datosTipos} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                  {datosTipos.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', border: 'none', color: 'white' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No hay sensores registrados con tipo definido.</p>
          )}
        </Card>

        <Card title="Alertas por sensor">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={alertasPorSensor}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', border: 'none', color: 'white' }} />
              <Bar dataKey="total" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Lista de sensores */}
      <Card title="Sensores del proyecto">
        {sensores.length ? (
          <div className="grid md:grid-cols-2 gap-3">
            {sensores.map((s) => (
              <div
                key={s._id}
                className="border rounded-xl p-3 bg-gray-50/70 dark:bg-white/5 border-light-border dark:border-dark-border"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{s.nombre || 'Sensor'}</div>
                  <span className="text-xs text-gray-500">{s.pin ? `Pin ${s.pin}` : ''}</span>
                </div>
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {s.tipo ? `Tipo: ${s.tipo}` : 'Tipo no definido'} · {s.unidad || '—'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            No hay sensores aún.{' '}
            <button
              className="text-primary underline"
              onClick={() => navigate(`/proyectos/${id}/editar-thing`)}
            >
              Añadir sensores
            </button>
            .
          </div>
        )}
      </Card>
    </div>
  );
}
