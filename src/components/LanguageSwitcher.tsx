import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface LanguageSwitcherProps {
  variant?: 'button' | 'select';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'select',
  className,
}) => {
  const { language, setLanguage } = useLanguage();

  if (variant === 'button') {
    return (
      <button
        type="button"
        className={className}
        onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
        style={{
          padding: '6px 14px',
          borderRadius: '9999px',
          border: '1px solid var(--outline-variant, rgba(0,0,0,0.12))',
          background: 'var(--surface-container, #f8fafc)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.8rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {language === 'es' ? 'EN' : 'ES'}
      </button>
    );
  }

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as 'es' | 'en')}
      className={className}
      aria-label="Idioma / Language"
      style={{
        padding: '6px 10px',
        borderRadius: '8px',
        border: '1px solid var(--outline-variant, rgba(0,0,0,0.12))',
        background: 'var(--surface-container, #f8fafc)',
        cursor: 'pointer',
        fontWeight: 500,
        fontSize: '0.85rem',
      }}
    >
      <option value="es">ES</option>
      <option value="en">EN</option>
    </select>
  );
};
