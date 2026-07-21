import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { DashboardContainer } from './DashboardContainer';
import RoleDashboards from './RoleDashboards';
import i18n from '../../i18n';

vi.mock('../../services/authService', () => ({
  authService: { getDashboardData: vi.fn() },
}));

const mockAuth = vi.mocked(authService);

const adminData = {
  totalUsers: 10,
  totalActiveUsers: 8,
  totalGroups: 5,
  totalActiveGroups: 4,
  totalProjects: 6,
  activeProjects: 3,
  pendingProcedures: 1,
  proceduresUnderReview: 2,
  approvedProcedures: 3,
  rejectedProcedures: 0,
  alerts: [],
};

function authWith(role: string | null) {
  return { currentRole: role } as any;
}

describe('DashboardContainer', () => {
  it('renderiza sidebar, footer y children', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={authWith('ADMIN')}>
          <ToastProvider>
            <DashboardContainer>
              <div>CONTENIDO</div>
            </DashboardContainer>
          </ToastProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    );
    expect(screen.getByText('CONTENIDO')).toBeInTheDocument();
    expect(screen.getByText(i18n.t('dashboard:dashboardContainer.footer'))).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('abre el menu movil', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={authWith('ADMIN')}>
          <ToastProvider>
            <DashboardContainer>
              <div>CONTENIDO</div>
            </DashboardContainer>
          </ToastProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    );
    const toggle = screen.getByRole('button', { name: i18n.t('dashboard:dashboardContainer.openMenu') });
    fireEvent.click(toggle);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});

describe('RoleDashboards', () => {
  beforeEach(() => vi.resetAllMocks());

  it('renderiza el dashboard de ADMIN con datos', async () => {
    mockAuth.getDashboardData.mockResolvedValue(adminData as any);
    render(
      <MemoryRouter>
        <AuthContext.Provider value={authWith('ADMIN')}>
          <RoleDashboards />
        </AuthContext.Provider>
      </MemoryRouter>
    );
    expect(await screen.findByText(i18n.t('dashboard:admin.title'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('dashboard:admin.metrics.registeredUsers'))).toBeInTheDocument();
  });

  it('muestra mensaje para rol no soportado', async () => {
    mockAuth.getDashboardData.mockResolvedValue({} as any);
    render(
      <MemoryRouter>
        <AuthContext.Provider value={authWith(null)}>
          <RoleDashboards />
        </AuthContext.Provider>
      </MemoryRouter>
    );
    expect(await screen.findByText(i18n.t('dashboard:unsupportedRole.title'))).toBeInTheDocument();
  });

  it('muestra error si falla la carga', async () => {
    mockAuth.getDashboardData.mockRejectedValue(new Error('Sin permisos'));
    render(
      <MemoryRouter>
        <AuthContext.Provider value={authWith('ADMIN')}>
          <RoleDashboards />
        </AuthContext.Provider>
      </MemoryRouter>
    );
    expect(await screen.findByText(/Sin permisos/)).toBeInTheDocument();
  });
});
