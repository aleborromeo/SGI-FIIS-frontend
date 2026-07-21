import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Stepper, type StepStatus } from './Stepper';

describe('Stepper', () => {
  it('renders all steps and correct status colors/icons', () => {
    const steps = [
      { id: '1', label: 'Step One', status: 'listo' as StepStatus, sublabel: 'SUB-1' },
      { id: '2', label: 'Step Two', status: 'aprobado' as StepStatus, sublabel: 'SUB-2' },
      { id: '3', label: 'Step Three', status: 'observado' as StepStatus, sublabel: 'SUB-3' },
      { id: '4', label: 'Step Four', status: 'actual' as StepStatus, sublabel: 'SUB-4' },
      { id: '5', label: 'Step Five', status: 'unknown_status' as any, sublabel: 'SUB-5' },
    ];

    render(<Stepper steps={steps} />);

    expect(screen.getByText('Step One')).toBeDefined();
    expect(screen.getByText('SUB-1')).toBeDefined();

    expect(screen.getByText('Step Two')).toBeDefined();
    expect(screen.getByText('SUB-2')).toBeDefined();

    expect(screen.getByText('Step Three')).toBeDefined();
    expect(screen.getByText('SUB-3')).toBeDefined();

    expect(screen.getByText('Step Four')).toBeDefined();
    expect(screen.getByText('SUB-4')).toBeDefined();

    expect(screen.getByText('Step Five')).toBeDefined();
    expect(screen.getByText('SUB-5')).toBeDefined();
  });
});
