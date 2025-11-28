import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationES from './locales/es.json';
import translationEN from './locales/en.json';

// Recursos de traducción
const resources = {
  es: {
    translation: translationES
  },
  en: {
    translation: translationEN
  }
};

i18n

  .use(LanguageDetector)
  .use(initReactI18next)
  
  .init({
    resources,
    fallbackLng: 'es', // Idioma por defecto si no se detecta ninguno
    lng: 'es', // Idioma inicial
    debug: false, 
    
    
    detection: {
      // Orden de detección: localStorage primero, luego el navegador
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
      excludeCacheFor: ['cimode']
    },
    
    interpolation: {
      escapeValue: false 
    },
    
    // Configuración de pluralización
    pluralSeparator: '_',
    
    ns: ['translation'],
    defaultNS: 'translation',
    
    react: {
      useSuspense: false 
    }
  });

export default i18n;
