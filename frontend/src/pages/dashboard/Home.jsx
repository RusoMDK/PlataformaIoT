import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Rocket, CloudLightning, ShieldCheck, Waves } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    document.title = 'IoT Platform | ' + t('home.titulo');
  }, [t]);

  return (
    <div className="min-h-[calc(100vh-100px)] bg-gradient-to-br from-blue-50 via-white to-purple-100 dark:from-[#0b0f19] dark:via-[#131a29] dark:to-[#0e141f] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-20 text-center space-y-16">
        {/* Título principal */}
        <div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
            ⚡ {t('home.titulo')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('home.descripcion')}
          </p>
        </div>

        {/* Botón principal */}
        <div>
          {token ? (
            <button
              onClick={() => navigate('/proyectos')}
              className="px-6 py-3 bg-primary text-white font-semibold rounded-full shadow hover:shadow-lg hover:scale-105 transition-all"
            >
              {t('home.botonPanel')}
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow hover:shadow-lg hover:scale-105 transition-all"
            >
              {t('home.botonComenzar')}
            </button>
          )}
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <Feature
            icon={<Rocket size={28} />}
            title={t('home.feature1.titulo')}
            desc={t('home.feature1.desc')}
          />
          <Feature
            icon={<CloudLightning size={28} />}
            title={t('home.feature2.titulo')}
            desc={t('home.feature2.desc')}
          />
          <Feature
            icon={<ShieldCheck size={28} />}
            title={t('home.feature3.titulo')}
            desc={t('home.feature3.desc')}
          />
          <Feature
            icon={<Waves size={28} />}
            title={t('home.feature4.titulo')}
            desc={t('home.feature4.desc')}
          />
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="bg-white dark:bg-[#1d2534] border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-left group">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-primary dark:text-darkAccent">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-primary dark:group-hover:text-darkAccent transition-colors">
          {title}
        </h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
