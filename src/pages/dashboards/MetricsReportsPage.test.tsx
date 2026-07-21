import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AuthContext } from '../../context/AuthContext';
import { MetricsReportsPage } from './MetricsReportsPage';

const {
  mockGetDashboardData,
  mockGetGroups,
  mockGetProjectReport,
  mockGetProcedureReport,
} = vi.hoisted(() => ({
  mockGetDashboardData: vi.fn(),
  mockGetGroups: vi.fn(),
  mockGetProjectReport: vi.fn(),
  mockGetProcedureReport: vi.fn(),
}));

vi.mock('../../services/authService', () => ({
  authService: { getDashboardData: mockGetDashboardData },
}));
vi.mock('../../services/researchService', () => ({
  researchService: { getGroups: mockGetGroups },
}));
vi.mock('../../services/auditService', () => ({
  auditService: {
    getProjectReport: mockGetProjectReport,
    getProcedureReport: mockGetProcedureReport,
  },
}));

const renderWithProviders = (role = 'COORDINADOR_GRUPO') =>
  render(
    <AuthContext.Provider value={{ currentRole: role } as any}>
      <MetricsReportsPage />
    </AuthContext.Provider>
  );

describe('MetricsReportsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetDashboardData.mockResolvedValue({ totalActiveUsers: 10, totalProjects: 5 });
    mockGetGroups.mockResolvedValue([]);
    mockGetProjectReport.mockResolvedValue([]);
    mockGetProcedureReport.mockResolvedValue([]);
  });

  it('renders the metrics page title', async () => {
    renderWithProviders();
    expect(await screen.findByText('Indicadores institucionales')).toBeDefined();
  });

  it('renders the dashboard metric cards', async () => {
    renderWithProviders();
    expect((await screen.findAllByText('Usuarios activos')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('Proyectos registrados')).length).toBeGreaterThan(0);
  });

  it('loads and displays the project report table', async () => {
    mockGetProjectReport.mockResolvedValue([
      { id: 1, title: 'Proyecto Solar', status: 'APROBADO', group: 'GINSOFT' },
    ]);
    renderWithProviders();
    fireEvent.click(await screen.findByRole('button', { name: /Buscar/i }));
    expect(await screen.findByText('Proyecto Solar')).toBeDefined();
    expect(screen.getByText('Reporte de Proyectos')).toBeDefined();
  });

  it('calls the report service with the selected status filter', async () => {
    const { container } = renderWithProviders();
    await screen.findByRole('button', { name: /Buscar/i });
    const selects = container.querySelectorAll('select');
    fireEvent.change(selects[0], { target: { value: 'APROBADO' } });
    const buscarBtn = await screen.findByRole('button', { name: /Buscar/i });
    fireEvent.click(buscarBtn);

    await waitFor(() =>
      expect(mockGetProjectReport).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'APROBADO' })
      )
    );
  });
});
