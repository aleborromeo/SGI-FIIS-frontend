import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProgressReportHistory } from './ProgressReportHistory';
import { AuthContext } from '../../context/AuthContext';

const { mockGetProjectsByRole, mockGetByProject, mockGetDetail } = vi.hoisted(() => ({
  mockGetProjectsByRole: vi.fn(),
  mockGetByProject: vi.fn(),
  mockGetDetail: vi.fn(),
}));

vi.mock('../../services/progressReportService', () => ({
  progressReportService: {
    getProjectsByRole: mockGetProjectsByRole,
    getByProject: mockGetByProject,
    getDetail: mockGetDetail,
  },
}));

const authValue = {
  currentRole: 'DOCENTE_INVESTIGADOR',
  user: { id: 1 },
  roles: [],
  isAuthenticated: true,
  loading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  switchRole: vi.fn(),
  clearError: vi.fn(),
  completeRegistration: vi.fn(),
} as any;

const renderPage = () =>
  render(
    <AuthContext.Provider value={authValue}>
      <ProgressReportHistory />
    </AuthContext.Provider>
  );

const makeReport = (id: number, status: string) => ({
  id,
  reportNumber: id,
  projectId: 1,
  projectTitle: 'Proyecto de Riego',
  responsibleName: 'Docente A',
  reportDate: '2026-01-01T10:00:00Z',
  physicalProgress: 40,
  financialProgress: 30,
  status,
  observations: undefined,
});

const makeDetail = () => ({
  id: 1,
  reportNumber: 1,
  projectId: 1,
  projectTitle: 'Proyecto de Riego',
  responsibleName: 'Docente A',
  reportDate: '2026-01-01T10:00:00Z',
  physicalProgress: 40,
  financialProgress: 30,
  status: 'APROBADO',
  observations: 'Observacion de prueba',
  comments: [],
  executedActivities: [],
  evidences: [],
  attachments: [],
  changeHistory: [],
} as any);

describe('ProgressReportHistory', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetProjectsByRole.mockResolvedValue([{ id: 1, title: 'Proyecto de Riego', status: 'ACTIVO' }]);
    mockGetByProject.mockResolvedValue([]);
    mockGetDetail.mockResolvedValue(makeDetail());
  });

  it('renders the page title and the selected project', async () => {
    mockGetByProject.mockResolvedValue([makeReport(1, 'APROBADO')]);
    renderPage();
    expect(
      await screen.findByRole('heading', { name: /Historial de Informes de Avance/i })
    ).toBeDefined();
    expect(await screen.findByText('Proyecto de Riego')).toBeDefined();
  });

  it('renders statistics and a timeline node per report', async () => {
    mockGetByProject.mockResolvedValue([makeReport(1, 'APROBADO'), makeReport(2, 'OBSERVADO')]);
    renderPage();

    expect(await screen.findByText('Total de Informes')).toBeDefined();
    const detailButtons = await screen.findAllByRole('button', { name: /Ver detalle/i });
    expect(detailButtons).toHaveLength(2);
  });

  it('shows an empty state when there are no reports', async () => {
    mockGetByProject.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText(/Sin informes de avance/i)).toBeDefined();
  });

  it('opens the detail panel and loads the report detail on view', async () => {
    mockGetByProject.mockResolvedValue([makeReport(1, 'APROBADO')]);
    renderPage();

    const detailButtons = await screen.findAllByRole('button', { name: /Ver detalle/i });
    fireEvent.click(detailButtons[0]);

    expect(await screen.findByText(/Detalle del Informe de Avance/i)).toBeDefined();
    expect(mockGetDetail).toHaveBeenCalledWith(1);
  });
});
