import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent, waitFor, render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TramiteDetail } from './TramiteDetail';
import { tramiteService, PENDING_STATE_BY_ROLE } from '../../services/tramiteService';
import { documentService } from '../../services/documentService';
import { thesisService } from '../../services/thesisService';
import { projectService } from '../../services/projectService';
import { AuthContext } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { ConfirmProvider } from '../../context/ConfirmContext';
import type { MovimientoTramite, Tramite } from '../../types/tramites';

vi.mock('../../services/tramiteService', () => ({
  PENDING_STATE_BY_ROLE: {
    COORDINADOR_GRUPO: 'PENDIENTE_COORDINADOR',
    DIRECTOR_INVESTIGACION: 'PENDIENTE_DIRECCION',
    DECANO: 'PENDIENTE_DECANATO',
  },
  tramiteService: {
    getById: vi.fn(),
    getTraceability: vi.fn(),
    getObservacionesByTramite: vi.fn(),
    approve: vi.fn(),
    flag: vi.fn(),
    reject: vi.fn(),
    remediate: vi.fn(),
    registerResolution: vi.fn(),
  },
}));

vi.mock('../../services/documentService', () => ({
  documentService: {
    upload: vi.fn(),
    downloadFile: vi.fn(),
  },
}));

vi.mock('../../services/thesisService', () => ({
  thesisService: {
    getPlanById: vi.fn(),
  },
}));

vi.mock('../../services/projectService', () => ({
  projectService: {
    getById: vi.fn(),
  },
}));

const mockTramiteService = vi.mocked(tramiteService);
const mockDocumentService = vi.mocked(documentService);
const mockThesisService = vi.mocked(thesisService);
const mockProjectService = vi.mocked(projectService);

const mockTramite: Tramite = {
  id: 2,
  codigoTramite: 'TRM-2026-000102',
  tipoTramite: 'PROYECTO',
  tituloReferencia: 'Impacto de la IA en la cadena de suministro',
  idSolicitante: 2,
  nombreSolicitante: 'José Evaristo',
  estadoActual: 'OBSERVADO',
  thesisReferenceId: null,
  projectReferenceId: null,
  reportReferenceId: null,
  rolRevisorActual: null,
  observacionActual: 'Falta la firma del asesor en la carátula.',
  fechaCreacion: '2026-06-15T10:00:00',
  fechaActualizacion: '2026-06-28T16:40:00',
};

const mockMovimientos: MovimientoTramite[] = [
  {
    id: 1,
    idTramite: 2,
    idUsuarioAccion: 2,
    nombreUsuarioAccion: 'José Evaristo',
    accion: 'PRESENTADO_POR_SOLICITANTE',
    estadoAnterior: 'REGISTRADO',
    estadoNuevo: 'PENDIENTE_COORDINADOR',
    observacion: null,
    fechaMovimiento: '2026-06-15T10:00:00',
  },
  {
    id: 2,
    idTramite: 2,
    idUsuarioAccion: 4,
    nombreUsuarioAccion: 'Carlos Ramos',
    accion: 'OBSERVADO_POR_COORDINADOR',
    estadoAnterior: 'PENDIENTE_COORDINADOR',
    estadoNuevo: 'OBSERVADO',
    observacion: 'Falta la firma del asesor en la carátula.',
    fechaMovimiento: '2026-06-28T16:40:00',
  },
];

const defaultAuthValue = {
  user: { id: 1, roleCode: 'ADMIN', firstNames: 'Admin', lastNames: 'User', email: 'admin@sgi.com' },
  roles: ['ADMIN'],
  currentRole: 'ADMIN',
  loading: false,
  error: null,
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  switchRole: vi.fn(),
  clearError: vi.fn(),
  completeRegistration: vi.fn(),
};

const renderDetail = (role?: string, initialEntry = '/tramites/2') => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const auth = role ? {
    ...defaultAuthValue,
    user: { id: 4, roleCode: role, firstNames: 'Test', lastNames: 'User', email: 'test@sgi.com' },
    roles: [role],
    currentRole: role,
  } : defaultAuthValue;

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={auth as any}>
        <ToastProvider>
          <ConfirmProvider>
            <MemoryRouter initialEntries={[initialEntry]}>
              <Routes>
                <Route path="/tramites/:id" element={<TramiteDetail />} />
              </Routes>
            </MemoryRouter>
          </ConfirmProvider>
        </ToastProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

