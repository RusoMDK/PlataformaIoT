import { useEffect, useState } from 'react';
import axios from 'axios';
import Button from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { getCsrfToken } from '../../api/auth.api'; // 👈 Añadimos esto

export default function Notificaciones() {
  const { t } = useTranslation();
  const [notificaciones, setNotificaciones] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [error, setError] = useState(null);
  const [csrfToken, setCsrfToken] = useState(''); // 👈 nuevo estado

  const token = localStorage.getItem('token');
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchNotificaciones();
  }, [filtro]);

  useEffect(() => {
    const fetchCsrf = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrf();
  }, []);

  const fetchNotificaciones = async () => {
    try {
      let url = '/api/notificaciones';
      if (filtro === 'leida') url += '?leida=true';
      if (filtro === 'no-leida') url += '?leida=false';

      const res = await axios.get(url, config);

      if (Array.isArray(res.data)) {
        setNotificaciones(res.data);
        setError(null);
      } else {
        console.warn('⚠️ El backend no devolvió un array:', res.data);
        setNotificaciones([]);
        setError('Error al obtener notificaciones del servidor.');
      }
    } catch (err) {
      console.error('❌ Error al obtener notificaciones:', err);
      setError('Error al obtener notificaciones.');
    }
  };

  const marcarLeida = async id => {
    try {
      await axios.patch(
        `/api/notificaciones/${id}/leida`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-CSRF-Token': csrfToken, // 👈 aquí lo ponemos
          },
        }
      );
      fetchNotificaciones();
    } catch (err) {
      console.error('❌ Error al marcar como leída:', err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🔔 {t('notificaciones.titulo')}</h1>

      {/* Filtros */}
      <div className="mb-6 flex gap-3 flex-wrap">
        <Button variant={filtro === '' ? 'primary' : 'secondary'} onClick={() => setFiltro('')}>
          {t('notificaciones.todas')}
        </Button>
        <Button
          variant={filtro === 'no-leida' ? 'primary' : 'secondary'}
          onClick={() => setFiltro('no-leida')}
        >
          {t('notificaciones.noLeidas')}
        </Button>
        <Button
          variant={filtro === 'leida' ? 'primary' : 'secondary'}
          onClick={() => setFiltro('leida')}
        >
          {t('notificaciones.leidas')}
        </Button>
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-4">
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : Array.isArray(notificaciones) && notificaciones.length === 0 ? (
          <p className="text-gray-500">{t('notificaciones.vacio')}</p>
        ) : (
          notificaciones.map((n, index) => (
            <div
              key={n._id || index}
              className={`p-4 rounded border shadow-sm transition ${
                n.leida ? 'bg-gray-100 border-gray-200' : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <p className="font-medium text-gray-800">{n.mensaje || 'Mensaje vacío'}</p>
              <p className="text-sm text-gray-500">
                {n.timestamp ? new Date(n.timestamp).toLocaleString() : 'Fecha no disponible'}
              </p>
              {!n.leida && (
                <Button
                  onClick={() => marcarLeida(n._id)}
                  variant="secondary"
                  className="mt-2 text-xs"
                >
                  {t('notificaciones.marcarLeida')}
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
