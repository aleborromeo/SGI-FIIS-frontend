import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import './LanguageSwitcher.css';

interface LanguageSwitcherProps {
  variant?: 'button' | 'select';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'select',
  className,
}) => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const currentLanguageLabel = language === 'en' ? t('english') : t('spanish');

  if (variant === 'button') {
    return (
      <div ref={rootRef} className="language-switcher language-switcher--button">
        <button
          type="button"
          className={`language-switcher__trigger ${className ?? ''}`.trim()}
          onClick={() => setOpen((value) => !value)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={t('language')}
        >
          <Globe size={16} className="language-switcher__icon" />
          <span className="language-switcher__label">{currentLanguageLabel}</span>
          <ChevronDown
            size={15}
            className={`language-switcher__chevron ${open ? 'is-open' : ''}`}
          />
        </button>

        {open && (
          <div className="language-switcher__menu" role="menu" aria-label={t('language')}>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={language === 'es'}
              className={`language-switcher__option ${language === 'es' ? 'is-active' : ''}`}
              onClick={() => {
                void setLanguage('es');
                setOpen(false);
              }}
            >
              <span className="language-switcher__option-label">{t('spanish')}</span>
              <span className="language-switcher__option-code">ES</span>
            </button>

            <button
              type="button"
              role="menuitemradio"
              aria-checked={language === 'en'}
              className={`language-switcher__option ${language === 'en' ? 'is-active' : ''}`}
              onClick={() => {
                void setLanguage('en');
                setOpen(false);
              }}
            >
              <span className="language-switcher__option-label">{t('english')}</span>
              <span className="language-switcher__option-code">EN</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as 'es' | 'en')}
      className={className}
      aria-label={t('language')}
    >
      <option value="es">{t('spanish')}</option>
      <option value="en">{t('english')}</option>
    </select>
  );
};
