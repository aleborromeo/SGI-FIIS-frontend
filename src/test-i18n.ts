import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import esCommon from './i18n/locales/es/common.json';
import esNavigation from './i18n/locales/es/navigation.json';
import esAuth from './i18n/locales/es/auth.json';
import esDashboard from './i18n/locales/es/dashboard.json';
import esProjects from './i18n/locales/es/projects.json';
import esConvocatorias from './i18n/locales/es/convocatorias.json';
import esTramites from './i18n/locales/es/tramites.json';
import esThesis from './i18n/locales/es/thesis.json';
import esAdmin from './i18n/locales/es/admin.json';
import esPublic from './i18n/locales/es/public.json';
import esObservations from './i18n/locales/es/observations.json';
import esProgressreports from './i18n/locales/es/progressreports.json';
import esResolutions from './i18n/locales/es/resolutions.json';

i18n.use(initReactI18next).init({
  lng: 'es',
  fallbackLng: 'es',
  defaultNS: 'common',
  ns: [
    'common', 'navigation', 'auth', 'dashboard', 'projects',
    'convocatorias', 'tramites', 'thesis', 'admin', 'public',
    'observations', 'progressreports', 'resolutions',
  ],
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
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
