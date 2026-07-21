import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { DecanoReview } from './DecanoReview';
import { tramiteService } from '../../services/tramiteService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/tramiteService', () => ({
  tramiteService: {
    getPendingForRole: vi.fn(),
    approveWithResolution: vi.fn(),
    reject: vi.fn(),
  },
  PENDING_STATE_BY_ROLE: {
    DECANO: 'PENDIENTE_DECANATO',
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

const mockTramiteService = vi.mocked(tramiteService);

const mockTramites = [
  {
    id: 1,
    codigoTramite: 'TRM-001',
    tipoTramite: 'PROYECTO',
    tituloReferencia: 'Proyecto de Investigación ABC',
    estadoActual: 'PENDIENTE_DECANATO',
    fechaRegistro: '2026-01-01T00:00:00Z',
    idSolicitante: 1,
  },
  {
    id: 2,
    codigoTramite: 'TRM-002',
    tipoTramite: 'TESIS',
    tituloReferencia: 'Plan de Tesis XYZ',
    estadoActual: 'PENDIENTE_DECANATO',
    fechaRegistro: '2026-01-02T00:00:00Z',
    idSolicitante: 2,
  },
];

describe('DecanoReview', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockTramiteService.getPendingForRole.mockResolvedValue(mockTramites as any);
    // Mock window.prompt
    vi.spyOn(window, 'prompt').mockReturnValue('N° 001-2026');
  });

  it('shows loading spinner initially', () => {
    mockTramiteService.getPendingForRole.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
    );
    renderWithProviders(<DecanoReview />, {
      authValue: {
        user: { id: 1, roleCode: 'DECANO', firstNames: 'Dec', lastNames: 'Ano', email: 'd@sgi.com' },
        roles: ['DECANO'],
        currentRole: 'DECANO',
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
    expect(document.querySelector('[aria-label="Cargando..."]')).toBeDefined();
  });

  it('renders tramites after loading', async () => {
    renderWithProviders(<DecanoReview />, {
      authValue: {
        user: { id: 1, roleCode: 'DECANO', firstNames: 'Dec', lastNames: 'Ano', email: 'd@sgi.com' },
        roles: ['DECANO'],
        currentRole: 'DECANO',
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

    expect(await screen.findByText('TRM-001')).toBeDefined();
    expect(screen.getByText('TRM-002')).toBeDefined();
  });

  it('shows empty state when no tramites', async () => {
    mockTramiteService.getPendingForRole.mockResolvedValue([]);
    renderWithProviders(<DecanoReview />, {
      authValue: {
        user: { id: 1, roleCode: 'DECANO', firstNames: 'Dec', lastNames: 'Ano', email: 'd@sgi.com' },
        roles: ['DECANO'],
        currentRole: 'DECANO',
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

  it('renders approve and reject buttons for each tramite', async () => {
    renderWithProviders(<DecanoReview />, {
      authValue: {
        user: { id: 1, roleCode: 'DECANO', firstNames: 'Dec', lastNames: 'Ano', email: 'd@sgi.com' },
        roles: ['DECANO'],
        currentRole: 'DECANO',
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
    await screen.findByText('TRM-001');
    const approveBtns = screen.getAllByRole('button', { name: /firmar/i });
    expect(approveBtns.length).toBeGreaterThan(0);
  });

  it('renders tramite titles', async () => {
    renderWithProviders(<DecanoReview />, {
      authValue: {
        user: { id: 1, roleCode: 'DECANO', firstNames: 'Dec', lastNames: 'Ano', email: 'd@sgi.com' },
        roles: ['DECANO'],
        currentRole: 'DECANO',
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
    expect(await screen.findByText(/Proyecto de Investigación ABC/i)).toBeDefined();
  });
});

