import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent, waitFor } from '@testing-library/react';
import { ReviewProgressReports } from './ReviewProgressReports';
import { progressReportService } from '../../services/progressReportService';
import { documentService } from '../../services/documentService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/progressReportService', () => ({
  progressReportService: {
    getPendingReports: vi.fn(),
    getDetail: vi.fn(),
    forwardReport: vi.fn(),
    approveReport: vi.fn(),
    observeReport: vi.fn(),
    rejectReport: vi.fn(),
  },
}));

vi.mock('../../services/documentService', () => ({
  documentService: {
    downloadFile: vi.fn(),
  },
}));

const mockProgressReportService = vi.mocked(progressReportService);
const mockDocumentService = vi.mocked(documentService);

const mockReports = [
  {
    id: 1,
    reportNumber: 1,
    projectId: 101,
    projectTitle: 'Sistema de Riego Automatizado',
    responsibleName: 'Docente Investigador A',
    reportDate: '2026-07-13T10:00:00Z',
    physicalProgress: 50,
    financialProgress: 50,
    status: 'PENDIENTE',
    attachedDocumentId: 1,
    fileName: 'informe_1.pdf',
  },
  {
    id: 2,
    reportNumber: 2,
    projectId: 102,
    projectTitle: 'Impacto de la IA en la cadena de suministro',
    responsibleName: 'Docente Investigador B',
    reportDate: '2026-07-12T10:00:00Z',
    physicalProgress: 75,
    financialProgress: 75,
    status: 'APROBADO',
    attachedDocumentId: 2,
    fileName: 'informe_2.pdf',
  },
];

const mockDetail = {
  ...mockReports[0],
  observations: 'Logros: Avance notable. Dificultades: Falta recurso',
  executedActivities: [],
  evidences: [],
  attachments: [{ id: 1, fileName: 'informe_1.pdf', fileType: 'pdf', url: '/api/documents/download/1', uploadedAt: '2026-07-13T10:00:00Z' }],
  comments: [],
  changeHistory: [],
};

