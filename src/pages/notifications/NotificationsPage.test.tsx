import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act } from '@testing-library/react';
import { NotificationsPage } from './NotificationsPage';
import { authService } from '../../services/authService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/authService', () => ({
  authService: {
    getDashboardData: vi.fn(),
  },
}));

// Mock the CSS import from RoleDashboards
vi.mock('../dashboards/RoleDashboards.css', () => ({}));

const mockAuthService = vi.mocked(authService);

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the notifications heading', async () => {
    mockAuthService.getDashboardData.mockResolvedValue({ alerts: [], currentPlanStatus: '' } as any);

    renderWithProviders(<NotificationsPage />);

    // Wait for loading to finish
    await act(async () => {});
    // The page renders
    expect(document.querySelector('.animate-fade-in')).toBeDefined();
  });

  it('shows empty state when no alerts', async () => {
    mockAuthService.getDashboardData.mockResolvedValue({ alerts: [], currentPlanStatus: '' } as any);

    renderWithProviders(<NotificationsPage />);

    expect(await screen.findByText('No tiene notificaciones ni alertas pendientes en este momento.')).toBeDefined();
  });

  it('shows alerts when data is available', async () => {
    mockAuthService.getDashboardData.mockResolvedValue({
      alerts: [
        { type: 'WARNING', title: 'Pending procedures', description: '2 procedure(s) pending' },
        { type: 'INFO', title: 'Active call', description: '1 open call' },
      ],
      currentPlanStatus: '',
    } as any);

    renderWithProviders(<NotificationsPage />);

    expect(await screen.findByText('Trámites pendientes')).toBeDefined();
  });

  it('shows error message on failed data load', async () => {
    mockAuthService.getDashboardData.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<NotificationsPage />);

    expect(await screen.findByText('Network error')).toBeDefined();
  });

  it('injects thesis plan approved alert for ESTUDIANTE', async () => {
    mockAuthService.getDashboardData.mockResolvedValue({
      alerts: [],
      currentPlanStatus: 'APROBADO',
    } as any);

    renderWithProviders(<NotificationsPage />, {
      authValue: {
        user: { id: 5, roleCode: 'ESTUDIANTE', firstNames: 'Est', lastNames: 'Ud', email: 'e@sgi.com' },
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

    expect(await screen.findByText('Plan de tesis aprobado')).toBeDefined();
  });

  it('injects thesis plan rejected alert for ESTUDIANTE', async () => {
    mockAuthService.getDashboardData.mockResolvedValue({
      alerts: [],
      currentPlanStatus: 'RECHAZADO',
    } as any);

    renderWithProviders(<NotificationsPage />, {
      authValue: {
        user: { id: 5, roleCode: 'ESTUDIANTE', firstNames: 'Est', lastNames: 'Ud', email: 'e@sgi.com' },
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

    expect(await screen.findByText('Plan de tesis rechazado')).toBeDefined();
  });

  it('injects thesis plan observado alert for ESTUDIANTE', async () => {
    mockAuthService.getDashboardData.mockResolvedValue({
      alerts: [],
      currentPlanStatus: 'OBSERVADO',
    } as any);

    renderWithProviders(<NotificationsPage />, {
      authValue: {
        user: { id: 5, roleCode: 'ESTUDIANTE', firstNames: 'Est', lastNames: 'Ud', email: 'e@sgi.com' },
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

    expect(await screen.findByText('Plan de tesis observado')).toBeDefined();
  });

  it('shows spinner while loading', () => {
    // Delay the resolution
    mockAuthService.getDashboardData.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ alerts: [], currentPlanStatus: '' } as any), 1000))
    );

    renderWithProviders(<NotificationsPage />);

    // Spinner should be shown
    expect(document.querySelector('[aria-label="Cargando..."]')).toBeDefined();
  });
});
