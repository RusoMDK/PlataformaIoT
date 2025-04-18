import { Link } from 'react-router-dom';
import { BookOpen, HelpCircle, Settings, UserCheck, Wifi, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Ayuda() {
  const { t } = useTranslation();

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">{t('ayuda.titulo')}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('ayuda.descripcion')}</p>
      </header>

      <section>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-white mb-4">
          {t('ayuda.introTitulo')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {t('ayuda.introDescripcion')}
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-white mb-4">
          {t('ayuda.comoEmpezarTitulo')}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AyudaCard
            icon={<UserCheck size={20} />}
            title={t('ayuda.pasos.crearCuenta')}
            desc={t('ayuda.pasos.crearCuentaDesc')}
            to="/register"
          />
          <AyudaCard
            icon={<Zap size={20} />}
            title={t('ayuda.pasos.nuevoDispositivo')}
            desc={t('ayuda.pasos.nuevoDispositivoDesc')}
            to="/nuevo-dispositivo"
          />
          <AyudaCard
            icon={<Settings size={20} />}
            title={t('ayuda.pasos.crearThing')}
            desc={t('ayuda.pasos.crearThingDesc')}
            to="/proyectos"
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-white mb-4">
          📚{t('ayuda.faqTitulo')}
        </h2>
        <ul className="space-y-6 text-gray-700 dark:text-gray-300">
          <li>
            <p className="font-semibold">❓ {t('ayuda.faq.1.q')}</p>
            <p>{t('ayuda.faq.1.a')}</p>
          </li>
          <li>
            <p className="font-semibold">❓ {t('ayuda.faq.2.q')}</p>
            <p>{t('ayuda.faq.2.a')}</p>
          </li>
          <li>
            <p className="font-semibold">❓ {t('ayuda.faq.3.q')}</p>
            <p>{t('ayuda.faq.3.a')}</p>
          </li>
          <li>
            <p className="font-semibold">❓ {t('ayuda.faq.4.q')}</p>
            <p>{t('ayuda.faq.4.a')}</p>
          </li>
        </ul>
      </section>

      <section className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('ayuda.navegacionTitulo')}</p>
        <div className="mt-3 space-x-4">
          <Link to="/" className="text-blue-600 hover:underline">
            {t('ayuda.links.inicio')}
          </Link>
          <Link to="/proyectos" className="text-blue-600 hover:underline">
            {t('ayuda.links.proyectos')}
          </Link>
          <Link to="/notificaciones" className="text-blue-600 hover:underline">
            {t('ayuda.links.notificaciones')}
          </Link>
        </div>
      </section>
    </div>
  );
}

function AyudaCard({ icon, title, desc, to }) {
  return (
    <Link
      to={to}
      className="group border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-darkSurface hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col"
    >
      <div className="flex items-center gap-3 mb-2 text-primary">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
    </Link>
  );
}
