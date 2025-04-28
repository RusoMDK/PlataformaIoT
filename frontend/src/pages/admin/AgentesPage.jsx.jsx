import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Download, Search, Monitor } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getCsrfToken } from '../../api/auth.api'; // 🔥 Importamos CSRF token API

export default function AgentesPage() {
  const [agentes, setAgentes] = useState([]);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filtro, setFiltro] = useState('');
  const [fecha, setFecha] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalDispositivos, setModalDispositivos] = useState(null);
  const [detalleDispositivos, setDetalleDispositivos] = useState([]);
  const [loadingDispositivos, setLoadingDispositivos] = useState(false);
  const [csrfToken, setCsrfToken] = useState(''); // 🔥 Nuevo estado para CSRF token

  const token = localStorage.getItem('token');
  const cfg = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
        'x-csrf-token': csrfToken, // 🔥 Agregamos CSRF al config de axios
      },
    }),
    [token, csrfToken]
  );

  useEffect(() => {
    const inicializar = async () => {
      try {
        const csrf = await getCsrfToken();
        setCsrfToken(csrf);

        const { data } = await axios.get('/api/agentes', cfg);
        setAgentes(
          data.map(a => ({
            usuarioId: a.usuario._id,
            nombre: a.usuario.nombre,
            email: a.usuario.email,
            socketId: a.socketId,
            isOnline: !!a.isOnline,
            connectedAt: a.firstConnected ? new Date(a.firstConnected) : null,
            lastHeartbeat: a.lastHeartbeat ? new Date(a.lastHeartbeat) : null,
            dispositivos: Array.isArray(a.dispositivos) ? a.dispositivos : [],
            ip: a.ip || '—',
          }))
        );
      } catch (err) {
        console.error('❌ Error inicializando Agentes:', err.message);
      } finally {
        setLoading(false);
      }
    };

    inicializar();

    const socket = io(`${import.meta.env.VITE_WS_URL}/dashboard`, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token },
    });

    socket.on(
      'agente-conectado',
      ({ usuario, socketId, connectedAt, lastHeartbeat, dispositivos, ip }) => {
        setAgentes(prev => {
          const m = new Map(prev.map(a => [a.usuarioId, { ...a }]));
          m.set(usuario._id, {
            usuarioId: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            socketId,
            isOnline: true,
            connectedAt: new Date(connectedAt),
            lastHeartbeat: new Date(lastHeartbeat),
            dispositivos: dispositivos || [],
            ip: ip || '—',
          });
          return Array.from(m.values());
        });
      }
    );

    socket.on('agente-heartbeat', ({ socketId, lastHeartbeat }) => {
      setAgentes(prev =>
        prev.map(a =>
          a.socketId === socketId
            ? { ...a, lastHeartbeat: new Date(lastHeartbeat), isOnline: true }
            : a
        )
      );
    });

    socket.on('agente-desconectado', ({ usuarioId }) => {
      setAgentes(prev =>
        prev.map(a =>
          a.usuarioId === usuarioId
            ? { ...a, isOnline: false, socketId: null, lastHeartbeat: null }
            : a
        )
      );
    });

    return () => socket.disconnect();
  }, [token, csrfToken]);

  const totalActivos = useMemo(() => agentes.filter(a => a.isOnline).length, [agentes]);
  const totalDesconectados = agentes.length - totalActivos;
  const totalDispositivos = useMemo(
    () => agentes.reduce((s, a) => s + a.dispositivos.length, 0),
    [agentes]
  );

  const agentesFiltrados = useMemo(() => {
    return agentes.filter(a => {
      if (filterStatus === 'activos' && !a.isOnline) return false;
      if (filterStatus === 'desconectados' && a.isOnline) return false;
      if (fecha && a.connectedAt?.toISOString().slice(0, 10) !== fecha) return false;
      const q = filtro.trim().toLowerCase();
      return q
        ? a.email.toLowerCase().includes(q) ||
            a.usuarioId.toLowerCase().includes(q) ||
            a.dispositivos.some(d => d.uid.toLowerCase().includes(q))
        : true;
    });
  }, [agentes, filterStatus, fecha, filtro]);

  const exportarExcel = () => {
    const datos = agentesFiltrados.map(a => ({
      Usuario: a.email,
      Nombre: a.nombre,
      'Socket ID': a.socketId || '—',
      'Último HB': a.lastHeartbeat?.toLocaleString() || '—',
      Dispositivos: a.dispositivos.map(d => d.uid).join(', '),
      IP: a.ip,
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Agentes');
    XLSX.writeFile(wb, 'agentes_iot.xlsx');
  };

  const abrirModalDispositivos = async agente => {
    try {
      setLoadingDispositivos(true);
      setModalDispositivos({ nombre: agente.nombre });

      const detalles = await Promise.all(
        agente.dispositivos.map(async d => {
          try {
            const { data } = await axios.get(`/api/dispositivos/${d.uid}`, cfg);
            return {
              uid: data.uid,
              nombre: data.nombre,
              fabricante: data.fabricante || '—',
              chip: data.chip || '—',
              path: data.path || '—',
              imagen: data.imagen || null,
            };
          } catch (err) {
            console.error('❌ Error trayendo dispositivo:', d.uid, err.message);
            return {
              uid: d.uid,
              nombre: d.nombre,
              fabricante: '—',
              chip: '—',
              path: '—',
              imagen: null,
            };
          }
        })
      );

      setDetalleDispositivos(detalles);
    } catch (err) {
      console.error('❌ Error cargando dispositivos:', err.message);
      setDetalleDispositivos([]);
    } finally {
      setLoadingDispositivos(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold flex items-center gap-2">📡 Agentes IoT</h1>
        <p className="text-sm text-muted">Monitorea el estado de tu flota en tiempo real.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          ['Activos', totalActivos, 'from-green-500 to-teal-600'],
          ['Desconectados', totalDesconectados, 'from-red-500 to-pink-600'],
          ['Dispositivos', totalDispositivos, 'from-blue-500 to-indigo-600'],
        ].map(([lbl, val, grad], i) => (
          <div key={i} className={`bg-gradient-to-r ${grad} text-white rounded-lg p-4`}>
            <p className="text-sm uppercase">{lbl}</p>
            <p className="text-2xl font-semibold mt-1">{val}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {['todos', 'activos', 'desconectados'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-full text-sm ${
                filterStatus === st ? 'bg-primary text-white' : 'bg-muted text-dark'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2 text-muted" />
            <Input
              placeholder="Buscar email o UID"
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              className="pl-8 w-full sm:w-64"
            />
          </div>
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
          />
          <Button onClick={exportarExcel} variant="outline" className="gap-2">
            <Download size={16} /> Exportar
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center text-muted">⏳ Cargando…</p>
        ) : agentesFiltrados.length > 0 ? (
          agentesFiltrados.map(a => (
            <Card
              key={a.usuarioId}
              className={`p-4 md:p-6 border-l-4 ${
                a.isOnline ? 'border-success' : 'border-danger'
              } hover:shadow-lg transition`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/profile-placeholder.png"
                    alt="perfil"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-lg">{a.nombre}</h4>
                    <p className="text-xs text-muted">{a.email}</p>
                  </div>
                </div>
                <span
                  className={`h-4 w-4 rounded-full ${a.isOnline ? 'bg-success' : 'bg-danger'}`}
                  title={a.isOnline ? 'Online' : 'Offline'}
                />
              </div>
              <div className="space-y-1 text-sm mb-4">
                <p>
                  <b>Socket:</b> <code>{a.socketId?.slice(0, 8) || '—'}</code>
                </p>
                <p>
                  <b>Último:</b> {a.lastHeartbeat ? a.lastHeartbeat.toLocaleTimeString() : '—'}
                </p>
                <p>
                  <b>IP:</b> {a.ip}
                </p>
              </div>
              <Button
                onClick={() => abrirModalDispositivos(a)}
                variant="outline"
                className="w-full text-center"
              >
                <Monitor size={16} /> Ver dispositivos
              </Button>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-muted">No hay agentes.</p>
        )}
      </section>

      {modalDispositivos && (
        <Modal
          open={!!modalDispositivos}
          onOpenChange={open => !open && setModalDispositivos(null)}
          title={`Dispositivos de ${modalDispositivos.nombre}`}
        >
          {loadingDispositivos ? (
            <p className="text-center text-muted">Cargando dispositivos...</p>
          ) : detalleDispositivos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-2">
              {detalleDispositivos.map((d, i) => {
                const imagen = d.imagen
                  ? `/images/conexion/${d.imagen}`
                  : '/assets/placeholder-device.png';
                return (
                  <div
                    key={i}
                    className="rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface p-4 flex flex-col items-center gap-2 text-center"
                  >
                    <img
                      src={imagen}
                      alt={d.nombre}
                      className="w-20 h-20 object-contain rounded mb-2"
                      onError={e => {
                        e.target.src = '/assets/placeholder-device.png';
                      }}
                    />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-base">{d.nombre || 'Sin nombre'}</h4>
                      <code className="text-xs text-muted">{d.uid}</code>
                    </div>
                    <div className="text-xs text-muted space-y-1 mt-3">
                      <p>
                        <b>Fabricante:</b> {d.fabricante || '—'}
                      </p>
                      <p>
                        <b>Chip:</b> {d.chip || '—'}
                      </p>
                      <p>
                        <b>Puerto:</b> {d.path || '—'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted">Sin dispositivos disponibles.</p>
          )}
        </Modal>
      )}
    </div>
  );
}
