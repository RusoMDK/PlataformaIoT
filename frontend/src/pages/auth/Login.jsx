// frontend/src/pages/auth/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getCsrfToken, login } from '../../api/auth.api';
import { verifyOTPLogin } from '../../api/2fa.api';
import { toast } from 'sonner';
import ModalOTP from '../../components/ui/ModalOTP';

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [cargando, setCargando] = useState(false);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [mostrarOTPModal, setMostrarOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [tempToken, setTempToken] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const proveedores = ['Apple', 'GitHub', 'Google', 'Microsoft'];

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const notificarTokenAlAgente = async (token) => {
    try {
      const res = await fetch('http://localhost:3001/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error('No se pudo enviar el token al agente');
      console.log('✅ Token sincronizado con el agente');
      await fetch('http://localhost:3001/api/trigger-reconexion', { method: 'POST' });
    } catch (err) {
      console.error('❌ Error enviando token al agente:', err);
    }
  };

  const guardarDatosUsuario = (user, token) => {
    localStorage.setItem('rol', user.rol);
    localStorage.setItem('nombre', user.nombre);
    localStorage.setItem('correo', user.email);
    if (token) {
      localStorage.setItem('token', token);
      localStorage.removeItem('temp_token');
      notificarTokenAlAgente(token);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const csrfToken = await getCsrfToken();
      const resp = await login(form.email, form.password, csrfToken);
      const user = resp.usuario || resp;
      const token = resp.token;

      if (user?.is2FAEnabled) {
        if (!token) throw new Error('No se recibió token temporal del backend');
        localStorage.setItem('temp_token', token);
        setUsuario(user);
        setTempToken(token);
        setMostrarOTPModal(true);
        toast.info('🔒 Verifica tu código 2FA');
      } else {
        guardarDatosUsuario(user, token);
        toast.success('✔️ Bienvenido de nuevo');
        navigate('/home', { replace: true });
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.msg || err?.message || '❌ Error al iniciar sesión'
      );
    } finally {
      setCargando(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (!otpCode) return toast.warning('Introduce el código 2FA');
      const csrfToken = await getCsrfToken();
      const token = localStorage.getItem('temp_token');
      await verifyOTPLogin(otpCode, csrfToken, token);

      toast.success('🔓 Código 2FA verificado correctamente');
      localStorage.setItem('token', token);
      localStorage.removeItem('temp_token');
      guardarDatosUsuario(usuario, token);
      window.location.href = '/home';
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.msg || '❌ Código inválido, intenta de nuevo');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 w-full animate-fade-in-down">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-light-text dark:text-white">
            Bienvenido de nuevo
          </h2>
          <p className="text-sm text-light-muted dark:text-dark-muted">
            Inicia sesión en tu cuenta
          </p>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="form-label">Correo electrónico</label>
            <input
              name="email"
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="form-input-md"
            />
          </div>

          {/* Password */}
          <div>
            <label className="form-label">Contraseña</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className="form-input-md"
            />
          </div>

          <div className="flex justify-between text-sm">
            <span />
            <Link
              to="/recuperar"
              className="text-primary hover:underline font-medium"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={cargando}>
            {cargando ? 'Entrando...' : 'Iniciar sesión'}
          </Button>
        </div>

        <div className="text-center text-sm text-light-muted dark:text-dark-muted">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Regístrate
          </Link>
        </div>

        <div className="mt-6 border-t border-light-border dark:border-dark-border pt-6 space-y-3">
          <button
            type="button"
            onClick={() => setMostrarOpciones((v) => !v)}
            className="flex items-center justify-center w-full gap-1 text-primary hover:underline"
          >
            {mostrarOpciones ? 'Ocultar opciones' : 'Mostrar más opciones'}
            {mostrarOpciones ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {mostrarOpciones &&
            proveedores.map((label) => (
              <button
                key={label}
                type="button"
                className="w-full flex items-center justify-center gap-2 border rounded px-4 py-2 text-sm
                           bg-white dark:bg-dark-surface text-light-text dark:text-dark-text
                           border-light-border dark:border-dark-border
                           hover:bg-white/90 dark:hover:bg-dark-surface/90 transition"
              >
                Iniciar con {label}
              </button>
            ))}
        </div>
      </form>

      <ModalOTP
        isOpen={mostrarOTPModal}
        onClose={() => setMostrarOTPModal(false)}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        onConfirm={handleVerifyOTP}
      />
    </>
  );
}
