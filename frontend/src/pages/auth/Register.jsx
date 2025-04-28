import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getCsrfToken } from '../../api/auth.api'; // 🔥 Importamos para pedir CSRF

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', repetir: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [csrfToken, setCsrfToken] = useState(''); // 🔥 Estado CSRF

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

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const calcularFortaleza = password => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 5);
  };

  const fortaleza = calcularFortaleza(form.password);
  const colores = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-600'];
  const etiquetas = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'];

  const proveedores = [
    {
      label: 'Apple',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg',
      className: 'dark:invert',
    },
    {
      label: 'GitHub',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',
      className: 'dark:invert',
    },
    {
      label: 'Google',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg',
      className: '',
    },
    {
      label: 'Microsoft',
      src: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
      className: '',
    },
  ];

  const handleSubmit = async e => {
    e.preventDefault();
    setCargando(true);
    setError('');

    if (form.password !== form.repetir) {
      setError('Las contraseñas no coinciden.');
      setCargando(false);
      return;
    }

    try {
      await axios.post('/api/auth/register', form, {
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken, // 🔥 Enviamos CSRF aquí
        },
      });
      navigate('/login');
    } catch (err) {
      console.error('❌ Error al registrarse:', err);
      setError('Ocurrió un error al registrarse. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-down w-full">
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Crear cuenta</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Regístrate para comenzar a usar la plataforma
        </p>
      </div>

      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      <div className="space-y-4">
        {/* Nombre */}
        <div className="relative">
          <input
            name="nombre"
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-400 dark:bg-darkBg dark:text-white dark:border-gray-600 dark:placeholder-gray-500 dark:focus:border-darkAccent dark:focus:ring-darkAccent px-3 py-2 pl-10"
            required
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-darkMuted"
            width="16"
            height="16"
            fill="none"
          >
            <path d="M12 12c2.67 0 8 1.34 8 4v2H4v-2c0-2.66 5.33-4 8-4Zm0-2a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
          </svg>
        </div>

        {/* Email */}
        <div className="relative">
          <input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-400 dark:bg-darkBg dark:text-white dark:border-gray-600 dark:placeholder-gray-500 dark:focus:border-darkAccent dark:focus:ring-darkAccent px-3 py-2 pl-10"
            required
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-darkMuted"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>

        {/* Contraseña */}
        <div className="relative">
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-400 dark:bg-darkBg dark:text-white dark:border-gray-600 dark:placeholder-gray-500 dark:focus:border-darkAccent dark:focus:ring-darkAccent px-3 py-2 pl-10"
            required
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-darkMuted"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* Fortaleza y texto */}
        {form.password && (
          <>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  colores[fortaleza - 1] || 'bg-transparent'
                }`}
                style={{ width: `${(fortaleza / 5) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Seguridad: {etiquetas[fortaleza - 1] || 'Muy débil'}
            </p>
          </>
        )}

        {/* Repetir contraseña */}
        <div className="relative">
          <input
            name="repetir"
            type="password"
            placeholder="Repite la contraseña"
            value={form.repetir}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-400 dark:bg-darkBg dark:text-white dark:border-gray-600 dark:placeholder-gray-500 dark:focus:border-darkAccent dark:focus:ring-darkAccent px-3 py-2 pl-10"
            required
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-darkMuted"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M12 15v4m0 0H8m4 0h4m0-4V9m0 6H8m8 0a4 4 0 1 0-8 0" />
          </svg>
        </div>

        <Button type="submit" className="w-full" disabled={cargando}>
          {cargando ? 'Creando cuenta...' : 'Registrarse'}
        </Button>
      </div>

      <div className="text-sm text-center text-gray-500 dark:text-gray-400">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" className="text-primary hover:underline font-medium">
          Inicia sesión
        </Link>
      </div>

      <div className="border-t pt-6 mt-6 space-y-3">
        <button
          type="button"
          onClick={() => setMostrarOpciones(prev => !prev)}
          className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1"
        >
          {mostrarOpciones ? 'Ocultar opciones' : 'Mostrar más opciones'}
          {mostrarOpciones ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {mostrarOpciones && (
          <div className="space-y-2 animate-fade-in">
            {proveedores.map(({ label, src, className }) => (
              <button
                key={label}
                type="button"
                className="w-full flex items-center justify-center gap-2 border rounded px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-darkMuted transition"
              >
                <img src={src} alt={label} className={`w-5 h-5 ${className}`} />
                Registrarse con {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
