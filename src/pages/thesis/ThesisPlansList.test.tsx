import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThesisPlansList } from './ThesisPlansList';

const norm = (s: string) =>
  s
    .normalize('NFD')
    .split('')
    .filter((c) => c.charCodeAt(0) < 0x300 || c.charCodeAt(0) > 0x36f)
    .join('')
    .toLowerCase();
const byText = (sub: string) => (content: string) => norm(content).includes(norm(sub));

const {
  mockGetPlansByStudent,
  mockGetPendingPlans,
  mockGetPlansByGroup,
  mockGetDashboardData,
} = vi.hoisted(() => ({
  mockGetPlansByStudent: vi.fn(),
  mockGetPendingPlans: vi.fn(),
  mockGetPlansByGroup: vi.fn(),
  mockGetDashboardData: vi.fn(),
}));

vi.mock('../../services/thesisService', () => ({
  thesisService: {
    getPlansByStudent: mockGetPlansByStudent,
    getPendingPlans: mockGetPendingPlans,
    getPlansByGroup: mockGetPlansByGroup,
  },
}));

vi.mock('../../services/authService', () => ({
  authService: { getDashboardData: mockGetDashboardData },
}));

const samplePlan = (id: number, titulo: string) => ({
  idPlanTesis: id,
  tituloTesis: titulo,
  resumen: 'resumen de prueba',
  idEstudiante: 1,
  idLinea: 1,
  idGrupo: 1,
  idDocumentoActual: 1,
  estadoPlan: 'PENDIENTE',
  fechaCreacion: '2026-01-01',
  fechaActualizacion: '2026-01-02',
});

const renderPage = (role: string) =>
  render(
    <AuthContext.Provider
      value={{ currentRole: role, user: { id: 1 }, isAuthenticated: true } as any}
    >
      <MemoryRouter>
        <ThesisPlansList />
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe('ThesisPlansList (#157)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetPlansByStudent.mockResolvedValue([]);
    mockGetPendingPlans.mockResolvedValue([]);
    mockGetPlansByGroup.mockResolvedValue([]);
    mockGetDashboardData.mockResolvedValue({ groupId: 7 });
  });

  it('renders the student plans list with status labels', async () => {
    mockGetPlansByStudent.mockResolvedValue([samplePlan(1, 'Plan uno')]);
    renderPage('ESTUDIANTE');

    expect(
      await screen.findByRole('heading', { name: byText('Planes de Tesis') })
    ).toBeInTheDocument();
    expect(screen.getByText('Plan uno')).toBeInTheDocument();
    expect(screen.getByText(byText('Pendiente'))).toBeInTheDocument();
  });

  it('filters plans by the search term', async () => {
    mockGetPlansByStudent.mockResolvedValue([
      samplePlan(1, 'Plan uno'),
      samplePlan(2, 'Plan dos'),
    ]);
    renderPage('ESTUDIANTE');

    await waitFor(() => expect(screen.getByText('Plan uno')).toBeInTheDocument());
    const search = screen.getByRole('textbox');
    fireEvent.change(search, { target: { value: 'uno' } });

    await waitFor(() => expect(screen.queryByText('Plan dos')).not.toBeInTheDocument());
    expect(screen.getByText('Plan uno')).toBeInTheDocument();
  });

  it('loads pending plans for the decano role', async () => {
    mockGetPendingPlans.mockImplementation((role: string) =>
      role === 'DECANO' ? Promise.resolve([samplePlan(3, 'Plan decano')]) : Promise.resolve([])
    );
    renderPage('DECANO');

    await waitFor(() => expect(mockGetPendingPlans).toHaveBeenCalledWith('DECANO'));
    expect(await screen.findByText('Plan decano')).toBeInTheDocument();
  });

  it('shows an error alert when loading fails', async () => {
    mockGetPlansByStudent.mockRejectedValue(new Error('Fallo de carga'));
    renderPage('ESTUDIANTE');

    expect(await screen.findByText(byText('Fallo de carga'))).toBeInTheDocument();
  });
});
