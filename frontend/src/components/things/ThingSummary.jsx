import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispositivo } from '../../hooks/useDispositivo';
import { toast } from 'sonner';
import axios from 'axios';

export default function ThingSummary({ sensores = [] }) {
  const { id: uid } = useParams();
  const navigate = useNavigate();
  const { dispositivo, loading, error } = useDispositivo(uid);

  const token = localStorage.getItem('token');
  const csrfToken = localStorage.getItem('csrfToken');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-csrf-token': csrfToken,
    },
  };

  const handleConfirm = async () => {
    try {
      await axios.patch(`/api/dispositivos/${uid}/configurado`, {}, config);

      toast.success('✅ Configuración guardada exitosamente');
      navigate('/proyectos'); // o donde prefieras
    } catch (err) {
      console.error('❌ Error al guardar configuración:', err);
      toast.error('❌ Error al guardar configuración. Intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 mt-40">
        Cargando información del dispositivo...
      </div>
    );
  }

  if (error || !dispositivo) {
    return (
      <div className="text-center text-red-500 dark:text-red-400 mt-40">
        Error al obtener la información del dispositivo.
      </div>
    );
  }

  const conectado =
    dispositivo.ultimaConexion &&
    Date.now() - new Date(dispositivo.ultimaConexion).getTime() < 10000;

  const file = (dispositivo.imagen || 'generic.png').split('/').pop();
  const imgSrc = `/images/conexion/${file}`;

  return (
    <div className="w-full max-w-3xl mx-auto mt-40 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg space-y-8">
      {/* Título */}
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          🧾 Resumen de Configuración
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Verifica que toda la información esté correcta antes de guardar.
        </p>
      </div>

      {/* Información del dispositivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="flex justify-center">
          <img
            src={imgSrc}
            alt={dispositivo.nombre}
            className="max-h-40 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2"
          />
        </div>

        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p>
            <strong className="text-gray-900 dark:text-white">📟 Nombre:</strong>{' '}
            {dispositivo.nombre || 'Sin nombre'}
          </p>
          <p>
            <strong className="text-gray-900 dark:text-white">💾 Chip / Modelo:</strong>{' '}
            {dispositivo.chip || 'No definido'}
          </p>
          <p>
            <strong className="text-gray-900 dark:text-white">🔌 Puerto:</strong>{' '}
            {dispositivo.path || 'No disponible'}
          </p>
          <p>
            <strong className="text-gray-900 dark:text-white">🆔 UID:</strong>{' '}
            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
              {dispositivo.uid}
            </code>
          </p>
          <p>
            <strong className="text-gray-900 dark:text-white">🏷 Vendor ID:</strong>{' '}
            {dispositivo.vendorId || 'N/A'}
          </p>
          <p>
            <strong className="text-gray-900 dark:text-white">🔖 Product ID:</strong>{' '}
            {dispositivo.productId || 'N/A'}
          </p>
          <p className="flex items-center gap-1">
            <strong className="text-gray-900 dark:text-white">📡 Estado:</strong>{' '}
            {conectado ? (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle size={14} /> Conectado
              </span>
            ) : (
              <span className="text-yellow-600 flex items-center gap-1">
                <AlertTriangle size={14} /> Desconocido
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Sensores asignados */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          📦 Sensores Asignados
        </h3>
        {sensores.length === 0 ? (
          <p className="text-sm italic text-gray-500 dark:text-gray-400">
            Aún no se han agregado sensores a este dispositivo.
          </p>
        ) : (
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {sensores.map((sensor, index) => (
              <li key={index} className="border-b border-dashed pb-2 last:border-none last:pb-0">
                <strong>{sensor.nombre}</strong> en pin{' '}
                <span className="font-mono text-blue-600 dark:text-blue-400">{sensor.pin}</span> —{' '}
                <span className="italic">{sensor.tipo}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Botón final */}
      <div className="text-center">
        <button
          onClick={handleConfirm}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-md shadow transition-all"
        >
          ✅ Confirmar y Guardar Configuración
        </button>
      </div>
    </div>
  );
}
