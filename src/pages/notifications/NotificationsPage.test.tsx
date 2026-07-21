import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthContext } from '../../context/AuthContext';
import { NotificationsPage } from './NotificationsPage';

const { mockGetDashboardData } = vi.hoisted(() => ({
  mockGetDashboardData: vi.fn(),
}));

vi.mock('../../services/authService', () => ({
  authService: { getDashboardData: mockGetDashboardData },
}));

const renderWithProviders = (role = 'COORDINADOR_GRUPO') =>
  render(
    <AuthContext.Provider value={{ currentRole: role } as any}>
      <NotificationsPage />
    </AuthContext.Provider>
  );

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetDashboardData.mockResolvedValue({});
  });

  it('renders the notifications title and empty state', async () => {
    renderWithProviders();
    expect(await screen.findByText('Mis notificaciones')).toBeDefined();
    expect(screen.getByText(/No tiene notificaciones/i)).toBeDefined();
  });

  it('renders received alerts with translated title and type badge', async () => {
    mockGetDashboardData.mockResolvedValue({
      alerts: [
        {
          type: 'WARNING',
          title: 'Pending procedures',
          description: '1 pending procedure',
        },
      ],
    });
    renderWithProviders();
    expect(await screen.findByText('Trámites pendientes')).toBeDefined();
    expect(screen.getByText('Advertencia')).toBeDefined();
  });

  it('adds a thesis plan alert for ESTUDIANTE with approved plan', async () => {
    mockGetDashboardData.mockResolvedValue({
      currentPlanStatus: 'APROBADO',
      alerts: [],
    });
    renderWithProviders('ESTUDIANTE');
    expect(await screen.findByText('Plan de tesis aprobado')).toBeDefined();
  });
});
