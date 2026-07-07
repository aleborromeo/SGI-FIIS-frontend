import React from 'react';
import './ui.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  className = '', 
  variant = 'neutral', 
  icon,
  children, 
  ...props 
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`} {...props}>
      {icon && <span style={{ marginRight: '4px', display: 'flex' }}>{icon}</span>}
      {children}
    </span>
  );
};
