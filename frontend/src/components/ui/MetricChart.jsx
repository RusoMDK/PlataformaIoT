import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getLecturasOptimizado } from '../api/lecturas.api';

export default function MetricChart({ sensorId, label = 'temp', rangeMinutes = 120, bucket = '5m' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { from, to } = useMemo(() => {
    const end = Date.now();
    const start = end - rangeMinutes * 60 * 1000;
    return { from: new Date(start).toISOString(), to: new Date(end).toISOString() };
  }, [rangeMinutes]);

  useEffect(() => {
    if (!sensorId) return;
    (async () => {
      try {
        setLoading(true);
        const rows = await getLecturasOptimizado({ sensorId, from, to, bucket });
        // Normaliza a { ts, value }
        const d = rows.map(r => ({
          ts: typeof r.ts === 'string' ? new Date(r.ts).getTime() : r.ts,
          value: Number(r.value),
        })).sort((a,b) => a.ts - b.ts);
        setData(d);
      } catch (e) {
        console.error('chart fetch error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [sensorId, from, to, bucket]);

  if (!sensorId) return null;

  return (
    <div className="h-64 w-full">
      <div className="text-sm text-gray-600 mb-1">Histórico: {label}</div>
      <div className="h-56 rounded-xl border border-gray-100">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ts"
              tickFormatter={(v) => new Date(v).toLocaleTimeString()}
              minTickGap={32}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(v) => new Date(v).toLocaleString()}
              formatter={(v) => [v, label]}
            />
            <Line type="monotone" dataKey="value" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {loading && <div className="text-xs text-gray-400 mt-1">Cargando…</div>}
    </div>
  );
}
