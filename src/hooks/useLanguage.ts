import { useTranslation } from 'react-i18next';
import { useCallback, useEffect } from 'react';

const normalizeLanguage = (lang?: string): 'es' | 'en' =>
  lang?.toLowerCase().startsWith('en') ? 'en' : 'es';

export function useLanguage() {
  const { i18n } = useTranslation();

  const language = normalizeLanguage(i18n.resolvedLanguage ?? i18n.language);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = useCallback(
    async (lang: 'es' | 'en') => {
      const normalized = normalizeLanguage(lang);

      await i18n.changeLanguage(normalized);
      localStorage.setItem('sgi_lang', normalized);

      if (typeof document !== 'undefined') {
        document.documentElement.lang = normalized;
      }
    },
    [i18n],
  );

  const toggleLanguage = useCallback(() => {
    const next = language === 'es' ? 'en' : 'es';
    setLanguage(next);
  }, [language, setLanguage]);

  return { language, setLanguage, toggleLanguage };
}
