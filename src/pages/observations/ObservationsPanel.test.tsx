import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { ObservationsPanel } from './ObservationsPanel';
import { observationService } from '../../services/observationService';
import { documentService } from '../../services/documentService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/observationService', () => ({
  observationService: {
    getByProcedureId: vi.fn(),
    getMyObservations: vi.fn(),
    addRemedy: vi.fn(),
  },
}));

vi.mock('../../services/documentService', () => ({
  documentService: {
    upload: vi.fn(),
  },
}));

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  showToast: vi.fn(),
};

vi.mock('../../context/ToastContext', () => ({
  ToastProvider: ({ children }: any) => children,
  useToast: () => mockToast,
}));

const mockObservationService = vi.mocked(observationService);
const mockDocumentService = vi.mocked(documentService);

const mockObservations = [
  {
    id: 1,
    procedureId: 1,
    type: 'Marco Teórico',
    description: 'Falta citar autores más recientes (2020+).',
    status: 'PENDIENTE',
    createdAt: '2026-03-15T10:00:00Z',
    remedy: undefined,
  },
  {
    id: 2,
    procedureId: 1,
    type: 'Metodología',
    description: 'Justificar el tamaño de la muestra.',
    status: 'OBSERVADO',
    createdAt: '2026-03-16T12:00:00Z',
    remedy: undefined,
  },
  {
    id: 3,
    procedureId: 1,
    type: 'Conclusiones',
    description: 'Las conclusiones deben关联 con los objetivos.',
    status: 'SUBSANADO',
    createdAt: '2026-03-10T08:00:00Z',
    remedy: 'Se corrigieron las conclusiones.',
  },
];

