import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TramiteStatusBadge } from './TramiteStatusBadge';

describe('TramiteStatusBadge', () => {
  const casos: Array<[string, string]> = [
    ['REGISTRADO', 'neutral'],
    ['PENDIENTE_COORDINADOR', 'warning'],
    ['OBSERVADO', 'error'],
    ['SUBSANADO', 'info'],
    ['APROBADO_CON_RESOLUCION', 'success'],
    ['FINALIZADO', 'success'],
    ['RECHAZADO', 'error'],
  ];

  it.each(casos)('renderiza %s con variante %s', (estado, variante) => {
    const { container } = render(<TramiteStatusBadge estado={estado as any} />);
    const badge = container.querySelector('.badge');
    expect(badge).toBeTruthy();
    expect(badge?.className).toContain(`badge-${variante}`);
    expect(screen.getByText(/.+/)).toBeInTheDocument();
  });
});
