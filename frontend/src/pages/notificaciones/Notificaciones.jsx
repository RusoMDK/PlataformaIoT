import { useEffect, useState } from 'react';
import axios from 'axios';
import Button from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';

export default function Notificaciones() {
  const { t } = useTranslation();
  const [notificaciones, setNotificaciones] = useState([]);
  const [filtro, setFiltro] = useState(''); // "", "leida", "no-leida"
  const token = localStorage.getItem('token');

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchNotificaciones = async () => {
    try {
      let url = '/api/notificaciones';
      if (filtro === 'leida') url += '?leida=true';
      if (filtro === 'no-leida') url += '?leida=false';

      const res = await axios.get(url, config);
      setNotificaciones(res.data);
    } catch (err) {
      console.error('Error al obtener notificaciones:', err);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, [filtro]);

  const marcarLeida = async id => {
    try {
      await axios.patch(`/api/notificaciones/${id}/leida`, {}, config);
      fetchNotificaciones(); // Actualizar lista
    } catch (err) {
      console.error('Error al marcar como leída:', err);
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
        {notificaciones.length === 0 ? (
          <p className="text-gray-500">{t('notificaciones.vacio')}</p>
        ) : (
          notificaciones.map(n => (
            <div
              key={n._id}
              className={`p-4 rounded border shadow-sm transition ${
                n.leida ? 'bg-gray-100 border-gray-200' : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <p className="font-medium text-gray-800">{n.mensaje}</p>
              <p className="text-sm text-gray-500">{new Date(n.timestamp).toLocaleString()}</p>
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
