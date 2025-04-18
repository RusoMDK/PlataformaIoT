import { useEffect, useState } from 'react';
import axios from 'axios';
import TablaPro from '../../components/ui/TablaPro';
import { ScrollText } from 'lucide-react';

export default function LogsGlobales() {
  const [logs, setLogs] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [filtro, setFiltro] = useState('');

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/api/logs/globales', config);
        setLogs(res.data);
      } catch (err) {
        console.error('❌ Error al obtener logs globales:', err);
      }
    };
    fetchLogs();
  }, []);

  const eliminarLogsSeleccionados = async ids => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar los logs seleccionados?');
    if (!confirmar) return;

    try {
      await axios.post('/api/logs/eliminar-varios', { ids }, config);
      setLogs(prev => prev.filter(log => !ids.includes(log._id)));
      setSeleccionados([]);
    } catch (err) {
      console.error('❌ Error al eliminar logs:', err);
    }
  };

  const columnas = [
    {
      campo: 'usuarioNombre',
      label: 'Usuario',
      render: log => log.usuarioNombre || <span className="italic text-gray-400">Sin nombre</span>,
    },
    {
      campo: 'usuarioEmail',
      label: 'Email',
      render: log => log.usuarioEmail || <span className="italic text-gray-400">Sin email</span>,
    },
    {
      campo: 'accion',
      label: 'Acción',
      render: log => (
        <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
          {log.accion}
        </span>
      ),
    },
    {
      campo: 'detalle',
      label: 'Detalle',
    },
    {
      campo: 'fecha',
      label: 'Fecha',
      render: log =>
        new Date(log.fecha).toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
  ];

  // Transformar logs para tener nombre y email accesibles
  const logsTransformados = logs.map(log => ({
    ...log,
    usuarioNombre: log.usuario?.nombre || '',
    usuarioEmail: log.usuario?.email || '',
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 fade-in">
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 justify-center md:justify-start">
          <ScrollText className="w-7 h-7 text-primary dark:text-darkAccent" />
          Logs del Sistema
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Registro completo de acciones del sistema
        </p>
      </div>

      <TablaPro
        columnas={columnas}
        datos={logsTransformados}
        seleccionados={seleccionados}
        setSeleccionados={setSeleccionados}
        onEliminarSeleccionados={eliminarLogsSeleccionados}
        filtroExterno={filtro}
        onFiltroChange={setFiltro}
      />
    </div>
  );
}