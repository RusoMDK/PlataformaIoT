// src/widgets/thing/MetricTile.jsx
export default function MetricTile({ title, value, unit, subtitle }) {
  return (
    <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-white/70 dark:bg-white/[0.03]">
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-gray-900 dark:text-white">{value ?? '—'}</span>
        {unit && <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>}
      </div>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
