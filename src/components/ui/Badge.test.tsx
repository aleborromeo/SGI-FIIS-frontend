import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renderiza el children y la variante por defecto neutral', () => {
    render(<Badge>Activo</Badge>);
    const el = screen.getByText('Activo');
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('badge-neutral');
  });

  it('aplica la clase de variante', () => {
    const { container } = render(<Badge variant="success">OK</Badge>);
    expect(container.querySelector('.badge')?.className).toContain('badge-success');
  });

  it('muestra el icono cuando se pasa', () => {
    const { container } = render(<Badge icon={<span data-testid="ic" />}>X</Badge>);
    expect(container.querySelector('[data-testid="ic"]')).toBeInTheDocument();
  });

  it('propaga className y atributos', () => {
    render(<Badge className="extra" data-testid="b">X</Badge>);
    expect(screen.getByTestId('b').className).toContain('extra');
  });
});
