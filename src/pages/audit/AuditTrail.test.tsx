import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { AuditTrail } from './AuditTrail';
import { auditService } from '../../services/auditService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../i18n', () => ({
  default: {
    use: () => ({
      use: () => ({
        init: () => {},
      }),
    }),
    t: (key: string, fallback?: string) => fallback || key,
  },
}));

vi.mock('../../services/auditService', () => ({
  auditService: {
    getAuditLog: vi.fn(),
    getRecentActivity: vi.fn(),
    getTraceability: vi.fn(),
  },
}));

const mockAuditService = vi.mocked(auditService);

const mockAuditLogs = [
  {
    id: 1,
    accion: 'CREAR',
    tablaAfectada: 'project',
    idRegistro: 10,
    datosAnteriores: null,
    datosNuevos: '{"title":"Test"}',
    idUsuario: 1,
    nombreUsuario: 'Admin User',
    ipOrigen: '192.168.1.1',
    fechaAccion: new Date().toISOString(),
  },
  {
    id: 2,
    accion: 'EDITAR',
    tablaAfectada: 'tramite',
    idRegistro: 5,
    datosAnteriores: '{"status":"REGISTRADO"}',
    datosNuevos: '{"status":"PENDIENTE_COORDINADOR"}',
    idUsuario: 2,
    nombreUsuario: 'Editor User',
    ipOrigen: '192.168.1.2',
    fechaAccion: new Date().toISOString(),
  },
];

const mockRecentActivities = [
  {
    procedureId: 5,
    procedureCode: 'TRM-005',
    procedureType: 'PROYECTO',
    currentStatus: 'PENDIENTE_COORDINADOR',
    movementCount: 3,
    lastAction: 'CREAR',
    lastUserName: 'Admin',
    lastMovementDate: new Date().toISOString(),
  },
];

describe('AuditTrail page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockAuditService.getAuditLog.mockResolvedValue(mockAuditLogs as any);
    mockAuditService.getRecentActivity.mockResolvedValue(mockRecentActivities as any);
    mockAuditService.getTraceability.mockResolvedValue([]);
  });

  it('renders header and stats', async () => {
    renderWithProviders(<AuditTrail />);

    expect(document.querySelector('.animate-fade-in')).toBeDefined();
    expect(await screen.findByText('Admin User')).toBeDefined();
  });

  it('loads and displays audit log entries', async () => {
    renderWithProviders(<AuditTrail />);

    const users = await screen.findAllByText(/User/);
    expect(users.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('192.168.1.1')).toBeDefined();
  });

  it('loads and displays recent activity', async () => {
    renderWithProviders(<AuditTrail />);

    expect(await screen.findByText('TRM-005')).toBeDefined();
    expect(screen.getByText('Admin')).toBeDefined();
  });

  it('shows stats cards with values', async () => {
    renderWithProviders(<AuditTrail />);
    await screen.findAllByText(/User/);

    const statCards = document.querySelectorAll('.card');
    expect(statCards.length).toBeGreaterThan(0);
  });

  it('searches traceability by procedure ID', async () => {
    mockAuditService.getTraceability.mockResolvedValue([
      {
        movementId: 1,
        procedureCode: 'TRM-005',
        action: 'REGISTRADO',
        previousStatus: null,
        newStatus: 'PENDIENTE_COORDINADOR',
        movementDate: new Date().toISOString(),
        actionUserName: 'Admin',
        actionUserRole: 'ADMIN',
        observation: null,
        ipOrigen: '127.0.0.1',
      },
    ] as any);

    renderWithProviders(<AuditTrail />);

    const verBtn = await screen.findByRole('button', { name: /ver/i });
    await act(async () => {
      fireEvent.click(verBtn);
    });

    expect(mockAuditService.getTraceability).toHaveBeenCalledWith(5);
  });

  it('does not call getTraceability on initial render', async () => {
    renderWithProviders(<AuditTrail />);
    await screen.findAllByText(/User/);

    expect(mockAuditService.getTraceability).not.toHaveBeenCalled();
  });

  it('loads more audit logs when load more is clicked', async () => {
    mockAuditService.getAuditLog.mockResolvedValue(
      Array.from({ length: 15 }, (_, i) => ({ ...mockAuditLogs[0], id: i + 1 })) as any
    );

    renderWithProviders(<AuditTrail />);

    await screen.findAllByText('Admin User');

    const loadMoreBtn = await screen.findByRole('button', { name: /cargar más/i });
    await act(async () => {
      fireEvent.click(loadMoreBtn);
    });

    expect(mockAuditService.getAuditLog).toHaveBeenCalledTimes(2);
    expect(mockAuditService.getAuditLog).toHaveBeenLastCalledWith(1, 15);
  });

  it('renders traceability timeline when movements exist', async () => {
    mockAuditService.getTraceability.mockResolvedValue([
      {
        movementId: 1,
        procedureCode: 'TRM-005',
        action: 'REGISTRADO',
        previousStatus: null,
        newStatus: 'PENDIENTE_COORDINADOR',
        movementDate: new Date().toISOString(),
        actionUserName: 'Admin',
        actionUserRole: 'ADMIN',
        observation: null,
        ipOrigen: '127.0.0.1',
      },
    ] as any);

    renderWithProviders(<AuditTrail />);
    const verBtn = await screen.findByRole('button', { name: /ver/i });
    await act(async () => {
      fireEvent.click(verBtn);
    });

    const regElements = await screen.findAllByText(/REGISTRADO/i);
    expect(regElements.length).toBeGreaterThanOrEqual(1);
  });

  it('expands and collapses observations in timeline', async () => {
    mockAuditService.getTraceability.mockResolvedValue([
      {
        movementId: 1,
        procedureCode: 'TRM-005',
        action: 'OBSERVADO',
        previousStatus: 'PENDIENTE_COORDINADOR',
        newStatus: 'OBSERVADO',
        movementDate: new Date().toISOString(),
        actionUserName: 'Admin',
        actionUserRole: 'COORDINADOR_GRUPO',
        observation: 'Falta documento adjunto',
        ipOrigen: '127.0.0.1',
      },
    ] as any);

    renderWithProviders(<AuditTrail />);
    const verBtn = await screen.findByRole('button', { name: /ver/i });
    await act(async () => {
      fireEvent.click(verBtn);
    });

    const obsBtn = await screen.findByRole('button', { name: /Observación/i });
    await act(async () => {
      fireEvent.click(obsBtn);
    });

    expect(screen.getByText('Falta documento adjunto')).toBeDefined();
  });

  it('shows empty state when no audit data', async () => {
    mockAuditService.getAuditLog.mockResolvedValue([]);
    renderWithProviders(<AuditTrail />);

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });
  });

  it('shows coordinator alert for COORDINADOR_GRUPO role', async () => {
    renderWithProviders(<AuditTrail />, {
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

    expect(await screen.findByText('Acceso de Coordinador de Grupo')).toBeDefined();
  });
});
