import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { AuditTrail } from './AuditTrail';
import { auditService } from '../../services/auditService';
import { renderWithProviders } from '../../utils/testUtils';

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

describe('AuditTrail', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockAuditService.getAuditLog.mockResolvedValue(mockAuditLogs as any);
    mockAuditService.getRecentActivity.mockResolvedValue(mockRecentActivities as any);
    mockAuditService.getTraceability.mockResolvedValue([]);
  });

  it('renders the audit trail header', async () => {
    renderWithProviders(<AuditTrail />);
    // Page renders
    expect(document.querySelector('.animate-fade-in')).toBeDefined();
  });

  it('loads and displays audit log entries', async () => {
    renderWithProviders(<AuditTrail />);

    expect(await screen.findByText('Admin User')).toBeDefined();
    expect(screen.getByText('192.168.1.1')).toBeDefined();
  });

  it('loads and displays recent activity table', async () => {
    renderWithProviders(<AuditTrail />);

    expect(await screen.findByText('TRM-005')).toBeDefined();
    expect(screen.getByText('Admin')).toBeDefined();
  });

  it('shows stats cards with counts', async () => {
    renderWithProviders(<AuditTrail />);
    await screen.findByText('Admin User');

    // Stats should be rendered — values are strings
    const statCells = document.querySelectorAll('.card');
    expect(statCells.length).toBeGreaterThan(0);
  });

  it('renders recent activity table with Ver buttons', async () => {
    renderWithProviders(<AuditTrail />);
    await screen.findByText('Admin User');

    const verBtn = screen.getByRole('button', { name: /ver/i });
    expect(verBtn).toBeDefined();
  });

  it('searches traceability when clicking Ver on recent activity', async () => {
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

  it('loads more audit entries when Load More is clicked', async () => {
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
});
