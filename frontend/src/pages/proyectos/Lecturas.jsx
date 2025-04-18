import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
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
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchSensores = async () => {
    try {
      const res = await axios.get(`/api/sensores?proyecto=${id}`, config);
      setSensores(res.data);
      if (res.data.length > 0) setSensorId(res.data[0]._id);
    } catch (err) {
      console.error('Error al obtener sensores:', err);
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
      console.error('Error al obtener lecturas:', err);
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
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, 'lecturas.xlsx');
    } catch (err) {
      console.error('Error al exportar Excel:', err);
    }
  };

  const exportarPDF = async () => {
    try {
      const res = await axios.get(`/api/exportar/pdf?sensor=${sensorId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      saveAs(blob, 'lecturas.pdf');
    } catch (err) {
      console.error('Error al exportar PDF:', err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Lecturas de Sensor</h1>

      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium">Sensor:</label>
          <select
            value={sensorId}
            onChange={e => {
              setSensorId(e.target.value);
              setPagina(1);
            }}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {sensores.map(s => (
              <option key={s._id} value={s._id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Desde:</label>
          <input
            type="date"
            value={desde}
            onChange={e => {
              setDesde(e.target.value);
              setPagina(1);
            }}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Hasta:</label>
          <input
            type="date"
            value={hasta}
            onChange={e => {
              setHasta(e.target.value);
              setPagina(1);
            }}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {lecturas.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lecturas}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="timestamp" tickFormatter={v => new Date(v).toLocaleTimeString()} />
              <YAxis />
              <Tooltip labelFormatter={v => new Date(v).toLocaleString()} />
              <Line type="monotone" dataKey="valor" stroke="#2563EB" />
            </LineChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap justify-between items-center mt-6 gap-4">
            <div className="flex gap-4">
              <Button onClick={exportarExcel} variant="success">
                📄 Exportar a Excel
              </Button>
              <Button onClick={exportarPDF} variant="danger">
                🧾 Exportar a PDF
              </Button>
            </div>

            <div className="flex gap-3 items-center">
              <Button
                onClick={() => setPagina(p => Math.max(p - 1, 1))}
                disabled={pagina === 1}
                variant="secondary"
                className="px-3 py-1"
              >
                ◀
              </Button>
              <span className="text-sm text-gray-600">
                Página {pagina} de {totalPaginas}
              </span>
              <Button
                onClick={() => setPagina(p => Math.min(p + 1, totalPaginas))}
                disabled={pagina === totalPaginas}
                variant="secondary"
                className="px-3 py-1"
              >
                ▶
              </Button>
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-500">No hay lecturas disponibles para este sensor.</p>
      )}
    </div>
  );
}
