import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { saveAs } from 'file-saver';
import TablaPro from '../../components/ui/TablaPro';
import Button from '../../components/ui/Button';

export default function Lecturas() {
  const { id } = useParams();
  const [lecturas, setLecturas] = useState([]);
  const [sensorId, setSensorId] = useState('');
  const [sensores, setSensores] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const token = localStorage.getItem('token');
  const csrfToken = localStorage.getItem('csrfToken');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-csrf-token': csrfToken,
    },
  };

  const fetchSensores = async () => {
    try {
      const res = await axios.get(`/api/sensores?proyecto=${id}`, config);
      setSensores(res.data);
      if (res.data.length > 0) setSensorId(res.data[0]._id);
    } catch (err) {
      console.error('❌ Error al obtener sensores:', err);
    }
  };

  const fetchLecturas = async () => {
    if (!sensorId) return;

    try {
      const params = {
        sensor: sensorId,
        pagina,
        limite: 10,
        ...(desde && { desde }),
        ...(hasta && { hasta }),
      };

      const res = await axios.get('/api/lecturas/optimizado', {
        params,
        ...config,
      });

      setLecturas(res.data.lecturas);
      setTotalPaginas(res.data.paginas);
    } catch (err) {
      console.error('❌ Error al obtener lecturas:', err);
    }
  };

  useEffect(() => {
    fetchSensores();
  }, [id]);

  useEffect(() => {
    fetchLecturas();
  }, [sensorId, pagina, desde, hasta]);

  const exportarExcel = async () => {
    try {
      const res = await axios.get(`/api/exportar/excel?sensor=${sensorId}`, {
        ...config,
        responseType: 'blob',
      });
      saveAs(new Blob([res.data]), 'lecturas.xlsx');
    } catch (err) {
      console.error('❌ Error al exportar Excel:', err);
    }
  };

  const exportarPDF = async () => {
    try {
      const res = await axios.get(`/api/exportar/pdf?sensor=${sensorId}`, {
        ...config,
        responseType: 'blob',
      });
      saveAs(new Blob([res.data]), 'lecturas.pdf');
    } catch (err) {
      console.error('❌ Error al exportar PDF:', err);
    }
  };

  const columnas = [
    {
      Header: 'Fecha',
      accessor: row => new Date(row.timestamp).toLocaleString(),
    },
    {
      Header: 'Valor',
      accessor: 'valor',
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 bg-light-bg dark:bg-dark-bg rounded-xl transition-colors">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📊 Lecturas de Sensor</h1>
        <div className="flex gap-2">
          <Button onClick={exportarExcel} variant="success">
            📄 Excel
          </Button>
          <Button onClick={exportarPDF} variant="danger">
            🧾 PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
            Sensor
          </label>
          <select
            value={sensorId}
            onChange={e => {
              setSensorId(e.target.value);
              setPagina(1);
            }}
            className="input"
          >
            {sensores.map(s => (
              <option key={s._id} value={s._id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
            Desde
          </label>
          <input
            type="date"
            value={desde}
            onChange={e => {
              setDesde(e.target.value);
              setPagina(1);
            }}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
            Hasta
          </label>
          <input
            type="date"
            value={hasta}
            onChange={e => {
              setHasta(e.target.value);
              setPagina(1);
            }}
            className="input"
          />
        </div>
      </div>

      {/* Contenido */}
      {lecturas.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lecturas}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={v => new Date(v).toLocaleTimeString()}
                stroke="currentColor"
              />
              <YAxis stroke="currentColor" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(31,41,55,0.9)',
                  border: 'none',
                  color: 'white',
                }}
                labelFormatter={v => new Date(v).toLocaleString()}
              />
              <Line type="monotone" dataKey="valor" stroke="#2563EB" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>

          <TablaPro columnas={columnas} datos={lecturas} sinPaginado />
        </>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          No hay lecturas disponibles para este sensor.
        </p>
      )}
    </div>
  );
}
