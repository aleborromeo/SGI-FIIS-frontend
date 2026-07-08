import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<{ resolve: (value: boolean) => void } | null>(null);

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
      {isOpen && options && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            backgroundColor: 'var(--surface)',
            padding: '32px',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg)',
            width: '90%',
            maxWidth: '450px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            border: '1px solid var(--outline-variant)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                backgroundColor: options.danger ? 'var(--error-container)' : 'var(--primary-container)',
                color: options.danger ? 'var(--on-error-container)' : 'var(--on-primary-container)',
                padding: '12px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertCircle size={28} />
              </div>
              <div style={{ paddingTop: '4px' }}>
                <h3 className="text-title-lg" style={{ margin: 0, marginBottom: '8px', fontWeight: 700, color: 'var(--on-surface)' }}>
                  {options.title}
                </h3>
                <p className="text-body-md" style={{ margin: 0, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                  {options.message}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <Button variant="secondary" onClick={handleCancel} style={{ padding: '10px 20px' }}>
                {options.cancelText || 'Cancelar'}
              </Button>
              <Button 
                variant={options.danger ? 'danger' : 'primary'} 
                onClick={handleConfirm}
                style={{ padding: '10px 20px' }}
              >
                {options.confirmText || 'Confirmar'}
              </Button>
            </div>
          </div>
          <style>
            {`
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              @keyframes slideUp { from { transform: translateY(20px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
            `}
          </style>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
