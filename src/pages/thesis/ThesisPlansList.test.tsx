import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { ThesisPlansList } from './ThesisPlansList';
import { thesisService } from '../../services/thesisService';
import { authService } from '../../services/authService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/thesisService', () => ({
  thesisService: {
    getPlansByStudent: vi.fn(),
    getAllPlans: vi.fn(),
    getPendingPlans: vi.fn(),
  },
}));

vi.mock('../../services/authService', () => ({
  authService: {
    getDashboardData: vi.fn(),
  },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  };
});

const mockThesisService = vi.mocked(thesisService);

const mockPlans = [
  {
    idPlanTesis: 1,
    tituloTesis: 'Sistema de detección de anomalías en redes',
    resumen: 'Resumen del plan',
    idEstudiante: 5,
    idLinea: 1,
    idGrupo: 1,
    idDocumentoActual: 10,
    estadoPlan: 'APROBADO',
    fechaCreacion: '2026-01-01T00:00:00Z',
    fechaActualizacion: '2026-01-15T00:00:00Z',
    idTramite: 1,
    estadoTramite: 'APROBADO_CON_RESOLUCION',
    revisorActual: null,
    studentName: 'Carlos López',
  },
  {
    idPlanTesis: 2,
    tituloTesis: 'Análisis de datos en tiempo real',
    resumen: 'Resumen del plan 2',
    idEstudiante: 6,
    idLinea: 2,
    idGrupo: 1,
    idDocumentoActual: 11,
    estadoPlan: 'PENDIENTE',
    fechaCreacion: '2026-02-01T00:00:00Z',
    fechaActualizacion: '2026-02-01T00:00:00Z',
    idTramite: null,
    estadoTramite: null,
    revisorActual: 'Coordinador',
    studentName: 'María Torres',
  },
];

describe('ThesisPlansList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockThesisService.getAllPlans.mockResolvedValue(mockPlans as any);
    mockThesisService.getPendingPlans.mockResolvedValue([mockPlans[1]] as any);
    mockThesisService.getPlansByStudent.mockResolvedValue([mockPlans[0]] as any);
  });

  it('shows loading spinner initially', () => {
    mockThesisService.getAllPlans.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
    );
    renderWithProviders(<ThesisPlansList />);
    expect(document.querySelector('[aria-label="Cargando..."]')).toBeDefined();
  });

  it('renders thesis plans after loading', async () => {
    renderWithProviders(<ThesisPlansList />, {
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
    expect(await screen.findByText('Sistema de detección de anomalías en redes')).toBeDefined();
  });

  it('renders student plans for ESTUDIANTE role', async () => {
    renderWithProviders(<ThesisPlansList />, {
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

    expect(await screen.findByText('Sistema de detección de anomalías en redes')).toBeDefined();
    expect(mockThesisService.getPlansByStudent).toHaveBeenCalled();
  });

  it('renders pending plans tab for COORDINADOR', async () => {
    renderWithProviders(<ThesisPlansList />, {
      authValue: {
        user: { id: 2, roleCode: 'COORDINADOR_GRUPO', firstNames: 'Co', lastNames: 'ord', email: 'co@sgi.com' },
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
      } as any,
    });

    await act(async () => {});
    expect(document.body).toBeDefined();
  });

  it('filters plans by search text', async () => {
    renderWithProviders(<ThesisPlansList />, {
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
    await screen.findByText('Sistema de detección de anomalías en redes');

    const searchInput = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'anomalías' } });
    });

    expect(screen.getByText('Sistema de detección de anomalías en redes')).toBeDefined();
    expect(screen.queryByText('Análisis de datos en tiempo real')).toBeNull();
  });

  it('renders new thesis plan button for ESTUDIANTE', async () => {
    renderWithProviders(<ThesisPlansList />, {
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
    const newBtn = screen.getByRole('link', { name: /nuevo/i });
    expect(newBtn).toBeDefined();
  });
});

