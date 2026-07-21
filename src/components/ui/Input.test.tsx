import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renderiza label y input', () => {
    render(<Input label="Correo" />);
    expect(screen.getByLabelText('Correo')).toBeInTheDocument();
  });

  it('muestra error con clase input-error', () => {
    render(<Input label="Correo" error="Requerido" />);
    const input = screen.getByLabelText('Correo');
    expect(input.className).toContain('input-error');
    expect(screen.getByText('Requerido')).toBeInTheDocument();
  });

  it('muestra helpText cuando no hay error', () => {
    render(<Input label="Correo" helpText="Ayuda" />);
    expect(screen.getByText('Ayuda')).toBeInTheDocument();
  });

  it('no muestra help-text cuando no hay error ni helpText', () => {
    const { container } = render(<Input label="Correo" />);
    expect(container.querySelector('.help-text')).toBeNull();
  });
});
