import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ObservationsPanel } from './ObservationsPanel';

describe('ObservationsPanel', () => {
  it('renders the title correctly', () => {
    render(
      <MemoryRouter>
        <ObservationsPanel />
      </MemoryRouter>
    );
    expect(screen.getByText('Observaciones del Jurado')).toBeDefined();
    expect(screen.getByText('Requiere Subsanación')).toBeDefined();
  });

  it('renders the mock observations', () => {
    render(
      <MemoryRouter>
        <ObservationsPanel />
      </MemoryRouter>
    );
    // Check if the mock observations are rendered
    expect(screen.getByText('Marco Teórico')).toBeDefined();
    expect(screen.getByText('Falta citar autores más recientes (2020+).')).toBeDefined();
    expect(screen.getByText('Metodología')).toBeDefined();
  });

  it('renders the remedy submission form', () => {
    render(
      <MemoryRouter>
        <ObservationsPanel />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Documento Corregido (PDF)')).toBeDefined();
    expect(screen.getByText('Justificación o Respuesta')).toBeDefined();
    
    const submitButton = screen.getByRole('button', { name: /Registrar Subsanación/i });
    expect(submitButton).toBeDefined();
  });
});
