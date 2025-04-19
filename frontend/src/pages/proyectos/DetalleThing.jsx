import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Settings, LineChart, LayoutDashboard, FileDown } from 'lucide-react';

const colores = ['#6366F1', '#22C55E', '#FBBF24', '#EC4899', '#10B981'];

export default function ProyectoDetalle() {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState(null);
  const [sensores, setSensores] = useState([]);
  const [alertas, setAlertas] = useState([]);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProyecto, resSensores, resAlertas] = await Promise.all([
          axios.get(`/api/proyectos/${id}`, config),
          axios.get(`/api/sensores?proyecto=${id}`, config),
          axios.get(`/api/alertas/historial/proyecto?proyecto=${id}`, config),
        ]);

        setProyecto(resProyecto.data);
        setSensores(resSensores.data);
        setAlertas(resAlertas.data);
      } catch (err) {
        console.error('❌ Error cargando el proyecto:', err);
      }
    };
    fetchData();
  }, [id]);

  const handleExport = async formato => {
    try {
      const res = await axios.get(`/api/exportar/proyectos/${id}/${formato}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const blob = new Blob([res.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `proyecto_${id}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
      link.click();
    } catch (err) {
      console.error('❌ Error exportando:', err);
    }
  };

  const alertasPorSensor = sensores.map(s => ({
    nombre: s.nombre,
    total: alertas.filter(a => a.sensor?._id === s._id).length,
  }));

  const tiposSensores = sensores.reduce((acc, sensor) => {
    let tipo = sensor.tipo;
    if (typeof tipo !== 'string' || !tipo.trim()) return acc;
    tipo = tipo.charAt(0).toUpperCase() + tipo.trim().slice(1);
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});

  const datosTipos = Object.entries(tiposSensores).map(([tipo, value]) => ({
    name: tipo,
    value,
  }));

  if (!proyecto)
    return <div className="p-8 text-gray-600 dark:text-gray-300">Cargando proyecto...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 bg-light-bg dark:bg-dark-bg transition-colors">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          {proyecto.nombre}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{proyecto.descripcion}</p>
      </header>

      {/* Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <Link to={`/proyectos/${id}/editar-thing`}>
            <Button variant="secondary">
              <Settings className="w-4 h-4 mr-2" /> Editar
            </Button>
          </Link>
          <Link to={`/proyectos/${id}/lecturas`}>
            <Button variant="primary">
              <LineChart className="w-4 h-4 mr-2" /> Lecturas
            </Button>
          </Link>
          <Link to={`/proyectos/${id}/visualizacion`}>
            <Button variant="success">
              <LineChart className="w-4 h-4 mr-2" /> Visualización
            </Button>
          </Link>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => handleExport('excel')} variant="outline">
            <FileDown className="w-4 h-4 mr-2" /> Excel
          </Button>
          <Button onClick={() => handleExport('pdf')} variant="danger">
            <FileDown className="w-4 h-4 mr-2" /> PDF
          </Button>
        </div>
      </div>

      {/* Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tipos de sensores */}
        <Card title="Tipos de sensores">
          {datosTipos.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={datosTipos}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {datosTipos.map((_, i) => (
                    <Cell key={i} fill={colores[i % colores.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                    border: 'none',
                    color: 'white',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hay sensores registrados con tipo definido.
            </p>
          )}
        </Card>

        {/* Alertas por sensor */}
        <Card title="Alertas por sensor">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={alertasPorSensor}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" />
              <XAxis dataKey="nombre" stroke="currentColor" />
              <YAxis stroke="currentColor" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(31, 41, 55, 0.9)',
                  border: 'none',
                  color: 'white',
                }}
              />
              <Bar dataKey="total" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
