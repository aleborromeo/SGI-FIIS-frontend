import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmContextProps {
  confirmDialog: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextProps | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<{ resolve: (value: boolean) => void } | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('confirm-modal-open');
    } else {
      document.body.classList.remove('confirm-modal-open');
    }
    return () => {
      document.body.classList.remove('confirm-modal-open');
    };
  }, [isOpen]);

  const confirmDialog = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolver({ resolve });
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver) {
      resolver.resolve(true);
      setResolver(null);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolver) {
      resolver.resolve(false);
      setResolver(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirmDialog }}>
      {children}
      {isOpen && options && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.3)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{
            backgroundColor: 'var(--surface-container, #ffffff)',
            borderRadius: '24px',
            overflow: 'hidden',
            maxWidth: '440px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid var(--outline-variant, rgba(0, 0, 0, 0.05))',
            animation: 'slideUp 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}>
            {/* Cabecera degradada */}
            <div style={{
              background: options.danger
                ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              padding: '24px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <AlertCircle size={24} />
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                margin: 0,
              }}>
                {options.title}
              </h3>
            </div>
            
            <div style={{ padding: '24px' }}>
              <p style={{
                fontSize: '0.975rem',
                color: 'var(--on-surface-variant, #475569)',
                marginBottom: '24px',
                lineHeight: 1.6,
                marginTop: 0,
              }}>
                {options.message}
              </p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCancel}
                  style={{
                    borderRadius: '9999px',
                    padding: '8px 20px',
                  }}
                >
                  {options.cancelText || t('common:cancel')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirm}
                  style={{
                    background: options.danger
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    borderColor: 'transparent',
                    color: '#ffffff',
                    borderRadius: '9999px',
                    padding: '8px 20px',
                    fontWeight: 600,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {options.confirmText || t('common:confirm')}
                </Button>
              </div>
            </div>
          </div>
          <style>
            {`
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              @keyframes slideUp { from { transform: translateY(20px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
            `}
          </style>
        </div>,
        document.body
      )}
    </ConfirmContext.Provider>
  );
};
