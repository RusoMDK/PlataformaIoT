import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/login', form);
      const { token, usuario } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('rol', usuario.rol);
      localStorage.setItem('nombre', usuario.nombre);
      localStorage.setItem('correo', usuario.email);

      try {
        await fetch('http://localhost:3001/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      } catch (err) {
        console.warn('⚠️ Error al conectar con el agente:', err.message);
      }

      navigate('/proyectos');
    } catch (err) {
      console.error('❌ Error al iniciar sesión:', err);
      setError('Credenciales inválidas. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-down w-full">
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Bienvenido de nuevo</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Inicia sesión en tu cuenta</p>
      </div>

      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      <div className="space-y-4">
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

        {/* Password */}
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

        {/* Olvidaste */}
        <div className="flex justify-between text-sm">
          <Link to="/recuperar" className="text-blue-600 dark:text-blue-400 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Botón login */}
        <Button type="submit" className="w-full" disabled={cargando}>
          {cargando ? 'Entrando...' : 'Iniciar sesión'}
        </Button>
      </div>

      {/* Registro */}
      <div className="text-sm text-center text-gray-500 dark:text-gray-400">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-primary hover:underline font-medium">
          Regístrate
        </Link>
      </div>

      {/* Opciones externas */}
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
                Iniciar con {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
