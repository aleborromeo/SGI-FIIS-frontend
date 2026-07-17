import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import esCommon from './locales/es/common.json';
import esNavigation from './locales/es/navigation.json';
import esAuth from './locales/es/auth.json';
import esDashboard from './locales/es/dashboard.json';
import esProjects from './locales/es/projects.json';
import esConvocatorias from './locales/es/convocatorias.json';
import esTramites from './locales/es/tramites.json';
import esThesis from './locales/es/thesis.json';
import esAdmin from './locales/es/admin.json';
import esPublic from './locales/es/public.json';
import esObservations from './locales/es/observations.json';
import esProgressreports from './locales/es/progressreports.json';
import esResolutions from './locales/es/resolutions.json';

import enCommon from './locales/en/common.json';
import enNavigation from './locales/en/navigation.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enProjects from './locales/en/projects.json';
import enConvocatorias from './locales/en/convocatorias.json';
import enTramites from './locales/en/tramites.json';
import enThesis from './locales/en/thesis.json';
import enAdmin from './locales/en/admin.json';
import enPublic from './locales/en/public.json';
import enObservations from './locales/en/observations.json';
import enProgressreports from './locales/en/progressreports.json';
import enResolutions from './locales/en/resolutions.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        common: esCommon,
        navigation: esNavigation,
        auth: esAuth,
        dashboard: esDashboard,
        projects: esProjects,
        convocatorias: esConvocatorias,
        tramites: esTramites,
        thesis: esThesis,
        admin: esAdmin,
        public: esPublic,
        observations: esObservations,
        progressreports: esProgressreports,
        resolutions: esResolutions,
      },
      en: {
        common: enCommon,
        navigation: enNavigation,
        auth: enAuth,
        dashboard: enDashboard,
        projects: enProjects,
        convocatorias: enConvocatorias,
        tramites: enTramites,
        thesis: enThesis,
        admin: enAdmin,
        public: enPublic,
        observations: enObservations,
        progressreports: enProgressreports,
        resolutions: enResolutions,
      },
    },
    fallbackLng: 'es',
    supportedLngs: ['es', 'en'],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    defaultNS: 'common',
    ns: [
      'common', 'navigation', 'auth', 'dashboard', 'projects',
      'convocatorias', 'tramites', 'thesis', 'admin', 'public',
      'observations', 'progressreports', 'resolutions',
    ],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Keep Spanish as the default language unless the user has already
      // chosen a different one.
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'sgi_lang',
    },
  });

export default i18n;
