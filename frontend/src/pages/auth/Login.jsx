// src/pages/auth/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getCsrfToken, login } from '../../api/auth.api'; // asume que login usa axiosInstance
import { toast } from 'sonner'; // ← importar Sonner

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [cargando, setCargando] = useState(false);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setCargando(true);
    try {
      const csrfToken = await getCsrfToken();
      const usuario = await login(form.email, form.password, csrfToken);
      // opcional: guardar info en localStorage
      localStorage.setItem('rol', usuario.rol);
      localStorage.setItem('nombre', usuario.nombre);
      localStorage.setItem('correo', usuario.email);
      toast.success('✔️ Bienvenido de nuevo');
      navigate('/proyectos');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || '❌ Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full animate-fade-in-down">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Bienvenido de nuevo</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Inicia sesión en tu cuenta</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2 rounded-md border bg-white dark:bg-darkBg dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="relative">
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2 rounded-md border bg-white dark:bg-darkBg dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="flex justify-between text-sm">
          <Link to="/recuperar" className="text-blue-600 dark:text-blue-400 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={cargando}>
          {cargando ? 'Entrando...' : 'Iniciar sesión'}
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-primary hover:underline font-medium">
          Regístrate
        </Link>
      </div>

      <div className="mt-6 border-t pt-6 space-y-3">
        <button
          type="button"
          onClick={() => setMostrarOpciones(v => !v)}
          className="flex items-center justify-center w-full gap-1 text-blue-600 hover:underline"
        >
          {mostrarOpciones ? 'Ocultar opciones' : 'Mostrar más opciones'}
          {mostrarOpciones ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {mostrarOpciones &&
          ['Apple', 'GitHub', 'Google', 'Microsoft'].map(label => (
            <button
              key={label}
              type="button"
              className="flex items-center justify-center w-full gap-2 px-4 py-2 border rounded text-sm
                         dark:text-white hover:bg-gray-50 dark:hover:bg-darkMuted transition"
            >
              {/* aquí iría tu <img> del logo */}
              Iniciar con {label}
            </button>
          ))}
      </div>
    </form>
  );
}
