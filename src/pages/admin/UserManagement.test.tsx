import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { ConfirmProvider } from '../../context/ConfirmContext';
import { AuthContext } from '../../context/AuthContext';
import { UserManagement } from './UserManagement';
import { userService } from '../../services/userService';
import { researchService } from '../../services/researchService';

const mockGetAll = vi.hoisted(() => vi.fn());
const mockToggleStatus = vi.hoisted(() => vi.fn());
const mockGetGroups = vi.hoisted(() => vi.fn());

vi.mock('../../services/userService', () => ({
  userService: {
    getAll: mockGetAll,
    create: vi.fn(),
    update: vi.fn(),
    toggleStatus: mockToggleStatus,
    resetPassword: vi.fn(),
  },
}));

vi.mock('../../services/researchService', () => ({
  researchService: {
    getGroups: mockGetGroups,
    getGroupByUser: vi.fn(),
    getGroupLines: vi.fn(),
    addMember: vi.fn(),
    removeMember: vi.fn(),
  },
}));

const authValue = {
  user: { id: 1, firstNames: 'Admin', lastNames: 'Istrador' },
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

const renderPage = () =>
  render(
    <AuthContext.Provider value={authValue as any}>
      <ToastProvider>
        <ConfirmProvider>
          <MemoryRouter>
            <UserManagement />
          </MemoryRouter>
        </ConfirmProvider>
      </ToastProvider>
    </AuthContext.Provider>
  );

describe('UserManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAll.mockResolvedValue([]);
    mockGetGroups.mockResolvedValue([]);
  });

  it('renders the page title', async () => {
    renderPage();
    expect(await screen.findByText(/Gestion de Usuarios/i)).toBeDefined();
  });

  it('lists users returned by the service', async () => {
    mockGetAll.mockResolvedValue([
      {
        id: 2,
        dni: '12345678',
        firstNames: 'Juan',
        lastNames: 'Perez',
        institutionalEmail: 'juan@unas.edu.pe',
        roleCode: 'ESTUDIANTE',
        roleDescription: 'Estudiante',
        active: true,
      },
    ]);
    renderPage();
    expect(await screen.findByText('Juan Perez')).toBeDefined();
  });

  it('deactivates a user after confirming', async () => {
    mockGetAll.mockResolvedValue([
      {
        id: 2,
        dni: '12345678',
        firstNames: 'Juan',
        lastNames: 'Perez',
        institutionalEmail: 'juan@unas.edu.pe',
        roleCode: 'ESTUDIANTE',
        roleDescription: 'Estudiante',
        active: true,
      },
    ]);
    renderPage();

    await screen.findByText('Juan Perez');
    fireEvent.click(screen.getByTitle('Desactivar'));

    const cancel = await screen.findByText('Cancelar');
    const container = cancel.parentElement as HTMLElement;
    const confirmBtn = within(container).getAllByRole('button').find((b) => b !== cancel)!;
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(mockToggleStatus).toHaveBeenCalledWith(2, false));
  });

  it('shows an error message when the service fails', async () => {
    mockGetAll.mockRejectedValue(new Error('fallo'));
    renderPage();
    expect(await screen.findByText(/cargar la lista de usuarios/i)).toBeDefined();
  });
});
