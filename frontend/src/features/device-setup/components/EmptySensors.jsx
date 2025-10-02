// ✅ src/components/things/EmptySensors.jsx
export default function EmptySensors() {
  return (
    <div className="text-center p-6 border border-dashed rounded-xl border-gray-300 dark:border-gray-600 bg-light-surface dark:bg-dark-surface transition">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white">Sin sensores asignados</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Usa el buscador de la derecha para agregar sensores desde la biblioteca y configurarlos
        visualmente.
      </p>
    </div>
  );
}
