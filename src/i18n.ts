import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import locales from './locales';

const savedLanguage = localStorage.getItem('language') || 'zh_CN';

i18n
  .use(initReactI18next)
  .init({
    resources: locales,
    lng: savedLanguage,
    fallbackLng: 'zh_CN',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
