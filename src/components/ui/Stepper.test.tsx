import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stepper } from './Stepper';

const steps = [
  { id: '1', label: 'Inicio', status: 'aprobado' as const, sublabel: 'OK' },
  { id: '2', label: 'Revision', status: 'actual' as const, sublabel: 'EN CURSO' },
  { id: '3', label: 'Fin', status: 'observado' as const, sublabel: 'OBS' },
  { id: '4', label: 'Done', status: 'listo' as const, sublabel: 'LISTO' },
];

describe('Stepper', () => {
  it('renderiza todos los labels y sublabels', () => {
    render(<Stepper steps={steps} />);
    steps.forEach((s) => {
      expect(screen.getByText(s.label)).toBeInTheDocument();
      expect(screen.getByText(s.sublabel)).toBeInTheDocument();
    });
  });

  it('renderiza la cantidad correcta de nodos (4 pasos)', () => {
    const { container } = render(<Stepper steps={steps} />);
    expect(container.querySelectorAll('.text-label-md').length).toBe(4);
  });

  it('maneja lista vacia sin crashear', () => {
    const { container } = render(<Stepper steps={[]} />);
    expect(container.firstChild).toBeTruthy();
  });
});
