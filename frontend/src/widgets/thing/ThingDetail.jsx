import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'sonner';
import { useDispositivo } from '@hooks/useDispositivo';
import useDeviceLive from '@hooks/useDeviceLive';
import ControlSwitch from '@widgets/thing/ControlSwitch';
import MetricTile from '@widgets/thing/MetricTile';
import TimeSeries from '@widgets/thing/TimeSeries';
import Button from '@components/ui/Button';
import { sendCommand } from '@api/deviceActions.api';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function ThingDetail() {
  const { id: uid } = useParams();
  const { dispositivo, sensores, loading } = useDispositivo(uid);
  const [history, setHistory] = useState({}); // { sensorId: [{ts,value}] }
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Live via socket (si no llega nada, no rompe)
  const { last, onPayload } = useDeviceLive(uid); // <- asume { last: {metrics}, onPayload(cb) para cada paquete }

  // Carga inicial de historial por cada sensor (usa tu endpoint de lecturas por sensor)
  async function fetchHistory() {
    if (!sensores?.length) return;
    try {
      setLoadingHistory(true);
      const bucket = {};
      // pedimos 100 últimos por sensor
      await Promise.all(
        sensores.map(async (s) => {
          const { data } = await axiosInstance.get('/lecturas', {
            params: { sensor: s._id, limit: 100 },
            withCredentials: true,
          });
          // Normalizamos a {ts,value}
          bucket[s._id] = (data || []).map((d) => ({
            ts: d.ts || d.timestamp || d.fecha || d.createdAt,
            value: d.value ?? d.valor,
          }));
        })
      );
      setHistory(bucket);
    } catch (e) {
      console.error(e);
      toast.error('No se pudo cargar el historial');
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sensores?.length]);

  // Suscribimos para ir agregando puntos live
  useEffect(() => {
    if (!onPayload) return;
    const off = onPayload((payload) => {
      // esperamos payload.metrics.{sensorId?: value} o {temp,hum,...}
      const metrics = payload?.metrics || {};
      setHistory((prev) => {
        const next = { ...prev };
        const ts = payload.ts || Date.now();
        // si tus sensorIds están en sensores[].id o sensores[]._id ajusta aquí:
        sensores?.forEach((s) => {
          const key = s.id || s._id || s.sensorId;
          if (!key) return;
          // heurística: tomar metrics[key] o metrics[s.tipo] si coincide
          const val = metrics[key] ?? metrics[s.tipo] ?? metrics[s.nombre];
          if (typeof val === 'number') {
            next[key] = [...(next[key] || []), { ts, value: val }].slice(-300);
          }
        });
        return next;
      });
    });
    return () => off?.();
  }, [onPayload, sensores]);

  const online = useMemo(() => {
    if (!dispositivo?.ultimaConexion) return false;
    return Date.now() - new Date(dispositivo.ultimaConexion).getTime() < 15000;
  }, [dispositivo?.ultimaConexion]);

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Cargando dispositivo…</div>;
  }
  if (!dispositivo) {
    return <div className="p-6 text-sm text-red-500">Dispositivo no encontrado</div>;
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/proyectos" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            <ArrowLeft size={16} /> Volver
          </Link>
          <h1 className="text-xl font-semibold">
            {dispositivo.nombre}{' '}
            <span className={`text-xs px-2 py-1 rounded-full ml-2 ${online ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {online ? 'Online' : 'Offline'}
            </span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={fetchHistory}
            disabled={loadingHistory}
          >
            <RefreshCw size={16} className={loadingHistory ? 'animate-spin' : ''} />
            <span className="ml-1">Refrescar historial</span>
          </Button>
          <Button
            size="sm"
            onClick={async () => {
              try {
                await sendCommand(uid, 'reboot');
                toast.success('Comando enviado: reboot');
              } catch (e) {
                toast.error('No se pudo enviar el comando');
              }
            }}
          >
            Reiniciar
          </Button>
        </div>
      </div>

      {/* Tiles rápidas (si tienes métricas live simples como temp/hum) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricTile title="UID" value={dispositivo.uid} subtitle="Identificador" />
        <MetricTile title="Firmware" value={dispositivo?.estado?.fw || '—'} subtitle="Versión" />
        <MetricTile title="Última conexión" value={online ? 'Ahora' : 'Hace un rato'} subtitle={new Date(dispositivo.ultimaConexion).toLocaleString()} />
        <MetricTile title="IP" value={dispositivo.ipUltimaConexion || '—'} subtitle="Última IP" />
      </div>

      {/* Controles (ej: bomba/luz) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <ControlSwitch deviceId={uid} label="Bomba" desiredKey="pumpOn" />
        {/* Agrega más controles según tus desired: */}
        {/* <ControlSwitch deviceId={uid} label="Luz" desiredKey="lightOn" /> */}
      </div>

      {/* Gráficos por sensor */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Telemetría</h2>
        {sensores?.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sensores.map((s) => {
              const key = s._id || s.id || s.sensorId;
              const serie = history[key] || [];
              return (
                <TimeSeries
                  key={key}
                  title={`${s.nombre || s.tipo || key} (${s.unidad || ''})`}
                  series={serie}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Este dispositivo no tiene sensores configurados.</p>
        )}
      </div>
    </div>
  );
}
