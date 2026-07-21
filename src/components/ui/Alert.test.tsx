import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renderiza el titulo y el contenido', () => {
    render(<Alert title="Cuidado">Mensaje</Alert>);
    expect(screen.getByText('Cuidado')).toBeInTheDocument();
    expect(screen.getByText('Mensaje')).toBeInTheDocument();
  });

  it('aplica la clase de variante warning por defecto', () => {
    const { container } = render(<Alert>Mensaje</Alert>);
    expect(container.querySelector('.alert')?.className).toContain('alert-warning');
  });

  it('no renderiza titulo cuando no se pasa', () => {
    const { container } = render(<Alert>Mensaje</Alert>);
    expect(container.querySelector('div div div')).toBeTruthy();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
