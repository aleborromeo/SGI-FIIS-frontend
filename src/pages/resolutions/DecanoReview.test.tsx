import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent, waitFor } from '@testing-library/react';
import { DecanoReview } from './DecanoReview';
import { tramiteService } from '../../services/tramiteService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/tramiteService', () => ({
  tramiteService: {
    getPendingForRole: vi.fn(),
    flag: vi.fn(),
    reject: vi.fn(),
  },
  PENDING_STATE_BY_ROLE: {
    DECANO: 'PENDIENTE_DECANATO',
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockTramiteService = vi.mocked(tramiteService);

const mockTramites = [
  {
    id: 1,
    codigoTramite: 'TRM-001',
    tipoTramite: 'PROYECTO',
    tituloReferencia: 'Proyecto de Investigacion ABC',
    estadoActual: 'PENDIENTE_DECANATO',
    fechaCreacion: '2026-01-01T00:00:00Z',
    fechaActualizacion: '2026-06-15T10:00:00Z',
    idSolicitante: 1,
    nombreSolicitante: 'Juan Perez',
    rolRevisorActual: null,
    observacionActual: null,
    thesisReferenceId: null,
    projectReferenceId: 1,
    reportReferenceId: null,
  },
  {
    id: 2,
    codigoTramite: 'TRM-002',
    tipoTramite: 'PLAN_TESIS',
    tituloReferencia: 'Plan de Tesis XYZ',
    estadoActual: 'PENDIENTE_DECANATO',
    fechaCreacion: '2026-01-02T00:00:00Z',
    fechaActualizacion: '2026-06-18T14:30:00Z',
    idSolicitante: 2,
    nombreSolicitante: 'Maria Garcia',
    rolRevisorActual: null,
    observacionActual: null,
    thesisReferenceId: 1,
    projectReferenceId: null,
    reportReferenceId: null,
  },
];

const defaultAuth = {
  user: { id: 1, roleCode: 'DECANO', firstNames: 'Dec', lastNames: 'Ano', email: 'd@sgi.com' },
  roles: ['DECANO'],
  currentRole: 'DECANO',
  loading: false,
  error: null,
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  switchRole: vi.fn(),
  clearError: vi.fn(),
  completeRegistration: vi.fn(),
} as any;

describe('DecanoReview', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockTramiteService.getPendingForRole.mockResolvedValue(mockTramites as any);
    vi.spyOn(window, 'prompt').mockReturnValue('N° 001-2026');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('shows loading spinner initially', () => {
    mockTramiteService.getPendingForRole.mockImplementation(
      () => new Promise(() => {})
    );
    renderWithProviders(<DecanoReview />, { authValue: defaultAuth });
    expect(document.querySelector('[aria-label="Cargando..."]')).toBeDefined();
  });

  it('renders tramites after loading', async () => {
    renderWithProviders(<DecanoReview />, { authValue: defaultAuth });
    expect(await screen.findByText('TRM-001')).toBeDefined();
    expect(screen.getByText('TRM-002')).toBeDefined();
  });

  it('shows empty state when no tramites', async () => {
    mockTramiteService.getPendingForRole.mockResolvedValue([]);
    renderWithProviders(<DecanoReview />, { authValue: defaultAuth });
    await waitFor(() => {
      expect(screen.getByText(/No hay expedientes pendientes/i)).toBeDefined();
    });
  });

  it('renders tramite titles', async () => {
    renderWithProviders(<DecanoReview />, { authValue: defaultAuth });
    expect(await screen.findByText(/Proyecto de Investigacion ABC/i)).toBeDefined();
    expect(screen.getByText(/Plan de Tesis XYZ/i)).toBeDefined();
  });

  it('renders Firmar and Rechazar buttons for each tramite', async () => {
    renderWithProviders(<DecanoReview />, { authValue: defaultAuth });
    await screen.findByText('TRM-001');
    const firmarBtns = screen.getAllByRole('button', { name: /firmar/i });
    expect(firmarBtns.length).toBe(2);
    const rechazarBtns = screen.getAllByRole('button', { name: /rechazar/i });
    expect(rechazarBtns.length).toBe(2);
  });

  it('renders Observar buttons for each tramite', async () => {
    renderWithProviders(<DecanoReview />, { authValue: defaultAuth });
    await screen.findByText('TRM-001');
    const obsBtns = screen.getAllByRole('button', { name: /observar/i });
    expect(obsBtns.length).toBe(2);
  });

  it('approve button triggers prompt and navigates', async () => {
    renderWithProviders(<DecanoReview />, { authValue: defaultAuth });
    await screen.findByText('TRM-001');

    const firmarBtns = screen.getAllByRole('button', { name: /firmar/i });
    await act(async () => {
      fireEvent.click(firmarBtns[0]);
    });

    expect(window.prompt).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalled();
    const callArg = mockNavigate.mock.calls[0][0] as string;
    expect(callArg).toContain('/resolutions/new-legacy');
    expect(callArg).toContain('procedureId=1');
  });

  it('approve with null prompt (user cancels) does not navigate', async () => {
    vi.mocked(window.prompt).mockReturnValue(null);
    renderWithProviders(<DecanoReview />, { authValue: defaultAuth });
    await screen.findByText('TRM-001');

    const firmarBtns = screen.getAllByRole('button', { name: /firmar/i });
    await act(async () => {
      fireEvent.click(firmarBtns[0]);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('approve with empty prompt shows error toast', async () => {
    vi.mocked(window.prompt).mockReturnValue('');
    renderWithProviders(<DecanoReview />, { authValue: defaultAuth });
    await screen.findByText('TRM-001');

    const firmarBtns = screen.getAllByRole('button', { name: /firmar/i });
    await act(async () => {
      fireEvent.click(firmarBtns[0]);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('approve cancels on second prompt (asunto)', async () => {
    vi.mocked(window.prompt)
      .mockReturnValueOnce('N° 001-2026')
      .mockReturnValueOnce(null);

    renderWithProviders(<DecanoReview />, { authValue: defaultAuth });
    await screen.findByText('TRM-001');

    const firmarBtns = screen.getAllByRole('button', { name: /firmar/i });
    await act(async () => {
      fireEvent.click(firmarBtns[0]);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('reject button triggers confirm and calls service', async () => {
    renderWithProviders(<DecanoReview />, { authValue: defaultAuth });
    await screen.findByText('TRM-001');

    const rechazarBtns = screen.getAllByRole('button', { name: /rechazar/i });
    await act(async () => {
      fireEvent.click(rechazarBtns[0]);
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(mockTramiteService.reject).toHaveBeenCalledWith(1);
  });

  it('reject cancelled does not call service', async () => {
    vi.mocked(window.confirm).mockReturnValue(false);
    renderWithProviders(<DecanoReview />, { authValue: defaultAuth });
    await screen.findByText('TRM-001');

    const rechazarBtns = screen.getAllByRole('button', { name: /rechazar/i });
    await act(async () => {
      fireEvent.click(rechazarBtns[0]);
    });

    expect(mockTramiteService.reject).not.toHaveBeenCalled();
  });

  it('reject failure shows error toast', async () => {
    mockTramiteService.reject.mockRejectedValue(new Error('Server error'));
    renderWithProviders(<DecanoReview />, { authValue: defaultAuth });
    await screen.findByText('TRM-001');

    const rechazarBtns = screen.getAllByRole('button', { name: /rechazar/i });
    await act(async () => {
      fireEvent.click(rechazarBtns[0]);
    });

    await waitFor(() => {
      expect(mockTramiteService.reject).toHaveBeenCalled();
    });
  });

  it('observe button triggers prompt and calls flag', async () => {
    renderWithProviders(<DecanoReview />, { authValue: defaultAuth });
    await screen.findByText('TRM-001');

    const obsBtns = screen.getAllByRole('button', { name: /observar/i });
    await act(async () => {
      fireEvent.click(obsBtns[0]);
    });

    expect(window.prompt).toHaveBeenCalled();
    expect(mockTramiteService.flag).toHaveBeenCalledWith(1, expect.any(String));
  });

  it('observe cancelled does not call service', async () => {
    vi.mocked(window.prompt).mockReturnValue(null);
    renderWithProviders(<DecanoReview />, { authValue: defaultAuth });
    await screen.findByText('TRM-001');

    const obsBtns = screen.getAllByRole('button', { name: /observar/i });
    await act(async () => {
      fireEvent.click(obsBtns[0]);
    });

    expect(mockTramiteService.flag).not.toHaveBeenCalled();
  });

  it('observe with empty prompt shows error', async () => {
    vi.mocked(window.prompt).mockReturnValue('');
    renderWithProviders(<DecanoReview />, { authValue: defaultAuth });
    await screen.findByText('TRM-001');

    const obsBtns = screen.getAllByRole('button', { name: /observar/i });
    await act(async () => {
      fireEvent.click(obsBtns[0]);
    });

    expect(mockTramiteService.flag).not.toHaveBeenCalled();
  });

  it('observe failure shows error toast', async () => {
    mockTramiteService.flag.mockRejectedValue(new Error('Flag error'));
    renderWithProviders(<DecanoReview />, { authValue: defaultAuth });
    await screen.findByText('TRM-001');

    const obsBtns = screen.getAllByRole('button', { name: /observar/i });
    await act(async () => {
      fireEvent.click(obsBtns[0]);
    });

    await waitFor(() => {
      expect(mockTramiteService.flag).toHaveBeenCalled();
    });
  });

  it('calls getPendingForRole on mount', async () => {
    renderWithProviders(<DecanoReview />, { authValue: defaultAuth });
    await screen.findByText('TRM-001');
    expect(mockTramiteService.getPendingForRole).toHaveBeenCalledWith('DECANO');
  });

  it('displays pending status badge', async () => {
    renderWithProviders(<DecanoReview />, { authValue: defaultAuth });
    await screen.findByText('TRM-001');
    expect(screen.getAllByText(/Pendiente de Decanato/i).length).toBeGreaterThan(0);
  });
});
