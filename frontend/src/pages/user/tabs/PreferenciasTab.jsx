import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { Switch } from '../../../components/ui/Switch';
import { useTheme } from '../../../context/ThemeContext';
import { toast } from 'sonner';

export default function PreferenciasTab() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme(); // 🔥 Aquí usamos el 'theme' real
  const [perfil, setPerfil] = useState({
    preferencias: {
      temaUI: 'system',
      idioma: 'es',
      notificaciones: true,
    },
  });
  const [loading, setLoading] = useState(false);

  const temas = [
    { value: 'light', label: '🌞 Light' },
    { value: 'dark', label: '🌙 Dark' },
    { value: 'system', label: '🖥 System' },
  ];

  const idiomas = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
  ];

  useEffect(() => {
    if (perfil.preferencias.temaUI) {
      setTheme(perfil.preferencias.temaUI);
    }
    if (perfil.preferencias.idioma) {
      i18n.changeLanguage(perfil.preferencias.idioma);
    }
  }, []);

  const updatePreferencia = (campo, valor) => {
    setPerfil(prev => ({
      ...prev,
      preferencias: {
        ...prev.preferencias,
        [campo]: valor,
      },
    }));

    if (campo === 'idioma') {
      i18n.changeLanguage(valor);
    }
    if (campo === 'temaUI') {
      setTheme(valor); // 🔥 Aplica el tema exacto (light, dark o system)
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      toast.success(t('preference.preferencesSaved'));
    } catch (error) {
      console.error(t('preference.errorSavingPreferences'), error);
      toast.error(t('preference.errorSavingPreferences'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card>
        <CardContent className="p-6 space-y-8">
          {/* Tema */}
          <section>
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              {t('preference.interfaceTheme')}
            </h3>
            <div className="flex gap-3">
              {temas.map(tma => (
                <Button
                  key={tma.value}
                  variant={perfil.preferencias.temaUI === tma.value ? 'default' : 'outline'}
                  onClick={() => updatePreferencia('temaUI', tma.value)}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {tma.label}
                </Button>
              ))}
            </div>
          </section>

          {/* Idioma */}
          <section>
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              {t('preference.platformLanguage')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {idiomas.map(lang => (
                <Button
                  key={lang.value}
                  variant={perfil.preferencias.idioma === lang.value ? 'default' : 'outline'}
                  onClick={() => updatePreferencia('idioma', lang.value)}
                  size="sm"
                >
                  {lang.label}
                </Button>
              ))}
            </div>
          </section>

          {/* Notificaciones */}
          <section>
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              {t('preference.notifications')}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('preference.enableNotifications')}
              </span>
              <Switch
                checked={perfil.preferencias.notificaciones}
                onCheckedChange={value => updatePreferencia('notificaciones', value)}
              />
            </div>
          </section>

          <Button onClick={handleSave} disabled={loading} className="w-full mt-6">
            {loading ? t('preference.saving') : t('preference.savePreferences')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
