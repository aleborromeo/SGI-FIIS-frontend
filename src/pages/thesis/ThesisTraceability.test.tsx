import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { ThesisTraceability } from './ThesisTraceability';
import { thesisService } from '../../services/thesisService';
import { researchService } from '../../services/researchService';
import { documentService } from '../../services/documentService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/thesisService', () => ({
  thesisService: {
    getPlanById: vi.fn(),
    getReportByPlanId: vi.fn(),
    approveCoordinator: vi.fn(),
    observeCoordinator: vi.fn(),
    approveDirector: vi.fn(),
    observeDirector: vi.fn(),
    approveReport: vi.fn(),
    observeReport: vi.fn(),
    issueDeanResolution: vi.fn(),
    rectifyPlan: vi.fn(),
  },
}));

const mockConfirmDialog = vi.fn().mockResolvedValue(true);
vi.mock('../../context/ConfirmContext', () => ({
  useConfirm: () => ({
    confirmDialog: mockConfirmDialog,
  }),
  ConfirmProvider: ({ children }: any) => children,
}));

vi.mock('../../services/researchService', () => ({
  researchService: {
    getGroupById: vi.fn(),
  },
}));

vi.mock('../../services/documentService', () => ({
  documentService: {
    downloadFile: vi.fn(),
  },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    Link: ({ to, children, ...rest }: any) => (
      <a href={to} {...rest}>{children}</a>
    ),
  };
});

const mockThesisService = vi.mocked(thesisService);
const mockResearchService = vi.mocked(researchService);
const mockDocumentService = vi.mocked(documentService);

const mockPlan = {
  idPlanTesis: 1,
  tituloTesis: 'Sistema de Monitoreo de Redes',
  resumen: 'Resumen del plan de tesis',
  idEstudiante: 5,
  idLinea: 1,
  idGrupo: 1,
  idDocumentoActual: 10,
  estadoPlan: 'APROBADO',
  status: 'APPROVED',
  fechaCreacion: '2026-01-01T00:00:00Z',
  fechaActualizacion: '2026-01-15T00:00:00Z',
  idTramite: 1,
  estadoTramite: 'APROBADO_CON_RESOLUCION',
  revisorActual: null,
  nombreEstudiante: 'Carlos',
  apellidoEstudiante: 'López',
  nombreGrupo: 'GI-SOFT',
  nombreLinea: 'Inteligencia Artificial',
  nombreDocumento: 'Plan_Tesis.pdf',
};

const mockReport = {
  id: 'r1',
  idInformeTesis: 101,
  tituloFinal: 'Tesis Final de Monitoreo',
  fechaPresentacion: '2026-03-01T00:00:00Z',
  estadoInforme: 'EN_REVISION',
  idDocumentoTesis: 20,
  status: 'UNDER_REVISION',
};

const mockGroup = {
  id: 1,
  groupName: 'GI-SOFT',
  groupCode: 'G01',
  coordinatorFirstNames: 'Juan',
  coordinatorLastNames: 'Pérez',
  currentCoordinatorId: 10,
};

function coordinatorAuthValue(overrides: Record<string, any> = {}) {
  return {
    user: { id: 2, roleCode: 'COORDINADOR_GRUPO', firstNames: 'Co', lastNames: 'Ord', email: 'co@sgi.com' },
    roles: ['COORDINADOR_GRUPO'],
    currentRole: 'COORDINADOR_GRUPO',
    loading: false,
    error: null,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    switchRole: vi.fn(),
    clearError: vi.fn(),
    completeRegistration: vi.fn(),
    ...overrides,
  } as any;
}

function directorAuthValue(overrides: Record<string, any> = {}) {
  return {
    user: { id: 3, roleCode: 'DIRECTOR_INVESTIGACION', firstNames: 'Dir', lastNames: 'Ector', email: 'dir@sgi.com' },
    roles: ['DIRECTOR_INVESTIGACION'],
    currentRole: 'DIRECTOR_INVESTIGACION',
    loading: false,
    error: null,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    switchRole: vi.fn(),
    clearError: vi.fn(),
    completeRegistration: vi.fn(),
    ...overrides,
  } as any;
}

