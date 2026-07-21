import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DirectorEvaluations } from './DirectorEvaluations';
import { ToastProvider } from '../../context/ToastContext';

const { mockListAll, mockGetById } = vi.hoisted(() => ({
  mockListAll: vi.fn(),
  mockGetById: vi.fn(),
}));

vi.mock('../../services/evaluacionService', () => ({
  evaluacionService: {
    listAll: mockListAll,
    getById: mockGetById,
  },
}));

const mockEval = {
  id: 1,
  expedienteCode: 'EXP-2026-001',
  estado: 'PENDIENTE',
  resultado: 'PENDIENTE',
  puntaje: 15,
  fechaAsignacion: '2026-01-01T10:00:00Z',
  observaciones: 'Sin observaciones.',
} as any;

const renderPage = () =>
  render(
    <ToastProvider>
      <DirectorEvaluations />
    </ToastProvider>
  );

describe('DirectorEvaluations', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockListAll.mockResolvedValue([mockEval]);
    mockGetById.mockResolvedValue(mockEval);
  });

  it('renders the page title and the evaluation list', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', { name: /Monitoreo Global de Evaluaciones/i })
    ).toBeDefined();
    expect(await screen.findByText('EVAL-1')).toBeDefined();
    expect(screen.getByText('EXP-2026-001')).toBeDefined();
  });

  it('filters evaluations by search query', async () => {
    renderPage();
    await screen.findByText('EVAL-1');

    fireEvent.change(screen.getByPlaceholderText(/Buscar por ID de evaluaci/i), {
      target: { value: 'no-coincide' },
    });

    await waitFor(() => expect(screen.queryByText('EVAL-1')).toBeNull());
    expect(screen.getByText(/No se encontraron evaluaciones/i)).toBeDefined();
  });

  it('opens the detail modal when viewing an evaluation', async () => {
    renderPage();
    await screen.findByText('EVAL-1');

    fireEvent.click(screen.getAllByRole('button', { name: /Detalle/i })[0]);

    expect(await screen.findByText(/Detalle de la Evaluaci/i)).toBeDefined();
    expect(screen.getAllByText(/EVAL-1/).length).toBeGreaterThan(0);
    expect(mockGetById).toHaveBeenCalledWith(1);
  });
});
