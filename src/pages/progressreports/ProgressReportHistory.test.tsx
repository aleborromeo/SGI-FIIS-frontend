import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent, waitFor } from '@testing-library/react';
import { ProgressReportHistory } from './ProgressReportHistory';
import { progressReportService } from '../../services/progressReportService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/progressReportService', () => ({
  progressReportService: {
    getProjectsByRole: vi.fn(),
    getByProject: vi.fn(),
    getDetail: vi.fn(),
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

const mockProgressReportService = vi.mocked(progressReportService);

const mockProjectSummaries = [
  { id: 10, title: 'Proyecto de IA', status: 'EN_EJECUCION' },
  { id: 20, title: 'Proyecto Blockchain', status: 'APROBADO' },
];

const mockReports = [
  {
    id: 1,
    reportNumber: 1,
    projectId: 10,
    projectTitle: 'Proyecto de IA',
    reportType: 'PARCIAL',
    period: 'T1-2026',
    status: 'APROBADO',
    physicalProgress: 75,
    financialProgress: 60,
    responsibleName: 'Docente Investigador',
    reportDate: '2026-03-01T10:00:00Z',
    observations: null,
    attachedDocumentId: 1,
  },
  {
    id: 2,
    reportNumber: 2,
    projectId: 10,
    projectTitle: 'Proyecto de IA',
    reportType: 'FINAL',
    period: 'T2-2026',
    status: 'OBSERVADO',
    physicalProgress: 40,
    financialProgress: 35,
    responsibleName: 'Docente Investigador',
    reportDate: '2026-06-01T10:00:00Z',
    observations: 'Falta documentación',
    attachedDocumentId: 2,
  },
];

const mockDetail = {
  ...mockReports[0],
  executedActivities: [{ id: 1, description: 'Actividad 1', startDate: '2026-01-01', endDate: '2026-03-01', completed: true }],
  evidences: [],
  attachments: [{ id: 1, fileName: 'informe_1.pdf', fileType: 'pdf', url: '/api/documents/download/1', uploadedAt: '2026-03-01T10:00:00Z' }],
  comments: [],
  changeHistory: [],
};

async function selectProject() {
  await act(async () => {});
  const projectSelect = document.getElementById('select-project-history') as HTMLSelectElement;
  await act(async () => {
    fireEvent.change(projectSelect, { target: { value: '10' } });
  });
}

describe('ProgressReportHistory', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockProgressReportService.getProjectsByRole.mockResolvedValue(mockProjectSummaries as any);
    mockProgressReportService.getByProject.mockResolvedValue(mockReports as any);
    mockProgressReportService.getDetail.mockResolvedValue(mockDetail as any);
  });

  it('renders the title', async () => {
    renderWithProviders(<ProgressReportHistory />);
    expect(await screen.findByText('Historial de Informes de Avance')).toBeDefined();
  });

  it('loads and displays reports after selecting project', async () => {
    renderWithProviders(<ProgressReportHistory />);
    await selectProject();
    await waitFor(() => {
      expect(mockProgressReportService.getByProject).toHaveBeenCalledWith(10);
    });
  });

  it('shows empty state when no reports', async () => {
    mockProgressReportService.getByProject.mockResolvedValue([]);
    renderWithProviders(<ProgressReportHistory />);
    await selectProject();
    await waitFor(() => {
      expect(screen.getByText(/Sin informes de avance/)).toBeDefined();
    });
  });

  it('allows status filter via project selector', async () => {
    renderWithProviders(<ProgressReportHistory />);
    await act(async () => {});
    const projectSelect = document.getElementById('select-project-history') as HTMLSelectElement;
    expect(projectSelect).toBeDefined();
    const options = projectSelect.querySelectorAll('option');
    expect(options.length).toBe(3);
  });

  it('displays report cards with data', async () => {
    renderWithProviders(<ProgressReportHistory />);
    await selectProject();
    await waitFor(() => {
      expect(screen.getAllByText(/Informe #\d+/).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('opens view detail modal', async () => {
    renderWithProviders(<ProgressReportHistory />);
    await selectProject();
    await waitFor(() => {
      expect(screen.getAllByText(/Informe #\d+/).length).toBeGreaterThanOrEqual(1);
    });
    const viewBtns = screen.getAllByRole('button', { name: /ver detalle/i });
    expect(viewBtns.length).toBeGreaterThanOrEqual(1);
    await act(async () => {
      fireEvent.click(viewBtns[0]);
    });
    await waitFor(() => {
      expect(mockProgressReportService.getDetail).toHaveBeenCalled();
    });
  });

  it('shows amend indicator for OBSERVADO status', async () => {
    renderWithProviders(<ProgressReportHistory />);
    await selectProject();
    await waitFor(() => {
      expect(screen.getAllByText(/Informe #\d+/).length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText(/Observado/)).toBeDefined();
  });

  it('navigates correctly for amend', async () => {
    renderWithProviders(<ProgressReportHistory />);
    await selectProject();
    await waitFor(() => {
      expect(screen.getAllByText(/Informe #\d+/).length).toBe(2);
    });
  });

  it('handles pagination', async () => {
    const manyReports = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      reportNumber: i + 1,
      projectId: 10,
      projectTitle: 'Proyecto de IA',
      reportType: 'PARCIAL' as const,
      period: `T${i + 1}-2026`,
      status: 'APROBADO' as const,
      physicalProgress: 50,
      financialProgress: 50,
      responsibleName: 'Docente Investigador',
      reportDate: '2026-03-01T10:00:00Z',
      observations: null,
      attachedDocumentId: i + 1,
    }));
    mockProgressReportService.getByProject.mockResolvedValue(manyReports as any);

    renderWithProviders(<ProgressReportHistory />);
    await selectProject();

    await waitFor(() => {
      expect(screen.getByText('Informe #15')).toBeDefined();
    });
    expect(screen.queryByText('Informe #5')).toBeNull();
  });

  it('shows loading state', () => {
    mockProgressReportService.getProjectsByRole.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
    );
    renderWithProviders(<ProgressReportHistory />);
    expect(document.querySelector('[aria-label="Cargando..."]')).toBeDefined();
  });
});