describe('ObservationsPanel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockObservationService.getByProcedureId.mockResolvedValue(mockObservations);
    mockObservationService.getMyObservations.mockResolvedValue(mockObservations);
    localStorage.setItem('sgi_user', JSON.stringify({ id: 1 }));
  });

  afterEach(() => {
    localStorage.removeItem('sgi_user');
  });

  it('renders title and description', async () => {
    renderWithProviders(<ObservationsPanel />, { route: '/observations?procedureId=1' });

    expect(screen.getByText('Mis observaciones')).toBeDefined();
    expect(screen.getByText(/Consulta las observaciones/)).toBeDefined();
    await waitFor(() => {
      expect(mockObservationService.getByProcedureId).toHaveBeenCalled();
    });
  });

  it('shows empty state when no observations', async () => {
    mockObservationService.getByProcedureId.mockResolvedValue([]);

    renderWithProviders(<ObservationsPanel />, { route: '/observations?procedureId=1' });

    await waitFor(() => {
      expect(screen.getByText('No hay observaciones registradas para este expediente.')).toBeDefined();
    });
  });

  it('loads and displays observations', async () => {
    renderWithProviders(<ObservationsPanel />, { route: '/observations?procedureId=1' });

    await waitFor(() => {
      expect(screen.getByText('Marco Teórico')).toBeDefined();
    });
    expect(screen.getByText('Metodología')).toBeDefined();
    expect(screen.getByText('Conclusiones')).toBeDefined();
    expect(screen.getByText('Falta citar autores más recientes (2020+).')).toBeDefined();
    expect(screen.getByText('Justificar el tamaño de la muestra.')).toBeDefined();
  });

  it('shows stats for total, pending, and resolved counts', async () => {
    renderWithProviders(<ObservationsPanel />, { route: '/observations?procedureId=1' });

    await waitFor(() => {
      expect(screen.getByText('Marco Teórico')).toBeDefined();
    });

    const statValues = screen.getAllByText(/^\d+$/);
    const totalStat = statValues.find(el => el.textContent === '3');
    const pendingStat = statValues.find(el => el.textContent === '2');
    const resolvedStat = statValues.find(el => el.textContent === '1');

    expect(totalStat).toBeDefined();
    expect(pendingStat).toBeDefined();
    expect(resolvedStat).toBeDefined();
  });

  it('shows "Requiere subsanación" badge when pending observations exist', async () => {
    renderWithProviders(<ObservationsPanel />, { route: '/observations?procedureId=1' });

    await waitFor(() => {
      expect(screen.getByText('Requiere subsanación')).toBeDefined();
    });
  });

  it('shows "Todo conforme" badge when all observations are resolved', async () => {
    mockObservationService.getByProcedureId.mockResolvedValue([
      { id: 1, procedureId: 1, type: 'Test', description: 'Done', status: 'SUBSANADO', createdAt: '' },
    ]);

    renderWithProviders(<ObservationsPanel />, { route: '/observations?procedureId=1' });

    await waitFor(() => {
      expect(screen.getByText('Todo conforme')).toBeDefined();
    });
  });

  it('displays remedy text for resolved observations', async () => {
    renderWithProviders(<ObservationsPanel />, { route: '/observations?procedureId=1' });

    await waitFor(() => {
      expect(screen.getByText('Se corrigieron las conclusiones.')).toBeDefined();
    });
    expect(screen.getByText('Respuesta registrada')).toBeDefined();
  });

  it('shows loading state', async () => {
    mockObservationService.getByProcedureId.mockImplementation(
      () => new Promise(() => {})
    );

    renderWithProviders(<ObservationsPanel />, { route: '/observations?procedureId=1' });

    await waitFor(() => {
      expect(screen.getByText('Cargando observaciones...')).toBeDefined();
    });
  });

  it('shows error state when service fails', async () => {
    mockObservationService.getByProcedureId.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<ObservationsPanel />, { route: '/observations?procedureId=1' });

    await waitFor(() => {
      expect(screen.getByText('No se pudieron cargar las observaciones')).toBeDefined();
    });
  });

  it('shows remedy form with justification input and submit button', async () => {
    renderWithProviders(<ObservationsPanel />, { route: '/observations?procedureId=1' });

    await waitFor(() => {
      expect(screen.getByText('Enviar subsanación')).toBeDefined();
    });
    expect(screen.getByText('Documento corregido')).toBeDefined();
    expect(screen.getByText('Justificación o respuesta')).toBeDefined();
    expect(screen.getByRole('button', { name: /Registrar subsanación/i })).toBeDefined();
  });

  it('calls warning toast when submitting empty justification', async () => {
    renderWithProviders(<ObservationsPanel />, { route: '/observations?procedureId=1' });

    await waitFor(() => {
      expect(screen.getByText('Marco Teórico')).toBeDefined();
    });

    const submitBtn = screen.getByRole('button', { name: /Registrar subsanación/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockToast.warning).toHaveBeenCalled();
    });
    expect(mockObservationService.addRemedy).not.toHaveBeenCalled();
  });

  it('submits remedy successfully with justification', async () => {
    mockObservationService.addRemedy.mockResolvedValue(undefined);

    renderWithProviders(<ObservationsPanel />, { route: '/observations?procedureId=1' });

    await waitFor(() => {
      expect(screen.getByText('Marco Teórico')).toBeDefined();
    });

    const textarea = screen.getByPlaceholderText(/Detalla cómo se resolvieron/);
    fireEvent.change(textarea, { target: { value: 'Se corrigieron todas las observaciones.' } });

    const submitBtn = screen.getByRole('button', { name: /Registrar subsanación/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalled();
    });
    expect(mockObservationService.addRemedy).toHaveBeenCalled();
  });

  it('uploads document when file is attached before submitting', async () => {
    mockDocumentService.upload.mockResolvedValue({ id: 42, originalName: 'doc.pdf', extension: 'pdf' });
    mockObservationService.addRemedy.mockResolvedValue(undefined);

    renderWithProviders(<ObservationsPanel />, { route: '/observations?procedureId=1' });

    await waitFor(() => {
      expect(screen.getByText('Marco Teórico')).toBeDefined();
    });

    const textarea = screen.getByPlaceholderText(/Detalla cómo se resolvieron/);
    fireEvent.change(textarea, { target: { value: 'Respuesta con documento adjunto.' } });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'documento.pdf', { type: 'application/pdf' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);

    const submitBtn = screen.getByRole('button', { name: /Registrar subsanación/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockDocumentService.upload).toHaveBeenCalledWith(file);
    });
    expect(mockObservationService.addRemedy).toHaveBeenCalled();
  });

  it('shows error toast when remedy submission fails', async () => {
    mockObservationService.addRemedy.mockRejectedValue(new Error('Server error'));

    renderWithProviders(<ObservationsPanel />, { route: '/observations?procedureId=1' });

    await waitFor(() => {
      expect(screen.getByText('Marco Teórico')).toBeDefined();
    });

    const textarea = screen.getByPlaceholderText(/Detalla cómo se resolvieron/);
    fireEvent.change(textarea, { target: { value: 'Esto fallará.' } });

    const submitBtn = screen.getByRole('button', { name: /Registrar subsanación/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalled();
    });
  });

  it('calls getByProcedureId with correct procedureId from query params', async () => {
    renderWithProviders(<ObservationsPanel />, { route: '/observations?procedureId=42' });

    await waitFor(() => {
      expect(mockObservationService.getByProcedureId).toHaveBeenCalledWith('42');
    });
  });

  it('displays procedure ID', async () => {
    renderWithProviders(<ObservationsPanel />, { route: '/observations?procedureId=7' });

    await waitFor(() => {
      expect(screen.getByText('7')).toBeDefined();
    });
  });

  it('displays back to dashboard link', async () => {
    renderWithProviders(<ObservationsPanel />, { route: '/observations?procedureId=1' });

    expect(screen.getByText('Volver al dashboard')).toBeDefined();
  });

  it('reloads observations when update button is clicked', async () => {
    renderWithProviders(<ObservationsPanel />, { route: '/observations?procedureId=1' });

    await waitFor(() => {
      expect(mockObservationService.getByProcedureId).toHaveBeenCalledTimes(1);
    });

    const updateBtn = screen.getByRole('button', { name: /Actualizar/i });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(mockObservationService.getByProcedureId).toHaveBeenCalledTimes(2);
    });
  });
});