describe('TramiteDetail page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockTramiteService.getById.mockResolvedValue(mockTramite);
    mockTramiteService.getTraceability.mockResolvedValue(mockMovimientos);
    mockTramiteService.getObservacionesByTramite.mockResolvedValue([]);
    mockDocumentService.upload.mockResolvedValue({} as any);
  });

  it('shows loading state while fetching data', () => {
    mockTramiteService.getById.mockReturnValue(new Promise(() => {}));
    mockTramiteService.getTraceability.mockReturnValue(new Promise(() => {}));
    mockTramiteService.getObservacionesByTramite.mockReturnValue(new Promise(() => {}));

    renderDetail();
    expect(screen.getByLabelText('Cargando...')).toBeDefined();
  });

  it('renders tramite details after loading', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('TRM-2026-000102')).toBeDefined();
    });
    expect(screen.getByText('Impacto de la IA en la cadena de suministro')).toBeDefined();
    expect(screen.getByText('Observación vigente')).toBeDefined();
    expect(screen.getByText('Falta la firma del asesor en la carátula.')).toBeDefined();
  });

  it('renders approval flow stepper', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('TRM-2026-000102')).toBeDefined();
    });

    expect(screen.getByText('Flujo de Aprobación')).toBeDefined();
  });

  it('renders timeline with movimientos', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('Trazabilidad del Trámite')).toBeDefined();
    });
    expect(screen.getByText('Presentado por el solicitante')).toBeDefined();
    expect(screen.getByText('Observado por el Coordinador')).toBeDefined();
  });

  it('opens observe form and submits with text', async () => {
    mockTramiteService.flag.mockResolvedValue({} as any);
    mockTramiteService.getById.mockResolvedValue({
      ...mockTramite,
      estadoActual: 'PENDIENTE_COORDINADOR',
      observacionActual: null,
    });

    renderDetail('COORDINADOR_GRUPO');

    await waitFor(() => {
      expect(screen.getByText('TRM-2026-000102')).toBeDefined();
    });

    const observeBtn = screen.getByRole('button', { name: /Observar/i });
    await act(async () => {
      fireEvent.click(observeBtn);
    });

    const textarea = screen.getByPlaceholderText(/Describe qué debe corregir/i);
    fireEvent.change(textarea, { target: { value: 'Documento incompleto' } });

    const confirmBtn = screen.getByRole('button', { name: /Confirmar/i });
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    expect(mockTramiteService.flag).toHaveBeenCalledWith(2, 'Documento incompleto', undefined);
  });

  it('shows error when observe text is empty', async () => {
    mockTramiteService.getById.mockResolvedValue({
      ...mockTramite,
      estadoActual: 'PENDIENTE_COORDINADOR',
      observacionActual: null,
    });

    renderDetail('COORDINADOR_GRUPO');

    await waitFor(() => {
      expect(screen.getByText('TRM-2026-000102')).toBeDefined();
    });

    const observeBtn = screen.getByRole('button', { name: /Observar/i });
    await act(async () => {
      fireEvent.click(observeBtn);
    });

    const confirmBtn = screen.getByRole('button', { name: /Confirmar/i });
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    expect(mockTramiteService.flag).not.toHaveBeenCalled();
  });

  it('approves a tramite when approved button is clicked', async () => {
    mockTramiteService.approve.mockResolvedValue({} as any);
    mockTramiteService.getById.mockResolvedValue({
      ...mockTramite,
      estadoActual: 'PENDIENTE_COORDINADOR',
      observacionActual: null,
    });

    renderDetail('COORDINADOR_GRUPO');

    await waitFor(() => {
      expect(screen.getByText('TRM-2026-000102')).toBeDefined();
    });

    const approveBtn = screen.getByRole('button', { name: /Aprobar/i });
    await act(async () => {
      fireEvent.click(approveBtn);
    });

    expect(mockTramiteService.approve).toHaveBeenCalledWith(2);
  });

  it('rejects a tramite when reject button is clicked', async () => {
    mockTramiteService.reject.mockResolvedValue({} as any);
    mockTramiteService.getById.mockResolvedValue({
      ...mockTramite,
      estadoActual: 'PENDIENTE_COORDINADOR',
      observacionActual: null,
    });

    renderDetail('COORDINADOR_GRUPO');

    await waitFor(() => {
      expect(screen.getByText('TRM-2026-000102')).toBeDefined();
    });

    const rejectBtn = screen.getByRole('button', { name: /Rechazar/i });
    await act(async () => {
      fireEvent.click(rejectBtn);
    });

    expect(mockTramiteService.reject).toHaveBeenCalledWith(2);
  });

  it('shows subsanar link for observed tramite', async () => {
    renderDetail('ESTUDIANTE');

    await waitFor(() => {
      expect(screen.getByText('TRM-2026-000102')).toBeDefined();
    });

    expect(screen.getByText('Ir a subsanación')).toBeDefined();
  });

  it('shows error state when loading fails', async () => {
    mockTramiteService.getById.mockRejectedValue(new Error('Trámite no encontrado'));

    renderDetail();

    expect(await screen.findByText(/Trámite no encontrado/i)).toBeDefined();
  });

  it('shows invalid ID state for non-numeric ID', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={defaultAuthValue as any}>
          <ToastProvider>
            <ConfirmProvider>
              <MemoryRouter initialEntries={['/tramites/abc']}>
                <Routes>
                  <Route path="/tramites/:id" element={<TramiteDetail />} />
                </Routes>
              </MemoryRouter>
            </ConfirmProvider>
          </ToastProvider>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/inválido/i)).toBeDefined();
  });

  it('renders thesis plan reference when present', async () => {
    mockTramiteService.getById.mockResolvedValue({
      ...mockTramite,
      thesisReferenceId: 42,
      estadoActual: 'PENDIENTE_COORDINADOR',
      observacionActual: null,
    });

    mockThesisService.getPlanById.mockResolvedValue({
      idPlanTesis: 42,
      tituloTesis: 'Investigación en IA',
      resumen: 'Un resumen breve',
      nombreEstudiante: 'Juan',
      apellidoEstudiante: 'Pérez',
      nombreLinea: 'IA',
      nombreGrupo: 'GI-SOFT',
      id: '42',
      title: 'Investigación en IA',
      status: 'ACTIVO',
    } as any);

    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('Investigación en IA')).toBeDefined();
    });
    expect(screen.getByText(/Juan Pérez/)).toBeDefined();
  });

  it('renders project reference when present', async () => {
    mockTramiteService.getById.mockResolvedValue({
      ...mockTramite,
      projectReferenceId: 99,
      estadoActual: 'PENDIENTE_COORDINADOR',
      observacionActual: null,
    });

    mockProjectService.getById.mockResolvedValue({
      id: 99,
      code: 'PRJ-001',
      title: 'Proyecto de IA',
      summary: 'Resumen del proyecto',
      researchLineName: 'IA',
      researchGroupCode: 'GI-SOFT',
    } as any);

    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('Proyecto de IA')).toBeDefined();
    });
  });
});
