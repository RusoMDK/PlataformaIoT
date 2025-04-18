import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importa las traducciones
import es from './locales/es/translation.json';
import en from './locales/en/translation.json';

// Inicialización de i18next
i18n
  .use(LanguageDetector) // Detecta idioma del navegador
  .use(initReactI18next) // Integración con React
  .init({
    fallbackLng: 'es', // Idioma por defecto si no detecta
    debug: false, // Puedes poner en true si estás probando

    interpolation: {
      escapeValue: false, // React ya escapa por defecto
    },

    resources: {
      es: { translation: es },
      en: { translation: en },
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
