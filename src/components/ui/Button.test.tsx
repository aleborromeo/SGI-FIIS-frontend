import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza el children con variante por defecto primary', () => {
    render(<Button>Enviar</Button>);
    const btn = screen.getByRole('button', { name: 'Enviar' });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain('btn-primary');
  });

  it('aplica variante y tamaño', () => {
    render(<Button variant="danger" size="lg">Borrar</Button>);
    const btn = screen.getByRole('button', { name: 'Borrar' });
    expect(btn.className).toContain('btn-danger');
    expect(btn.className).toContain('btn-lg');
  });

  it('llama onClick al hacer click', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Click' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('muestra icono cuando se pasa', () => {
    const { container } = render(<Button icon={<span data-testid="i" />}>X</Button>);
    expect(container.querySelector('[data-testid="i"]')).toBeInTheDocument();
  });

  it('propaga disabled', () => {
    render(<Button disabled>Off</Button>);
    expect(screen.getByRole('button', { name: 'Off' })).toBeDisabled();
  });
});
