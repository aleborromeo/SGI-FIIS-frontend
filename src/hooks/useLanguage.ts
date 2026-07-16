import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

export function useLanguage() {
  const { i18n } = useTranslation();

  const language = i18n.language as 'es' | 'en';

  const setLanguage = useCallback(
    (lang: 'es' | 'en') => {
      i18n.changeLanguage(lang);
      localStorage.setItem('sgi_lang', lang);
    },
    [i18n],
  );

  const toggleLanguage = useCallback(() => {
    const next = language === 'es' ? 'en' : 'es';
    setLanguage(next);
  }, [language, setLanguage]);

  return { language, setLanguage, toggleLanguage };
}
