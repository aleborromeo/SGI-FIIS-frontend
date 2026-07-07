import React from 'react';
import './ui.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', icon, children, onClick, ...props }, ref) => {
    const baseClass = `btn btn-${variant}`;
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(e);
      } else {
        console.log(`[UI] Interaction: '${children?.toString() || 'Button'}' clicked (no handler attached)`);
      }
    };

    return (
      <button ref={ref} className={`${baseClass} ${className}`} onClick={handleClick} {...props}>
        {icon && <span className="btn-icon">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
