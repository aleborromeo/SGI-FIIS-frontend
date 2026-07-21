import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { DirectorEvaluations } from './DirectorEvaluations';
import { evaluacionService } from '../../services/evaluacionService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/evaluacionService', () => ({
  evaluacionService: {
    listAll: vi.fn(),
    getById: vi.fn(),
  },
}));

const mockEvaluacionService = vi.mocked(evaluacionService);

const mockEvaluations = [
  {
    id: 1,
    evaluationId: 1,
    idEvaluacion: 1,
    expedienteCode: 'EXP-001',
    fechaAsignacion: '2026-01-10T10:00:00Z',
    resultado: 'APROBADO',
    puntaje: 85,
    observaciones: 'Excelente trabajo',
    fechaEvaluacion: '2026-01-15T10:00:00Z',
  },
  {
    id: 2,
    evaluationId: 2,
    idEvaluacion: 2,
    expedienteCode: 'EXP-002',
    fechaAsignacion: '2026-01-12T10:00:00Z',
    resultado: 'PENDIENTE',
    puntaje: null,
    observaciones: null,
    fechaEvaluacion: null,
  },
];

describe('DirectorEvaluations', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockEvaluacionService.listAll.mockResolvedValue(mockEvaluations as any);
    mockEvaluacionService.getById.mockResolvedValue(mockEvaluations[0] as any);
  });

  it('renders loading spinner initially', () => {
    mockEvaluacionService.listAll.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
    );
    renderWithProviders(<DirectorEvaluations />);
    expect(document.querySelector('[aria-label="Cargando..."]')).toBeDefined();
  });

  it('renders evaluations list after loading', async () => {
    renderWithProviders(<DirectorEvaluations />);

    expect(await screen.findByText('EXP-001')).toBeDefined();
    expect(screen.getByText('EXP-002')).toBeDefined();
  });

  it('renders evaluation IDs', async () => {
    renderWithProviders(<DirectorEvaluations />);

    expect(await screen.findByText('EVAL-1')).toBeDefined();
    expect(screen.getByText('EVAL-2')).toBeDefined();
  });

  it('shows 85 pts for approved evaluation', async () => {
    renderWithProviders(<DirectorEvaluations />);
    expect(await screen.findByText('85 pts')).toBeDefined();
  });

  it('shows — for pending evaluation score', async () => {
    renderWithProviders(<DirectorEvaluations />);
    await screen.findByText('85 pts');
    // The — for null score
    const cells = screen.getAllByRole('cell');
    const emptyScore = cells.find((c) => c.textContent === '—');
    expect(emptyScore).toBeDefined();
  });

  it('shows empty state when no evaluations', async () => {
    mockEvaluacionService.listAll.mockResolvedValue([]);
    renderWithProviders(<DirectorEvaluations />);
    expect(await screen.findByText(/no se encontraron evaluaciones/i)).toBeDefined();
  });

  it('filters by status', async () => {
    renderWithProviders(<DirectorEvaluations />);

    await screen.findByText('EXP-001');

    const statusSelect = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(statusSelect, { target: { value: 'APROBADO' } });
    });

    expect(screen.getByText('EXP-001')).toBeDefined();
    expect(screen.queryByText('EXP-002')).toBeNull();
  });

  it('filters by search query', async () => {
    renderWithProviders(<DirectorEvaluations />);

    await screen.findByText('EXP-001');

    const searchInput = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'EXP-001' } });
    });

    expect(screen.getByText('EXP-001')).toBeDefined();
    expect(screen.queryByText('EXP-002')).toBeNull();
  });

  it('opens detail modal when Ver button is clicked', async () => {
    renderWithProviders(<DirectorEvaluations />);

    const verBtns = await screen.findAllByRole('button', { name: /detalle/i });
    await act(async () => {
      fireEvent.click(verBtns[0]);
    });

    expect(mockEvaluacionService.getById).toHaveBeenCalledWith(1);
    expect(await screen.findByText(/Excelente trabajo/i)).toBeDefined();
  });

  it('closes detail modal when close button is clicked', async () => {
    renderWithProviders(<DirectorEvaluations />);

    const verBtns = await screen.findAllByRole('button', { name: /detalle/i });
    await act(async () => {
      fireEvent.click(verBtns[0]);
    });

    await screen.findByText(/Excelente trabajo/i);

    // Find close button (X button)
    const closeBtn = screen.getByRole('button', { name: /cerrar/i });
    await act(async () => {
      fireEvent.click(closeBtn);
    });

    expect(screen.queryByText(/Excelente trabajo/i)).toBeNull();
  });

  it('shows refresh button', async () => {
    renderWithProviders(<DirectorEvaluations />);
    await screen.findByText('EXP-001');
    const refreshBtn = screen.getByRole('button', { name: /actualizar/i });
    expect(refreshBtn).toBeDefined();
  });

  it('re-fetches on refresh click', async () => {
    renderWithProviders(<DirectorEvaluations />);
    await screen.findByText('EXP-001');

    const refreshBtn = screen.getByRole('button', { name: /actualizar/i });
    await act(async () => {
      fireEvent.click(refreshBtn);
    });

    expect(mockEvaluacionService.listAll).toHaveBeenCalledTimes(2);
  });
});
