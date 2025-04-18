import { Card, CardContent } from '@components/ui/Card'; // ó card.jsx → card
import { Button } from '@components/ui/Button'; // idem
// Perfil.jsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/Tabs'; //  T mayúscula y ruta única
import { Input } from '@components/ui/Input'; // nombre ya corregido
import {
  UserCircle,
  ImagePlus,
  Moon,
  SunMedium,
  Globe,
  KeyRound,
  Github,
  Apple,
  LogOut,
  Download,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

/**
 * ⚡ Perfil de Usuario all‑in‑one
 * - Cambiar avatar (arrastrar / seleccionar)
 * - Editar datos básicos
 * - Preferencias (tema, idioma)
 * - Seguridad (password, 2FA mock, tokens API)
 * - Integraciones (OAuth mock)
 * - Privacidad (descargar datos, eliminar cuenta)
 */
export default function UserProfile() {
  /* ---- DEMO STATE (remove once wired to backend) ---- */
  const [avatar, setAvatar] = useState(null);
  const [nombre, setNombre] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('es');

  /* ------------- helpers ------------- */
  const handleAvatar = e => {
    const file = e.target.files?.[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 fade-in">
      <h1 className="text-3xl font-bold dark:text-white flex items-center gap-2">
        <UserCircle className="w-8 h-8 text-primary" /> Perfil de Usuario
      </h1>

      <Tabs defaultValue="cuenta" className="w-full space-y-6">
        <TabsList className="grid sm:grid-cols-3 md:grid-cols-6 gap-2 bg-transparent">
          <TabsTrigger value="cuenta">Cuenta</TabsTrigger>
          <TabsTrigger value="preferencias">Preferencias</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
          <TabsTrigger value="integraciones">Integraciones</TabsTrigger>
          <TabsTrigger value="actividad">Actividad</TabsTrigger>
          <TabsTrigger value="privacidad">Privacidad</TabsTrigger>
        </TabsList>

        {/* ---------------- CUENTA ---------------- */}
        <TabsContent value="cuenta" className="space-y-6">
          <Card>
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
              {/* avatar */}
              <div className="relative group">
                <img
                  src={avatar || 'https://i.pravatar.cc/150'}
                  alt="avatar"
                  className="w-28 h-28 rounded-full object-cover shadow-md"
                />
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center cursor-pointer transition">
                  <ImagePlus className="text-white w-6 h-6" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                </label>
              </div>

              {/* info form */}
              <div className="flex-1 grid sm:grid-cols-2 gap-4 w-full">
                <Input label="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
                <Input
                  label="Correo"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <Button className="sm:col-span-2 w-full">Guardar cambios</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- PREFERENCIAS ---------------- */}
        <TabsContent value="preferencias" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Moon className="w-4 h-4" /> Tema
              </h3>
              <div className="flex gap-3">
                {[
                  { v: 'light', icon: <SunMedium className="w-4 h-4" /> },
                  { v: 'dark', icon: <Moon className="w-4 h-4" /> },
                  { v: 'system', icon: <ShieldCheck className="w-4 h-4" /> },
                ].map(o => (
                  <Button
                    key={o.v}
                    variant={theme === o.v ? 'default' : 'outline'}
                    onClick={() => setTheme(o.v)}
                    size="sm"
                  >
                    {o.icon} {o.v}
                  </Button>
                ))}
              </div>

              <h3 className="font-semibold flex items-center gap-2 pt-4">
                <Globe className="w-4 h-4" /> Idioma
              </h3>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="border rounded px-3 py-2 bg-white dark:bg-darkBg dark:border-gray-600"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- SEGURIDAD ---------------- */}
        <TabsContent value="seguridad" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <KeyRound className="w-4 h-4" /> Cambiar contraseña
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Actual" type="password" />
                <Input label="Nueva" type="password" />
                <Input label="Repetir" type="password" />
              </div>
              <Button>Cambiar</Button>

              <h3 className="font-semibold flex items-center gap-2 pt-6">
                <ShieldCheck className="w-4 h-4" /> Autenticación en 2 pasos (demo)
              </h3>
              <Button variant="outline" disabled>
                Configurar 2FA (próximamente)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- INTEGRACIONES ---------------- */}
        <TabsContent value="integraciones" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Cuentas conectadas</h3>
              <div className="space-y-2">
                {[
                  { l: 'GitHub', icon: <Github className="mr-2 w-4 h-4" />, connected: true },
                  { l: 'Apple', icon: <Apple className="mr-2 w-4 h-4" />, connected: false },
                ].map(o => (
                  <div
                    key={o.l}
                    className="flex items-center justify-between border rounded px-3 py-2"
                  >
                    <span className="flex items-center">
                      {o.icon} {o.l}
                    </span>
                    <Button size="sm" variant={o.connected ? 'destructive' : 'default'}>
                      {o.connected ? 'Desconectar' : 'Conectar'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- ACTIVIDAD ---------------- */}
        <TabsContent value="actividad" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-2 max-h-72 overflow-y-auto pr-1">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="text-sm text-gray-600 dark:text-gray-300">
                  • Inició sesión desde IP 192.168.0.{10 + i} — 2025‑04‑18 14:
                  {i.toString().padStart(2, '0')}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- PRIVACIDAD ---------------- */}
        <TabsContent value="privacidad" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Download className="w-4 h-4" /> Tus datos
              </h3>
              <Button variant="outline">Descargar zip</Button>

              <h3 className="font-semibold flex items-center gap-2 pt-6">
                <Trash2 className="w-4 h-4" /> Eliminar cuenta
              </h3>
              <Button variant="destructive">Eliminar permanentemente</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-right mt-6">
        <Button variant="secondary" size="sm">
          <LogOut className="w-4 h-4 mr-1" /> Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
