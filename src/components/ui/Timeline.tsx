import React from 'react';
import './ui.css';

export interface TimelineItemProps {
  id: string;
  title: string;
  time?: string;
  status: 'error' | 'active' | 'success' | 'pending';
  badge?: React.ReactNode;
  children?: React.ReactNode;
  isLast?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  time,
  status,
  badge,
  children,
  isLast = false
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'error': return 'var(--error)';
      case 'active': return 'var(--primary)';
      case 'success': return '#22c55e';
      default: return 'var(--surface-container-highest)';
    }
  };

  const color = getStatusColor();

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* Node & Line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div 
          style={{ 
            width: '16px', 
            height: '16px', 
            borderRadius: '50%', 
            backgroundColor: color,
            marginTop: '4px',
            zIndex: 1
          }} 
        />
        {!isLast && (
          <div 
            style={{ 
              width: '2px', 
              flex: 1, 
              backgroundColor: status === 'error' ? color : 'var(--primary)',
              opacity: status === 'pending' ? 0.2 : 1,
              marginTop: '4px',
              marginBottom: '4px'
            }} 
          />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: isLast ? '0' : '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <h4 className="text-label-md" style={{ color: color, fontWeight: 700, textTransform: 'uppercase' }}>
            {title}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            {time && <span className="text-caption" style={{ color: 'var(--on-surface-variant)' }}>{time}</span>}
            {badge && badge}
          </div>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export const Timeline: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );
};
