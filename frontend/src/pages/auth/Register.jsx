// frontend/src/pages/auth/Register.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { getCsrfToken } from '../../api/auth.api';

const USERNAME_REGEX = /^[a-z0-9._-]{3,30}$/i;

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    repetir: '',
  });

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [usernameOk, setUsernameOk] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const csrf = await getCsrfToken();
        setCsrfToken(csrf);
      } catch (err) {
        console.error('❌ Error obteniendo CSRF token:', err?.message || err);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    if (name === 'username') {
      setUsernameOk(USERNAME_REGEX.test(value.trim()));
    }
  };

  const calcularFortaleza = (password) => {
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
    { label: 'Apple', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg', className: 'dark:invert' },
    { label: 'GitHub', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg', className: 'dark:invert' },
    { label: 'Google', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg', className: '' },
    { label: 'Microsoft', src: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg', className: '' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    const username = form.username.trim();
    const email = form.email.trim();

    if (!USERNAME_REGEX.test(username)) {
      setError('El usuario debe tener 3–30 caracteres: letras, números, ".", "_" o "-".');
      setCargando(false);
      return;
    }

    if (form.password !== form.repetir) {
      setError('Las contraseñas no coinciden.');
      setCargando(false);
      return;
    }

    try {
      const payload = { username, email, password: form.password };
      await axiosInstance.post('/auth/register', payload, {
        headers: { 'x-csrf-token': csrfToken },
        withCredentials: true,
      });

      navigate('/login');
    } catch (err) {
      console.error('❌ Error al registrarse:', err);
      const msg = err?.response?.data?.msg || 'Ocurrió un error al registrarse. Intenta nuevamente.';
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-down w-full">
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-bold text-light-text dark:text-white">Crear cuenta</h2>
        <p className="text-sm text-light-muted dark:text-dark-muted">
          Regístrate para comenzar a usar la plataforma
        </p>
      </div>

      {error && <p className="text-danger text-sm text-center">{error}</p>}

      <div className="space-y-4">
        {/* Username */}
        <div>
          <label className="form-label">Nombre de usuario</label>
          <div className="relative">
            <input
              name="username"
              placeholder="ej. RusoMDK"
              value={form.username}
              onChange={handleChange}
              className={`form-input-md pr-10 ${usernameOk ? '' : 'border-danger'}`}
              autoComplete="username"
              aria-invalid={!usernameOk}
              required
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted"
              width="16"
              height="16"
              fill="none"
            >
              <path d="M12 12c2.67 0 8 1.34 8 4v2H4v-2c0-2.66 5.33-4 8-4Zm0-2a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
            </svg>
          </div>
          {!usernameOk && (
            <p className="mt-1 text-xs text-danger">
              3–30 caracteres. Usa letras, números, ".", "_" o "-".
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="form-label">Correo electrónico</label>
          <input
            name="email"
            type="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={handleChange}
            className="form-input-md"
            autoComplete="email"
            required
          />
        </div>

        {/* Contraseña */}
        <div>
          <label className="form-label">Contraseña</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            className="form-input-md"
            autoComplete="new-password"
            required
          />
        </div>

        {/* Fortaleza */}
        {form.password && (
          <div className="space-y-1">
            <div className="h-2 w-full bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${colores[fortaleza - 1] || 'bg-transparent'}`}
                style={{ width: `${(fortaleza / 5) * 100}%` }}
              />
            </div>
            <p className="text-xs text-light-muted dark:text-dark-muted">
              Seguridad: {etiquetas[fortaleza - 1] || 'Muy débil'}
            </p>
          </div>
        )}

        {/* Repetir contraseña */}
        <div>
          <label className="form-label">Repite la contraseña</label>
          <input
            name="repetir"
            type="password"
            placeholder="••••••••"
            value={form.repetir}
            onChange={handleChange}
            className="form-input-md"
            autoComplete="new-password"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={cargando}>
          {cargando ? 'Creando cuenta...' : 'Registrarse'}
        </Button>
      </div>

      <div className="text-sm text-center text-light-muted dark:text-dark-muted">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" className="text-primary hover:underline font-medium">
          Inicia sesión
        </Link>
      </div>

      <div className="border-t border-light-border dark:border-dark-border pt-6 mt-6 space-y-3">
        <button
          type="button"
          onClick={() => setMostrarOpciones((prev) => !prev)}
          className="w-full text-sm text-primary hover:underline flex items-center justify-center gap-1"
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
                className="w-full flex items-center justify-center gap-2 border rounded px-4 py-2 text-sm
                           bg-white dark:bg-dark-surface text-light-text dark:text-dark-text
                           border-light-border dark:border-dark-border
                           hover:bg-white/90 dark:hover:bg-dark-surface/90 transition"
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
