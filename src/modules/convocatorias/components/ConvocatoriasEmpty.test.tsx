import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConvocatoriasEmpty } from './ConvocatoriasEmpty';

describe('ConvocatoriasEmpty', () => {
  it('renders correctly', () => {
    render(<ConvocatoriasEmpty />);
    expect(screen.getByText('No existen convocatorias activas')).toBeDefined();
    expect(
      screen.getByText('Actualmente no existen convocatorias de investigación abiertas en la FIIS. Intente más tarde.')
    ).toBeDefined();
  });
});
