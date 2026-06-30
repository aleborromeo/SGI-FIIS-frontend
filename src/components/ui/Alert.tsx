import React from 'react';
import { AlertTriangle } from 'lucide-react';
import './ui.css';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'warning';
  title?: string;
}

export const Alert: React.FC<AlertProps> = ({ 
  className = '', 
  variant = 'warning', 
  title,
  children, 
  ...props 
}) => {
  return (
    <div className={`alert alert-${variant} ${className}`} {...props}>
      <div style={{ flexShrink: 0 }}>
        {variant === 'warning' && <AlertTriangle size={20} />}
      </div>
      <div>
        {title && <div style={{ fontWeight: 600, marginBottom: '4px' }}>{title}</div>}
        <div style={{ fontSize: '14px' }}>{children}</div>
      </div>
    </div>
  );
};
