import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Button from '../../components/ui/Button';
import { FileDown, DownloadCloud } from 'lucide-react';
import { getCsrfToken } from '../../api/auth.api'; // 🔥 Importamos para pedir CSRF token

export default function ExportarDatos() {
  const [sensorId, setSensorId] = useState('');
  const [tipo, setTipo] = useState('usuarios');
  const [formato, setFormato] = useState('csv');
  const [csrfToken, setCsrfToken] = useState(''); // 🔥 Estado CSRF token

  const token = localStorage.getItem('token');
  const config = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
        'x-csrf-token': csrfToken,
      },
      responseType: 'blob',
    }),
    [token, csrfToken]
  );

  useEffect(() => {
    const cargarCsrf = async () => {
      try {
        const csrf = await getCsrfToken();
        setCsrfToken(csrf);
      } catch (err) {
        console.error('❌ Error obteniendo CSRF token:', err.message);
      }
    };
    cargarCsrf();
  }, []);

  const manejarExportacion = async () => {
    try {
      let url = '';
      switch (tipo) {
        case 'usuarios':
          url = `/api/exportar/usuarios?formato=${formato}`;
          break;
        case 'proyectos':
          url = `/api/exportar/proyectos?formato=${formato}`;
          break;
        case 'logs':
          url = `/api/exportar/logs?formato=${formato}`;
          break;
        case 'lecturas':
          if (!sensorId) return alert('Selecciona un ID de sensor');
          url = `/api/exportar/lecturas/${formato}?sensor=${sensorId}`;
          break;
        case 'alertas':
          url = `/api/exportar/alertas?formato=${formato}`;
          break;
        case 'sensores':
          url = `/api/exportar/sensores?formato=${formato}`;
          break;
        case 'visualizaciones':
          url = `/api/exportar/visualizaciones?formato=${formato}`;
          break;
        case 'backup':
          url = `/api/exportar/backup`;
          break;
        default:
          return;
      }

      const res = await axios.get(url, config);

      const blob = new Blob([res.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${tipo}.${formato === 'excel' ? 'xlsx' : formato}`;
      link.click();
    } catch (err) {
      console.error('❌ Error al exportar:', err);
      alert('Error al exportar datos.');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-10 fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <DownloadCloud className="w-7 h-7 text-primary dark:text-darkAccent" />
          Exportar Datos
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Descarga los datos de tu sistema en distintos formatos
        </p>
      </div>

      <div className="space-y-6 bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-white">
            Tipo de datos
          </label>
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-darkBg text-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="usuarios">Usuarios</option>
            <option value="proyectos">Proyectos</option>
            <option value="logs">Logs</option>
            <option value="lecturas">Lecturas (por sensor)</option>
            <option value="alertas">Alertas</option>
            <option value="sensores">Sensores</option>
            <option value="visualizaciones">Visualizaciones</option>
            <option value="backup">Respaldo completo (ZIP)</option>
          </select>
        </div>

        {tipo === 'lecturas' && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-white">
              ID del sensor
            </label>
            <input
              type="text"
              value={sensorId}
              onChange={e => setSensorId(e.target.value)}
              placeholder="Ej: 661234abc123..."
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-darkBg text-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-white">Formato</label>
          <select
            value={formato}
            onChange={e => setFormato(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-darkBg text-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {tipo === 'lecturas' ? (
              <>
                <option value="excel">Excel (.xlsx)</option>
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
              </>
            ) : tipo === 'backup' ? (
              <option value="zip">ZIP</option>
            ) : tipo === 'visualizaciones' ? (
              <>
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </>
            ) : (
              <>
                <option value="csv">CSV</option>
                <option value="excel">Excel (.xlsx)</option>
                <option value="pdf">PDF</option>
              </>
            )}
          </select>
        </div>

        <div className="pt-4">
          <Button onClick={manejarExportacion} className="w-full">
            <FileDown className="w-5 h-5 mr-2" />
            Descargar archivo
          </Button>
        </div>
      </div>
    </div>
  );
}
