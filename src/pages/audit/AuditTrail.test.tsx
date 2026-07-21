import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';
import { AuditTrail } from './AuditTrail';
import { auditService } from '../../services/auditService';

const mockGetAuditLog = vi.hoisted(() => vi.fn());
const mockGetRecentActivity = vi.hoisted(() => vi.fn());
const mockGetTraceability = vi.hoisted(() => vi.fn());

vi.mock('../../services/auditService', () => ({
  auditService: {
    getAuditLog: mockGetAuditLog,
    getRecentActivity: mockGetRecentActivity,
    getTraceability: mockGetTraceability,
  },
}));

const authValue = {
  user: { id: 1 },
  currentRole: 'ADMIN',
  isAuthenticated: true,
  roles: ['ADMIN'],
  loading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  switchRole: vi.fn(),
  clearError: vi.fn(),
  completeRegistration: vi.fn(),
};

const renderPage = (entry = '/audit') =>
  render(
    <AuthContext.Provider value={authValue as any}>
      <ToastProvider>
        <MemoryRouter initialEntries={[entry]}>
          <AuditTrail />
        </MemoryRouter>
      </ToastProvider>
    </AuthContext.Provider>
  );

describe('AuditTrail', () => {
  beforeAll(() => {
    window.scrollTo = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuditLog.mockResolvedValue([]);
    mockGetRecentActivity.mockResolvedValue([]);
    mockGetTraceability.mockResolvedValue([]);
  });

  it('renders the page title', async () => {
    renderPage();
    expect(await screen.findByText(/Trazabilidad/i)).toBeDefined();
  });

  it('renders audit log entries returned by the service', async () => {
    mockGetAuditLog.mockResolvedValue([
      {
        id: 1,
        tablaAfectada: 'user',
        idRegistro: 3,
        accion: 'CREAR',
        idUsuario: 2,
        nombreUsuario: 'Usuario Uno',
        datosAnteriores: null,
        datosNuevos: '{"x":1}',
        ipOrigen: '127.0.0.1',
        fechaAccion: '2024-01-01T10:00:00',
      },
    ]);
    renderPage();

    expect(await screen.findByText('Creación')).toBeDefined();
    expect(screen.getByText('Usuario Uno')).toBeDefined();
  });

  it('loads traceability when a tramiteId is provided', async () => {
    mockGetTraceability.mockResolvedValue([
      {
        movementId: 1,
        procedureId: 5,
        procedureCode: 'TR-5',
        actionUserName: 'Ana Lopez',
        actionUserRole: 'ADMIN',
        action: 'APROBADO',
        previousStatus: 'PENDIENTE',
        newStatus: 'APROBADO',
        observation: null,
        movementDate: '2024-01-02T12:00:00',
        ipOrigen: '127.0.0.1',
      },
    ]);
    renderPage('/audit?tramiteId=5');

    expect(await screen.findByText('APROBADO')).toBeDefined();
    expect(mockGetTraceability).toHaveBeenCalledWith(5);
  });
});
