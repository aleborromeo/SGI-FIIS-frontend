import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renderiza label y textarea', () => {
    render(<Textarea label="Comentario" />);
    expect(screen.getByLabelText('Comentario')).toBeInTheDocument();
  });

  it('muestra error con clase input-error', () => {
    render(<Textarea label="Comentario" error="Requerido" />);
    const ta = screen.getByLabelText('Comentario');
    expect(ta.className).toContain('input-error');
    expect(screen.getByText('Requerido')).toBeInTheDocument();
  });

  it('muestra helpText cuando no hay error', () => {
    render(<Textarea label="Comentario" helpText="Ayuda" />);
    expect(screen.getByText('Ayuda')).toBeInTheDocument();
  });
});
