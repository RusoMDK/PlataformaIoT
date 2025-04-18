// components/shared/EmptyState.jsx
export default function EmptyState({
  title = 'Sin datos disponibles',
  description = 'Aún no hay información para mostrar.',
}) {
  return (
    <div className="text-center py-12">
      <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">{title}</p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{description}</p>
    </div>
  );
}
