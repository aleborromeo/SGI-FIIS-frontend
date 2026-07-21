import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent, waitFor } from '@testing-library/react';
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
  {
    id: 3,
    evaluationId: 3,
    idEvaluacion: 3,
    expedienteCode: 'EXP-003',
    fechaAsignacion: '2026-02-01T08:00:00Z',
    resultado: 'RECHAZADO',
    puntaje: 40,
    observaciones: 'No cumple requisitos minimos',
    fechaEvaluacion: '2026-02-05T12:00:00Z',
  },
  {
    id: 4,
    evaluationId: 4,
    idEvaluacion: 4,
    expedienteCode: 'EXP-004',
    fechaAsignacion: '2026-02-10T09:00:00Z',
    resultado: 'CON_OBSERVACIONES',
    puntaje: 65,
    observaciones: 'Requiere ajustes menores',
    fechaEvaluacion: '2026-02-15T11:00:00Z',
  },
];

describe('DirectorEvaluations', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockEvaluacionService.listAll.mockResolvedValue(mockEvaluations as any);
    mockEvaluacionService.getById.mockResolvedValue(mockEvaluations[0] as any);
  });

  it('shows loading spinner initially', () => {
    mockEvaluacionService.listAll.mockImplementation(
      () => new Promise(() => {})
    );
    renderWithProviders(<DirectorEvaluations />);
    expect(document.querySelector('[aria-label="Cargando..."]')).toBeDefined();
  });

  it('renders evaluations list after loading', async () => {
    renderWithProviders(<DirectorEvaluations />);
    expect(await screen.findByText('EXP-001')).toBeDefined();
    expect(screen.getByText('EXP-002')).toBeDefined();
  });

  it('renders evaluation IDs as EVAL-{id}', async () => {
    renderWithProviders(<DirectorEvaluations />);
    expect(await screen.findByText('EVAL-1')).toBeDefined();
    expect(screen.getByText('EVAL-2')).toBeDefined();
  });

  it('renders approved evaluation score', async () => {
    renderWithProviders(<DirectorEvaluations />);
    expect(await screen.findByText('85 pts')).toBeDefined();
  });

  it('shows dash for pending evaluation score', async () => {
    renderWithProviders(<DirectorEvaluations />);
    await screen.findByText('EXP-001');
    const cells = screen.getAllByRole('cell');
    const emptyScore = cells.find((c) => c.textContent === '—');
    expect(emptyScore).toBeDefined();
  });

  it('shows empty state when no evaluations', async () => {
    mockEvaluacionService.listAll.mockResolvedValue([]);
    renderWithProviders(<DirectorEvaluations />);
    expect(await screen.findByText(/no se encontraron evaluaciones/i)).toBeDefined();
  });

  it('filters by status - APROBADO', async () => {
    renderWithProviders(<DirectorEvaluations />);
    await screen.findByText('EXP-001');

    const statusSelect = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(statusSelect, { target: { value: 'APROBADO' } });
    });

    expect(screen.getByText('EXP-001')).toBeDefined();
    expect(screen.queryByText('EXP-002')).toBeNull();
    expect(screen.queryByText('EXP-003')).toBeNull();
  });

  it('filters by status - RECHAZADO', async () => {
    renderWithProviders(<DirectorEvaluations />);
    await screen.findByText('EXP-001');

    const statusSelect = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(statusSelect, { target: { value: 'RECHAZADO' } });
    });

    expect(screen.getByText('EXP-003')).toBeDefined();
    expect(screen.queryByText('EXP-001')).toBeNull();
  });

  it('filters by status - CON_OBSERVACIONES', async () => {
    renderWithProviders(<DirectorEvaluations />);
    await screen.findByText('EXP-001');

    const statusSelect = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(statusSelect, { target: { value: 'CON_OBSERVACIONES' } });
    });

    expect(screen.getByText('EXP-004')).toBeDefined();
    expect(screen.queryByText('EXP-001')).toBeNull();
  });

  it('resets to all when selecting empty status', async () => {
    renderWithProviders(<DirectorEvaluations />);
    await screen.findByText('EXP-001');

    const statusSelect = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(statusSelect, { target: { value: 'APROBADO' } });
    });
    expect(screen.queryByText('EXP-002')).toBeNull();

    await act(async () => {
      fireEvent.change(statusSelect, { target: { value: '' } });
    });
    expect(screen.getByText('EXP-002')).toBeDefined();
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

  it('search by evaluation ID number', async () => {
    renderWithProviders(<DirectorEvaluations />);
    await screen.findByText('EXP-001');

    const searchInput = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: '2' } });
    });

    expect(screen.getByText('EXP-002')).toBeDefined();
    expect(screen.queryByText('EXP-001')).toBeNull();
  });

  it('opens detail modal when Ver/Detalle button is clicked', async () => {
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

    const closeBtn = screen.getByRole('button', { name: /cerrar/i });
    await act(async () => {
      fireEvent.click(closeBtn);
    });

    expect(screen.queryByText(/Excelente trabajo/i)).toBeNull();
  });

  it('closes detail modal when clicking backdrop', async () => {
    renderWithProviders(<DirectorEvaluations />);

    const verBtns = await screen.findAllByRole('button', { name: /detalle/i });
    await act(async () => {
      fireEvent.click(verBtns[0]);
    });

    await screen.findByText(/Excelente trabajo/i);

    const backdrop = document.querySelector('[style*="rgba(0,0,0,0.5)"]') as HTMLElement;
    if (backdrop) {
      await act(async () => {
        fireEvent.click(backdrop);
      });
      expect(screen.queryByText(/Excelente trabajo/i)).toBeNull();
    }
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

    expect(mockEvaluacionService.listAll).toHaveBeenCalledTimes(1);

    const refreshBtn = screen.getByRole('button', { name: /actualizar/i });
    await act(async () => {
      fireEvent.click(refreshBtn);
    });

    expect(mockEvaluacionService.listAll).toHaveBeenCalledTimes(2);
  });

  it('renders approved evaluation with success badge', async () => {
    renderWithProviders(<DirectorEvaluations />);
    await screen.findByText('EXP-001');
    const approvedBadges = screen.getAllByText(/Aprobado/i);
    expect(approvedBadges.length).toBeGreaterThan(0);
  });

  it('renders rejected evaluation', async () => {
    renderWithProviders(<DirectorEvaluations />);
    await screen.findByText('EXP-001');
    const rejectedBadges = screen.getAllByText(/Rechazado/i);
    expect(rejectedBadges.length).toBeGreaterThan(0);
  });

  it('renders 40 pts for rejected evaluation', async () => {
    renderWithProviders(<DirectorEvaluations />);
    expect(await screen.findByText('40 pts')).toBeDefined();
  });

  it('renders 65 pts for observation evaluation', async () => {
    renderWithProviders(<DirectorEvaluations />);
    expect(await screen.findByText('65 pts')).toBeDefined();
  });

  it('renders page title', async () => {
    renderWithProviders(<DirectorEvaluations />);
    await screen.findByText('EXP-001');
    expect(screen.getByText(/Monitoreo Global de Evaluaciones/i)).toBeDefined();
  });

  it('renders table headers', async () => {
    renderWithProviders(<DirectorEvaluations />);
    await screen.findByText('EXP-001');
    expect(screen.getByText(/ID Evaluación/i)).toBeDefined();
    expect(screen.getByText(/Código Expediente/i)).toBeDefined();
    expect(screen.getByText(/Dictamen/i)).toBeDefined();
    expect(screen.getByText(/Puntaje/i)).toBeDefined();
  });

  it('loads evaluations on mount', async () => {
    renderWithProviders(<DirectorEvaluations />);
    await screen.findByText('EXP-001');
    expect(mockEvaluacionService.listAll).toHaveBeenCalledTimes(1);
  });
});
