import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Select } from './Select';

const options = [
  { value: '1', label: 'Uno' },
  { value: '2', label: 'Dos' },
];

describe('Select', () => {
  it('renderiza label y las opciones', () => {
    render(<Select label="Elige" options={options} />);
    expect(screen.getByLabelText('Elige')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Uno' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Dos' })).toBeInTheDocument();
  });

  it('muestra error con clase input-error', () => {
    render(<Select label="Elige" options={options} error="Requerido" />);
    const sel = screen.getByLabelText('Elige');
    expect(sel.className).toContain('input-error');
    expect(screen.getByText('Requerido')).toBeInTheDocument();
  });

  it('muestra helpText cuando no hay error', () => {
    render(<Select label="Elige" options={options} helpText="Ayuda" />);
    expect(screen.getByText('Ayuda')).toBeInTheDocument();
  });
});
