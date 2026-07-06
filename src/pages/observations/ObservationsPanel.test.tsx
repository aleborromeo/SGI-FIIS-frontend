import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ObservationsPanel } from './ObservationsPanel';
import { observationService } from '../../services/observationService';

// Mock the observationService
vi.mock('../../services/observationService', () => ({
  observationService: {
    getByProcedureId: vi.fn(),
    addRemedy: vi.fn(),
  }
}));

describe('ObservationsPanel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the title correctly', async () => {
    vi.mocked(observationService.getByProcedureId).mockResolvedValue([]);
    render(
      <MemoryRouter>
        <ObservationsPanel />
      </MemoryRouter>
    );
    expect(screen.getByText('Observaciones del Jurado')).toBeDefined();
    await waitFor(() => {
      expect(screen.getByText('TODO CONFORME')).toBeDefined(); // If no pending observations
    });
  });

  it('renders the mock observations', async () => {
    vi.mocked(observationService.getByProcedureId).mockResolvedValue([
      { id: 1, procedureId: '1', type: 'Marco Teórico', content: 'Falta citar autores más recientes (2020+).', status: 'PENDIENTE', createdAt: '' },
      { id: 2, procedureId: '1', type: 'Metodología', content: 'Justificar el tamaño de la muestra.', status: 'PENDIENTE', createdAt: '' }
    ]);
    render(
      <MemoryRouter>
        <ObservationsPanel />
      </MemoryRouter>
    );
    
    // Check if the mock observations are rendered
    await waitFor(() => {
      expect(screen.getByText('Marco Teórico')).toBeDefined();
      expect(screen.getByText('Falta citar autores más recientes (2020+).')).toBeDefined();
      expect(screen.getByText('Metodología')).toBeDefined();
    });
  });

  it('renders the remedy submission form', async () => {
    vi.mocked(observationService.getByProcedureId).mockResolvedValue([]);
    render(
      <MemoryRouter>
        <ObservationsPanel />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Documento Corregido (PDF)')).toBeDefined();
    });
    expect(screen.getByText('Justificación o Respuesta')).toBeDefined();
    
    const submitButton = screen.getByRole('button', { name: /Registrar Subsanación/i });
    expect(submitButton).toBeDefined();
  });
});