function deanAuthValue(overrides: Record<string, any> = {}) {
  return {
    user: { id: 4, roleCode: 'DECANO', firstNames: 'De', lastNames: 'Cano', email: 'dean@sgi.com' },
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
    ...overrides,
  } as any;
}

function studentAuthValue(overrides: Record<string, any> = {}) {
  return {
    user: { id: 5, roleCode: 'ESTUDIANTE', firstNames: 'Car', lastNames: 'Los', email: 'stu@sgi.com' },
    roles: ['ESTUDIANTE'],
    currentRole: 'ESTUDIANTE',
    loading: false,
    error: null,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    switchRole: vi.fn(),
    clearError: vi.fn(),
    completeRegistration: vi.fn(),
    ...overrides,
  } as any;
}

describe('ThesisTraceability', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockThesisService.getPlanById.mockResolvedValue(mockPlan as any);
    mockThesisService.getReportByPlanId.mockResolvedValue([]);
    mockResearchService.getGroupById.mockResolvedValue(mockGroup as any);
    mockConfirmDialog.mockResolvedValue(true);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'prompt').mockReturnValue('RES-001-2026');
    // location.reload is non-configurable; override on a fresh object
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: vi.fn() },
      writable: true,
      configurable: true,
    });
  });

  it('shows loading state while data loads', () => {
    mockThesisService.getPlanById.mockImplementation(
      () => new Promise(() => {})
    );
    renderWithProviders(<ThesisTraceability />);
    expect(screen.getByText(/cargando trazabilidad/i)).toBeDefined();
  });

  it('renders plan title after loading', async () => {
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    expect(screen.getByText('Sistema de Monitoreo de Redes')).toBeDefined();
  });

  it('renders plan status badge', async () => {
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    expect(screen.getByText(/estado:/i)).toBeDefined();
  });

  it('renders student name', async () => {
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    expect(screen.getByText(/estudiante:/i)).toBeDefined();
  });

  it('renders error state on failure', async () => {
    mockThesisService.getPlanById.mockRejectedValue(new Error('Error de red'));
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    expect(screen.getByText('Error de red')).toBeDefined();
  });

  it('renders error state when plan is null', async () => {
    mockThesisService.getPlanById.mockRejectedValue(new Error('Plan de tesis no encontrado.'));
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    expect(screen.getByText('Plan de tesis no encontrado.')).toBeDefined();
  });

  it('renders back link for non-decano roles', async () => {
    renderWithProviders(<ThesisTraceability />, {
      authValue: coordinatorAuthValue(),
    });
    await act(async () => {});
    const backLink = screen.getByRole('link', { name: /volver/i });
    expect(backLink).toBeDefined();
    expect(backLink.getAttribute('href')).toBe('/projects');
  });

  it('renders back link for decano role', async () => {
    renderWithProviders(<ThesisTraceability />, {
      authValue: deanAuthValue(),
    });
    await act(async () => {});
    const backLink = screen.getByRole('link', { name: /volver/i });
    expect(backLink.getAttribute('href')).toBe('/thesis/plans');
  });

  it('renders stepper component', async () => {
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    expect(screen.getByText(/trazabilidad del proceso/i)).toBeDefined();
  });

  it('renders research classification section', async () => {
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    expect(screen.getByText(/clasificación de investigación/i)).toBeDefined();
  });

  it('renders research line from plan', async () => {
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    expect(screen.getByText('Inteligencia Artificial')).toBeDefined();
  });

  it('renders research group from plan', async () => {
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    expect(screen.getByText('GI-SOFT')).toBeDefined();
  });

  it('renders coordinator name from group', async () => {
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    expect(screen.getByText('Juan Pérez')).toBeDefined();
  });

  it('renders current document section', async () => {
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    expect(screen.getByText(/documento actual/i)).toBeDefined();
  });

  it('renders plan document name', async () => {
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    expect(screen.getByText('Plan_Tesis.pdf')).toBeDefined();
  });

  it('renders institutional observation flow timeline', async () => {
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    expect(screen.getByText(/flujo de observación institucional/i)).toBeDefined();
  });

  it('renders timeline items', async () => {
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    expect(screen.getAllByText(/registro del plan/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/revisión académica/i).length).toBeGreaterThanOrEqual(1);
  });

  it('shows register report link for student when no report and plan approved', async () => {
    renderWithProviders(<ThesisTraceability />, {
      authValue: studentAuthValue(),
    });
    await act(async () => {});
    expect(screen.getByText(/plan de tesis está aprobado/i)).toBeDefined();
    const registerLink = screen.getByRole('link', { name: /registrar informe/i });
    expect(registerLink.getAttribute('href')).toBe('/thesis/report/new/1');
  });

  it('shows waiting message for non-student when no report', async () => {
    renderWithProviders(<ThesisTraceability />, {
      authValue: coordinatorAuthValue(),
    });
    await act(async () => {});
    expect(screen.getByText(/esperando que el estudiante/i)).toBeDefined();
  });

  it('renders report details when report exists', async () => {
    mockThesisService.getReportByPlanId.mockResolvedValue([mockReport] as any);
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    expect(screen.getByText('Tesis Final de Monitoreo')).toBeDefined();
    expect(screen.getByText(/descargar tesis/i)).toBeDefined();
  });

  it('renders approve and observe buttons for report when EN_REVISION and coordinator role', async () => {
    mockThesisService.getReportByPlanId.mockResolvedValue([mockReport] as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: coordinatorAuthValue(),
    });
    await act(async () => {});
    expect(screen.getByRole('button', { name: /aprobar informe/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /observar informe/i })).toBeDefined();
  });

  it('renders approve and observe buttons for report when EN_REVISION and director role', async () => {
    mockThesisService.getReportByPlanId.mockResolvedValue([mockReport] as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: directorAuthValue(),
    });
    await act(async () => {});
    expect(screen.getByRole('button', { name: /aprobar informe/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /observar informe/i })).toBeDefined();
  });

  it('shows review actions for coordinator when revisor matches', async () => {
    const planWithCoordinatorReviewer = { ...mockPlan, revisorActual: 'COORDINADOR_GRUPO', estadoPlan: 'PENDIENTE_COORDINADOR' };
    mockThesisService.getPlanById.mockResolvedValue(planWithCoordinatorReviewer as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: coordinatorAuthValue(),
    });
    await act(async () => {});
    expect(screen.getByRole('button', { name: /observar$/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /aprobar$/i })).toBeDefined();
  });

  it('shows review actions for director when revisor matches', async () => {
    const planWithDirectorReviewer = { ...mockPlan, revisorActual: 'DIRECTOR_INVESTIGACION', estadoPlan: 'PENDIENTE_DIRECCION' };
    mockThesisService.getPlanById.mockResolvedValue(planWithDirectorReviewer as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: directorAuthValue(),
    });
    await act(async () => {});
    expect(screen.getByRole('button', { name: /observar$/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /aprobar$/i })).toBeDefined();
  });

  it('shows review actions for dean when revisor matches', async () => {
    const planWithDeanReviewer = { ...mockPlan, revisorActual: 'DECANO', estadoPlan: 'PENDIENTE_DECANATO' };
    mockThesisService.getPlanById.mockResolvedValue(planWithDeanReviewer as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: deanAuthValue(),
    });
    await act(async () => {});
    expect(screen.getByRole('button', { name: /observar$/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /emitir resolución/i })).toBeDefined();
  });

  it('does not show review actions when role does not match revisor', async () => {
    const planWithCoordinatorReviewer = { ...mockPlan, revisorActual: 'COORDINADOR_GRUPO' };
    mockThesisService.getPlanById.mockResolvedValue(planWithCoordinatorReviewer as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: directorAuthValue(),
    });
    await act(async () => {});
    expect(screen.queryByRole('button', { name: /observar$/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /aprobar$/i })).toBeNull();
  });

  it('opens observe modal when observe button is clicked', async () => {
    const planWithCoordinatorReviewer = { ...mockPlan, revisorActual: 'COORDINADOR_GRUPO' };
    mockThesisService.getPlanById.mockResolvedValue(planWithCoordinatorReviewer as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: coordinatorAuthValue(),
    });
    await act(async () => {});
    const observeBtn = screen.getByRole('button', { name: /observar$/i });
    await act(async () => {
      fireEvent.click(observeBtn);
    });
    expect(screen.getByText(/ingrese las observaciones/i)).toBeDefined();
  });

  it('closes observe modal when cancel is clicked', async () => {
    const planWithCoordinatorReviewer = { ...mockPlan, revisorActual: 'COORDINADOR_GRUPO' };
    mockThesisService.getPlanById.mockResolvedValue(planWithCoordinatorReviewer as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: coordinatorAuthValue(),
    });
    await act(async () => {});
    const observeBtn = screen.getByRole('button', { name: /observar$/i });
    await act(async () => {
      fireEvent.click(observeBtn);
    });
    const cancelBtns = screen.getAllByRole('button', { name: /cancelar/i });
    await act(async () => {
      fireEvent.click(cancelBtns[cancelBtns.length - 1]);
    });
    expect(screen.queryByText(/ingrese las observaciones/i)).toBeNull();
  });

  it('shows error when submitting observe with empty text', async () => {
    const planWithCoordinatorReviewer = { ...mockPlan, revisorActual: 'COORDINADOR_GRUPO' };
    mockThesisService.getPlanById.mockResolvedValue(planWithCoordinatorReviewer as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: coordinatorAuthValue(),
    });
    await act(async () => {});
    const observeBtn = screen.getByRole('button', { name: /observar$/i });
    await act(async () => {
      fireEvent.click(observeBtn);
    });
    const textarea = screen.getByPlaceholderText(/Ingrese las observaciones/i);
    expect((textarea as HTMLTextAreaElement).value).toBe('');
    const sendBtn = screen.getByRole('button', { name: 'Enviar', exact: true });
    expect((sendBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('submits observe with text successfully for coordinator', async () => {
    const planWithCoordinatorReviewer = { ...mockPlan, revisorActual: 'COORDINADOR_GRUPO' };
    mockThesisService.getPlanById.mockResolvedValue(planWithCoordinatorReviewer as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: coordinatorAuthValue(),
    });
    await act(async () => {});
    const observeBtn = screen.getByRole('button', { name: /observar$/i });
    await act(async () => {
      fireEvent.click(observeBtn);
    });
    const textarea = screen.getByPlaceholderText(/Ingrese las observaciones/i);
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Observación del coordinador' } });
    });
    const sendBtn = screen.getByRole('button', { name: 'Enviar', exact: true });
    await act(async () => {
      fireEvent.click(sendBtn);
    });
    expect(mockThesisService.observeCoordinator).toHaveBeenCalledWith('1', 'Observación del coordinador');
  });

  it('submits observe with text successfully for director', async () => {
    const planWithDirectorReviewer = { ...mockPlan, revisorActual: 'DIRECTOR_INVESTIGACION' };
    mockThesisService.getPlanById.mockResolvedValue(planWithDirectorReviewer as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: directorAuthValue(),
    });
    await act(async () => {});
    const observeBtn = screen.getByRole('button', { name: /observar$/i });
    await act(async () => {
      fireEvent.click(observeBtn);
    });
    const textarea = screen.getByPlaceholderText(/Ingrese las observaciones/i);
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Observación del director' } });
    });
    const sendBtn = screen.getByRole('button', { name: 'Enviar', exact: true });
    await act(async () => {
      fireEvent.click(sendBtn);
    });
    expect(mockThesisService.observeDirector).toHaveBeenCalledWith('1', 'Observación del director');
  });

  it('handles approve flow for coordinator', async () => {
    const planWithCoordinatorReviewer = { ...mockPlan, revisorActual: 'COORDINADOR_GRUPO' };
    mockThesisService.getPlanById.mockResolvedValue(planWithCoordinatorReviewer as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: coordinatorAuthValue(),
    });
    await act(async () => {});
    const approveBtn = screen.getByRole('button', { name: /aprobar$/i });
    await act(async () => {
      fireEvent.click(approveBtn);
    });
    expect(mockConfirmDialog).toHaveBeenCalled();
    expect(mockThesisService.approveCoordinator).toHaveBeenCalledWith('1');
  });

  it('does not approve when user cancels confirm dialog', async () => {
    mockConfirmDialog.mockResolvedValue(false);
    const planWithCoordinatorReviewer = { ...mockPlan, revisorActual: 'COORDINADOR_GRUPO' };
    mockThesisService.getPlanById.mockResolvedValue(planWithCoordinatorReviewer as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: coordinatorAuthValue(),
    });
    await act(async () => {});
    const approveBtn = screen.getByRole('button', { name: /aprobar$/i });
    await act(async () => {
      fireEvent.click(approveBtn);
    });
    expect(mockThesisService.approveCoordinator).not.toHaveBeenCalled();
  });

  it('handles approve flow for director', async () => {
    const planWithDirectorReviewer = { ...mockPlan, revisorActual: 'DIRECTOR_INVESTIGACION' };
    mockThesisService.getPlanById.mockResolvedValue(planWithDirectorReviewer as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: directorAuthValue(),
    });
    await act(async () => {});
    const approveBtn = screen.getByRole('button', { name: /aprobar$/i });
    await act(async () => {
      fireEvent.click(approveBtn);
    });
    expect(mockConfirmDialog).toHaveBeenCalled();
    expect(mockThesisService.approveDirector).toHaveBeenCalledWith('1');
  });

  it('handles approve flow for dean with resolution', async () => {
    const planWithDeanReviewer = { ...mockPlan, revisorActual: 'DECANO', estadoPlan: 'PENDIENTE_DECANATO' };
    mockThesisService.getPlanById.mockResolvedValue(planWithDeanReviewer as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: deanAuthValue(),
    });
    await act(async () => {});
    const approveBtn = screen.getByRole('button', { name: /emitir resolución/i });
    await act(async () => {
      fireEvent.click(approveBtn);
    });
    const resolutionInput = screen.getByPlaceholderText(/RESOLUCIÓN DECANAL/i);
    await act(async () => {
      fireEvent.change(resolutionInput, { target: { value: 'RES-001-2026' } });
    });
    const acceptBtn = screen.getAllByRole('button', { name: /Aceptar/i })[0];
    await act(async () => {
      fireEvent.click(acceptBtn);
      await new Promise(r => setTimeout(r, 100));
    });
    expect(mockThesisService.issueDeanResolution).toHaveBeenCalledWith('1', expect.objectContaining({
      numeroResolucion: 'RES-001-2026',
    }));
  });

  it('approves report successfully', async () => {
    mockThesisService.getReportByPlanId.mockResolvedValue([mockReport] as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: coordinatorAuthValue(),
    });
    await act(async () => {});
    const approveReportBtn = screen.getByRole('button', { name: /aprobar informe/i });
    await act(async () => {
      fireEvent.click(approveReportBtn);
    });
    expect(mockThesisService.approveReport).toHaveBeenCalledWith(101);
  });

  it('opens observe report modal', async () => {
    mockThesisService.getReportByPlanId.mockResolvedValue([mockReport] as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: coordinatorAuthValue(),
    });
    await act(async () => {});
    const observeReportBtn = screen.getByRole('button', { name: /observar informe/i });
    await act(async () => {
      fireEvent.click(observeReportBtn);
    });
    expect(screen.getByText(/detalle de la observación para el informe/i)).toBeDefined();
  });

  it('submits observe report with text', async () => {
    mockThesisService.getReportByPlanId.mockResolvedValue([mockReport] as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: coordinatorAuthValue(),
    });
    await act(async () => {});
    const observeReportBtn = screen.getByRole('button', { name: /observar informe/i });
    await act(async () => {
      fireEvent.click(observeReportBtn);
    });
    const textarea = screen.getByPlaceholderText(/Ingrese las observaciones/i);
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Observación del informe' } });
    });
    const sendBtn = screen.getByRole('button', { name: 'Enviar', exact: true });
    await act(async () => {
      fireEvent.click(sendBtn);
    });
    expect(mockThesisService.observeReport).toHaveBeenCalledWith(101, 'Observación del informe');
  });

  it('downloads document when download button is clicked', async () => {
    mockThesisService.getReportByPlanId.mockResolvedValue([mockReport] as any);
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    const downloadBtn = screen.getByRole('button', { name: /descargar tesis/i });
    await act(async () => {
      fireEvent.click(downloadBtn);
    });
    expect(mockDocumentService.downloadFile).toHaveBeenCalledWith(20, 'Tesis Final de Monitoreo');
  });

  it('downloads plan document', async () => {
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    const downloadButtons = screen.getAllByRole('button');
    const planDocBtn = downloadButtons.find(btn => {
      return btn.closest('[style]') !== null && btn.querySelector('svg') !== null && btn.textContent === '';
    });
    if (planDocBtn) {
      await act(async () => {
        fireEvent.click(planDocBtn);
      });
    }
    expect(mockDocumentService.downloadFile).toHaveBeenCalled();
  });

  it('shows student rectification actions when OBSERVED and student role', async () => {
    const observedPlan = { ...mockPlan, estadoPlan: 'OBSERVED', revisorActual: 'ESTUDIANTE' };
    mockThesisService.getPlanById.mockResolvedValue(observedPlan as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: studentAuthValue(),
    });
    await act(async () => {});
    expect(screen.getByText(/registrar subsanación/i)).toBeDefined();
    expect(screen.getByText(/documento corregido/i)).toBeDefined();
  });

  it('shows error when rectifying with empty prompt', async () => {
    (window.prompt as any).mockReturnValue('');
    const observedPlan = { ...mockPlan, estadoPlan: 'OBSERVED', revisorActual: 'ESTUDIANTE' };
    mockThesisService.getPlanById.mockResolvedValue(observedPlan as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: studentAuthValue(),
    });
    await act(async () => {});
    const rectifyBtn = screen.getByRole('button', { name: /registrar subsanación/i });
    await act(async () => {
      fireEvent.click(rectifyBtn);
    });
    expect(mockThesisService.rectifyPlan).not.toHaveBeenCalled();
  });

  it('submits rectification successfully', async () => {
    const observedPlan = { ...mockPlan, estadoPlan: 'OBSERVED', revisorActual: 'ESTUDIANTE' };
    mockThesisService.getPlanById.mockResolvedValue(observedPlan as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: studentAuthValue(),
    });
    await act(async () => {});
    const rectifyBtn = screen.getByRole('button', { name: /registrar subsanación/i });
    await act(async () => {
      fireEvent.click(rectifyBtn);
    });
    const textarea = screen.getByPlaceholderText(/Describe detalladamente/i);
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'RES-001-2026' } });
    });
    const submitBtn = screen.getAllByRole('button', { name: /Enviar/i }).pop()!;
    await act(async () => {
      fireEvent.click(submitBtn);
    });
    expect(mockThesisService.rectifyPlan).toHaveBeenCalledWith('1', expect.objectContaining({
      comentarioSubsanacion: 'RES-001-2026',
    }));
  });

  it('renders page title and subtitle', async () => {
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    expect(screen.getByText(/gestión y revisión de plan/i)).toBeDefined();
    expect(screen.getByText(/consulta el estado/i)).toBeDefined();
  });

  it('renders plan ID badge', async () => {
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    expect(screen.getByText(/plan id/i)).toBeDefined();
  });

  it('renders quick actions section for coordinator', async () => {
    const planWithCoordinatorReviewer = { ...mockPlan, revisorActual: 'COORDINADOR_GRUPO' };
    mockThesisService.getPlanById.mockResolvedValue(planWithCoordinatorReviewer as any);
    renderWithProviders(<ThesisTraceability />, {
      authValue: coordinatorAuthValue(),
    });
    await act(async () => {});
    expect(screen.getByText(/acciones rápidas/i)).toBeDefined();
  });
});
