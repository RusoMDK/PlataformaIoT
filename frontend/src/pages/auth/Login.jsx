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

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setCargando(true);
    try {
      const csrfToken = await getCsrfToken();
      const resp = await login(form.email, form.password, csrfToken);
      const user = resp.usuario || resp;

      if (user.is2FAEnabled) {
        // 🛡️ Usuario con 2FA
        setUsuario(user);
        setTempToken(resp.token || '');
        localStorage.setItem('temp_token', resp.token || ''); // 🔥 Guardamos el token temporal
        setMostrarOTPModal(true);
        toast.info('🔒 Verifica tu código 2FA');
      } else {
        // 🔥 Usuario SIN 2FA
        guardarDatosUsuario(user, resp.token);
        toast.success('✔️ Bienvenido de nuevo');
        navigate('/proyectos');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || '❌ Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (!otpCode) {
        toast.warning('Introduce el código 2FA');
        return;
      }

      await verifyOTPLogin(otpCode); // 👈 solo mandas otp, como ya tienes temp_token

      toast.success('🔓 Código 2FA verificado correctamente');

      guardarDatosUsuario(usuario, tempToken); // ahora sí guardas todo bien
      setMostrarOTPModal(false);
      navigate('/home');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.msg || '❌ Código inválido, intenta de nuevo');
    }
  };

  const guardarDatosUsuario = (user, token) => {
    localStorage.setItem('rol', user.rol);
    localStorage.setItem('nombre', user.nombre);
    localStorage.setItem('correo', user.email);
    if (token) {
      localStorage.setItem('token', token);
      localStorage.removeItem('temp_token'); // 🔥 Borramos el temp después de validar
    }
  };

  return (
    <>
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
                {/* Aquí podría ir el logo */}
                Iniciar con {label}
              </button>
            ))}
        </div>
      </form>

      {/* 🔥 Modal OTP */}
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
