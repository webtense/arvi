import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ca from './locales/ca.json';
import es from './locales/es.json';

const resources = {
    ca: { translation: ca },
    es: { translation: es }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'ca', // Default language is Catalan
        fallbackLng: 'es',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
