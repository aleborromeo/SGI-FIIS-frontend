import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../components/ui/ui.css';

const UnauthorizedPage = () => {
  const { t } = useTranslation('common');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'var(--error-bg, #fef2f2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <ShieldOff
          size={40}
          style={{ color: 'var(--error, #ef4444)' }}
        />
      </div>

      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--text-primary, #1f2937)',
          marginBottom: '0.5rem',
        }}
      >
        {t('accessDenied')}
      </h1>

      <p
        style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary, #6b7280)',
          marginBottom: '1.5rem',
          maxWidth: '400px',
        }}
      >
        {t('accessDeniedMessage')}
      </p>

      <Link
        to="/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1.25rem',
          backgroundColor: 'var(--primary, #3b82f6)',
          color: '#fff',
          borderRadius: 'var(--radius-md, 8px)',
          textDecoration: 'none',
          fontWeight: 500,
          fontSize: '0.9rem',
        }}
      >
        {t('goHome')}
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
