// src/pages/Ayuda.jsx
import { Link } from 'react-router-dom';
import { Settings, UserCheck, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardTitle } from '../../components/ui/Card';

export default function Ayuda() {
  const { t } = useTranslation();

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 bg-light-bg dark:bg-dark-bg rounded-xl transition-colors">
      {/* Encabezado */}
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-bold text-light-text dark:text-dark-text">
          {t('ayuda.titulo')}
        </h1>
        <p className="text-sm text-light-muted dark:text-dark-muted">{t('ayuda.descripcion')}</p>
      </header>

      {/* Introducción */}
      <section>
        <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-4">
          {t('ayuda.introTitulo')}
        </h2>
        <p className="text-light-text dark:text-dark-text leading-relaxed">
          {t('ayuda.introDescripcion')}
        </p>
      </section>

      {/* Cómo empezar */}
      <section>
        <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-4">
          {t('ayuda.comoEmpezarTitulo')}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AyudaCard
            icon={<UserCheck className="text-primary" size={22} />}
            title={t('ayuda.pasos.crearCuenta')}
            desc={t('ayuda.pasos.crearCuentaDesc')}
            to="/register"
          />
          <AyudaCard
            icon={<Zap className="text-primary" size={22} />}
            title={t('ayuda.pasos.nuevoDispositivo')}
            desc={t('ayuda.pasos.nuevoDispositivoDesc')}
            to="/nuevo-dispositivo"
          />
          <AyudaCard
            icon={<Settings className="text-primary" size={22} />}
            title={t('ayuda.pasos.crearThing')}
            desc={t('ayuda.pasos.crearThingDesc')}
            to="/proyectos"
          />
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section>
        <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-4">
          📚 {t('ayuda.faqTitulo')}
        </h2>
        <ul className="space-y-6 text-light-text dark:text-dark-text">
          {[1, 2, 3, 4].map(i => (
            <li key={i}>
              <p className="font-semibold">❓ {t(`ayuda.faq.${i}.q`)}</p>
              <p>{t(`ayuda.faq.${i}.a`)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Navegación */}
      <section className="text-center pt-6 border-t border-light-border dark:border-dark-border">
        <p className="text-sm text-light-muted dark:text-dark-muted">
          {t('ayuda.navegacionTitulo')}
        </p>
        <div className="mt-3 space-x-4">
          <Link to="/" className="text-primary dark:text-primary-dark hover:underline">
            {t('ayuda.links.inicio')}
          </Link>
          <Link to="/proyectos" className="text-primary dark:text-primary-dark hover:underline">
            {t('ayuda.links.proyectos')}
          </Link>
          <Link
            to="/notificaciones"
            className="text-primary dark:text-primary-dark hover:underline"
          >
            {t('ayuda.links.notificaciones')}
          </Link>
        </div>
      </section>
    </div>
  );
}

function AyudaCard({ icon, title, desc, to }) {
  return (
    <Link to={to} className="transition-all hover:scale-[1.015] active:scale-100">
      <Card className="h-full bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm hover:shadow-md transition">
        <CardContent className="p-5 space-y-2 h-full flex flex-col">
          <div className="flex items-center gap-3">
            {icon}
            <CardTitle className="text-base font-semibold text-light-text dark:text-white">
              {title}
            </CardTitle>
          </div>
          <p className="text-sm text-light-muted dark:text-dark-muted">{desc}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
