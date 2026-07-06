import React from 'react';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  light?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'medium', 
  color = '#0b5ed7', 
  light = false 
}) => {
  const sizeMap = {
    small: '1.5rem',
    medium: '2.5rem',
    large: '4rem'
  };

  const borderMap = {
    small: '2px',
    medium: '3px',
    large: '4px'
  };

  const spinnerStyle: React.CSSProperties = {
    width: sizeMap[size],
    height: sizeMap[size],
    border: `${borderMap[size]} solid ${light ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
    borderTop: `${borderMap[size]} solid ${light ? '#ffffff' : color}`,
    borderRadius: '50%',
    animation: 'sgi-spin 0.8s linear infinite',
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <style>{`
        @keyframes sgi-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={spinnerStyle} aria-label="Cargando..." />
    </div>
  );
};