describe('ReviewProgressReports', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockProgressReportService.getPendingReports.mockResolvedValue(mockReports as any);
    mockProgressReportService.getDetail.mockResolvedValue(mockDetail as any);
    mockProgressReportService.forwardReport.mockResolvedValue({} as any);
    mockProgressReportService.approveReport.mockResolvedValue({} as any);
    mockProgressReportService.observeReport.mockResolvedValue({} as any);
    mockProgressReportService.rejectReport.mockResolvedValue({} as any);
  });

  it('renders the title', async () => {
    renderWithProviders(<ReviewProgressReports />);
    expect(await screen.findByText('Revisión de Informes de Avance')).toBeDefined();
  });

  it('loads and displays reports', async () => {
    renderWithProviders(<ReviewProgressReports />);
    expect(await screen.findByText('Sistema de Riego Automatizado')).toBeDefined();
    expect(screen.getByText('Impacto de la IA en la cadena de suministro')).toBeDefined();
  });

  it('shows metric cards with correct counts', async () => {
    renderWithProviders(<ReviewProgressReports />);
    await screen.findByText('Sistema de Riego Automatizado');
    expect(screen.getByText('Total en Bandeja')).toBeDefined();
    expect(screen.getAllByText('Pendientes').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Aprobados').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Observados').length).toBeGreaterThanOrEqual(1);
  });

  it('re-fetches reports on filter change', async () => {
    renderWithProviders(<ReviewProgressReports />);
    await screen.findByText('Sistema de Riego Automatizado');
    const filterSelect = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(filterSelect, { target: { value: 'EN_REVISION' } });
    });
    expect(mockProgressReportService.getPendingReports).toHaveBeenCalledWith('EN_REVISION');
  });

  it('COORDINADOR_GRUPO forwards report on approve action', async () => {
    mockProgressReportService.getPendingReports.mockResolvedValue([
      { ...mockReports[0], status: 'PENDIENTE' },
    ] as any);

    renderWithProviders(<ReviewProgressReports />, {
      authValue: {
        user: { id: 1, roleCode: 'COORDINADOR_GRUPO', firstNames: 'Coordinador', lastNames: 'Test', email: 'coord@test.com' },
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
      },
    });

    await screen.findByText('Sistema de Riego Automatizado');
    const forwardBtn = screen.getByRole('button', { name: /Derivar/i });
    await act(async () => {
      fireEvent.click(forwardBtn);
    });
    expect(mockProgressReportService.forwardReport).toHaveBeenCalledWith(1);
  });

  it('DIRECTOR_INVESTIGACION approves report on approve action', async () => {
    mockProgressReportService.getPendingReports.mockResolvedValue([
      { ...mockReports[0], status: 'EN_REVISION' },
    ] as any);

    renderWithProviders(<ReviewProgressReports />, {
      authValue: {
        user: { id: 1, roleCode: 'DIRECTOR_INVESTIGACION', firstNames: 'Director', lastNames: 'Test', email: 'dir@test.com' },
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
      },
    });

    await screen.findByText('Sistema de Riego Automatizado');
    const approveBtn = screen.getByRole('button', { name: /Aprobar/i });
    await act(async () => {
      fireEvent.click(approveBtn);
    });
    expect(mockProgressReportService.approveReport).toHaveBeenCalledWith(1);
  });

  it('observe action with comment', async () => {
    mockProgressReportService.getPendingReports.mockResolvedValue([
      { ...mockReports[0], status: 'PENDIENTE' },
    ] as any);
    vi.spyOn(window, 'prompt').mockReturnValue('Falta documentación adjunta');

    renderWithProviders(<ReviewProgressReports />, {
      authValue: {
        user: { id: 1, roleCode: 'COORDINADOR_GRUPO', firstNames: 'Coordinador', lastNames: 'Test', email: 'coord@test.com' },
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
      },
    });

    await screen.findByText('Sistema de Riego Automatizado');
    const observeBtn = screen.getByRole('button', { name: /Observar/i });
    await act(async () => {
      fireEvent.click(observeBtn);
    });
    expect(mockProgressReportService.observeReport).toHaveBeenCalledWith(1, 'Falta documentación adjunta');
    (window.prompt as any).mockRestore();
  });

  it('observe action with empty comment shows error', async () => {
    mockProgressReportService.getPendingReports.mockResolvedValue([
      { ...mockReports[0], status: 'PENDIENTE' },
    ] as any);
    vi.spyOn(window, 'prompt').mockReturnValue('');

    renderWithProviders(<ReviewProgressReports />, {
      authValue: {
        user: { id: 1, roleCode: 'COORDINADOR_GRUPO', firstNames: 'Coordinador', lastNames: 'Test', email: 'coord@test.com' },
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
      },
    });

    await screen.findByText('Sistema de Riego Automatizado');
    const observeBtn = screen.getByRole('button', { name: /Observar/i });
    await act(async () => {
      fireEvent.click(observeBtn);
    });
    expect(mockProgressReportService.observeReport).not.toHaveBeenCalled();
    (window.prompt as any).mockRestore();
  });

  it('reject action with confirm', async () => {
    mockProgressReportService.getPendingReports.mockResolvedValue([
      { ...mockReports[0], status: 'EN_REVISION' },
    ] as any);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(<ReviewProgressReports />, {
      authValue: {
        user: { id: 1, roleCode: 'DIRECTOR_INVESTIGACION', firstNames: 'Director', lastNames: 'Test', email: 'dir@test.com' },
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
      },
    });

    await screen.findByText('Sistema de Riego Automatizado');
    const rejectBtn = screen.getByRole('button', { name: /Rechazar/i });
    await act(async () => {
      fireEvent.click(rejectBtn);
    });
    expect(mockProgressReportService.rejectReport).toHaveBeenCalledWith(1);
    (window.confirm as any).mockRestore();
  });

  it('reject action cancelled', async () => {
    mockProgressReportService.getPendingReports.mockResolvedValue([
      { ...mockReports[0], status: 'EN_REVISION' },
    ] as any);
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderWithProviders(<ReviewProgressReports />, {
      authValue: {
        user: { id: 1, roleCode: 'DIRECTOR_INVESTIGACION', firstNames: 'Director', lastNames: 'Test', email: 'dir@test.com' },
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
      },
    });

    await screen.findByText('Sistema de Riego Automatizado');
    const rejectBtn = screen.getByRole('button', { name: /Rechazar/i });
    await act(async () => {
      fireEvent.click(rejectBtn);
    });
    expect(mockProgressReportService.rejectReport).not.toHaveBeenCalled();
    (window.confirm as any).mockRestore();
  });

  it('detail modal opens and closes', async () => {
    renderWithProviders(<ReviewProgressReports />);
    await screen.findByText('Sistema de Riego Automatizado');

    const viewBtns = screen.getAllByRole('button');
    const detailBtn = viewBtns.find((b) => b.title === 'Ver detalle del informe');
    expect(detailBtn).toBeDefined();

    await act(async () => {
      fireEvent.click(detailBtn!);
    });

    await waitFor(() => {
      expect(mockProgressReportService.getDetail).toHaveBeenCalledWith(1);
    });
  });

  it('downloads attachment', async () => {
    renderWithProviders(<ReviewProgressReports />);
    await screen.findByText('Sistema de Riego Automatizado');

    const downloadBtns = screen.getAllByRole('button');
    const downloadBtn = downloadBtns.find((b) => b.title === 'Descargar informe adjunto');
    expect(downloadBtn).toBeDefined();

    await act(async () => {
      fireEvent.click(downloadBtn!);
    });
    expect(mockDocumentService.downloadFile).toHaveBeenCalled();
  });

  it('shows empty state when no reports', async () => {
    mockProgressReportService.getPendingReports.mockResolvedValue([]);
    renderWithProviders(<ReviewProgressReports />);
    await act(async () => {});
    expect(screen.getByText(/No se encontraron informes de avance/)).toBeDefined();
  });

  it('shows loading state', () => {
    mockProgressReportService.getPendingReports.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
    );
    renderWithProviders(<ReviewProgressReports />);
    expect(document.querySelector('[aria-label="Cargando..."]')).toBeDefined();
  });

  it('handles pagination', async () => {
    const manyReports = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      reportNumber: i + 1,
      projectId: 100 + i,
      projectTitle: `Proyecto ${i + 1}`,
      responsibleName: `Docente ${i + 1}`,
      reportDate: '2026-07-13T10:00:00Z',
      physicalProgress: 50,
      financialProgress: 50,
      status: 'PENDIENTE' as const,
      attachedDocumentId: i + 1,
      fileName: `informe_${i + 1}.pdf`,
    }));
    mockProgressReportService.getPendingReports.mockResolvedValue(manyReports as any);

    renderWithProviders(<ReviewProgressReports />);
    await screen.findByText('Proyecto 1');
    expect(screen.queryByText('Proyecto 11')).toBeNull();
  });
});
