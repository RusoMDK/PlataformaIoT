import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function Logs() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/api/logs/usuario', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        const data = res.data;

        if (Array.isArray(data)) {
          setLogs(data);
        } else {
          console.warn('El backend no devolvió un array de logs:', data);
          setLogs([]);
        }
      } catch (err) {
        console.error('Error al obtener logs:', err);
        setError('Ocurrió un error al cargar los logs.');
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📝 {t('logs.titulo')}</h1>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500">{t('logs.vacio')}</p>
      ) : (
        <ul className="space-y-4">
          {logs.map((log, index) => (
            <li
              key={log._id || `${log.accion}-${index}`}
              className="p-4 bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow transition"
            >
              <p className="text-base font-semibold text-gray-800 dark:text-white">{log.accion}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{log.detalle}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {log.fecha ? new Date(log.fecha).toLocaleString() : 'Fecha no disponible'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
