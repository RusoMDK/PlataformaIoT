// src/widgets/thing/TimeSeries.jsx
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';

export default function TimeSeries({ title, series = [], height = 220 }) {
  // series: [{ ts, value }] -> normalizamos
  const data = (series || []).map(p => ({
    ts: typeof p.ts === 'number' ? p.ts : new Date(p.ts).getTime(),
    value: p.value,
  }));

  return (
    <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-white/70 dark:bg-white/[0.03]">
      {title && <p className="text-sm font-medium mb-2 text-gray-800 dark:text-white">{title}</p>}
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ts"
              tickFormatter={(v) => new Date(v).toLocaleTimeString()}
            />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31,41,55,0.9)',
                border: 'none',
                color: 'white',
              }}
              labelFormatter={(v) => new Date(v).toLocaleString()}
            />
            <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
