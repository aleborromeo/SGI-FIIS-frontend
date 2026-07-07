import React from 'react';
import { Check, ThumbsUp, AlertCircle, RefreshCw } from 'lucide-react';

export type StepStatus = 'listo' | 'aprobado' | 'observado' | 'actual';

interface Step {
  id: string;
  label: string;
  status: StepStatus;
  sublabel: string;
}

interface StepperProps {
  steps: Step[];
}

const getStatusColor = (status: StepStatus) => {
  switch (status) {
    case 'listo':
    case 'aprobado':
      return '#22c55e'; // green
    case 'observado':
      return '#ef4444'; // red
    case 'actual':
      return '#1e3a8a'; // dark blue
    default:
      return '#9ca3af'; // gray
  }
};

const getStatusIcon = (status: StepStatus) => {
  switch (status) {
    case 'listo':
      return <Check size={20} color="white" />;
    case 'aprobado':
      return <ThumbsUp size={20} color="white" />;
    case 'observado':
      return <AlertCircle size={20} color="white" />;
    case 'actual':
      return <RefreshCw size={20} color="white" />;
  }
};

export const Stepper: React.FC<StepperProps> = ({ steps }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '24px 0' }}>
      {steps.map((step, index) => {
        const color = getStatusColor(step.status);
        
        return (
          <React.Fragment key={step.id}>
            {/* Step Node */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  boxShadow: `0 0 0 4px ${color}33`, // 20% opacity ring
                }}
              >
                {getStatusIcon(step.status)}
              </div>
              <div className="text-label-md" style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{step.label}</div>
              <div className="text-caption" style={{ color: color, fontWeight: 500, marginTop: '4px', textTransform: 'uppercase' }}>
                {step.sublabel}
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div 
                style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: 'var(--surface-container-highest)',
                  margin: '0 16px',
                  transform: 'translateY(-24px)'
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
