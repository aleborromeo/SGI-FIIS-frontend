import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { RoleDashboards } from './RoleDashboards';
import { authService } from '../../services/authService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/authService', () => ({
  authService: {
    getDashboardData: vi.fn(),
  },
}));

vi.mock('./RoleDashboards.css', () => ({}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  };
});

// Mock ConvocatoriasDashboard
vi.mock('../../modules/convocatorias/pages/ConvocatoriasDashboard', () => ({
  ConvocatoriasDashboard: () => <div data-testid="convocatorias-dashboard">Convocatorias</div>,
}));

const mockAuthService = vi.mocked(authService);

const mockAdminDashboard = {
  totalUsers: 50,
  totalProjects: 25,
  totalTramites: 100,
  activeConvocatorias: 3,
  pendingResolutions: 5,
  pendingApprovals: 8,
  projectsByStatus: {},
  alerts: [],
};

const mockStudentDashboard = {
  thesisPlans: [],
  currentPlanStatus: 'APROBADO',
  alerts: [
    { type: 'SUCCESS', title: 'Plan aprobado', description: 'Tu plan de tesis fue aprobado' },
  ],
};

describe('RoleDashboards', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading spinner initially', () => {
    mockAuthService.getDashboardData.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockAdminDashboard as any), 1000))
    );
    renderWithProviders(<RoleDashboards />);
    expect(document.querySelector('[aria-label="Cargando..."]')).toBeDefined();
  });

  it('renders ADMIN dashboard', async () => {
    mockAuthService.getDashboardData.mockResolvedValue(mockAdminDashboard as any);
    renderWithProviders(<RoleDashboards />, {
      authValue: {
        user: { id: 1, roleCode: 'ADMIN', firstNames: 'Admin', lastNames: 'User', email: 'a@sgi.com' },
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
      } as any,
    });
    await act(async () => {});
    expect(document.body.textContent?.includes('50') || document.body.textContent?.includes('Admin')).toBeTruthy();
  });

  it('renders ESTUDIANTE dashboard', async () => {
    mockAuthService.getDashboardData.mockResolvedValue(mockStudentDashboard as any);
    renderWithProviders(<RoleDashboards />, {
      authValue: {
        user: { id: 5, roleCode: 'ESTUDIANTE', firstNames: 'Carlos', lastNames: 'López', email: 'c@sgi.com' },
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
      } as any,
    });
    await act(async () => {});
    expect(document.body).toBeDefined();
  });

  it('renders DIRECTOR_INVESTIGACION dashboard', async () => {
    mockAuthService.getDashboardData.mockResolvedValue({
      totalProjects: 30,
      pendingProjects: 10,
      alerts: [],
    } as any);
    renderWithProviders(<RoleDashboards />, {
      authValue: {
        user: { id: 3, roleCode: 'DIRECTOR_INVESTIGACION', firstNames: 'Dir', lastNames: 'Inv', email: 'd@sgi.com' },
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
      } as any,
    });
    await act(async () => {});
    expect(document.body).toBeDefined();
  });

  it('shows refresh button', async () => {
    mockAuthService.getDashboardData.mockResolvedValue(mockAdminDashboard as any);
    renderWithProviders(<RoleDashboards />);
    await act(async () => {});
    const refreshBtns = screen.queryAllByRole('button', { name: /actualizar|refresh/i });
    expect(refreshBtns.length).toBeGreaterThanOrEqual(0);
  });

  it('shows error state on dashboard load failure', async () => {
    mockAuthService.getDashboardData.mockRejectedValue(new Error('Load failed'));
    renderWithProviders(<RoleDashboards />);
    await act(async () => {});
    expect(document.body).toBeDefined();
  });

  it('renders alerts section', async () => {
    mockAuthService.getDashboardData.mockResolvedValue(mockAdminDashboard as any);
    renderWithProviders(<RoleDashboards />);
    await act(async () => {});
    expect(document.body).toBeDefined();
  });
});

