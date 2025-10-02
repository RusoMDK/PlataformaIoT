// src/pages/Ayuda.jsx
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  BookOpen,
  LifeBuoy,
  Rocket,
  PlugZap,
  ShieldCheck,
  Cpu,
  BellRing,
  Wrench,
  MessageSquare,
  Mail,
} from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';

export default function Ayuda() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const quickLinks = useMemo(
    () => [
      {
        to: '/registro',
        icon: <Rocket size={22} />,
        title: t('ayuda.quick.crearCuenta', 'Crear cuenta'),
        desc: t('ayuda.quick.crearCuentaDesc', 'Empieza gratis en minutos.'),
      },
      {
        to: '/proyectos',
        icon: <Cpu size={22} />,
        title: t('ayuda.quick.proyectos', 'Proyectos y Things'),
        desc: t('ayuda.quick.proyectosDesc', 'Estructura y orquesta tus dispositivos.'),
      },
      {
        to: '/notificaciones',
        icon: <BellRing size={22} />,
        title: t('ayuda.quick.alertas', 'Alertas y automatizaciones'),
        desc: t('ayuda.quick.alertasDesc', 'Crea reglas, playbooks y respuestas.'),
      },
      {
        to: '/docs',
        icon: <BookOpen size={22} />,
        title: t('ayuda.quick.docs', 'Documentación'),
        desc: t('ayuda.quick.docsDesc', 'Guías, SDKs y ejemplos listos.'),
      },
    ],
    [t]
  );

  const faqItems = useMemo(
    () => [
      {
        q: t('ayuda.faq.1.q', '¿Cómo conecto mi primer dispositivo?'),
        a: t(
          'ayuda.faq.1.a',
          'Crea un Proyecto, registra un Thing y usa las credenciales generadas en tu firmware (ESP32, Raspberry, etc.).'
        ),
      },
      {
        q: t('ayuda.faq.2.q', '¿Qué protocolos soporta?'),
        a: t(
          'ayuda.faq.2.a',
          'MQTT y HTTP out-of-the-box. También WebSockets para dashboards en tiempo real.'
        ),
      },
      {
        q: t('ayuda.faq.3.q', '¿Cómo configuro alertas?'),
        a: t(
          'ayuda.faq.3.a',
          'Desde Notificaciones crea reglas por umbral o anomalías y define acciones (email, webhook, script).'
        ),
      },
      {
        q: t('ayuda.faq.4.q', '¿Cómo gestiono roles y permisos?'),
        a: t(
          'ayuda.faq.4.a',
          'En Configuración > Seguridad asigna roles (Owner, Admin, Viewer) por proyecto o equipo.'
        ),
      },
    ],
    [t]
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q')?.toString().trim();
    if (q) navigate(`/buscar?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="relative">
      {/* Fondo suave */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/15 dark:bg-primary/25 blur-2xl opacity-70 dark:opacity-40" />
        <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-accent/15 dark:bg-accent/25 blur-2xl opacity-70 dark:opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        {/* Header */}
        <header className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {t('ayuda.titulo', 'Centro de Ayuda')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t(
              'ayuda.descripcion',
              'Encuentra guías, respuestas rápidas y soporte para sacar el máximo de la plataforma.'
            )}
          </p>

          {/* Buscador */}
          <form
            onSubmit={handleSearch}
            className="mt-4 max-w-2xl mx-auto flex items-center gap-2 rounded-2xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.04] backdrop-blur-md px-3 py-2 shadow-sm"
          >
            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input
              name="q"
              type="search"
              autoComplete="off"
              placeholder={t('ayuda.buscarPlaceholder', 'Busca “MQTT”, “alertas”, “roles”…')}
              className="w-full bg-transparent outline-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-gray-300/60 dark:border-white/10 px-1.5 py-0.5 text-[10px] text-gray-500 dark:text-gray-400">
              <span>⌘</span>
              <span>K</span>
            </kbd>
          </form>

          {/* Estado mini (estático de ejemplo) */}
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t('ayuda.estado', 'Estado del sistema: Operativo')}
          </div>
        </header>

        {/* Quick Actions */}
        <section className="space-y-4">
          <SectionTitle
            icon={<BookOpen className="w-5 h-5" />}
            title={t('ayuda.rapidoTitulo', 'Accesos rápidos')}
            subtitle={t('ayuda.rapidoSub', 'Empieza por lo esencial')}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {quickLinks.map((q) => (
              <QuickLinkCard key={q.title} {...q} />
            ))}
          </div>
        </section>

        {/* Onboarding en pasos */}
        <section className="space-y-6">
          <SectionTitle
            icon={<Rocket className="w-5 h-5" />}
            title={t('ayuda.comoEmpezarTitulo', 'Cómo empezar')}
            subtitle={t('ayuda.introTitulo', 'Tu primer flujo en 4 pasos')}
          />
          <ol className="grid md:grid-cols-2 gap-5">
            <Step
              step={1}
              icon={<PlugZap className="w-5 h-5" />}
              title={t('ayuda.pasos.nuevoDispositivo', 'Añade tu dispositivo')}
              desc={t(
                'ayuda.pasos.nuevoDispositivoDesc',
                'Regístralo y genera credenciales seguras para tu firmware.'
              )}
              to="/nuevo-dispositivo"
            />
            <Step
              step={2}
              icon={<Cpu className="w-5 h-5" />}
              title={t('ayuda.pasos.crearThing', 'Crea un Thing / Proyecto')}
              desc={t(
                'ayuda.pasos.crearThingDesc',
                'Agrupa dispositivos, define atributos y desired/commands.'
              )}
              to="/proyectos"
            />
            <Step
              step={3}
              icon={<ShieldCheck className="w-5 h-5" />}
              title={t('ayuda.pasos.seguridad', 'Configura seguridad')}
              desc={t(
                'ayuda.pasos.seguridadDesc',
                'Habilita roles, API keys y verifica scopes de acceso.'
              )}
              to="/configuracion/seguridad"
            />
            <Step
              step={4}
              icon={<BellRing className="w-5 h-5" />}
              title={t('ayuda.pasos.alertas', 'Crea alertas / automatizaciones')}
              desc={t(
                'ayuda.pasos.alertasDesc',
                'Define reglas por umbrales o anomalías y notifica por email/webhook.'
              )}
              to="/notificaciones"
            />
          </ol>

          {/* Snippet rápido MQTT */}
          <Card className="mt-2 border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.04]">
            <CardContent className="p-4">
              <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {t('ayuda.snippet.titulo', 'Ejemplo rápido MQTT (ESP32)')}
              </CardTitle>
              <pre className="rounded-xl p-4 text-xs overflow-x-auto bg-gray-900 text-gray-100">
{`// broker: mqtts://<host>:8883
// username: <thingId>
// password: <token>
// topic pub: devices/<thingId>/telemetry
// topic sub: devices/<thingId>/desired
client.publish('devices/THING123/telemetry', JSON.stringify({
  t: Date.now(), temp: 22.7, hum: 63
}));`}
              </pre>
            </CardContent>
          </Card>
        </section>

        {/* FAQs en acordeón */}
        <section className="space-y-4">
          <SectionTitle
            icon={<LifeBuoy className="w-5 h-5" />}
            title={t('ayuda.faqTitulo', 'Preguntas frecuentes')}
            subtitle={t('ayuda.faqSub', 'Respuestas rápidas a lo más común')}
          />
          <div className="grid lg:grid-cols-2 gap-4">
            {faqItems.map((item, idx) => (
              <FaqItem key={idx} q={item.q} a={item.a} />
            ))}
          </div>
        </section>

        {/* Troubleshooter / Problemas comunes */}
        <section className="space-y-4">
          <SectionTitle
            icon={<Wrench className="w-5 h-5" />}
            title={t('ayuda.troubleshootTitulo', 'Solución de problemas')}
            subtitle={t('ayuda.troubleshootSub', 'Chequeos guiados por síntoma')}
          />
          <div className="grid md:grid-cols-3 gap-5">
            <TroubleCard
              title={t('ayuda.troubleshoot.mqtt', 'No conecta por MQTT')}
              bullets={[
                t('ayuda.troubleshoot.mqtt1', 'Verifica host/puerto/SSL.'),
                t('ayuda.troubleshoot.mqtt2', 'Comprueba credenciales del Thing.'),
                t('ayuda.troubleshoot.mqtt3', 'Revisa firewall/puertos salientes.'),
              ]}
              to="/docs#mqtt"
            />
            <TroubleCard
              title={t('ayuda.troubleshoot.eventos', 'No llegan eventos')}
              bullets={[
                t('ayuda.troubleshoot.eventos1', 'Confirma el topic y payload JSON.'),
                t('ayuda.troubleshoot.eventos2', 'Mira el panel de telemetría.'),
                t('ayuda.troubleshoot.eventos3', 'Usa el inspector de logs.'),
              ]}
              to="/proyectos"
            />
            <TroubleCard
              title={t('ayuda.troubleshoot.alertas', 'No saltan alertas')}
              bullets={[
                t('ayuda.troubleshoot.alertas1', 'Revisa umbrales/reglas activas.'),
                t('ayuda.troubleshoot.alertas2', 'Valida destino (email/webhook).'),
                t('ayuda.troubleshoot.alertas3', 'Consulta el historial de triggers.'),
              ]}
              to="/notificaciones"
            />
          </div>
        </section>

        {/* CTA Soporte */}
        <section className="relative overflow-hidden rounded-3xl border border-light-border dark:border-dark-border bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-8">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/15 dark:bg-primary/25 blur-2xl rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-accent/15 dark:bg-accent/25 blur-2xl rounded-full" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('ayuda.cta.titulo', '¿Aún con dudas? Estamos para ayudarte')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t(
                  'ayuda.cta.desc',
                  'Escríbenos y un especialista te responde con ejemplos y mejores prácticas.'
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/soporte"
                className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-4 py-2 text-sm hover:bg-primary-hover transition"
              >
                <MessageSquare className="w-4 h-4" />
                {t('ayuda.cta.chat', 'Abrir chat')}
              </Link>
              <a
                href="mailto:soporte@iot.local"
                className="inline-flex items-center gap-2 rounded-xl border border-primary/40 text-primary px-4 py-2 text-sm hover:bg-primary/10 dark:hover:bg-primary/20 transition"
              >
                <Mail className="w-4 h-4" />
                {t('ayuda.cta.email', 'Enviar email')}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ========== Subcomponentes ========== */

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white/70 dark:bg-white/[0.05] border border-light-border dark:border-dark-border">
          <span className="text-primary dark:text-darkAccent">{icon}</span>
        </span>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-xs text-gray-600 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
  );
}

function QuickLinkCard({ to, icon, title, desc }) {
  return (
    <Link
      to={to}
      className="group block rounded-2xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.05] backdrop-blur-md p-4 shadow-sm hover:shadow-md transition hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 dark:from-primary/25 dark:to-accent/25 ring-1 ring-black/5 dark:ring-white/10 text-primary dark:text-darkAccent">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
              {title}
            </CardTitle>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{desc}</p>
        </div>
      </div>
    </Link>
  );
}

function Step({ step, icon, title, desc, to }) {
  return (
    <Link to={to} className="group">
      <div className="h-full rounded-2xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.05] backdrop-blur-md p-5 shadow-sm hover:shadow-md transition hover:-translate-y-0.5">
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 dark:from-primary/25 dark:to-accent/25 text-primary dark:text-darkAccent ring-1 ring-black/5 dark:ring-white/10">
              {icon}
            </div>
            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-[11px] font-semibold shadow">
              {step}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{desc}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FaqItem({ q, a }) {
  return (
    <details className="group rounded-2xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.05] p-4">
      <summary className="list-none cursor-pointer flex items-start justify-between gap-3">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {q}
        </span>
        <span className="mt-0.5 inline-flex w-6 h-6 items-center justify-center rounded-md border border-light-border dark:border-dark-border text-gray-600 dark:text-gray-300">
          +
        </span>
      </summary>
      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 pl-0.5">{a}</p>
    </details>
  );
}

function TroubleCard({ title, bullets, to }) {
  return (
    <Link
      to={to}
      className="block rounded-2xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.05] p-5 hover:shadow-md transition hover:-translate-y-0.5"
    >
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
      <ul className="mt-2 space-y-1 text-xs text-gray-700 dark:text-gray-300">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary dark:bg-darkAccent" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </Link>
  );
}
