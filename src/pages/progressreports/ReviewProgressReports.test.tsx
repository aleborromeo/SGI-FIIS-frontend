import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReviewProgressReports } from './ReviewProgressReports';

describe('ReviewProgressReports', () => {
  it('renders the title correctly', () => {
    render(
      <MemoryRouter>
        <ReviewProgressReports />
      </MemoryRouter>
    );
    expect(screen.getByText('Revisión de Informes Trimestrales')).toBeDefined();
  });

  it('renders the mock reports data', () => {
    render(
      <MemoryRouter>
        <ReviewProgressReports />
      </MemoryRouter>
    );
    // Titles of the mock data
    expect(screen.getByText('Sistema de Riego Automatizado')).toBeDefined();
    expect(screen.getByText('Impacto de la IA en la cadena de suministro')).toBeDefined();
  });

  it('renders approval and observation buttons for pending reports only', () => {
    render(
      <MemoryRouter>
        <ReviewProgressReports />
      </MemoryRouter>
    );
    
    const approveButtons = screen.getAllByRole('button', { name: /Aprobar/i });
    const observeButtons = screen.getAllByRole('button', { name: /Observar/i });
    
    // There is 1 pending report in the mock data, so we should have 1 of each button
    expect(approveButtons.length).toBe(1);
    expect(observeButtons.length).toBe(1);
  });
});
