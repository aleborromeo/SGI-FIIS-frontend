import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { ConvocatoriasSidebar } from './ConvocatoriasSidebar';
import { callService } from '../services/callService';
import { renderWithProviders } from '../utils/testUtils';

vi.mock('../services/callService', () => ({
  callService: {
    getVigent: vi.fn(),
  },
}));

const mockCallService = vi.mocked(callService);

const mockCalls = [
  {
    id: 1,
    title: 'Convocatoria IA 2026',
    description: 'Investigación en IA',
    status: 'ABIERTA',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  },
];

describe('ConvocatoriasSidebar', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockCallService.getVigent.mockResolvedValue(mockCalls as any);
  });

  it('renders nothing for non-DOCENTE_INVESTIGADOR role', () => {
    const { container } = renderWithProviders(<ConvocatoriasSidebar />, {
      authValue: {
        user: { id: 1, roleCode: 'ADMIN', firstNames: 'A', lastNames: 'B', email: 'a@b.com' },
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

    expect(container.querySelector('.sidebar-convocatorias-section')).toBeNull();
  });

  it('renders button for DOCENTE_INVESTIGADOR role', () => {
    renderWithProviders(<ConvocatoriasSidebar />, {
      authValue: {
        user: { id: 2, roleCode: 'DOCENTE_INVESTIGADOR', firstNames: 'C', lastNames: 'D', email: 'c@d.com' },
        roles: ['DOCENTE_INVESTIGADOR'],
        currentRole: 'DOCENTE_INVESTIGADOR',
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

    // Should render the button
    const btn = screen.getByRole('button');
    expect(btn).toBeDefined();
  });

  it('opens modal and loads convocatorias on button click', async () => {
    renderWithProviders(<ConvocatoriasSidebar />, {
      authValue: {
        user: { id: 2, roleCode: 'DOCENTE_INVESTIGADOR', firstNames: 'C', lastNames: 'D', email: 'c@d.com' },
        roles: ['DOCENTE_INVESTIGADOR'],
        currentRole: 'DOCENTE_INVESTIGADOR',
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

    const btn = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(btn);
    });

    expect(mockCallService.getVigent).toHaveBeenCalled();

    // Convocatoria title should appear
    expect(await screen.findByText('Convocatoria IA 2026')).toBeDefined();
  });

  it('shows empty state when no convocatorias', async () => {
    mockCallService.getVigent.mockResolvedValue([]);

    renderWithProviders(<ConvocatoriasSidebar />, {
      authValue: {
        user: { id: 2, roleCode: 'DOCENTE_INVESTIGADOR', firstNames: 'C', lastNames: 'D', email: 'c@d.com' },
        roles: ['DOCENTE_INVESTIGADOR'],
        currentRole: 'DOCENTE_INVESTIGADOR',
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

    const btn = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(btn);
    });

    // Wait for the modal to load
    await screen.findByRole('heading', { level: 2 });
    // Empty state shown
    expect(screen.queryByText('Convocatoria IA 2026')).toBeNull();
  });

  it('closes the modal when overlay is clicked', async () => {
    renderWithProviders(<ConvocatoriasSidebar />, {
      authValue: {
        user: { id: 2, roleCode: 'DOCENTE_INVESTIGADOR', firstNames: 'C', lastNames: 'D', email: 'c@d.com' },
        roles: ['DOCENTE_INVESTIGADOR'],
        currentRole: 'DOCENTE_INVESTIGADOR',
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

    const btn = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(btn);
    });

    // Wait for the overlay to appear
    const overlay = document.querySelector('.convocatorias-overlay') as HTMLElement;
    expect(overlay).toBeDefined();

    await act(async () => {
      fireEvent.click(overlay);
    });

    // Modal should be gone
    expect(document.querySelector('.convocatorias-modal')).toBeNull();
  });
});
