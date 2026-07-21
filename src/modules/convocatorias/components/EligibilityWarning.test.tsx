import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { EligibilityWarning } from './EligibilityWarning';

describe('EligibilityWarning', () => {
  it('returns null if both hasActiveGroup and hasVigentCalls are true', () => {
    const { container } = render(<EligibilityWarning hasActiveGroup={true} hasVigentCalls={true} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders active group alert if hasActiveGroup is false', () => {
    render(<EligibilityWarning hasActiveGroup={false} hasVigentCalls={true} />);

    expect(screen.getByText('No habilitado para postular')).toBeDefined();
    expect(
      screen.getByText('No pertenece actualmente a ningún grupo de investigación activo. Debe pertenecer a un grupo para registrar proyectos.')
    ).toBeDefined();
    expect(
      screen.queryByText('No existen convocatorias abiertas y vigentes dentro del rango de fechas permitido.')
    ).toBeNull();
  });

  it('renders vigent calls alert if hasVigentCalls is false', () => {
    render(<EligibilityWarning hasActiveGroup={true} hasVigentCalls={false} />);

    expect(screen.getByText('No habilitado para postular')).toBeDefined();
    expect(
      screen.queryByText('No pertenece actualmente a ningún grupo de investigación activo. Debe pertenecer a un grupo para registrar proyectos.')
    ).toBeNull();
    expect(
      screen.getByText('No existen convocatorias abiertas y vigentes dentro del rango de fechas permitido.')
    ).toBeDefined();
  });

  it('renders both alerts if both are false', () => {
    render(<EligibilityWarning hasActiveGroup={false} hasVigentCalls={false} />);

    expect(screen.getByText('No habilitado para postular')).toBeDefined();
    expect(
      screen.getByText('No pertenece actualmente a ningún grupo de investigación activo. Debe pertenecer a un grupo para registrar proyectos.')
    ).toBeDefined();
    expect(
      screen.getByText('No existen convocatorias abiertas y vigentes dentro del rango de fechas permitido.')
    ).toBeDefined();
  });
});
